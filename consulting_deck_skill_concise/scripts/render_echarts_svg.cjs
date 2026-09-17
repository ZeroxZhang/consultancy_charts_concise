/* 共用画布/主题契约的静态SVG渲染；输出作者指定的表达，文字验收不通过就直接失败。 */
const fs=require('node:fs'),path=require('node:path'),runtime=require('../assets/chart-runtime.js'),themes=require('../assets/deck-themes.js');
const pinned=require('../package.json').dependencies.echarts;
const type=require('../assets/deck-typography.js'),metrics=require('./font_metrics.cjs');
function render(payload){
  const echarts=require(process.env.ECHARTS_MODULE||'echarts');
  if(echarts.version!==pinned)throw Error('需要固定ECharts '+pinned+'，当前 '+echarts.version);
  const profile=type.get(payload.typography_id),measurement=metrics.install(echarts,profile.id);
  const settings={width:payload.width??960,height:payload.height??500,fontSize:payload.fontSize??14,tokens:themes.get(payload.theme_id).tokens,typography_id:profile.id};
  let plan;
  if(payload.recipe)plan=runtime.prepare(payload.recipe,payload.spec||{},settings);
  else if(payload.option&&typeof payload.option==='object'){
    if(!Number.isFinite(settings.width)||!Number.isFinite(settings.height)||settings.width<320||settings.height<200)throw Error('画布至少320×200');
    plan={recipe:null,width:settings.width,height:settings.height,fontSize:settings.fontSize,risks:[],axes:[],pages:[{kind:'chart',option:runtime.options(payload.option,settings.tokens,settings.fontSize,profile.id)}]};
  }else throw Error('输入需包含recipe+spec或原生option');
  const chart=echarts.init(null,null,{renderer:'svg',ssr:true,width:settings.width,height:settings.height});
  try{
    chart.setOption(plan.pages[0].option);
    const report=runtime.check(chart,plan);
    // 实测越界、遮挡、字号不足会阻止输出；配方层不会改写成别的表达来绕过。
    if(report.status!=='ok')throw Error('文字验收未通过：'+report.problems.slice(0,6).map(p=>p.type+'「'+p.text+'」'+(p.other?'↔「'+p.other+'」':'')+' → '+p.fix).join('；'));
    const svg=chart.renderToSVGString().replace('<svg ',`<svg data-typography="${profile.id}" style="font-synthesis:none;text-rendering:geometricPrecision;font-variant-numeric:lining-nums tabular-nums" `);
    if(/(?:translate|matrix|[MLCQ])[^<>]*\b(?:NaN|Infinity)\b/.test(svg))throw Error('SVG出现非有限坐标');
    return {...plan,typography_id:profile.id,typography_version:profile.version,measurement,font_delivery:'requires-embedding-in-host',report,pages:plan.pages.map(page=>({...page,svg}))};
  }finally{chart.dispose();}
}
if(require.main===module){
  try{
    const [input,output]=process.argv.slice(2);
    if(!input||!output)throw Error('用法: node scripts/render_echarts_svg.cjs input.json output.svg');
    const plan=render(JSON.parse(fs.readFileSync(path.resolve(input),'utf8'))),out=path.resolve(output);
    if(fs.existsSync(out))throw Error('输出已存在，请使用新路径：'+out);
    fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,plan.pages[0].svg);
    console.log(JSON.stringify({files:[out],recipe:plan.recipe,risks:plan.risks}));
  }catch(e){console.error(e.message);process.exitCode=1;}
}
module.exports={render};
