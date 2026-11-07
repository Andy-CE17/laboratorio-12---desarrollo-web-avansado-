import { NextResponse } from "next/server";
import { ApiError, bookInput, handleApiError, readJson } from "@/lib/api";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const book = await prisma.book.findUnique({ where: { id }, include: { author: true } });
    if (!book) throw new ApiError("Libro no encontrado", 404);
    return NextResponse.json(book);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const input = bookInput(await readJson(request), true);
    if (input.authorId) {
      const author = await prisma.author.findUnique({ where: { id: input.authorId } });
      if (!author) throw new ApiError("El autor especificado no existe", 404);
    }
    const book = await prisma.book.update({
      where: { id },
      data: input,
      include: { author: true },
    });
    return NextResponse.json(book);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const { id } = await params;
    await prisma.book.delete({ where: { id } });
    return NextResponse.json({ message: "Libro eliminado correctamente" });
  } catch (error) {
    return handleApiError(error);
  }
}
