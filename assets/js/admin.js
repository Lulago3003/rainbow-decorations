/* =========================================================
   Rainbow Decorations — panel de administración
   ---------------------------------------------------------
   Se abre agregando #admin al final de la dirección:
   .../rainbow-decorations/#admin

   Cómo funciona:
   1. La dueña edita y ve los cambios al instante (borrador
      guardado en su propio navegador).
   2. "Publicar" sube contenido.json a GitHub con un token
      que ella guarda una sola vez. Ahí lo ve todo el mundo.
   3. Si prefiere no usar token, "Descargar" genera el archivo
      para mandárselo a quien administra la web.

   OJO: la clave de abajo solo evita que alguien entre por
   curiosidad — no es seguridad real, porque el código de una
   web estática siempre se puede leer. Lo que de verdad
   protege la publicación es el token de GitHub.
   ========================================================= */

const ADMIN = {
  // SHA-256 de la clave. Por defecto: rainbow2026
  // Para cambiarla, genera el hash de tu nueva clave y pégalo aquí.
  claveHash: '0bb27746937610744f3c1129266330ff3a0b4f4795761662e7b3ad6a08e624dd',
  repoDueno: 'Lulago3003',
  repoNombre: 'rainbow-decorations',
  archivo: 'contenido.json'
};

