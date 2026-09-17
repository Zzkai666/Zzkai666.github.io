/**
 * 一次性迁移脚本：把 Hexo 旧站的笔记与图片搬到 Astro content collection。
 *
 * 用法：node scripts/migrate-from-hexo.mjs
 *
 * 安全约定：只读取 D:/blog/zzkaiBlog/source/_posts，绝不修改或删除旧站任何文件。
 * 旧站的 front-matter 问题（斜杠日期、time 字段误用、`--- ` 尾随空格）在此统一修正。
 */
import { mkdir, readFile, writeFile, copyFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const SRC = 'D:/blog/zzkaiBlog/source/_posts';
const OUT_POSTS = path.join(ROOT, 'src', 'content', 'posts');

/** 文章映射表：旧文件名 → 新 ASCII slug + 规范化后的元数据 */
const POSTS = [
  {
    from: 'C++小知识.md',
    to: 'cpp-tips.md',
    title: 'C++小知识',
    date: '2024-07-20',
    tags: ['C++'],
    categories: ['编程笔记'],
    summary: '头文件保护宏的两种等价写法：#ifndef / #define / #endif 与 #pragma once，以及 #include 的实质。',
  },
  {
    from: 'C++面向对象笔记.md',
    to: 'cpp-oop-notes.md',
    title: 'C++面向对象笔记',
    date: '2023-07-21',
    tags: ['C++', '面向对象'],
    categories: ['编程笔记'],
    summary: 'C++ 面向对象核心概念：内存四区模型（代码区、全局区、栈区、堆区）以及分区带来的生命周期意义。',
  },
  {
    from: '图形化编程学习笔记.md',
    to: 'easyx-graphics-notes.md',
    title: '图形化编程',
    date: '2024-01-25',
    tags: ['C/C++', 'EasyX'],
    categories: ['编程笔记'],
    summary: '用 EasyX 图形库做 C/C++ 图形化编程：窗口创建、颜色、文字绘制、图片加载与背景音乐播放的完整示例。',
  },
  {
    from: '数据结构笔记.md',
    to: 'data-structures-notes.md',
    title: '数据结构笔记',
    date: '2023-09-03',
    tags: ['数据结构'],
    categories: ['编程笔记'],
    summary: '数据结构基础概念梳理：数据、数据元素、数据项与数据对象的区别，以及逻辑结构与存储结构两个层次。',
  },
  {
    from: '操作系统原语操作底层原理（知乎回答）.md',
    to: 'os-primitive-zhihu.md',
    title: '操作系统原语操作底层原理（知乎回答）',
    date: '2024-11-05',
    tags: ['操作系统'],
    categories: ['链接收藏'],
    summary: '关于操作系统原语操作底层原理的一则知乎回答，附原问题链接。',
  },
  {
    from: 'java基础学习.md',
    to: 'java-basics.md',
    title: 'java基础学习',
    date: '2025-07-07',
    tags: ['Java'],
    categories: ['编程笔记'],
    summary: 'Java 基础学习笔记（正文待补充）。',
    // 旧文件只有 front-matter 没有正文，先标记为草稿，不进入列表与 RSS
    draft: true,
  },
];

/** 图片映射表：旧文件名 → 新路径（相对于项目根目录） */
const IMAGES = [
  { from: '个人头像.jpg', to: 'public/images/avatar.jpg' },
  { from: '网站图标.png', to: 'public/images/favicon.png' },
  // 这张 1.7MB 的图片没有任何文章引用，所以不放进 public/。
  // 放进去的话每次部署都要多传 1.7MB，且会进 Git 历史。
  { from: 'IMG_2249.JPG', to: 'local-media/img-2249.jpg' },
];

/** 剥掉旧 front-matter，兼容 `--- ` 尾随空格与 CRLF，并返回正文 */
function stripFrontMatter(raw) {
  const text = raw.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const match = text.match(/^---[ \t]*\n[\s\S]*?\n---[ \t]*\n?/);
  return match ? text.slice(match[0].length).trim() : text.trim();
}

/**
 * 旧文章用了 ``` C++ / ```C++ 这类非标准语言标记，Shiki 只认 cpp。
 * 统一规范化，否则构建时会一路 fallback 到 plaintext 并刷警告。
 */
function normalizeCodeFences(body) {
  return body.replace(/^```[ \t]*(?:c\+\+|c\/c\+\+)[ \t]*$/gim, '```cpp');
}

function quote(value) {
  return `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function buildFrontMatter(post) {
  const lines = ['---'];
  lines.push(`title: ${quote(post.title)}`);
  lines.push(`date: ${post.date}`);
  lines.push(`tags: [${post.tags.map(quote).join(', ')}]`);
  lines.push(`categories: [${post.categories.map(quote).join(', ')}]`);
  lines.push(`summary: ${quote(post.summary)}`);
  if (post.draft) lines.push('draft: true');
  lines.push('---', '');
  return lines.join('\n');
}

async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  await mkdir(OUT_POSTS, { recursive: true });

  console.log('— 迁移笔记 —');
  let postCount = 0;
  for (const post of POSTS) {
    const source = path.join(SRC, post.from);
    if (!(await exists(source))) {
      console.warn(`  跳过（源文件不存在）：${post.from}`);
      continue;
    }
    const body = normalizeCodeFences(stripFrontMatter(await readFile(source, 'utf8')));
    const output = buildFrontMatter(post) + body + '\n';
    await writeFile(path.join(OUT_POSTS, post.to), output, 'utf8');
    console.log(`  ${post.from}  ->  ${post.to}  (${body.length} 字符)`);
    postCount += 1;
  }

  console.log('— 迁移图片 —');
  let imageCount = 0;
  for (const image of IMAGES) {
    const source = path.join(SRC, image.from);
    if (!(await exists(source))) {
      console.warn(`  跳过（源文件不存在）：${image.from}`);
      continue;
    }
    const target = path.join(ROOT, image.to);
    await mkdir(path.dirname(target), { recursive: true });
    await copyFile(source, target);
    console.log(`  ${image.from}  ->  ${image.to}`);
    imageCount += 1;
  }

  console.log(`\n完成：${postCount} 篇笔记、${imageCount} 张图片。`);
  console.log('未迁移：hello-world.md（Hexo 默认欢迎页，建议废弃）');
}

await main();
