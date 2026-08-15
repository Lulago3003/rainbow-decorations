/* =========================================================
   Rainbow Decorations — interacciones
   ---------------------------------------------------------
   El contenido editable vive en contenido.json y se aplica
   aquí. El panel (#admin) usa las mismas funciones para la
   vista previa en vivo.
   ========================================================= */

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Contenido por defecto: si contenido.json falla, la página no se rompe. */
const POR_DEFECTO = {
  promo: { activa: false, texto: '', etiqueta: '', cta: '', mensaje: '' },
  contacto: {
    whatsapp: '50760249687',
    whatsappVisible: '+507 6024-9687',
    instagram: 'rainbowdecorations01',
    horario: 'Escríbenos por WhatsApp',
    zona: 'Arraiján y alrededores de Panamá Oeste',
    pagos: ''
  },
  instagram: { titulo: '', bajada: '', publicaciones: [] },
  paquetes: [],
  alquiler: {
    whatsapp: '50769140677',
    whatsappVisible: '+507 6914-0677',
    nota: '',
    articulos: []
  }
};

const RD = window.RD = { contenido: structuredClone(POR_DEFECTO) };

/* Hay dos números: el de decoraciones y el de alquiler de sillas y mesas. */
const waURLcon = (numero, texto) =>
  `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;

const waURL = (texto) => waURLcon(RD.contenido.contacto.whatsapp, texto);

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------------------------------------------------------
   APLICAR CONTENIDO
--------------------------------------------------------- */
function aplicarContenido(data) {
  RD.contenido = {
    ...structuredClone(POR_DEFECTO),
    ...data,
    contacto: { ...POR_DEFECTO.contacto, ...(data.contacto || {}) },
    promo:    { ...POR_DEFECTO.promo,    ...(data.promo    || {}) },
    instagram:{ ...POR_DEFECTO.instagram,...(data.instagram|| {}) },
    alquiler: { ...POR_DEFECTO.alquiler, ...(data.alquiler || {}) }
  };

  pintarEnlacesWhatsapp();
  pintarPromo();
  pintarContacto();
  pintarInstagram();
  pintarPaquetes();
  pintarAlquiler();
}

/* --- todos los enlaces de WhatsApp ---
   data-wa-tel="alquiler" manda al número de sillas y mesas. */
function pintarEnlacesWhatsapp() {
  const principal = RD.contenido.contacto.whatsapp;
  const alquiler  = RD.contenido.alquiler.whatsapp || principal;

  $$('[data-wa]').forEach(el => {
    const numero = el.dataset.waTel === 'alquiler' ? alquiler : principal;
    el.setAttribute('href', waURLcon(numero, el.dataset.wa));
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  });
}

/* --- catálogo de sillas y mesas --- */
function pintarAlquiler() {
  const a = RD.contenido.alquiler;

  const tel = a.whatsappVisible || a.whatsapp;
  const elTel = $('#rentTel');   if (elTel) elTel.textContent = tel;
  const pieTel = $('#footTelAlq'); if (pieTel) pieTel.textContent = tel;

  const nota = $('#rentNoteText');
  if (nota) {
    // **negrita** como en WhatsApp
    nota.innerHTML = esc(a.nota).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    const caja = $('#rentNote');
    if (caja) caja.hidden = !a.nota;
  }

  // **negrita** al estilo WhatsApp
  const negrita = t => esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

  const cond = $('#rentCond');
  if (cond) {
    const lista = a.condiciones || [];
    cond.hidden = !lista.length;
    $('#rentCondList').innerHTML = lista.map(c => `<li>${negrita(c)}</li>`).join('');
  }

  const rejilla = $('#rentGrid');
  if (!rejilla) return;

  rejilla.innerHTML = (a.articulos || []).map((it, i) => {
    const mensaje = `Hola! 👋 Quiero alquilar *${it.nombre}${it.medida ? ` (${it.medida})` : ''}*. ¿Cuántas tienen disponibles?`;
    const [entero, centavos] = String(it.precio).split('.');
    return `
      <article class="rent__card${it.foto ? ' rent__card--foto' : ''} reveal" data-reveal ${i ? `data-delay="${Math.min(i, 5)}"` : ''}>
        <div class="rent__img">
          <img src="${esc(it.img)}" alt="${esc(it.nombre)}${it.medida ? ` de ${esc(it.medida)}` : ''}" loading="lazy">
          <div class="rent__price"><span>$</span><b>${esc(entero)}${centavos ? `.${esc(centavos)}` : ''}</b></div>
        </div>
        <div class="rent__body">
          <h3>${esc(it.nombre)}</h3>
          ${it.medida ? `<span class="rent__med">${esc(it.medida)}</span>` : ''}
          <p>${esc(it.detalle || '')}</p>
          <span class="rent__unit">Precio ${esc(it.unidad || 'por unidad')}</span>
          <a class="btn btn--wa-solid btn--sm" style="margin-top:16px" href="#" data-wa-tel="alquiler" data-wa="${esc(mensaje)}">Pedir por WhatsApp</a>
        </div>
      </article>`;
  }).join('');

  pintarEnlacesWhatsapp();
  observarRevelados(rejilla);
}

/* --- barra de promoción --- */
function pintarPromo() {
  const barra = $('#promo');
  if (!barra) return;

  const p = RD.contenido.promo;
  const cerrada = sessionStorage.getItem('rd_promo_cerrada') === '1';
  const visible = !!(p.activa && p.texto && !cerrada);

  barra.hidden = !visible;
  if (visible) {
    $('#promoTag').textContent = p.etiqueta || '';
    $('#promoTag').hidden = !p.etiqueta;
    $('#promoText').textContent = p.texto;
    const cta = $('#promoCta');
    if (p.cta) {
      cta.hidden = false;
      cta.textContent = p.cta;
      cta.href = waURL(p.mensaje || p.texto);
    } else {
      cta.hidden = true;
    }
  }
  medirPromo();
}

function medirPromo() {
  const barra = $('#promo');
  const alto = barra && !barra.hidden ? barra.offsetHeight : 0;
  document.documentElement.style.setProperty('--promo-h', `${alto}px`);
}

/* --- datos de contacto repartidos por la página --- */
function pintarContacto() {
  const c = RD.contenido.contacto;

  const tel = $('#footTel');
  if (tel) tel.textContent = c.whatsappVisible || c.whatsapp;

  const horario = $('#locHorario');
  if (horario) horario.textContent = c.horario || '—';

  const zona = $('#locZona');
  if (zona) zona.textContent = c.zona || '—';

  const pagoCaja = $('#payBox');
  const pagoTexto = $('#payText');
  if (pagoCaja && pagoTexto) {
    pagoCaja.hidden = !c.pagos;
    pagoTexto.textContent = c.pagos || '';
  }

  if (c.instagram) {
    const url = `https://www.instagram.com/${c.instagram}/`;
    $$('a[href*="instagram.com/"]').forEach(a => {
      if (!a.href.includes('/p/')) a.href = url;
    });
    $$('a').forEach(a => {
      if (a.textContent.trim().startsWith('@')) a.textContent = `@${c.instagram}`;
    });
  }
}

