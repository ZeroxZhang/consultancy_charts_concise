/* 共用画布/主题契约的静态SVG渲染；分页需显式输出全部页面。 */
const fs=require('node:fs'),path=require('node:path'),runtime=require('../assets/chart-runtime.js'),themes=require('../assets/deck-themes.js');
const pinned=require('../package.json').dependencies.echarts;
function render(payload){
  const echarts=require(process.env.ECHARTS_MODULE||'echarts');
  if(echarts.version!==pinned)throw Error('需要固定ECharts '+pinned+'，当前 '+echarts.version);
  const settings={width:payload.width??960,height:payload.height??500,fontSize:payload.fontSize??14,tokens:themes.get(payload.theme_id).tokens};
  let plan;
  if(payload.recipe)plan=runtime.prepare(payload.recipe,payload.spec||{},settings);
  else if(payload.option&&typeof payload.option==='object'){
    if(!Number.isFinite(settings.width)||!Number.isFinite(settings.height)||settings.width<320||settings.height<200)throw Error('画布至少320×200');
    plan={width:settings.width,height:settings.height,reason:null,pages:[{kind:'chart',option:runtime.options(payload.option,settings.tokens,settings.fontSize)}]};
  }else throw Error('输入需包含recipe+spec或原生option');
  const probe=echarts.init(null,null,{renderer:'svg',ssr:true,width:settings.width,height:settings.height});
  try{probe.setOption(plan.pages[0].option);plan=runtime.check(probe,plan);}finally{probe.dispose();}
  return {...plan,pages:plan.pages.map((page,index)=>{
    const chart=echarts.init(null,null,{renderer:'svg',ssr:true,width:settings.width,height:settings.height});
    try{chart.setOption(page.option);if(runtime.check(chart,plan,index)!==plan)throw Error('配方未完成回退');const svg=chart.renderToSVGString();if(/(?:translate|matrix|[MLCQ])[^<>]*\b(?:NaN|Infinity)\b/.test(svg))throw Error('SVG出现非有限坐标');return {...page,svg};}finally{chart.dispose();}
  })};
}
if(require.main===module){
  try{
    const [input,output,...flags]=process.argv.slice(2);
    if(!input||!output)throw Error('用法: node scripts/render_echarts_svg.cjs input.json output.svg [--paginate]');
    const plan=render(JSON.parse(fs.readFileSync(path.resolve(input),'utf8'))),out=path.resolve(output);
    if(plan.pages.length>1&&!flags.includes('--paginate'))throw Error('需'+plan.pages.length+'页，原因：'+plan.reason+'；使用--paginate生成全部分页');
    const ext=path.extname(out),base=out.slice(0,out.length-ext.length),files=plan.pages.map((_,i)=>plan.pages.length===1?out:base+'-p'+String(i+1).padStart(2,'0')+'.svg');
    for(const file of files)if(fs.existsSync(file))throw Error('输出已存在，请使用新路径：'+file);
    fs.mkdirSync(path.dirname(out),{recursive:true});plan.pages.forEach((page,i)=>fs.writeFileSync(files[i],page.svg));
    console.log(JSON.stringify({pages:files.length,kind:plan.pages.map(p=>p.kind),reason:plan.reason,files}));
  }catch(e){console.error(e.message);process.exitCode=1;}
}
module.exports={render};
