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
    // Si quieres forzar PNG: form.append('output_format', 'png');

    // Pedimos respuesta como imagen PNG (es lo que espera este endpoint)
    const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'image/png',
      },
      body: form,
    });

    // Si la API falla, devolvemos el texto/JSON de error tal cual
    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }

    // Convertimos el binario a Base64 y devolvemos JSON { image: dataURL }
    const buf = Buffer.from(await response.arrayBuffer());
    const dataUrl = `data:image/png;base64,${buf.toString('base64')}`;
    return res.status(200).json({ image: dataUrl });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
