'use client';

import {useEffect,useState} from 'react';
import {useParams} from 'next/navigation';
import '../../intro.css';

type Post={id:string;title:string;category:'study'|'project'|'note';excerpt:string;body:string;created:number};
const labels={study:'STUDY',project:'PROJECTS',note:'JOURNAL'};

export default function BlogPostPage(){
 const {id}=useParams<{id:string}>();
 const [post,setPost]=useState<Post|null>(null),[error,setError]=useState('');
 useEffect(()=>{if(!id)return;fetch('/api/portfolio?post='+encodeURIComponent(id)).then(async r=>{if(!r.ok)throw new Error('글을 찾을 수 없습니다.');return r.json() as Promise<{post:Post}>}).then(data=>setPost(data.post)).catch(e=>setError((e as Error).message))},[id]);
 return <main className="vintage-site blog-page"><article className="blog-shell"><a className="blog-back" href="/">← PORTFOLIO</a>{error?<p className="blog-error" role="alert">{error}</p>:post?<><div className="blog-meta"><span>{labels[post.category]}</span><time dateTime={new Date(post.created).toISOString()}>{new Date(post.created).toLocaleDateString('ko-KR')}</time></div><h1>{post.title}</h1>{post.excerpt&&<p className="blog-excerpt">{post.excerpt}</p>}<div className="blog-body">{post.body}</div></>:null}</article></main>;
}
