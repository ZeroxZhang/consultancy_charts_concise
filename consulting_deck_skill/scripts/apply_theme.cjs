/* 用完整主题覆盖引擎CSS并内联配方；静态图换主题仍须从数据重建。 */
const fs=require('node:fs'),path=require('node:path'),themes=require('../assets/deck-themes.js');
const [input,output,id,profile]=process.argv.slice(2);
if(!input||!output)throw Error('用法: node scripts/apply_theme.cjs assets/deck_engine.html output.html [mckinsey|bcg|accenture] [serif-report-bold|serif-report|serif-playfair|sans-presentation|legacy-system]');
let html=themes.apply(fs.readFileSync(input,'utf8'),id);
// 初始化一次装好正文必需资源；重复应用主题不会留下旧副本。
for(const [tag,name] of [['deck-layouts','consulting-layouts.css'],['deck-geometry','deck-geometry.css']]){
  html=html.replace(new RegExp('<style\\b[^>]*id="'+tag+'"[^>]*>[\\s\\S]*?<\\/style>','g'),'');
  html=html.replace('</head>',`<style id="${tag}">${fs.readFileSync(path.resolve(__dirname,'../assets',name),'utf8')}</style>\n</head>`);
}
html=html.replace(/<html\b[^>]*>/,m=>m.replace(/ data-reliability-version="[^"]*"/g,'').replace('>',' data-reliability-version="1">'));
for(const name of ['echarts-recipes.js','chart-runtime.js']){
  const source=fs.readFileSync(path.resolve(__dirname,'../assets',name),'utf8');
  html=html.replace('<script src="./'+name+'"></script>',()=>`<script>\n${source}\n</script>`);
}
html=require('./pack_fonts.cjs').pack(require('./bookends.cjs').applyStyles(require('./apply_frame.cjs').apply(html)),{profile});
fs.writeFileSync(output,html);
