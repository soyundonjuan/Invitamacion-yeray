# Invitación XV - Yeray Pacheco

Landing page estática para una fiesta de 15 años con estilo oro rosa.

## Editar datos

Los datos principales están en `script.js`, dentro del objeto `invitation`:

- `startsAt` y `endsAt`: fecha y hora del evento.
- `locationName`, `address` y `mapsUrl`: lugar y enlace de Google Maps.
- `playlistUrl`: playlist embebida de Spotify.
- `socials`: enlaces de Instagram, TikTok y Facebook.
- `guestList`: nombres de invitados y cupos asignados.

## Administrar invitados

Abre `/admin/` para agregar, editar o eliminar invitados y cupos. Esta versión
guarda la lista en `localStorage`, así que funciona en el mismo navegador donde
se administra.

## Fotos

Guarda las fotos de la cumpleañera en:

- `assets/img1.jpeg`
- `assets/img2.jpeg`
- `assets/img3.jpeg`

La página las tomará automáticamente.
