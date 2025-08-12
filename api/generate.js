// api/generate.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { prompt, width = 1024, height = 1024, seed } = req.body;

    const apiKey = process.env.STABILITY_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Falta la API Key de Stability' });
    }

    // Preparar datos para Stability API
    const form = new FormData();
    form.append('prompt', prompt);
    form.append('width', width);
    form.append('height', height);
    if (seed) form.append('seed', seed);

    const response = await fetch(
      'https://api.stability.ai/v2beta/stable-image/generate/core',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: form,
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const imageBuffer = await response.arrayBuffer();

    // Enviar la imagen en formato PNG
    res.setHeader('Content-Type', 'image/png');
    res.status(200).send(Buffer.from(imageBuffer));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
