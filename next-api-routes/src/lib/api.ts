import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ApiError("El cuerpo de la solicitud debe ser JSON válido");
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ApiError("El cuerpo debe ser un objeto JSON");
  }
  return body as Record<string, unknown>;
}

function text(
  body: Record<string, unknown>,
  field: string,
  required = false,
  minimum = 1,
): string | null | undefined {
  const value = body[field];
  if (value === undefined && !required) return undefined;
  if ((value === null || value === "") && !required) return null;
  if (typeof value !== "string" || value.trim().length < minimum) {
    throw new ApiError(`${field} debe contener al menos ${minimum} caracteres`);
  }
  return value.trim();
}

function integer(body: Record<string, unknown>, field: string) {
  const value = body[field];
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  if (typeof value !== "number" && typeof value !== "string") {
    throw new ApiError(`${field} debe ser un número entero positivo`);
  }
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 1 || number > 2147483647) {
    throw new ApiError(`${field} debe ser un número entero positivo válido`);
  }
  return number;
}

export function authorInput(body: Record<string, unknown>, partial = false) {
  const name = text(body, "name", !partial);
  const email = text(body, "email", !partial);
  // Nombre y correo no pueden vaciarse durante una actualización.
  if ((partial && "name" in body && !name) || (partial && "email" in body && !email)) {
    throw new ApiError("El nombre y el correo no pueden estar vacíos");
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError("El correo electrónico no es válido");
  }
  return {
    name: name ?? undefined,
    email: email?.toLowerCase(),
    bio: text(body, "bio"),
    nationality: text(body, "nationality"),
    birthYear: integer(body, "birthYear"),
  };
}

export function bookInput(body: Record<string, unknown>, partial = false) {
  const title = text(body, "title", !partial, 3);
  const authorId = text(body, "authorId", !partial);
  if ((partial && "title" in body && !title) || (partial && "authorId" in body && !authorId)) {
    throw new ApiError("El título y el autor no pueden estar vacíos");
  }
  return {
    title: title ?? undefined,
    authorId: authorId ?? undefined,
    description: text(body, "description"),
    isbn: text(body, "isbn"),
    publishedYear: integer(body, "publishedYear"),
    genre: text(body, "genre"),
    pages: integer(body, "pages"),
  };
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "El correo electrónico o ISBN ya está registrado" },
        { status: 409 },
      );
    }
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }
    if (error.code === "P2003") {
      return NextResponse.json({ error: "El autor indicado no existe" }, { status: 404 });
    }
  }
  // No devuelvo errores internos de Prisma ni datos de conexión al cliente.
  console.error("No se pudo completar la operación de biblioteca");
  return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
}
