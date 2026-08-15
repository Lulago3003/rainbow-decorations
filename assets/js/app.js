/* =========================================================
   Rainbow Decorations — interacciones
   ---------------------------------------------------------
   CONFIG: lo único que hay que tocar para cambiar datos.
   ========================================================= */

const CONFIG = {
  // Número de WhatsApp en formato internacional, sin + ni espacios.
  phone: '50760249687',

  // (Opcional) Correo de la dueña para recibir las propuestas CON las fotos
  // adjuntas automáticamente. Ver README.md → "Activar el correo".
  // Déjalo en '' y la web funciona solo con WhatsApp.
  email: ''
};

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------
   PRELOADER
--------------------------------------------------------- */
window.addEventListener('load', () => {
  setTimeout(() => {
    $('#preloader')?.classList.add('is-done');
    $('.hero')?.classList.add('is-in');
    $('.wafab')?.classList.add('is-in');
  }, reduced ? 0 : 550);
});
// Red de seguridad: si 'load' tarda demasiado, no dejamos la pantalla tapada.
setTimeout(() => {
  $('#preloader')?.classList.add('is-done');
  $('.hero')?.classList.add('is-in');
  $('.wafab')?.classList.add('is-in');
}, 3200);

/* ---------------------------------------------------------
   WHATSAPP — arma todos los enlaces data-wa
--------------------------------------------------------- */
const waURL = (text) => `https://wa.me/${CONFIG.phone}?text=${encodeURIComponent(text)}`;

$$('[data-wa]').forEach(el => {
  el.setAttribute('href', waURL(el.dataset.wa));
  el.setAttribute('target', '_blank');
  el.setAttribute('rel', 'noopener');
});

/* ---------------------------------------------------------
   CURSOR PERSONALIZADO
--------------------------------------------------------- */
(() => {
  const cur = $('#cursor');
  if (!cur || reduced || matchMedia('(pointer: coarse)').matches) return;

  const dot = $('.cursor__dot', cur);
  const ring = $('.cursor__ring', cur);
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;

  addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cur.classList.add('is-on');
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;

    const t = e.target.closest('[data-cursor]');
    cur.classList.toggle('is-link', t?.dataset.cursor === 'link');
    cur.classList.toggle('is-zoom', t?.dataset.cursor === 'zoom');
  }, { passive: true });

  addEventListener('mouseleave', () => cur.classList.remove('is-on'));

  (function loop() {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  })();
})();

/* ---------------------------------------------------------
   NAV — sticky, menú móvil, enlace activo, barra de progreso
--------------------------------------------------------- */
(() => {
  const nav = $('#nav');
  const bar = $('#progress i');
  const links = $$('#navLinks a');
  const burger = $('#burger');
  const menu = $('#navLinks');

  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle('is-stuck', y > 30);
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // menú móvil
  const closeMenu = () => {
    menu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-locked');
  };
  burger?.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('is-locked', open);
  });
  links.forEach(a => a.addEventListener('click', closeMenu));
  addEventListener('keydown', e => e.key === 'Escape' && closeMenu());

  // enlace activo según la sección visible
  const sections = links
    .map(a => document.getElementById(a.getAttribute('href').slice(1)))
    .filter(Boolean);

  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${en.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));
})();

/* ---------------------------------------------------------
   REVEAL AL HACER SCROLL
--------------------------------------------------------- */
(() => {
  const items = $$('[data-reveal]');
  if (!items.length) return;
  if (reduced) return items.forEach(el => el.classList.add('is-in'));

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      obs.unobserve(en.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  items.forEach(el => io.observe(el));
})();

/* ---------------------------------------------------------
   CONTADORES
--------------------------------------------------------- */
(() => {
  const els = $$('[data-count]');
  if (!els.length) return;

  const run = el => {
    const end = +el.dataset.count;
    if (reduced) return el.textContent = `+${end.toLocaleString('es-PA')}`;
    const dur = 1500, t0 = performance.now();
    const step = now => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = `+${Math.round(end * eased).toLocaleString('es-PA')}`;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      run(en.target);
      obs.unobserve(en.target);
    });
  }, { threshold: 0.6 });
  els.forEach(el => io.observe(el));
})();

