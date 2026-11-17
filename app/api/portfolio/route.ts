import {env} from 'cloudflare:workers';

export const dynamic='force-dynamic';
const db=()=>env.DB!;
const schema=[
 'CREATE TABLE IF NOT EXISTS astral_admin (id INTEGER PRIMARY KEY CHECK(id=1), salt TEXT NOT NULL, password TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1)',
 'CREATE TABLE IF NOT EXISTS astral_admin_sessions (token TEXT PRIMARY KEY, expires INTEGER NOT NULL, version INTEGER NOT NULL)',
 'CREATE TABLE IF NOT EXISTS portfolio_login_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL)',
 'CREATE TABLE IF NOT EXISTS portfolio_blog_profile (id INTEGER PRIMARY KEY CHECK(id=1), name TEXT NOT NULL, headline TEXT NOT NULL, about TEXT NOT NULL)',
 'CREATE TABLE IF NOT EXISTS portfolio_blog_posts (id TEXT PRIMARY KEY, title TEXT NOT NULL, category TEXT NOT NULL, excerpt TEXT NOT NULL, body TEXT NOT NULL, created INTEGER NOT NULL, updated INTEGER NOT NULL)'
];
let ready:Promise<void>|undefined;
async function init(){if(!ready)ready=db().batch(schema.map(s=>db().prepare(s))).then(()=>{}).catch(e=>{ready=undefined;throw e});await ready}
const json=(value:unknown,status=200,headers:Record<string,string>={})=>Response.json(value,{status,headers:{'Cache-Control':'no-store',...headers}});
async function digest(value:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),b=>b.toString(16).padStart(2,'0')).join('')}
async function passwordHash(value:string,salt:string){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(value),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:new TextEncoder().encode(salt),iterations:100000},key,256);return Array.from(new Uint8Array(bits),b=>b.toString(16).padStart(2,'0')).join('')}
function equal(a:string,b:string){let diff=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)diff|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return diff===0}
const token=(req:Request)=>req.headers.get('cookie')?.match(/(?:^|;\s*)astral_admin=([^;]+)/)?.[1];
const cookie=(req:Request,value:string,age=28800)=>`astral_admin=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${new URL(req.url).protocol==='https:'?'; Secure':''}`;
async function administrator(req:Request){const value=token(req);if(!value)return null;return db().prepare('SELECT s.version FROM astral_admin_sessions s JOIN astral_admin a ON a.id=1 AND a.version=s.version WHERE s.token=? AND s.expires>?').bind(await digest(value),Date.now()).first<{version:number}>()}
async function loginLimit(req:Request){const key=await digest((req.headers.get('cf-connecting-ip')||'local')+':portfolio-login'),now=Date.now();await db().prepare('INSERT INTO portfolio_login_limits(key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires<? THEN 1 ELSE count+1 END,expires=CASE WHEN expires<? THEN ? ELSE expires END').bind(key,now+60000,now,now,now+60000).run();const row=await db().prepare('SELECT count FROM portfolio_login_limits WHERE key=?').bind(key).first<{count:number}>();return (row?.count||0)<=5}
function clean(value:unknown,max:number,required=false){if(typeof value!=='string'||value.length>max||required&&!value.trim())throw new Error('입력 내용을 확인해 주세요.');return value.trim()}
function validId(value:unknown){return typeof value==='string'&&/^[a-f0-9-]{36}$/i.test(value)}

export async function GET(req:Request){
 try{await init();const url=new URL(req.url);
  if(url.searchParams.has('session'))return await administrator(req)?json({admin:true}):json({error:'로그인이 필요합니다.'},401);
  if(url.searchParams.has('post')){const id=url.searchParams.get('post');if(!validId(id))return json({error:'글을 찾을 수 없습니다.'},404);const post=await db().prepare('SELECT id,title,category,excerpt,body,created,updated FROM portfolio_blog_posts WHERE id=?').bind(id).first();return post?json({post}):json({error:'글을 찾을 수 없습니다.'},404)}
  const profile=await db().prepare('SELECT name,headline,about FROM portfolio_blog_profile WHERE id=1').first();
  const posts=await db().prepare('SELECT id,title,category,excerpt,created FROM portfolio_blog_posts ORDER BY created DESC LIMIT 100').all();
  return json({profile:profile||{name:'',headline:'',about:''},posts:posts.results});
 }catch{return json({error:'내용을 불러오지 못했습니다.'},500)}
}

