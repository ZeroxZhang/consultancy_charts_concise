/* 真浏览器验证CSS、SVG与ECharts均使用选定主题。 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{pathToFileURL}=require('node:url'),assert=require('node:assert/strict'),themes=require('../assets/deck-themes.js');
const pw=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{const dir=fs.mkdtempSync(path.join(os.tmpdir(),'deck-themes-')),browser=await pw.chromium.launch({channel:'chrome',headless:true});try{
const engine=fs.readFileSync(path.resolve(__dirname,'../assets/deck_engine.html'),'utf8');
for(const id of themes.ids){const file=path.join(dir,id+'.html');fs.writeFileSync(file,themes.apply(engine,id));const p=await browser.newPage();await p.goto(pathToFileURL(file).href,{waitUntil:'networkidle'});await p.waitForFunction(()=>window.echarts&&window.DeckRecipes);const v=themes.get(id).tokens;
const result=await p.evaluate(()=>{const r=DeckRecipes.resolveTokens({color:['@cat-1','@cat-2'],visualMap:{inRange:{color:['@seq-1','@seq-5']}}});let invalid=false;try{DeckRecipes.resolveTokens('@does-not-exist')}catch{invalid=true}const e=document.createElement('div');e.style='width:400px;height:250px';document.body.append(e);const chart=echarts.init(e,null,{renderer:'svg'});chart.setOption({color:r.color,animation:false,xAxis:{data:['A','B']},yAxis:{},series:[{type:'bar',data:[10,20],itemStyle:{color:r.color[0]}}]});return {resolved:r,invalid,svg:e.innerHTML,brand:getComputedStyle(document.documentElement).getPropertyValue('--brand').trim()};});
assert.equal(result.brand,v.brand);assert.equal(result.resolved.color[0],v['cat-1']);assert.deepEqual(result.resolved.visualMap.inRange.color,[v['seq-1'],v['seq-5']]);assert.ok(result.invalid);assert.ok(result.svg.toLowerCase().includes(v['cat-1'].toLowerCase()));await p.close();}
console.log('3 themes browser PASS: CSS, recursive options, visualMap, actual ECharts SVG, unknown token rejection');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
