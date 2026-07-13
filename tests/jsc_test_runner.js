/* Browser mocks + smoke tests for quiz init (JavaScriptCore). */
const ROOT = '/Users/jared/code/GSRE/';

if (typeof URL === 'undefined') {
  globalThis.URL = function URL(href, base) {
    const join = (root, rel) => {
      if (rel.startsWith('http://') || rel.startsWith('https://') || rel.startsWith('file://')) {
        return rel;
      }
      const basePath = root.replace(/^file:\/\//, '').replace(/\/[^/]*$/, '/');
      if (rel.startsWith('/')) return `file://${rel}`;
      if (rel === '..') return root.replace(/\/[^/]+\/?$/, '/');
      if (rel === '../..') return root.replace(/\/[^/]+\/?$/, '/').replace(/\/[^/]+\/?$/, '/');
      return `${basePath}${rel}`;
    };
    this.href = base ? join(String(base), String(href)) : String(href);
    this.toString = () => this.href;
  };
  URL.prototype = {};
}

const mockStorage = {};
globalThis.localStorage = {
  getItem(k) { return mockStorage[k] ?? null; },
  setItem(k, v) { mockStorage[k] = v; },
  removeItem(k) { delete mockStorage[k]; },
};

globalThis.location = { href: `file://${ROOT}index.html`, pathname: '/GSRE/index.html', origin: 'file://', search: '' };

const elements = {};
function makeEl(id) {
  return {
    id,
    textContent: '',
    innerHTML: '',
    className: '',
    classList: {
      _c: new Set(),
      add(...a) { a.forEach((x) => this._c.add(x)); },
      remove(...a) { a.forEach((x) => this._c.delete(x)); },
      toggle(x, force) {
        if (force === true) this._c.add(x);
        else if (force === false) this._c.delete(x);
        else if (this._c.has(x)) this._c.delete(x);
        else this._c.add(x);
      },
    },
    addEventListener() {},
    onclick: null,
    disabled: false,
    dataset: {},
  };
}

globalThis.document = {
  readyState: 'loading',
  getElementById(id) {
    if (!elements[id]) elements[id] = makeEl(id);
    return elements[id];
  },
  addEventListener(event, fn) {
    if (event === 'DOMContentLoaded') fn();
  },
  querySelector(selector) {
    if (selector.includes('quiz/js/loader.js')) {
      return { src: `file://${ROOT}quiz/js/loader.js` };
    }
    return null;
  },
  querySelectorAll() { return []; },
};

globalThis.fetch = function fetch(url) {
  let path = String(url);
  const marker = 'quiz/data/';
  const idx = path.indexOf(marker);
  if (idx >= 0) {
    path = ROOT + path.slice(idx);
  }
  const body = read(path);
  return Promise.resolve({
    ok: true,
    status: 200,
    json() { return Promise.resolve(JSON.parse(body)); },
  });
};

function fail(msg) {
  print(`FAIL: ${msg}`);
  quit(1);
}

function assert(cond, msg) {
  if (!cond) fail(msg);
}

load(`${ROOT}quiz/js/loader.js`);
load(`${ROOT}quiz/js/storage.js`);
load(`${ROOT}quiz/js/engine.js`);
load(`${ROOT}quiz/js/format.js`);
load(`${ROOT}quiz/js/ui.js`);
load(`${ROOT}quiz/js/app.js`);

const sample = QuizFormat.formatRichText('Review:\n```python\ndef foo():\n    return 1\n```\nWhat is wrong?');
assert(sample.includes('code-block'), 'formatRichText should render code blocks');
assert(sample.includes('tok-keyword'), 'formatRichText should highlight keywords');
assert(sample.includes('tok-number'), 'formatRichText should highlight numbers');
assert(!sample.includes('<script>'), 'formatRichText should escape HTML in prose');
const withBuiltin = QuizFormat.formatRichText('```python\nn = len(items)\n```');
assert(withBuiltin.includes('tok-builtin'), 'formatRichText should highlight builtins');

QuizApp.boot().then(() => {
  const chips = document.getElementById('module-chips');
  assert(chips.innerHTML.length > 0, 'module chips should render on init');

  const question = document.getElementById('question-text');
  assert(question.innerHTML.length > 0, 'a question should render on init');
  assert(
    question.textContent !== 'Select at least one section below to start quizzing.',
    'question pool should not be empty on init'
  );

  const options = document.getElementById('options');
  assert(options.innerHTML.includes('option-btn'), 'answer options should render on init');

  const stats = document.getElementById('stats-grid');
  assert(stats.innerHTML.includes('stat-card'), 'section stats should render on init');

  QuizLoader.getAllQuestions().then((all) => {
    assert(all.length === 509, `expected 509 questions, got ${all.length}`);

    const cr = all.filter((q) => q.module === 'CR-REVIEW');
    assert(cr.length === 86, `expected 86 CR-REVIEW questions, got ${cr.length}`);

    const e3 = all.filter((q) => q.module === 'E3');
    assert(e3.length === 18, `expected 18 E3 questions, got ${e3.length}`);

    const spanner = all.filter((q) => q.module === 'B9');
    assert(spanner.length === 15, `expected 15 B9 Spanner questions, got ${spanner.length}`);

    const srPrin = all.filter((q) => q.module === 'SR-PRIN');
    assert(srPrin.length === 24, `expected 24 SR-PRIN questions, got ${srPrin.length}`);

    QuizEngine.init(all, new Set(['B1']));
    const q = QuizEngine.pickRandom();
    assert(q && q.module === 'B1', 'engine should pick from enabled module');

    const remainingEl = document.getElementById('pool-remaining');
    assert(
      remainingEl.textContent.includes('remaining'),
      'pool remaining should display in score bar on init'
    );

    const b1Ids = all.filter((q) => q.module === 'B1').map((q) => q.id);
    QuizStorage.clearProgress();
    QuizEngine.init(all, new Set(['B1']), new Set(b1Ids));
    for (const id of b1Ids) {
      QuizStorage.recordAnswer(id, true, 'B1');
    }
    assert(QuizEngine.pickRandom() === null, 'engine should not repeat answered questions');
    assert(QuizEngine.remainingCount() === 0, 'remaining count should be zero when pool exhausted');

    const pool = QuizStorage.getEnabledPoolProgress({ B1: b1Ids }, new Set(['B1']));
    assert(pool.remaining === 0 && pool.total === b1Ids.length, 'pool progress should track remaining');

    print('PASS: quiz init smoke tests');
  }).catch((err) => fail(err.stack || String(err)));
}).catch((err) => fail(err.stack || String(err)));
