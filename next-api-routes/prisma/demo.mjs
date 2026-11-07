import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const authors = [
  {
    name: "Gabriel García Márquez", email: "gabo@example.com", nationality: "Colombia", birthYear: 1927,
    bio: "Escritor colombiano, autor de Cien años de soledad y Premio Nobel de Literatura en 1982.",
    books: [
      ["Cien años de soledad", 1967, "Novela", 417, "La historia de la familia Buendía a lo largo de varias generaciones en Macondo."],
      ["El amor en los tiempos del cólera", 1985, "Novela", null, "Florentino y Fermina vuelven a encontrarse después de décadas."],
      ["Crónica de una muerte anunciada", 1981, "Novela", null, "Una comunidad reconstruye los hechos que precedieron a la muerte de Santiago Nasar."],
      ["La hojarasca", 1955, "Novela", null, "Tres generaciones recuerdan a un hombre durante su velorio en Macondo."],
      ["Relato de un náufrago", 1970, "Crónica", 110, "Testimonio de un marinero que sobrevivió a la deriva en el Caribe."],
      ["Doce cuentos peregrinos", 1992, "Cuento", null, "Historias de personajes latinoamericanos en distintas ciudades de Europa."],
    ],
  },
  {
    name: "Elena del Valle", email: "elena.demo@example.com", nationality: "Perú",
    bio: "Autora ficticia del catálogo de demostración.",
    books: [
      ["Los mapas del silencio", 2015, "Novela", 232, "Una archivista sigue el rastro de las cartas que dejó su abuela."],
      ["Voces del malecón", 2018, "Cuento", 128, "Relatos breves sobre encuentros y despedidas frente al mar."],
      ["La ciudad de las azoteas", 2020, "Novela", 284, "Dos vecinas reconstruyen la historia de su edificio a partir de objetos olvidados."],
      ["Cuaderno de neblina", 2023, "Poesía", 94, "Poemas que observan el paso del tiempo en la costa."],
    ],
  },
  {
    name: "Mateo Salazar", email: "mateo.demo@example.com", nationality: "Perú",
    bio: "Autor ficticio del catálogo de demostración.",
    books: [
      ["El hilo de la montaña", 2014, "Crónica", 186, "Un recorrido a pie por pueblos unidos por caminos antiguos."],
      ["La orilla de los días", 2019, "Cuento", 152, "Historias sobre los pequeños cambios que marcan una vida."],
      ["El último faro", 2021, "Novela", 312, "Una familia regresa a un puerto que está a punto de desaparecer."],
      ["Inventario de la lluvia", 2024, "Poesía", 76, "Versos sobre el agua, la memoria y el paisaje."],
    ],
  },
];

async function seed() {
  await prisma.$transaction(async (db) => {
    for (const { books, ...data } of authors) {
      const author = await db.author.upsert({ where: { email: data.email }, create: data, update: {} });
      for (const [title, publishedYear, genre, pages, description] of books) {
        const existing = await db.book.findFirst({ where: { title, authorId: author.id }, select: { id: true } });
        if (!existing) await db.book.create({ data: { title, publishedYear, genre, pages, description, authorId: author.id } });
      }
    }
  }, { timeout: 30000 });
  console.log("Catálogo de demostración preparado.");
}

seed().catch(() => { console.error("No se pudo preparar el catálogo."); process.exitCode = 1; }).finally(() => prisma.$disconnect());
