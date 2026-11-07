# Biblioteca Campos

Panel de autores y catálogo de libros para el Laboratorio 12. La aplicación usa Next.js, Prisma y PostgreSQL en Supabase.

- `/`: autores, formularios de gestión y totales de la biblioteca.
- `/books`: búsqueda en tiempo real, filtros, ordenamiento, paginación y gestión de libros.
- `/authors/[id]`: datos del autor, bibliografía, estadísticas y formularios.
- `GET /api/books/search`: acepta `search`, `genre`, `authorName`, `authorId`, `page`, `limit`, `sortBy` y `order`.
- `GET /api/authors/[id]/stats`: total de obras, primera y última publicación, promedio y extremos de páginas, y géneros.

Para desarrollo local, usar Node 24 y pnpm. Configurar `DATABASE_URL` en un archivo privado `.env`, instalar con `pnpm install`, crear el esquema con `pnpm db:push` y arrancar con `pnpm dev`. El catálogo de ejemplo se puede cargar con `node --env-file=.env prisma/demo.mjs`. Usar únicamente registros de demostración: la práctica permite editar el catálogo sin iniciar sesión.

## Conclusiones de la práctica

1. Implementé la búsqueda en PostgreSQL para que título, autor y género se puedan combinar en una sola consulta.
2. Añadí un criterio de desempate al orden para que la paginación sea estable cuando varios libros comparten el mismo año o título.
3. Separé los libros sin número de páginas de los cálculos de promedio y extremos para evitar que los datos faltantes alteren las estadísticas.
4. Reutilicé las mismas rutas de autores y libros en las tres páginas; así, las validaciones se aplican aunque la solicitud venga de Thunder Client.
5. Comprobé la búsqueda y las estadísticas contra Supabase y mantuve la cadena de conexión fuera del repositorio.
