const CardsLoader = (() => {
  let baseUrl = null;

  function getDataBase() {
    if (baseUrl) return baseUrl;
    const script = document.querySelector('script[src*="quiz/js/cards-loader.js"]');
    if (script && script.src) {
      baseUrl = new URL('quiz/data/', new URL('../..', script.src)).href;
      return baseUrl;
    }
    const path = location.pathname.replace(/\/?index\.html$/, '').replace(/\/cards\/?$/, '/');
    const prefix = path.endsWith('/') ? path : `${path}/`;
    baseUrl = `${location.origin}${prefix}quiz/data/`;
    return baseUrl;
  }

  let cache = { registry: null, decks: {}, allCards: null };

  async function fetchJson(path) {
    const res = await fetch(`${getDataBase()}${path}`);
    if (!res.ok) {
      throw new Error(`Failed to load ${path} (${res.status})`);
    }
    return res.json();
  }

  async function loadRegistry() {
    if (cache.registry) return cache.registry;
    cache.registry = await fetchJson('cards.json');
    return cache.registry;
  }

  async function loadDeck(dataFile) {
    if (cache.decks[dataFile]) return cache.decks[dataFile];
    const data = await fetchJson(dataFile);
    cache.decks[dataFile] = data.cards || data;
    return cache.decks[dataFile];
  }

  async function getAllCards() {
    if (cache.allCards) return cache.allCards;
    const registry = await loadRegistry();
    const seen = new Set();
    const all = [];
    for (const deck of registry.decks || []) {
      const cards = await loadDeck(deck.dataFile);
      for (const card of cards) {
        if (!card.id || seen.has(card.id)) continue;
        seen.add(card.id);
        all.push({ ...card, deck: card.deck || deck.id });
      }
    }
    cache.allCards = all;
    return all;
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  return {
    loadRegistry,
    getAllCards,
    shuffle,
    getDataBase,
  };
})();
