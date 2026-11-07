import type { Metadata } from "next";
import { Shell } from "@/components/library-kit";
import "./globals.css";

export const metadata: Metadata = {
  title: "Biblioteca de Andy Campos",
  description: "Gestión de autores y libros mediante una API propia.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col"><Shell>{children}</Shell></body>
    </html>
  );
}
