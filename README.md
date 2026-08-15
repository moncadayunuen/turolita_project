# TuRolita

TuRolita es una aplicación web de música creada como proyecto de práctica de **UX/UI y desarrollo frontend**. Permite descubrir los hits del momento, explorar álbumes y artistas, escuchar muestras de canciones y organizar una biblioteca personal.

La interfaz está diseñada como una experiencia de reproductor musical moderna, responsive y centrada en la exploración rápida del contenido proporcionado por Deezer.

## Funcionalidades

- Ranking de canciones populares obtenido desde Deezer.
- Búsqueda por canción, artista o álbum.
- Vista detallada de álbumes y artistas.
- Reproducción de muestras musicales de 30 segundos.
- Reproductor persistente con:
  - Reproducir y pausar.
  - Canción anterior y siguiente.
  - Barra de progreso.
  - Control de volumen.
- Biblioteca de canciones favoritas.
- Creación y edición de playlists personales.
- Agregar o quitar canciones de una playlist.
- Reproducir una colección completa.
- Persistencia local mediante Zustand y `localStorage`.
- Navegación con la tecla `Escape`.
- Diseño adaptado para escritorio y dispositivos móviles.

## Tecnologías

- [Next.js 16](https://nextjs.org/) con App Router.
- [React 19](https://react.dev/).
- [TypeScript](https://www.typescriptlang.org/).
- [Tailwind CSS 4](https://tailwindcss.com/).
- [Sass](https://sass-lang.com/) para estilos personalizados.
- [Zustand](https://zustand.docs.pmnd.rs/) para el estado global y su persistencia.
- [Axios](https://axios-http.com/) para solicitudes HTTP.
- [React Icons](https://react-icons.github.io/react-icons/).
- [Deezer API](https://developers.deezer.com/api) como fuente del catálogo musical.

## Diseño y experiencia

TuRolita utiliza una interfaz oscura con naranja como color de acento. La navegación mantiene el reproductor accesible mientras el usuario explora contenido, y todos los controles principales reflejan el estado real de reproducción.

La experiencia incluye estados activos, vacíos y de carga, controles accesibles mediante etiquetas y navegación responsive para móvil.

## Estado y persistencia

Zustand administra:

- Canción actual.
- Estado de reproducción.
- Cola de reproducción.
- Canciones favoritas.
- Playlists y sus canciones.

Los favoritos y playlists se guardan bajo la clave `turolita-library` de `localStorage`. Estos datos pertenecen únicamente al navegador y dispositivo actual; no se sincronizan entre dispositivos ni utilizan una cuenta de usuario.

## Integración con Deezer

La compilación obtiene desde Deezer el ranking, los álbumes destacados y la información de sus artistas. Estos datos se incorporan a la exportación estática para que la aplicación pueda funcionar en GitHub Pages sin un servidor propio.

Un workflow programado vuelve a compilar el sitio diariamente para actualizar este contenido. La reproducción utiliza el campo `preview` de Deezer, por lo que cada muestra tiene una duración aproximada de 30 segundos.

## Ejecutar el proyecto

Requisitos:

- Node.js 20 o posterior.
- npm.
- Conexión a internet para consultar Deezer y cargar las portadas.

Instala las dependencias:

```bash
npm install
```

Inicia el entorno de desarrollo:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Comandos disponibles

```bash
npm run dev    # Entorno de desarrollo
npm run build  # Compilación de producción
npm run start  # Servidor de producción
npm run lint   # Revisión de código
```

## Estructura principal

```text
app/
├── store/useFavoriteSongs.ts    # Estado global, favoritos y playlists
├── types/index.tsx              # Tipos de canciones, álbumes y artistas
├── utils/httpClient.tsx         # Cliente HTTP de Deezer
├── globals.scss                 # Sistema visual y estilos responsive
├── homeClient.tsx               # Interfaz e interacciones del reproductor
├── layout.tsx                   # Layout y metadata
└── page.tsx                     # Carga inicial del ranking
```

## Publicación

El workflow `.github/workflows/deploy-pages.yml` genera una exportación estática y la publica automáticamente en GitHub Pages después de cada cambio enviado a `main`. También se ejecuta una vez al día para refrescar el ranking de Deezer.

## Próximos pasos

- Optimizar las portadas con `next/image`.
- Agregar reordenamiento de canciones en playlists.
- Incorporar reproducción aleatoria y repetición funcionales.
- Sincronizar la biblioteca mediante autenticación y almacenamiento remoto.
- Añadir pruebas de componentes y flujos principales.

## Propósito

Este proyecto tiene fines educativos y de portafolio. Deezer y sus recursos visuales pertenecen a sus respectivos propietarios; TuRolita no aloja archivos musicales completos.
