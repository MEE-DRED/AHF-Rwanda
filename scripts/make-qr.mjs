// Usage: npm run qr -- https://your-project.vercel.app
// Creates qr/ahf-student-qr.png (1200px, high error correction) for slides and print.
import QRCode from 'qrcode';
import { mkdirSync } from 'node:fs';

const url = process.argv[2];
if (!url || !/^https:\/\/[^\s]+$/.test(url)) {
  console.error('Please pass the public https URL of the STUDENT page, e.g.\n  npm run qr -- https://your-project.vercel.app');
  process.exit(1);
}
if (new URL(url).pathname.startsWith('/admin')) {
  console.error('That URL points at the admin area. The QR code must point to the student page.');
  process.exit(1);
}

mkdirSync('qr', { recursive: true });
await QRCode.toFile('qr/ahf-student-qr.png', url, {
  type: 'png',
  width: 1200,
  margin: 4,
  errorCorrectionLevel: 'H',
  color: { dark: '#000000', light: '#FFFFFF' },
});
console.log(`Saved qr/ahf-student-qr.png -> ${url}\nScan it with a phone and confirm the student form opens before printing.`);
