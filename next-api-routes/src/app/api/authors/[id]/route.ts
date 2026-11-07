import { NextResponse } from "next/server";
import { ApiError, authorInput, handleApiError, readJson } from "@/lib/api";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const author = await prisma.author.findUnique({
      where: { id },
      include: {
        books: { orderBy: { publishedYear: "desc" } },
        _count: { select: { books: true } },
      },
    });
    if (!author) throw new ApiError("Autor no encontrado", 404);
    return NextResponse.json(author);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const author = await prisma.author.update({
      where: { id },
      data: authorInput(await readJson(request), true),
      include: { books: true },
    });
    return NextResponse.json(author);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const { id } = await params;
    // El esquema aplica Cascade a los libros de este autor.
    await prisma.author.delete({ where: { id } });
    return NextResponse.json({ message: "Autor eliminado correctamente" });
  } catch (error) {
    return handleApiError(error);
  }
}
