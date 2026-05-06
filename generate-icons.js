const sharp = require('sharp');
const path = require('path');

const PINK = '#FF7EB3';
const DARK_PINK = '#E05585';
const WHITE = '#FFFFFF';

async function generateIcon(size, outputPath) {
  // Create a pink circle with a white paw print using SVG
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${PINK}"/>
          <stop offset="100%" style="stop-color:${DARK_PINK}"/>
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="url(#bg)"/>
      <!-- Paw print -->
      <g transform="translate(${size * 0.5}, ${size * 0.52})" fill="${WHITE}">
        <!-- Main pad -->
        <ellipse cx="0" cy="${size * 0.08}" rx="${size * 0.16}" ry="${size * 0.13}"/>
        <!-- Toe 1 -->
        <ellipse cx="${-size * 0.14}" cy="${-size * 0.1}" rx="${size * 0.07}" ry="${size * 0.09}" transform="rotate(-15, ${-size * 0.14}, ${-size * 0.1})"/>
        <!-- Toe 2 -->
        <ellipse cx="${-size * 0.05}" cy="${-size * 0.17}" rx="${size * 0.065}" ry="${size * 0.085}" transform="rotate(-5, ${-size * 0.05}, ${-size * 0.17})"/>
        <!-- Toe 3 -->
        <ellipse cx="${size * 0.06}" cy="${-size * 0.17}" rx="${size * 0.065}" ry="${size * 0.085}" transform="rotate(5, ${size * 0.06}, ${-size * 0.17})"/>
        <!-- Toe 4 -->
        <ellipse cx="${size * 0.15}" cy="${-size * 0.1}" rx="${size * 0.07}" ry="${size * 0.09}" transform="rotate(15, ${size * 0.15}, ${-size * 0.1})"/>
      </g>
      <!-- Heart in center of paw -->
      <g transform="translate(${size * 0.5}, ${size * 0.55}) scale(${size * 0.0012})" fill="${WHITE}" opacity="0.6">
        <path d="M0,-30 C-10,-50 -35,-50 -35,-30 C-35,-10 0,20 0,20 C0,20 35,-10 35,-30 C35,-50 10,-50 0,-30Z"/>
      </g>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(outputPath);
}

async function generateSplash(size, outputPath) {
  const svg = `
    <svg width="${size}" height="${size * 2}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size * 2}" fill="#FFF5F7"/>
      <!-- Paw print centered -->
      <g transform="translate(${size * 0.5}, ${size * 0.8})" fill="${PINK}" opacity="0.9">
        <!-- Main pad -->
        <ellipse cx="0" cy="${size * 0.08}" rx="${size * 0.16}" ry="${size * 0.13}"/>
        <!-- Toe 1 -->
        <ellipse cx="${-size * 0.14}" cy="${-size * 0.1}" rx="${size * 0.07}" ry="${size * 0.09}" transform="rotate(-15, ${-size * 0.14}, ${-size * 0.1})"/>
        <!-- Toe 2 -->
        <ellipse cx="${-size * 0.05}" cy="${-size * 0.17}" rx="${size * 0.065}" ry="${size * 0.085}" transform="rotate(-5, ${-size * 0.05}, ${-size * 0.17})"/>
        <!-- Toe 3 -->
        <ellipse cx="${size * 0.06}" cy="${-size * 0.17}" rx="${size * 0.065}" ry="${size * 0.085}" transform="rotate(5, ${size * 0.06}, ${-size * 0.17})"/>
        <!-- Toe 4 -->
        <ellipse cx="${size * 0.15}" cy="${-size * 0.1}" rx="${size * 0.07}" ry="${size * 0.09}" transform="rotate(15, ${size * 0.15}, ${-size * 0.1})"/>
      </g>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .resize(size, size * 2)
    .png()
    .toFile(outputPath);
}

async function main() {
  const dir = path.join(__dirname, 'assets', 'images');

  console.log('Generating icons...');
  await generateIcon(1024, path.join(dir, 'icon.png'));
  await generateIcon(432, path.join(dir, 'android-icon-foreground.png'));
  await generateIcon(432, path.join(dir, 'android-icon-background.png'));
  await generateIcon(432, path.join(dir, 'android-icon-monochrome.png'));
  await generateIcon(48, path.join(dir, 'favicon.png'));

  console.log('Generating splash...');
  await generateSplash(512, path.join(dir, 'splash-icon.png'));

  console.log('Done!');
}

main().catch(console.error);
