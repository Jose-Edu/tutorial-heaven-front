import test from 'node:test';
import assert from 'node:assert/strict';

import { getTagSteps, getTags } from '../lib/tags';

test('reads fixed step structure from Laravel tags steps payload', async () => {
  const oldFetch = globalThis.fetch;

  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        data: {
          step_1: {
            title: 'Área de Atuação',
            category: 'area',
            tags: [{ id: 1, name: 'Desenvolvimento Web', category: 'area' }],
          },
          step_2: {
            title: 'Tecnologias e Stacks',
            category: 'technology',
            tags: [],
          },
          step_3: {
            title: 'Sênioridade / Experiência',
            category: 'seniority',
            tags: [],
          },
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );

  try {
    const steps = await getTagSteps();
    assert.deepEqual(steps.map((step) => step.id), ['step_1', 'step_2', 'step_3']);
    assert.equal(steps[0].label, 'Área de Atuação');
    assert.ok(steps[0].aliases.includes('step_1'));
    assert.ok(steps[0].aliases.includes('area'));
  } finally {
    globalThis.fetch = oldFetch;
  }
});

test('reads tag list from Laravel data envelope and keeps empty categories compatible', async () => {
  const oldFetch = globalThis.fetch;

  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        data: [
          { id: 7, name: 'Desenvolvimento Web', category: 'area' },
          { id: 8, name: 'Node.js', category: 'technology' },
        ],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );

  try {
    const tags = await getTags();
    assert.deepEqual(tags.map((tag) => tag.id), ['7', '8']);
    assert.deepEqual(tags[0].groupIds, ['area']);
    assert.deepEqual(tags[1].groupIds, ['technology']);
  } finally {
    globalThis.fetch = oldFetch;
  }
});
