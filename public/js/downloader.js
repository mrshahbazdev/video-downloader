(() => {
  const urlInput = document.getElementById('url');
  const infoBtn = document.getElementById('infoBtn');
  const infoBtnText = document.getElementById('infoBtnText');
  const downloadBtn = document.getElementById('downloadBtn');
  const downloadBtnText = document.getElementById('downloadBtnText');
  const downloadLink = document.getElementById('downloadLink');
  const messageEl = document.getElementById('message');
  const infoCard = document.getElementById('infoCard');
  const titleEl = document.getElementById('title');
  const thumbEl = document.getElementById('thumb');
  const metaEl = document.getElementById('meta');
  const formatSelect = document.getElementById('formatSelect');
  const cookiesInput = document.getElementById('cookies');
  const advancedToggle = document.getElementById('advancedToggle');
  const advancedOptions = document.getElementById('advancedOptions');

  if (advancedToggle && advancedOptions) {
    advancedToggle.addEventListener('click', () => {
      advancedOptions.classList.toggle('hidden');
    });
  }

  function setLoading(btn, textEl, text) {
    textEl.textContent = text;
    btn.disabled = true;
    btn.classList.add('opacity-75', 'cursor-wait');
  }

  function clearLoading(btn, textEl, text) {
    textEl.textContent = text;
    btn.disabled = false;
    btn.classList.remove('opacity-75', 'cursor-wait');
  }

  function showMessage(text, type = '') {
    messageEl.textContent = text;
    messageEl.className = `mt-4 text-left px-4 py-3 rounded-xl text-sm ${type === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : type === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`;
    messageEl.classList.remove('hidden');
  }

  function formatTime(s) {
    if (!s) return '';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  function formatBytes(b) {
    if (!b) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(b) / Math.log(1024));
    return `${(b / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }

  async function fetchInfo() {
    const url = urlInput.value.trim();
    if (!url) return showMessage('Please enter a video URL', 'error');

    setLoading(infoBtn, infoBtnText, 'Fetching...');
    infoCard.classList.add('hidden');
    downloadLink.classList.add('hidden');
    showMessage('');

    const cookies = cookiesInput ? cookiesInput.value.trim() : '';

    try {
      const res = await fetch('/api/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, cookies }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch info');

      titleEl.textContent = data.title || 'Untitled';
      thumbEl.src = data.thumbnail || '';
      metaEl.textContent = [
        data.uploader ? `By ${data.uploader}` : '',
        data.duration ? formatTime(data.duration) : '',
        `${data.formats?.length || 0} format(s) available`,
      ].filter(Boolean).join(' · ');

      formatSelect.innerHTML = '';
      const best = document.createElement('option');
      best.value = 'best';
      best.textContent = 'Best available';
      formatSelect.appendChild(best);

      (data.formats || []).forEach((f) => {
        const opt = document.createElement('option');
        opt.value = f.format_id;
        const size = f.filesize
          ? ` (${formatBytes(f.filesize)})`
          : f.filesize_approx
          ? ` (~${formatBytes(f.filesize_approx)})`
          : '';
        const label = [f.resolution, f.ext, f.vcodec, f.acodec ? `audio:${f.acodec}` : '']
          .filter(Boolean)
          .join(' | ');
        opt.textContent = `${label}${size}`;
        formatSelect.appendChild(opt);
      });

      infoCard.classList.remove('hidden');
      showMessage('');
    } catch (err) {
      showMessage(err.message, 'error');
    } finally {
      clearLoading(infoBtn, infoBtnText, 'Get Video');
    }
  }

  async function downloadVideo() {
    const formatId = formatSelect.value;
    setLoading(downloadBtn, downloadBtnText, 'Downloading...');
    downloadLink.classList.add('hidden');
    const cookies = cookiesInput ? cookiesInput.value.trim() : '';

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.value.trim(), formatId, cookies }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Download failed');

      downloadLink.href = data.downloadUrl;
      downloadLink.download = data.filename;
      downloadLink.textContent = `Open ${data.filename}`;
      downloadLink.classList.remove('hidden');
      showMessage('Download ready', 'success');
    } catch (err) {
      showMessage(err.message, 'error');
    } finally {
      clearLoading(downloadBtn, downloadBtnText, 'Download Now');
    }
  }

  infoBtn.addEventListener('click', fetchInfo);
  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') fetchInfo();
  });
  downloadBtn.addEventListener('click', downloadVideo);
})();
