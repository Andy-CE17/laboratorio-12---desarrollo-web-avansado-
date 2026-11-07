import { NextResponse } from "next/server";
import { ApiError, bookInput, handleApiError, readJson } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const genre = searchParams.get("genre") || undefined;
    const authorId = searchParams.get("authorId") || undefined;
    const books = await prisma.book.findMany({
      where: { genre, authorId },
      include: { author: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(books);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = bookInput(await readJson(request));
    const author = await prisma.author.findUnique({ where: { id: input.authorId! } });
    if (!author) throw new ApiError("El autor especificado no existe", 404);
    const book = await prisma.book.create({
      data: { ...input, title: input.title!, authorId: input.authorId! },
      include: { author: true },
    });
    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
