import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

/**
 * 取全部笔记，按日期倒序。
 * 草稿（draft: true）在生产构建中被过滤，本地开发时可见，方便预览。
 */
export async function getSortedPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => {
    if (import.meta.env.PROD && data.draft) return false;
    return true;
  });

  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function postPath(post: Post): string {
  return `/blog/${post.id}/`;
}

export function formatDate(input: Date): string {
  const d = new Date(input);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** 中文按 350 字/分钟、英文按 220 词/分钟估算 */
export function readingTime(body: string | undefined): number {
  const text = body ?? '';
  const cjk = (text.match(/[\u4e00-\u9fa5]/g) ?? []).length;
  const words = (text.match(/[A-Za-z0-9_]+/g) ?? []).length;
  return Math.max(1, Math.round(cjk / 350 + words / 220));
}

export interface TermGroup {
  name: string;
  count: number;
}

/** 按某个字段（tags / categories）聚合，按出现次数倒序 */
export function groupByTerm(posts: Post[], field: 'tags' | 'categories'): TermGroup[] {
  const counter = new Map<string, number>();

  for (const post of posts) {
    for (const term of post.data[field]) {
      counter.set(term, (counter.get(term) ?? 0) + 1);
    }
  }

  return [...counter.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'));
}

/** 按年份分组，用于归档页 */
export function groupByYear(posts: Post[]): { year: number; posts: Post[] }[] {
  const buckets = new Map<number, Post[]>();

  for (const post of posts) {
    const year = post.data.date.getFullYear();
    const list = buckets.get(year) ?? [];
    list.push(post);
    buckets.set(year, list);
  }

  return [...buckets.entries()]
    .map(([year, list]) => ({ year, posts: list }))
    .sort((a, b) => b.year - a.year);
}

/**
 * 生成 URL 与文件系统都安全的标签 / 分类 slug。
 *
 * 关键约束：标签里可能含 `/`（例如 `C/C++`），而 Astro 会把 `/` 当作路径分隔符，
 * 使得 `[tag]` 路由匹配失败并抛出 `Missing parameter: tag`。
 * 因此必须把路径敏感字符替换掉；显示用的原始名称另行通过 props 传递，
 * URL 里只出现 slug。
 *
 * `+` 无需处理 —— 它在 URL 路径段中是合法字符。
 */
export function termSlug(name: string): string {
  return name
    .trim()
    .replace(/[/\\?#%]/g, '~')
    .replace(/\s+/g, '-');
}
