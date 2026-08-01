(() => {
  const urlInput = document.getElementById('url');
  const fetchBtn = document.getElementById('fetchBtn');
  const messageEl = document.getElementById('message');
  const resultEl = document.getElementById('result');
  const titleEl = document.getElementById('title');
  const thumbnailsEl = document.getElementById('thumbnails');
  const captchaQuestionEl = document.getElementById('captchaQuestion');
  const captchaAnswerEl = document.getElementById('captchaAnswer');
  const captchaTokenEl = document.getElementById('captchaToken');
  const captchaRefreshBtn = document.getElementById('captchaRefresh');

  function showMessage(text, type = '') {
    messageEl.textContent = text;
    messageEl.className = `mt-4 text-left px-4 py-3 rounded-xl text-sm font-medium ${type === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' : type === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`;
    messageEl.classList.remove('hidden');
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

  function getCaptchaData() {
    return {
      captchaToken: captchaTokenEl ? captchaTokenEl.value : '',
      captchaAnswer: captchaAnswerEl ? captchaAnswerEl.value.trim() : '',
    };
  }

  async function downloadImage(url, filename) {
    try {
      const res = await fetch(url, { mode: 'cors', credentials: 'omit', referrerPolicy: 'no-referrer' });
      if (!res.ok) throw new Error('Image fetch failed');
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
      // Fallback: open in new tab if CORS is blocked.
      window.open(url, '_blank');
    }
  }

  async function fetchThumbnail() {
    const url = urlInput.value.trim();
    if (!url) return showMessage('Please enter a video URL', 'error');

    const { captchaToken, captchaAnswer } = getCaptchaData();
    if (window.CAPTCHA_MODE === 'math' && !captchaAnswer) {
      return showMessage('Please solve the math captcha', 'error');
    }

    fetchBtn.disabled = true;
    fetchBtn.textContent = 'Fetching...';
    resultEl.classList.add('hidden');
    showMessage('');

    try {
      const res = await fetch('/api/thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, captchaToken, captchaAnswer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch thumbnail');

      titleEl.textContent = data.title;
      thumbnailsEl.innerHTML = '';

      const topThumbnails = data.thumbnails.slice(0, 8);
      topThumbnails.forEach((t) => {
        const size = t.width && t.height ? `${t.width}x${t.height}` : 'Original';
        const safeTitle = String(data.title || 'thumbnail').replace(/[^\w\s-]/g, '').replace(/\s+/g, '_').substring(0, 50) || 'thumbnail';
        const urlPath = new URL(t.url).pathname;
        const extMatch = urlPath.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
        const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg';
        const filename = `${safeTitle}_${size}.${ext}`;

        const card = document.createElement('div');
        card.className = 'card card-hover text-center';
        card.innerHTML = `
          <img src="${t.url}" alt="Thumbnail ${size}" class="w-full h-48 object-cover rounded-xl mb-4 bg-slate-200 dark:bg-slate-800" loading="lazy" />
          <h3 class="font-bold text-slate-900 dark:text-white mb-1">${size}</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-4 truncate">${t.id || 'thumbnail'}</p>
          <button class="btn-primary w-full" data-url="${t.url}" data-filename="${filename}">Download</button>
        `;
        thumbnailsEl.appendChild(card);
      });

      // Bind download buttons
      thumbnailsEl.querySelectorAll('button[data-url]').forEach((btn) => {
        btn.addEventListener('click', () => downloadImage(btn.dataset.url, btn.dataset.filename));
      });

      resultEl.classList.remove('hidden');
      showMessage('Thumbnails loaded. Click Download to save.', 'success');
    } catch (err) {
      showMessage(err.message, 'error');
    } finally {
      fetchBtn.disabled = false;
      fetchBtn.textContent = 'Get Thumbnail';
      loadMathCaptcha();
    }
  }

  fetchBtn.addEventListener('click', fetchThumbnail);
  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') fetchThumbnail();
  });
  if (captchaRefreshBtn) captchaRefreshBtn.addEventListener('click', loadMathCaptcha);

  loadMathCaptcha();
})();
