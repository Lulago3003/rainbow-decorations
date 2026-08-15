# Rainbow Decorations — sitio web

Página web comercial para **Rainbow Decorations** (@rainbowdecorations01), decoración de
fiestas en Arraiján, Panamá Oeste.

Es un sitio estático: solo HTML, CSS y JavaScript. No necesita servidor ni base de datos.
Se publica gratis en GitHub Pages.

**En vivo:** https://lulago3003.github.io/rainbow-decorations/

```
index.html            → la página principal (decoraciones)
alquiler.html         → alquiler de sillas y mesas (WhatsApp aparte)
privacidad.html       → política de privacidad y cookies
terminos.html         → términos y condiciones
contenido.json        → el contenido que se edita desde el panel
assets/css/style.css  → estilos
assets/js/app.js      → interacciones de la página
assets/js/admin.js    → panel de administración
assets/gallery/       → fotos de decoraciones
assets/alquiler/      → fotos de sillas y mesas
```

## Ojo: hay DOS números de WhatsApp

| Página | Para qué | Número |
|---|---|---|
| `index.html` | Decoraciones, bouquets, regalos, mobiliario decorativo | **+507 6024-9687** |
| `alquiler.html` | Solo sillas y mesas para invitados | **+507 6914-0677** |

En el HTML, cualquier enlace con `data-wa-tel="alquiler"` va al segundo número.
Sin ese atributo, va al de decoraciones. Ambos se editan desde el panel.

---

## 1. El panel para la dueña

La dueña puede editar la página ella misma, sin tocar código.

**Cómo entrar:** agrega `#admin` al final de la dirección:

```
https://lulago3003.github.io/rainbow-decorations/#admin
```

**Clave por defecto:** `rainbow2026`

### Qué puede editar

| Sección | Qué controla |
|---|---|
| Promoción de arriba | La barra de colores del tope: encenderla/apagarla, texto, etiqueta, botón y el mensaje que se escribe en WhatsApp |
| Publicaciones de Instagram | Pega el enlace de una publicación y aparece en la página. Se pueden agregar, quitar y reordenar |
| Paquetes y precios | Nombre, precio, para quién es, qué incluye, y cuál sale marcado como "Más pedido" |
| Sillas y mesas | Precios, medidas, descripciones, el aviso de retiro y el WhatsApp de esa página |
| Contacto y datos | WhatsApp, Instagram, horario, zona de cobertura y formas de pago |

Los cambios **se ven al instante** en la página mientras edita (queda guardado como borrador
en su navegador). Para que los vea todo el mundo hay que darle a **Publicar en la web**.

### Publicar: las dos formas

**Opción A — Publicar ella misma (recomendado).** Necesita un token de GitHub, que se crea
una sola vez:

1. Entrar a <https://github.com/settings/personal-access-tokens>
2. *Generate new token* → **Fine-grained token**
3. En *Repository access*, escoger **Only select repositories** → `rainbow-decorations`
4. En *Permissions* → *Repository permissions* → **Contents: Read and write**
5. Copiar el token y pegarlo en el panel, en el campo "Token de GitHub"

A partir de ahí, el botón **Publicar en la web** sube los cambios y en un minuto están en
línea. El token queda guardado en su navegador; hay un botón para borrarlo.

**Opción B — Sin token.** El botón **Descargar archivo** genera el `contenido.json`
actualizado; ella te lo manda y tú lo subes al repositorio.

### Sobre la clave

La clave del panel solo evita que alguien entre por curiosidad. **No es seguridad real:**
en una web estática cualquiera puede leer el código. Lo que de verdad protege la publicación
es el token de GitHub — sin él, nadie puede cambiar la página aunque entre al panel.

Para cambiar la clave, genera el SHA-256 de la nueva y pégalo en `assets/js/admin.js`
(constante `claveHash`):

```bash
node -e "console.log(require('crypto').createHash('sha256').update('TU-CLAVE-NUEVA').digest('hex'))"
```

---

## 2. Cambios que se hacen en el código

### El número de WhatsApp

Se edita desde el panel. Si lo quieres cambiar a mano, está en `contenido.json`:

```json
"contacto": { "whatsapp": "50760249687" }
```

Formato internacional, sin `+` ni espacios. Ese número alimenta **todos** los botones de
WhatsApp de la página. Recuerda cambiarlo también en `privacidad.html` y `terminos.html`.

### Agregar fotos a la galería

1. Copia la foto en `assets/gallery/` (por ejemplo `g13.jpg`).
2. En `index.html`, busca `<div class="gallery"` y duplica un bloque:

```html
<figure class="gitem" data-cat="cumple">
  <button aria-label="Ampliar: Mi decoración">
    <img src="assets/gallery/g13.jpg" alt="Descripción de la foto" loading="lazy">
    <figcaption><b>Título</b><span>Detalle corto</span></figcaption>
  </button>
</figure>
```

`data-cat` define en qué filtro aparece: `cumple`, `baby`, `bouquet`, `regalo`, `catalogo`.

### La ubicación del mapa

Las coordenadas están en `index.html` (sección `#ubicacion`) y se repiten en el mapa, en el
botón de Waze y en el de Google Maps:

```
8.9390414, -79.6420196
```

### Activar el correo con las fotos adjuntas

Hoy el formulario abre WhatsApp con todos los datos y copia la primera foto al portapapeles.
Si además quieres que las fotos lleguen por correo, hay que reactivar el bloque de
[FormSubmit](https://formsubmit.co) — está documentado en el historial de git (commit inicial).

---

## 3. Ver la página en la computadora

```bash
python3 -m http.server 4321
```

Y abre <http://localhost:4321>.

---

## 4. Publicar cambios de código

```bash
git add -A && git commit -m "Actualizo la página" && git push
```

GitHub Pages actualiza el sitio solo, en un minuto aproximadamente.

---

## 5. Datos del negocio ya confirmados

- **Pagos:** Yappy y efectivo.
- **Atención:** por WhatsApp 24/7. La hora de retiro se coordina en el chat.
- **Alquiler de sillas y mesas:** los precios son **por día**. Desde el retiro hay
  **24 horas** para devolver; más tiempo se cobra por día adicional. Solo retiro
  en el local, sin entrega a domicilio.
- **Existencias:** las cantidades son limitadas y **no se publican en la página** a
  propósito. Siempre se confirma disponibilidad por WhatsApp.

### Pendiente todavía

- [ ] **Testimonios.** No se pusieron porque no hay reseñas reales verificables. Con
      3 o 4 de clientes valdría la pena agregar una sección.
- [ ] **Política de cancelación de decoraciones.** Los términos dicen que se acuerda
      por WhatsApp al reservar. Si hay un % de abono fijo, conviene escribirlo.

## Notas

- Las fotos y el logo provienen del Instagram del negocio, usadas con permiso de la dueña.
- Los precios salieron de los flyers publicados en su Instagram.
- La página funciona sin JavaScript (se ve todo, sin animaciones) y respeta la preferencia de
  "reducir movimiento" del sistema.
- El aviso de cookies y los textos legales están redactados según la **Ley 81 de 2019** de
  Panamá sobre protección de datos personales. Son un punto de partida sólido, no un
  dictamen legal: si el negocio crece, conviene que un abogado los revise.
