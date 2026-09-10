/* 真正装配、浏览器打印和 PDF 栅格路径的 V11.2 集成反例；保留旧 QA 测试独立运行。 */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const {assemble}=require('./assemble_deck.cjs');
const contracts=require('./report_contract.cjs');
(async()=>{const dir=fs.mkdtempSync(path.join(os.tmpdir(),'qa-v12-'));try{
 const pages=path.join(dir,'pages.html'),deck=path.join(dir,'deck.html'),taskFile=path.join(dir,'task.json');
 const task={workMode:'editorial',complexity:'simple',critical:[{id:'limit',text:'不是最终收入比',target:'value'}]};
 fs.writeFileSync(taskFile,JSON.stringify(task));
 fs.writeFileSync(pages,'<section class="slide reading" data-page-id="evidence" data-frame-boundary="space"><header class="slide__header"><h1 class="slide__title">关键限定完整性</h1></header><div class="slide__body" style="align-content:start"><div id="value">样本比例 38%</div><p data-critical-id="limit" data-critical-for="value">不是最终收入比</p></div><div class="source">合成验证材料</div><div class="slide__page">1</div></section>');
 await assemble({pagesFile:pages,outputFile:deck,contractFile:taskFile});const source=fs.readFileSync(deck,'utf8');
 const cases=[
  ['baseline',source,true,null],
  ['print-loss',source.replace('</head>','<style>@media print{[data-critical-id]{display:none!important}}</style></head>'),false,/关键语义|关键文字/],
  ['custom-edge',source.replace('</head>','<style>[data-critical-id]{border-left:3px solid teal;padding:12px}</style></head>'),false,/视觉禁令/],
  ['task-mismatch',source.replace('data-ratio="16x9"','data-ratio="4x3"'),false,/ratio不一致/],
  ['planner-missing',contracts.install(source,{...contracts.read(source),planner:{mode:'used',record:'missing.json',sha256:'a'.repeat(64)}}),false,/planner合同/]
 ];
 for(const [name,html,pass,expected] of cases){const file=path.join(dir,name+'.html'),out=path.join(dir,name);fs.writeFileSync(file,html);const proc=spawnSync(process.execPath,[path.join(__dirname,'qa_deck.cjs'),file,out],{env:process.env,encoding:'utf8',maxBuffer:20*1024*1024});if(!fs.existsSync(path.join(out,'audit.json')))throw Error(name+': '+proc.stderr+proc.stdout);const audit=JSON.parse(fs.readFileSync(path.join(out,'audit.json')));assert.equal(audit.geometryStatus,pass?'PASS':'FAIL',name+JSON.stringify(audit.errors));if(expected)assert.ok(audit.errors.some(e=>expected.test(e)),name+JSON.stringify(audit.errors));if(pass){assert.equal(audit.plannerExecution.status,'DIRECT');assert.equal(audit.evidenceManifest.entries.length,2);assert.ok(audit.evidenceManifest.entries.some(e=>e.medium==='pdf'&&e.path==='pdf-p01.png'));assert.deepEqual(audit.rows[0].criticalPdf.errors,[]);assert.equal(audit.taskContract.reviewPolicy,'author');}console.log(name+': '+audit.geometryStatus);}
 console.log('PASS V11.2 QA integration: actual PDF evidence, critical text, decoration, task identity and planner binding');
}finally{fs.rmSync(dir,{recursive:true,force:true})}})().catch(e=>{console.error(e);process.exitCode=1});
