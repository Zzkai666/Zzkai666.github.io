import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import type * as THREE from 'three';

/**
 * 首页 3D 场景本体。
 *
 * 本模块由 Hero3DLoader 动态 import，只在浏览器端执行，
 * 因此可以直接访问 window / WebGL，不需要 SSR 防护。
 * WebGL 可用性与「减弱动效」的判断都在 Hero3DLoader 里完成。
 */

/** 归一化鼠标坐标（-1 ~ 1），模块级共享 */
const pointer = { x: 0, y: 0 };

/** 跟随站点主题的强调色 */
function useAccent() {
  const [accent, setAccent] = useState('#9b8cff');

  useEffect(() => {
    const read = () => {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue('--accent')
        .trim();
      if (value) setAccent(value);
    };
    read();
    document.addEventListener('zzkai:themechange', read);
    return () => document.removeEventListener('zzkai:themechange', read);
  }, []);

  return accent;
}

/** 相机缓慢追随鼠标，形成视差 */
function CameraRig() {
  const { camera } = useThree();

  useFrame(() => {
    camera.position.x += (pointer.x * 1.1 - camera.position.x) * 0.04;
    camera.position.y += (pointer.y * 0.75 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/** 缓慢自转的线框结 */
function WireKnot({ color }: { color: string }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * 0.12;
    ref.current.rotation.y += delta * 0.18;
  });

  return (
    <mesh ref={ref}>
      <torusKnotGeometry args={[1.15, 0.3, 180, 32]} />
      <meshBasicMaterial color={color} wireframe transparent opacity={0.5} />
    </mesh>
  );
}

/** 球壳状粒子场 */
function ParticleField({ color, count = 900 }: { color: string; count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const array = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const radius = 3.4 + Math.random() * 3.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      array[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      array[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      array[i * 3 + 2] = radius * Math.cos(phi);
    }
    return array;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.025;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.08;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.022}
        color={color}
        transparent
        opacity={0.75}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/** 中心脉冲外壳 */
function CorePulse({ color }: { color: string }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 1.2) * 0.05);
  });

  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1.62, 1]} />
      <meshBasicMaterial color={color} wireframe transparent opacity={0.16} />
    </mesh>
  );
}

function Scene() {
  const accent = useAccent();

  return (
    <>
      <CameraRig />
      <CorePulse color={accent} />
      <WireKnot color={accent} />
      <ParticleField color={accent} />
    </>
  );
}

export default function Hero3D() {
  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 6.2], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ width: '100%', height: '100%' }}
    >
      <Scene />
    </Canvas>
  );
}