/* --- publicaciones de Instagram --- */
const codigoInstagram = (url) => {
  const m = String(url).match(/instagram\.com\/(?:[^/]+\/)?(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
  return m ? m[1] : null;
};

function pintarInstagram() {
  const seccion = $('#instagram');
  const feed = $('#igFeed');
  if (!seccion || !feed) return;

  const ig = RD.contenido.instagram;
  const posts = (ig.publicaciones || []).filter(p => codigoInstagram(p.url));

  seccion.hidden = posts.length === 0;
  if (!posts.length) { feed.innerHTML = ''; return; }

  if (ig.titulo) $('#igTitulo').innerHTML = esc(ig.titulo).replace(/Instagram/i, '<em class="grad">Instagram</em>');
  const bajada = $('#igBajada');
  bajada.textContent = ig.bajada || '';
  bajada.hidden = !ig.bajada;

  const perfil = RD.contenido.contacto.instagram;
  feed.innerHTML = posts.map(p => {
    const code = codigoInstagram(p.url);
    const enlace = `https://www.instagram.com/p/${code}/`;
    return `
      <article class="igcard" data-ig-code="${esc(code)}" data-ig-titulo="${esc(p.titulo || '')}">
        <div class="igcard__frame">
          <div class="igcard__fallback${p.miniatura ? ' igcard__fallback--foto' : ''}">
            ${p.miniatura
              ? `<img class="igcard__mini" src="${esc(p.miniatura)}" alt="${esc(p.titulo || 'Publicación de Instagram')}" loading="lazy">`
              : `<svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true"><path fill="currentColor" d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16m0 5a4.84 4.84 0 1 0 0 9.68 4.84 4.84 0 0 0 0-9.68m0 7.98a3.14 3.14 0 1 1 0-6.28 3.14 3.14 0 0 1 0 6.28m6.16-8.17a1.13 1.13 0 1 1-2.26 0 1.13 1.13 0 0 1 2.26 0"/></svg>`}
            <div class="igcard__over">
              <b>${esc(p.titulo || 'Publicación')}</b>
              <button class="btn btn--grad btn--sm" type="button" data-ig-cargar>Ver la publicación</button>
              <span>Al cargarla, Instagram puede poner sus propias cookies.</span>
            </div>
          </div>
        </div>
        <div class="igcard__foot">
          <b>${esc(p.titulo || `@${perfil}`)}</b>
          <a href="${enlace}" target="_blank" rel="noopener">Ver en Instagram</a>
        </div>
      </article>`;
  }).join('');

  $$('[data-ig-cargar]', feed).forEach(b =>
    b.addEventListener('click', () => cargarEmbed(b.closest('.igcard'))));

  // Si ya aceptó cookies, no la hacemos pedir permiso otra vez.
  if (localStorage.getItem('rd_cookies') === 'todas') cargarEmbedsInstagram();
}

/* Los embeds de Instagram traen contenido de Meta, así que solo se cargan
   cuando la persona lo pide o ya aceptó las cookies. También evita bajar
   tres iframes pesados de entrada. */
function cargarEmbed(card) {
  if (!card || card.dataset.igListo) return;
  card.dataset.igListo = '1';

  const code = card.dataset.igCode;
  const marco = $('.igcard__frame', card);
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.instagram.com/p/${code}/embed/`;
  iframe.title = card.dataset.igTitulo || 'Publicación de Instagram';
  iframe.loading = 'lazy';
  iframe.scrolling = 'no';
  marco.appendChild(iframe);
}

function cargarEmbedsInstagram() {
  $$('.igcard').forEach(cargarEmbed);
}
window.rdCargarInstagram = cargarEmbedsInstagram;

/* --- paquetes --- */
function pintarPaquetes() {
  const cont = $('#plans');
  if (!cont) return;

  const paquetes = RD.contenido.paquetes || [];
  cont.innerHTML = paquetes.map((p, i) => {
    const mensaje = `Hola! 👋 Me interesa el paquete *${p.nombre}${p.precio ? ` ($${p.precio})` : ''}*. ¿Me pueden dar más información?`;
    return `
      <article class="plan${p.destacado ? ' plan--star' : ''} reveal" data-reveal ${i ? `data-delay="${i}"` : ''}>
        ${p.destacado ? '<span class="plan__tag">Más pedido</span>' : ''}
        <div class="plan__top">
          <h3>${esc(p.nombre)}</h3>
          <p class="plan__for">${esc(p.para || '')}</p>
          <div class="plan__price">
            ${p.desde ? '<span class="from">desde</span>' : ''}
            <span class="cur">$</span><b>${esc(p.precio)}</b>
          </div>
        </div>
        <ul class="plan__list">
          ${(p.incluye || []).map(x => `<li>${resaltar(x)}</li>`).join('')}
        </ul>
        <a class="btn ${p.destacado ? 'btn--grad' : 'btn--outline'}" href="#" data-wa="${esc(mensaje)}"${p.destacado ? ' data-confetti' : ''}>Reservar este</a>
      </article>`;
  }).join('');

  // *texto* se muestra en negrita, igual que en WhatsApp
  function resaltar(t) {
    return esc(t).replace(/\*(.+?)\*/g, '<b>$1</b>')
                 .replace(/^([^—·]+·\s*\$\d+)/, '<b>$1</b>');
  }

  pintarEnlacesWhatsapp();
  engancharConfetti();
  observarRevelados(cont);
}

/* ---------------------------------------------------------
   CARGA INICIAL
--------------------------------------------------------- */
(async function cargar() {
  // Borrador del panel: si existe, manda sobre el archivo publicado.
  let borrador = null;
  try { borrador = JSON.parse(localStorage.getItem('rd_borrador') || 'null'); } catch {}

  let publicado = null;
  try {
    const res = await fetch('contenido.json', { cache: 'no-cache' });
    if (res.ok) publicado = await res.json();
  } catch {}

  RD.publicado = publicado || structuredClone(POR_DEFECTO);
  aplicarContenido(borrador || publicado || POR_DEFECTO);
  RD.aplicar = aplicarContenido;
  document.dispatchEvent(new CustomEvent('rd:listo'));
})();

addEventListener('resize', medirPromo);

/* En móvil el botón de la promo está oculto: toda la barra abre el chat. */
$('.promo__in')?.addEventListener('click', e => {
  if (e.target.closest('.promo__cta')) return;
  const cta = $('#promoCta');
  if (cta && !cta.hidden && matchMedia('(max-width:700px)').matches) {
    window.open(cta.href, '_blank', 'noopener');
  }
});

$('#promoClose')?.addEventListener('click', () => {
  sessionStorage.setItem('rd_promo_cerrada', '1');
  $('#promo').hidden = true;
  medirPromo();
});

/* ---------------------------------------------------------
   PRELOADER
--------------------------------------------------------- */
function arrancar() {
  $('#preloader')?.classList.add('is-done');
  $('.hero')?.classList.add('is-in');
  $('.wafab')?.classList.add('is-in');
}
addEventListener('load', () => setTimeout(arrancar, reduced ? 0 : 550));
setTimeout(arrancar, 3200);

/* ---------------------------------------------------------
   NAV
--------------------------------------------------------- */
(() => {
  const nav = $('#nav');
  const bar = $('#progress i');
  const links = $$('#navLinks a');
  const burger = $('#burger');
  const menu = $('#navLinks');

  const onScroll = () => {
    nav.classList.toggle('is-stuck', scrollY > 30);
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const cerrar = () => {
    menu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-locked');
  };
  burger?.addEventListener('click', () => {
    const abierto = menu.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(abierto));
    document.body.classList.toggle('is-locked', abierto);
  });
  links.forEach(a => a.addEventListener('click', cerrar));
  addEventListener('keydown', e => e.key === 'Escape' && cerrar());

  const secciones = links
    .map(a => document.getElementById(a.getAttribute('href').slice(1)))
    .filter(Boolean);

  const spy = new IntersectionObserver(entradas => {
    entradas.forEach(en => {
      if (!en.isIntersecting) return;
      links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${en.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  secciones.forEach(s => spy.observe(s));
})();

/* ---------------------------------------------------------
   REVEAL
--------------------------------------------------------- */
let ioReveal = null;
function observarRevelados(raiz = document) {
  const items = $$('[data-reveal]', raiz).filter(el => !el.classList.contains('is-in'));
  if (!items.length) return;
  if (reduced) return items.forEach(el => el.classList.add('is-in'));

  ioReveal ??= new IntersectionObserver((entradas, obs) => {
    entradas.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      obs.unobserve(en.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  items.forEach(el => ioReveal.observe(el));
}
observarRevelados();

/* ---------------------------------------------------------
   CONTADORES
--------------------------------------------------------- */
(() => {
  const els = $$('[data-count]');
  if (!els.length) return;

  const correr = el => {
    const fin = +el.dataset.count;
    if (reduced) return el.textContent = `+${fin.toLocaleString('es-PA')}`;
    const dur = 1500, t0 = performance.now();
    const paso = ahora => {
      const p = Math.min((ahora - t0) / dur, 1);
      el.textContent = `+${Math.round(fin * (1 - Math.pow(1 - p, 3))).toLocaleString('es-PA')}`;
      if (p < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  };

  const io = new IntersectionObserver((entradas, obs) => {
    entradas.forEach(en => { if (en.isIntersecting) { correr(en.target); obs.unobserve(en.target); } });
  }, { threshold: 0.6 });
  els.forEach(el => io.observe(el));
})();

/* ---------------------------------------------------------
   GLOBOS DEL HERO
--------------------------------------------------------- */
(() => {
  const caja = $('#heroBalloons');
  if (!caja || reduced) return;

  const colores = ['#FF4E9B', '#FBBF24', '#3BB4F5', '#34D399', '#A855F7', '#FB8C4B'];
  const n = innerWidth < 700 ? 7 : 13;

  for (let i = 0; i < n; i++) {
    const b = document.createElement('div');
    const size = 16 + Math.random() * 30;
    const c = colores[i % colores.length];
    b.className = 'bal';
    b.style.cssText = `left:${Math.random() * 100}%;width:${size}px;
      animation-duration:${16 + Math.random() * 16}s;
      animation-delay:${-Math.random() * 26}s;
      --spin:${(Math.random() * 30 - 15).toFixed(1)}deg;`;
    b.innerHTML = `<svg viewBox="0 0 40 58" width="100%" aria-hidden="true">
      <ellipse cx="20" cy="21" rx="18" ry="21" fill="${c}"/>
      <path d="M20 42c-3 4 3 6 0 10 -3 4 2 5 1 6" stroke="${c}" stroke-width="1.6" fill="none" opacity=".7"/>
      <ellipse cx="13" cy="14" rx="5" ry="7" fill="#fff" opacity=".28"/></svg>`;
    caja.appendChild(b);
  }
})();

/* ---------------------------------------------------------
   PARALLAX DEL HERO
--------------------------------------------------------- */
(() => {
  const stage = $('#heroStage');
  if (!stage || reduced || matchMedia('(pointer: coarse)').matches) return;

  const capas = $$('[data-depth]', stage);
  let raf = null;

  stage.addEventListener('mousemove', e => {
    const r = stage.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      capas.forEach(l => l.style.translate = `${-px * +l.dataset.depth}px ${-py * +l.dataset.depth}px`);
    });
  });
  stage.addEventListener('mouseleave', () => capas.forEach(l => l.style.translate = '0px 0px'));
})();

/* ---------------------------------------------------------
   GALERÍA
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
      const mostrar = f === 'all' || it.dataset.cat === f;
      it.classList.add('is-fading');
      setTimeout(() => {
        it.classList.toggle('is-hidden', !mostrar);
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

  let lista = [], idx = 0, ultimoFoco = null;
  const visibles = () => $$('.gitem').filter(i => !i.classList.contains('is-hidden'));

  const cuenta = $('#lbCount');

  const mostrar = i => {
    idx = (i + lista.length) % lista.length;
    img.src = lista[idx].src;
    img.alt = lista[idx].alt;
    cap.textContent = lista[idx].cap;
    if (cuenta) cuenta.textContent = `${idx + 1} / ${lista.length}`;

    // adelantamos la siguiente y la anterior para que no parpadeen
    [idx + 1, idx - 1].forEach(j => {
      const v = lista[(j + lista.length) % lista.length];
      if (v) new Image().src = v.src;
    });
  };

  const abrir = desde => {
    lista = visibles().map(it => {
      const im = $('img', it);
      return {
        src: im.src, alt: im.alt,
        cap: `${$('figcaption b', it)?.textContent ?? ''} — ${$('figcaption span', it)?.textContent ?? ''}`,
        nodo: it
      };
    });
    const inicio = lista.findIndex(l => l.nodo === desde);
    ultimoFoco = document.activeElement;
    lb.hidden = false;
    document.body.classList.add('is-locked');
    requestAnimationFrame(() => lb.classList.add('is-open'));
    mostrar(inicio < 0 ? 0 : inicio);
    $('#lbClose').focus();
  };

  const cerrar = () => {
    lb.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    setTimeout(() => { lb.hidden = true; img.removeAttribute('src'); }, 350);
    ultimoFoco?.focus();
  };

  $$('.gitem button').forEach(b => b.addEventListener('click', () => abrir(b.closest('.gitem'))));
  $('#lbClose').addEventListener('click', cerrar);
  $('#lbPrev').addEventListener('click', () => mostrar(idx - 1));
  $('#lbNext').addEventListener('click', () => mostrar(idx + 1));
  lb.addEventListener('click', e => { if (e.target === lb) cerrar(); });

  addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') cerrar();
    if (e.key === 'ArrowLeft') mostrar(idx - 1);
    if (e.key === 'ArrowRight') mostrar(idx + 1);

    // El foco se queda dentro del visor mientras está abierto.
    if (e.key === 'Tab') {
      const focos = [$('#lbClose'), $('#lbPrev'), $('#lbNext')];
      const i = focos.indexOf(document.activeElement);
      const salto = e.shiftKey ? -1 : 1;
      e.preventDefault();
      focos[(i + salto + focos.length) % focos.length].focus();
    }
  });

  let x0 = null;
  lb.addEventListener('touchstart', e => x0 = e.touches[0].clientX, { passive: true });
  lb.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 55) mostrar(idx + (dx < 0 ? 1 : -1));
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
window.rdToast = toast;

/* ---------------------------------------------------------
   CONFETTI
--------------------------------------------------------- */
const confetti = (() => {
  const cv = $('#confetti');
  if (!cv) return () => {};
  const ctx = cv.getContext('2d');
  const colores = ['#FF4E9B', '#FBBF24', '#3BB4F5', '#34D399', '#A855F7', '#FB8C4B'];
  let partes = [], raf = null;

  const medir = () => {
    const d = devicePixelRatio || 1;
    cv.width = innerWidth * d; cv.height = innerHeight * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
  };
  medir();
  addEventListener('resize', medir);

  const tick = () => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    partes = partes.filter(p => p.vida > 0);
    partes.forEach(p => {
      p.vy += 0.17; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.vida--;
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.globalAlpha = Math.min(1, p.vida / 40);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (partes.length) raf = requestAnimationFrame(tick);
    else { ctx.clearRect(0, 0, innerWidth, innerHeight); raf = null; }
  };

  return (x = innerWidth / 2, y = innerHeight / 2, n = 90) => {
    if (reduced) return;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 4 + Math.random() * 9;
      partes.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 5,
        w: 6 + Math.random() * 7, h: 4 + Math.random() * 5,
        rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
        c: colores[(Math.random() * colores.length) | 0],
        vida: 90 + Math.random() * 50
      });
    }
    if (!raf) raf = requestAnimationFrame(tick);
  };
})();
window.rdConfetti = confetti;

function engancharConfetti() {
  $$('[data-confetti]').forEach(el => {
    if (el.dataset.confettiOn) return;
    el.dataset.confettiOn = '1';
    el.addEventListener('click', () => {
      const r = el.getBoundingClientRect();
      confetti(r.left + r.width / 2, r.top + r.height / 2, 80);
    });
  });
}
engancharConfetti();

/* ---------------------------------------------------------
   CONSULTA DE FECHA
--------------------------------------------------------- */
$('#dateForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const v = $('#dc-date').value;
  if (!v) return toast('Escoge una fecha primero.');
  const txt = new Date(`${v}T12:00:00`)
    .toLocaleDateString('es-PA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  window.open(waURL(`Hola! 👋 ¿Tienen disponibilidad para el *${txt}*?`), '_blank', 'noopener');
  confetti(innerWidth / 2, innerHeight * 0.5, 70);
});

/* ---------------------------------------------------------
   COOKIES
--------------------------------------------------------- */
(() => {
  const caja = $('#cookies');
  if (!caja) return;
  const fab = $('.wafab');

  const abrir = () => { caja.hidden = false; fab?.classList.add('is-raised'); };
  const cerrar = (valor) => {
    localStorage.setItem('rd_cookies', valor);
    caja.hidden = true;
    fab?.classList.remove('is-raised');
  };

  if (!localStorage.getItem('rd_cookies')) setTimeout(abrir, 1400);

  $('#ckAccept')?.addEventListener('click', () => {
    cerrar('todas');
    cargarEmbedsInstagram();   // ya dio permiso, mostramos las publicaciones
  });
  $('#ckReject')?.addEventListener('click', () => cerrar('necesarias'));
  $('#openCookies')?.addEventListener('click', abrir);
})();

/* ---------------------------------------------------------
   FORMULARIO DE PROPUESTA
--------------------------------------------------------- */
(() => {
  const form   = $('#propForm');
  if (!form) return;

  const drop   = $('#drop');
  const input  = $('#f-files');
  const thumbs = $('#thumbs');
  const err    = $('#formErr');
  const MAX    = 3;
  const MAX_MB = 5;

  let files = [];

  const sincronizar = () => {
    const dt = new DataTransfer();
    files.forEach(f => dt.items.add(f));
    input.files = dt.files;
  };

  const pintar = () => {
    thumbs.innerHTML = '';
    files.forEach((f, i) => {
      const d = document.createElement('div');
      d.className = 'thumb';
      const url = URL.createObjectURL(f);
      d.innerHTML = `<img src="${url}" alt="Vista previa ${i + 1}">
                     <button type="button" aria-label="Quitar imagen ${i + 1}">&times;</button>`;
      $('img', d).addEventListener('load', () => URL.revokeObjectURL(url), { once: true });
      $('button', d).addEventListener('click', () => { files.splice(i, 1); sincronizar(); pintar(); });
      thumbs.appendChild(d);
    });
  };

  const agregar = lista => {
    const entrantes = [...lista].filter(f => f.type.startsWith('image/'));
    if (!entrantes.length) return toast('Solo se aceptan imágenes (JPG o PNG).');
    for (const f of entrantes) {
      if (files.length >= MAX) { toast(`Máximo ${MAX} fotos.`); break; }
      if (f.size > MAX_MB * 1024 * 1024) { toast(`"${f.name}" pesa más de ${MAX_MB} MB.`); continue; }
      files.push(f);
    }
    sincronizar(); pintar();
  };

  drop.addEventListener('click', () => input.click());
  drop.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
  });
  input.addEventListener('change', () => { const p = [...input.files]; files = []; agregar(p); });

  ['dragenter', 'dragover'].forEach(ev =>
    drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('is-over'); }));
  ['dragleave', 'drop'].forEach(ev =>
    drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('is-over'); }));
  drop.addEventListener('drop', e => agregar(e.dataTransfer.files));

  /* Copiar la primera foto al portapapeles: es un extra, nunca frena el envío. */
  const copiarFoto = (file) => {
    if (!file || !navigator.clipboard?.write || !window.ClipboardItem) return Promise.resolve(false);
    const intento = (async () => {
      const bmp = await createImageBitmap(file);
      const cv = document.createElement('canvas');
      cv.width = bmp.width; cv.height = bmp.height;
      cv.getContext('2d').drawImage(bmp, 0, 0);
      const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
      if (!blob) return false;
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      return true;
    })().catch(() => false);
    return Promise.race([intento, new Promise(r => setTimeout(() => r(false), 1200))]);
  };

  form.addEventListener('submit', e => {
    e.preventDefault();
    err.hidden = true;

    const d = {
      nombre:      $('#f-name').value.trim(),
      whatsapp:    $('#f-phone').value.trim(),
      fecha:       $('#f-date').value,
      tipo:        $('#f-type').value,
      lugar:       $('#f-place').value.trim(),
      presupuesto: $('#f-budget').value.trim(),
      idea:        $('#f-msg').value.trim()
    };

    if (!d.nombre || !d.whatsapp || !d.idea) {
      err.textContent = 'Completa tu nombre, tu WhatsApp y cuéntanos tu idea.';
      err.hidden = false;
      (!d.nombre ? $('#f-name') : !d.whatsapp ? $('#f-phone') : $('#f-msg')).focus();
      return;
    }
    if (!$('#f-consent').checked) {
      err.textContent = 'Marca la casilla para que podamos responderte.';
      err.hidden = false;
      $('#f-consent').focus();
      return;
    }

    const fechaTxt = d.fecha
      ? new Date(`${d.fecha}T12:00:00`).toLocaleDateString('es-PA', { day: 'numeric', month: 'long', year: 'numeric' })
      : 'por definir';

    const msg = [
      '*Nueva propuesta desde la web* 🎉',
      '',
      `*Nombre:* ${d.nombre}`,
      `*WhatsApp:* ${d.whatsapp}`,
      `*Tipo de evento:* ${d.tipo}`,
      `*Fecha:* ${fechaTxt}`,
      d.lugar ? `*Lugar:* ${d.lugar}` : null,
      d.presupuesto ? `*Presupuesto:* ${d.presupuesto}` : null,
      '',
      '*La idea:*',
      d.idea,
      '',
      files.length
        ? `📎 Te adjunto ${files.length === 1 ? 'una foto' : `${files.length} fotos`} de referencia.`
        : null
    ].filter(l => l !== null).join('\n');

    const n = files.length;
    const primera = files[0];

    // WhatsApp se abre dentro del gesto del usuario para que no lo bloqueen.
    window.open(waURL(msg), '_blank', 'noopener');

    confetti(innerWidth / 2, innerHeight * 0.42, 130);
    toast(n
      ? '¡Listo! Se abrió WhatsApp con tus datos. Adjunta tus fotos en el chat. 📎'
      : '¡Listo! Se abrió WhatsApp con tu propuesta. 🎉');

    copiarFoto(primera).then(ok => {
      if (ok) toast('¡Listo! Se abrió WhatsApp y tu primera foto quedó copiada — solo pégala en el chat. 📋', 6500);
    });

    form.reset();
    files = [];
    sincronizar();
    pintar();
  });
})();

/* ---------------------------------------------------------
   AÑO
--------------------------------------------------------- */
/* ---------------------------------------------------------
   VOLVER ARRIBA
--------------------------------------------------------- */
(() => {
  const btn = $('#toTop');
  if (!btn) return;
  btn.hidden = false;

  const revisar = () => btn.classList.toggle('is-on', scrollY > innerHeight * 0.9);
  addEventListener('scroll', revisar, { passive: true });
  revisar();

  btn.addEventListener('click', () =>
    scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));
})();

/* ---------------------------------------------------------
   AÑO
--------------------------------------------------------- */
const elAnio = $('#year');
if (elAnio) elAnio.textContent = new Date().getFullYear();
