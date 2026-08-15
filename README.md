# Rainbow Decorations — sitio web

Página web comercial para **Rainbow Decorations** (@rainbowdecorations01), decoración de
fiestas en Arraiján, Panamá Oeste.

Es un sitio estático: solo HTML, CSS y JavaScript. No necesita servidor, base de datos ni
instalar nada. Se publica gratis en GitHub Pages.

```
index.html            → toda la página
assets/css/style.css  → estilos
assets/js/app.js      → interacciones (galería, formulario, animaciones)
assets/gallery/       → las fotos
assets/img/           → favicon
```

---

## Cómo cambiar cosas

### El número de WhatsApp

En `assets/js/app.js`, arriba del todo:

```js
const CONFIG = {
  phone: '50760249687',   // ← formato internacional, sin + ni espacios
  email: ''
};
```

Ese número alimenta **todos** los botones de WhatsApp de la página.
También conviene actualizarlo en el pie de página (`index.html`, busca `+507 6024-9687`).

### Activar el correo con las fotos adjuntas

Hoy el formulario de propuestas abre WhatsApp con todos los datos listos y copia la primera
foto al portapapeles para que el cliente solo la pegue en el chat.

Si además quieres que las fotos lleguen **automáticamente al correo**, pon el correo en
`CONFIG.email`:

```js
const CONFIG = {
  phone: '50760249687',
  email: 'correodeladuena@gmail.com'
};
```

La primera vez que alguien envíe el formulario, [FormSubmit](https://formsubmit.co) manda un
correo de activación: hay que abrirlo y confirmar una sola vez. Desde ahí, cada propuesta
llega al correo con las imágenes adjuntas. Es gratis y no requiere crear cuenta.

### Agregar o cambiar fotos de la galería

1. Copia la foto nueva en `assets/gallery/` (por ejemplo `g13.jpg`).
2. En `index.html`, busca `<div class="gallery"` y duplica un bloque `<figure class="gitem">`:

```html
<figure class="gitem" data-cat="cumple">
  <button data-cursor="zoom" aria-label="Ampliar: Mi decoración">
    <img src="assets/gallery/g13.jpg" alt="Descripción de la foto" loading="lazy">
    <figcaption><b>Título</b><span>Detalle corto</span></figcaption>
  </button>
</figure>
```

`data-cat` define en qué filtro aparece. Los valores son:
`cumple`, `baby`, `bouquet`, `regalo`, `catalogo`.

### Cambiar precios

Están en `index.html`, en la sección `<section class="section" id="paquetes">`.
Los precios actuales salieron de los flyers publicados en Instagram.

---

## Ver la página en la computadora

```bash
python3 -m http.server 4321
```

Y abre <http://localhost:4321>.

---

## Publicar los cambios

Cada vez que edites algo:

```bash
git add -A && git commit -m "Actualizo la página" && git push
```

GitHub Pages actualiza el sitio solo, en un minuto aproximadamente.

---

## Notas

- Las fotos y el logo provienen de la cuenta de Instagram del negocio, usadas con permiso
  de la dueña.
- La página no incluye testimonios ni cantidad de eventos porque no había datos reales
  verificables; si la dueña los aporta, se pueden agregar.
- Funciona sin JavaScript (se ve todo, sin las animaciones) y respeta la preferencia de
  "reducir movimiento" del sistema.
