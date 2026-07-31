require('dotenv').config();
const express = require('express');
const cors = require('cors');
const youtubedl = require('youtube-dl-exec');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DOWNLOADS_DIR = path.join(__dirname, 'downloads');

if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/downloads', express.static(DOWNLOADS_DIR));

function getReferer(url) {
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/info', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const info = await youtubedl(url, {
      dumpJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      addHeader: [
        `referer:${getReferer(url)}`,
        'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      ],
    });

    const formats = (info.formats || []).map((f) => ({
      format_id: f.format_id,
      ext: f.ext,
      resolution: f.resolution,
      quality: f.quality,
      filesize: f.filesize,
      filesize_approx: f.filesize_approx,
      vcodec: f.vcodec,
      acodec: f.acodec,
      abr: f.abr,
      vbr: f.vbr,
      fps: f.fps,
    }));

    res.json({
      id: info.id,
      title: info.title,
      description: info.description,
      duration: info.duration,
      thumbnail: info.thumbnail,
      webpage_url: info.webpage_url,
      uploader: info.uploader,
      formats,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to fetch video info' });
  }
});

app.post('/api/download', async (req, res) => {
  const { url, formatId } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  const id = randomUUID();
  const output = path.join(DOWNLOADS_DIR, `${id}_%(title)s.%(ext)s`);

  try {
    await youtubedl(url, {
      output,
      format: formatId || 'best',
      noCheckCertificates: true,
      noWarnings: true,
      addHeader: [
        `referer:${getReferer(url)}`,
        'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      ],
    });

    const files = fs.readdirSync(DOWNLOADS_DIR).filter((f) => f.startsWith(`${id}_`));
    if (!files.length) throw new Error('Download completed but file not found');

    const file = files[0];
    const sanitized = file.replace(/^[^_]+_/, '');
    fs.renameSync(path.join(DOWNLOADS_DIR, file), path.join(DOWNLOADS_DIR, sanitized));

    res.json({
      success: true,
      filename: sanitized,
      downloadUrl: `/downloads/${encodeURIComponent(sanitized)}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Download failed' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Video downloader server running at http://localhost:${PORT}`);
});
