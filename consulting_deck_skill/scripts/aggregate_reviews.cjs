/* 一份review核对真实返回：自然语言、缺页、范围收窄均保留为未完成。 */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const layers=['page','exhibit','annotation','typography'];
const sha=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
function inspectCoverage(review,{htmlSha256,pdfSha256,pages,requireIndependent=false,baseDir=process.cwd()}){
 const errors=[];
 if(review.htmlSha256!==htmlSha256||review.pdfSha256!==pdfSha256)errors.push('审查对应旧版HTML/PDF');
 if(!Array.isArray(review.coverage)||!review.coverage.length)return [...errors,'缺少实际页集合与四层覆盖'];
 const valid=[];
 for(const [i,c] of review.coverage.entries()){
  const tag='coverage '+i;
  if(!c||!['author','independent'].includes(c.independence)||typeof c.reviewer!=='string'||!c.reviewer.trim()){errors.push(tag+'审查身份缺失');continue;}
  if(!Array.isArray(c.layers)||layers.some(l=>!c.layers.includes(l)))errors.push(tag+'四层检查范围不完整');
  for(const medium of ['htmlPages','pdfPages']){
   const set=c[medium];
   if(!Array.isArray(set)||new Set(set).size!==set.length||set.some(n=>!Number.isInteger(n)||n<1||n>pages))errors.push(tag+' '+medium+'集合无效');
  }
  if(!Array.isArray(c.evidence)||!c.evidence.length)errors.push(tag+'缺少实际图像证据');
  else for(const evidence of c.evidence){
   if(!evidence||typeof evidence.path!=='string'||typeof evidence.sha256!=='string'){errors.push(tag+'证据格式错误');continue;}
   const p=path.resolve(baseDir,evidence.path);
   if(!fs.statSync(p,{throwIfNoEntry:false})?.isFile()||sha(p)!==evidence.sha256)errors.push(tag+'证据缺失或已变更：'+evidence.path);
  }
  valid.push(c);
 }
 for(const role of requireIndependent?['author','independent']:['all'])for(const medium of ['htmlPages','pdfPages']){
  const seen=new Set(valid.filter(c=>role==='all'||c.independence===role).flatMap(c=>c[medium]||[]));
  const missing=Array.from({length:pages},(_,i)=>i+1).filter(i=>!seen.has(i));
  if(missing.length)errors.push(role+' '+medium+'缺页：'+missing.join(','));
 }
 return errors;
}
function aggregate(audit,inputs,{baseDir=process.cwd(),requireIndependent=false}={}){
 const errors=[],coverage=[],issues=[],checks={};
 for(const [i,raw] of inputs.entries()){
  let result=raw;
  if(typeof raw==='string')try{result=JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g,''));}catch{errors.push('结果'+i+'为未解析自然语言，须解析核对或补查');continue;}
  if(!result||!Array.isArray(result.coverage)||!Array.isArray(result.issues)){errors.push('结果'+i+'格式不完整，不能视为空问题');continue;}
  if(result.status!=='complete')errors.push('结果'+i+'状态未完成：'+String(result.status??'missing'));
  if(result.htmlSha256!==audit.htmlArtifact.sha256||result.pdfSha256!==audit.pdfArtifact.sha256){errors.push('结果'+i+'版本不匹配');continue;}
  coverage.push(...result.coverage);issues.push(...result.issues);
  for(const key of ['analysis','evidence','visual']){
   const c=result.checks?.[key];
   if(!c||!['pass','not_applicable'].includes(c.status)||(key==='visual'&&c.status!=='pass')||typeof c.basis!=='string'||!c.basis.trim()){errors.push('结果'+i+' '+key+'未通过或缺少本份结果依据');continue;}
   (checks[key]??={status:c.status,basis:''}).basis+=c.basis+'\n';
  }
 }
 const review={schemaVersion:2,status:'incomplete',reviewer:[...new Set(coverage.map(c=>c.reviewer))].join('; '),independence:coverage.some(c=>c.independence==='independent')?'independent':'author',htmlSha256:audit.htmlArtifact.sha256,pdfSha256:audit.pdfArtifact.sha256,coverage,checks,issues};
 errors.push(...inspectCoverage(review,{htmlSha256:review.htmlSha256,pdfSha256:review.pdfSha256,pages:audit.pages,baseDir,requireIndependent}));
 for(const key of ['analysis','evidence','visual'])if(!checks[key]?.basis?.trim())errors.push('缺少'+key+'审查结果');
 for(const issue of issues){if(!issue||!['minor','major','blocking'].includes(issue.severity)||!['open','resolved'].includes(issue.status)||!issue.description?.trim())errors.push('问题格式不完整');else if(issue.severity!=='minor'&&issue.status==='open')errors.push('未解决：'+issue.description);}
 review.aggregationErrors=errors;review.status=errors.length?'incomplete':'complete';return review;
}
if(require.main===module){
 try{const [auditFile,output,...files]=process.argv.slice(2);if(!files.length)throw Error('用法：node aggregate_reviews.cjs audit.json review.json author.json independent.json');
 const audit=JSON.parse(fs.readFileSync(auditFile,'utf8'));
 const review=aggregate(audit,files.map(f=>fs.readFileSync(f,'utf8')),{baseDir:path.dirname(path.resolve(output)),requireIndependent:audit.documentContract?.kind==='report'});
 fs.writeFileSync(output,JSON.stringify(review,null,2));console.log(JSON.stringify({status:review.status,errors:review.aggregationErrors}));if(review.status!=='complete')process.exitCode=1;
 }catch(e){console.error(e.message);process.exitCode=1;}
}
module.exports={aggregate,inspectCoverage,layers};
