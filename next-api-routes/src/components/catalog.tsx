"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { api, DeleteRecord, Editor, Hero, Notice, type Author, type Book } from "./library-kit";

const initial = {search:"",genre:"",authorId:"",sortBy:"createdAt",order:"desc",page:1};
type Results = { data:Book[]; pagination:{page:number;total:number;totalPages:number;hasNext:boolean;hasPrev:boolean} };

export default function Catalog() {
  const [filters,setFilters] = useState(initial);
  const [options,setOptions] = useState<{authors:Author[];genres:string[]}>();
  const [result,setResult] = useState<{ key:string; data?:Results; error?:string }>();
  const [optionError,setOptionError] = useState("");
  const [version,refresh] = useState(0);
  const [editing,edit] = useState<Book | "new" | null>(null);
  const [removing,remove] = useState<Book | null>(null);
  const {page,...criteria}=filters;
  const query=new URLSearchParams({...criteria,page:String(page),limit:"10"}).toString();
  const key=`${query}:${version}`;

  useEffect(()=>{
    const c=new AbortController();
    Promise.all([api<Author[]>("/api/authors",{signal:c.signal}),api<{genres:string[]}>("/api/library",{signal:c.signal})])
      .then(([authors,summary])=>{setOptions({authors,genres:summary.genres});setOptionError("");})
      .catch(e=>{if(!c.signal.aborted)setOptionError(e.message);});
    return ()=>c.abort();
  },[version]);

  useEffect(()=>{
    const c=new AbortController();
    const timer=setTimeout(()=>{
      api<Results>(`/api/books/search?${query}`,{signal:c.signal})
        .then(data=>{
          if(c.signal.aborted) return;
          const last=Math.max(1,data.pagination.totalPages);
          if(data.pagination.page>last) setFilters(f=>({...f,page:last}));
          else setResult({key,data});
        })
        .catch(e=>{if(!c.signal.aborted)setResult({key,error:e.message});});
    },250);
    return ()=>{clearTimeout(timer);c.abort();};
  },[query,key]);

  const current=result?.key===key ? result : undefined;
  const paging=current?.data?.pagination;
  const set=(field:keyof typeof criteria,value:string)=>setFilters(f=>({...f,[field]:value,page:1}));
  return <>
    <Hero label="Colección" title="Catálogo de" accent="libros." intro="Encuentra obras por título, autor o género y mantén la colección al día."
      action={<button className="btn primary" disabled={!options?.authors.length} onClick={()=>edit("new")}><Plus size={18}/> Nuevo libro</button>}/>
    <section className="filters" aria-label="Filtros del catálogo">
      <label className="search-label">Buscar por título<div className="search-box"><Search size={18}/><input placeholder="Escribe el título de una obra" value={filters.search} onChange={e=>set("search",e.target.value)}/></div></label>
      <label>Género<select value={filters.genre} onChange={e=>set("genre",e.target.value)}><option value="">Todos los géneros</option>{options?.genres.map(g=><option key={g}>{g}</option>)}</select></label>
      <label>Autor<select value={filters.authorId} onChange={e=>set("authorId",e.target.value)}><option value="">Todos los autores</option>{options?.authors.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
      <label>Ordenar por<select value={filters.sortBy} onChange={e=>set("sortBy",e.target.value)}><option value="createdAt">Fecha de registro</option><option value="title">Título</option><option value="publishedYear">Año de publicación</option></select></label>
      <label>Sentido<select value={filters.order} onChange={e=>set("order",e.target.value)}><option value="desc">Descendente</option><option value="asc">Ascendente</option></select></label>
    </section>
    {options?.authors.length===0 && <p className="notice">Registra un autor antes de agregar un libro. <Link href="/">Ir a autores</Link></p>}
    <Notice error={optionError}/>
    <section aria-labelledby="results-title" aria-busy={!current}>
      <div className="section-head"><div><p className="eyebrow">Resultados</p><h2 id="results-title">{paging ? `${paging.total} ${paging.total===1 ? "libro encontrado" : "libros encontrados"}` : "Explorar libros"}</h2></div>
      <button className="btn secondary" onClick={()=>setFilters(initial)}>Restablecer filtros</button></div>
      <Notice error={current?.error} loading={!current}/>
      {paging?.total===0 && <p className="notice">No hay libros que coincidan con los filtros seleccionados.</p>}
      <div className="book-grid">{current?.data?.data.map((b,i)=><article className="book-card" key={b.id}>
        <div className={`book-band band-${i%3}`}><BookOpen size={22}/><span>{b.genre||"Sin género"}</span></div>
        <div className="book-content"><h3>{b.title}</h3>
          <Link className="book-author" href={`/authors/${b.authorId}`}>{b.author?.name ?? "Ver autor"}</Link>
          <p>{[b.publishedYear,b.pages ? `${b.pages} páginas` : null].filter(Boolean).join(" · ")||"Ficha sin datos de edición"}</p>
          {b.description && <p className="book-description">{b.description}</p>}
          <div className="row-actions">
            <button className="btn secondary" aria-label={`Editar ${b.title}`} onClick={()=>edit(b)}><Pencil size={15}/> Editar</button>
            <button className="icon-btn danger" aria-label={`Eliminar ${b.title}`} onClick={()=>remove(b)}><Trash2 size={16}/></button>
          </div>
        </div>
      </article>)}</div>
      {paging && paging.totalPages>0 && <nav className="pagination" aria-label="Paginación">
        <button className="btn secondary" disabled={!paging.hasPrev} onClick={()=>setFilters(f=>({...f,page:f.page-1}))}><ChevronLeft size={16}/> Anterior</button>
        <span>Página <strong>{paging.page}</strong> de {paging.totalPages}</span>
        <button className="btn secondary" disabled={!paging.hasNext} onClick={()=>setFilters(f=>({...f,page:f.page+1}))}>Siguiente <ChevronRight size={16}/></button>
      </nav>}
    </section>
    {editing && <Editor kind="book" authors={options?.authors} item={editing==="new"?undefined:editing} close={()=>edit(null)} saved={()=>refresh(v=>v+1)}/>}
    {removing && <DeleteRecord kind="books" item={removing} close={()=>remove(null)} saved={()=>refresh(v=>v+1)}/>}
  </>;
}