/* ---------------------------------------------------------
   GLOBOS FLOTANTES DEL HERO
--------------------------------------------------------- */
(() => {
  const box = $('#heroBalloons');
  if (!box || reduced) return;

  const colors = ['#FF4E9B', '#FBBF24', '#3BB4F5', '#34D399', '#A855F7', '#FB8C4B'];
  const n = innerWidth < 700 ? 7 : 13;

  for (let i = 0; i < n; i++) {
    const b = document.createElement('div');
    const size = 16 + Math.random() * 30;
    const c = colors[i % colors.length];
    b.className = 'bal';
    b.style.cssText = `
      left:${Math.random() * 100}%;
      width:${size}px;
      animation-duration:${16 + Math.random() * 16}s;
      animation-delay:${-Math.random() * 26}s;
      --spin:${(Math.random() * 30 - 15).toFixed(1)}deg;
    `;
    b.innerHTML = `<svg viewBox="0 0 40 58" width="100%" aria-hidden="true">
      <ellipse cx="20" cy="21" rx="18" ry="21" fill="${c}"/>
      <path d="M20 42c-3 4 3 6 0 10 -3 4 2 5 1 6" stroke="${c}" stroke-width="1.6" fill="none" opacity=".7"/>
      <ellipse cx="13" cy="14" rx="5" ry="7" fill="#fff" opacity=".28"/>
    </svg>`;
    box.appendChild(b);
  }
})();

/* ---------------------------------------------------------
   PARALLAX DEL STAGE DEL HERO
--------------------------------------------------------- */
(() => {
  const stage = $('#heroStage');
  if (!stage || reduced || matchMedia('(pointer: coarse)').matches) return;

  const layers = $$('[data-depth]', stage);
  let raf = null;

  stage.addEventListener('mousemove', e => {
    const r = stage.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;

    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      layers.forEach(l => {
        const d = +l.dataset.depth;
        l.style.translate = `${-px * d}px ${-py * d}px`;
      });
    });
  });

  stage.addEventListener('mouseleave', () => {
    layers.forEach(l => l.style.translate = '0px 0px');
  });
})();

/* ---------------------------------------------------------
   TILT 3D + BRILLO EN LAS TARJETAS
--------------------------------------------------------- */
(() => {
  if (reduced || matchMedia('(pointer: coarse)').matches) return;

  $$('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 6}deg) rotateY(${(px - 0.5) * 6}deg) translateY(-5px)`;
      card.style.setProperty('--mx', `${px * 100}%`);
      card.style.setProperty('--my', `${py * 100}%`);
    });
    card.addEventListener('mouseleave', () => card.style.transform = '');
  });
})();

/* ---------------------------------------------------------
   GALERÍA — filtros
--------------------------------------------------------- */
(() => {
  const chips = $$('.chip');
  const items = $$('.gitem');
  if (!chips.length) return;

  chips.forEach(chip => chip.addEventListener('click', () => {
    chips.forEach(c => {
      const on = c === chip;
      c.classList.toggle('is-on', on);
      c.setAttribute('aria-selected', String(on));
    });

    const f = chip.dataset.filter;
    items.forEach(it => {
      const show = f === 'all' || it.dataset.cat === f;
      it.classList.add('is-fading');
      setTimeout(() => {
        it.classList.toggle('is-hidden', !show);
        requestAnimationFrame(() => it.classList.remove('is-fading'));
      }, 180);
    });
  }));
})();

/* ---------------------------------------------------------
   LIGHTBOX
--------------------------------------------------------- */
(() => {
  const lb = $('#lightbox');
  const img = $('#lbImg');
  const cap = $('#lbCap');
  if (!lb) return;

  let list = [], idx = 0, lastFocus = null;

  const visible = () => $$('.gitem').filter(i => !i.classList.contains('is-hidden'));

  const show = i => {
    idx = (i + list.length) % list.length;
    const it = list[idx];
    img.src = it.src;
    img.alt = it.alt;
    cap.textContent = it.cap;
  };

  const open = (from) => {
    list = visible().map(it => {
      const im = $('img', it);
      const t = $('figcaption b', it)?.textContent ?? '';
      const s = $('figcaption span', it)?.textContent ?? '';
      return { src: im.src, alt: im.alt, cap: `${t} — ${s}`, node: it };
    });
    const start = list.findIndex(l => l.node === from);
    lastFocus = document.activeElement;
    lb.hidden = false;
    document.body.classList.add('is-locked');
    requestAnimationFrame(() => lb.classList.add('is-open'));
    show(start < 0 ? 0 : start);
    $('#lbClose').focus();
  };

  const close = () => {
    lb.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    setTimeout(() => { lb.hidden = true; img.removeAttribute('src'); }, 350);
    lastFocus?.focus();
  };

  $$('.gitem button').forEach(btn =>
    btn.addEventListener('click', () => open(btn.closest('.gitem')))
  );

  $('#lbClose').addEventListener('click', close);
  $('#lbPrev').addEventListener('click', () => show(idx - 1));
  $('#lbNext').addEventListener('click', () => show(idx + 1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });

  addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });

  // swipe en móvil
  let x0 = null;
  lb.addEventListener('touchstart', e => x0 = e.touches[0].clientX, { passive: true });
  lb.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 55) show(idx + (dx < 0 ? 1 : -1));
    x0 = null;
  }, { passive: true });
})();

