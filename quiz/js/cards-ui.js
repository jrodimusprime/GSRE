const CardsUI = (() => {
  const el = (id) => document.getElementById(id);

  function setRatingsEnabled(enabled) {
    document.querySelectorAll('.rating-btn').forEach((btn) => {
      btn.disabled = !enabled;
    });
  }

  function renderScore() {
    const remaining = CardsEngine.remainingCount();
    const mastered = CardsEngine.masteredCount();
    const total = CardsEngine.totalCount();
    const remEl = el('cards-remaining');
    const detailEl = el('cards-detail');
    remEl.textContent = String(remaining);
    remEl.classList.toggle('has-score', remaining > 0);
    detailEl.textContent = `${mastered}/${total} very confident`;
  }

  function renderFaceModeBtn() {
    const btn = el('face-mode-btn');
    const mode = CardsEngine.getFaceMode();
    btn.textContent =
      mode === 'question' ? 'Show question first' : 'Show answer first';
    btn.setAttribute(
      'aria-pressed',
      mode === 'answer' ? 'true' : 'false'
    );
  }

  function renderCard(card) {
    const area = el('cards-area');
    const done = el('cards-done');
    const ratingBar = el('rating-bar');
    const flash = el('flash-card');

    if (!card || CardsEngine.isComplete()) {
      area.classList.add('hidden');
      done.classList.remove('hidden');
      ratingBar.classList.add('hidden');
      setRatingsEnabled(false);
      renderScore();
      return;
    }

    area.classList.remove('hidden');
    done.classList.add('hidden');
    ratingBar.classList.remove('hidden');

    const prompt = CardsEngine.promptSide(card);
    const reveal = CardsEngine.revealSide(card);

    el('cards-meta').textContent = `${card.id} · ${card.deck || 'core'}`;
    el('prompt-label').textContent = prompt.label;
    el('prompt-text').innerHTML = QuizFormat.formatRichText(prompt.text);
    el('reveal-label').textContent = reveal.label;
    el('reveal-text').innerHTML = QuizFormat.formatRichText(reveal.text);

    const srcEl = el('reveal-source');
    if (reveal.source) {
      srcEl.textContent = reveal.source;
      srcEl.classList.remove('hidden');
    } else {
      srcEl.textContent = '';
      srcEl.classList.add('hidden');
    }

    flash.classList.toggle('is-flipped', CardsEngine.isFlipped());
    el('flip-hint').textContent = CardsEngine.isFlipped()
      ? 'Rate your confidence below'
      : 'Tap the card to flip';

    setRatingsEnabled(CardsEngine.isFlipped());
    renderScore();
    renderFaceModeBtn();
  }

  function applyFlipVisual() {
    el('flash-card').classList.toggle('is-flipped', CardsEngine.isFlipped());
    el('flip-hint').textContent = CardsEngine.isFlipped()
      ? 'Rate your confidence below'
      : 'Tap the card to flip';
    setRatingsEnabled(CardsEngine.isFlipped());
  }

  return {
    renderCard,
    renderScore,
    renderFaceModeBtn,
    applyFlipVisual,
    setRatingsEnabled,
  };
})();
