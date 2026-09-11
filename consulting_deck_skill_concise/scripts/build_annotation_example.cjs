#!/usr/bin/env node
/* 跨图型旁解读示例：确认非柱状图也能做引线、差额与份额标注。仅使用合成数据。 */
const fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '..');
const kit = require('../assets/exhibit-kit.js');
const themes = require('../assets/deck-themes.js');
const typography = require('../assets/deck-typography.js');

const args = process.argv.slice(2);
const outDir = path.resolve(args.find(v => !v.startsWith('--')) || path.join(root, '..', 'demo', 'annotation'));
const themeId = (args.find(v => v.startsWith('--theme=')) || '--theme=mckinsey').slice(8);
const profile = (args.find(v => v.startsWith('--typography=')) || '--typography=serif-report-bold').slice(13);
const palette = themes.palette(themeId);
const build = (type, spec) => kit[type](Object.assign({ palette, typography_id: profile }, spec));
const audits = [];

function note(name, svg) {
  const leaders = (svg.match(/data-role="leader"/g) || []).length;
  const annotations = [...svg.matchAll(/data-role="annotation"[^>]*data-annotation-id="([^"]+)"[^>]*>([^<]*)</g)];
  const anchors = (svg.match(/data-anchor-id=/g) || []).length;
  audits.push({ exhibit: name, anchors, annotations: annotations.length, leaders, texts: annotations.map(m => m[1] + ' = ' + m[2]) });
  return svg;
}
/* 容量不足时如实报告，不静默丢标注。 */
function attempt(name, fn) {
  try { return note(name, fn()); }
  catch (error) { audits.push({ exhibit: name, error: error.message }); return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 200"><rect width="620" height="200" fill="#F2F5F7"/><text x="20" y="100" font-size="15" fill="#9C5C14">' + name + ' 未通过：' + error.message.replace(/[<&>]/g, '') + '</text></svg>'; }
}

const dumbbell = attempt('dumbbell', () => build('dumbbell', {
  width: 620, height: 330, title: '渠道规模变化', startLabel: '2024年', endLabel: '2025年', unit: '亿元',
  format: { decimals: 1 },
  items: [
    { label: '商超', start: 6.4, end: 5.3 },
    { label: '电商', start: 1.6, end: 2.0 },
    { label: '经销', start: 3.2, end: 3.1 },
    { label: '直营', start: 0.8, end: 0.9 }
  ],
  annotations: [
    { id: 'd-商超', on: 'end:商超', kind: 'delta', from: 'start:商超', text: '{label} {delta}（{rate}）', weight: 600 },
    { id: 'd-电商', on: 'end:电商', kind: 'delta', from: 'start:电商', text: '{label} {delta}（{rate}）', weight: 600 },
    { id: 'd-直营', on: 'end:直营', kind: 'delta', from: 'start:直营', text: '基数最小，{delta}' }
  ]
}));

const mekko = attempt('mekko', () => build('mekko', {
  width: 620, height: 400, title: '地区规模 × 产品构成', format: { decimals: 0 }, shareDecimals: 0,
  items: [
    { label: '东区', segments: [{ label: '核心', value: 60 }, { label: '新业务', value: 40 }] },
    { label: '西区', segments: [{ label: '核心', value: 30 }, { label: '新业务', value: 20 }] },
    { label: '南区', segments: [{ label: '核心', value: 30 }, { label: '新业务', value: 70 }] }
  ],
  annotations: [
    { id: 'm-南区', on: 'seg:南区|新业务', kind: 'share', text: '{label} 占该区 {value}', weight: 600 }
  ]
}));

const bullet = attempt('bullet', () => build('bullet', {
  width: 620, height: 260, title: '目标差距', format: { decimals: 0 },
  items: [
    { label: '交付达成率%', value: 76, target: 90, max: 100, ranges: [70, 90, 100] },
    { label: '留存率%', value: 68, target: 80, max: 100, ranges: [70, 90, 100] },
    { label: '计划覆盖率%', value: 85, target: 95, max: 100, ranges: [70, 90, 100] }
  ],
  annotations: [
    { id: 'b-交付', on: 'value:交付达成率%', kind: 'delta', from: 'target:交付达成率%', text: '缺口 {delta}', weight: 600 },
    { id: 'b-留存', on: 'value:留存率%', kind: 'delta', from: 'target:留存率%', text: '缺口 {delta}' }
  ]
}));

const waterfall = attempt('waterfall', () => build('waterfall', {
  width: 620, height: 330, title: '收入变动的贡献分解', format: { decimals: 1 }, unit: '亿元',
  items: [
    { label: '期初', type: 'total', value: 11.2 },
    { label: '电商', type: 'delta', value: 0.4 },
    { label: '商超', type: 'delta', value: -1.1 },
    { label: '经销', type: 'delta', value: -0.1 },
    { label: '期末', type: 'subtotal' }
  ],
  annotations: [
    { id: 'w-商超', on: 'bar:商超', kind: 'delta', text: '主要拖累 {value}', weight: 600 },
    { id: 'w-电商', on: 'bar:电商', kind: 'delta', text: '仅抵消拖累的 36%' }
  ]
}));

const heatmap = attempt('heatmap', () => build('heatmap', {
  width: 620, height: 300, title: '分店 × 时段达成率', rows: ['北区', '东区', '南区'], columns: ['Q1', 'Q2', 'Q3', 'Q4'], domain: [60, 100],
  values: [[88, 91, 76, 95], [72, 80, 84, 90], [64, 70, 78, 83]],
  annotations: [
    { id: 'h-max', on: 'cell:北区|Q4', kind: 'value', text: '最高 {value}', weight: 600 },
    { id: 'h-min', on: 'cell:南区|Q1', kind: 'value', text: '最低 {value}' }
  ]
}));

const panels = [
  ['非柱状图上的 think-cell 式旁解读', '哑铃差额、Mekko 份额、子弹缺口、瀑布贡献、热力极值——同一套标注引擎，引线从真实图元边界出发。'],
  [dumbbell, mekko], [bullet, waterfall], [heatmap]
];

const fontsCss = fs.readFileSync(path.join(root, 'assets/fonts/deck-fonts.css'), 'utf8');
const html = '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><title>标注引擎示例</title><style>'
  + fontsCss.replace(/url\('([^']+)'\)/g, (m, f) => "url('" + path.join(root, 'assets/fonts', f) + "')")
  + '*{box-sizing:border-box}body{margin:0;background:#E9EDF0;font-family:' + typography.get(profile).body + ';color:#172C3B}'
  + '.wrap{width:1320px;margin:0 auto;padding:36px 40px 56px}h1{font-family:' + typography.get(profile).title + ';font-size:30px;margin:0 0 10px}'
  + '.lead{color:#50606E;font-size:15px;margin:0 0 28px;max-width:1000px;line-height:1.6}'
  + '.grid{display:grid;grid-template-columns:1fr 1fr;gap:22px}.card{background:#fff;padding:16px 18px 10px;border-radius:2px}'
  + '.card h2{font-size:14px;font-weight:600;margin:0 0 10px;color:#50606E;letter-spacing:.04em}'
  + '.card svg{width:100%;height:auto;display:block}.wide{grid-column:1 / -1}'
  + '</style></head><body><div class="wrap"><h1>' + panels[0][0] + '</h1><p class="lead">' + panels[0][1] + '</p><div class="grid">'
  + [['哑铃图 · 差额与增长率', dumbbell], ['Mekko · 份额与结构', mekko], ['子弹图 · 目标缺口', bullet], ['瀑布图 · 贡献归因', waterfall]]
    .map(([t, svg]) => '<div class="card"><h2>' + t + '</h2>' + svg + '</div>').join('')
  + '<div class="card wide"><h2>热力图 · 极值与异常</h2>' + heatmap + '</div>'
  + '</div></div></body></html>';

async function rasterize(target, outDir) {
  const pw = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
  const browser = await pw.chromium.launch({ channel: process.env.CHROME_CHANNEL || 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1360, height: 1200 }, deviceScaleFactor: 2 });
    await page.goto(require('node:url').pathToFileURL(target).href, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(outDir, 'annotation-gallery.png'), fullPage: true });
    await page.pdf({ path: path.join(outDir, 'annotation-gallery.pdf'), printBackground: true, preferCSSPageSize: true, width: '1360px', height: '1240px' });
    return { png: path.join(outDir, 'annotation-gallery.png'), pdf: path.join(outDir, 'annotation-gallery.pdf') };
  } finally { await browser.close(); }
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const target = path.join(outDir, 'annotation-gallery.html');
  fs.writeFileSync(target, html);
  const raster = args.includes('--no-raster') ? null : await rasterize(target, outDir);
  console.log(JSON.stringify({ file: target, bytes: html.length, theme: themeId, typography: profile, raster, audits }, null, 2));
})().catch(error => { console.error(error.message); process.exitCode = 1; });
