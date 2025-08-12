// /api/generate.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const {
      prompt,
      negative_prompt = '',
      style = 'digital-art',        // valores de tu <select>
      quality = 'standard',         // 'standard' | 'high' | 'draft'
      aspect_ratio = '1:1',         // '1:1', '16:9', etc.
      base_size = 1024,             // 512 | 768 | 1024
      seed                          // opcional
    } = req.body || {};

    const apiKey = process.env.STABILITY_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Falta STABILITY_API_KEY en Vercel' });
    }
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'El prompt es obligatorio' });
    }

    // Mapear tus opciones a los presets de Stability (SD3)
    const STYLE_MAP = {
      'realista': 'photographic',
      'cinematico': 'cinematic',
      'cinematografico': 'cinematic',
      'anime': 'anime',
      '3d': '3d-model',
      'pixel-art': 'pixel-art',
      'isometrico': 'isometric',
      'arte-digital': 'digital-art',
      'digital-art': 'digital-art',
      'ilustracion': 'illustration',
    };

    const QUALITY_MAP = {
      'draft': 'draft',         // más rápido
      'standard': 'standard',   // por defecto
      'high': 'high',           // mejor calidad
      'mejor': 'high',
      'estandar': 'standard'
    };

    const style_preset = STYLE_MAP[(style || '').toLowerCase()] || 'digital-art';
    const quality_mapped = QUALITY_MAP[(quality || '').toLowerCase()] || 'standard';

    // SD3 usa aspect_ratio; base_size como ancho base (opcional)
    const form = new FormData();
    form.append('prompt', prompt);
    if (negative_prompt) form.append('negative_prompt', negative_prompt);
    form.append('output_format', 'png');
    form.append('aspect_ratio', aspect_ratio);
    form.append('quality', quality_mapped);
    if (seed !== undefined && seed !== null && String(seed).trim() !== '') {
      form.append('seed', String(seed));
    }
    // Tamaño base: lo pasamos como "width" (SD3 ajustará altura según aspect_ratio)
    if (base_size) form.append('width', String(base_size));
    form.append('style_preset', style_preset);

    // Endpoint SD3 (v2beta)
    const response = await fetch(
      'https://api.stability.ai/v2beta/stable-image/generate/sd3',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/json'
        },
        body: form
      }
    );

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return res.status(response.status).json({
        error: 'Error en Stability',
        detail: errText
      });
    }

    // Devuelve JSON con artifacts[{ base64 }]
    const data = await response.json();
    const b64 = data?.artifacts?.[0]?.base64;
    if (!b64) {
      return res.status(500).json({ error: 'Respuesta sin imagen de Stability' });
    }

    const buf = Buffer.from(b64, 'base64');
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(buf);

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Error interno', detail: String(e) });
  }
}// /api/generate.js
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
