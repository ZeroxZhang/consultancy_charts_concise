/* 浏览器/Node共用的画布预算、主题解析和完整表格回退。不承担事实核验。 */
(function(root,factory){
  const api=factory(typeof module==='object'&&module.exports?require('./echarts-recipes.js'):root.EChartsRecipes);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.ChartRuntime=api;
})(typeof window!=='undefined'?window:null,function(recipes){
  'use strict';
  const fontFamily="Arial,'PingFang SC','Microsoft YaHei',sans-serif";
  const required=['ink','accent','gray-1','gray-2','gray-3','gray-4','page-bg','on-accent',...Array.from({length:6},(_,i)=>'cat-'+(i+1)),'seq-1','seq-3','seq-5'];
  const fmt=v=>typeof v==='number'?(v!==0&&Math.abs(v)<.0001?String(v):Number(v.toFixed(4)).toLocaleString('zh-CN',{maximumFractionDigits:4})):String(v??'—');
  function widthOf(s,font=14){return [...String(s)].reduce((sum,c)=>sum+(/[\u0020-\u007e]/.test(c)?font*.68:font),0);}
  function wrap(s,width,font){
    const lines=[];
    for(const line of String(s).split('\n')){let current='';for(const c of line){if(current&&widthOf(current+c,font)>width){lines.push(current);current='';}current+=c;}lines.push(current);}
    return lines;
  }
  function rgb(c){if(/^#[\da-f]{6}$/i.test(c))return c.slice(1).match(/../g).map(x=>parseInt(x,16));if(/^#[\da-f]{3}$/i.test(c))return [...c.slice(1)].map(x=>parseInt(x+x,16));if(/^rgba?\(/.test(c))return c.match(/[\d.]+/g).slice(0,3).map(Number);throw Error('颜色需先解析为HEX或RGB: '+c);}
  function luminance(c){const a=rgb(c).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return a[0]*.2126+a[1]*.7152+a[2]*.0722;}
  function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
  function textColor(bg,t){
    const choices=[t.ink,t['on-accent']];const valid=choices.filter(x=>contrast(x,bg)>=4.5);
    if(valid.length)return valid.sort((a,b)=>contrast(b,bg)-contrast(a,bg))[0];
    // 自定义色板的中间亮度可能让主题墨色和白色都不达标；黑白中至少一个可读。
    return contrast('#000000',bg)>contrast('#FFFFFF',bg)?'#000000':'#FFFFFF';
  }
  function interpolate(colors,v){const n=Math.max(0,Math.min(1,v))*(colors.length-1),i=Math.min(colors.length-2,Math.floor(n)),f=n-i,a=rgb(colors[i]),b=rgb(colors[i+1]);return 'rgb('+a.map((x,j)=>Math.round(x+(b[j]-x)*f)).join(',')+')';}
  function resolve(v,t){
    if(typeof v==='string'&&/^@[a-z][a-z0-9-]*$/.test(v)){if(!t[v.slice(1)])throw Error('未知主题token: '+v);return t[v.slice(1)];}
    if(Array.isArray(v))return v.map(x=>resolve(x,t));
    if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,resolve(x,t)]));
    return v;
  }
  function theme(t,font=14){
    required.forEach(k=>{if(!t[k])throw Error('主题缺少 '+k);});
    return {animation:false,color:Array.from({length:6},(_,i)=>t['cat-'+(i+1)]),backgroundColor:t['page-bg'],textStyle:{fontFamily,fontSize:font,color:t.ink},
      categoryAxis:{axisLabel:{fontSize:font,color:t.ink},axisTick:{show:false}},valueAxis:{axisLabel:{fontSize:font,color:t['gray-2']},splitLine:{lineStyle:{color:t['gray-4']}}}};
  }
  function options(raw,t,font=14){
    const base=theme(t,font),opt=resolve(raw,t);
    opt.color=opt.color||base.color;opt.backgroundColor=opt.backgroundColor||base.backgroundColor;opt.textStyle={...base.textStyle,...opt.textStyle};opt.animation=false;opt.tooltip={show:false};
    for(const name of ['xAxis','yAxis'])for(const axis of [].concat(opt[name]||[])){axis.axisLabel={fontSize:font,...axis.axisLabel};axis.nameTextStyle={fontSize:font,...axis.nameTextStyle};}
    for(const s of opt.series||[]){s.label={...s.label,fontSize:Math.max(font,s.label?.fontSize||0)};if(s.endLabel)s.endLabel={...s.endLabel,fontSize:Math.max(font,s.endLabel.fontSize||0)};}
    if(opt.legend)opt.legend.textStyle={fontSize:font,...opt.legend.textStyle};
    return opt;
  }
  function tableFor(name,spec,opt){
    const unit=spec.unit?'（'+spec.unit+'）':'';
    if(name==='rankedBar'){const custom=spec.items.some(d=>d.display!==undefined);return {columns:['对象','原值'+unit,'序位',...(custom?['自定义标注']:[])],rows:opt.yAxis.data.map((label,i)=>[label,fmt(opt.series[0].data[i].value),String(i+1),...(custom?[opt.series[0].data[i].label.formatter]:[])])};}
    if(name==='composition')return {columns:['对象',...spec.items[0].segments.map(s=>s.label+unit),'总量'+unit],rows:spec.items.map(item=>{const total=item.segments.reduce((sum,s)=>sum+s.value,0);return [item.label,...item.segments.map(s=>fmt(s.value)+' / '+fmt(s.value/total*100)+'%'),fmt(total)];})};
    if(name==='groupedBar'||name==='timeSeries')return {columns:['对象 / 期间',...spec.series.map(s=>s.name+unit)],rows:(spec.categories||spec.periods).map((v,i)=>[v,...spec.series.map(s=>fmt(s.values[i]))])};
    if(name==='heatmap')return {columns:['对象',...spec.columns],rows:spec.rows.map((v,i)=>[v,...spec.values[i].map(fmt)])};
    if(name==='histogram')return {columns:['区间','频数'+unit],rows:spec.bins.map(d=>[d.label,fmt(d.value)])};
    if(name==='scatter')return {columns:['对象',(spec.xLabel||'X')+(spec.xUnit?'（'+spec.xUnit+'）':''),(spec.yLabel||'Y')+(spec.yUnit?'（'+spec.yUnit+'）':''),spec.sizeUnit?'规模（'+spec.sizeUnit+'）':'规模'],rows:spec.items.map(d=>[d.label,fmt(d.x),fmt(d.y),fmt(d.size)])};
    if(name==='sankey')return {columns:['起点','终点','流量'+unit],rows:spec.links.map(d=>[d.source,d.target,fmt(d.value)])};
    if(name==='tree'){const rows=[];function visit(n,parent){rows.push([n.label,parent||'根节点',fmt(n.value)]);(n.children||[]).forEach(c=>visit(c,n.label));}visit(spec.root);return {columns:['节点','父节点','数值'+unit],rows};}
    throw Error('未定义回退表: '+name);
  }
  function tablePages(table,ctx,reason){
    const {width,height,fontSize:font,tokens:t}=ctx,pad=12,rowPad=6,lineHeight=font*1.4;
    const weights=table.columns.map((c,i)=>Math.max(80,Math.min(260,Math.max(widthOf(c,font),...table.rows.map(r=>Math.min(230,widthOf(r[i],font))))+pad*2)));
    const total=weights.reduce((a,b)=>a+b,0),widths=weights.map(v=>v/total*(width-16));
    if(widths.some(w=>w<font*3))throw Error('表格列宽不足；按列分面或增加画布，不能缩字');
    const cells=row=>row.map((v,i)=>wrap(v,widths[i]-pad*2,font));
    const header=cells(table.columns),headerHeight=Math.max(...header.map(x=>x.length))*lineHeight+rowPad*2;
    const groups=[];let group=[],used=headerHeight;
    for(const row of table.rows){const lines=cells(row),h=Math.max(...lines.map(x=>x.length))*lineHeight+rowPad*2;if(h+headerHeight>height-40)throw Error('单条记录过长；需拆分该记录或改正文表格');if(used+h>height-40){groups.push(group);group=[];used=headerHeight;}group.push({row,lines,h});used+=h;}
    if(group.length)groups.push(group);
    return groups.map((g,page)=>{
      const graphic=[];let y=8;
      function draw(lines,h,isHeader){let x=8;graphic.push({type:'rect',silent:true,shape:{x,y,width:width-16,height:h},style:{fill:isHeader?t['gray-4']:t['page-bg'],stroke:t['gray-3'],lineWidth:.5}});
        lines.forEach((ls,i)=>{const numeric=!isHeader&&i>0&&ls.every(s=>/^[\d\s.,%+−/()—-]+$/.test(s));graphic.push({type:'text',silent:true,x:numeric?x+widths[i]-pad:x+pad,y:y+rowPad,style:{text:ls.join('\n'),fontSize:font,fontFamily,fontWeight:isHeader?700:400,lineHeight,fill:t.ink,align:numeric?'right':'left',verticalAlign:'top'}});x+=widths[i];});y+=h;
      }
      draw(header,headerHeight,true);g.forEach(r=>draw(r.lines,r.h,false));
      graphic.push({type:'text',silent:true,x:8,y:height-20,style:{text:'完整数据表'+(groups.length>1?' · '+(page+1)+'/'+groups.length:''),fontFamily,fontSize:font,fill:t['gray-2']}});
      return {kind:'table',reason,table:{columns:table.columns,rows:g.map(r=>r.row)},option:options({graphic},t,font)};
    });
  }
  function prepare(name,spec,settings){
    const ctx={width:960,height:500,fontSize:14,...settings};const {width,height,fontSize:font,tokens:t}=ctx;
    if(!Number.isFinite(width)||!Number.isFinite(height)||width<320||height<200)throw Error('画布至少320×200');
    if(!Number.isFinite(font)||font<14)throw Error('配方数据字号至少14px；放不下时回退');
    theme(t,font);
    let raw;
    try{raw=recipes.build(name,spec);}catch(e){
      if(name==='sankey'&&e.message.startsWith('没有正流量')){const reason='无正流量；完整保留零值流量表';return {recipe:name,width,height,fontSize:font,reason,pages:tablePages(tableFor(name,spec,{}),ctx,reason)};}
      throw e;
    }
    const opt=options(raw,t,font),plotH=height-100;let reason='';
    // 值轴名称位于轴端上方：预留名称、nameGap与字体空间，不靠验收失败后每图补坐标。
    if(opt.grid&&opt.yAxis?.name)opt.grid.top=Math.max(opt.grid.top||0,font*2+(opt.yAxis.nameGap??15)+5);
    if(name==='rankedBar'){
      const labels=opt.yAxis.data,maxWidth=Math.max(...labels.map(s=>widthOf(s,font))),valueWidth=Math.max(...opt.series[0].data.map(d=>widthOf(d.label.formatter,font)));
      if(labels.length*font*1.9>plotH||maxWidth+valueWidth>width*.65)reason='类别或长标签超出实际画布预算';
      opt.grid={left:maxWidth+18,right:valueWidth+25,top:36,bottom:42,containLabel:false};
    }else if(name==='composition'){
      const totals=spec.items.map(x=>x.segments.reduce((sum,s)=>sum+s.value,0)),max=Math.max(...totals),barWidth=Math.min(54,(width-100)/spec.items.length*.6);
      spec.items.forEach((item,i)=>item.segments.forEach((seg,j)=>{const v=opt.series[j].data[i],label=opt.series[j].label.formatter({value:v}),denom=spec.mode==='percent'?totals[i]:max;if(seg.value/denom*plotH<font*1.8||widthOf(label,font)>barWidth-6)reason='构成小片或标签空间不足；保留原值、份额与零值';}));
      opt.series.forEach(s=>s.label.color=textColor(s.itemStyle.color,t));
    }else if(name==='groupedBar'){
      const cellWidth=(width-100)/spec.categories.length/spec.series.length;
      if(spec.categories.some(s=>widthOf(s,font)>(width-100)/spec.categories.length-8)||spec.series.some(s=>s.values.some(v=>widthOf(fmt(v),font)+8>cellWidth)))reason='簇状柱标签过密';
    }else if(name==='heatmap'){
      const left=Math.max(...spec.rows.map(s=>widthOf(s,font)))+18,colW=(width-left-84)/spec.columns.length,rowH=plotH/spec.rows.length;
      if(rowH<font*2||spec.columns.some(s=>widthOf(s,font)>colW-8)||spec.values.flat().some(v=>widthOf(fmt(v),font)>colW-8))reason='热力单元格不足以完整显示行列与数值';
      opt.grid={left,right:84,top:48,bottom:32,containLabel:false};
      opt.xAxis.axisLabel.interval=0;opt.yAxis.axisLabel.interval=0;
      const vm=opt.visualMap;opt.series[0].data.forEach(d=>{const bg=interpolate(vm.inRange.color,(d.value[2]-vm.min)/(vm.max-vm.min));d.label={color:textColor(bg,t),formatter:fmt(d.value[2])};});
    }else if(name==='histogram'){
      if(spec.bins.some(d=>widthOf(d.label,font)>(width-100)/spec.bins.length-6))reason='直方区间标签过密';
    }else if(name==='timeSeries'){
      if(spec.series.some(s=>widthOf(s.name,font)>82))reason='折线端点系列名过长；完整表格保留全部系列与缺失值';
    }else if(name==='tree'){
      const rows=tableFor(name,spec,opt).rows;
      opt.series[0].label.formatter=p=>p.name+(p.value===undefined?'':'\n'+fmt(p.value));
      if(rows.length>12||rows.some(r=>widthOf(r[0],font)>width/4))reason='树节点较多或文字过长；以父子关系表保留全部节点';
    }else if(name==='sankey'){
      if(spec.links.some(l=>l.value===0)||spec.nodes.length>12||spec.links.length>15||spec.nodes.some(n=>widthOf(typeof n==='string'?n:n.name,font)>width/4))reason='流量关系超出静态标签预算，或含需显式保留的零流量';
    }else if(name==='scatter'){
      if(spec.items.some(d=>d.size===0))reason='零规模不应获得虚构面积；用表格同时保留坐标与规模';
      if(spec.items.some(d=>d.size!==undefined)){
        const max=Math.max(...spec.items.map(d=>d.size));
        opt.series[0].data.forEach((d,i)=>{const item=spec.items[i];d.label.show=d.label.show||item.size===max;d.label.formatter=item.label+'\n'+fmt(item.size)+(spec.sizeUnit||'');});
        opt.graphic=[{type:'text',x:12,y:height-18,silent:true,style:{text:'气泡面积与规模成正比；最大圆：'+fmt(max)+(spec.sizeUnit||'（规模单位未提供）'),fontSize:font,fontFamily,fill:t['gray-2']}}];
      }
      // 数值轴末端留空白给标签，不改变数据点。
      for(const [axis,key] of [['xAxis','x'],['yAxis','y']]){const vals=spec.items.map(d=>d[key]),lo=Math.min(0,...vals),hi=Math.max(0,...vals),pad=(hi-lo||1)*.12;opt[axis].min=lo-pad;opt[axis].max=hi+pad;}
    }
    const pages=reason?tablePages(tableFor(name,spec,opt),ctx,reason):[{kind:'chart',option:opt}];
    return {recipe:name,width,height,fontSize:font,reason:reason||null,pages,fallback:tableFor(name,spec,opt),context:ctx};
  }
  function audit(chart,minFont=14){
    const boxes=[],problems=[],width=chart.getWidth(),height=chart.getHeight();
    for(const el of chart.getZr().storage.getDisplayList(true)){
      if(el.type!=='tspan'||el.ignore||el.invisible||!String(el.style.text||'').trim())continue;
      const rect=el.getBoundingRect().clone();if(el.transform)rect.applyTransform(el.transform);
      const font=parseFloat(el.style.fontSize||el.style.font||minFont),scale=el.transform?Math.hypot(el.transform[2],el.transform[3]):1;
      const item={text:String(el.style.text),x:rect.x,y:rect.y,w:rect.width,h:rect.height};
      if(rect.x<-.5||rect.y<-.5||rect.x+rect.width>width+.5||rect.y+rect.height>height+.5)problems.push({type:'bounds',text:item.text});
      if(Number.isFinite(font)&&font*scale<minFont-.5)problems.push({type:'font',text:item.text});
      for(const other of boxes){const dx=Math.min(item.x+item.w,other.x+other.w)-Math.max(item.x,other.x),dy=Math.min(item.y+item.h,other.y+other.h)-Math.max(item.y,other.y);if(dx>1&&dy>1)problems.push({type:'overlap',text:item.text,other:other.text});}
      boxes.push(item);
    }
    return {problems,texts:boxes.map(b=>b.text)};
  }
  function check(chart,plan,pageIndex=0){
    const inspection=audit(chart,plan.fontSize||14);
    if(!inspection.problems.length)return plan;
    if(plan.pages[pageIndex].kind!=='chart'||!plan.fallback)throw Error('最终文字验收失败：'+JSON.stringify(inspection.problems.slice(0,3)));
    const reason='最终文字存在越界、重叠或字号不足；改用完整数据表';
    return {...plan,reason,inspection,pages:tablePages(plan.fallback,plan.context,reason)};
  }
  return {version:'1.0.0',prepare,check,audit,options,theme,resolve,contrast,textColor,interpolate,tablePages,widthOf};
});
