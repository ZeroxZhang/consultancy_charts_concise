/* 验证数值保真、标签完整性、分页和三主题真实SVG，不仅检查文件存在。 */
const assert=require('node:assert/strict'),r=require('../assets/echarts-recipes.js'),rt=require('../assets/chart-runtime.js'),themes=require('../assets/deck-themes.js');
const {render}=require('./render_echarts_svg.cjs'),echarts=require(process.env.ECHARTS_MODULE||'echarts');
const cases={
  rankedBar:{items:[{label:'乙',value:2},{label:'甲',value:5,selected:true}],baseline:3},
  groupedBar:{categories:['甲','乙'],series:[{name:'本期',values:[8,-2]},{name:'上期',values:[6,1]}]},
  timeSeries:{periods:['2024','2025'],series:[{name:'收入',values:[10,12]}]},
  composition:{mode:'percent',items:[{label:'甲',segments:[{label:'核心',value:80},{label:'新业务',value:20}]}]},
  histogram:{bins:[{label:'0–10',value:3},{label:'10–20',value:7},{label:'20–30',value:2}]},
  scatter:{items:[{label:'甲',x:1,y:2,size:100},{label:'乙',x:2,y:1,size:25}]},
  heatmap:{rows:['市场'],columns:['规模','增长'],values:[[4,5]],min:1,max:5},
  sankey:{nodes:['入口','成交'],links:[{source:'入口',target:'成交',value:8}]},
  tree:{root:{label:'利润',value:888,children:[{label:'收入',value:999},{label:'成本',value:111}]}}
};
const texts=svg=>[...svg.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)].map(m=>m[1]).join('|');
assert.equal(echarts.version,require('../package.json').dependencies.echarts);
const bubble=r.scatter({items:[0,1,2,100].map((size,i)=>({label:String(i),x:i,y:i,size}))}).series[0].symbolSize;
assert.equal(bubble([0,0,0]),0);
assert.ok(Math.abs(bubble([0,0,2])**2/bubble([0,0,1])**2-2)<1e-12);
assert.equal(bubble([0,0,100]),42);
assert.throws(()=>r.scatter({items:[{label:'甲',x:0,y:0,size:2},{label:'乙',x:1,y:1}]}),/缺失/);
assert.throws(()=>r.rankedBar({items:[{label:'甲',value:10}],min:5}),/零/);
assert.throws(()=>r.sankey({nodes:['A','B'],links:[{source:'A',target:'B',value:1},{source:'B',target:'A',value:1}]}),/环/);
assert.throws(()=>r.sankey({nodes:['A','B','C'],links:[{source:'A',target:'B',value:10},{source:'B',target:'C',value:8}]}),/闭合/);
assert.throws(()=>r.sankey({nodes:['A'],links:[{source:'A',target:'B',value:1}]}),/未知节点/);
assert.throws(()=>r.heatmap({rows:['A'],columns:['B'],values:[[9]],min:0,max:5}),/覆盖/);
assert.throws(()=>r.composition({items:[{label:'A',segments:[{label:'x',value:1},{label:'x',value:2}]}]}),/唯一/);
const negative=r.timeSeries({periods:['一月','二月'],zeroBaseline:true,series:[{name:'净值',values:[-10,10]}]});
assert.equal(negative.yAxis.min,-10);assert.equal(negative.yAxis.max,10);

for(const theme_id of themes.ids){
 const t=themes.get(theme_id).tokens,settings={tokens:t,width:720,height:360};
 for(const [recipe,spec] of Object.entries(cases)){
  const result=render({recipe,spec,theme_id,width:720,height:360});
  assert.ok(result.pages.length);
  for(const p of result.pages){assert.match(p.svg,/^<svg/);assert.doesNotMatch(p.svg,/NaN|Infinity/);assert.ok(texts(p.svg).length>1);}
  if(recipe==='tree')assert.match(texts(result.pages[0].svg),/888/);
 }
 const items=Array.from({length:24},(_,i)=>({label:'渠道'+String(i+1).padStart(2,'0'),value:100-i}));
 const rank=render({recipe:'rankedBar',spec:{items},theme_id,width:720,height:360});
 assert.ok(rank.pages.length>1);assert.ok(rank.pages.every(p=>p.kind==='table'));
 const rows=rank.pages.flatMap(p=>p.table.rows);
 assert.equal(rows.length,24);assert.deepEqual(rows.map(v=>v[0]),items.map(v=>v.label));
 items.forEach(d=>assert.ok(rank.pages.some(p=>texts(p.svg).includes(d.label)),'分页遗漏 '+d.label));
 const full=render({recipe:'rankedBar',spec:{items},theme_id,width:1200,height:800});
 assert.equal(full.pages[0].kind,'chart');items.forEach(d=>assert.ok(texts(full.pages[0].svg).includes(d.label)));
 const small=render({recipe:'composition',spec:{mode:'percent',items:[{label:'渠道',segments:[{label:'大项',value:99},{label:'小项',value:1},{label:'零项',value:0}]}]},theme_id,width:720,height:360});
 assert.equal(small.pages[0].kind,'table');assert.match(texts(small.pages[0].svg),/1 \/ 1%/);assert.match(texts(small.pages[0].svg),/0 \/ 0%/);
 const zero=render({recipe:'sankey',spec:{nodes:['A','B'],links:[{source:'A',target:'B',value:0}]},theme_id});
 assert.equal(zero.pages[0].kind,'table');assert.doesNotMatch(zero.pages[0].svg,/NaN/);
 const flow=rt.prepare('sankey',cases.sankey,settings).pages[0].option;
 assert.equal(flow.series[0].data[0].itemStyle.color,t.accent);
 let root={label:'末级数据业务流程'};for(let i=8;i>=1;i--)root={label:'第'+i+'层业务处理步骤',children:[root]};
 const deep=render({recipe:'tree',spec:{root},theme_id,width:720,height:360});assert.equal(deep.pages[0].kind,'table');assert.equal(deep.pages.flatMap(p=>p.table.rows).length,9);
 const collision=render({recipe:'scatter',spec:{xLabel:'收入',xUnit:'亿元',yLabel:'利润',yUnit:'亿元',sizeUnit:'人',items:[1,2,3,4,5].map(size=>({label:'对象'+size,x:1,y:1,size}))},theme_id,width:720,height:360});
 assert.equal(collision.pages[0].kind,'table');assert.deepEqual(collision.pages.flatMap(p=>p.table.rows).map(r=>r[3]),['1','2','3','4','5']);
 const long=render({recipe:'groupedBar',spec:{categories:['甲'],series:[{name:'很长的系列名称和口径说明'.repeat(8),values:[5]}]},theme_id,width:720,height:360});assert.equal(long.pages[0].kind,'table');
 // 逐个探测连续色阶，用ECharts实际映射底色测量，不复述阈值实现。
 for(let step=0;step<=100;step++){
  const value=step/100,option=rt.prepare('heatmap',{rows:['A'],columns:['B'],values:[[value]],min:0,max:1},settings).pages[0].option;
  const c=echarts.init(null,null,{renderer:'svg',ssr:true,width:720,height:360});
  try{c.setOption(option);const bg=c.getModel().getSeriesByIndex(0).getData().getItemVisual(0,'style').fill,fg=option.series[0].data[0].label.color;
    assert.ok(rt.contrast(bg,fg)>=4.5,theme_id+' '+value+' 对比度不足');}finally{c.dispose();}
 }
}
console.log('PASS: 9配方×3主题、气泡面积/零值、全部标签与分页守恒、小片完整表、Sankey闭合/环/零流量、303个实际热力色阶反差');
