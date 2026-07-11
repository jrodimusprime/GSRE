const QuizLoader = (() => {
  function appRoot() {
    const script = document.currentScript;
    if (script?.src) {
      return new URL('.', script.src).href;
    }
    return new URL('./quiz/js/', window.location.href).href;
  }

  const ROOT = appRoot().replace(/quiz\/js\/?$/, '');
  const BASE = `${ROOT}quiz/data/`;
  let cache = { sections: null, video: null, supplemental: {}, allQuestions: null };

  async function loadSections() {
    if (cache.sections) return cache.sections;
    const res = await fetch(`${BASE}sections.json`);
    cache.sections = await res.json();
    return cache.sections;
  }

  async function loadVideoQuestions() {
    if (cache.video) return cache.video;
    const res = await fetch(`${BASE}questions/sa-video.json`);
    const data = await res.json();
    cache.video = data.questions || data;
    return cache.video;
  }

  async function loadSupplemental(file) {
    if (cache.supplemental[file]) return cache.supplemental[file];
    const res = await fetch(`${BASE}${file}`);
    const data = await res.json();
    cache.supplemental[file] = data.questions || data;
    return cache.supplemental[file];
  }

  function videoForModule(module, videoQuestions) {
    if (module.id === 'SA-VIDEO') return videoQuestions;
    return videoQuestions.filter(
      (q) => q.moduleTags && q.moduleTags.includes(module.id)
    );
  }

  async function getModuleQuestions(moduleId) {
    const config = await loadSections();
    const mod = config.modules.find((m) => m.id === moduleId);
    if (!mod) return [];

    if (mod.id === 'SA-VIDEO') {
      return loadVideoQuestions();
    }

    const video = await loadVideoQuestions();
    const fromVideo = videoForModule(mod, video);
    const supplemental = mod.dataFile
      ? await loadSupplemental(mod.dataFile)
      : [];
    return [...fromVideo, ...supplemental];
  }

  async function getAllQuestions() {
    if (cache.allQuestions) return cache.allQuestions;
    const config = await loadSections();
    const seen = new Set();
    const all = [];
    for (const mod of config.modules) {
      const qs = await getModuleQuestions(mod.id);
      for (const q of qs) {
        if (!seen.has(q.id)) {
          seen.add(q.id);
          all.push({ ...q, module: q.module || mod.id });
        }
      }
    }
    cache.allQuestions = all;
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
    loadSections,
    getModuleQuestions,
    getAllQuestions,
    shuffle,
  };
})();
