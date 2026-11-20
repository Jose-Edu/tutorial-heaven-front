import test from 'node:test';
import assert from 'node:assert/strict';

import {
  decodeMarkdownBase64,
  encodeMarkdownBase64,
  getArticles,
  getRecommendedArticles,
  createArticle,
  normalizeArticle,
  updateArticle,
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

test('normalizes article tags for preselection in the editor', () => {
  const article = normalizeArticle({
    id: 12,
    content: encodeMarkdownBase64('# Artigo com tags'),
    tags: [{ id: 4, name: 'PHP / Laravel' }],
  });

  assert.deepEqual(article?.tags, [{ id: '4', name: 'PHP / Laravel' }]);
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

test('loads recommended articles through the recommended search endpoint', async () => {
  const markdown = '# Recomendado\n\nConteúdo para o perfil.';
  const oldFetch = globalThis.fetch;
  let requestedUrl = '';
  let requestedMethod = '';

  globalThis.fetch = async (input, init) => {
    requestedUrl = String(input);
    requestedMethod = init?.method ?? 'GET';
    return new Response(
      JSON.stringify({
        data: [{
          id: 8,
          content: encodeMarkdownBase64(markdown),
          created_at: '2026-10-12T00:00:00.000000Z',
          updated_at: '2026-10-12T00:00:00.000000Z',
        }],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  };

  try {
    const articles = await getRecommendedArticles();
    assert.equal(requestedUrl, '/search/recomendados');
    assert.equal(requestedMethod, 'GET');
    assert.equal(articles[0].id, '8');
    assert.equal(articles[0].title, 'Recomendado');
  } finally {
    globalThis.fetch = oldFetch;
  }
});

test('sends article tags on create and update, including an empty list to clear tags', async () => {
  const oldFetch = globalThis.fetch;
  const requests: Array<{ url: string; method: string; body: Record<string, unknown> }> = [];

  globalThis.fetch = async (input, init) => {
    requests.push({
      url: String(input),
      method: init?.method ?? 'GET',
      body: JSON.parse(String(init?.body)) as Record<string, unknown>,
    });
    return new Response(null, { status: init?.method === 'POST' ? 201 : 200 });
  };

  try {
    await createArticle({ content: '# Novo artigo', tagIds: ['4', '9'] });
    await createArticle({ content: '# Sem tags', tagIds: [] });
    await updateArticle('12', { content: '# Editado', tagIds: [] });

    assert.deepEqual(requests[0], {
      url: '/articles',
      method: 'POST',
      body: { content: encodeMarkdownBase64('# Novo artigo'), tag_ids: [4, 9] },
    });
    assert.deepEqual(requests[1].body, { content: encodeMarkdownBase64('# Sem tags') });
    assert.deepEqual(requests[2], {
      url: '/articles/12',
      method: 'PATCH',
      body: { content: encodeMarkdownBase64('# Editado'), tag_ids: [] },
    });
  } finally {
    globalThis.fetch = oldFetch;
  }
});
