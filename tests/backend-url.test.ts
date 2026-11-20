import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveBackendBaseUrl } from '../lib/backend-url';

test('prefers the backend route over the frontend app URL and removes the API prefix', () => {
  assert.equal(
    resolveBackendBaseUrl('http://127.0.0.1:8000/api/', 'http://localhost:3000'),
    'http://127.0.0.1:8000',
  );
});

test('uses APP_URL as a fallback and preserves a backend origin without an API prefix', () => {
  assert.equal(resolveBackendBaseUrl(undefined, 'http://127.0.0.1:8000/'), 'http://127.0.0.1:8000');
});
