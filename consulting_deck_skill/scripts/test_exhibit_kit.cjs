/* 验证数学编码、不变式、转义和输入边界；不依赖浏览器。 */
const assert = require('node:assert/strict');
const kit = require('../assets/exhibit-kit.js');
const wf=kit.waterfall({items:[{type:'total',label:'期初',value:10},{type:'delta',label:'下降',value:-15},{type:'delta',label:'回升',value:8},{type:'subtotal',label:'期末'}]});
assert.match(wf,/data-from="10" data-to="-5"/);assert.match(wf,/data-from="-5" data-to="3"/);assert.match(wf,/data-from="0" data-to="3"/);assert.doesNotMatch(wf,/NaN|Infinity/);
const mk=kit.mekko({items:[{label:'甲',segments:[{label:'一',value:10},{label:'二',value:30}]},{label:'乙',segments:[{label:'一',value:60},{label:'二',value:20}]}]});
const rects=[...mk.matchAll(/<rect x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)"[^>]+data-value="([^"]+)"/g)];assert.equal(rects.length,4);const ratios=rects.map(m=>+m[3]*+m[4]/+m[5]);ratios.forEach(r=>assert.ok(Math.abs(r-ratios[0])<1e-6));
assert.match(kit.dumbbell({items:[{label:'<script>&"',start:-2,end:4}]}),/&lt;script&gt;&amp;&quot;/);
for(const [fn,spec] of Object.entries({slope:{items:[{label:'A',start:-1,end:2}]},bullet:{items:[{label:'A',value:30,target:50,max:100}]},heatmap:{rows:['A'],columns:['B'],values:[[-3]]},tree:{root:{label:'A',children:[{label:'B'},{label:'C'}]}},swimlane:{lanes:['A'],stages:['B','C'],items:[{id:'a',label:'任务',lane:0,stage:0},{id:'b',label:'交付',lane:0,stage:1}],edges:[{from:'a',to:'b'}]}})){const svg=kit[fn](spec);assert.ok(svg.startsWith('<svg'));assert.doesNotMatch(svg,/NaN|Infinity|undefined/);}
assert.throws(()=>kit.waterfall({items:[{type:'total',value:NaN}]}));assert.throws(()=>kit.waterfall({items:[{type:'total',value:3},{type:'subtotal',value:5}]}));assert.throws(()=>kit.waterfall({domain:[0,1],items:[{type:'total',value:2}]}));
assert.throws(()=>kit.mekko({items:[{segments:[{value:-1}]}]}));assert.throws(()=>kit.heatmap({rows:['a'],columns:['b'],values:[[1,2]]}));assert.throws(()=>kit.bullet({items:[{value:10,target:5,max:8}]}));assert.throws(()=>kit.dumbbell({fontSize:10,items:[{label:'a',start:0,end:1}]}));
const cycle={label:'a'};cycle.children=[cycle];assert.throws(()=>kit.tree({root:cycle}));assert.throws(()=>kit.swimlane({lanes:['a'],stages:['b'],items:[{id:'x',lane:1,stage:0}]}));
const db=kit.dumbbell({width:960,domain:[-10,10],items:[{label:'a',start:-10,end:10}]});assert.match(db,/<circle cx="190"[^>]+data-role="start"/);assert.match(db,/<circle cx="875"[^>]+data-role="end"/);
const bl=kit.bullet({width:960,items:[{label:'a',value:50,target:75,max:100}]});assert.match(bl,/<rect x="190"[^>]+width="340"[^>]+data-value="50"/);assert.match(bl,/<line x1="700"[^>]+data-role="target"/);
const sl=kit.slope({height:500,domain:[0,100],items:[{label:'a',start:0,end:100}]});assert.match(sl,/<line x1="180" y1="435" x2="780" y2="60"/);
assert.throws(()=>kit.swimlane({lanes:['a'],stages:['b'],items:[{id:'x',lane:0,stage:0},{id:'y',lane:0,stage:0}]}));
assert.throws(()=>kit.waterfall({items:[{type:'total',value:10},{type:'delta',value:-4},{type:'total',value:9}]}),/总计/);
assert.doesNotThrow(()=>kit.waterfall({items:[{label:'起点',type:'total',value:10},{label:'变化',type:'delta',value:-14},{label:'期末',type:'total',value:-4}]}));
const singleBand=kit.bullet({items:[{label:'a',value:30,target:50,max:100}]});
assert.equal([...singleBand.matchAll(/height="30"/g)].length,1);
const threeBands=kit.bullet({items:[{label:'a',value:30,target:50,max:100,ranges:[50,80,100]}]});
assert.equal([...threeBands.matchAll(/height="30"/g)].length,3);
function lum(rgb){return rgb.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);}
function channels(hex){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));}
for(const accent of ['#176B91','#AED6EE','#FFE000','#111111']){
 const svg=kit.heatmap({rows:['a'],columns:['a','b','c','d','e'],values:[[1,2,3,4,5]],domain:[0,5],palette:{accent}});
 const cells=[...svg.matchAll(/fill="(#[0-9A-Fa-f]+)" fill-opacity="([^"]+)" data-value="[^"]+"\/><text[^>]+fill="(#[0-9A-Fa-f]+)"/g)];
 assert.equal(cells.length,5);
 cells.forEach(m=>{const alpha=+m[2],bg=lum(channels(m[1]).map(v=>alpha*v+(1-alpha)*255)),fg=lum(channels(m[3]));assert.ok((Math.max(bg,fg)+.05)/(Math.min(bg,fg)+.05)>=4.5,'热力标签对比度不足');});
}
console.log('8 exhibits: geometry, signed waterfall, area proportionality, escaping and invalid-input checks passed.');

assert.throws(()=>kit.tree({root:{children:[{label:'child'}]}}),/文字标签/);
assert.throws(()=>kit.dumbbell({items:[{start:1,end:2}]}),/文字标签/);
