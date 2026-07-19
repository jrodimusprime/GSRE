const CardsStorage = (() => {
  const KEY = 'gsre-cards-v1';

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '{}');
    } catch {
      return {};
    }
  }

  function save(data) {
    data.updatedAt = Date.now();
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function getState() {
    const data = load();
    return {
      ratings: data.ratings || {},
      mastered: Array.isArray(data.mastered) ? data.mastered : [],
      queue: Array.isArray(data.queue) ? data.queue : null,
      faceMode: data.faceMode === 'answer' ? 'answer' : 'question',
    };
  }

  function setState(partial) {
    const data = load();
    if (partial.ratings !== undefined) data.ratings = partial.ratings;
    if (partial.mastered !== undefined) data.mastered = [...partial.mastered];
    if (partial.queue !== undefined) data.queue = [...partial.queue];
    if (partial.faceMode !== undefined) data.faceMode = partial.faceMode;
    save(data);
  }

  function clearProgress() {
    const faceMode = getState().faceMode;
    localStorage.removeItem(KEY);
    if (faceMode === 'answer') {
      setState({ faceMode: 'answer', ratings: {}, mastered: [], queue: null });
    }
  }

  return {
    getState,
    setState,
    clearProgress,
    load,
  };
})();
