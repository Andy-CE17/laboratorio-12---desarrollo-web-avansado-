"use client";

import { useEffect,useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Pencil, Plus } from "lucide-react";
import { api, Editor, Hero, Notice, type Author, type Book, type Stats } from "./library-kit";

export default function AuthorDetail({id}:{id:string}) {
  const [data,setData]=useState<{author:Author;stats:Stats;books:Book[]}>();
  const [error,setError]=useState("");
  const [editing,edit]=useState<"author"|"book"|null>(null);
  const [version,refresh]=useState(0);

  useEffect(()=>{
    const c=new AbortController();
    const base=`/api/authors/${encodeURIComponent(id)}`;
    const opts={signal:c.signal};
    Promise.all([api<Author>(base,opts),api<Stats>(base+"/stats",opts),api<{books:Book[]}>(base+"/books",opts)])
      .then(([author,stats,{books}])=>{setData({author,stats,books});setError("");})
      .catch(e=>{if(!c.signal.aborted)setError(e.message);});
    return ()=>c.abort();
  },[id,version]);

  if(!data) return <><Link className="back" href="/"><ArrowLeft size={16}/> Autores</Link><Notice error={error} loading/></>;
  const {author,stats,books}=data;
  const timeline = (b: Stats["firstBook"]) => b ? `${b.title} · ${b.year}` : "Sin año registrado";
  const length = (b: Stats["longestBook"]) => b ? `${b.title} · ${b.pages} páginas` : "Sin páginas registradas";
  return <>
    <Link className="back" href="/"><ArrowLeft size={16}/> Volver a autores</Link>
    <Hero label="Perfil de autor" title={author.name} intro={[author.nationality,author.birthYear].filter(Boolean).join(" · ") || "Ficha del directorio"}
      action={<div className="row-actions"><button className="btn primary" onClick={()=>edit("book")}><Plus size={17}/> Agregar libro</button><button className="btn secondary" onClick={()=>edit("author")}><Pencil size={16}/> Editar autor</button></div>}/>
    <Notice error={error}/>
    <div className="profile-grid">
      <section className="panel"><p className="eyebrow">Ficha personal</p><h2>Sobre el autor</h2><p>{author.bio || "Todavía no se ha registrado una biografía."}</p>
      <dl><dt>Correo</dt><dd>{author.email}</dd><dt>Nacionalidad</dt><dd>{author.nationality || "Sin registrar"}</dd><dt>Año de nacimiento</dt><dd>{author.birthYear ?? "Sin registrar"}</dd></dl></section>
      <section className="panel"><p className="eyebrow">Estadísticas</p><h2>Su obra en cifras</h2>
        <dl><dt>Libros registrados</dt><dd>{stats.totalBooks}</dd><dt>Promedio de páginas</dt><dd>{stats.averagePages===null?"Sin datos":stats.averagePages.toLocaleString("es-PE")}</dd><dt>Primera publicación</dt><dd>{timeline(stats.firstBook)}</dd><dt>Última publicación</dt><dd>{timeline(stats.latestBook)}</dd><dt>Obra más extensa</dt><dd>{length(stats.longestBook)}</dd><dt>Obra más breve</dt><dd>{length(stats.shortestBook)}</dd><dt>Géneros</dt><dd>{stats.genres.join(", ") || "Sin géneros registrados"}</dd></dl>
      </section>
    </div>
    <section><div className="section-head"><div><p className="eyebrow">Bibliografía</p><h2>Libros del autor</h2></div><span className="tag">{books.length} {books.length===1?"obra":"obras"}</span></div>
      {books.length===0 && <p className="notice">Este autor aún no tiene libros registrados.</p>}
      <div className="records">{books.map(b=><article className="record" key={b.id}><span className="initials"><BookOpen size={20}/></span><div className="record-main"><h3>{b.title}</h3><p>{[b.genre,b.publishedYear,b.pages ? `${b.pages} páginas` : null].filter(Boolean).join(" · ") || "Sin datos de edición"}</p></div></article>)}</div>
    </section>
    {editing && <Editor kind={editing} item={editing==="author"?author:undefined} presetAuthor={id} authors={[author]} close={()=>edit(null)} saved={()=>refresh(v=>v+1)}/>}
  </>;
}
