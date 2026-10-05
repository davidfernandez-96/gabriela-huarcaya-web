# Gabriela Huarcaya · Landing

Landing de marca personal de Gabriela Huarcaya, Master en Lifting de Pestañas.
Es el diseño de Claude Design publicado tal cual (mismas animaciones), con un editor real:
la dueña entra con correo y contraseña desde el ícono de usuario del pie de página
(o en `/#editar`) y cambia textos y fotos sin tocar código.

> Proyecto independiente. No comparte base de datos, repositorio ni archivos con ningún otro proyecto.

## Cómo está hecho

| Archivo | Qué hace |
|---|---|
| `index.html` | La página: plantilla del diseño, animaciones, panel de login y editor. |
| `support.js` | Motor de plantillas de Claude Design (sin cambios). |
| `image-slot.js` | Recuadros de foto. Adaptado para leer las fotos de la base de datos. |
| `js/config.js` | URL y clave pública de Supabase. |
| `js/cms.js` | Login, lectura del contenido publicado y publicación (textos + fotos). |
| `img/` | Fotos de referencia (Unsplash) mientras llegan las reales. |

**Backend:** Supabase, proyecto `gabriela-huarcaya-web` (región São Paulo):

- Tabla `site_content`: una fila `main` con `data` (textos, `"seccion.campo": valor`) y `slots` (fotos).
- Tabla `editors`: correos autorizados a publicar. Nadie más puede escribir (RLS).
- Bucket `site-images`: fotos subidas desde el editor (lectura pública).

Los textos que no estén en `data` toman su valor por defecto de `ED_DEFAULT` en `index.html`.

## Dar acceso a Gabriela (una sola vez)

1. En [supabase.com/dashboard](https://supabase.com/dashboard) → proyecto **gabriela-huarcaya-web** → **Authentication → Users → Add user → Create new user**.
   Escribe su correo y una contraseña, y marca **Auto Confirm User**.
2. En **SQL Editor** ejecuta (con su correo, en minúsculas):
   ```sql
   insert into public.editors (email) values ('correo-de-gabriela@ejemplo.com');
   ```
3. En **Authentication → URL Configuration** pon como **Site URL** la dirección de la web
   (por ejemplo `https://davidfernandez-96.github.io/gabriela-huarcaya-web/`) y agrégala en **Redirect URLs**.
   Así funciona el enlace de "¿La olvidaste?".
4. Recomendado: **Authentication → Sign In / Providers → Email** → desactiva **Allow new users to sign up**.
   (Aunque alguien se registre, no podría editar: solo publican los correos de `editors`.)

## Editar la web

1. Ícono de usuario en el pie de página (o `https://…/#editar`) → correo y contraseña.
2. Elige la sección a la izquierda, cambia textos o arrastra fotos a los recuadros.
3. **Publicar cambios** → se ve en la web al recargar.

- **WhatsApp:** sección propia con número (validado), mensaje que llega, texto del botón verde,
  mostrar/ocultar el botón flotante y "Probar mi WhatsApp". Afecta a todos los botones de la web.
- **Logo:** *Ajustes del sitio → Tu logo*. Se le quita solo el fondo blanco, se recorta y se centra.
  Aparece en el menú, en el sello, en el pie, en el editor, en la pantalla de carga y como ícono de la pestaña.
- **Fotos inteligentes:** al subir una foto se optimiza (WebP, máx. 1600 px, orientación corregida) y se
  detecta su punto de interés (rostro o zona con más detalle). El recorte se recalcula en cada tamaño de
  pantalla para que lo importante quede siempre a la vista. "Encuadrar" permite un ajuste manual, que tiene prioridad.

## Responsive

Revisado automáticamente (sin scroll horizontal, nada fuera de pantalla, sin textos cortados y
botones táctiles ≥ 40 px) en 320, 360, 375, 390, 414, 430, 600, 768, 820, 1024, 1180, 1280, 1366,
1440, 1536, 1920 y 2560 px. Celular y tablet vertical usan la composición móvil; desde 1024 px, la de escritorio.

## Desarrollo local

```bash
npx http-server . -p 5174 -c-1
```

Abrir http://localhost:5174. No hay paso de compilación: lo que está en el repositorio es lo que se publica.

## Pendiente con datos reales

- [ ] Fotos reales (las de `img/` son de referencia, de Unsplash).
- [ ] Número de WhatsApp (ahora `51900000000`) e Instagram → *Ajustes del sitio*.
- [ ] Duración, inversión y certificado del curso → *El curso*.
- [ ] Testimonios reales (la sección aparece sola cuando hay al menos uno).
