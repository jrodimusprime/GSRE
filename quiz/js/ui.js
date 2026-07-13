const QuizUI = (() => {
  const el = (id) => document.getElementById(id);

  function renderScoreBar(poolProgress) {
    const stats = QuizStorage.getOverallStats();
    const avgEl = el('avg-score');
    const detailEl = el('score-detail');
    const remainingEl = el('pool-remaining');
    const pool = poolProgress || { total: 0, remaining: 0, attempted: 0, correct: 0, pct: null };

    if (remainingEl) {
      if (!pool.total) {
        remainingEl.textContent = 'No sections selected';
      } else if (pool.remaining === 0) {
        remainingEl.textContent = 'All questions in selected sections completed';
      } else {
        remainingEl.textContent =
          pool.remaining === 1
            ? '1 question remaining in selected sections'
            : `${pool.remaining} questions remaining in selected sections`;
      }
    }

    if (!stats.total) {
      avgEl.textContent = '—';
      avgEl.classList.remove('has-score');
      detailEl.textContent = pool.attempted
        ? `${pool.correct} / ${pool.attempted} correct so far`
        : 'No questions answered yet';
      return;
    }
    avgEl.textContent = `${stats.pct}%`;
    avgEl.classList.add('has-score');
    detailEl.textContent = `${stats.correct} / ${stats.total} correct overall`;
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

  function renderSectionStats(modules, enabled, progressByModule) {
    const grid = el('stats-grid');
    grid.innerHTML = modules
      .map((m) => {
        const p = progressByModule[m.id] || {
          total: m.questionCount || 0,
          attempted: 0,
          remaining: m.questionCount || 0,
          correct: 0,
          pct: null,
          exploredPct: 0,
        };
        const inactive = !enabled.has(m.id);
        const hasAttempts = p.attempted > 0;
        const barWidth = p.exploredPct || 0;
        const accuracy = p.pct != null ? `${p.pct}%` : '—';
        const remainingLabel =
          p.remaining === 1
            ? '1 not yet attempted'
            : `${p.remaining} not yet attempted`;
        const attemptLine = `${p.attempted} / ${p.total} attempted`;
        const correctLine = hasAttempts ? `${p.correct} / ${p.attempted} correct` : '';
        const detail = hasAttempts
          ? `${remainingLabel} · ${correctLine}`
          : `${remainingLabel} · ${attemptLine}`;
        return `
      <div class="stat-card${inactive ? ' inactive' : ''}${hasAttempts ? ' has-data' : ''}">
        <div class="stat-header">
          <span class="stat-id">${m.id}</span>
          <span class="stat-pct" title="Accuracy on attempted questions">${accuracy}</span>
        </div>
        <p class="stat-title">${m.title}</p>
        <p class="stat-attempts">${attemptLine}</p>
        <div class="stat-bar" title="Share of section attempted"><div class="stat-bar-fill" style="width:${barWidth}%"></div></div>
        <p class="stat-detail">${detail}</p>
      </div>`;
      })
      .join('');
  }

  function renderQuestion(q, shuffledOpts, moduleTitle, remainingInPool) {
    const remainingNote =
      remainingInPool != null && remainingInPool > 0
        ? `${remainingInPool} left in selected sections`
        : '';
    el('quiz-meta').textContent = [moduleTitle || q.module, remainingNote].filter(Boolean).join(' · ');
    el('question-text').innerHTML = QuizFormat.formatRichText(q.question);
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

  function showPoolExhausted(poolProgress) {
    const pool = poolProgress || { total: 0, attempted: 0 };
    el('quiz-meta').textContent = 'Pool complete';
    el('question-text').textContent =
      `You have answered all ${pool.total} questions in the selected sections. Untick sections to narrow focus, or reset progress to start over.`;
    el('options').innerHTML = '';
    el('video-link').innerHTML = '';
    el('explanation').classList.add('hidden');
    el('next-btn').classList.add('hidden');
  }

  function showInitError(err) {
    el('quiz-meta').textContent = '';
    el('question-text').textContent = 'Could not load the quiz. Try refreshing the page.';
    el('options').innerHTML = '';
    el('video-link').innerHTML = '';
    const exp = el('explanation');
    exp.classList.remove('hidden', 'correct');
    exp.classList.add('incorrect');
    exp.innerHTML = `<strong>Load error</strong><p>${err && err.message ? err.message : 'Unknown error'}</p>`;
    el('next-btn').classList.add('hidden');
  }

  function showFeedback(correct, explanation) {
    const exp = el('explanation');
    exp.classList.remove('hidden');
    exp.classList.toggle('correct', correct);
    exp.classList.toggle('incorrect', !correct);
    exp.innerHTML = `<strong>${correct ? 'Correct' : 'Incorrect'}</strong>${QuizFormat.formatRichText(explanation)}`;
    document.querySelectorAll('.option-btn').forEach((b) => (b.disabled = true));
  }

  function refresh(modules, enabled, progressByModule, poolProgress) {
    renderScoreBar(poolProgress);
    renderModuleFilters(modules, enabled);
    renderSectionStats(modules, enabled, progressByModule || {});
  }

  return {
    renderScoreBar,
    renderModuleFilters,
    renderSectionStats,
    renderQuestion,
    showEmptyPool,
    showPoolExhausted,
    showInitError,
    showFeedback,
    refresh,
  };
})();
