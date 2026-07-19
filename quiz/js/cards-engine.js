const CardsEngine = (() => {
  let cardsById = {};
  let allIds = [];
  let queue = [];
  let mastered = new Set();
  let ratings = {};
  let faceMode = 'question'; // 'question' | 'answer' — which side shows first
  let currentId = null;
  let flipped = false;

  function persist() {
    CardsStorage.setState({
      ratings,
      mastered: [...mastered],
      queue,
      faceMode,
    });
  }

  function init(cards) {
    cardsById = Object.fromEntries(cards.map((c) => [c.id, c]));
    allIds = cards.map((c) => c.id);

    const saved = CardsStorage.getState();
    faceMode = saved.faceMode;
    ratings = { ...(saved.ratings || {}) };
    mastered = new Set((saved.mastered || []).filter((id) => cardsById[id]));

    const validSavedQueue = Array.isArray(saved.queue)
      ? saved.queue.filter((id) => cardsById[id] && !mastered.has(id))
      : null;

    if (validSavedQueue && validSavedQueue.length) {
      // Keep saved order; append any new cards not yet mastered
      const inQueue = new Set(validSavedQueue);
      const extras = CardsLoader.shuffle(
        allIds.filter((id) => !mastered.has(id) && !inQueue.has(id))
      );
      queue = [...validSavedQueue, ...extras];
    } else if (mastered.size && mastered.size < allIds.length) {
      queue = CardsLoader.shuffle(allIds.filter((id) => !mastered.has(id)));
    } else if (mastered.size === allIds.length && allIds.length) {
      queue = [];
    } else {
      queue = CardsLoader.shuffle([...allIds]);
      mastered = new Set();
      ratings = {};
    }

    currentId = null;
    flipped = false;
    persist();
  }

  function current() {
    if (!currentId) return null;
    return cardsById[currentId] || null;
  }

  function remainingCount() {
    return queue.length + (currentId ? 1 : 0);
  }

  function queueLength() {
    return queue.length;
  }

  function masteredCount() {
    return mastered.size;
  }

  function totalCount() {
    return allIds.length;
  }

  function isComplete() {
    return allIds.length > 0 && queue.length === 0 && !currentId;
  }

  function getFaceMode() {
    return faceMode;
  }

  function toggleFaceMode() {
    faceMode = faceMode === 'question' ? 'answer' : 'question';
    flipped = false;
    persist();
    return faceMode;
  }

  function isFlipped() {
    return flipped;
  }

  function flip() {
    if (!currentId) return false;
    flipped = !flipped;
    return flipped;
  }

  function promptSide(card) {
    if (!card) return { label: '', text: '' };
    if (faceMode === 'answer') {
      return { label: 'Answer', text: card.back, source: card.source };
    }
    return { label: 'Question', text: card.front, source: null };
  }

  function revealSide(card) {
    if (!card) return { label: '', text: '' };
    if (faceMode === 'answer') {
      return { label: 'Question', text: card.front, source: null };
    }
    return { label: 'Answer', text: card.back, source: card.source };
  }

  function advance() {
    flipped = false;
    if (!queue.length) {
      currentId = null;
      return null;
    }
    currentId = queue.shift();
    persist();
    return cardsById[currentId] || null;
  }

  /**
   * Reinsert card into queue based on confidence rating.
   * 1 → index min(1, len); 2 → min(3, len); 3 → end; 4 → mastered (no reinsert).
   */
  function rate(rating) {
    const id = currentId;
    if (!id || !flipped) return null;
    const r = Number(rating);
    if (![1, 2, 3, 4].includes(r)) return null;

    ratings[id] = r;

    if (r === 4) {
      mastered.add(id);
      currentId = null;
      persist();
      return advance();
    }

    mastered.delete(id);
    let insertAt;
    if (r === 1) {
      insertAt = Math.min(1, queue.length);
    } else if (r === 2) {
      insertAt = Math.min(3, queue.length);
    } else {
      insertAt = queue.length; // confident → bottom
    }
    queue.splice(insertAt, 0, id);
    currentId = null;
    persist();
    return advance();
  }

  function hasProgress() {
    return mastered.size > 0 || Object.keys(ratings).length > 0;
  }

  function reset() {
    mastered = new Set();
    ratings = {};
    queue = CardsLoader.shuffle([...allIds]);
    currentId = null;
    flipped = false;
    persist();
    return advance();
  }

  /** Pure helper for tests — compute insert index given queue length and rating. */
  function insertIndexForRating(queueLen, rating) {
    const r = Number(rating);
    if (r === 4) return null;
    if (r === 1) return Math.min(1, queueLen);
    if (r === 2) return Math.min(3, queueLen);
    if (r === 3) return queueLen;
    return null;
  }

  return {
    init,
    current,
    remainingCount,
    queueLength,
    masteredCount,
    totalCount,
    isComplete,
    getFaceMode,
    toggleFaceMode,
    isFlipped,
    flip,
    promptSide,
    revealSide,
    advance,
    rate,
    reset,
    hasProgress,
    insertIndexForRating,
  };
})();
