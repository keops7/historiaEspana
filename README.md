# Historia de España

Juego de defensa de fortaleza (Three.js, un único archivo HTML autocontenido).

## Despliegue en Cloudflare Pages

1. En el panel de Cloudflare, crea un proyecto de **Pages** conectado a este repositorio de GitHub.
2. Configuración de build:
   - **Production branch**: `main`
   - **Framework preset**: `None`
   - **Build command**: (vacío)
   - **Build output directory**: `/`
   - **Root directory**: `/`
3. Guarda y despliega. Cada `push` a `main` generará un nuevo despliegue automáticamente.

No hay dependencias ni paso de compilación: `index.html` es el juego completo.
