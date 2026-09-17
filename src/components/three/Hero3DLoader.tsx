import { useEffect, useRef, useState, type ComponentType } from 'react';

type IdleCapableWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

/** 降级视觉：与 3D 场景观感一致的静态光晕，不依赖任何脚本 */
function StaticBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="h-full w-full"
      style={{
        backgroundImage: 'radial-gradient(circle at 68% 32%, var(--accent-soft), transparent 58%)',
      }}
    />
  );
}

/**
 * 3D 场景的懒加载外壳。
 *
 * three.js + R3F 的代码被单独切分，只有在
 *   ① 宿主元素进入视口，且 ② 浏览器空闲
 * 之后才真正下载并挂载。这样首屏的 JS 负担与 WebGL 上下文创建都不会和
 * LCP 抢资源。
 *
 * 无 WebGL 或用户要求减弱动效时，直接停留在静态降级视觉，不加载任何 3D 代码。
 */
export default function Hero3DLoader() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [Scene, setScene] = useState<ComponentType | null>(null);
  const [unsupported, setUnsupported] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setUnsupported(true);
      return;
    }

    try {
      const probe = document.createElement('canvas');
      const hasWebGL = Boolean(probe.getContext('webgl2') ?? probe.getContext('webgl'));
      if (!hasWebGL) {
        setUnsupported(true);
        return;
      }
    } catch {
      setUnsupported(true);
      return;
    }

    let cancelled = false;
    let idleHandle: number | undefined;
    let timerHandle: number | undefined;

    const load = () => {
      import('./Hero3D')
        .then((module) => {
          if (!cancelled) setScene(() => module.default);
        })
        .catch(() => {
          if (!cancelled) setUnsupported(true);
        });
    };

    const schedule = () => {
      const idleWindow = window as IdleCapableWindow;
      if (typeof idleWindow.requestIdleCallback === 'function') {
        idleHandle = idleWindow.requestIdleCallback(load, { timeout: 2000 });
      } else {
        timerHandle = window.setTimeout(load, 300);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          schedule();
        }
      },
      { rootMargin: '240px' }
    );
    observer.observe(host);

    return () => {
      cancelled = true;
      observer.disconnect();
      const idleWindow = window as IdleCapableWindow;
      if (idleHandle !== undefined) idleWindow.cancelIdleCallback?.(idleHandle);
      if (timerHandle !== undefined) window.clearTimeout(timerHandle);
    };
  }, []);

  return (
    <div ref={hostRef} className="h-full w-full">
      {Scene && !unsupported ? <Scene /> : <StaticBackdrop />}
    </div>
  );
}
