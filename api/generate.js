// api/generate.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.STABILITY_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing STABILITY_API_KEY' });
    }

    // Viene en JSON desde la UI
    const {
      prompt,
      negative_prompt = '',
      style = 'none',          // valores de la UI
      quality = 'estandar',    // 'rapida' | 'estandar' | 'alta'
      aspect_ratio = '1:1',    // '1:1','16:9', etc.
      width,
      height,
      seed                      // opcional
    } = req.body || {};
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Mapear UI -> API Stability (SD3)
    const styleMap = {
      'none': undefined,
      'sin preset': undefined,
      'ninguno': undefined,
      'realista': 'photographic',
      'cinematografico': 'cinematic',
      'cinematográfico': 'cinematic',
      'arte digital': 'digital-art',
      'arte-digital': 'digital-art',
      'pixel art': 'pixel-art',
      'pixel': 'pixel-art',
      'producto': 'product-photo',
      'retrato': 'portrait',
      'arquitectura': 'architecture',
      'anime': 'anime',
      'fantasia': 'fantasy-art',
      'fantasía': 'fantasy-art',
      '3d': '3d-model',
      'line art': 'line-art',
      'ilustracion': 'illustration',
      'ilustración': 'illustration',
      'analogico': 'analog-film',
      'analógico': 'analog-film',
      'neon': 'neon-punk',
      'isometrico': 'isometric',
      'isométrico': 'isometric',
      'low poly': 'low-poly',
      'mosaico': 'tile-texture'
    };

    const arMap = {
      '1:1': '1:1',
      '16:9': '16:9',
      '21:9': '21:9',
      '3:2': '3:2',
      '2:3': '2:3',
      '4:5': '4:5',
      '5:4': '5:4',
      '9:16': '9:16',
      '9:21': '9:21'
    };

    // En SD3 el modo suele aceptarse como 'speed' (rápida) o 'quality'
    const qualityMap = {
      'rapida': 'speed',
      'rápida': 'speed',
      'fast': 'speed',
      'estandar': 'quality',
      'estándar': 'quality',
      'standard': 'quality',
      'alta': 'quality'
    };

    const body = {
      prompt,
      negative_prompt,
      output_format: 'png',
      ...(width && height
          ? { width: Number(width), height: Number(height) }
          : { aspect_ratio: arMap[(aspect_ratio || '').toString().trim()] || '1:1' }),
      mode: qualityMap[(quality || '').toString().toLowerCase()] || 'quality',
      ...(styleMap[(style || '').toString().toLowerCase()]
          ? { style_preset: styleMap[(style || '').toString().toLowerCase()] }
          : {}),
      ...(seed !== undefined && seed !== '' ? { seed: Number(seed) } : {}),
    };

    const response = await fetch(
      'https://api.stability.ai/v2beta/stable-image/generate/sd3',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'image/*'
        },
        body: JSON.stringify(body)
      }
    );

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return res.status(response.status).json({
        error: 'stability_error',
        details: errText
      });
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const base64 = buffer.toString('base64');
    res.status(200).json({ image: `data:image/png;base64,${base64}` });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server_error', message: e.message });
  }
}
