/**
 * 抓取 GitHub 公开仓库，生成 src/data/repos.json 供 /projects 页在构建时读取。
 *
 * 设计要点：
 * 1. 构建期零网络请求 —— 抓取结果落盘进仓库，Astro 只读本地 JSON
 * 2. 永不阻断构建 —— 任何失败都只告警并保留上一次的 repos.json，进程仍以 0 退出
 * 3. 在 GitHub Actions 中会自动带上 GITHUB_TOKEN（限额 1000 次/小时），本地可不带
 *
 * 用法：npm run fetch-repos
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const OUTPUT = path.join(ROOT, 'src', 'data', 'repos.json');

const USERNAME = process.env.GH_USERNAME ?? 'Zzkai666';
const TOKEN = process.env.GITHUB_TOKEN ?? '';
const PER_PAGE = 100;
const MAX_PAGES = 3;

/**
 * 这些仓库只作为站点载体，不进入项目列表。
 * 统一转小写后比较 —— GitHub 仓库名大小写不敏感，接口返回的大小写不一定与配置一致。
 */
const EXCLUDED = new Set([`${USERNAME}.github.io`.toLowerCase(), '.github']);

async function fetchPage(page) {
  const url = new URL(`https://api.github.com/users/${USERNAME}/repos`);
  url.searchParams.set('per_page', String(PER_PAGE));
  url.searchParams.set('page', String(page));
  url.searchParams.set('sort', 'pushed');
  url.searchParams.set('type', 'owner');

  const headers = {
    accept: 'application/vnd.github+json',
    'user-agent': 'hhkai-site-build',
    'x-github-api-version': '2022-11-28',
  };
  if (TOKEN) headers.authorization = `Bearer ${TOKEN}`;

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`GitHub API ${response.status} ${response.statusText}`);
  }
  return response.json();
}

function normalize(repo) {
  return {
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description ?? null,
    language: repo.language ?? null,
    stars: repo.stargazers_count ?? 0,
    forks: repo.forks_count ?? 0,
    topics: Array.isArray(repo.topics) ? repo.topics : [],
    url: repo.html_url,
    homepage: repo.homepage || null,
    archived: Boolean(repo.archived),
    pushedAt: repo.pushed_at ?? null,
  };
}

async function readExisting() {
  try {
    return JSON.parse(await readFile(OUTPUT, 'utf8'));
  } catch {
    return null;
  }
}

async function main() {
  let collected = [];

  try {
    for (let page = 1; page <= MAX_PAGES; page += 1) {
      const batch = await fetchPage(page);
      if (!Array.isArray(batch) || batch.length === 0) break;
      collected.push(...batch);
      if (batch.length < PER_PAGE) break;
    }
  } catch (error) {
    const previous = await readExisting();
    const count = previous?.repos?.length ?? 0;
    console.warn(
      `[fetch-repos] 抓取失败：${error.message}\n` +
        `[fetch-repos] 保留上一次的缓存（${count} 个仓库），本次构建继续。`
    );
    process.exit(0);
  }

  const repos = collected
    .filter((repo) => !repo.fork && !repo.archived && !EXCLUDED.has(String(repo.name).toLowerCase()))
    .map(normalize)
    .sort((a, b) => b.stars - a.stars || String(b.pushedAt).localeCompare(String(a.pushedAt)));

  const payload = {
    _comment: '由 scripts/fetch-repos.mjs 自动生成，请勿手工编辑。抓取失败时会保留上一次的内容。',
    fetchedAt: new Date().toISOString(),
    username: USERNAME,
    authenticated: Boolean(TOKEN),
    repos,
  };

  await mkdir(path.dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  console.log(`[fetch-repos] 已写入 ${repos.length} 个公开仓库到 src/data/repos.json`);
}

await main();
