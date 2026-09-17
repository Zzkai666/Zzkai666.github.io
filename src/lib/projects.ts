import rawRepos from '../data/repos.json';
import rawCurated from '../data/curated.json';
import { GITHUB_USERNAME } from '../consts';

export interface ProjectItem {
  title: string;
  description: string;
  url: string;
  homepage?: string | null;
  language?: string | null;
  stars?: number;
  tags: string[];
  source: 'github' | 'curated';
  pinned: boolean;
  updatedAt?: string | null;
}

interface RepoRecord {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  topics: string[];
  url: string;
  homepage: string | null;
  pushedAt: string | null;
}

interface CuratedRecord {
  title: string;
  description?: string;
  url: string;
  homepage?: string | null;
  language?: string | null;
  tags?: string[];
  pinned?: boolean;
}

/** 博客仓库自身作为站点载体，不在项目列表里重复展示 */
const SELF_REPO = `${GITHUB_USERNAME}.github.io`;

/**
 * 合并两个数据源：
 * - repos.json    来自 GitHub API 自动抓取
 * - curated.json  手动策展（用于展示非 GitHub 作品，或仓库为空时兜底）
 */
export function getProjects(): ProjectItem[] {
  const repos: ProjectItem[] = ((rawRepos as { repos?: RepoRecord[] }).repos ?? [])
    .filter((repo) => repo.name !== SELF_REPO)
    .map((repo) => ({
      title: repo.name,
      description: repo.description ?? '暂无描述',
      url: repo.url,
      homepage: repo.homepage,
      language: repo.language,
      stars: repo.stars,
      tags: repo.topics ?? [],
      source: 'github' as const,
      pinned: false,
      updatedAt: repo.pushedAt,
    }));

  const curated: ProjectItem[] = (rawCurated as CuratedRecord[]).map((item) => ({
    title: item.title,
    description: item.description ?? '',
    url: item.url,
    homepage: item.homepage ?? null,
    language: item.language ?? null,
    tags: item.tags ?? [],
    source: 'curated' as const,
    pinned: item.pinned ?? false,
  }));

  return [...curated, ...repos].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return (b.stars ?? 0) - (a.stars ?? 0);
  });
}

/** 上次成功抓取时间，用于在项目页标注数据新鲜度 */
export function getReposFetchedAt(): string | null {
  const value = (rawRepos as { fetchedAt?: string }).fetchedAt;
  return value ? value : null;
}
