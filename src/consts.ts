/**
 * 站点全局常量。
 * 站名 / 作者 / GitHub 用户名集中在这里，改一处全站生效。
 *
 * 关于命名：GitHub 账号是 `Zzkai666`（显示名 hhkai），站点品牌是 `hhkai`。
 * 两者不一致是有意的 —— 账号名不可随意更改，而站名是展示用的。
 */

/** GitHub 账号名（用于 API 请求与仓库链接，注意大小写与账号保持一致） */
export const GITHUB_USERNAME = 'Zzkai666';

export const SITE = {
  /** 站名 */
  title: 'hhkai',
  /** 首页副标题 */
  tagline: '技术笔记与一些好玩的东西',
  /** SEO 描述 */
  description: 'hhkai 的个人网站：编程学习笔记、项目展示，以及一些实验性的交互作品。',
  /** 作者署名（文章页与 RSS 使用） */
  author: 'hhkai',
  /** 默认语言 */
  lang: 'zh-CN',
  /**
   * 站点根地址，需与 astro.config.mjs 的 site 保持一致。
   * 用原始站点（仓库名为 <用户名>.github.io）时跑在域名根路径，不需要 base 配置。
   */
  url: 'https://zzkai666.github.io',
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
