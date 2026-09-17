/**
 * 站点全局常量。
 * 站名 / 作者 / GitHub 用户名集中在这里，改一处全站生效。
 */

export const GITHUB_USERNAME = 'qi-shi-wo-men-hen-ke-xi';

export const SITE = {
  /** 站名 */
  title: 'zzkai',
  /** 首页副标题 */
  tagline: '技术笔记与一些好玩的东西',
  /** SEO 描述 */
  description: 'zzkai 的个人网站：编程学习笔记、项目展示，以及一些实验性的交互作品。',
  /** 作者署名（文章页与 RSS 使用） */
  author: 'zzkai',
  /** 默认语言 */
  lang: 'zh-CN',
  /** 站点根地址，需与 astro.config.mjs 的 site 保持一致 */
  url: 'https://qi-shi-wo-men-hen-ke-xi.github.io',
} as const;

export const GITHUB = {
  username: GITHUB_USERNAME,
  url: `https://github.com/${GITHUB_USERNAME}`,
  /** 抓取公开仓库用的 REST 端点 */
  reposApi: `https://api.github.com/users/${GITHUB_USERNAME}/repos`,
} as const;

/** 主导航 */
export const NAV_LINKS = [
  { href: '/', label: '首页' },
  { href: '/blog', label: '笔记' },
  { href: '/projects', label: '项目' },
  { href: '/playground', label: '好玩' },
  { href: '/about', label: '关于' },
] as const;

/** 每页文章数 */
export const POSTS_PER_PAGE = 10;
