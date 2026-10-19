import JSZip from 'jszip';
import { FIREFOX_EXTENSION_FILES } from '../extension-files';

// Generate the official icon for Firefox WebExtension: Runes on the left -> Arrow -> Translated text on the right
function generateExtensionIconDataUrl(size = 96): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const scale = size / 96;

  // 1. Background gradient (dark mystical navy / indigo)
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#041217');
  grad.addColorStop(0.5, '#08232c');
  grad.addColorStop(1, '#020b0e');

  ctx.fillStyle = grad;
  ctx.beginPath();
  const radius = 20 * scale;
  ctx.roundRect(2 * scale, 2 * scale, size - 4 * scale, size - 4 * scale, radius);
  ctx.fill();

  // 2. Glowing border in harmonious turquoise
  const borderGrad = ctx.createLinearGradient(0, 0, size, size);
  borderGrad.addColorStop(0, '#2dd4bf');
  borderGrad.addColorStop(0.5, '#06b6d4');
  borderGrad.addColorStop(1, '#14b8a6');

  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = 3 * scale;
  ctx.stroke();

  // 3. Left Side: Mystical Runes (Ancient script in turquoise glow)
  ctx.save();
  ctx.shadowColor = '#2dd4bf';
  ctx.shadowBlur = 8 * scale;
  ctx.strokeStyle = '#2dd4bf';
  ctx.lineWidth = 3.5 * scale;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Rune Vertical Stem (Elder Futhark Raido / Mystic Rune)
  ctx.beginPath();
  ctx.moveTo(25 * scale, 24 * scale);
  ctx.lineTo(25 * scale, 72 * scale);
  // Upper loop
  ctx.moveTo(25 * scale, 26 * scale);
  ctx.lineTo(37 * scale, 37 * scale);
  ctx.lineTo(25 * scale, 48 * scale);
  // Lower leg
  ctx.moveTo(25 * scale, 48 * scale);
  ctx.lineTo(38 * scale, 68 * scale);
  // Accent branches (Fehu/energy)
  ctx.moveTo(17 * scale, 38 * scale);
  ctx.lineTo(25 * scale, 32 * scale);
  ctx.moveTo(17 * scale, 56 * scale);
  ctx.lineTo(25 * scale, 50 * scale);
  ctx.stroke();
  ctx.restore();

  // Rune spark particles
  ctx.fillStyle = '#2dd4bf';
  ctx.beginPath();
  ctx.arc(33 * scale, 31 * scale, 2 * scale, 0, Math.PI * 2);
  ctx.arc(35 * scale, 62 * scale, 1.8 * scale, 0, Math.PI * 2);
  ctx.fill();

  // 4. Center: Glowing Dynamic Translation Arrow & Energy Beam
  ctx.save();
  ctx.shadowColor = '#2dd4bf';
  ctx.shadowBlur = 6 * scale;
  const arrowGrad = ctx.createLinearGradient(38 * scale, 48 * scale, 58 * scale, 48 * scale);
  arrowGrad.addColorStop(0, '#2dd4bf');
  arrowGrad.addColorStop(1, '#14b8a6');

  ctx.strokeStyle = arrowGrad;
  ctx.lineWidth = 4.2 * scale;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Beam
  ctx.beginPath();
  ctx.moveTo(40 * scale, 48 * scale);
  ctx.lineTo(54 * scale, 48 * scale);
  // Head
  ctx.lineTo(48 * scale, 42 * scale);
  ctx.moveTo(54 * scale, 48 * scale);
  ctx.lineTo(48 * scale, 54 * scale);
  ctx.stroke();

  // Central spark dot
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(46 * scale, 48 * scale, 2.2 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 5. Right Side: Translated Text (Modern Clean Alphabet 'A' & 'FR')
  ctx.save();
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 3.8 * scale;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Letter 'A'
  ctx.beginPath();
  ctx.moveTo(63 * scale, 70 * scale);
  ctx.lineTo(72 * scale, 26 * scale);
  ctx.lineTo(81 * scale, 70 * scale);
  ctx.stroke();

  // Crossbar in vibrant turquoise
  ctx.strokeStyle = '#2dd4bf';
  ctx.lineWidth = 3.4 * scale;
  ctx.beginPath();
  ctx.moveTo(66.5 * scale, 54 * scale);
  ctx.lineTo(77.5 * scale, 54 * scale);
  ctx.stroke();

  // Small 'FR' badge in deep turquoise
  if (size >= 48) {
    ctx.fillStyle = '#0f766e';
    ctx.beginPath();
    ctx.roundRect(62 * scale, 72 * scale, 22 * scale, 11 * scale, 3 * scale);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.floor(8 * scale)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('FR', 73 * scale, 77.5 * scale);
  }
  ctx.restore();

  return canvas.toDataURL('image/png').split(',')[1];
}

export async function createExtensionZip(devInfo?: { authorName?: string; email?: string }): Promise<Blob> {
  const zip = new JSZip();

  const authorName = devInfo?.authorName?.trim() || 'Auteur Webtoon';
  const authorEmail = devInfo?.email?.trim() || 'kasparof57@gmail.com';
  const authorFull = `${authorName} <${authorEmail}>`;

  // Add all code files
  FIREFOX_EXTENSION_FILES.forEach((file) => {
    if (file.path === 'manifest.json') {
      try {
        const manifestObj = JSON.parse(file.content);
        manifestObj.author = authorFull;
        manifestObj.developer = {
          name: authorName,
          url: `mailto:${authorEmail}`
        };
        zip.file(file.path, JSON.stringify(manifestObj, null, 2));
        return;
      } catch (e) {
        // fallback
      }
    }
    zip.file(file.path, file.content);
  });

  // Package.json for Mozilla AMO submission
  const packageJsonContent = {
    name: "manwha-translate-firefox-addon",
    version: "0.1.4",
    description: "Extension officielle Firefox pour la traduction instantanée in-situ de manwhas et webtoons",
    author: authorFull,
    developer: {
      name: authorName,
      email: authorEmail
    },
    homepage: "https://addons.mozilla.org",
    license: "MIT"
  };
  zip.file('package.json', JSON.stringify(packageJsonContent, null, 2));

  // Add icons in 4 official standard sizes (16, 48, 96, 128)
  const iconFolder = zip.folder('icons');
  if (iconFolder) {
    const icon16Base64 = generateExtensionIconDataUrl(16);
    const icon48Base64 = generateExtensionIconDataUrl(48);
    const icon96Base64 = generateExtensionIconDataUrl(96);
    const icon128Base64 = generateExtensionIconDataUrl(128);

    if (icon16Base64) iconFolder.file('icon-16.png', icon16Base64, { base64: true });
    if (icon48Base64) iconFolder.file('icon-48.png', icon48Base64, { base64: true });
    if (icon96Base64) iconFolder.file('icon-96.png', icon96Base64, { base64: true });
    if (icon128Base64) iconFolder.file('icon-128.png', icon128Base64, { base64: true });
  }

  return await zip.generateAsync({ type: 'blob' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
