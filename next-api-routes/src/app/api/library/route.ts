import { handleApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [authors, books, genres] = await prisma.$transaction([
      prisma.author.count(), prisma.book.count(),
      prisma.book.groupBy({ by: ["genre"], where: { genre: { not: null } }, orderBy: { genre: "asc" } }),
    ]);
    return Response.json({ authors, books, genres: genres.flatMap(({ genre }) => genre ? [genre] : []) });
  } catch (error) { return handleApiError(error); }
}
