/* 用完整主题覆盖引擎CSS；已生成静态图的deck必须从数据重建，不可用此脚本伪装完整切换。 */
const fs=require('node:fs'),themes=require('../assets/deck-themes.js');
const [input,output,id]=process.argv.slice(2);
if(!input||!output)throw Error('用法: node scripts/apply_theme.cjs assets/deck_engine.html output.html [mckinsey|bcg|accenture]');
fs.writeFileSync(output,themes.apply(fs.readFileSync(input,'utf8'),id));
