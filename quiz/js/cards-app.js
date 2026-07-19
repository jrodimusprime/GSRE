const CardsApp = (() => {
  function showCard() {
    const card = CardsEngine.current() || CardsEngine.advance();
    CardsUI.renderCard(card);
  }

  function onFlip() {
    if (CardsEngine.isComplete()) return;
    if (!CardsEngine.current()) return;
    CardsEngine.flip();
    CardsUI.applyFlipVisual();
  }

  function onRate(rating) {
    if (!CardsEngine.isFlipped()) return;
    CardsEngine.rate(rating);
    CardsUI.renderCard(CardsEngine.current());
  }

  function onReset() {
    if (CardsEngine.hasProgress()) {
      const ok = window.confirm(
        'Are you sure you want to reset your flash card progress? This will reshuffle the deck.'
      );
      if (!ok) return;
    }
    CardsEngine.reset();
    CardsUI.renderCard(CardsEngine.current());
  }

  function onToggleFaceMode() {
    CardsEngine.toggleFaceMode();
    CardsUI.renderCard(CardsEngine.current());
  }

  async function init() {
    const cards = await CardsLoader.getAllCards();
    if (!cards.length) {
      throw new Error('No flash cards loaded');
    }
    CardsEngine.init(cards);
    showCard();

    elBind('flash-card', 'click', onFlip);
    elBind('face-mode-btn', 'click', onToggleFaceMode);
    elBind('reset-cards-btn', 'click', onReset);
    elBind('done-reset-btn', 'click', onReset);

    document.querySelectorAll('.rating-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const rating = Number(btn.getAttribute('data-rating'));
        onRate(rating);
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
        return;
      }
      if (e.key === ' ' || e.key === 'Enter') {
        if (e.target && e.target.id === 'flash-card') return;
        e.preventDefault();
        onFlip();
      } else if (e.key >= '1' && e.key <= '4') {
        onRate(Number(e.key));
      }
    });
  }

  function elBind(id, event, handler) {
    const node = document.getElementById(id);
    if (node) node.addEventListener(event, handler);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        init().catch((err) => {
          console.error(err);
          const meta = document.getElementById('cards-meta');
          if (meta) meta.textContent = `Failed to load cards: ${err.message}`;
        });
      });
    } else {
      init().catch((err) => console.error(err));
    }
  }

  return { init };
})();
