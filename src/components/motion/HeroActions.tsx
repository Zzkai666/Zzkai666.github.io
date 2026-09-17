import { useRef, type MouseEvent, type ReactNode } from 'react';
import { motion, useReducedMotion, useSpring } from 'motion/react';
import { GITHUB } from '../../consts';

/**
 * 首页 Hero 的行动按钮（React 岛，Motion 微交互）。
 *
 * 只在 hover / tap 上做动效，不做入场动画 —— 这样服务端渲染出来的初始状态就是
 * 完全可见的，即使 JS 加载失败，按钮依然可点、可见，不影响可用性与 SEO。
 */

interface MagneticLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  external?: boolean;
  /** 磁吸跟手强度，0 表示关闭 */
  strength?: number;
}

function MagneticLink({
  href,
  children,
  className = '',
  external = false,
  strength = 0.2,
}: MagneticLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduceMotion = useReducedMotion();

  const x = useSpring(0, { stiffness: 320, damping: 22, mass: 0.4 });
  const y = useSpring(0, { stiffness: 320, damping: 22, mass: 0.4 });

  const handleMove = (event: MouseEvent<HTMLAnchorElement>) => {
    if (reduceMotion) return;
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * strength);
    y.set((event.clientY - rect.top - rect.height / 2) * strength * 1.3);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={className}
      style={{ x, y }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileHover={reduceMotion ? undefined : { scale: 1.035 }}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 26 }}
    >
      {children}
    </motion.a>
  );
}

export default function HeroActions() {
  return (
    <div className="mt-9 flex flex-wrap items-center gap-3">
      <MagneticLink
        href="/blog"
        className="inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white"
      >
        看笔记
      </MagneticLink>

      <MagneticLink
        href="/playground"
        strength={0.16}
        className="inline-block rounded-lg border border-line px-5 py-2.5 text-sm font-medium"
      >
        玩点别的
      </MagneticLink>

      <MagneticLink
        href={GITHUB.url}
        external
        strength={0.24}
        className="inline-block rounded-lg px-3 py-2.5 font-mono text-sm text-muted"
      >
        GitHub ↗
      </MagneticLink>
    </div>
  );
}
