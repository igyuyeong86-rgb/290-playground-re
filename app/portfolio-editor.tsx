'use client';

import {useEffect,useState,type FormEvent} from 'react';
import {type PortfolioData,type Post,type Profile,emptyPost} from './portfolio-types';

type Props={data:PortfolioData;onRefresh:()=>Promise<void>;onClose:()=>void};

export default function PortfolioEditor({data,onRefresh,onClose}:Props){
 const [signedIn,setSignedIn]=useState(false),[checking,setChecking]=useState(true);
 const [tab,setTab]=useState<'profile'|'posts'>('profile');
 const [profile,setProfile]=useState<Profile>(data.profile);
 const [post,setPost]=useState<Partial<Post>>(emptyPost);
 const [password,setPassword]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 useEffect(()=>{let active=true;fetch('/api/portfolio?session=1').then(r=>{if(active){setSignedIn(r.ok);setChecking(false)}}).catch(()=>{if(active)setChecking(false)});return()=>{active=false}},[]);
 async function request(body:Record<string,unknown>){const response=await fetch('/api/portfolio',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const result=await response.json() as {error?:string};if(!response.ok)throw new Error(result.error||'요청에 실패했습니다.');return result}
 async function login(event:FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setError('');try{await request({action:'adminLogin',password});setPassword('');setSignedIn(true)}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 async function saveProfile(event:FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setError('');setNotice('');try{await request({action:'adminBlogProfileUpdate',...profile});await onRefresh();setNotice('소개를 저장했습니다.')}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 async function savePost(event:FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setError('');setNotice('');try{await request({action:'adminBlogPostSave',...post});await onRefresh();setPost(emptyPost);setNotice('글을 저장했습니다.')}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 async function editPost(id:string){setError('');setNotice('');try{const response=await fetch('/api/portfolio?post='+id);if(!response.ok)throw new Error('글을 불러오지 못했습니다.');const result=await response.json() as {post:Post};setPost(result.post)}catch(e){setError((e as Error).message)}}
 async function deletePost(){if(!post.id||!window.confirm('이 글을 삭제할까요? 삭제 후 복구할 수 없습니다.'))return;setBusy(true);setError('');try{await request({action:'adminBlogPostDelete',id:post.id});await onRefresh();setPost(emptyPost);setNotice('글을 삭제했습니다.')}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 async function logout(){setBusy(true);setError('');try{await request({action:'adminLogout'});setSignedIn(false);onClose()}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 const field='w-full rounded-md border border-line bg-bg px-3 py-2.5 text-sm text-fg outline-none placeholder:text-soft focus:border-fg';
 const label='grid gap-2 text-xs text-muted';
 const action='rounded-md border border-fg bg-fg px-4 py-2 text-sm font-medium text-bg disabled:opacity-50';
 return <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
  <section role="dialog" aria-modal="true" aria-labelledby="editor-title" className="max-h-[90dvh] w-[min(92vw,680px)] overflow-y-auto rounded-xl border border-line bg-card p-5 shadow-2xl sm:p-7">
   <header className="mb-5 flex items-center justify-between gap-4 border-b border-line pb-4"><div><p className="mb-1 font-mono text-[10px] tracking-[.2em] text-soft">PRIVATE EDITION</p><h2 id="editor-title" className="font-serif text-3xl">{signedIn?'Edit portfolio':'Admin login'}</h2></div><button type="button" onClick={onClose} aria-label="닫기" className="grid size-9 place-items-center rounded-full border border-line text-xl text-muted hover:text-fg">×</button></header>
   {error&&<p role="alert" className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}{notice&&<p role="status" className="mb-4 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">{notice}</p>}
   {checking?<p className="py-6 text-sm text-muted">확인 중…</p>:!signedIn?<form onSubmit={login} className="grid gap-4"><label className={label}>비밀번호<input className={field} type="password" required minLength={6} maxLength={128} autoComplete="current-password" autoFocus value={password} onChange={e=>setPassword(e.target.value)}/></label><button className={action} disabled={busy}>로그인</button></form>:<>
    <div className="mb-5 flex gap-2 border-b border-line"><button type="button" onClick={()=>setTab('profile')} className={`px-3 py-2 text-sm ${tab==='profile'?'border-b border-fg text-fg':'text-muted'}`}>소개</button><button type="button" onClick={()=>setTab('posts')} className={`px-3 py-2 text-sm ${tab==='posts'?'border-b border-fg text-fg':'text-muted'}`}>글</button></div>
    {tab==='profile'?<form onSubmit={saveProfile} className="grid gap-4"><label className={label}>이름<input className={field} maxLength={80} value={profile.name} onChange={e=>setProfile({...profile,name:e.target.value})}/></label><label className={label}>한 줄 소개<input className={field} maxLength={160} value={profile.headline} onChange={e=>setProfile({...profile,headline:e.target.value})}/></label><label className={label}>소개글<textarea className={field} rows={7} maxLength={4000} value={profile.about} onChange={e=>setProfile({...profile,about:e.target.value})}/></label><button className={`${action} justify-self-end`} disabled={busy}>저장</button></form>:<div>
     <div className="mb-5 flex gap-2 overflow-x-auto border-b border-line pb-4"><button type="button" className="chip shrink-0 hover:text-fg" onClick={()=>setPost(emptyPost)}>+ 새 글</button>{data.posts.map(p=><button type="button" key={p.id} className="chip max-w-40 shrink-0 truncate hover:text-fg" onClick={()=>editPost(p.id)}>{p.title}</button>)}</div>
     <form onSubmit={savePost} className="grid gap-4"><label className={label}>분류<select className={field} value={post.category||'note'} onChange={e=>setPost({...post,category:e.target.value as Post['category']})}><option value="project">Projects</option><option value="study">Study</option><option value="note">Writing</option></select></label><label className={label}>제목<input className={field} required maxLength={140} value={post.title||''} onChange={e=>setPost({...post,title:e.target.value})}/></label><label className={label}>요약<input className={field} maxLength={300} value={post.excerpt||''} onChange={e=>setPost({...post,excerpt:e.target.value})}/></label><label className={label}>본문<textarea className={field} required rows={10} maxLength={20000} value={post.body||''} onChange={e=>setPost({...post,body:e.target.value})}/></label><div className="flex items-center justify-between gap-4">{post.id?<button type="button" disabled={busy} onClick={deletePost} className="text-xs text-red-400 underline disabled:opacity-50">글 삭제</button>:<span/>}<button className={action} disabled={busy}>글 저장</button></div></form>
    </div>}
    <button type="button" disabled={busy} onClick={logout} className="mt-7 text-xs text-soft underline hover:text-fg disabled:opacity-50">로그아웃</button>
   </>}
  </section>
 </div>;
}
