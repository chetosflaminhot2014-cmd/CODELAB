# OKNEW — Alpha 0.1.0

**Open Knowledge New** — Conocimiento Abierto Nuevo.

Eslogan: *A new way to learn. Knowledge for everyone.*

Plataforma de aprendizaje para explorar tecnologías, practicar con ejemplos editables y desarrollar proyectos.

## Frontend actual
- HTML5, CSS3 y JavaScript vanilla.
- Catálogo de 16 tecnologías y rutas introductorias.
- Progreso y proyectos locales con claves de almacenamiento compatibles con versiones anteriores.

## Cuentas y persistencia (rama de implementación)
El backend de la carpeta `server/` incorpora:
- Registro con correo y contraseña, verificación por email y restablecimiento de contraseña.
- Hash de contraseñas con bcryptjs, tokens de un solo uso almacenados como SHA-256 y sesiones en PostgreSQL.
- Perfil, progreso por curso/lección y proyectos sincronizados.
- Importación por unión de los datos locales existentes; no se eliminan los datos locales durante la sincronización.

## Variables necesarias del backend
Consulta `server/.env.example`. En producción son obligatorias:
- `DATABASE_URL`, `SESSION_SECRET`, `FRONTEND_URL`.
- Resend: `RESEND_API_KEY` y `RESEND_FROM` (dirección de un dominio verificado); `RESEND_REPLY_TO` es opcional.

## Ejecutar backend localmente
Desde `server/`:
1. Copia `.env.example` a `.env` y completa los valores.
2. Ejecuta `npm install`.
3. Ejecuta `npm start`.

El servidor aplica `schema.sql` al arrancar. No se deben subir secretos al repositorio.

## Estado
La implementación de cuentas y sincronización está en desarrollo en la rama `feature/oknew-accounts-postgres`. No se considera activa hasta desplegar y comprobar el backend, PostgreSQL y el proveedor de correo. El plan gratuito de Render Postgres caduca a los 30 días; solo sirve para pruebas y no debe usarse como almacenamiento permanente.
