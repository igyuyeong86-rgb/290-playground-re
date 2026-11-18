'use client';

import {useEffect,useState} from 'react';
import {useParams} from 'next/navigation';
import {type Post,categoryLabel} from '../../portfolio-types';

export default function BlogPost(){
 const {id}=useParams<{id:string}>();
 const [post,setPost]=useState<Post|null>(null),[error,setError]=useState('');
 useEffect(()=>{if(!id)return;fetch('/api/portfolio?post='+encodeURIComponent(id)).then(async r=>{if(!r.ok)throw new Error('글을 찾을 수 없습니다.');return r.json() as Promise<{post:Post}>}).then(result=>setPost(result.post)).catch(e=>setError((e as Error).message))},[id]);
 return <><header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur"><div className="rail flex h-12 items-center justify-between px-6"><a href="/" className="font-serif text-xl">Portfolio</a><a href="/blog" className="text-sm text-muted hover:text-fg">Blog</a></div></header><main id="main" className="rail min-h-screen"><div className="border-b border-line px-6 py-3"><a href="/blog" className="font-mono text-xs text-muted hover:text-fg">← Writing</a></div>{error?<p role="alert" className="px-6 py-12 text-muted">{error}</p>:post?<article><div className="border-b border-line px-6 py-10"><p className="font-mono text-[11px] tracking-wide text-soft"><time dateTime={new Date(post.created).toISOString()}>{new Date(post.created).toLocaleDateString('ko-KR')}</time> · {categoryLabel[post.category]}</p><h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">{post.title}</h1>{post.excerpt&&<p className="mt-4 text-[15px] leading-relaxed text-muted">{post.excerpt}</p>}</div><div className="whitespace-pre-wrap px-6 py-10 text-[15px] leading-8 text-muted">{post.body}</div></article>:null}</main></>;
}
