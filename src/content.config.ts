import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * 笔记集合。
 * 兼容从 Hexo 迁移过来的 front-matter：
 * - `date: 2024/7/20`（斜杠格式）用 z.coerce.date() 解析
 * - tags / categories 在旧文章里可能缺失，给默认空数组
 */
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    categories: z.array(z.string()).default([]),
    summary: z.string().optional(),
    cover: z.string().optional(),
    /** 草稿不进入列表与 RSS */
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
