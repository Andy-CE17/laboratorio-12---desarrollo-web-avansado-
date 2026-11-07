import { redirect } from "next/navigation";

// La interfaz de gestión pertenece a la sección TAREA, todavía pendiente.
export default function Home() {
  redirect("/api/authors");
}
