/* 自动运行与几何审计；不代替逐页目视验收。需要Node、Playwright和Chrome。 */
const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url'),{execFileSync}=require('node:child_process');
const fontAudit=require('./browser_font_audit.cjs');
let pw;try{pw=require('playwright')}catch(e){if(!process.env.PLAYWRIGHT_MODULE)throw Error('请安装playwright，或将PLAYWRIGHT_MODULE设为现有模块路径');pw=require(process.env.PLAYWRIGHT_MODULE)}
(async()=>{
 const input=path.resolve(process.argv[2]||''),out=path.resolve(process.argv[3]||'renders');if(!fs.statSync(input).isFile())throw Error('需要HTML文件');fs.mkdirSync(out,{recursive:true});
 const browser=await pw.chromium.launch({channel:process.env.CHROME_CHANNEL||'chrome',headless:true});
 try{
 const p=await browser.newPage({viewport:{width:1400,height:820}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await fontAudit.attach(p);
 await p.goto(pathToFileURL(input).href,{waitUntil:'networkidle'});await p.evaluate(()=>window.deckReady||document.fonts.ready);
 const n=await p.locator('.slide').count(),rows=[];if(!n)throw Error('没有幻灯片');
 for(let i=0;i<n;i++){
  await p.keyboard.press('Home');for(let k=0;k<i;k++)await p.keyboard.press('ArrowRight');
  await p.waitForTimeout(100);
  const result=await p.locator('.slide.active').evaluate(s=>{
   const box=s.getBoundingClientRect(),bad=[],tiny=[],smallData=[],logicalScale=box.width/s.offsetWidth;
   for(const e of s.querySelectorAll('*')){
    const r=e.getBoundingClientRect(),cs=getComputedStyle(e);if(!r.width||!r.height||cs.visibility==='hidden')continue;
    if(r.left<box.left-1||r.top<box.top-1||r.right>box.right+1||r.bottom>box.bottom+1)bad.push({tag:e.tagName,text:(e.textContent||'').slice(0,80)});
    if(e.children.length===0&&(e.textContent||'').trim()&&parseFloat(cs.fontSize)<12)tiny.push({text:e.textContent.slice(0,40),font:cs.fontSize});
    if(e.tagName.toLowerCase()==='text'&&e.getScreenCTM){const m=e.getScreenCTM(),effective=parseFloat(cs.fontSize)*Math.hypot(m.c,m.d)/logicalScale;if(effective<13.5)smallData.push({text:e.textContent.slice(0,40),effectiveFont:effective});}
    if(['TD','TH'].includes(e.tagName)&&(e.scrollHeight>e.clientHeight+1||e.scrollWidth>e.clientWidth+1))bad.push({tag:e.tagName,text:e.textContent.slice(0,80),type:'cell-overflow'});
   }
   return {title:s.querySelector('.slide__title')?.textContent||'封面/章节',overflow:bad,tinyText:tiny,smallDataText:smallData,charts:[...s.querySelectorAll('.chart')].map(e=>({width:e.clientWidth,height:e.clientHeight,rendered:!!e.querySelector('svg,canvas'),error:e.dataset.chartError||null})),textLength:s.innerText.length};
  });result.page=i+1;result.screenshot=`p${String(i+1).padStart(2,'0')}.png`;
  result.fonts=await fontAudit.inspect(p);result.layoutSignature=await fontAudit.signature(p);
  if(result.fonts.identity==='FAIL')errors.push('第'+(i+1)+'页字体未就绪或出现系统回退');
  const titleFit=await p.locator('.slide.active .slide__title').evaluateAll(es=>es.map(e=>{const cs=getComputedStyle(e);return {text:e.textContent,lines:e.offsetHeight/parseFloat(cs.lineHeight)};}));if(titleFit.some(t=>t.lines>2.1))errors.push('第'+(i+1)+'页标题超过两行');
  await p.locator('.slide.active').screenshot({path:path.join(out,result.screenshot)});rows.push(result);
 }
 await p.keyboard.press('g');await p.screenshot({path:path.join(out,'overview.png'),fullPage:true});await p.keyboard.press('Escape');
 await p.pdf({path:path.join(out,'deck.pdf'),printBackground:true,preferCSSPageSize:true});
 const pdfInfo=execFileSync('pdfinfo',[path.join(out,'deck.pdf')],{encoding:'utf8'});const pdfPages=Number(pdfInfo.match(/Pages:\s+(\d+)/)?.[1]);if(pdfPages!==n)errors.push('PDF页数与deck不符');
 const pdfFonts=execFileSync('pdffonts',[path.join(out,'deck.pdf')],{encoding:'utf8'});const fontRows=pdfFonts.split('\n').slice(2).filter(Boolean);if(!fontRows.length||fontRows.some(row=>row.trim().split(/\s+/).slice(-5,-2).some(v=>v!=='yes')))errors.push('PDF 字体未完整嵌入或缺少字符映射');
 const normalize=s=>s.replace(/\s+/g,'');const printed=normalize(execFileSync('pdftotext',['-layout',path.join(out,'deck.pdf'),'-'],{encoding:'utf8'}));
 for(const row of rows)if(!printed.includes(normalize(row.title)))errors.push('PDF缺少第'+row.page+'页标题');
 const onlineContent=await p.locator('.slide').evaluateAll(es=>es.map(s=>({text:s.textContent.replace(/\s+/g,''),svg:s.querySelectorAll('svg text').length})));
 await p.keyboard.press('Home');await p.keyboard.press('f');await p.waitForTimeout(100);const fullscreen=await p.evaluate(()=>!!document.fullscreenElement);if(fullscreen)await p.evaluate(()=>document.exitFullscreen());
 const scales=[];for(const width of [800,2560]){await p.setViewportSize({width,height:900});await p.waitForTimeout(100);scales.push(await p.locator('#stage').evaluate(e=>Number(e.style.getPropertyValue('--scale'))));}
 await p.goto(pathToFileURL(input).href+'#'+Math.min(3,n));await p.evaluate(()=>window.deckReady||document.fonts.ready);await p.waitForTimeout(100);const deepLink=await p.locator('.slide').evaluateAll(es=>es.findIndex(e=>e.classList.contains('active'))+1);if(deepLink!==Math.min(3,n))errors.push('深链错误');
 const offline=await browser.newPage({viewport:{width:1400,height:820}});await fontAudit.attach(offline);offline.on('pageerror',e=>errors.push('断网: '+e.message));offline.on('console',m=>{if(m.type()==='error')errors.push('断网: '+m.text())});await offline.route('**/*',r=>/^https?:/.test(r.request().url())?r.abort():r.continue());await offline.goto(pathToFileURL(input).href,{waitUntil:'networkidle'});await offline.evaluate(()=>window.deckReady||document.fonts.ready);const offlineState=await offline.evaluate(()=>({externalScripts:[...document.scripts].filter(s=>s.src).length,warning:document.body.classList.contains('no-charts'),staticSVG:document.querySelectorAll('.slide svg').length}));
 if(offlineState.externalScripts===0){const offContent=await offline.locator('.slide').evaluateAll(es=>es.map(s=>({text:s.textContent.replace(/\s+/g,''),svg:s.querySelectorAll('svg text').length})));offlineState.contentParity=JSON.stringify(onlineContent)===JSON.stringify(offContent);if(!offlineState.contentParity)errors.push('断网前后逐页文字或SVG标签不一致');}
 if(offlineState.externalScripts===0){offlineState.fonts=[];offlineState.layoutParity=true;for(let i=0;i<n;i++){await offline.keyboard.press('Home');for(let k=0;k<i;k++)await offline.keyboard.press('ArrowRight');const identity=await fontAudit.inspect(offline);offlineState.fonts.push(identity);if(identity.identity==='FAIL')errors.push('断网第'+(i+1)+'页字体失败');if(JSON.stringify(await fontAudit.signature(offline))!==JSON.stringify(rows[i].layoutSignature))offlineState.layoutParity=false;}if(!offlineState.layoutParity)errors.push('断网前后版式不一致');}
 const report={input,pages:n,pdfPages,pdfFonts,navigation:{fullscreen,deepLink,scales},errors,offline:offlineState,rows,visualStatus:'NOT_REVIEWED：必须实际查看每页图片与PDF',geometryStatus:rows.some(r=>r.overflow.length||r.smallDataText.length||r.charts.some(c=>!c.rendered||c.error))||errors.length?'FAIL':'PASS'};
 fs.writeFileSync(path.join(out,'audit.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({pages:n,geometry:report.geometryStatus,errors,overflow:rows.filter(r=>r.overflow.length).map(r=>({page:r.page,items:r.overflow})),tiny:rows.filter(r=>r.tinyText.length).map(r=>r.page),offline:offlineState}));if(report.geometryStatus==='FAIL')process.exitCode=1;
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
