# hhkai

个人网站：技术笔记 + 项目展示 + 3D / 动效实验。

基于 **Astro** 的静态站点，笔记是仓库里的 Markdown 文件，写完 `git push` 就自动发布到 GitHub Pages。

## 快速开始

```bash
npm install          # 安装依赖
npm run dev          # 本地开发，http://localhost:4321
npm run build        # 生产构建，输出到 dist/
npm run preview      # 本地预览构建结果
```

## 写一篇新笔记

在 `src/content/posts/` 下新建一个 `.md` 文件即可，文件名会成为 URL slug（建议用 ASCII）。

```markdown
---
title: "笔记标题"
date: 2026-09-16
tags: ["C++", "笔记"]
categories: ["编程笔记"]
summary: "一句话摘要，用于列表页、SEO 与 RSS。"
draft: false
---

正文用 Markdown 写。
```

字段说明：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | 是 | 标题 |
| `date` | 是 | 日期，`2026-09-16` 或 `2026/9/16` 都能解析 |
| `tags` | 否 | 标签数组 |
| `categories` | 否 | 分类数组 |
| `summary` | 否 | 摘要，用于列表页 / SEO / RSS |
| `draft` | 否 | `true` 时仅在本地开发可见，不会进入生产构建 |

schema 定义在 `src/content.config.ts`。

## 目录结构

```
src/
├─ pages/            路由：首页、/blog、/projects、/playground、/about、404、rss.xml
├─ layouts/          BaseLayout（全局布局 + 主题 + View Transitions）
├─ components/
│  ├─ three/         Hero3D —— 首页 3D 场景（client:only，不进 SSR）
│  ├─ Nav / Footer / ThemeToggle
│  └─ PostCard / ProjectCard / TagPill
├─ content/posts/    ★ 笔记正文（Markdown）
├─ data/
│  ├─ repos.json     GitHub 仓库缓存（自动生成，勿手改）
│  └─ curated.json   手动策展的项目（可用它补充非 GitHub 作品）
├─ lib/              posts.ts / projects.ts 工具函数
├─ styles/global.css Tailwind 入口 + 设计 token
└─ consts.ts         站名、作者、GitHub 用户名等全局常量
scripts/
├─ fetch-repos.mjs         抓取 GitHub 公开仓库
└─ migrate-from-hexo.mjs   从旧 Hexo 站迁移内容（一次性）
```

## GitHub 项目自动同步

`src/data/repos.json` 由 `scripts/fetch-repos.mjs` 生成：

```bash
npm run fetch-repos      # 本地手动跑；CI 里会自动跑
```

- 在 GitHub Actions 中使用内置 `GITHUB_TOKEN`（限额 1000 次/小时），不会触发限流
- **抓取失败不会中断构建** —— 脚本保留上一次的缓存并以 0 退出
- 构建期不发起任何网络请求，站点永远不会因为 GitHub API 挂掉而部署失败
- 想手动置顶项目或补充非 GitHub 作品，编辑 `src/data/curated.json`

## 部署

**前置条件：仓库必须命名为 `<用户名>.github.io`**（当前应为 `Zzkai666.github.io`）。

这是 GitHub 的硬性规则 —— 只有这个名字的仓库算「用户站点」，跑在 `https://<用户名>.github.io` 根路径。
如果叫别的名字（比如 `hhkaiBlog`），会被当成「项目站点」，推到 `https://<用户名>.github.io/<仓库名>/` 子路径下；
那时所有以 `/` 开头的内部链接与 `public/` 资源引用都会 404，必须额外配置 `base` 并改写全站链接。

推送到 `main` 分支即自动构建并发布（`.github/workflows/deploy.yml`）。

首次启用需在 GitHub 仓库里手动设置一次：

1. **Settings → Pages → Source** 改为 **GitHub Actions**
2. 确认 **Settings → Actions → General → Workflow permissions** 允许读写

### 换成自定义域名

1. 改 `astro.config.mjs` 里的 `SITE_URL`
2. 改 `src/consts.ts` 里的 `SITE.url`（保持一致）
3. 在 `public/` 下新建 `CNAME` 文件，内容为域名（防止每次部署被覆盖）
4. 在域名服务商处添加 CNAME 记录指向 `<用户名>.github.io`

## 技术栈

Astro 7 · React 19（仅用于 3D 岛）· Tailwind CSS 4 · Three.js / React Three Fiber · GSAP · Motion · Pagefind

## 相关

- 旧版 Hexo 站点保留在 `../zzkaiBlog`，仅作备份参考，不再维护
