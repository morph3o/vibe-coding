# 🎵 Vibe Coding

¡Bienvenido a **Vibe Coding**! Una app web donde puedes buscar canciones según tu vibe, escuchar previews, ver letras sincronizadas y compartir tu mood musical con tus amigos. Todo con un diseño vibrante, moderno y súper interactivo.

## 🚀 ¿Qué puedes hacer aquí?
- Buscar canciones en iTunes según tu estado de ánimo o vibe.
- Escuchar previews de 30 segundos con controles avanzados (play, pausa, adelantar, retroceder, barra de progreso).
- Ver la letra de la canción sincronizada tipo karaoke (si está disponible).
- Cambiar el diseño de la lista de resultados (vista lista o cajas/grid).
- Compartir cualquier canción en redes sociales o apps de mensajería.

## ✨ Tecnologías principales
- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- [Bootstrap 5](https://getbootstrap.com/) + Sass
- [iTunes Search API](https://affiliate.itunes.apple.com/resources/documentation/itunes-store-web-service-search-api/)
- [Lyrics.ovh API](https://lyricsovh.docs.apiary.io/)
- Web Share API y enlaces sociales

## 📦 Instalación y uso local
1. Clona este repo:
   ```bash
   git clone https://github.com/morph3o/vibe-coding.git
   cd vibe-coding
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

## 🖼️ Estructura del proyecto
```
src/
  ├── components/     # Componentes reutilizables
  ├── pages/          # Páginas principales
  ├── styles/         # Estilos globales y de tema
  └── utils/          # Utilidades y helpers
```

## 🛠️ Personalización
- Puedes cambiar los colores vibrantes en `src/styles/main.scss`.
- Agrega más redes sociales en el botón de compartir si lo deseas.
- El diseño es responsive y se adapta a cualquier dispositivo.

## 🤝 Contribuir
¡Las PRs y sugerencias son bienvenidas! Si tienes ideas para nuevas features, mejoras de UI o integración con más APIs, ¡abre un issue o un pull request!

## 📄 Licencia
MIT. [Ver licencia](LICENSE)

---

Hecho con 💜 por [Piero Divasto](https://github.com/morph3o)
