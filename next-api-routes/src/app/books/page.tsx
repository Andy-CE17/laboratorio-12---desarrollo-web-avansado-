import type { Metadata } from "next";
import Catalog from "@/components/catalog";

export const metadata: Metadata = { title: "Catálogo · Biblioteca Campos" };
export default function Page() { return <Catalog/>; }
