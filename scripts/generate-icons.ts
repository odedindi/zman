import sharp from 'sharp';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f59e0b"/>
      <stop offset="100%" style="stop-color:#f97316"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="100" fill="url(#grad)"/>
  <text x="256" y="340" font-family="system-ui, sans-serif" font-size="280" 
        font-weight="700" fill="white" text-anchor="middle" dominant-baseline="central">ז</text>
</svg>
`;

async function generateIcons() {
  const outDir = join(process.cwd(), 'public', 'icons');
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const svgBuffer = Buffer.from(inputSvg.trim());

  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(join(outDir, `icon-${size}.png`));
    console.log(`Generated icon-${size}.png`);
  }

  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(join(outDir, 'apple-touch-icon.png'));
  
  console.log('All icons generated!');
}

generateIcons().catch(console.error);