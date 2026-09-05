/* 原创零依赖、可打印 SVG 分析图组件。所有数值编码由数据计算。 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.ExhibitKit = api;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';
  const esc = v => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num = (v, name) => { if (typeof v !== 'number' || !Number.isFinite(v)) throw new Error(name + ' 必须为有限数值'); return v; };
  const list = (v, name) => { if (!Array.isArray(v) || !v.length) throw new Error(name + ' 不可为空'); return v; };
  const p0 = {"ink":"#172C3B","muted":"#586875","grid":"#BFCBD2","accent":"#2251FF","positive":"#2251FF","negative":"#9C5C14","surface":"#F2F5F7","selected":"#EAF0FF","series":["#2251FF","#007A78","#8652A0","#9C5C14","#667586","#9B4566"],"sequential":["#EAF0FF","#BFCFFF","#819EFF","#456CE3","#173D91"],"ranges":["#F2F5F7","#E8EDF0","#BFCBD2"]};
  /* 透明填充叠加白底后计算实际亮度，不能用透明度阈值推断文字颜色。 */
  function rgb(color) {
    if (typeof color !== 'string') throw new Error('颜色需要字符串');
    const hex=color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if(hex){const h=hex[1].length===3?hex[1].split('').map(v=>v+v).join(''):hex[1];return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16));}
    const match=color.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
    if(match&&match.slice(1).every(v=>+v<=255))return match.slice(1).map(Number);
    throw new Error('热力表颜色请使用 #RGB、#RRGGBB 或 rgb(r,g,b)，以便验证对比度');
  }
  function luminance(channels){const linear=channels.map(v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);});return linear[0]*.2126+linear[1]*.7152+linear[2]*.0722;}
  function contrast(a,b){return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);}
  function cellText(accent,alpha,ink){
    const bg=luminance(rgb(accent).map(v=>alpha*v+(1-alpha)*255));
    const dark=contrast(bg,luminance(rgb(ink))),light=contrast(bg,1);
    if(dark>=4.5)return ink;
    if(light>=4.5)return '#FFFFFF';
    /* 自定义 ink 太浅时，黑色兜底；黑或白至少有一个满足4.5。 */
    return '#000000';
  }
  function canvas(s) {
    if (!s || typeof s !== 'object') throw new Error('需要规格对象');
    const w=num(s.width === undefined ? 960 : s.width,'width'), h=num(s.height === undefined ? 500 : s.height,'height');
    if(w<320||h<200) throw new Error('画布至少 320×200');
    const fs=num(s.fontSize===undefined?14:s.fontSize,'fontSize'); if(fs<14) throw new Error('标签字号不得小于14');
    const p=Object.assign({},p0,s.palette||{}); if(s.palette&&s.palette.accent&&!Object.prototype.hasOwnProperty.call(s.palette,'sequential'))p.sequential=null; list(p.series,'palette.series');
    const out=[];
    const text=(x,y,t,anchor='start',color=p.ink,extra='') => { if(t===undefined||t===null||String(t).trim()==='')throw new Error('文字标签不能为空'); out.push(`<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${esc(color)}" ${extra}>${esc(t)}</text>`); };
    const rect=(x,y,width,height,color,extra='') => { if (![x,y,width,height].every(Number.isFinite)||width<0||height<0) throw new Error('非法矩形'); out.push(`<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${esc(color)}" ${extra}/>`); };
    const line=(x1,y1,x2,y2,color=p.grid,extra='') => out.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${esc(color)}" ${extra}/>`);
    const circle=(cx,cy,r,color,extra='') => out.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${esc(color)}" ${extra}/>`);
    const end=()=>`<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(s.title||'分析图')}" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="font-family:Arial,'PingFang SC','Microsoft YaHei',sans-serif;font-size:${fs}px"><title>${esc(s.title||'分析图')}</title><rect width="${w}" height="${h}" fill="white"/>${out.join('')}</svg>`;
    return {w,h,fs,p,out,text,rect,line,circle,end};
  }
  function domain(values, supplied) {
    let lo=Math.min(0,...values),hi=Math.max(0,...values);
    if(supplied!==undefined){if(!Array.isArray(supplied)||supplied.length!==2)throw new Error('domain 需要两个数');lo=num(supplied[0],'domain');hi=num(supplied[1],'domain');if(values.some(v=>v<lo||v>hi))throw new Error('domain 截断数据');}
    if(lo===hi){lo-=1;hi+=1;} if(lo>=hi)throw new Error('domain 顺序错误');return [lo,hi];
  }
  const scale=(d,a,b)=>v=>a+(v-d[0])/(d[1]-d[0])*(b-a);
  function rows(c,n){const y0=40,dy=(c.h-90)/n;if(dy<c.fs+12)throw new Error('行过多，请增加高度或拆分');return {y0,dy};}
  function waterfall(s){
    const c=canvas(s),items=list(s.items,'items');let acc=0;
    const steps=items.map((d,i)=>{if(!['total','delta','subtotal'].includes(d.type))throw new Error('waterfall type 应为 total/delta/subtotal');let from,to;
      if(d.type==='delta'){from=acc;to=acc+num(d.value,'value');acc=to;}
      else if(d.type==='total'){from=0;to=num(d.value,'value');if(i>0&&Math.abs(to-acc)>1e-8*Math.max(1,Math.abs(acc)))throw new Error('总计不等于累计值');acc=to;}
      else {from=0;to=acc;if(d.value!==undefined&&Math.abs(num(d.value,'value')-acc)>1e-8)throw new Error('小计不等于累计值');}
      return {label:d.label,from,to,type:d.type,value:d.type==='delta'?to-from:to};});
    const d=domain(steps.flatMap(x=>[x.from,x.to]),s.domain),y=scale(d,c.h-65,45),dx=(c.w-110)/items.length,bw=Math.min(76,dx*.65);if(dx<45)throw new Error('柱过多');
    c.line(60,y(0),c.w-30,y(0));
    steps.forEach((v,i)=>{const x=65+i*dx;c.rect(x,y(Math.max(v.from,v.to)),bw,Math.abs(y(v.from)-y(v.to)),v.type==='delta'?(v.value>=0?c.p.positive:c.p.negative):c.p.accent,`data-from="${v.from}" data-to="${v.to}"`);c.text(x+bw/2,y(Math.max(v.from,v.to))-8,(v.type==='delta'&&v.value>0?'+':'')+Number(v.value.toFixed(8)),'middle');c.text(x+bw/2,c.h-30,v.label,'middle');if(i<steps.length-1)c.line(x+bw,y(v.to),65+(i+1)*dx,y(v.to),c.p.grid,'stroke-dasharray="4 3"');});return c.end();
  }
  function dumbbell(s){const c=canvas(s),data=list(s.items,'items');data.forEach(d=>{num(d.start,'start');num(d.end,'end');});const d=domain(data.flatMap(v=>[v.start,v.end]),s.domain),x=scale(d,190,c.w-85),r=rows(c,data.length);
    data.forEach((v,i)=>{const y=r.y0+i*r.dy+r.dy/2;c.text(15,y+5,v.label);c.line(x(v.start),y,x(v.end),y,c.p.grid,'stroke-width="4"');c.circle(x(v.start),y,6,'#FFFFFF',`stroke="${esc(c.p.muted)}" stroke-width="2" data-role="start"`);c.circle(x(v.end),y,7,c.p.accent,'data-role="end"');c.text(x(v.start),y-13,v.start,'middle',c.p.muted);c.text(x(v.end),y+25,v.end,'middle',c.p.accent);});c.circle(190,20,6,'#FFFFFF',`stroke="${esc(c.p.muted)}" stroke-width="2"`);c.text(203,25,s.startLabel||'起始','start',c.p.ink);c.circle(c.w-140,20,7,c.p.accent);c.text(c.w-127,25,s.endLabel||'结束','start',c.p.ink);return c.end();}
  function slope(s){const c=canvas(s),data=list(s.items,'items');data.forEach(d=>{num(d.start,'start');num(d.end,'end');});const d=domain(data.flatMap(v=>[v.start,v.end]),s.domain),y=scale(d,c.h-65,60);c.text(180,25,s.startLabel||'起始','middle');c.text(c.w-180,25,s.endLabel||'结束','middle');data.forEach((v,i)=>{const col=c.p.series[i%c.p.series.length];c.line(180,y(v.start),c.w-180,y(v.end),col,'stroke-width="2"');c.circle(180,y(v.start),4,col);c.circle(c.w-180,y(v.end),4,col);c.text(168,y(v.start)+5,v.label+' '+v.start,'end');c.text(c.w-168,y(v.end)+5,v.end);});return c.end();}
  function bullet(s){const c=canvas(s),data=list(s.items,'items'),r=rows(c,data.length);data.forEach((v,i)=>{num(v.value,'value');num(v.target,'target');num(v.max,'max');if(v.max<=0||v.value<0||v.target<0||v.value>v.max||v.target>v.max)throw new Error('bullet 值须位于0至max');const ranges=v.ranges===undefined?[v.max]:v.ranges;list(ranges,'ranges');let prev=0;ranges.forEach(n=>{num(n,'range');if(n<=prev||n>v.max)throw new Error('ranges 须严格递增且不超max');prev=n;});const x=scale([0,v.max],190,c.w-90),y=r.y0+i*r.dy+r.dy/2;c.text(15,y+5,v.label);prev=0;ranges.forEach((n,j)=>{c.rect(x(prev),y-15,x(n)-x(prev),30,(c.p.ranges||[c.p.surface,c.p.grid,c.p.grid])[Math.min(j,2)]);prev=n;});c.rect(x(0),y-6,x(v.value)-x(0),12,c.p.accent,`data-value="${v.value}"`);c.line(x(v.target),y-21,x(v.target),y+21,c.p.ink,'stroke-width="3" data-role="target"');c.text(c.w-75,y+5,v.value+' / '+v.target);});return c.end();}
  function heatmap(s){const c=canvas(s),rs=list(s.rows,'rows'),cs=list(s.columns,'columns'),vals=list(s.values,'values');if(vals.length!==rs.length||vals.some(r=>!Array.isArray(r)||r.length!==cs.length))throw new Error('矩阵尺寸不一致');vals.flat().forEach(v=>num(v,'cell'));const d=domain(vals.flat(),s.domain),cw=(c.w-200)/cs.length,ch=(c.h-95)/rs.length;if(cw<45||ch<32)throw new Error('热力表过密');cs.forEach((v,j)=>c.text(170+(j+.5)*cw,30,v,'middle'));rs.forEach((v,i)=>{c.text(12,55+(i+.5)*ch+5,v);vals[i].forEach((n,j)=>{const ratio=(n-d[0])/(d[1]-d[0]),a=c.p.sequential?1:.12+.78*ratio;let fill=c.p.accent;if(c.p.sequential){const seq=list(c.p.sequential,'palette.sequential'),pos=ratio*(seq.length-1),lo=Math.floor(pos),hi=Math.min(seq.length-1,lo+1),k=pos-lo;fill='rgb('+rgb(seq[lo]).map((v,i)=>Math.round(v*(1-k)+rgb(seq[hi])[i]*k)).join(',')+')';}c.rect(170+j*cw,55+i*ch,cw-3,ch-3,fill,`fill-opacity="${a}" data-value="${n}"`);c.text(170+(j+.5)*cw,55+(i+.5)*ch+5,n,'middle',cellText(fill,a,c.p.ink));});});return c.end();}
  function mekko(s){const c=canvas(s),data=list(s.items,'items');data.forEach(v=>{list(v.segments,'segments').forEach(g=>{num(g.value,'value');if(g.value<0)throw new Error('Mekko不接受负数');});});const totals=data.map(v=>v.segments.reduce((a,g)=>a+g.value,0));if(totals.some(t=>t<=0))throw new Error('类别总量须大于0');const names=[...new Set(data.flatMap(v=>v.segments.map(g=>g.label)))];const total=totals.reduce((a,b)=>a+b,0),pw=c.w-80,ph=c.h-110;let x=40;data.forEach((v,i)=>{const width=pw*totals[i]/total;let y=45;v.segments.forEach((g,j)=>{const hh=ph*g.value/totals[i];c.rect(x,y,width,hh,c.p.series[names.indexOf(g.label)%c.p.series.length],`stroke="white" data-value="${g.value}" data-total="${totals[i]}"`);if(hh>=25&&width>=75)c.text(x+width/2,y+hh/2+5,g.label+' '+g.value,'middle',cellText(c.p.series[names.indexOf(g.label)%c.p.series.length],1,c.p.ink));y+=hh;});c.text(x+width/2,c.h-43,v.label,'middle');c.text(x+width/2,c.h-20,totals[i],'middle',c.p.muted);x+=width;});return c.end();}
  function tree(s){const c=canvas(s);if(!s.root||typeof s.root!=='object')throw new Error('root 必填');const nodes=[],seen=new Set();let leaves=0,maxDepth=0;function visit(n,depth,parent){if(!n||typeof n!=='object'||seen.has(n))throw new Error('树含非法节点或循环');seen.add(n);const v={n,depth,parent};nodes.push(v);maxDepth=Math.max(maxDepth,depth);if(n.children!==undefined&&!Array.isArray(n.children))throw new Error('children 必须为数组');const children=n.children||[];if(children.length){v.children=children.map(ch=>visit(ch,depth+1,v));v.row=v.children.reduce((a,k)=>a+k.row,0)/v.children.length;}else v.row=leaves++;return v;}visit(s.root,0,null);const nw=Math.min(180,(c.w-60)/(maxDepth+1)-35),rh=(c.h-70)/leaves;if(nw<80||rh<42)throw new Error('树过密');const dx=(c.w-60)/(maxDepth+1);nodes.forEach(v=>{v.x=30+v.depth*dx;v.y=35+v.row*rh;});nodes.forEach(v=>{if(v.parent){const a=v.parent,mid=(a.x+nw+v.x)/2;c.out.push(`<path d="M ${a.x+nw} ${a.y+18} H ${mid} V ${v.y+18} H ${v.x}" fill="none" stroke="${esc(c.p.grid)}" stroke-width="2"/>`);}});nodes.forEach(v=>{c.rect(v.x,v.y,nw,36,v.depth===0?c.p.accent:c.p.surface);c.text(v.x+8,v.y+24,v.n.label,'start',v.depth===0?cellText(c.p.accent,1,c.p.ink):c.p.ink);});return c.end();}
  function swimlane(s){const c=canvas(s),lanes=list(s.lanes,'lanes'),stages=list(s.stages,'stages'),items=list(s.items,'items'),cw=(c.w-160)/stages.length,rh=(c.h-70)/lanes.length;if(cw<90||rh<55)throw new Error('泳道过密');const ids=new Map(),occupied=new Set();stages.forEach((v,i)=>c.text(150+(i+.5)*cw,26,v,'middle'));lanes.forEach((v,i)=>{c.text(12,50+(i+.5)*rh,v);c.line(140,40+(i+1)*rh,c.w-10,40+(i+1)*rh);});items.forEach(v=>{if(!Number.isInteger(v.lane)||v.lane<0||v.lane>=lanes.length||!Number.isInteger(v.stage)||v.stage<0||v.stage>=stages.length||!v.id||ids.has(v.id))throw new Error('节点id或行列非法');const cell=v.lane+':'+v.stage;if(occupied.has(cell))throw new Error('同一泳道阶段只能有一个节点；请拆分阶段');occupied.add(cell);ids.set(v.id,{...v,x:150+v.stage*cw+8,y:40+v.lane*rh+(rh-36)/2});});const edges=s.edges||[];if(!Array.isArray(edges))throw new Error('edges 必须是数组');edges.forEach(e=>{const a=ids.get(e.from),b=ids.get(e.to);if(!a||!b)throw new Error('连线引用未知节点');const ax=a.x+cw-26,ay=a.y+18,bx=b.x,by=b.y+18,mid=(ax+bx)/2;c.out.push(`<path d="M ${ax} ${ay} H ${mid} V ${by} H ${bx}" fill="none" stroke="${esc(c.p.muted)}" stroke-width="2"/>`);c.out.push(`<path d="M ${bx-6} ${by-4} L ${bx} ${by} L ${bx-6} ${by+4}" fill="none" stroke="${esc(c.p.muted)}"/>`);});ids.forEach(v=>{c.rect(v.x,v.y,cw-26,36,c.p.selected,`data-id="${esc(v.id)}"`);c.text(v.x+7,v.y+24,v.label);});return c.end();}
  return {waterfall,dumbbell,slope,bullet,heatmap,mekko,tree,swimlane};
});
