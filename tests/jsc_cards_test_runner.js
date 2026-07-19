/* Queue + engine smoke tests for flash cards (JavaScriptCore). */
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

globalThis.location = {
  href: `file://${ROOT}cards/index.html`,
  pathname: '/GSRE/cards/',
  origin: 'file://',
  search: '',
};

globalThis.document = {
  readyState: 'complete',
  getElementById() { return null; },
  addEventListener() {},
  querySelector(selector) {
    if (selector.includes('cards-loader.js')) {
      return { src: `file://${ROOT}quiz/js/cards-loader.js` };
    }
    return null;
  },
  querySelectorAll() { return []; },
};

function fail(msg) {
  print(`FAIL: ${msg}`);
  quit(1);
}

function assert(cond, msg) {
  if (!cond) fail(msg);
}

load(`${ROOT}quiz/js/cards-loader.js`);
load(`${ROOT}quiz/js/cards-storage.js`);
load(`${ROOT}quiz/js/cards-engine.js`);

assert(CardsEngine.insertIndexForRating(10, 1) === 1, 'rating 1 insert');
assert(CardsEngine.insertIndexForRating(10, 2) === 3, 'rating 2 insert');
assert(CardsEngine.insertIndexForRating(10, 3) === 10, 'rating 3 insert');
assert(CardsEngine.insertIndexForRating(10, 4) === null, 'rating 4 mastered');
assert(CardsEngine.insertIndexForRating(0, 1) === 0, 'empty queue rating 1');
assert(CardsEngine.insertIndexForRating(2, 2) === 2, 'short queue rating 2');

const sample = [
  { id: 'A', deck: 'core', front: 'q1', back: 'a1' },
  { id: 'B', deck: 'core', front: 'q2', back: 'a2' },
  { id: 'C', deck: 'core', front: 'q3', back: 'a3' },
  { id: 'D', deck: 'core', front: 'q4', back: 'a4' },
];

CardsEngine.init(sample);
assert(CardsEngine.totalCount() === 4, 'total');
assert(CardsEngine.remainingCount() === 4, 'remaining before advance');
const first = CardsEngine.advance();
assert(first && first.id, 'advanced to a card');
assert(CardsEngine.remainingCount() === 4, 'current counts as remaining');
assert(!CardsEngine.isFlipped(), 'starts unflipped');
CardsEngine.flip();
assert(CardsEngine.isFlipped(), 'flipped');

const beforeId = CardsEngine.current().id;
CardsEngine.rate(3);
assert(CardsEngine.current() && CardsEngine.current().id !== beforeId, 'moved after confident');
assert(CardsEngine.masteredCount() === 0, 'confident not mastered');

let guard = 0;
while (!CardsEngine.isComplete() && guard < 50) {
  if (!CardsEngine.current()) CardsEngine.advance();
  if (!CardsEngine.current()) break;
  if (!CardsEngine.isFlipped()) CardsEngine.flip();
  CardsEngine.rate(4);
  guard++;
}
assert(CardsEngine.isComplete(), 'all very confident completes');
assert(CardsEngine.masteredCount() === 4, 'all mastered');

print('PASS cards engine smoke');
