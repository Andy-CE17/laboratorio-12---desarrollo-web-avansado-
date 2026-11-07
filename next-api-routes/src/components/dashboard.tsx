"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, BookOpen, Layers3, MapPin, Pencil, Plus, Trash2, Users } from "lucide-react";
import { api, DeleteRecord, Editor, editorialPortrait, Hero, Notice, type Author } from "./library-kit";

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

  const stats = [
    { icon: Users, label: "Autores", value: data?.stats.authors, tone: "wine", detail: "En el directorio" },
    { icon: BookOpen, label: "Libros", value: data?.stats.books, tone: "gold", detail: "En el catálogo" },
    { icon: Layers3, label: "Géneros", value: data?.stats.genres.length, tone: "copper", detail: "En la colección" },
  ];

  return <>
    <Hero label="Panel de biblioteca" title="Cada historia," accent="una voz." intro="Gestiona los autores de tu colección y descubre las obras que forman parte del catálogo."
      action={<button className="btn primary" onClick={() => edit("new")}><Plus size={18}/> Nuevo autor</button>}/>
    <dl className="metrics dashboard-metrics" aria-label="Totales de la biblioteca">
      {stats.map(({icon: Icon,label,value,tone,detail}) => <div className={`metric metric-${tone}`} key={label}>
        <dt><span className="metric-icon"><Icon size={19} aria-hidden="true"/></span>{label}</dt>
        <dd><strong>{value === undefined ? "—" : value.toLocaleString("es-PE")}</strong><span>{detail}</span></dd>
        <Icon className="metric-watermark" aria-hidden="true"/>
      </div>)}
    </dl>
    <section aria-labelledby="authors-heading">
      <div className="section-head"><div><p className="eyebrow">Directorio</p><h2 id="authors-heading">Autores registrados</h2></div><Link className="btn secondary" href="/books">Ver catálogo <ArrowUpRight size={16}/></Link></div>
      <Notice error={error} loading={!data}/>
      {data?.authors.length === 0 && <p className="notice">Todavía no hay autores. Registra el primero para empezar tu colección.</p>}
      <div className="author-grid">{data?.authors.map((a,i) => <article className={`author-card author-theme-${i%3}`} key={a.id}>
        <div className="author-card-head">
          <div className="author-monogram" aria-hidden="true">
            {a.name === "Gabriel García Márquez"
              ? <Image src={editorialPortrait} alt="" fill sizes="60px" unoptimized/>
              : a.name.trim().split(/\s+/).filter(w => !/^(de|del|la|los|y)$/i.test(w)).slice(0,2).map(w => w[0]).join("").toLocaleUpperCase("es")}
          </div>
          <span className="tag"><BookOpen size={13} aria-hidden="true"/> {a._count?.books ?? 0} {(a._count?.books ?? 0) === 1 ? "libro" : "libros"}</span>
        </div>
        <div className="author-card-info"><h3><Link href={`/authors/${a.id}`}>{a.name}</Link></h3>
          <p className="author-place"><MapPin size={14} aria-hidden="true"/>{a.nationality || "Nacionalidad sin registrar"}{a.birthYear ? ` · ${a.birthYear}` : ""}</p>
          {a.bio && <p className="author-bio">{a.bio}</p>}
        </div>
        <div className="author-card-actions row-actions">
          <Link className="author-card-link" href={`/authors/${a.id}`}>Ver perfil y libros <ArrowUpRight size={15}/></Link>
          <button className="icon-btn" aria-label={`Editar a ${a.name}`} onClick={() => edit(a)}><Pencil size={17}/></button>
          <button className="icon-btn danger" aria-label={`Eliminar a ${a.name}`} onClick={() => remove(a)}><Trash2 size={17}/></button>
        </div>
      </article>)}</div>
    </section>
    {editing && <Editor kind="author" item={editing === "new" ? undefined : editing} close={() => edit(null)} saved={() => refresh(v=>v+1)}/>}
    {removing && <DeleteRecord kind="authors" item={removing} close={() => remove(null)} saved={() => refresh(v=>v+1)}/>}
  </>;
}
