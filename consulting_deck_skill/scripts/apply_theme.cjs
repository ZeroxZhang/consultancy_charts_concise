/* 用完整主题覆盖引擎CSS并内联配方；静态图换主题仍须从数据重建。 */
const fs=require('node:fs'),path=require('node:path'),themes=require('../assets/deck-themes.js');
const [input,output,id]=process.argv.slice(2);
if(!input||!output)throw Error('用法: node scripts/apply_theme.cjs assets/deck_engine.html output.html [mckinsey|bcg|accenture]');
let html=themes.apply(fs.readFileSync(input,'utf8'),id);
for(const name of ['echarts-recipes.js','chart-runtime.js']){
  const source=fs.readFileSync(path.resolve(__dirname,'../assets',name),'utf8');
  html=html.replace('<script src="./'+name+'"></script>',()=>`<script>\n${source}\n</script>`);
}
fs.writeFileSync(output,html);
