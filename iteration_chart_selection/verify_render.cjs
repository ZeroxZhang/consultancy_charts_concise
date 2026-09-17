/* 合成样张：验证三个未封装表达沿通用 SVG 入口完成装配和 HTML/PDF 对账。 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../consulting_deck_skill_concise');
const {render}=require(path.join(root,'scripts/render_echarts_svg.cjs'));
const {assemble}=require(path.join(root,'scripts/assemble_deck.cjs'));
const input=JSON.parse(fs.readFileSync(path.join(__dirname,'input.json'))).requests;
const service=input.find(c=>c.id==='service').data,estimates=input.find(c=>c.id==='estimates').data,migration=input.find(c=>c.id==='migration').data;
const out=path.join(__dirname,'rendered');fs.mkdirSync(out,{recursive:true});
const chart=option=>{const result=render({width:1100,height:410,theme_id:'mckinsey',typography_id:'serif-report-bold',fontSize:18,option});assert.equal(result.pages.length,1);return result.pages[0].svg;};
const ecdf=values=>[[0,0],...[...new Set(values)].sort((a,b)=>a-b).map(x=>[x,100*values.filter(v=>v<=x).length/values.length])];
assert.equal(service.A.filter(v=>v<=30).length,19);assert.equal(service.B.filter(v=>v<=30).length,14);
const a=ecdf(service.A),b=ecdf(service.B);a.push([70,100]);
const first=chart({animation:false,legend:{top:0,data:['A组','B组'],textStyle:{fontSize:18}},grid:{left:85,right:70,top:60,bottom:55},xAxis:{type:'value',min:0,max:70,interval:10,name:'分钟',nameLocation:'end',axisLabel:{fontSize:16}},yAxis:{type:'value',min:0,max:100,interval:25,name:'累计完成比例（%）',axisLabel:{fontSize:16}},series:[{type:'line',name:'A组',data:a,step:'end',showSymbol:false,lineStyle:{width:3,color:'#000080'},itemStyle:{color:'#000080'},markLine:{silent:true,symbol:'none',label:{formatter:'30分钟承诺',fontSize:16},lineStyle:{color:'#50606E',type:'dashed'},data:[{xAxis:30}]}},{type:'line',name:'B组',data:b,step:'end',showSymbol:false,lineStyle:{width:3,color:'#50606E',type:'dashed'},itemStyle:{color:'#50606E'}}]});
const x=v=>160+(v+5)/20*700;
const text=(x,y,t,extra='')=>`<text x="${x}" y="${y}" font-family="Deck Inter, Deck Noto Sans SC, sans-serif" font-size="18" fill="#172333" ${extra}>${t}</text>`;
const second=`<svg width="1100" height="410" viewBox="0 0 1100 410" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="五项实验的估计及95%置信区间">${text(80,30,'实验')}${text(945,30,'点估计［95% CI］','text-anchor="middle"')}<line x1="${x(0)}" x2="${x(0)}" y1="48" y2="335" stroke="#8C99A5" stroke-dasharray="5 5"/>${estimates.map((v,i)=>{const y=80+i*55;return text(90,y+6,v.item)+`<line x1="${x(v.low)}" x2="${x(v.high)}" y1="${y}" y2="${y}" stroke="#000080" stroke-width="3"/><path d="M${x(v.low)} ${y-7}v14M${x(v.high)} ${y-7}v14" stroke="#000080" stroke-width="2"/><circle cx="${x(v.effect)}" cy="${y}" r="6" fill="#000080"/>`+text(945,y+6,`${v.effect}［${v.low}, ${v.high}］`,'text-anchor="middle"');}).join('')}<line x1="160" x2="860" y1="348" y2="348" stroke="#50606E"/>${[-5,0,5,10,15].map(v=>text(x(v),377,String(v),'text-anchor="middle"')).join('')}${text(510,405,'改善幅度（百分点）','text-anchor="middle"')}</svg>`;
assert.ok(estimates.every(v=>v.low<=v.effect&&v.effect<=v.high));
const third=chart({animation:false,grid:{left:135,right:90,top:30,bottom:130},xAxis:{type:'category',position:'top',data:migration.columns,axisLabel:{fontSize:18},splitArea:{show:false}},yAxis:{type:'category',inverse:true,data:migration.rows,axisLabel:{fontSize:18}},visualMap:{min:0,max:100,orient:'horizontal',left:'center',bottom:25,itemWidth:16,itemHeight:270,text:['100人','0人'],textStyle:{fontSize:16},inRange:{color:['#F1F1F9','#D9D9EC','#000080']}},series:[{type:'heatmap',data:migration.matrix.flatMap((row,y)=>row.map((value,x)=>[x,y,value])),label:{show:true,fontSize:20,color:'#172333'},itemStyle:{borderColor:'#FFFFFF',borderWidth:3},emphasis:{disabled:true}}]});
const specs=[{visual:'ecdf',title:'30分钟内完成：A组为95%，B组为70%',lead:'每组20条同周期观测；阶梯线保留真实累计比例，显示承诺阈值与超时尾部。',svg:first},{visual:'forest',title:'B的点估计最高，但其区间跨过零',lead:'区间来自输入材料；此图不支持直接推断实验间差异具有统计显著性。',svg:second},{visual:'transition-matrix',title:'高价值客户中，38%向下迁移或流失',lead:'同一批300名客户；每行100人，行是上月层级，列是本月去向，单位为人。',svg:third}];
fs.writeFileSync(path.join(out,'pages.json'),JSON.stringify({version:1,pages:specs.map((s,i)=>({page:i+1,proves:s.title,form:'svg.custom',visual:s.visual}))},null,2));
fs.writeFileSync(path.join(out,'task.json'),JSON.stringify({version:1,workMode:'editorial',complexity:'simple',majorConclusion:false,mode:'reading',theme:'mckinsey',typography:'serif-report-bold',ratio:'16x9',kind:'fragment',pages:{record:'pages.json'},critical:[]},null,2));
fs.writeFileSync(path.join(out,'page.css'),'.slide__body{display:block}.sample-chart{width:1100px;margin:18px auto 0}.sample-chart svg{display:block}.slide__lead{max-width:1120px}');
fs.writeFileSync(path.join(out,'pages.html'),specs.map((s,i)=>`<section class="slide reading" data-frame-boundary="space" data-form="svg.custom" data-visual="${s.visual}" data-proves="${s.title}"><header class="slide__header"><h1 class="slide__title">${s.title}</h1><p class="slide__lead">${s.lead}</p></header><div class="slide__body"><div class="sample-chart">${s.svg}</div></div><div class="source">来源：input.json，合成验证材料；仅验证图表表达与交付路径，非真实业务结论。</div><div class="slide__page">${i+1}</div></section>`).join('\n'));
(async()=>{
 const result=await assemble({pagesFile:path.join(out,'pages.html'),outputFile:path.join(out,'deck.html'),cssFile:path.join(out,'page.css'),contractFile:path.join(out,'task.json'),title:'内容选型验证'});
 assert.equal(result.pages,3);
 // 真实装配链路必须拒绝丢失或改变的实际图型声明。
 const original=fs.readFileSync(path.join(out,'pages.html'),'utf8'),negative=path.join(out,'invalid-pages.html');
 try{
  for(const changed of [original.replace('data-visual="ecdf"',''),original.replace('data-visual="ecdf"','data-visual="bar"')]){
   fs.writeFileSync(negative,changed);
   await assert.rejects(()=>assemble({pagesFile:negative,outputFile:path.join(out,'invalid-deck.html'),contractFile:path.join(out,'task.json')}),/data-visual/);
  }
 } finally {fs.rmSync(negative,{force:true});}
 console.log(JSON.stringify({status:'PASS',pages:3,visuals:specs.map(s=>s.visual),planner:'not used',negativeAssemblyCases:2}));
})().catch(e=>{console.error(e);process.exitCode=1});
