/**
 * 生成站点社交分享图（og:image）。
 *
 * 用法：npm run og
 *
 * 设计取舍：
 * - 生成一张全站通用的 1200×630 卡片，而不是每篇文章一张 —— 后者需要引入
 *   canvaskit / satori 之类的重依赖，并额外准备中文字体文件，收益不成比例。
 * - 用 sharp 把 SVG 光栅化成 PNG（sharp 已随 Astro 图像优化安装）。
 * - 文字包含中文，渲染依赖系统字体；若环境中文字体缺失，可把中文改成英文。
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const OUTPUT_DIR = path.join(ROOT, 'public');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'og.png');

const WIDTH = 1200;
const HEIGHT = 630;

const BG = '#08080b';
const TEXT = '#ededf2';
const MUTED = '#9393a4';
const ACCENT = '#9b8cff';

const svg = `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="74%" cy="26%" r="62%">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.30"/>
      <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="${BG}"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>

  <!-- 右侧线框装饰，呼应首页 3D 场景 -->
  <circle cx="908" cy="196" r="132" fill="none" stroke="${ACCENT}" stroke-opacity="0.34" stroke-width="1.5"/>
  <circle cx="908" cy="196" r="186" fill="none" stroke="${ACCENT}" stroke-opacity="0.16" stroke-width="1.5"/>
  <circle cx="908" cy="196" r="240" fill="none" stroke="${ACCENT}" stroke-opacity="0.08" stroke-width="1.5"/>
  <circle cx="908" cy="196" r="5" fill="${ACCENT}"/>

  <!-- 左侧文字 -->
  <circle cx="96" cy="150" r="7" fill="${ACCENT}"/>
  <text x="118" y="157" font-family="Consolas, Menlo, monospace" font-size="20" fill="${ACCENT}" letter-spacing="3">PERSONAL SITE</text>

  <text x="92" y="284" font-family="Microsoft YaHei, Segoe UI, Helvetica, Arial, sans-serif" font-size="112" font-weight="600" fill="${TEXT}" letter-spacing="-2">zzkai</text>

  <text x="94" y="356" font-family="Microsoft YaHei, Segoe UI, Helvetica, Arial, sans-serif" font-size="34" fill="${MUTED}">技术笔记与一些好玩的东西</text>

  <rect x="94" y="410" width="72" height="3" fill="${ACCENT}"/>

  <text x="94" y="470" font-family="Microsoft YaHei, Segoe UI, Helvetica, Arial, sans-serif" font-size="24" fill="${MUTED}">笔记 · 项目 · 3D 实验</text>

  <text x="94" y="552" font-family="Consolas, Menlo, monospace" font-size="21" fill="${ACCENT}">qi-shi-wo-men-hen-ke-xi.github.io</text>
</svg>
`;

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const buffer = await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9 })
    .toBuffer();

  await writeFile(OUTPUT_FILE, buffer);

  const kb = (buffer.length / 1024).toFixed(1);
  console.log(`[og] 已生成 ${path.relative(ROOT, OUTPUT_FILE)}（${WIDTH}×${HEIGHT}，${kb} KB）`);
}

await main();
