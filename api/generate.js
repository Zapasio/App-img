// api/generate.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { prompt, width = 1024, height = 1024, seed, negative_prompt } = req.body;

    const apiKey = process.env.STABILITY_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Falta la clave STABILITY_API_KEY en Vercel' });
    }

    // FormData para Stability API
    const form = new FormData();
    form.append('prompt', prompt);
    form.append('width', width);
    form.append('height', height);
    if (seed) form.append('seed', seed);
    if (negative_prompt) form.append('negative_prompt', negative_prompt);

    // Petición a Stability API
    const resp = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'image/*', // Esto arregla tu error
      },
      body: form,
    });

    // Si Stability devuelve imagen (PNG)
    if (resp.ok && resp.headers.get('content-type')?.startsWith('image/')) {
      const buf = Buffer.from(await resp.arrayBuffer());
      const b64 = `data:image/png;base64,${buf.toString('base64')}`;
      return res.status(200).json({ image: b64 });
    }

    // Si Stability devuelve JSON (error u otro mensaje)
    const errorData = await resp.json().catch(() => ({}));
    return res.status(resp.status).json({
      error: errorData.error || 'Error generando la imagen',
      status: resp.status,
    });

  } catch (err) {
    console.error('Error en API:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
