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
  const captchaQuestionEl = document.getElementById('captchaQuestion');
  const captchaAnswerEl = document.getElementById('captchaAnswer');
  const captchaTokenEl = document.getElementById('captchaToken');
  const captchaRefreshBtn = document.getElementById('captchaRefresh');
  let videoData = null;

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

  async function getRecaptchaToken(action) {
    if (!window.RECAPTCHA_SITE_KEY || typeof grecaptcha === 'undefined') return '';
    return new Promise((resolve) => {
      grecaptcha.ready(() => {
        grecaptcha.execute(window.RECAPTCHA_SITE_KEY, { action })
          .then((token) => resolve(token))
          .catch(() => resolve(''));
      });
    });
  }

  async function loadMathCaptcha() {
    if (window.CAPTCHA_MODE !== 'math' || !captchaQuestionEl) return;
    try {
      const res = await fetch('/api/captcha');
      const data = await res.json();
      if (data.question && data.token) {
        captchaQuestionEl.textContent = data.question;
        captchaTokenEl.value = data.token;
        if (captchaAnswerEl) captchaAnswerEl.value = '';
      } else {
        captchaQuestionEl.textContent = 'Not available';
      }
    } catch (err) {
      captchaQuestionEl.textContent = 'Error loading captcha';
    }
  }

  async function getCaptchaData(action) {
    if (window.CAPTCHA_MODE === 'recaptcha') {
      return { captchaToken: await getRecaptchaToken(action), captchaAnswer: '' };
    }
    if (window.CAPTCHA_MODE === 'math') {
      return {
        captchaToken: captchaTokenEl ? captchaTokenEl.value : '',
        captchaAnswer: captchaAnswerEl ? captchaAnswerEl.value.trim() : '',
      };
    }
    return { captchaToken: '', captchaAnswer: '' };
  }

  function deduplicateFormats(formats) {
    const map = new Map();
    for (const f of formats) {
      const key = `${f.resolution || 'audio'}-${f.ext}-${f.vcodec || f.acodec || 'unknown'}`;
      const existing = map.get(key);
      const size = f.filesize || f.filesize_approx || 0;
      const existingSize = existing ? (existing.filesize || existing.filesize_approx || 0) : 0;
      if (!existing || size > existingSize) {
        map.set(key, f);
      }
    }
    return Array.from(map.values());
  }

  function formatBadge(hasVideo, hasAudio) {
    if (hasVideo && hasAudio) return `<span class="badge badge-muxed shrink-0">Video + Audio</span>`;
    if (hasVideo) return `<span class="badge badge-video shrink-0">Video only</span>`;
    if (hasAudio) return `<span class="badge badge-audio shrink-0">Audio only</span>`;
    return `<span class="badge badge-video shrink-0">Video</span>`;
  }

  function formatLabel(f) {
    const hasVideo = f.vcodec && f.vcodec !== 'none';
    const hasAudio = f.acodec && f.acodec !== 'none';
    const parts = [];

    if (f.resolution && f.resolution !== 'audio only') {
      parts.push(f.resolution);
    } else if (hasAudio && !hasVideo) {
      parts.push('Audio');
    } else if (hasVideo) {
      parts.push('Video');
    }

    if (f.ext) parts.push(f.ext.toUpperCase());

    const codec = hasVideo ? f.vcodec : hasAudio ? f.acodec : '';
    if (codec && codec !== 'none') {
      const short = String(codec).split('.')[0].split(' ')[0].toLowerCase();
      parts.push(short);
    }

    if (hasAudio && !hasVideo && f.abr) parts.push(`${Math.round(f.abr)} kbps`);

    return parts.join(' · ') || f.format_id;
  }

  function formatQualityHint(f) {
    const size = f.filesize ? formatBytes(f.filesize) : f.filesize_approx ? `~${formatBytes(f.filesize_approx)}` : '';
    return size ? `<span class="text-xs text-slate-500 dark:text-slate-400">${size}</span>` : '';
  }

  function renderFormats(formats) {
    formatList.innerHTML = '';
    let usable = formats.filter((f) => f.ext !== 'mhtml' && !f.format_id.startsWith('sb') && f.format_id !== 'download');
    usable = deduplicateFormats(usable);
    if (!usable.length) {
      formatList.innerHTML = '<p class="text-sm text-slate-500 dark:text-slate-400">No individual formats found. Use the “Best available” option.</p>';
      return;
    }

    const best = document.createElement('button');
    best.className = 'format-card format-row format-best';
    best.innerHTML = `
      <div class="flex items-center gap-3 min-w-0">
        <span class="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-md">★</span>
        <div class="min-w-0">
          <div class="font-bold text-slate-900 dark:text-white text-base leading-tight">Best available</div>
          <div class="text-xs text-slate-500 dark:text-slate-400">Auto-pick highest quality</div>
        </div>
      </div>
      <span class="badge badge-muxed shrink-0">Recommended</span>
    `;
    best.addEventListener('click', (e) => downloadVideo('best', e.currentTarget));
    formatList.appendChild(best);

    usable.forEach((f) => {
      const hasVideo = f.vcodec && f.vcodec !== 'none';
      const hasAudio = f.acodec && f.acodec !== 'none';
      const iconBg = hasVideo
        ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300'
        : 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300';
      const iconText = hasVideo ? '▶' : '♪';

      const btn = document.createElement('button');
      btn.className = 'format-card format-row';
      btn.innerHTML = `
        <div class="flex items-center gap-3 min-w-0">
          <span class="w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center text-sm font-bold shrink-0">${iconText}</span>
          <div class="min-w-0">
            <div class="font-bold text-slate-800 dark:text-slate-200 text-sm leading-tight truncate text-left">${formatLabel(f)}</div>
            ${formatQualityHint(f)}
          </div>
        </div>
        ${formatBadge(hasVideo, hasAudio)}
      `;
      btn.addEventListener('click', (e) => downloadVideo(f.format_id, e.currentTarget));
      formatList.appendChild(btn);
    });
  }

  async function fetchInfo() {
    const url = urlInput.value.trim();
    if (!url) return showMessage('Please enter a video URL', 'error');

    const { captchaToken, captchaAnswer } = await getCaptchaData('info');
    if (window.CAPTCHA_MODE === 'math' && !captchaAnswer) {
      return showMessage('Please solve the math captcha', 'error');
    }

    setLoading(infoBtn, infoBtnText, 'Fetching...');
    infoCard.classList.add('hidden');
    downloadResult.classList.add('hidden');
    showMessage('');

    try {
      const res = await fetch('/api/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, captchaToken, captchaAnswer, ...getAdvancedOptions() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch info');
      videoData = data;

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
      loadMathCaptcha();
    }
  }

  function startProxyDownload(token, filename) {
    const a = document.createElement('a');
    a.href = `/api/download-proxy?token=${encodeURIComponent(token)}`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function downloadVideo(formatId, btn) {
    if (!formatId || !btn) return;

    const { captchaToken, captchaAnswer } = await getCaptchaData('download');
    if (window.CAPTCHA_MODE === 'math' && !captchaAnswer) {
      return showMessage('Please solve the math captcha', 'error');
    }

    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="font-bold text-sm">Downloading...</span>`;
    downloadResult.classList.add('hidden');

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.value.trim(), formatId, title: videoData?.title, captchaToken, captchaAnswer, ...getAdvancedOptions() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Download failed');

      downloadFilename.textContent = data.filename;
      downloadResult.classList.remove('hidden');

      if (data.downloadToken) {
        showMessage('Download starting', 'success');
        startProxyDownload(data.downloadToken, data.filename);
      } else {
        downloadLink.href = data.downloadUrl;
        downloadLink.download = data.filename;
        showMessage('Download ready', 'success');
        downloadLink.click();
      }
    } catch (err) {
      showMessage(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalHTML;
      loadMathCaptcha();
    }
  }

  infoBtn.addEventListener('click', fetchInfo);
  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') fetchInfo();
  });

  if (captchaRefreshBtn) {
    captchaRefreshBtn.addEventListener('click', loadMathCaptcha);
  }

  loadMathCaptcha();
})();
