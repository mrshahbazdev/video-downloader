const fs = require('fs');
const path = require('path');
const https = require('https');

const binDir = path.join(__dirname, '..', 'bin');
const binPath = path.join(binDir, 'yt-dlp');

if (process.env.YOUTUBE_DL_SKIP_DOWNLOAD === '1' || process.env.YOUTUBE_DL_SKIP_DOWNLOAD === 'true') {
  console.log('Skipping yt-dlp download (YOUTUBE_DL_SKIP_DOWNLOAD set)');
  process.exit(0);
}

if (process.env.YOUTUBE_DL_BINARY && fs.existsSync(process.env.YOUTUBE_DL_BINARY)) {
  console.log(`Using existing yt-dlp: ${process.env.YOUTUBE_DL_BINARY}`);
  process.exit(0);
}

if (fs.existsSync(binPath)) {
  console.log('yt-dlp already exists at', binPath);
  process.exit(0);
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Node.js' }, timeout: 30000 }, (res) => {
      let data = '';
      res.on('data', (d) => (data += d));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(new Error(`Failed to parse JSON from ${url}: ${err.message}`));
        }
      });
    }).on('error', reject).on('timeout', function () {
      this.destroy();
      reject(new Error(`Timeout fetching ${url}`));
    });
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { timeout: 120000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.unlink(dest, () => {});
        return downloadFile(new URL(res.headers.location, url).href, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        return reject(new Error(`Download failed with status ${res.statusCode} from ${url}`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          try {
            fs.chmodSync(dest, 0o755);
          } catch {}
          resolve();
        });
      });
    }).on('error', reject).on('timeout', function () {
      this.destroy();
      file.close();
      reject(new Error(`Timeout downloading ${url}`));
    });
  });
}

(async () => {
  try {
    fs.mkdirSync(binDir, { recursive: true });
    const release = await fetchJson('https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest');
    const asset = release.assets && release.assets.find((a) => a.name === 'yt-dlp');
    if (!asset || !asset.browser_download_url) {
      throw new Error('yt-dlp binary asset not found in latest release');
    }
    console.log(`Downloading yt-dlp ${release.tag_name}...`);
    await downloadFile(asset.browser_download_url, binPath);
    console.log('yt-dlp downloaded to', binPath);
  } catch (err) {
    console.error('Warning: could not download yt-dlp:', err.message);
    console.error('If you have a system yt-dlp, set YOUTUBE_DL_BINARY. Otherwise manually place yt-dlp at', binPath);
    process.exitCode = 0;
  }
})();
