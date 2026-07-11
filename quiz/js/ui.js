const QuizUI = (() => {
  const el = (id) => document.getElementById(id);

  function showScreen(name) {
    document.querySelectorAll('.screen').forEach((s) => {
      s.classList.toggle('hidden', s.dataset.screen !== name);
    });
  }

  function renderModules(modules, counts) {
    const grid = el('module-grid');
    grid.innerHTML = modules
      .map(
        (m) => `
      <button class="module-card" data-module="${m.id}">
        <h3>${m.title}</h3>
        <p class="count">${counts[m.id] || m.questionCount} questions</p>
        ${m.sourceUrl ? `<a href="${m.sourceUrl}" target="_blank" rel="noopener" class="source-link" onclick="event.stopPropagation()">Watch source video</a>` : ''}
      </button>`
      )
      .join('');
  }

  function renderQuestion(q, shuffledOpts, meta) {
    el('quiz-meta').textContent = meta;
    el('question-text').textContent = q.question;
    const optsEl = el('options');
    optsEl.innerHTML = shuffledOpts
      .map(
        (o, i) =>
          `<button class="option-btn" data-idx="${o.originalIndex}">${String.fromCharCode(65 + i)}. ${o.text}</button>`
      )
      .join('');

    el('explanation').classList.add('hidden');
    el('explanation').textContent = '';
    el('video-link').innerHTML = q.videoUrl
      ? `<a href="${q.videoUrl}" target="_blank" rel="noopener">Jump to video at ${q.videoTimestamp || ''}</a>`
      : q.source
        ? `<span class="source-ref">Source: ${q.source}</span>`
        : '';
  }

  function showFeedback(correct, explanation) {
    const exp = el('explanation');
    exp.classList.remove('hidden');
    exp.classList.toggle('correct', correct);
    exp.classList.toggle('incorrect', !correct);
    exp.innerHTML = `<strong>${correct ? 'Correct' : 'Incorrect'}</strong><p>${explanation}</p>`;
    document.querySelectorAll('.option-btn').forEach((b) => (b.disabled = true));
  }

  function renderResults(results) {
    showScreen('results');
    el('results-summary').innerHTML = `
      <h2>Results</h2>
      <p class="score">${results.score} / ${results.total} (${results.pct}%)</p>`;
  }

  function updateTimer(ms) {
    const t = el('timer');
    if (ms == null) {
      t.classList.add('hidden');
      return;
    }
    t.classList.remove('hidden');
    const sec = Math.ceil(ms / 1000);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    t.textContent = `${m}:${String(s).padStart(2, '0')}`;
    if (sec <= 60) t.classList.add('urgent');
  }

  return {
    showScreen,
    renderModules,
    renderQuestion,
    showFeedback,
    renderResults,
    updateTimer,
  };
})();
