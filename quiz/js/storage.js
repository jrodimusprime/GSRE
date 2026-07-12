const QuizStorage = (() => {
  const KEY = 'gsre-quiz-v1';

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '{}');
    } catch {
      return {};
    }
  }

  function save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function recordAnswer(questionId, correct, moduleId) {
    const data = load();
    data.answers = data.answers || {};
    data.answers[questionId] = { correct, module: moduleId, at: Date.now() };
    if (!correct) {
      data.wrongBook = data.wrongBook || [];
      if (!data.wrongBook.includes(questionId)) data.wrongBook.push(questionId);
    }
    data.moduleStats = data.moduleStats || {};
    const ms = data.moduleStats[moduleId] || { correct: 0, total: 0 };
    ms.total++;
    if (correct) ms.correct++;
    data.moduleStats[moduleId] = ms;
    save(data);
  }

  function getOverallStats() {
    const stats = load().moduleStats || {};
    let correct = 0;
    let total = 0;
    for (const m of Object.values(stats)) {
      correct += m.correct || 0;
      total += m.total || 0;
    }
    return {
      correct,
      total,
      pct: total ? Math.round((correct / total) * 100) : null,
    };
  }

  function getModuleStats() {
    return load().moduleStats || {};
  }

  function getAnswers() {
    return load().answers || {};
  }

  /** Progress for enabled module pools (union of question IDs per enabled module). */
  function getEnabledPoolProgress(questionIdsByModule, enabledModules) {
    const answers = getAnswers();
    const enabled = enabledModules instanceof Set ? enabledModules : new Set(enabledModules);
    const idSet = new Set();
    for (const [moduleId, ids] of Object.entries(questionIdsByModule)) {
      if (!enabled.has(moduleId)) continue;
      for (const id of ids) idSet.add(id);
    }
    let attempted = 0;
    let correct = 0;
    for (const id of idSet) {
      if (!answers[id]) continue;
      attempted++;
      if (answers[id].correct) correct++;
    }
    const total = idSet.size;
    const remaining = Math.max(0, total - attempted);
    return {
      total,
      attempted,
      remaining,
      correct,
      pct: attempted ? Math.round((correct / attempted) * 100) : null,
      exploredPct: total ? Math.round((attempted / total) * 100) : 0,
    };
  }

  /** Unique question IDs answered per module pool. */
  function getAttemptedProgress(questionIdsByModule) {
    const answers = getAnswers();
    const out = {};
    for (const [moduleId, ids] of Object.entries(questionIdsByModule)) {
      const idSet = new Set(ids);
      let attempted = 0;
      let correct = 0;
      for (const [qid, rec] of Object.entries(answers)) {
        if (!idSet.has(qid)) continue;
        attempted++;
        if (rec.correct) correct++;
      }
      const total = ids.length;
      out[moduleId] = {
        total,
        attempted,
        remaining: Math.max(0, total - attempted),
        correct,
        pct: attempted ? Math.round((correct / attempted) * 100) : null,
        exploredPct: total ? Math.round((attempted / total) * 100) : 0,
      };
    }
    return out;
  }

  function getEnabledModules(allModuleIds) {
    const saved = load().enabledModules;
    if (!Array.isArray(saved) || !saved.length) return new Set(allModuleIds);
    const valid = saved.filter((id) => allModuleIds.includes(id));
    return valid.length ? new Set(valid) : new Set(allModuleIds);
  }

  function setEnabledModules(moduleIds) {
    const data = load();
    data.enabledModules = [...moduleIds];
    save(data);
  }

  function getWrongBook() {
    return load().wrongBook || [];
  }

  function clearProgress() {
    localStorage.removeItem(KEY);
  }

  return {
    recordAnswer,
    getOverallStats,
    getModuleStats,
    getAnswers,
    getAttemptedProgress,
    getEnabledPoolProgress,
    getEnabledModules,
    setEnabledModules,
    getWrongBook,
    clearProgress,
    load,
  };
})();
