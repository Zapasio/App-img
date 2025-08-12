// api/generate.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { prompt, width = 1024, height = 1024, seed, negative_prompt } = req.body || {};
    const apiKey = process.env.STABILITY_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Falta STABILITY_API_KEY en Vercel' });
    if (!prompt) return res.status(400).json({ error: 'Falta prompt' });

    // Construir payload para Stability
    const form = new FormData();
    form.append('prompt', prompt);
    form.append('width', String(width));
    form.append('height', String(height));
    if (seed !== undefined) form.append('seed', String(seed));
    if (negative_prompt) form.append('negative_prompt', negative_prompt);
    // form.append('output_format', 'png'); // opcional

    // Pedimos imagen; si el backend decide mandar JSON, lo manejamos abajo.
    const resp = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'image/*', // <- LO CORRECTO según el error que recibías
      },
      body: form,
    });

    const ct = resp.headers.get('content-type') || '';

    // Caso 1: llega imagen (png/jpeg)
    if (resp.ok && ct.startsWith('image/')) {
      const buf = Buffer.from(await resp.arrayBuffer());
      const dataUrl = `data:${ct};base64,${buf.toString('base64')}`;
      return res.status(200).json({ image: dataUrl });
    }

    // Caso 2: llega JSON (algunos modelos/errores)
    const json = await resp.json().catch(async () => {
      // Por si el server devuelve texto plano
      const txt = await resp.text();
      return { error: txt || 'Respuesta inesperada de Stability' };
    });

    // Si trae base64 en algún campo conocido, lo convertimos
    if (json?.image) {
      return res.status(200).json({ image: `data:image/png;base64,${json.image}` });
    }
    if (Array.isArray(json?.artifacts) && json.artifacts[0]?.base64) {
      return res.status(200).json({ image: `data:image/png;base64,${json.artifacts[
