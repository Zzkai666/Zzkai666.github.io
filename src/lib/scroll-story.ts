import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * 首页滚动叙事（GSAP + ScrollTrigger）。
 *
 * 设计约束：
 * - 用户开启「减弱动效」时整体跳过，不做任何动画
 * - 只做 transform / opacity，不触发 layout
 * - 每次 View Transitions 切页前 revert，避免 ScrollTrigger 实例泄漏
 */

let context: gsap.Context | null = null;

/** 通过 data 属性约定动画角色，避免用类名选择器与样式耦合 */
const SELECTORS = {
  hero: '[data-story="hero"]',
  section: '[data-story="section"]',
  item: '[data-story-item]',
  playground: '[data-story="playground"]',
} as const;

export function destroyScrollStory() {
  context?.revert();
  context = null;
}

export function initScrollStory() {
  if (typeof window === 'undefined') return;

  destroyScrollStory();

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const root = document.querySelector<HTMLElement>('[data-scroll-story]');
  if (!root) return;

  gsap.registerPlugin(ScrollTrigger);

  context = gsap.context(() => {
    // 1. Hero 文字：向上视差并在滚出时淡出
    const hero = root.querySelector<HTMLElement>(SELECTORS.hero);
    if (hero) {
      gsap.to(hero, {
        yPercent: -14,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom 25%',
          scrub: 0.5,
        },
      });
    }

    // 2. 各区块：进入视口时子元素依次上浮
    for (const section of root.querySelectorAll<HTMLElement>(SELECTORS.section)) {
      const items = section.querySelectorAll<HTMLElement>(SELECTORS.item);
      const targets = items.length > 0 ? items : [section];

      gsap.from(targets, {
        y: 26,
        opacity: 0,
        duration: 0.65,
        ease: 'power2.out',
        stagger: 0.07,
        scrollTrigger: {
          trigger: section,
          start: 'top 88%',
          once: true,
        },
      });
    }

    // 3. 结尾 CTA：滚动到位时轻微放大归位
    const playground = root.querySelector<HTMLElement>(SELECTORS.playground);
    if (playground) {
      gsap.fromTo(
        playground,
        { scale: 0.95, opacity: 0.6 },
        {
          scale: 1,
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: playground,
            start: 'top bottom',
            end: 'top 60%',
            scrub: 0.4,
          },
        }
      );
    }

    // 内容异步加载完成后重新计算触发位置
    ScrollTrigger.refresh();
  }, root);
}

if (typeof document !== 'undefined') {
  document.addEventListener('astro:before-swap', destroyScrollStory);
}
