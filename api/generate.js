export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { prompt, negative_prompt, width = 1024, height = 1024, seed } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

    const apiKey = process.env.STABILITY_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Missing STABILITY_API_KEY' });

    const form = new FormData();
    form.append('prompt', prompt);
    if (negative_prompt) form.append('negative_prompt', negative_prompt);
    form.append('output_format', 'png');
    form.append('width', String(width));
    form.append('height', String(height));
    if (seed !== undefined) form.append('seed', String(seed));

    const resp = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Accept': 'image/png' },
      body: form,
    });

    if (!resp.ok) {
      const text = await resp.text();
      return res.status(resp.status).json({ error: text });
    }

    const buf = Buffer.from(await resp.arrayBuffer());
    const b64 = `data:image/png;base64,${buf.toString('base64')}`;
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({ image: b64 });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
