// api/generate.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { prompt, width = 1024, height = 1024, seed, negative_prompt } = req.body || {};
    const apiKey = process.env.STABILITY_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Falta STABILITY_API_KEY en Vercel' });
    }

    if (!prompt) {
      return res.status(400).json({ error: 'Falta prompt' });
    }

    const form = new FormData();
    form.append('prompt', prompt);
    form.append('width', String(width));
    form.append('height', String(height));
    if (seed !== undefined) form.append('seed', String(seed));
    if (negative_prompt) form.append('negative_prompt', negative_prompt);

    const response = await fetch(
      'https://api.stability.ai/v2beta/stable-image/generate/core',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'image/png', // <-- Aquí pedimos PNG explícitamente
        },
        body: form,
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    // Convertimos imagen a base64
    const imageBuffer = Buffer.from(await response.arrayBuffer());
    const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;

    return res.status(200).json({ image: base64Image });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
