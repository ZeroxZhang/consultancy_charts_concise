/* 自动运行与几何审计；不代替逐页目视验收。需要Node、Playwright和Chrome。 */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{pathToFileURL}=require('node:url'),{execFileSync}=require('node:child_process');
const fontAudit=require('./browser_font_audit.cjs');
const bookends=require('./check_bookends.cjs');
let pw;try{pw=require('playwright')}catch(e){if(!process.env.PLAYWRIGHT_MODULE)throw Error('请安装playwright，或将PLAYWRIGHT_MODULE设为现有模块路径');pw=require(process.env.PLAYWRIGHT_MODULE)}
(async()=>{
 const input=path.resolve(process.argv[2]||''),out=path.resolve(process.argv[3]||'renders');if(!fs.statSync(input).isFile())throw Error('需要HTML文件');fs.mkdirSync(out,{recursive:true});
 const browser=await pw.chromium.launch({channel:process.env.CHROME_CHANNEL||'chrome',headless:true});
 try{
 const p=await browser.newPage({viewport:{width:1400,height:820}}),errors=[],warnings=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await fontAudit.attach(p);
 await p.goto(pathToFileURL(input).href,{waitUntil:'networkidle'});await p.evaluate(()=>window.deckReady||document.fonts.ready);
 const n=await p.locator('.slide').count(),rows=[];if(!n)throw Error('没有幻灯片');
 const documentContract=await p.evaluate(()=>({kind:document.documentElement.dataset.deckKind}));
 for(let i=0;i<n;i++){
  await p.keyboard.press('Home');for(let k=0;k<i;k++)await p.keyboard.press('ArrowRight');
  await p.waitForTimeout(100);
  const result=await p.locator('.slide.active').evaluate(s=>{
   const box=s.getBoundingClientRect(),bad=[],tiny=[],smallData=[],unreadable=[],logicalScale=box.width/s.offsetWidth;
   for(const e of s.querySelectorAll('*')){
    const r=e.getBoundingClientRect(),cs=getComputedStyle(e);if(!r.width||!r.height||cs.visibility==='hidden')continue;
    if(r.left<box.left-1||r.top<box.top-1||r.right>box.right+1||r.bottom>box.bottom+1)bad.push({tag:e.tagName,text:(e.textContent||'').slice(0,80)});
    if(e.children.length===0&&(e.textContent||'').trim()&&parseFloat(cs.fontSize)<12)tiny.push({text:e.textContent.slice(0,40),font:cs.fontSize});
    let effective=parseFloat(cs.fontSize);if(e.tagName.toLowerCase()==='text'&&e.getScreenCTM){const m=e.getScreenCTM();effective*=Math.hypot(m.c,m.d)/logicalScale;}
    if(e.children.length===0&&(e.textContent||'').trim()&&effective<10&&!e.closest('[data-decorative="true"]'))unreadable.push({text:e.textContent.slice(0,40),effectiveFont:effective});
    if(e.tagName.toLowerCase()==='text'&&e.getScreenCTM){const m=e.getScreenCTM(),effective=parseFloat(cs.fontSize)*Math.hypot(m.c,m.d)/logicalScale;if(effective<13.5)smallData.push({text:e.textContent.slice(0,40),effectiveFont:effective});}
    if(['TD','TH'].includes(e.tagName)&&(e.scrollHeight>e.clientHeight+1||e.scrollWidth>e.clientWidth+1))bad.push({tag:e.tagName,text:e.textContent.slice(0,80),type:'cell-overflow'});
   }
   const exhibits=[...s.querySelectorAll('svg,canvas,img,table')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&getComputedStyle(e).visibility!=='hidden'&&!e.closest('[data-decorative="true"]');}).map((e,j)=>{const id='p'+([...s.parentElement.querySelectorAll('.slide')].indexOf(s)+1)+'-ex'+j;e.setAttribute('data-deck-exhibit-id',id);return {id,tag:e.tagName,labels:[...e.querySelectorAll('text')].map(t=>t.textContent.trim()).filter(Boolean)};});
   const textEvidence=[],walker=document.createTreeWalker(s,NodeFilter.SHOW_TEXT);let node;
   while(node=walker.nextNode()){
    const text=node.nodeValue.trim(),parent=node.parentElement;if(!text||!parent||parent.closest('script,style,[data-decorative="true"]'))continue;
    const r=parent.getBoundingClientRect(),cs=getComputedStyle(parent);if(r.width&&r.height&&cs.display!=='none'&&cs.visibility!=='hidden'&&Number(cs.opacity)!==0)textEvidence.push(text);
   }
   // 母版与组件合规提示：边界显式声明、双层边界、边条内边距（仅提示，不代替目视）
   const headerEl=s.querySelector('.slide__header'),frame={boundary:s.getAttribute('data-frame-boundary'),ruleVisible:false,doubleBorder:[]};
   if(headerEl){const ac=getComputedStyle(headerEl,'::after').content;if(ac&&ac!=='none'){frame.ruleVisible=true;const body=s.querySelector('.slide__body');if(body){const bodyTop=body.getBoundingClientRect().top;for(const e of body.querySelectorAll('*')){const r=e.getBoundingClientRect();if(r.height<3||Math.abs(r.top-bodyTop)>12)continue;const cs=getComputedStyle(e);if(parseFloat(cs.borderTopWidth)>=1&&cs.borderTopStyle!=='none'&&!/rgba?\([^)]*,\s*0\)|transparent/i.test(cs.borderTopColor)){frame.doubleBorder.push((e.tagName+(e.className&&typeof e.className==='string'?'.'+String(e.className).trim().replace(/\s+/g,'.').slice(0,40):'')).toLowerCase());break;}}}}}
   const notePad=[],noteSeen=new Set();
   for(const e of s.querySelectorAll('*')){
    if(noteSeen.has(e))continue;
    const isNote=e.classList&&e.classList.length>0&&/annotation|decision-strip|evidence-note|callout|takeaway|insight/i.test(String(e.className));
    const leaf=!e.children.length&&(e.textContent||'').trim();
    if(!isNote&&!leaf)continue;if(e.closest('table,svg,[data-decorative="true"]'))continue;
    const cs=getComputedStyle(e);
    if(parseFloat(cs.borderLeftWidth)>=2&&cs.borderLeftStyle!=='none'&&parseFloat(cs.paddingLeft)<6&&e.getBoundingClientRect().height>10){noteSeen.add(e);notePad.push({cls:String(e.className).slice(0,40),pad:cs.paddingLeft,text:(e.textContent||'').trim().slice(0,40)});}
   }
   return {exhibits,textEvidence,unreadableText:unreadable,title:s.querySelector('.slide__title,.cover-title,.divider-name')?.textContent||'',overflow:bad,tinyText:tiny,smallDataText:smallData,charts:[...s.querySelectorAll('.chart')].map(e=>({width:e.clientWidth,height:e.clientHeight,rendered:!!e.querySelector('svg,canvas'),error:e.dataset.chartError||null})),textLength:s.innerText.length,frame,notePad};
  });result.page=i+1;result.screenshot=`p${String(i+1).padStart(2,'0')}.png`;
  result.bookends=await p.locator('.slide.active').evaluate(bookends.inspectPage);
  result.fonts=await fontAudit.inspect(p);result.layoutSignature=await fontAudit.signature(p);
  if(result.fonts.identity==='FAIL')errors.push('第'+(i+1)+'页字体未就绪或出现系统回退');
  const titleFit=await p.locator('.slide.active .slide__title').evaluateAll(es=>es.map(e=>{const cs=getComputedStyle(e);return {text:e.textContent,lines:e.offsetHeight/parseFloat(cs.lineHeight)};}));if(titleFit.some(t=>t.lines>2.1))warnings.push('第'+(i+1)+'页标题超过两行建议，请目视判断');
  if(result.tinyText.length||result.smallDataText.length)warnings.push('第'+(i+1)+'页部分文字低于建议字号，请按实际可读性复核');
  if(result.frame.ruleVisible&&!result.frame.boundary)warnings.push('第'+(i+1)+'页标题线已生效但未显式声明 data-frame-boundary（line/integrated/space），请按正文结构选择边界');
  if(result.frame.ruleVisible&&result.frame.doubleBorder.length)warnings.push('第'+(i+1)+'页标题区隔线与正文首排顶线可能并存（'+result.frame.doubleBorder[0]+'）：首排模块已有顶线时建议 data-frame-boundary="integrated"');
  if(result.notePad.length)warnings.push('第'+(i+1)+'页有文字贴近左侧边条（padding-left<6px）：'+result.notePad.slice(0,4).map(x=>(x.text||x.cls||'?')+'('+x.pad+')').join('；'));
  await p.locator('.slide.active').screenshot({path:path.join(out,result.screenshot)});rows.push(result);
 }
 const bookendsCheck=bookends.checkDocument(rows,documentContract);errors.push(...bookendsCheck.errors);warnings.push(...bookendsCheck.warnings);
 await p.keyboard.press('g');await p.screenshot({path:path.join(out,'overview.png'),fullPage:true});await p.keyboard.press('Escape');
 // 对照屏幕上已存在的展品，检查打印布局中是否仍可见；实际PDF另核关键标签并目视。
 const expected=rows.flatMap(r=>r.exhibits.map(e=>({...e,page:r.page})));
 await p.emulateMedia({media:'print'});await p.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));
 const printMissing=await p.evaluate(expected=>expected.filter(item=>{const e=document.querySelector('[data-deck-exhibit-id="'+item.id+'"]');if(!e)return true;const r=e.getBoundingClientRect();if(!r.width||!r.height)return true;for(let n=e;n&&n.nodeType===1;n=n.parentElement){const s=getComputedStyle(n);if(s.display==='none'||s.visibility==='hidden'||s.visibility==='collapse'||Number(s.opacity)===0)return true;}return false;}),expected);
 printMissing.forEach(e=>errors.push('打印缺少第'+e.page+'页展品 '+e.id));
 let pdfPages=null,pdfFonts=null,pdfArtifact={skipped:true,reason:'QA_SKIP_PDF'};
 if(!process.env.QA_SKIP_PDF){
 const pdfPath=path.join(out,'deck.pdf');await p.pdf({path:pdfPath,printBackground:true,preferCSSPageSize:true});
 const pdfInfo=execFileSync('pdfinfo',[pdfPath],{encoding:'utf8'});pdfPages=Number(pdfInfo.match(/Pages:\s+(\d+)/)?.[1]);if(pdfPages!==n)errors.push('PDF页数与deck不符');
 pdfFonts=execFileSync('pdffonts',[pdfPath],{encoding:'utf8'});const fontRows=pdfFonts.split('\n').slice(2).filter(Boolean);if(!fontRows.length||fontRows.some(row=>row.trim().split(/\s+/).slice(-5,-2).some(v=>v!=='yes')))errors.push('PDF 字体未完整嵌入或缺少字符映射');
 const normalize=s=>s.replace(/\s+/g,'');
 const printedPages=execFileSync('pdftotext',['-layout',pdfPath,'-'],{encoding:'utf8'}).split('\f').map(normalize);
 const rawPages=rows.some(r=>['references','cover','back-cover'].includes(r.bookends.role))?execFileSync('pdftotext',['-raw',pdfPath,'-'],{encoding:'utf8'}).split('\f').map(normalize):[];
 for(const row of rows){
   const pageText=printedPages[row.page-1]||'';
   if(!pageText.includes(normalize(row.title)))errors.push('PDF缺少第'+row.page+'页标题');
   if(['cover','back-cover'].includes(row.bookends.role))for(const [field,value] of Object.entries(row.bookends.meta)){
     if(value&&!pageText.includes(normalize(value))&&!(rawPages[row.page-1]||'').includes(normalize(value)))errors.push('PDF第'+row.page+'页缺少首尾元信息: '+field);
   }
   if(row.bookends.role==='references'){
     const rawText=rawPages[row.page-1]||'';
     const missing=row.bookends.entries.filter(e=>!rawText.includes(normalize(e.text))&&!pageText.includes(normalize(e.text))).map(e=>e.id);
     row.referencesPrint={expected:row.bookends.entries.length,missing};
     if(missing.length)errors.push('PDF第'+row.page+'页缺少完整参考条目: '+missing.join(', '));
   }
   const labels=[...new Set(row.exhibits.flatMap(e=>e.labels).map(normalize))];
   const missing=labels.filter(t=>t.length>1&&!pageText.includes(t));
   if(missing.length)errors.push('PDF第'+row.page+'页缺少展品标签：'+missing.slice(0,8).join(' / '));
   const bodyText=[...new Set(row.textEvidence.map(normalize).filter(t=>t.length>1))];
   const textUnits=[...new Set(bodyText.flatMap(t=>t.length<4?[t]:[...Array(t.length-3)].map((_,i)=>t.slice(i,i+4))))];
   const missingText=textUnits.filter(t=>!pageText.includes(t)),textCoverage=textUnits.length?1-missingText.length/textUnits.length:1;
   row.printText={expectedUnits:textUnits.length,missingUnits:missingText.length,coverage:Number(textCoverage.toFixed(4))};
   if(textUnits.length>=8&&textCoverage<.85)errors.push('PDF第'+row.page+'页正文文字覆盖率不足：'+(textCoverage*100).toFixed(1)+'%；缺少片段 '+missingText.slice(0,8).join(' / '));
 }
 pdfArtifact={path:pdfPath,bytes:fs.statSync(pdfPath).size,sha256:crypto.createHash('sha256').update(fs.readFileSync(pdfPath)).digest('hex'),pages:pdfPages};
 }
 await p.evaluate(()=>window.dispatchEvent(new Event('afterprint')));await p.emulateMedia({media:'screen'});
 const onlineContent=await p.locator('.slide').evaluateAll(es=>es.map(s=>({text:s.textContent.replace(/\s+/g,''),svg:s.querySelectorAll('svg text').length})));
 await p.keyboard.press('Home');await p.keyboard.press('f');await p.waitForTimeout(100);const fullscreen=await p.evaluate(()=>!!document.fullscreenElement);if(fullscreen)await p.evaluate(()=>document.exitFullscreen());
 const scales=[];for(const width of [800,2560]){await p.setViewportSize({width,height:900});await p.waitForTimeout(100);scales.push(await p.locator('#stage').evaluate(e=>Number(e.style.getPropertyValue('--scale'))));}
 await p.goto(pathToFileURL(input).href+'#'+Math.min(3,n));await p.evaluate(()=>window.deckReady||document.fonts.ready);await p.waitForTimeout(100);const deepLink=await p.locator('.slide').evaluateAll(es=>es.findIndex(e=>e.classList.contains('active'))+1);if(deepLink!==Math.min(3,n))errors.push('深链错误');
 const offline=await browser.newPage({viewport:{width:1400,height:820}});await fontAudit.attach(offline);offline.on('pageerror',e=>errors.push('断网: '+e.message));offline.on('console',m=>{if(m.type()==='error')errors.push('断网: '+m.text())});await offline.route('**/*',r=>/^https?:/.test(r.request().url())?r.abort():r.continue());await offline.goto(pathToFileURL(input).href,{waitUntil:'networkidle'});await offline.evaluate(()=>window.deckReady||document.fonts.ready);const offlineState=await offline.evaluate(()=>({externalScripts:[...document.scripts].filter(s=>s.src).length,warning:document.body.classList.contains('no-charts'),staticSVG:document.querySelectorAll('.slide svg').length}));
 if(offlineState.externalScripts===0){offlineState.fonts=[];offlineState.layoutParity=true;for(let i=0;i<n;i++){await offline.keyboard.press('Home');for(let k=0;k<i;k++)await offline.keyboard.press('ArrowRight');const identity=await fontAudit.inspect(offline);offlineState.fonts.push(identity);if(identity.identity==='FAIL')errors.push('断网第'+(i+1)+'页字体失败');if(JSON.stringify(await fontAudit.signature(offline))!==JSON.stringify(rows[i].layoutSignature))offlineState.layoutParity=false;}if(!offlineState.layoutParity)errors.push('断网前后版式不一致');}
 // 离线延迟图表须与在线采用相同的逐页初始化时点，再比较内容。
 if(offlineState.externalScripts===0){const offContent=await offline.locator('.slide').evaluateAll(es=>es.map(s=>({text:s.textContent.replace(/\s+/g,''),svg:s.querySelectorAll('svg text').length})));offlineState.contentParity=JSON.stringify(onlineContent)===JSON.stringify(offContent);if(!offlineState.contentParity)errors.push('断网前后逐页文字或SVG标签不一致');}
 const htmlBuffer=fs.readFileSync(input),htmlArtifact={path:input,bytes:htmlBuffer.length,sha256:crypto.createHash('sha256').update(htmlBuffer).digest('hex')};
 const report={warnings,bookendsCheck,printCheck:{expected:expected.length,missing:printMissing},input,pages:n,pdfPages,htmlArtifact,pdfArtifact,pdfFonts,navigation:{fullscreen,deepLink,scales},errors,offline:offlineState,rows,visualStatus:'NOT_REVIEWED：必须实际查看每页图片与PDF',geometryStatus:rows.some(r=>r.overflow.length||r.unreadableText.length||r.charts.some(c=>!c.rendered||c.error))||errors.length?'FAIL':'PASS'};
 fs.writeFileSync(path.join(out,'audit.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({pages:n,geometry:report.geometryStatus,errors,warnings,overflow:rows.filter(r=>r.overflow.length).map(r=>({page:r.page,items:r.overflow})),tiny:rows.filter(r=>r.tinyText.length).map(r=>r.page),offline:offlineState}));if(report.geometryStatus==='FAIL')process.exitCode=1;
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
