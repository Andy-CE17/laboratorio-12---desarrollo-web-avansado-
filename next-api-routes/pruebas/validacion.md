# Validación de la parte guiada

Completé las pruebas el 7 de noviembre de 2026 con Thunder Client en Visual Studio Code y PostgreSQL de Supabase.

| Solicitud | Resultado comprobado |
| --- | --- |
| GET /api/authors | 200 y listado de autores |
| POST /api/authors | 201 y autor creado |
| GET /api/authors/{id} | 200 y datos del autor |
| PUT /api/authors/{id} | 200 y biografía actualizada sin perder el año de nacimiento |
| GET /api/authors/{id}/books | 200 y libros asociados al autor |
| POST /api/books | 201 y libro asociado a un autor existente |
| GET /api/books | 200 y listado de libros |
| GET /api/books?genre=Novela | 200 y filtro por género |
| GET /api/books/{id} | 200 y detalle del libro |
| PUT /api/books/{id} | 200 y descripción actualizada |
| DELETE /api/books/{id} | 200 y eliminación del libro de prueba |
| GET /api/books/{id} después de eliminarlo | 404 y mensaje de libro no encontrado |

Conecté TablePlus mediante el Session pooler de Supabase con SSL requerido. Verifiqué las estructuras de Author y Book, la clave foránea y el registro guardado por la API antes de eliminar el libro de prueba. Conservé el autor de ejemplo.

El código pasó lint, compilación de producción y 30 comprobaciones de integración. Las capturas reales se entregan en el documento de evidencias; las credenciales y los archivos generados permanecen fuera de Git.

La búsqueda avanzada, la paginación, las estadísticas y las páginas de gestión de la sección TAREA siguen pendientes.
