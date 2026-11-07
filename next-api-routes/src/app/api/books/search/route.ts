import { Prisma } from "@prisma/client";
import { ApiError, handleApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const sorts = ["title", "publishedYear", "createdAt"] as const;
type Sort = (typeof sorts)[number];

function positive(raw: string | null, fallback: number, max: number) {
  if (raw === null) return fallback;
  if (!/^\d+$/.test(raw) || Number(raw) < 1 || Number(raw) > max) {
    throw new ApiError(`Usa un entero entre 1 y ${max} para la paginación`);
  }
  return Number(raw);
}

function contains(value: string) {
  return { contains: value.replace(/[\\%_]/g, "\\$&"), mode: "insensitive" as const };
}

export async function GET(request: Request) {
  try {
    const q = new URL(request.url).searchParams;
    const page = positive(q.get("page"), 1, 1_000_000);
    const limit = positive(q.get("limit"), 10, 50);
    const sortBy = q.get("sortBy") ?? "createdAt";
    const order = q.get("order") ?? "desc";
    if (!sorts.includes(sortBy as Sort) || (order !== "asc" && order !== "desc")) {
      throw new ApiError("El criterio o el sentido de ordenamiento no es válido");
    }

    const search = q.get("search")?.trim();
    const genre = q.get("genre")?.trim();
    const authorName = q.get("authorName")?.trim();
    const authorId = q.get("authorId")?.trim();
    const where: Prisma.BookWhereInput = {
      title: search ? contains(search) : undefined,
      genre: genre || undefined,
      authorId: authorId || undefined,
      author: authorName ? { name: contains(authorName) } : undefined,
    };
    const primaryOrder: Prisma.BookOrderByWithRelationInput =
      sortBy === "publishedYear" ? { publishedYear: { sort: order, nulls: "last" } } : { [sortBy]: order };
    const [total, data] = await prisma.$transaction([
      prisma.book.count({ where }),
      prisma.book.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: [primaryOrder, { id: "asc" }],
        include: { author: { select: { id: true, name: true } } },
      }),
    ], { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
    const totalPages = Math.ceil(total / limit);
    return Response.json({ data, pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 } });
  } catch (error) { return handleApiError(error); }
}
