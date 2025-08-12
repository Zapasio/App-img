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
      size = 1024,             // 512 | 768 | 1024
      seed                      // opcional
    } = req.body || {};
nano api/generate.js
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Mapear UI -> API Stability (SD3)
    const styleMap = {
      'none': undefined,
      'sin preset': undefined,
      'realista': 'photographic',
      'cinematografico': 'cinematic',
      'cinematográfico': 'cinematic',
      'arte digital': 'digital-art',
      'pixel art': 'pixel-art',
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
      'estandar': 'quality',
      'estándar': 'quality',
      'alta': 'quality'
    };

    const body = {
      prompt,
      negative_prompt,
      output_format: 'png',
      aspect_ratio: arMap[(aspect_ratio || '').toString().trim()] || '1:1',
      mode: qualityMap[(quality || '').toString().toLowerCase()] || 'quality',
      ...(styleMap[(style || '').toString().toLowerCase()] 
          ? { style_preset: styleMap[(style || '').toString().toLowerCase()] }
          : {}),
      ...(seed !== undefined && seed !== '' ? { seed: Number(seed) } : {}),
      // Algunos planes aceptan 'width/height' en vez de 'size'. SD3 con aspect_ratio
      // no los requiere; si te interesa forzar tamaño, descomenta:
      // width: Number(size), height: Number(size),
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
    res.setHeader('Content-Type', 'image/png');
    res.status(200).send(buffer);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server_error', message: e.message });
  }
}
