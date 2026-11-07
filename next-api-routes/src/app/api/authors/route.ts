import { NextResponse } from "next/server";
import { authorInput, handleApiError, readJson } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const authors = await prisma.author.findMany({
      include: { books: true, _count: { select: { books: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(authors);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = authorInput(await readJson(request));
    const author = await prisma.author.create({
      data: { ...input, name: input.name!, email: input.email! },
      include: { books: true },
    });
    return NextResponse.json(author, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
