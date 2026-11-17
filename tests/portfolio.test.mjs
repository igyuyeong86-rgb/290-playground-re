import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {strict as assert} from 'node:assert';
import ts from 'typescript';

const sql=new DatabaseSync(':memory:');
class Statement{
 constructor(query,args=[]){this.query=query;this.args=args}
 bind(...args){return new Statement(this.query,args)}
 async first(){return sql.prepare(this.query).get(...this.args)||null}
 async all(){return {results:sql.prepare(this.query).all(...this.args)}}
 async run(){const result=sql.prepare(this.query).run(...this.args);return {meta:{changes:Number(result.changes)}}}
}
globalThis.__env={DB:{prepare:query=>new Statement(query),batch:async statements=>{sql.exec('BEGIN');try{const results=[];for(const statement of statements)results.push(await statement.run());sql.exec('COMMIT');return results}catch(error){sql.exec('ROLLBACK');throw error}}},ADMIN_INITIAL_PASSWORD:'test-password-123'};
const source=readFileSync('app/api/portfolio/route.ts','utf8').replace("import {env} from 'cloudflare:workers';",'const env=globalThis.__env;');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {GET,POST}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const origin='https://portfolio.test';
async function get(query='',cookie=''){const response=await GET(new Request(origin+'/api/portfolio'+query,{headers:{cookie}}));return {status:response.status,data:await response.json()}}
async function post(body,cookie='',ip='test'){const response=await POST(new Request(origin+'/api/portfolio',{method:'POST',headers:{origin,cookie,'cf-connecting-ip':ip},body:JSON.stringify(body)}));return {status:response.status,data:await response.json(),cookie:response.headers.get('set-cookie')?.split(';')[0],header:response.headers.get('set-cookie')}}

assert.deepEqual((await get()).data,{profile:{name:'',headline:'',about:''},posts:[]});
assert.equal((await get('?session=1')).status,401);
assert.equal((await post({action:'adminBlogProfileUpdate',name:'',headline:'',about:''})).status,401);
assert.equal((await post({action:'adminLogin',password:'wrong-password'},'','wrong')).status,401);
const login=await post({action:'adminLogin',password:'test-password-123'},'','good');
assert.equal(login.status,200);assert.match(login.header,/HttpOnly/);assert.match(login.header,/SameSite=Strict/);assert.match(login.header,/Secure/);
assert.equal((await get('?session=1',login.cookie)).status,200);
assert.equal((await post({action:'adminBlogProfileUpdate',name:'',headline:'',about:''},login.cookie)).status,200);
assert.equal((await post({action:'adminBlogPostSave',title:'Empty',category:'study',excerpt:'',body:''},login.cookie)).status,400);
const created=await post({action:'adminBlogPostSave',title:'Study note',category:'study',excerpt:'Short summary',body:'Article body'},login.cookie);
assert.equal(created.status,200);
const id=created.data.post.id;
assert.equal((await get()).data.posts[0].title,'Study note');
assert.equal((await get('?post='+id)).data.post.body,'Article body');
assert.equal((await post({action:'adminBlogPostSave',id,title:'Updated',category:'project',excerpt:'',body:'Revised'},login.cookie)).status,200);
assert.equal((await get('?post='+id)).data.post.category,'project');
assert.equal((await post({action:'adminBlogPostDelete',id})).status,401);
assert.equal((await post({action:'adminBlogPostDelete',id},login.cookie)).status,200);
assert.equal((await get()).data.posts.length,0);
assert.equal((await post({action:'adminLogout'},login.cookie)).status,200);
assert.equal((await get('?session=1',login.cookie)).status,401);
const csrf=await POST(new Request(origin+'/api/portfolio',{method:'POST',headers:{origin:'https://other.test'},body:JSON.stringify({action:'adminLogin',password:'test-password-123'})}));
assert.equal(csrf.status,403);
console.log('PASS: blank profile, admin authentication, protected edits, post CRUD, session logout and CSRF.');
