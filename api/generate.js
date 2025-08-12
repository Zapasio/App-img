// Fuerza runtime Node.js (Vercel usa Node 18 por defecto)
export const config = { runtime: 'nodejs' };

// Lectura segura del body
async function readJsonBody(req) {
  try {
    if (req.body && typeof req.body === 'object') return req.body;
    if (req.body && typeof req.body === 'string') return JSON.parse(req.body);
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const raw = Buffer.concat(chunks).toString('utf8');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Body parse error:', e);
    return {};
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { prompt, width = 1024, height = 1024, seed, negative_prompt } = await readJsonBody(req);

    const apiKey = process.env.STABILITY_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Falta STABILITY_API_KEY en Vercel' });
    if (!prompt) return res.status(400).json({ error: 'Falta prompt' });

    const form = new FormData();
    form.append('prompt', prompt);
    form.append('width', String(width));
    form.append('height', String(height));
    if (seed !== undefined) form.append('seed', String(seed));
    if (negative_prompt) form.append('negative_prompt', negative_prompt);

    const resp = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'image/*',
      },
      body: form,
    });

    const ct = resp.headers.get('content-type') || '';

    if (resp.ok && ct.startsWith('image/')) {
      const buf = Buffer.from(await resp.arrayBuffer());
      const dataUrl = `data:${ct};base64,${buf.toString('base64')}`;
      return res.status(200).json({ image: dataUrl });
    }

    let payload;
    try {
      payload = await resp.json();
    } catch {
      payload = { error: await resp.text() };
    }
    console.error('Stability error:', resp.status, payload);
    return res.status(resp.status || 500).json({ error: payload?.error || payload || 'Error generando imagen' });
  } catch (e) {
    console.error('Handler crash:', e);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
