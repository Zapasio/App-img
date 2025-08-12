<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>ByZaPa – Generador de Imágenes IA</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
  <style>
    :root{
      --bg:#0b0b10; --panel:#14141c; --muted:#9aa0a6; --text:#f4f6fb;
      --grad: linear-gradient(135deg,#8a5cff, #00d4ff);
      --primaryA:#8a5cff; --primaryB:#00d4ff; --ok:#26d07c; --err:#ff647c;
      --ring: 0 0 0 3px rgba(138,92,255,.25);
    }
    *{box-sizing:border-box}
    html,body{height:100%}
    body{
      margin:0; font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial;
      color:var(--text); background:
        radial-gradient(1000px 600px at 10% -10%, rgba(138,92,255,.18), transparent 60%),
        radial-gradient(900px 500px at 110% 10%, rgba(0,212,255,.14), transparent 60%),
        var(--bg);
    }

    .wrap{max-width:1100px;margin:0 auto;padding:24px}
    .nav{
      display:flex; align-items:center; justify-content:space-between;
      gap:16px; padding:10px 0;
    }
    .brand{
      display:flex; align-items:center; gap:12px; font-weight:800; letter-spacing:.3px;
    }
    .logo{
      width:36px;height:36px;border-radius:10px;background:var(--grad);
      box-shadow:0 6px 20px rgba(138,92,255,.35), 0 2px 10px rgba(0,212,255,.25);
    }
    .badge{font-size:.78rem;color:var(--muted);border:1px solid #232334;padding:4px 8px;border-radius:999px}

    .hero{
      margin-top:14px; display:grid; gap:18px;
      grid-template-columns:1.1fr .9fr;
    }
    @media (max-width:900px){ .hero{grid-template-columns:1fr} }

    .card{
      background:linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,.00));
      border:1px solid #232334; border-radius:16px; padding:16px;
      box-shadow: 0 8px 30px rgba(0,0,0,.35);
      backdrop-filter:saturate(120%) blur(2px);
    }
    .title{font-size:clamp(1.5rem,2.5vw,2.1rem);font-weight:800;margin:2px 0 8px}
    .subtitle{color:var(--muted);font-size:.95rem}

    .row{display:grid; gap:10px; grid-template-columns:1fr 1fr}
    .row-3{grid-template-columns:1fr 1fr 1fr}
    .row > *{min-width:0}
    @media (max-width:700px){ .row,.row-3{grid-template-columns:1fr} }

    textarea,input,select{
      width:100%; color:var(--text); background:#0f0f16; border:1px solid #232334;
      border-radius:12px; padding:12px 14px; font-size:1rem; outline:none;
      transition:border .15s, box-shadow .15s, transform .03s;
    }
    textarea{min-height:120px; resize:vertical}
    textarea:focus, input:focus, select:focus{border-color:#3b3bf5; box-shadow: var(--ring)}
    label{font-size:.88rem;color:#c6c8ce;margin:2px 2px 6px;display:block}

    .chips{display:flex; gap:8px; flex-wrap:wrap; margin-top:6px}
    .chip{
      background:#151525; color:#cfd3ff; border:1px solid #232334; padding:8px 10px;
      border-radius:999px; font-size:.85rem; cursor:pointer; transition:transform .1s, border .2s;
    }
    .chip:hover{transform:translateY(-1px); border-color:#3940ff}
    .actions{display:flex; gap:10px; flex-wrap:wrap; align-items:center; margin-top:10px}

    .btn{
      border:0; color:white; font-weight:700; padding:12px 18px; border-radius:12px; cursor:pointer;
      background:var(--grad);
      box-shadow: 0 10px 30px rgba(138,92,255,.35), 0 8px 28px rgba(0,212,255,.25);
      transition:transform .08s ease, box-shadow .2s ease, filter .2s ease;
    }
    .btn:hover{transform:translateY(-1px); filter:brightness(1.05)}
    .btn.secondary{
      background:#1b1b27; color:#e8ecff; box-shadow:none; border:1px solid #2a2a3c;
    }
    .btn.ghost{background:transparent; color:#cfd3ff; border:1px dashed #2f2f43}

    .status{font-size:.9rem}
    .status.ok{color:var(--ok)} .status.err{color:var(--err)} .status.muted{color:var(--muted)}

    .preview.card{display:flex; align-items:center; justify-content:center; min-height:320px; position:relative; overflow:hidden}
    .preview img{max-width:100%; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,.45); opacity:0; transform:scale(1.01); transition:opacity .35s ease, transform .35s ease}
    .preview img.show{opacity:1; transform:scale(1)}
    .placeholder{color:#9aa0a6; text-align:center}

    .loader{
      --s:56px;
      width:var(--s);height:var(--s);
      border-radius:50%; border:5px solid #27273d; border-top-color:#8a5cff; border-right-color:#00d4ff;
      animation:spin 1s linear infinite; margin:auto;
      box-shadow: 0 0 18px rgba(138,92,255,.35), inset 0 0 12px rgba(0,212,255,.15);
    }
    @keyframes spin{to{transform:rotate(360deg)}}

    .gallery{margin-top:18px;display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax(170px,1fr))}
    .thumb{position:relative;border:1px solid #26263a;border-radius:12px;overflow:hidden;background:#0f0f16}
    .thumb img{width:100%;display:block}
    .thumb .bar{position:absolute;inset:auto 0 0 0;display:flex;gap:6px;justify-content:space-between;padding:6px;background:linear-gradient(180deg,transparent,rgba(0,0,0,.55))}
    .miniBtn{
      border:0; font-size:.8rem; padding:6px 8px; border-radius:8px; cursor:pointer; color:#eaf1ff;
      background:rgba(20,20,32,.6); border:1px solid #2c2c40
    }
    .miniBtn:hover{background:rgba(20,20,32,.8)}
    .hint{font-size:.82rem;color:#8e93a1;margin-top:8px}
    footer{opacity:.6;margin:28px 0;text-align:center;font-size:.85rem}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="nav">
      <div class="brand">
        <div class="logo" aria-hidden="true"></div>
        <div>ByZaPa — <span style="color:#bcd1ff">Generador IA</span></div>
      </div>
      <div class="badge">SDXL Core (Stability)</div>
    </div>

    <section class="hero">
      <!-- IZQUIERDA: controles -->
      <div class="card">
        <h1 class="title">Crea imágenes 🔥 en segundos</h1>
        <p class="subtitle">Escribe un prompt potente. Prueba con estilos, planos, lentes, iluminación, etc.</p>

        <label for="prompt">Descripción (prompt)</label>
        <textarea id="prompt" placeholder="p.ej. retrato hiperrealista de un guerrero vikingo, luz cinematográfica, 85mm, detalle épico"></textarea>

        <div class="chips" id="chips">
          <button class="chip" data-val="logo ByZaPa 3D, neón morado y cian, fondo oscuro, estilo cyberpunk">Logo 3D cyberpunk</button>
          <button class="chip" data-val="fútbol hiperrealista, estadio nocturno, lluvia, bokeh, 8k">Fútbol 8K</button>
          <button class="chip" data-val="retrato cinematográfico, luz Rembrandt, 50mm, piel detallada">Retrato cine</button>
          <button class="chip" data-val="ilustración isométrica de ciudad futurista, neón, lluvia, reflejos">Isométrico sci-fi</button>
        </div>

        <div class="row-3" style="margin-top:10px">
          <div>
            <label for="size">Tamaño</label>
            <select id="size">
              <option value="1024x1024">1024×1024</option>
              <option value="896x1152">896×1152 (vertical)</option>
              <option value="1152x896">1152×896 (horizontal)</option>
            </select>
          </div>
          <div>
            <label for="seed">Semilla (opcional)</label>
            <input id="seed" placeholder="aleatoria" inputmode="numeric" />
          </div>
          <div>
            <label for="neg">Negativos (opcional)</label>
            <input id="neg" placeholder="baja calidad, manos malformadas, ruido…" />
          </div>
        </div>

        <div class="actions">
          <button id="btnGen" class="btn">⚡ Generar</button>
          <button id="btnShare" class="btn secondary" disabled>Compartir</button>
          <button id="btnDownload" class="btn ghost" disabled>Descargar PNG</button>
          <span id="status" class="status muted">Listo</span>
        </div>
        <p class="hint">Consejo: añade tu marca, ej. <b>“logo ByZaPa integrado en el entorno”</b>.</p>
      </div>

      <!-- DERECHA: preview -->
      <div class="card preview" id="preview">
        <div class="placeholder" id="placeholder">Tu imagen aparecerá aquí 👇</div>
      </div>
    </section>

    <section id="gallery" class="gallery"></section>

    <footer>© ByZaPa — hecho con Stability AI • Comparte si te mola 😎</footer>
  </div>

  <script>
    const $ = s => document.querySelector(s);
    const promptEl = $('#prompt');
    const chips = $('#chips');
    const sizeEl = $('#size');
    const seedEl = $('#seed');
    const negEl = $('#neg');
    const btnGen = $('#btnGen');
    const btnDownload = $('#btnDownload');
    const btnShare = $('#btnShare');
    const statusEl = $('#status');
    const preview = $('#preview');
    const placeholder = $('#placeholder');
    const gallery = $('#gallery');

    let lastDataURL = null;

    chips.addEventListener('click', (e)=>{
      if(e.target.classList.contains('chip')) {
        promptEl.value = e.target.dataset.val;
      }
    });

    function setStatus(text, type='muted'){
      statusEl.textContent = text;
      statusEl.className = 'status ' + type;
    }

    function setLoading(loading){
      if(loading){
        preview.innerHTML = '<div class="loader" aria-label="Generando..."></div>';
        btnGen.disabled = true;
        btnDownload.disabled = true;
        btnShare.disabled = true;
        setStatus('Generando…', 'muted');
      } else {
        btnGen.disabled = false;
      }
    }

    function dims(){
      const [w,h] = sizeEl.value.split('x').map(n=>parseInt(n,10));
      return {width:w, height:h};
    }

    async function generate(){
      const prompt = (promptEl.value || '').trim();
      if(!prompt){ promptEl.focus(); setStatus('Escribe un prompt', 'err'); return; }

      setLoading(true);
      try{
        const {width,height} = dims();
        const seed = seedEl.value ? Number(seedEl.value) : undefined;
        const negative_prompt = negEl.value || undefined;

        const resp = await fetch('/api/generate', {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ prompt, width, height, seed, negative_prompt })
        });

        const data = await resp.json().catch(()=> ({}));
        if(!resp.ok || !data?.image){
          const msg = (data && (data.error || data.message)) || 'Error desconocido';
          throw new Error(msg);
        }

        lastDataURL = data.image;
        const img = new Image();
        img.onload = ()=>{
          preview.innerHTML = '';
          img.classList.add('show');
          preview.appendChild(img);
          btnDownload.disabled = false;
          btnShare.disabled = false;
          setStatus('¡Listo!', 'ok');
          // añade a galería
          addToGallery(lastDataURL, prompt);
        };
        img.src = lastDataURL;
      }catch(err){
        console.error(err);
        preview.innerHTML = '';
        preview.appendChild(placeholder);
        placeholder.textContent = 'Error: ' + (err.message || err);
        setStatus('Falló la generación', 'err');
      }finally{
        setLoading(false);
      }
    }

    function addToGallery(dataURL, alt){
      const card = document.createElement('div');
      card.className = 'thumb';
      card.innerHTML = `
        <img src="${dataURL}" alt="${alt.replace(/"/g,'&quot;')}" loading="lazy"/>
        <div class="bar">
          <button class="miniBtn" data-dl>Descargar</button>
          <button class="miniBtn" data-share>Compartir</button>
        </div>`;
      card.querySelector('[data-dl]').onclick = ()=> downloadDataURL(dataURL);
      card.querySelector('[data-share]').onclick = ()=> shareDataURL(dataURL, alt);
      gallery.prepend(card);
    }

    function downloadDataURL(dataURL, filename='byzapa.png'){
      const a=document.createElement('a');
      a.href=dataURL; a.download=filename; document.body.appendChild(a);
      a.click(); a.remove();
    }

    async function shareDataURL(dataURL, text='Creado con ByZaPa'){
      try{
        if(navigator.canShare && navigator.canShare({ files: [] })){
          const res = await fetch(dataURL);
          const blob = await res.blob();
          const file = new File([blob], 'byzapa.png', {type: blob.type || 'image/png'});
          await navigator.share({ files:[file], text, title:'ByZaPa' });
        }else if(navigator.share){
          await navigator.share({ url: dataURL, text, title:'ByZaPa' });
        }else{
          await navigator.clipboard.writeText(dataURL);
          alert('Enlace copiado. ¡Pega y comparte!');
        }
      }catch(e){ console.log('Share cancelado o error', e); }
    }

    btnGen.addEventListener('click', generate);
    btnDownload.addEventListener('click', ()=> lastDataURL && downloadDataURL(lastDataURL));
    btnShare.addEventListener('click', ()=> lastDataURL && shareDataURL(lastDataURL, promptEl.value || 'ByZaPa'));
    // Enter para generar
    promptEl.addEventListener('keydown', e=>{
      if((e.ctrlKey || e.metaKey) && e.key.toLowerCase()==='enter'){ generate(); }
    });

    // Placeholder inicial
    preview.innerHTML = ''; preview.appendChild(placeholder);
  </script>
</body>
</html>
