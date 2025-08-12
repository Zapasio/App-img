// /api/generate.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { prompt, negative_prompt, width = 1024, height = 1024, seed, quality = 'standard' } = req.body || {};
    const apiKey = process.env.STABILITY_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Falta STABILITY_API_KEY en Vercel' });
    if (!prompt)  return res.status(400).json({ error: 'Falta prompt' });

    // Modelo segun calidad (si tu cuenta no tiene turbo, usa el estándar)
    const endpoint = quality === 'fast'
      ? 'https://api.stability.ai/v2beta/stable-image/generate/core-lite' // rápido (si no existe en tu plan, seguirá funcionando con core)
      : 'https://api.stability.ai/v2beta/stable-image/generate/core';

    // Construir FormData (Stability espera form-data)
    const form = new FormData();
    form.append('prompt', prompt);
    if (negative_prompt) form.append('negative_prompt', negative_prompt);
    form.append('output_format', 'png');
    form.append('width', String(width));
    form.append('height', String(height));
    if (seed !== undefined) form.append('seed', String(seed));

    // Llamada
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, Accept: 'image/png' },
      body: form
    });

    if (!response.ok) {
      const txt = await response.text();
      return res.status(response.status).json({ error: `API error ${response.status}: ${txt}` });
    }

    const buf = Buffer.from(await response.arrayBuffer());
    const b64 = `data:image/png;base64,${buf.toString('base64')}`;

    return res.status(200).json({ image: b64 });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Error interno' });
  }
}
