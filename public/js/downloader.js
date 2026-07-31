(() => {
  const urlInput = document.getElementById('url');
  const infoBtn = document.getElementById('infoBtn');
  const infoBtnText = document.getElementById('infoBtnText');
  const messageEl = document.getElementById('message');
  const infoCard = document.getElementById('infoCard');
  const titleEl = document.getElementById('title');
  const thumbEl = document.getElementById('thumb');
  const metaEl = document.getElementById('meta');
  const formatList = document.getElementById('formatList');
  const downloadResult = document.getElementById('downloadResult');
  const downloadLink = document.getElementById('downloadLink');
  const downloadFilename = document.getElementById('downloadFilename');
  const cookiesInput = document.getElementById('cookies');
  const poTokenInput = document.getElementById('poToken');
  const visitorDataInput = document.getElementById('visitorData');
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
    btn.classList.add('opacity-80', 'cursor-wait');
  }

  function clearLoading(btn, textEl, text) {
    textEl.textContent = text;
    btn.disabled = false;
    btn.classList.remove('opacity-80', 'cursor-wait');
  }

  function showMessage(text, type = '') {
    messageEl.textContent = text;
    messageEl.className = `mt-4 text-left px-4 py-3 rounded-xl text-sm font-medium ${type === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' : type === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`;
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
    const i = Math.min(Math.floor(Math.log(b) / Math.log(1024)), sizes.length - 1);
    return `${(b / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }

  function getAdvancedOptions() {
    return {
      cookies: cookiesInput ? cookiesInput.value.trim() : '',
      poToken: poTokenInput ? poTokenInput.value.trim() : '',
      visitorData: visitorDataInput ? visitorDataInput.value.trim() : '',
    };
  }

  function formatBadge(hasVideo, hasAudio) {
    if (hasVideo && hasAudio) return `<span class="badge badge-muxed">Video + Audio</span>`;
    if (hasVideo) return `<span class="badge badge-video">Video</span>`;
    return `<span class="badge badge-audio">Audio</span>`;
  }

  function formatLabel(f) {
    const hasVideo = f.vcodec && f.vcodec !== 'none';
    const hasAudio = f.acodec && f.acodec !== 'none';
    const parts = [];

    if (hasVideo) {
      parts.push(f.resolution && f.resolution !== 'audio only' ? f.resolution : 'video only');
    } else if (hasAudio) {
      parts.push('Audio');
    }

    if (f.ext) parts.push(f.ext.toUpperCase());
    if (hasVideo && f.vcodec) parts.push(f.vcodec);
    if (hasAudio && !hasVideo && f.abr) parts.push(`${Math.round(f.abr)} kbps`);

    return parts.join(' · ') || f.format_id;
  }

  function renderFormats(formats) {
    formatList.innerHTML = '';
    const usable = formats.filter((f) => f.ext !== 'mhtml' && !f.format_id.startsWith('sb'));
    if (!usable.length) {
      formatList.innerHTML = '<p class="text-sm text-slate-500">No individual formats found. Use the “Best available” option.</p>';
      return;
    }

    const best = document.createElement('button');
    best.className = 'format-card border-sky-500/50 dark:border-sky-400/50 ring-1 ring-sky-500/20';
    best.innerHTML = `
      <span class="font-bold text-sky-600 dark:text-sky-400">Best available</span>
      <span class="text-xs text-slate-500 dark:text-slate-400">Auto-pick highest quality</span>
      <span class="badge badge-muxed mt-1">Recommended</span>
    `;
    best.addEventListener('click', (e) => downloadVideo('best', e.currentTarget));
    formatList.appendChild(best);

    usable.forEach((f) => {
      const hasVideo = f.vcodec && f.vcodec !== 'none';
      const hasAudio = f.acodec && f.acodec !== 'none';
      const size = f.filesize
        ? formatBytes(f.filesize)
        : f.filesize_approx
        ? `~${formatBytes(f.filesize_approx)}`
        : 'Unknown size';

      const btn = document.createElement('button');
      btn.className = 'format-card';
      btn.innerHTML = `
        <div class="flex items-start justify-between gap-2">
          <span class="font-bold text-slate-800 dark:text-slate-200 text-sm leading-tight">${formatLabel(f)}</span>
          ${formatBadge(hasVideo, hasAudio)}
        </div>
        <span class="text-xs text-slate-500 dark:text-slate-400">${size}</span>
      `;
      btn.addEventListener('click', (e) => downloadVideo(f.format_id, e.currentTarget));
      formatList.appendChild(btn);
    });
  }

  async function fetchInfo() {
    const url = urlInput.value.trim();
    if (!url) return showMessage('Please enter a video URL', 'error');

    setLoading(infoBtn, infoBtnText, 'Fetching...');
    infoCard.classList.add('hidden');
    downloadResult.classList.add('hidden');
    showMessage('');

    try {
      const res = await fetch('/api/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, ...getAdvancedOptions() }),
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

      renderFormats(data.formats || []);
      infoCard.classList.remove('hidden');
      showMessage('');
    } catch (err) {
      showMessage(err.message, 'error');
    } finally {
      clearLoading(infoBtn, infoBtnText, 'Get Video');
    }
  }

  async function downloadVideo(formatId, btn) {
    if (!formatId || !btn) return;

    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="font-bold text-sm">Downloading...</span>`;
    downloadResult.classList.add('hidden');

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.value.trim(), formatId, ...getAdvancedOptions() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Download failed');

      downloadLink.href = data.downloadUrl;
      downloadLink.download = data.filename;
      downloadFilename.textContent = data.filename;
      downloadResult.classList.remove('hidden');
      showMessage('Download ready', 'success');
      window.open(data.downloadUrl, '_blank');
    } catch (err) {
      showMessage(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalHTML;
    }
  }

  infoBtn.addEventListener('click', fetchInfo);
  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') fetchInfo();
  });
})();
