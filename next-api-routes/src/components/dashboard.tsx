"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Layers3, Pencil, Plus, Trash2, Users } from "lucide-react";
import { api, DeleteRecord, Editor, Hero, Notice, type Author } from "./library-kit";

export default function Dashboard() {
  const [data, setData] = useState<{ authors: Author[]; stats: {authors: number; books: number; genres: string[]} }>();
  const [error, setError] = useState("");
  const [version, refresh] = useState(0);
  const [editing, edit] = useState<Author | "new" | null>(null);
  const [removing, remove] = useState<Author | null>(null);

  useEffect(() => {
    const c = new AbortController();
    Promise.all([api<Author[]>("/api/authors", {signal:c.signal}), api<NonNullable<typeof data>["stats"]>("/api/library",{signal:c.signal})])
      .then(([authors, stats]) => { setData({authors, stats}); setError(""); })
      .catch(e => { if (!c.signal.aborted) setError(e.message); });
    return () => c.abort();
  }, [version]);

  return <>
    <Hero label="Panel de biblioteca" title="Cada historia," accent="una voz." intro="Gestiona los autores de tu colección y descubre las obras que forman parte del catálogo."
      action={<button className="btn primary" onClick={() => edit("new")}><Plus size={18}/> Nuevo autor</button>}/>
    <div className="metrics">
      {[[Users,"Autores",data?.stats.authors],[BookOpen,"Libros",data?.stats.books],[Layers3,"Géneros",data?.stats.genres.length]].map(([Icon,label,value]) => {
        const MetricIcon = Icon as typeof Users;
        return <div className="metric" key={String(label)}><span className="metric-icon"><MetricIcon size={19}/></span><div><strong>{value === undefined ? "—" : String(value)}</strong><span>{String(label)}</span></div></div>;
      })}
    </div>
    <section aria-labelledby="authors-heading">
      <div className="section-head"><div><p className="eyebrow">Directorio</p><h2 id="authors-heading">Autores registrados</h2></div><Link className="btn secondary" href="/books">Ver catálogo <ArrowUpRight size={16}/></Link></div>
      <Notice error={error} loading={!data}/>
      {data?.authors.length === 0 && <p className="notice">Todavía no hay autores. Registra el primero para empezar tu colección.</p>}
      <div className="records">{data?.authors.map(a => <article className="record" key={a.id}>
        <div className="initials">{a.name.trim().split(/\s+/).slice(0,2).map(s => s[0]).join("")}</div>
        <div className="record-main"><h3><Link href={`/authors/${a.id}`}>{a.name}</Link></h3><p>{a.nationality || "Nacionalidad sin registrar"}{a.birthYear ? ` · ${a.birthYear}` : ""}</p></div>
        <span className="tag">{a._count?.books ?? 0} {(a._count?.books ?? 0) === 1 ? "libro" : "libros"}</span>
        <div className="row-actions">
          <Link className="btn secondary" href={`/authors/${a.id}`}>Ver libros <ArrowUpRight size={14}/></Link>
          <button className="icon-btn" aria-label={`Editar a ${a.name}`} onClick={() => edit(a)}><Pencil size={17}/></button>
          <button className="icon-btn danger" aria-label={`Eliminar a ${a.name}`} onClick={() => remove(a)}><Trash2 size={17}/></button>
        </div>
      </article>)}</div>
    </section>
    {editing && <Editor kind="author" item={editing === "new" ? undefined : editing} close={() => edit(null)} saved={() => refresh(v=>v+1)}/>}
    {removing && <DeleteRecord kind="authors" item={removing} close={() => remove(null)} saved={() => refresh(v=>v+1)}/>}
  </>;
}
