'use client';

import {useEffect,useState,type FormEvent} from 'react';
import './intro.css';

type Intro={name:string;tagline:string;body:string};
const empty:Intro={name:'',tagline:'',body:''};

export default function Page(){
 const [intro,setIntro]=useState<Intro>(empty),[draft,setDraft]=useState<Intro>(empty);
 const [open,setOpen]=useState(false),[signedIn,setSignedIn]=useState(false),[password,setPassword]=useState('');
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 useEffect(()=>{fetch('/api/astral?intro=1').then(r=>r.json()).then(value=>{const data=value as {intro?:Intro};if(data.intro){setIntro(data.intro);setDraft(data.intro)}}).catch(()=>setError('소개를 불러오지 못했습니다.'))},[]);
 async function request(body:Record<string,unknown>):Promise<{intro?:Intro;error?:string}>{const response=await fetch('/api/astral',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await response.json() as {intro?:Intro;error?:string};if(!response.ok)throw new Error(data.error||'요청에 실패했습니다.');return data}
 async function showEditor(){setOpen(true);setError('');setNotice('');setDraft(intro);try{const response=await fetch('/api/astral?admin=session');setSignedIn(response.ok)}catch{setSignedIn(false)}}
 async function login(event:FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setError('');try{await request({action:'adminLogin',password});setPassword('');setSignedIn(true)}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 async function save(event:FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setError('');setNotice('');try{const data=await request({action:'adminIntroUpdate',...draft});if(data.intro){setIntro(data.intro);setDraft(data.intro)}setNotice('저장했습니다.')}catch(e){if((e as Error).message.includes('로그인'))setSignedIn(false);setError((e as Error).message)}finally{setBusy(false)}}
 async function logout(){setBusy(true);setError('');try{await request({action:'adminLogout'});setSignedIn(false);setOpen(false)}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 return <main className="intro-site"><div className="intro-grain" aria-hidden="true"/><div className="intro-frame">
  <header className="intro-header"><span className="intro-monogram" aria-hidden="true">✦</span><span>자기소개</span><span className="intro-rule"/></header>
  <section className="intro-stage" aria-label="자기소개"><div className="intro-ornament" aria-hidden="true"><span>✧</span></div><article className="intro-paper"><div className="intro-paper-top" aria-hidden="true"><span>✦</span><i/></div>{intro.name&&<p className="intro-name">{intro.name}</p>}{intro.tagline&&<h1>{intro.tagline}</h1>}{intro.body&&<p className="intro-body">{intro.body}</p>}</article><div className="intro-seal" aria-hidden="true">✦</div></section>
  <footer className="intro-footer"><span>✦</span><button type="button" onClick={showEditor} aria-label="관리자 로그인 및 소개 편집">관리</button></footer>
 </div>{open&&<div className="intro-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setOpen(false)}}><section className="intro-dialog" role="dialog" aria-modal="true" aria-labelledby="intro-dialog-title"><button className="intro-close" type="button" onClick={()=>setOpen(false)} aria-label="닫기">×</button><p className="intro-dialog-kicker">PRIVATE EDITION</p><h2 id="intro-dialog-title">{signedIn?'자기소개 편집':'관리자 로그인'}</h2>{error&&<p className="intro-error" role="alert">{error}</p>}{notice&&<p className="intro-notice" role="status">{notice}</p>}{signedIn?<form onSubmit={save} className="intro-form"><label>이름<input value={draft.name} maxLength={60} onChange={e=>setDraft({...draft,name:e.target.value})}/></label><label>한 줄 소개<input value={draft.tagline} maxLength={120} onChange={e=>setDraft({...draft,tagline:e.target.value})}/></label><label>소개글<textarea value={draft.body} maxLength={2000} rows={7} onChange={e=>setDraft({...draft,body:e.target.value})}/></label><div className="intro-form-actions"><button type="button" className="intro-text-button" disabled={busy} onClick={logout}>로그아웃</button><button className="intro-submit" disabled={busy}>저장</button></div></form>:<form onSubmit={login} className="intro-form"><label>비밀번호<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" minLength={6} maxLength={128} required autoFocus/></label><button className="intro-submit" disabled={busy}>로그인</button></form>}</section></div>}</main>;
}
