/* 实际字形身份 + 语义角色双重检查；CDP在导航前启用，避免file: SVG引用的观察器副作用。 */
const type=require('../assets/deck-typography.js'),sessions=new WeakMap();
async function attach(page){if(!sessions.has(page)){const client=await page.context().newCDPSession(page);await client.send('DOM.enable');await client.send('CSS.enable');sessions.set(page,client);}return sessions.get(page);}
async function inspect(page){
 const state=await page.evaluate(()=>({profile:document.documentElement.dataset.typography||'unrecorded',status:document.documentElement.dataset.fontStatus||'unrecorded',faces:window.__deckFontState?.faces||[],manifest:JSON.parse(document.getElementById('deck-font-manifest')?.textContent||'null')}));
 if(state.profile==='unrecorded'||state.profile==='legacy-system')return {...state,identity:'LEGACY_NOT_LOCKED',unexpected:[]};
 const client=await attach(page),p=type.get(state.profile),chain=s=>s.split(',').map(s=>s.trim().replace(/^['"]|['"]$/g,'')).join(',');
 try{
  const nodes=await page.evaluate(()=>{const nodes=[];for(const el of document.querySelectorAll('.slide.active *')){if(!el.getClientRects().length||getComputedStyle(el).visibility==='hidden'||!Array.from(el.childNodes).some(c=>c.nodeType===3&&c.textContent.trim()))continue;el.setAttribute('data-font-audit',String(nodes.length));const cs=getComputedStyle(el);nodes.push({role:el.closest('.slide__title,.cover-title,.divider-name')?'title':'body',latin:!!el.closest('.type-latin'),family:cs.fontFamily,weight:+cs.fontWeight,style:cs.fontStyle,text:el.textContent.slice(0,80)});}return nodes;});
  const {root}=await client.send('DOM.getDocument'),unexpected=[],families=new Set();
  for(let i=0;i<nodes.length;i++){
   const {nodeId}=await client.send('DOM.querySelector',{nodeId:root.nodeId,selector:'[data-font-audit="'+i+'"]'});
   const {fonts}=await client.send('CSS.getPlatformFontsForNode',{nodeId});fonts.forEach(f=>families.add(f.familyName));
   const node=nodes[i],expected=chain(node.role==='title'?p.title:p.body),aliases=expected.split(',');
   const allowed=(state.manifest?.faces||[]).filter(f=>aliases.includes(f.family)).flatMap(f=>f.platform_families||[]);
   const weightOK=node.role==='title'?node.weight===(node.latin?p.weights.titleLatin:p.weights.title):[400,500,600].includes(node.weight);
   if(chain(node.family)!==expected||!weightOK||node.style!=='normal'||!fonts.length||fonts.some(f=>!f.isCustomFont||(allowed.length&&!allowed.includes(f.familyName))))unexpected.push({index:i,...node,expected,fonts});
  }
  delete state.manifest;
  return {...state,identity:state.status==='ready'&&!unexpected.length?'PASS':'FAIL',families:[...families],unexpected};
 }finally{await page.evaluate(()=>document.querySelectorAll('[data-font-audit]').forEach(e=>e.removeAttribute('data-font-audit')));}
}
async function signature(page){return page.locator('.slide.active').evaluate(s=>{const box=s.getBoundingClientRect(),scale=box.width/s.offsetWidth;return [...s.querySelectorAll('*')].filter(e=>e.children.length===0&&e.textContent.trim()&&e.getClientRects().length).map(e=>{const r=e.getBoundingClientRect(),cs=getComputedStyle(e);return [e.textContent,cs.fontFamily,cs.fontWeight,...[r.x-box.x,r.y-box.y,r.width,r.height].map(v=>Math.round(v/scale*10)/10)];});});}
module.exports={attach,inspect,signature};
