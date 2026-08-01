(() => {
  const urlInput = document.getElementById('url');
  const fetchBtn = document.getElementById('fetchBtn');
  const messageEl = document.getElementById('message');
  const resultEl = document.getElementById('result');
  const titleEl = document.getElementById('title');
  const subtitleListEl = document.getElementById('subtitleList');
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

  function downloadFile(token) {
    const a = document.createElement('a');
    a.href = `/api/subtitle-file?token=${encodeURIComponent(token)}`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => a.remove(), 1000);
  }

  async function fetchSubtitles() {
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
      const res = await fetch('/api/subtitles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, captchaToken, captchaAnswer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch subtitles');

      titleEl.textContent = `Subtitles for ${data.title}`;
      subtitleListEl.innerHTML = '';

      if (!data.subtitles || !data.subtitles.length) {
        showMessage('No subtitles found for this video.', 'success');
        resultEl.classList.remove('hidden');
        return;
      }

      const topGroups = data.subtitles.slice(0, 20);
      topGroups.forEach((group) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `<h3 class="font-bold text-lg mb-3 text-slate-900 dark:text-white">${group.lang}${group.auto ? ' (auto-generated)' : ''}</h3>`;
        const grid = document.createElement('div');
        grid.className = 'flex flex-wrap gap-2';

        group.entries.forEach((entry) => {
          const btn = document.createElement('button');
          btn.className = 'px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-sky-100 dark:hover:bg-sky-900/30 hover:text-sky-700 dark:hover:text-sky-300 transition';
          btn.textContent = entry.ext;
          btn.title = entry.name;
          btn.addEventListener('click', () => downloadFile(entry.downloadToken));
          grid.appendChild(btn);
        });

        card.appendChild(grid);
        subtitleListEl.appendChild(card);
      });

      resultEl.classList.remove('hidden');
      showMessage('Subtitles loaded. Click a format button to download.', 'success');
    } catch (err) {
      showMessage(err.message, 'error');
    } finally {
      fetchBtn.disabled = false;
      fetchBtn.textContent = 'Get Subtitles';
      loadMathCaptcha();
    }
  }

  fetchBtn.addEventListener('click', fetchSubtitles);
  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') fetchSubtitles();
  });
  if (captchaRefreshBtn) captchaRefreshBtn.addEventListener('click', loadMathCaptcha);

  loadMathCaptcha();
})();
