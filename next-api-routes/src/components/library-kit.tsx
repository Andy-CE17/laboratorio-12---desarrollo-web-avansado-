"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { BookOpen, LibraryBig, UsersRound, X, LoaderCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type Author = { id: string; name: string; email: string; nationality: string | null; bio: string | null; birthYear: number | null; _count?: { books: number } };
export type Book = { id: string; title: string; authorId: string; author?: {id: string; name: string}; isbn: string | null; genre: string | null; pages: number | null; publishedYear: number | null; description: string | null };
export type Stats = { totalBooks: number; firstBook: {title: string; year: number} | null; latestBook: {title: string; year: number} | null; averagePages: number | null; genres: string[]; longestBook: {title: string; pages: number} | null; shortestBook: {title: string; pages: number} | null };

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { cache: "no-store", ...init });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "No se pudo completar la solicitud");
  return data;
}

export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const catalog = path === "/books";
  return <div className="library-shell">
    <aside className="library-sidebar">
      <Link href="/" className="brand"><span className="brand-icon"><BookOpen size={20}/></span><span>Biblioteca</span></Link>
      <p className="sidebar-label">Navegación</p>
      <nav aria-label="Navegación principal">
        <Link className={catalog ? "" : "active"} aria-current={path === "/" ? "page" : undefined} href="/"><UsersRound size={18}/> Autores</Link>
        <Link className={catalog ? "active" : ""} aria-current={catalog ? "page" : undefined} href="/books"><LibraryBig size={18}/> Catálogo</Link>
      </nav>
      <div className="sidebar-footer"><span>Desarrollo web avanzado</span><strong>Laboratorio 12</strong></div>
    </aside>
    <div className="library-body">
      <main className="wrap">{children}</main>
      <footer className="site-footer"><span>Biblioteca Campos</span><span>© 2026 Andy Campos</span></footer>
    </div>
  </div>;
}

export const editorialPortrait = "/editorial/gabo-retrato.webp";

export function Hero({ label, title, accent, intro, action, portrait = true }: { label: string; title: string; accent?: string; intro: string; action?: ReactNode; portrait?: boolean }) {
  return <section className={`hero ${portrait ? "hero-portrait" : "hero-library"}`}>
    <div className="hero-photo">
      <Image src={portrait ? editorialPortrait : "/editorial/estanteria.webp"} alt={portrait ? "Retrato ilustrado de Gabriel García Márquez" : ""} fill preload unoptimized/>
    </div>
    <div className="hero-content">
    <p className="eyebrow"><span/>{label}</p>
    <h1>{title}{accent && <> <em>{accent}</em></>}</h1><p className="hero-intro">{intro}</p>
    {action}
    </div>
    {portrait && <div className="hero-credit"><span>Gabriel García Márquez</span><small>Ilustración generada con IA</small></div>}
  </section>;
}

export function Notice({ error, loading }: { error?: string; loading?: boolean }) {
  if (error) return <p className="notice error" role="alert">{error}</p>;
  if (loading) return <p className="notice" role="status"><LoaderCircle size={16} className="spin"/> Cargando datos…</p>;
  return null;
}

function Dialog({ title, close, children }: { title: string; close: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    d?.showModal();
    return () => d?.close();
  }, []);
  return <dialog ref={ref} aria-label={title} onCancel={close}><div className="dialog-head">
    <h2>{title}</h2><button type="button" className="icon-btn" aria-label="Cerrar" onClick={close}><X size={20}/></button>
  </div>{children}</dialog>;
}

export function Editor({ kind, item, authors = [], presetAuthor, close, saved }: {
  kind: "author" | "book"; item?: Author | Book; authors?: Author[]; presetAuthor?: string; close: () => void; saved: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const author = item as Author | undefined;
  const book = item as Book | undefined;
  const word = kind === "author" ? "autor" : "libro";
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true); setError("");
    try {
      await api(`/api/${word === "autor" ? "authors" : "books"}${item ? "/" + item.id : ""}`, {
        method: item ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
      saved(); close();
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  return <Dialog title={`${item ? "Editar" : "Registrar"} ${word}`} close={close}>
    <form onSubmit={submit} className="form">
      {kind === "author" ? <>
        <label>Nombre completo<input name="name" required defaultValue={author?.name}/></label>
        <label>Correo electrónico<input name="email" type="email" required defaultValue={author?.email}/></label>
        <label>Nacionalidad<input name="nationality" defaultValue={author?.nationality ?? ""}/></label>
        <label>Año de nacimiento<input name="birthYear" type="number" min="1" max="2147483647" defaultValue={author?.birthYear ?? ""}/></label>
        <label className="wide">Biografía<textarea name="bio" rows={4} defaultValue={author?.bio ?? ""}/></label>
      </> : <>
        <label className="wide">Título<input name="title" minLength={3} required defaultValue={book?.title}/></label>
        <label>Autor<select name="authorId" required defaultValue={book?.authorId ?? presetAuthor ?? ""}><option value="">Seleccionar autor</option>{authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
        <label>Género<input name="genre" defaultValue={book?.genre ?? ""}/></label>
        <label>ISBN<input name="isbn" defaultValue={book?.isbn ?? ""}/></label>
        <label>Año de publicación<input name="publishedYear" type="number" min="1" max="2147483647" defaultValue={book?.publishedYear ?? ""}/></label>
        <label>Páginas<input name="pages" type="number" min="1" max="2147483647" defaultValue={book?.pages ?? ""}/></label>
        <label className="wide">Descripción<textarea name="description" rows={3} defaultValue={book?.description ?? ""}/></label>
      </>}
      <div className="wide"><Notice error={error}/></div>
      <div className="form-actions wide"><button type="button" className="btn secondary" onClick={close}>Cancelar</button><button className="btn primary" disabled={busy}>{busy ? "Guardando…" : "Guardar cambios"}</button></div>
    </form>
  </Dialog>;
}

export function DeleteRecord({ kind, item, close, saved }: { kind: "authors" | "books"; item: Author | Book; close: () => void; saved: () => void }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return <Dialog title={kind === "authors" ? "Eliminar autor" : "Eliminar libro"} close={close}>
    <p className="dialog-copy">Se eliminará <strong>{ "name" in item ? item.name : item.title }</strong>. {kind === "authors" && "También se eliminarán todos sus libros."} Esta acción es permanente.</p>
    <Notice error={error}/>
    <div className="form-actions"><button className="btn secondary" onClick={close}>Cancelar</button><button className="btn primary" disabled={busy} onClick={async () => {
      setBusy(true); setError("");
      try { await api(`/api/${kind}/${item.id}`, { method: "DELETE" }); saved(); close(); }
      catch (e) { setError((e as Error).message); } finally { setBusy(false); }
    }}>{busy ? "Eliminando…" : "Confirmar eliminación"}</button></div>
  </Dialog>;
}
