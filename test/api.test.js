import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/generate.js';

function mockRes() {
  return {
    statusCode: 200,
    headers: {},
    data: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.data = payload; return this; },
    setHeader(name, value) { this.headers[name] = value; },
    send(payload) { this.data = payload; return this; }
  };
}

test('returns 405 for non-POST', async () => {
  const req = { method: 'GET' };
  const res = mockRes();
  await handler(req, res);
  assert.equal(res.statusCode, 405);
  assert.deepEqual(res.data, { error: 'Method not allowed' });
});

test('returns error when missing API key', async () => {
  const req = { method: 'POST', body: { prompt: 'hi' } };
  const res = mockRes();
  delete process.env.STABILITY_API_KEY;
  await handler(req, res);
  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.data, { error: 'Missing STABILITY_API_KEY' });
});

test('returns base64 image on success', async () => {
  const req = { method: 'POST', body: { prompt: 'hi', width: 256, height: 256 } };
  const res = mockRes();
  process.env.STABILITY_API_KEY = 'test';
  const originalFetch = global.fetch;
  const fakePng = new Uint8Array([137,80,78,71]);
  global.fetch = async () => ({
    ok: true,
    status: 200,
    arrayBuffer: async () => fakePng.buffer
  });
  try {
    await handler(req, res);
  } finally {
    global.fetch = originalFetch;
  }
  assert.equal(res.statusCode, 200);
  assert.ok(typeof res.data.image === 'string');
  assert.ok(res.data.image.startsWith('data:image/png;base64,'));
});