export async function POST(req:Request){
 try{if(req.headers.get('origin')!==new URL(req.url).origin)return json({error:'허용되지 않은 요청입니다.'},403);
  const raw=await req.text();if(raw.length>25000)return json({error:'입력 내용이 너무 깁니다.'},413);
  const b=JSON.parse(raw);await init();
  if(b.action==='adminLogin'){
   if(!await loginLimit(req))return json({error:'잠시 후 다시 시도해 주세요.'},429);
   const value=clean(b.password,128,true);if(value.length<6)return json({error:'비밀번호를 확인해 주세요.'},400);
   let account=await db().prepare('SELECT * FROM astral_admin WHERE id=1').first<{salt:string;password:string;version:number}>();
   if(!account){const initial=(env as unknown as {ADMIN_INITIAL_PASSWORD?:string}).ADMIN_INITIAL_PASSWORD;if(!initial)return json({error:'초기 관리자 비밀번호 설정이 필요합니다.'},503);const salt=crypto.randomUUID();if(!equal(await passwordHash(value,salt),await passwordHash(initial,salt)))return json({error:'비밀번호가 올바르지 않습니다.'},401);await db().prepare('INSERT OR IGNORE INTO astral_admin(id,salt,password,version) VALUES (1,?,?,1)').bind(salt,await passwordHash(initial,salt)).run();account=await db().prepare('SELECT * FROM astral_admin WHERE id=1').first<{salt:string;password:string;version:number}>()}
   if(!account||!equal(await passwordHash(value,account.salt),account.password))return json({error:'비밀번호가 올바르지 않습니다.'},401);
   const valueToken=crypto.randomUUID()+crypto.randomUUID();await db().prepare('INSERT INTO astral_admin_sessions(token,expires,version) VALUES (?,?,?)').bind(await digest(valueToken),Date.now()+28800000,account.version).run();return json({ok:true},200,{'Set-Cookie':cookie(req,valueToken)});
  }
  if(!await administrator(req))return json({error:'관리자 로그인이 필요합니다.'},401);
  if(b.action==='adminLogout'){const value=token(req);if(value)await db().prepare('DELETE FROM astral_admin_sessions WHERE token=?').bind(await digest(value)).run();return json({ok:true},200,{'Set-Cookie':cookie(req,'',0)})}
  if(b.action==='adminBlogProfileUpdate'){const profile={name:clean(b.name,80),headline:clean(b.headline,160),about:clean(b.about,4000)};await db().prepare('INSERT INTO portfolio_blog_profile(id,name,headline,about) VALUES (1,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,headline=excluded.headline,about=excluded.about').bind(profile.name,profile.headline,profile.about).run();return json({ok:true,profile})}
  if(b.action==='adminBlogPostSave'){
   const title=clean(b.title,140,true),excerpt=clean(b.excerpt,300),body=clean(b.body,20000,true),category=b.category;if(!['study','project','note'].includes(category))return json({error:'글 분류를 확인해 주세요.'},400);
   const id=b.id===undefined?crypto.randomUUID():validId(b.id)?b.id:null;if(!id)return json({error:'글을 찾을 수 없습니다.'},404);
   const existing=await db().prepare('SELECT created FROM portfolio_blog_posts WHERE id=?').bind(id).first<{created:number}>();if(b.id&&!existing)return json({error:'수정할 글을 찾을 수 없습니다.'},404);
   const post={id,title,category,excerpt,body,created:existing?.created||Date.now(),updated:Date.now()};await db().prepare('INSERT INTO portfolio_blog_posts(id,title,category,excerpt,body,created,updated) VALUES (?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,category=excluded.category,excerpt=excluded.excerpt,body=excluded.body,updated=excluded.updated').bind(post.id,post.title,post.category,post.excerpt,post.body,post.created,post.updated).run();return json({ok:true,post});
  }
  if(b.action==='adminBlogPostDelete'){if(!validId(b.id))return json({error:'글을 찾을 수 없습니다.'},404);await db().prepare('DELETE FROM portfolio_blog_posts WHERE id=?').bind(b.id).run();return json({ok:true})}
  return json({error:'알 수 없는 요청입니다.'},400);
 }catch(e){return json({error:e instanceof Error&&/입력 내용/.test(e.message)?e.message:'요청을 처리하지 못했습니다.'},400)}
}
