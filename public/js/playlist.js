(() => {
  const urlInput = document.getElementById('url');
  const fetchBtn = document.getElementById('fetchBtn');
  const messageEl = document.getElementById('message');
  const resultEl = document.getElementById('result');
  const titleEl = document.getElementById('title');
  const playlistEl = document.getElementById('playlist');
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
      }
    } catch (err) {
      captchaQuestionEl.textContent = 'Error';
    }
  }

  function getCaptchaData() {
    return {
      captchaToken: captchaTokenEl ? captchaTokenEl.value : '',
      captchaAnswer: captchaAnswerEl ? captchaAnswerEl.value.trim() : '',
    };
  }

  function formatTime(s) {
    if (!s) return '';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  async function fetchPlaylist() {
    const url = urlInput.value.trim();
    if (!url) return showMessage('Please enter a playlist URL', 'error');

    const { captchaToken, captchaAnswer } = getCaptchaData();
    if (window.CAPTCHA_MODE === 'math' && !captchaAnswer) {
      return showMessage('Please solve the math captcha', 'error');
    }

    fetchBtn.disabled = true;
    fetchBtn.textContent = 'Fetching...';
    resultEl.classList.add('hidden');
    showMessage('');

    try {
      const res = await fetch('/api/playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, captchaToken, captchaAnswer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch playlist');

      titleEl.textContent = `${data.title}${data.uploader ? ` by ${data.uploader}` : ''}`;
      playlistEl.innerHTML = '';

      if (!data.entries || !data.entries.length) {
        showMessage('No videos found in this playlist.', 'success');
        resultEl.classList.remove('hidden');
        return;
      }

      data.entries.forEach((entry) => {
        const card = document.createElement('a');
        card.href = `/?url=${encodeURIComponent(entry.url)}`;
        card.className = 'card card-hover group';
        card.innerHTML = `
          <div class="flex flex-col gap-3">
            <div class="relative rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800">
              <img src="${entry.thumbnail || '/favicon.svg'}" alt="${entry.title.replace(/"/g, '&quot;')}" class="w-full aspect-video object-cover" loading="lazy" />
              ${entry.duration ? `<span class="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-white text-xs font-medium">${formatTime(entry.duration)}</span>` : ''}
            </div>
            <h3 class="font-bold text-slate-900 dark:text-white leading-tight line-clamp-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition">${entry.title}</h3>
          </div>
        `;
        playlistEl.appendChild(card);
      });

      resultEl.classList.remove('hidden');
      showMessage(`Loaded ${data.entries.length} video(s). Click any card to download.`, 'success');
    } catch (err) {
      showMessage(err.message, 'error');
    } finally {
      fetchBtn.disabled = false;
      fetchBtn.textContent = 'Get Playlist';
      loadMathCaptcha();
    }
  }

  fetchBtn.addEventListener('click', fetchPlaylist);
  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') fetchPlaylist();
  });
  if (captchaRefreshBtn) captchaRefreshBtn.addEventListener('click', loadMathCaptcha);

  loadMathCaptcha();
})();
