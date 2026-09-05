/* 两类原始输入的证据、派生、选型与最终输出测试；不以文件存在充当通过。 */
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {build,analyze}=require('./build_dense_reference.cjs'),{render}=require('./render_echarts_svg.cjs'),themes=require('../assets/deck-themes.js');
const input=path.resolve(__dirname,'../assets/dense-input-example'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'dense-input-test-'));
const data=analyze(),byId=new Map(data.evidence.map(e=>[e.id,e]));
assert.equal(data.rows.length,1152);assert.equal(data.evidence.filter(e=>e.source.title==='operations.csv'&&e.status==='synthetic').length,1152);
assert.equal(data.inventory[1].paragraphs,42);assert.equal(data.coding.cases.length,6);
for(const c of data.coding.cases)for(const kind of ['support','boundary']){const item=c[kind];assert.ok(item.evidence_ids.length>1);assert.equal(item.evidence_ids.map(id=>byId.get(id).claim).join(''),item.quote);for(const id of item.evidence_ids){const e=byId.get(id);assert.equal(item.quote.slice(e.source.char_start,e.source.char_end),e.claim);}}
for(const e of data.evidence.filter(e=>e.formula?.startsWith('SUM'))){assert.ok(e.input_ids.length);assert.equal(e.value,e.input_ids.reduce((v,id)=>v+byId.get(id).value,0));}
assert.equal(byId.get('D-GROWTH').value,(byId.get('D-Y2025').value/byId.get('D-Y2024').value-1)*100);
assert.equal(data.regions.reduce((n,r)=>n+r.value,0),byId.get('D-Y2025').value);
for(const theme of themes.ids){
 const result=build(path.join(tmp,theme),theme);
 assert.equal(result.pages,6);assert.doesNotMatch(result.html,/<script\s+src=/);assert.doesNotMatch(result.html,/NaN|Infinity/);
 for(const p of result.plans)for(const id of p.evidence_ids)assert.ok(byId.has(id),'页面孤立证据 '+id);
 const rankModule=result.plans[1].modules[0],rank=render({recipe:rankModule.recipe,spec:rankModule.spec,width:588,height:460,theme_id:theme});
 const tableRows=rank.pages.flatMap(p=>p.table.rows);assert.equal(tableRows.length,24);assert.equal(new Set(tableRows.map(r=>r[0])).size,24);
 const expected=[...data.regions].sort((a,b)=>b.value-a.value);assert.deepEqual(tableRows.map(r=>r[0]),expected.map(d=>d.label));
 tableRows.forEach((r,i)=>assert.equal(Number(r[1].replaceAll(',','')),expected[i].value));
 const small=result.plans[2].modules[0],comp=render({recipe:small.recipe,spec:small.spec,width:1200,height:460,theme_id:theme});
 assert.equal(comp.pages.flatMap(p=>p.table.rows).length,12);assert.ok(comp.pages[0].table.rows.some(r=>r[2].startsWith('0 / 0%')));assert.ok(comp.pages[0].table.rows.some(r=>r[2].startsWith('1 / ')));
 for(const c of data.coding.cases){assert.ok(result.html.includes(c.support.quote));assert.ok(result.html.includes(c.boundary.quote));assert.ok(result.html.includes(c.action));assert.ok(result.html.includes('data-case="'+c.id+'"'));}
 assert.ok(result.plans.slice(3).every(p=>p.modules[0].reader_operation==='A-15'&&p.modules[0].render_route==='html-css'));
 assert.ok(result.plans[0].modules[0].selected_visual==='chart','有空间的趋势图不应无理由变为表格');
}
// 破坏输入验证真正的门禁，不只核对同一实现输出的元数据。
const bad=path.join(tmp,'invalid');fs.mkdirSync(bad);for(const name of ['operations.csv','field-notes.md','text-coding.json'])fs.copyFileSync(path.join(input,name),path.join(bad,name));
const csv=fs.readFileSync(path.join(input,'operations.csv'),'utf8');
fs.writeFileSync(path.join(bad,'operations.csv'),csv.replace(',万元,',',亿元,'));assert.throws(()=>analyze(bad),/单位/);
fs.writeFileSync(path.join(bad,'operations.csv'),csv.replace('R01-202401-B','R01-202401-A'));assert.throws(()=>analyze(bad),/重复/);
fs.writeFileSync(path.join(bad,'operations.csv'),csv);const coding=JSON.parse(fs.readFileSync(path.join(input,'text-coding.json'),'utf8'));coding.cases[0].support.quote+='不存在的句子';fs.writeFileSync(path.join(bad,'text-coding.json'),JSON.stringify(coding));assert.throws(()=>analyze(bad),/引文/);
console.log('PASS: 1152条明细→逐条来源与派生校验→24地区全量排名/零值构成；42段长文本→6案例支持/边界/建议；三主题6页离线输出；拒绝错误单位、重复主键与虚假引文。临时证据：'+tmp);
