const response = await fetch(
  'https://api.stability.ai/v2beta/stable-image/generate/core',
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
      Accept: 'image/png'
    },
    body: form,
  }
);
