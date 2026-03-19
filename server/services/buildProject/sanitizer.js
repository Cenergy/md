const { HTML_TAGS, BLOCK_TAGS } = require('./config');

function normalizeSwiperIndent(content) {
  return content.replace(/::: swiper([\s\S]*?):::/g, (_, swiperContent) => {
    return `::: swiper${swiperContent.replace(/^[ \t]+/gm, '')}:::`;
  });
}

function escapeUnsafeTag(line) {
  const trimmedLine = line.trimStart();
  if (trimmedLine.startsWith('<')) return line;

  return line.replace(/<([a-zA-Z][a-zA-Z0-9\-\.]*)/g, (match, tagName) => {
    const normalizedTag = tagName.toLowerCase();
    if (!HTML_TAGS.has(normalizedTag) || BLOCK_TAGS.has(normalizedTag)) {
      return `&lt;${tagName}`;
    }
    return match;
  });
}

function sanitizeNonCodePart(contentPart) {
  const normalizedIndent = contentPart.replace(/^[ \t]+(?=<\/?[a-zA-Z])/gm, '');
  return normalizedIndent
    .split(/\r?\n/)
    .map(escapeUnsafeTag)
    .join('\n');
}

function sanitizeContent(content) {
  if (!content) return '';

  const contentWithNormalizedSwiper = normalizeSwiperIndent(content);
  const segments = contentWithNormalizedSwiper.split(/(```[\s\S]*?```|`[^`]*`)/g);

  return segments
    .map(segment => segment.startsWith('`') ? segment : sanitizeNonCodePart(segment))
    .join('');
}

module.exports = {
  normalizeSwiperIndent,
  escapeUnsafeTag,
  sanitizeNonCodePart,
  sanitizeContent
};
