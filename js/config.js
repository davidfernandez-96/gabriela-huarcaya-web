// Configuración pública de la web de Gabriela Huarcaya.
// La clave "publishable" de Supabase es pública por diseño: la seguridad la ponen
// las políticas RLS de la base de datos (solo las editoras pueden publicar).
window.GH_CONFIG = {
  supabaseUrl: 'https://croulwnrqsviosxrilte.supabase.co',
  supabaseKey: 'sb_publishable_RY2kGYxGGeAs7v40BArABw_7CVc_dyu',
  bucket: 'site-images',
  // Fotos de respaldo si la base de datos no responde (las mismas que se publicaron al inicio).
  fallbackSlots: {
    'gh-hero': { u: 'img/hero.jpg', s: 1, x: 0, y: 0 },
    'gh-expand': { u: 'img/expand.jpg', s: 1, x: 0, y: 0 },
    'gh-sobre': { u: 'img/sobre.jpg', s: 1, x: 0, y: 0 },
    'gh-curso': { u: 'img/curso.jpg', s: 1, x: 0, y: 0 },
    'gh-trabajo-1': { u: 'img/trabajo-1.jpg', s: 1, x: 0, y: 0 },
    'gh-trabajo-2': { u: 'img/trabajo-2.jpg', s: 1, x: 0, y: 0 },
    'gh-trabajo-3': { u: 'img/trabajo-3.jpg', s: 1, x: 0, y: 0 },
    'gh-trabajo-4': { u: 'img/trabajo-4.jpg', s: 1, x: 0, y: 0 },
    'gh-trabajo-5': { u: 'img/trabajo-5.jpg', s: 1, x: 0, y: 0 },
    'gh-trabajo-6': { u: 'img/trabajo-6.jpg', s: 1, x: 0, y: 0 },
    'gh-trabajo-7': { u: 'img/trabajo-7.jpg', s: 1, x: 0, y: 0 },
    'gh-trabajo-8': { u: 'img/trabajo-8.jpg', s: 1, x: 0, y: 0 },
    'gh-antes': { u: 'img/antes.jpg', s: 1, x: 0, y: 0 },
    'gh-despues': { u: 'img/despues.jpg', s: 1, x: 0, y: 0 }
  }
};
