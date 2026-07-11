const QuizUI = (() => {
  const el = (id) => document.getElementById(id);

  function renderScoreBar() {
    const stats = QuizStorage.getOverallStats();
    const avgEl = el('avg-score');
    const detailEl = el('score-detail');
    if (!stats.total) {
      avgEl.textContent = '—';
      avgEl.classList.remove('has-score');
      detailEl.textContent = 'No questions answered yet';
      return;
    }
    avgEl.textContent = `${stats.pct}%`;
    avgEl.classList.add('has-score');
    detailEl.textContent = `${stats.correct} / ${stats.total} correct`;
  }

  function renderModuleFilters(modules, enabled) {
    const chips = el('module-chips');
    chips.innerHTML = modules
      .map(
        (m) => `
      <label class="module-chip${enabled.has(m.id) ? ' active' : ''}">
        <input type="checkbox" data-module="${m.id}"${enabled.has(m.id) ? ' checked' : ''}>
        <span class="chip-id">${m.id}</span>
        <span class="chip-title">${m.title}</span>
      </label>`
      )
      .join('');
  }

  function renderSectionStats(modules, enabled) {
    const stats = QuizStorage.getModuleStats();
    const grid = el('stats-grid');
    grid.innerHTML = modules
      .map((m) => {
        const ms = stats[m.id] || { correct: 0, total: 0 };
        const pct = ms.total ? Math.round((ms.correct / ms.total) * 100) : null;
        const inactive = !enabled.has(m.id);
        const barWidth = pct != null ? pct : 0;
        return `
      <div class="stat-card${inactive ? ' inactive' : ''}${pct != null ? ' has-data' : ''}">
        <div class="stat-header">
          <span class="stat-id">${m.id}</span>
          <span class="stat-pct">${pct != null ? `${pct}%` : '—'}</span>
        </div>
        <p class="stat-title">${m.title}</p>
        <div class="stat-bar"><div class="stat-bar-fill" style="width:${barWidth}%"></div></div>
        <p class="stat-detail">${ms.total ? `${ms.correct} / ${ms.total} correct` : 'Not attempted'}</p>
      </div>`;
      })
      .join('');
  }

  function renderQuestion(q, shuffledOpts, moduleTitle) {
    el('quiz-meta').textContent = moduleTitle || q.module;
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
    el('next-btn').classList.add('hidden');
  }

  function showEmptyPool() {
    el('quiz-meta').textContent = '';
    el('question-text').textContent = 'Select at least one section below to start quizzing.';
    el('options').innerHTML = '';
    el('video-link').innerHTML = '';
    el('explanation').classList.add('hidden');
    el('next-btn').classList.add('hidden');
  }

  function showFeedback(correct, explanation) {
    const exp = el('explanation');
    exp.classList.remove('hidden');
    exp.classList.toggle('correct', correct);
    exp.classList.toggle('incorrect', !correct);
    exp.innerHTML = `<strong>${correct ? 'Correct' : 'Incorrect'}</strong><p>${explanation}</p>`;
    document.querySelectorAll('.option-btn').forEach((b) => (b.disabled = true));
  }

  function refresh(modules, enabled) {
    renderScoreBar();
    renderModuleFilters(modules, enabled);
    renderSectionStats(modules, enabled);
  }

  return {
    renderScoreBar,
    renderModuleFilters,
    renderSectionStats,
    renderQuestion,
    showEmptyPool,
    showFeedback,
    refresh,
  };
})();
