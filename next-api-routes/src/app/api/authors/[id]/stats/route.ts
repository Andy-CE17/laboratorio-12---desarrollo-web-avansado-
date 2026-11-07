import { ApiError, handleApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const author = await prisma.author.findUnique({
      where: { id },
      select: { id: true, name: true, books: { select: { title: true, publishedYear: true, pages: true, genre: true } } },
    });
    if (!author) throw new ApiError("Autor no encontrado", 404);
    const tie = (a: { title: string }, b: { title: string }) => a.title.localeCompare(b.title, "es");
    const byYear = author.books
      .filter((book) => book.publishedYear !== null)
      .sort((a, b) => a.publishedYear! - b.publishedYear! || tie(a, b));
    const byPages = author.books
      .filter((book) => book.pages !== null)
      .sort((a, b) => a.pages! - b.pages! || tie(a, b));
    const dated = (book: (typeof byYear)[number] | undefined) => book ? { title: book.title, year: book.publishedYear } : null;
    const measured = (book: (typeof byPages)[number] | undefined) => book ? { title: book.title, pages: book.pages } : null;
    return Response.json({
      authorId: author.id, authorName: author.name, totalBooks: author.books.length,
      firstBook: dated(byYear[0]), latestBook: dated(byYear.at(-1)),
      averagePages: byPages.length ? Math.round(byPages.reduce((sum, b) => sum + b.pages!, 0) * 100 / byPages.length) / 100 : null,
      genres: [...new Set(author.books.flatMap((b) => b.genre ? [b.genre] : []))].sort((a, b) => a.localeCompare(b, "es")),
      longestBook: measured(byPages.at(-1)), shortestBook: measured(byPages[0]),
    });
  } catch (error) { return handleApiError(error); }
}
