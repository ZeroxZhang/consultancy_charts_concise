/* 自动运行与几何审计；不代替逐页目视验收。需要Node、Playwright和Chrome。 */
const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url'),{execFileSync}=require('node:child_process');
let pw;try{pw=require('playwright')}catch(e){if(!process.env.PLAYWRIGHT_MODULE)throw Error('请安装playwright，或将PLAYWRIGHT_MODULE设为现有模块路径');pw=require(process.env.PLAYWRIGHT_MODULE)}
(async()=>{
 const input=path.resolve(process.argv[2]||''),out=path.resolve(process.argv[3]||'renders');if(!fs.statSync(input).isFile())throw Error('需要HTML文件');fs.mkdirSync(out,{recursive:true});
 const browser=await pw.chromium.launch({channel:process.env.CHROME_CHANNEL||'chrome',headless:true});
 try{
 const p=await browser.newPage({viewport:{width:1400,height:820}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await p.goto(pathToFileURL(input).href,{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);
 const n=await p.locator('.slide').count(),rows=[];if(!n)throw Error('没有幻灯片');
 for(let i=0;i<n;i++){
  await p.keyboard.press('Home');for(let k=0;k<i;k++)await p.keyboard.press('ArrowRight');
  await p.waitForTimeout(100);
  const result=await p.locator('.slide.active').evaluate(s=>{
   const box=s.getBoundingClientRect(),bad=[],tiny=[];
   for(const e of s.querySelectorAll('*')){
    const r=e.getBoundingClientRect(),cs=getComputedStyle(e);if(!r.width||!r.height||cs.visibility==='hidden')continue;
    if(r.left<box.left-1||r.top<box.top-1||r.right>box.right+1||r.bottom>box.bottom+1)bad.push({tag:e.tagName,text:(e.textContent||'').slice(0,80)});
    if(e.children.length===0&&(e.textContent||'').trim()&&parseFloat(cs.fontSize)<12)tiny.push({text:e.textContent.slice(0,40),font:cs.fontSize});
   }
   return {title:s.querySelector('.slide__title')?.textContent||'封面/章节',overflow:bad,tinyText:tiny,charts:[...s.querySelectorAll('.chart')].map(e=>({width:e.clientWidth,height:e.clientHeight,rendered:!!e.querySelector('svg,canvas')})),textLength:s.innerText.length};
  });result.page=i+1;result.screenshot=`p${String(i+1).padStart(2,'0')}.png`;
  await p.locator('.slide.active').screenshot({path:path.join(out,result.screenshot)});rows.push(result);
 }
 await p.keyboard.press('g');await p.screenshot({path:path.join(out,'overview.png'),fullPage:true});await p.keyboard.press('Escape');
 await p.pdf({path:path.join(out,'deck.pdf'),printBackground:true,preferCSSPageSize:true});
 const pdfInfo=execFileSync('pdfinfo',[path.join(out,'deck.pdf')],{encoding:'utf8'});const pdfPages=Number(pdfInfo.match(/Pages:\s+(\d+)/)?.[1]);if(pdfPages!==n)errors.push('PDF页数与deck不符');
 await p.keyboard.press('Home');await p.keyboard.press('f');await p.waitForTimeout(100);const fullscreen=await p.evaluate(()=>!!document.fullscreenElement);if(fullscreen)await p.evaluate(()=>document.exitFullscreen());
 const scales=[];for(const width of [800,2560]){await p.setViewportSize({width,height:900});await p.waitForTimeout(100);scales.push(await p.locator('#stage').evaluate(e=>Number(e.style.getPropertyValue('--scale'))));}
 await p.goto(pathToFileURL(input).href+'#'+Math.min(3,n));await p.waitForTimeout(100);const deepLink=await p.locator('.slide').evaluateAll(es=>es.findIndex(e=>e.classList.contains('active'))+1);if(deepLink!==Math.min(3,n))errors.push('深链错误');
 const offline=await browser.newPage({viewport:{width:1400,height:820}});await offline.route('https://**/*',r=>r.abort());await offline.goto(pathToFileURL(input).href,{waitUntil:'networkidle'});const offlineState=await offline.evaluate(()=>({externalScripts:[...document.scripts].filter(s=>s.src).length,warning:document.body.classList.contains('no-charts'),staticSVG:document.querySelectorAll('.slide svg').length}));
 const report={input,pages:n,pdfPages,navigation:{fullscreen,deepLink,scales},errors,offline:offlineState,rows,visualStatus:'NOT_REVIEWED：必须实际查看每页图片与PDF',geometryStatus:rows.some(r=>r.overflow.length||r.charts.some(c=>!c.rendered))||errors.length?'FAIL':'PASS'};
 fs.writeFileSync(path.join(out,'audit.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({pages:n,geometry:report.geometryStatus,errors,overflow:rows.filter(r=>r.overflow.length).map(r=>({page:r.page,items:r.overflow})),tiny:rows.filter(r=>r.tinyText.length).map(r=>r.page),offline:offlineState}));if(report.geometryStatus==='FAIL')process.exitCode=1;
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
