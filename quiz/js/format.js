const QuizFormat = (() => {
  const PY_KEYWORDS =
    /\b(?:def|class|return|if|elif|else|for|while|try|except|finally|with|as|import|from|pass|raise|lambda|True|False|None|and|or|not|in|is|global|nonlocal|yield|async|await|break|continue)\b/g;

  const FENCE_RE = /```(?:python|py)?\s*\n([\s\S]*?)```/gi;

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function highlightPython(source) {
    const tokenRe =
      /('''[\s\S]*?'''|"""[\s\S]*?"""|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|#.*|\b\d+(?:\.\d+)?\b)/g;
    const parts = [];
    let last = 0;
    let match;

    while ((match = tokenRe.exec(source)) !== null) {
      if (match.index > last) {
        parts.push(wrapPlain(source.slice(last, match.index)));
      }
      const token = match[0];
      if (token.startsWith('#')) {
        parts.push(`<span class="tok-comment">${escapeHtml(token)}</span>`);
      } else if (
        token.startsWith("'") ||
        token.startsWith('"') ||
        token.startsWith("'''") ||
        token.startsWith('"""')
      ) {
        parts.push(`<span class="tok-string">${escapeHtml(token)}</span>`);
      } else if (/^\d/.test(token)) {
        parts.push(`<span class="tok-number">${escapeHtml(token)}</span>`);
      } else {
        parts.push(wrapPlain(token));
      }
      last = match.index + token.length;
    }

    if (last < source.length) {
      parts.push(wrapPlain(source.slice(last)));
    }

    return parts.join('');
  }

  function wrapPlain(text) {
    return escapeHtml(text).replace(PY_KEYWORDS, '<span class="tok-keyword">$&</span>');
  }

  function codeBlock(code) {
    const trimmed = String(code).replace(/\n$/, '');
    return `<pre class="code-block" tabindex="0"><code class="language-python">${highlightPython(trimmed)}</code></pre>`;
  }

  function formatRichText(text) {
    if (!text) return '';
    if (!text.includes('```')) {
      return `<p class="question-prose">${escapeHtml(text)}</p>`;
    }

    let html = '';
    let lastIndex = 0;
    const re = new RegExp(FENCE_RE.source, FENCE_RE.flags);
    let match;

    while ((match = re.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const prose = text.slice(lastIndex, match.index).trim();
        if (prose) html += `<p class="question-prose">${escapeHtml(prose)}</p>`;
      }
      html += codeBlock(match[1]);
      lastIndex = re.lastIndex;
    }

    const tail = text.slice(lastIndex).trim();
    if (tail) html += `<p class="question-prose">${escapeHtml(tail)}</p>`;
    return html;
  }

  return {
    escapeHtml,
    highlightPython,
    formatRichText,
    codeBlock,
  };
})();