/* ---------------------------------------------------------
   TOAST
--------------------------------------------------------- */
let toastTimer = null;
function toast(msg, ms = 4200) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('is-on'), ms);
}

/* ---------------------------------------------------------
   CONFETTI
--------------------------------------------------------- */
const confetti = (() => {
  const cv = $('#confetti');
  if (!cv) return () => {};
  const ctx = cv.getContext('2d');
  const colors = ['#FF4E9B', '#FBBF24', '#3BB4F5', '#34D399', '#A855F7', '#FB8C4B'];
  let parts = [], raf = null;

  const size = () => {
    const d = devicePixelRatio || 1;
    cv.width = innerWidth * d;
    cv.height = innerHeight * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
  };
  size();
  addEventListener('resize', size);

  const tick = () => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter(p => p.life > 0);

    parts.forEach(p => {
      p.vy += 0.17;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life--;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.min(1, p.life / 40);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });

    if (parts.length) raf = requestAnimationFrame(tick);
    else { ctx.clearRect(0, 0, innerWidth, innerHeight); raf = null; }
  };

  return (x = innerWidth / 2, y = innerHeight / 2, n = 90) => {
    if (reduced) return;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 4 + Math.random() * 9;
      parts.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 5,
        w: 6 + Math.random() * 7,
        h: 4 + Math.random() * 5,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        c: colors[(Math.random() * colors.length) | 0],
        life: 90 + Math.random() * 50
      });
    }
    if (!raf) raf = requestAnimationFrame(tick);
  };
})();

$$('[data-confetti]').forEach(el => el.addEventListener('click', e => {
  const r = el.getBoundingClientRect();
  confetti(r.left + r.width / 2, r.top + r.height / 2, 80);
}));

