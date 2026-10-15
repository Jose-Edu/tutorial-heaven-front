import test from 'node:test';
import assert from 'node:assert/strict';

import {
  decodeMarkdownBase64,
  encodeMarkdownBase64,
  getArticles,
  normalizeArticle,
} from '../lib/articles';

test('encodes and decodes UTF-8 markdown with accents and emoji', () => {
  const markdown = '# Olá, mundo! 👋\n\nConteúdo com ação e coração 💙.';
  const encoded = encodeMarkdownBase64(markdown);
  const decoded = decodeMarkdownBase64(encoded);

  assert.equal(decoded, markdown);
  assert.notEqual(encoded, markdown);
});

test('rejects invalid base64 and invalid utf-8 payloads', () => {
  assert.throws(() => decodeMarkdownBase64('%%%'), /Base64 válido/i);

  const invalidUtf8 = Buffer.from([0xff, 0xfe, 0xff]).toString('base64');
  assert.throws(() => decodeMarkdownBase64(invalidUtf8), /UTF-8/i);
});

test('derives article metadata from markdown when title and description are absent', () => {
  const payload = {
    id: 42,
    content: encodeMarkdownBase64('# Primeiro artigo\n\nResumo curta e útil.'),
    created_at: '2026-10-12T00:00:00.000000Z',
    updated_at: '2026-10-12T00:00:00.000000Z',
  };

  const article = normalizeArticle(payload);
  assert.ok(article);
  assert.equal(article?.title, 'Primeiro artigo');
  assert.equal(article?.description, 'Resumo curta e útil.');
  assert.equal(article?.content, '# Primeiro artigo\n\nResumo curta e útil.');
});

test('reads paginated article list from Laravel data envelope', async () => {
  const markdown = '# Artigo com acentos e emoji 🚀\n\nTexto legal.';
  const oldFetch = globalThis.fetch;

  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        data: [{
          id: 5,
          content: encodeMarkdownBase64(markdown),
          created_at: '2026-10-12T00:00:00.000000Z',
          updated_at: '2026-10-12T00:00:00.000000Z',
        }],
        links: { first: 'http://localhost/articles?page=1', last: 'http://localhost/articles?page=1' },
        meta: { current_page: 1, last_page: 1 },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );

  try {
    const articles = await getArticles();
    assert.equal(articles.length, 1);
    assert.equal(articles[0].id, '5');
    assert.equal(articles[0].title, 'Artigo com acentos e emoji 🚀');
    assert.equal(articles[0].description, 'Texto legal.');
  } finally {
    globalThis.fetch = oldFetch;
  }
});