(() => {
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  let panel = null;
  let datos = null;      // lo que se está editando
  let desbloqueado = false;

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const sha256 = async txt => {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(txt));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const clon = o => JSON.parse(JSON.stringify(o));

  /* ---------- abrir / cerrar ---------- */
  const esRutaAdmin = () => location.hash.replace('#', '').toLowerCase() === 'admin';

  function abrir() {
    if (!panel) construir();
    panel.hidden = false;
    document.body.classList.add('is-locked');
    (desbloqueado ? $('#admPromoTexto', panel) : $('#admClave', panel))?.focus();
  }

  function cerrar() {
    if (panel) panel.hidden = true;
    document.body.classList.remove('is-locked');
    if (esRutaAdmin()) history.replaceState(null, '', location.pathname + location.search);
  }

  addEventListener('hashchange', () => esRutaAdmin() ? abrir() : cerrar());
  document.addEventListener('rd:listo', () => { if (esRutaAdmin()) abrir(); });

  /* ---------- armado del panel ---------- */
  function construir() {
    panel = document.createElement('div');
    panel.className = 'adm';
    panel.hidden = true;
    document.body.appendChild(panel);
    pintarCandado();
  }

  function pintarCandado() {
    panel.innerHTML = `
      <div class="adm__wrap">
        <div class="adm__gate">
          <h2>Panel de Rainbow Decorations</h2>
          <p>Escribe la clave para editar el contenido de la página.</p>
          <form id="admLogin">
            <input type="password" id="admClave" placeholder="Clave" autocomplete="current-password" required>
            <button class="btn btn--grad btn--block" type="submit">Entrar</button>
            <button class="btn btn--ghost btn--block" type="button" id="admSalir">Volver a la página</button>
          </form>
          <p class="adm__status err" id="admError" style="margin-top:14px"></p>
        </div>
      </div>`;

    $('#admSalir', panel).addEventListener('click', cerrar);
    $('#admLogin', panel).addEventListener('submit', async e => {
      e.preventDefault();
      const val = $('#admClave', panel).value;
      if (await sha256(val) === ADMIN.claveHash) {
        desbloqueado = true;
        pintarEditor();
      } else {
        $('#admError', panel).textContent = 'Esa clave no es. Intenta de nuevo.';
        $('#admClave', panel).select();
      }
    });
  }

  function pintarEditor() {
    let borrador = null;
    try { borrador = JSON.parse(localStorage.getItem('rd_borrador') || 'null'); } catch {}
    datos = clon(borrador || window.RD?.publicado || {});
    datos.promo     ??= {};
    datos.contacto  ??= {};
    datos.instagram ??= {};
    datos.paquetes  ??= [];
    datos.alquiler  ??= {};
    datos.instagram.publicaciones ??= [];
    datos.alquiler.articulos      ??= [];

    const hayBorrador = !!borrador;

    panel.innerHTML = `
      <div class="adm__bar">
        <h1>Panel de contenido<small>Rainbow Decorations</small></h1>
        <span class="adm__status" id="admEstado">${hayBorrador ? 'Tienes cambios sin publicar' : ''}</span>
        <button class="btn btn--ghost btn--sm" id="admDescartar">Descartar cambios</button>
        <button class="btn btn--ghost btn--sm" id="admDescargar">Descargar archivo</button>
        <button class="btn btn--grad btn--sm" id="admPublicar">Publicar en la web</button>
        <button class="btn btn--ghost btn--sm" id="admCerrar">Salir</button>
      </div>

      <div class="adm__wrap">

        <div class="adm__card">
          <h2>Promoción de arriba</h2>
          <p class="hint">Es la barra de colores que aparece en lo más alto de la página.</p>
          <label class="adm__switch">
            <input type="checkbox" id="admPromoActiva" ${datos.promo.activa ? 'checked' : ''}>
            <span>Mostrar la promoción</span>
          </label>
          <div class="adm__row">
            <label>Etiqueta corta <small>(ej. "Oferta", "Nuevo")</small>
              <input type="text" id="admPromoTag" value="${esc(datos.promo.etiqueta)}" placeholder="Reservas abiertas">
            </label>
            <label>Texto del botón <small>(déjalo vacío para no mostrar botón)</small>
              <input type="text" id="admPromoCta" value="${esc(datos.promo.cta)}" placeholder="Aprovechar">
            </label>
          </div>
          <label>Texto de la promoción
            <input type="text" id="admPromoTexto" value="${esc(datos.promo.texto)}" placeholder="15% de descuento en decoraciones de diciembre">
          </label>
          <label>Mensaje que se escribe en WhatsApp al tocar el botón
            <input type="text" id="admPromoMsg" value="${esc(datos.promo.mensaje)}" placeholder="Hola! Quiero aprovechar la promoción.">
          </label>
        </div>

        <div class="adm__card">
          <h2>Publicaciones de Instagram</h2>
          <p class="hint">Copia el enlace de una publicación desde Instagram (botón compartir → copiar enlace) y pégalo aquí. Aparecerá en la página.</p>
          <div class="adm__list" id="admIgLista"></div>
          <button class="btn btn--outline btn--sm" id="admIgAgregar" type="button">+ Agregar publicación</button>
          <div class="adm__row" style="margin-top:22px">
            <label>Título de la sección
              <input type="text" id="admIgTitulo" value="${esc(datos.instagram.titulo)}" placeholder="Lo último de nuestro Instagram">
            </label>
            <label>Frase debajo del título
              <input type="text" id="admIgBajada" value="${esc(datos.instagram.bajada)}" placeholder="Publicaciones recién salidas del horno.">
            </label>
          </div>
        </div>

        <div class="adm__card">
          <h2>Paquetes y precios</h2>
          <p class="hint">Lo que incluye cada paquete va en líneas separadas: una cosa por línea.</p>
          <div class="adm__list" id="admPaqLista"></div>
          <button class="btn btn--outline btn--sm" id="admPaqAgregar" type="button">+ Agregar paquete</button>
        </div>

        <div class="adm__card">
          <h2>Sillas y mesas</h2>
          <p class="hint">Es la página de alquiler. Tiene su propio WhatsApp, distinto al de decoraciones.</p>
          <div class="adm__row">
            <label>WhatsApp de sillas y mesas <small>(sin + ni espacios)</small>
              <input type="text" id="admAlqWa" value="${esc(datos.alquiler.whatsapp)}" placeholder="50769140677">
            </label>
            <label>Cómo se muestra ese número
              <input type="text" id="admAlqWaVis" value="${esc(datos.alquiler.whatsappVisible)}" placeholder="+507 6914-0677">
            </label>
          </div>
          <label>Aviso importante <small>(usa **doble asterisco** para poner algo en negrita)</small>
            <textarea id="admAlqNota" rows="3" placeholder="El alquiler es solo con retiro...">${esc(datos.alquiler.nota)}</textarea>
          </label>
          <label>Condiciones del alquiler <small>(una por línea · **doble asterisco** para negrita)</small>
            <textarea id="admAlqCond" rows="7" placeholder="Los precios son **por día**.">${esc((datos.alquiler.condiciones || []).join('\n'))}</textarea>
          </label>
          <div class="adm__list" id="admAlqLista"></div>
          <button class="btn btn--outline btn--sm" id="admAlqAgregar" type="button">+ Agregar artículo</button>
        </div>

        <div class="adm__card">
          <h2>Contacto y datos</h2>
          <div class="adm__row">
            <label>WhatsApp <small>(con código de país, sin + ni espacios)</small>
              <input type="text" id="admWa" value="${esc(datos.contacto.whatsapp)}" placeholder="50760249687">
            </label>
            <label>Cómo se muestra el número
              <input type="text" id="admWaVis" value="${esc(datos.contacto.whatsappVisible)}" placeholder="+507 6024-9687">
            </label>
          </div>
          <div class="adm__row">
            <label>Usuario de Instagram <small>(sin la @)</small>
              <input type="text" id="admIgUser" value="${esc(datos.contacto.instagram)}" placeholder="rainbowdecorations01">
            </label>
            <label>Horario de atención
              <input type="text" id="admHorario" value="${esc(datos.contacto.horario)}" placeholder="Lunes a domingo · 8:00 a.m. a 8:00 p.m.">
            </label>
          </div>
          <label>Zona que cubren
            <input type="text" id="admZona" value="${esc(datos.contacto.zona)}" placeholder="Arraiján y alrededores de Panamá Oeste">
          </label>
          <label>Formas de pago <small>(se muestra en "Cómo funciona"; vacío = no se muestra)</small>
            <input type="text" id="admPagos" value="${esc(datos.contacto.pagos)}" placeholder="Aceptamos Yappy, efectivo y transferencia.">
          </label>
        </div>

        <div class="adm__card">
          <h2>Publicar en la web</h2>
          <p class="hint">Los cambios ya se ven aquí, pero para que los vea todo el mundo hay que publicarlos.</p>
          <div class="adm__note">
            <b>Token de GitHub.</b> Se guarda solo en este navegador y sirve para publicar.
            Créalo una vez en
            <a href="https://github.com/settings/personal-access-tokens" target="_blank" rel="noopener">github.com/settings/personal-access-tokens</a>
            → <code>Fine-grained token</code>, con acceso solo al repositorio
            <code>${ADMIN.repoNombre}</code> y permiso <code>Contents: Read and write</code>.
            Si alguien más usa esta computadora, mejor borra el token al terminar.
          </div>
          <label>Token de GitHub
            <input type="password" id="admToken" placeholder="github_pat_..." autocomplete="off">
          </label>
          <button class="btn btn--outline btn--sm" id="admOlvidar" type="button">Olvidar el token de este navegador</button>
        </div>

      </div>`;

    // token guardado
    const tokenGuardado = localStorage.getItem('rd_gh_token') || '';
    $('#admToken', panel).value = tokenGuardado;

    pintarListaIg();
    pintarListaPaquetes();
    pintarListaAlquiler();
    enganchar();
    // Ojo: aquí NO llamamos previsualizar(). Guardaría un borrador nuevo
    // apenas se abre el panel y volvería a aparecer justo después de
    // descartar cambios. El borrador solo se crea cuando ella edita algo.
  }

  /* ---------- listas dinámicas ---------- */
  function pintarListaIg() {
    const cont = $('#admIgLista', panel);
    const posts = datos.instagram.publicaciones;

    cont.innerHTML = posts.length ? '' : '<p class="hint" style="margin:0">Todavía no hay publicaciones. Agrega la primera.</p>';

    posts.forEach((p, i) => {
      const item = document.createElement('div');
      item.className = 'adm__item';
      item.innerHTML = `
        <button class="adm__del" type="button" aria-label="Quitar publicación">&times;</button>
        <label>Enlace de la publicación
          <input type="url" data-ig="url" data-i="${i}" value="${esc(p.url)}" placeholder="https://www.instagram.com/p/XXXXXXXX/">
        </label>
        <label>Título corto <small>(opcional)</small>
          <input type="text" data-ig="titulo" data-i="${i}" value="${esc(p.titulo)}" placeholder="Montaje temática Bluey">
        </label>
        <label>Foto de portada <small>(la que se ve antes de abrir la publicación; usa una de la galería)</small>
          <input type="text" data-ig="miniatura" data-i="${i}" value="${esc(p.miniatura)}" placeholder="assets/gallery/g03.jpg">
        </label>`;
      $('.adm__del', item).addEventListener('click', () => {
        posts.splice(i, 1);
        pintarListaIg();
        previsualizar();
      });
      cont.appendChild(item);
    });

    $$('[data-ig]', cont).forEach(inp => inp.addEventListener('input', () => {
      posts[+inp.dataset.i][inp.dataset.ig] = inp.value;
      previsualizar();
    }));
  }

  function pintarListaPaquetes() {
    const cont = $('#admPaqLista', panel);
    cont.innerHTML = '';

    datos.paquetes.forEach((p, i) => {
      const item = document.createElement('div');
      item.className = 'adm__item';
      item.innerHTML = `
        <button class="adm__del" type="button" aria-label="Quitar paquete">&times;</button>
        <div class="adm__row">
          <label>Nombre
            <input type="text" data-pq="nombre" data-i="${i}" value="${esc(p.nombre)}">
          </label>
          <label>Para quién es
            <input type="text" data-pq="para" data-i="${i}" value="${esc(p.para)}">
          </label>
        </div>
        <div class="adm__row">
          <label>Precio <small>(solo el número)</small>
            <input type="text" data-pq="precio" data-i="${i}" value="${esc(p.precio)}">
          </label>
          <label class="adm__switch" style="margin-top:22px">
            <input type="checkbox" data-pq="desde" data-i="${i}" ${p.desde ? 'checked' : ''}>
            <span>Mostrar "desde" antes del precio</span>
          </label>
        </div>
        <label class="adm__switch">
          <input type="checkbox" data-pq="destacado" data-i="${i}" ${p.destacado ? 'checked' : ''}>
          <span>Marcarlo como "Más pedido"</span>
        </label>
        <label>Qué incluye <small>(una cosa por línea)</small>
          <textarea data-pq="incluye" data-i="${i}" rows="6">${esc((p.incluye || []).join('\n'))}</textarea>
        </label>`;
      $('.adm__del', item).addEventListener('click', () => {
        datos.paquetes.splice(i, 1);
        pintarListaPaquetes();
        previsualizar();
      });
      cont.appendChild(item);
    });

    $$('[data-pq]', cont).forEach(inp => inp.addEventListener('input', () => {
      const p = datos.paquetes[+inp.dataset.i];
      const campo = inp.dataset.pq;
      if (inp.type === 'checkbox') {
        p[campo] = inp.checked;
        if (campo === 'destacado' && inp.checked) {
          datos.paquetes.forEach((o, j) => { if (j !== +inp.dataset.i) o.destacado = false; });
          pintarListaPaquetes();
        }
      } else if (campo === 'incluye') {
        p.incluye = inp.value.split('\n').map(s => s.trim()).filter(Boolean);
      } else {
        p[campo] = inp.value;
      }
      previsualizar();
    }));
  }

  function pintarListaAlquiler() {
    const cont = $('#admAlqLista', panel);
    if (!cont) return;
    cont.innerHTML = '';

    datos.alquiler.articulos.forEach((it, i) => {
      const item = document.createElement('div');
      item.className = 'adm__item';
      item.innerHTML = `
        <button class="adm__del" type="button" aria-label="Quitar artículo">&times;</button>
        <div class="adm__row">
          <label>Nombre
            <input type="text" data-al="nombre" data-i="${i}" value="${esc(it.nombre)}">
          </label>
          <label>Medida <small>(ej. 120 × 60 cm)</small>
            <input type="text" data-al="medida" data-i="${i}" value="${esc(it.medida)}">
          </label>
        </div>
        <div class="adm__row">
          <label>Precio <small>(solo el número, ej. 0.50)</small>
            <input type="text" data-al="precio" data-i="${i}" value="${esc(it.precio)}">
          </label>
          <label>Unidad <small>(ej. por silla)</small>
            <input type="text" data-al="unidad" data-i="${i}" value="${esc(it.unidad)}">
          </label>
        </div>
        <label>Descripción
          <input type="text" data-al="detalle" data-i="${i}" value="${esc(it.detalle)}">
        </label>
        <label>Ruta de la imagen <small>(súbela a assets/alquiler/ y pon la ruta aquí)</small>
          <input type="text" data-al="img" data-i="${i}" value="${esc(it.img)}" placeholder="assets/alquiler/silla.jpg">
        </label>
        <label class="adm__switch">
          <input type="checkbox" data-al="foto" data-i="${i}" ${it.foto ? 'checked' : ''}>
          <span>Es una foto real (llena toda la tarjeta). Desmárcalo si la imagen tiene fondo blanco.</span>
        </label>`;
      $('.adm__del', item).addEventListener('click', () => {
        datos.alquiler.articulos.splice(i, 1);
        pintarListaAlquiler();
        previsualizar();
      });
      cont.appendChild(item);
    });

    $$('[data-al]', cont).forEach(inp => inp.addEventListener('input', () => {
      const it = datos.alquiler.articulos[+inp.dataset.i];
      it[inp.dataset.al] = inp.type === 'checkbox' ? inp.checked : inp.value;
      previsualizar();
    }));
  }

  /* ---------- eventos generales ---------- */
  function enganchar() {
    const liga = (id, ruta, esCheck = false) => {
      const el = $(id, panel);
      if (!el) return;
      el.addEventListener('input', () => {
        const partes = ruta.split('.');
        let obj = datos;
        while (partes.length > 1) obj = obj[partes.shift()] ??= {};
        obj[partes[0]] = esCheck ? el.checked : el.value;
        previsualizar();
      });
    };

    liga('#admPromoActiva', 'promo.activa', true);
    liga('#admPromoTag',   'promo.etiqueta');
    liga('#admPromoCta',   'promo.cta');
    liga('#admPromoTexto', 'promo.texto');
    liga('#admPromoMsg',   'promo.mensaje');
    liga('#admIgTitulo',   'instagram.titulo');
    liga('#admIgBajada',   'instagram.bajada');
    liga('#admWa',         'contacto.whatsapp');
    liga('#admWaVis',      'contacto.whatsappVisible');
    liga('#admIgUser',     'contacto.instagram');
    liga('#admHorario',    'contacto.horario');
    liga('#admZona',       'contacto.zona');
    liga('#admPagos',      'contacto.pagos');
    liga('#admAlqWa',      'alquiler.whatsapp');
    liga('#admAlqWaVis',   'alquiler.whatsappVisible');
    liga('#admAlqNota',    'alquiler.nota');

    $('#admAlqCond', panel)?.addEventListener('input', e => {
      datos.alquiler.condiciones = e.target.value.split('\n').map(s => s.trim()).filter(Boolean);
      previsualizar();
    });

    $('#admAlqAgregar', panel)?.addEventListener('click', () => {
      datos.alquiler.articulos.push({
        nombre: 'Artículo nuevo', medida: '', detalle: '',
        precio: '0', unidad: 'por unidad', img: '', foto: false
      });
      pintarListaAlquiler();
      previsualizar();
    });

    $('#admIgAgregar', panel).addEventListener('click', () => {
      datos.instagram.publicaciones.push({ url: '', titulo: '', miniatura: '' });
      pintarListaIg();
    });

    $('#admPaqAgregar', panel).addEventListener('click', () => {
      datos.paquetes.push({ nombre: 'Paquete nuevo', para: '', precio: '0', desde: false, destacado: false, incluye: [] });
      pintarListaPaquetes();
      previsualizar();
    });

    $('#admCerrar', panel).addEventListener('click', cerrar);

    $('#admDescartar', panel).addEventListener('click', () => {
      if (!confirm('¿Seguro? Se pierden los cambios que no hayas publicado.')) return;
      localStorage.removeItem('rd_borrador');
      window.RD?.aplicar?.(window.RD.publicado);
      pintarEditor();
      estado('Cambios descartados', 'ok');
    });

    $('#admDescargar', panel).addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(limpio(), null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'contenido.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      estado('Archivo descargado', 'ok');
    });

    $('#admOlvidar', panel).addEventListener('click', () => {
      localStorage.removeItem('rd_gh_token');
      $('#admToken', panel).value = '';
      estado('Token borrado de este navegador', 'ok');
    });

    $('#admPublicar', panel).addEventListener('click', publicar);
  }

  function estado(txt, tipo = '') {
    const el = $('#admEstado', panel);
    if (!el) return;
    el.textContent = txt;
    el.className = `adm__status ${tipo}`;
  }

  /* ---------- vista previa + borrador ---------- */
  function limpio() {
    const d = clon(datos);
    d.instagram.publicaciones = (d.instagram.publicaciones || []).filter(p => p.url && p.url.trim());
    delete d._ayuda;
    return d;
  }

  function previsualizar() {
    const d = limpio();
    localStorage.setItem('rd_borrador', JSON.stringify(d));
    window.RD?.aplicar?.(d);
    estado('Tienes cambios sin publicar');
  }

  /* ---------- publicar en GitHub ---------- */
  async function publicar() {
    const token = $('#admToken', panel).value.trim();
    if (!token) {
      estado('Falta el token de GitHub para publicar', 'err');
      $('#admToken', panel).focus();
      return;
    }

    const boton = $('#admPublicar', panel);
    boton.disabled = true;
    estado('Publicando…');

    const base = `https://api.github.com/repos/${ADMIN.repoDueno}/${ADMIN.repoNombre}/contents/${ADMIN.archivo}`;
    const cab = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };

    try {
      // sha del archivo actual (hace falta para reemplazarlo)
      let sha;
      const actual = await fetch(`${base}?ref=main`, { headers: cab });
      if (actual.ok) sha = (await actual.json()).sha;
      else if (actual.status === 401) throw new Error('El token no es válido o ya venció.');
      else if (actual.status === 403) throw new Error('El token no tiene permiso sobre este repositorio.');
      else if (actual.status !== 404) throw new Error(`GitHub respondió ${actual.status}.`);

      const texto = JSON.stringify(limpio(), null, 2);
      const b64 = btoa(String.fromCharCode(...new TextEncoder().encode(texto)));

      const res = await fetch(base, {
        method: 'PUT',
        headers: { ...cab, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Actualizo el contenido desde el panel',
          content: b64,
          branch: 'main',
          ...(sha ? { sha } : {})
        })
      });

      if (!res.ok) {
        const cuerpo = await res.json().catch(() => ({}));
        throw new Error(cuerpo.message || `GitHub respondió ${res.status}.`);
      }

      localStorage.setItem('rd_gh_token', token);
      localStorage.removeItem('rd_borrador');
      window.RD.publicado = limpio();
      estado('¡Publicado! Tarda un minuto en verse en la web.', 'ok');
      window.rdConfetti?.(innerWidth / 2, innerHeight * 0.3, 90);
    } catch (e) {
      estado(e.message || 'No se pudo publicar.', 'err');
    } finally {
      boton.disabled = false;
    }
  }
})();