/* ---------------------------------------------------------
   FORMULARIO DE PROPUESTA
--------------------------------------------------------- */
(() => {
  const form  = $('#propForm');
  if (!form) return;

  const drop   = $('#drop');
  const input  = $('#f-files');
  const thumbs = $('#thumbs');
  const err    = $('#formErr');
  const hint   = $('#formHint');
  const MAX    = 3;
  const MAX_MB = 5;

  let files = [];

  if (CONFIG.email) hint.textContent = 'Se abrirá WhatsApp con tus datos listos y además enviaremos tus fotos por correo automáticamente.';

  /* --- manejo de archivos --- */
  const syncInput = () => {
    const dt = new DataTransfer();
    files.forEach(f => dt.items.add(f));
    input.files = dt.files;
  };

  const render = () => {
    thumbs.innerHTML = '';
    files.forEach((f, i) => {
      const d = document.createElement('div');
      d.className = 'thumb';
      const url = URL.createObjectURL(f);
      d.innerHTML = `<img src="${url}" alt="Vista previa ${i + 1}">
                     <button type="button" aria-label="Quitar imagen ${i + 1}">&times;</button>`;
      $('img', d).addEventListener('load', () => URL.revokeObjectURL(url), { once: true });
      $('button', d).addEventListener('click', () => {
        files.splice(i, 1);
        syncInput();
        render();
      });
      thumbs.appendChild(d);
    });
  };

  const add = list => {
    const incoming = [...list].filter(f => f.type.startsWith('image/'));
    if (!incoming.length) return toast('Solo se aceptan imágenes (JPG o PNG).');

    for (const f of incoming) {
      if (files.length >= MAX) { toast(`Máximo ${MAX} fotos.`); break; }
      if (f.size > MAX_MB * 1024 * 1024) { toast(`"${f.name}" pesa más de ${MAX_MB} MB.`); continue; }
      files.push(f);
    }
    syncInput();
    render();
  };

  drop.addEventListener('click', () => input.click());
  drop.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
  });
  input.addEventListener('change', () => {
    const picked = [...input.files];
    files = [];
    add(picked);
  });

  ['dragenter', 'dragover'].forEach(ev =>
    drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('is-over'); })
  );
  ['dragleave', 'drop'].forEach(ev =>
    drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('is-over'); })
  );
  drop.addEventListener('drop', e => add(e.dataTransfer.files));

  /* --- copiar la primera foto al portapapeles (para pegarla en WhatsApp) ---
     Es un extra: si el navegador lo bloquea o se queda colgado, seguimos
     igual. Por eso va con límite de tiempo y nunca frena el envío. */
  const copyFirstImage = (file) => {
    if (!file || !navigator.clipboard?.write || !window.ClipboardItem) {
      return Promise.resolve(false);
    }

    const attempt = (async () => {
      const bmp = await createImageBitmap(file);
      const cv = document.createElement('canvas');
      cv.width = bmp.width; cv.height = bmp.height;
      cv.getContext('2d').drawImage(bmp, 0, 0);
      const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
      if (!blob) return false;
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      return true;
    })().catch(() => false);

    const timeout = new Promise(r => setTimeout(() => r(false), 1200));
    return Promise.race([attempt, timeout]);
  };

  /* --- envío por correo con adjuntos (FormSubmit) --- */
  const sendEmail = (data) => new Promise(resolve => {
    if (!CONFIG.email) return resolve(false);

    let frame = $('#mailFrame');
    if (!frame) {
      frame = document.createElement('iframe');
      frame.id = 'mailFrame';
      frame.name = 'mailFrame';
      frame.style.display = 'none';
      document.body.appendChild(frame);
    }

    const tmp = document.createElement('form');
    tmp.action = `https://formsubmit.co/${CONFIG.email}`;
    tmp.method = 'POST';
    tmp.enctype = 'multipart/form-data';
    tmp.target = 'mailFrame';
    tmp.style.display = 'none';

    const hidden = {
      ...data,
      _subject: `Nueva propuesta desde la web — ${data.nombre}`,
      _captcha: 'false',
      _template: 'table'
    };
    Object.entries(hidden).forEach(([k, v]) => {
      const i = document.createElement('input');
      i.type = 'hidden'; i.name = k; i.value = v ?? '';
      tmp.appendChild(i);
    });

    // movemos el input real para que viajen los archivos, y luego lo devolvemos
    const home = input.parentNode;
    const mark = document.createComment('files');
    home.insertBefore(mark, input);
    tmp.appendChild(input);

    document.body.appendChild(tmp);
    tmp.submit();

    setTimeout(() => {
      home.insertBefore(input, mark);
      mark.remove();
      tmp.remove();
      resolve(true);
    }, 400);
  });

  /* --- submit --- */
  form.addEventListener('submit', e => {
    e.preventDefault();
    err.hidden = true;

    const data = {
      nombre:       $('#f-name').value.trim(),
      whatsapp:     $('#f-phone').value.trim(),
      fecha:        $('#f-date').value,
      tipo:         $('#f-type').value,
      lugar:        $('#f-place').value.trim(),
      presupuesto:  $('#f-budget').value.trim(),
      idea:         $('#f-msg').value.trim()
    };

    if (!data.nombre || !data.whatsapp || !data.idea) {
      err.textContent = 'Completa tu nombre, tu WhatsApp y cuéntanos tu idea.';
      err.hidden = false;
      (!data.nombre ? $('#f-name') : !data.whatsapp ? $('#f-phone') : $('#f-msg')).focus();
      return;
    }

    const fechaTxt = data.fecha
      ? new Date(`${data.fecha}T12:00:00`).toLocaleDateString('es-PA', { day: 'numeric', month: 'long', year: 'numeric' })
      : 'por definir';

    const msg = [
      '*Nueva propuesta desde la web* 🎉',
      '',
      `*Nombre:* ${data.nombre}`,
      `*WhatsApp:* ${data.whatsapp}`,
      `*Tipo de evento:* ${data.tipo}`,
      `*Fecha:* ${fechaTxt}`,
      data.lugar ? `*Lugar:* ${data.lugar}` : null,
      data.presupuesto ? `*Presupuesto:* ${data.presupuesto}` : null,
      '',
      '*La idea:*',
      data.idea,
      '',
      files.length
        ? `📎 Te adjunto ${files.length === 1 ? 'una foto' : `${files.length} fotos`} de referencia.`
        : null
    ].filter(line => line !== null).join('\n');

    // El correo se dispara solo (va a un iframe oculto, no bloquea nada).
    sendEmail(data);

    // WhatsApp se abre YA, dentro del gesto del usuario: si esperáramos a
    // una promesa, el navegador trataría la ventana como popup y la bloquearía.
    const nFiles = files.length;
    const firstFile = files[0];
    window.open(waURL(msg), '_blank', 'noopener');

    confetti(innerWidth / 2, innerHeight * 0.42, 130);
    toast(nFiles
      ? '¡Listo! Se abrió WhatsApp con tus datos. Adjunta tus fotos en el chat. 📎'
      : '¡Listo! Se abrió WhatsApp con tu propuesta. 🎉');

    // Lo del portapapeles es un plus: si funciona, mejoramos el aviso.
    copyFirstImage(firstFile).then(copied => {
      if (copied) {
        toast('¡Listo! Se abrió WhatsApp y tu primera foto quedó copiada — solo pégala en el chat. 📋', 6500);
      }
    });

    form.reset();
    files = [];
    syncInput();
    render();
  });
})();

/* ---------------------------------------------------------
   AÑO DEL FOOTER
--------------------------------------------------------- */
$('#year').textContent = new Date().getFullYear();
