'use client';

import {useEffect,useState} from 'react';
import {type PortfolioData,categoryLabel,emptyProfile} from '../portfolio-types';

export default function BlogIndex(){
 const [data,setData]=useState<PortfolioData>({profile:emptyProfile,posts:[]});
 useEffect(()=>{fetch('/api/portfolio').then(async r=>await r.json() as PortfolioData).then(value=>setData(value)).catch(()=>{})},[]);
 return <><header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur"><div className="rail flex h-12 items-center justify-between px-6"><a href="/" className="font-serif text-xl">{data.profile.name||'Portfolio'}</a><a href="/" className="text-sm text-muted hover:text-fg">Home</a></div></header><main id="main" className="rail min-h-screen"><div className="border-b border-line px-6 py-3"><a href="/" className="font-mono text-xs text-muted hover:text-fg">← Home</a></div><h1 className="section-title">Writing</h1><div className="divide-y divide-line">{data.posts.map(post=><a key={post.id} href={'/blog/'+post.id} className="group block px-6 py-5 hover:bg-[var(--hover)]"><p className="font-mono text-[11px] text-soft"><time dateTime={new Date(post.created).toISOString()}>{new Date(post.created).toLocaleDateString('ko-KR')}</time> · {categoryLabel[post.category]}</p><h2 className="mt-1.5 font-serif text-2xl group-hover:underline group-hover:underline-offset-4">{post.title}</h2>{post.excerpt&&<p className="mt-2 text-[14px] text-muted">{post.excerpt}</p>}</a>)}</div></main></>;
}
