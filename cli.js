const youtubedl = require('youtube-dl-exec');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const url = process.argv[2];
const formatId = process.argv[3] || 'best';

if (!url) {
  console.error('Usage: node cli.js <URL> [formatId]');
  process.exit(1);
}

const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

const id = randomUUID();
const output = path.join(downloadsDir, `${id}_%(title)s.%(ext)s`);

async function run() {
  try {
    const info = await youtubedl(url, {
      dumpJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
    });
    console.log(`Title: ${info.title}`);
    console.log(`Duration: ${info.duration || 'unknown'}s`);
    console.log(`Uploader: ${info.uploader || 'unknown'}`);
    console.log(`Selected format: ${formatId}`);
    console.log('Downloading...');

    await youtubedl(url, {
      output,
      format: formatId,
      noCheckCertificates: true,
      noWarnings: true,
    });

    const files = fs.readdirSync(downloadsDir).filter((f) => f.startsWith(`${id}_`));
    if (!files.length) throw new Error('Download completed but file not found');

    const file = files[0];
    const sanitized = file.replace(/^[^_]+_/, '');
    fs.renameSync(path.join(downloadsDir, file), path.join(downloadsDir, sanitized));

    console.log(`Saved to: ${path.join(downloadsDir, sanitized)}`);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

run();
