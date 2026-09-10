/* 将真实渲染产物绑定到媒介、页身份、内容和公共依赖；不证明审查者已经看过。 */
const path = require('node:path');
const {hash, fileHash, stable} = require('./report_contract.cjs');
function captureDocument() {
  const pages = [...document.querySelectorAll('.slide')].map((s, i) => {
    const copy = s.cloneNode(true); copy.classList.remove('active');
    for (const e of copy.querySelectorAll('[data-deck-exhibit-id]')) e.removeAttribute('data-deck-exhibit-id');
    return {page: i + 1, pageId: s.dataset.pageId || 'page-' + (i + 1), content: copy.outerHTML};
  });
  const styles = [...document.querySelectorAll('style,link[rel="stylesheet"]')].map(e => e.outerHTML
    .replace(/data:font\/[^;]+;base64,[A-Za-z0-9+/=]+/g, 'FONT-SUBSET')
    .replace(/unicode-range\s*:[^;}]+;?/gi, ''));
  const scripts = [...document.scripts].filter(e => !['deck-task-contract', 'deck-font-manifest', 'deck-pdf-payload'].includes(e.id)).map(e => e.outerHTML);
  const manifest = JSON.parse(document.getElementById('deck-font-manifest')?.textContent || '{}');
  const fonts = {...manifest, faces: (manifest.faces || []).map(({subset_sha256, subset_bytes, sample, ...face}) => face)};
  return {pages, dependencies: {styles, scripts, fonts, ratio: document.body.dataset.ratio}};
}
function manifest(snapshot, rows, pdfRows, artifacts, task, directory, environment) {
  const dependenciesSha256 = hash(stable({dependencies: snapshot.dependencies, task, environment}));
  if (new Set(snapshot.pages.map(p => p.pageId)).size !== snapshot.pages.length) throw Error('data-page-id重复，无法绑定页身份');
  const entries = [];
  for (const source of snapshot.pages) {
    if (!/^[\w-]+$/.test(source.pageId)) throw Error('data-page-id须为字母数字下划线或连字符');
    const common = {page: source.page, pageId: source.pageId, pageSha256: hash(source.content), dependenciesSha256};
    for (const medium of ['html', 'pdf']) {
      const file = medium === 'html' ? path.resolve(directory, rows[source.page - 1].screenshot) : pdfRows.find(p => p.page === source.page)?.path;
      if (!file) continue;
      entries.push({...common, id: medium + ':' + source.pageId, medium, path: path.relative(directory, file), sha256: fileHash(file), sourceSha256: artifacts[medium].sha256});
    }
  }
  return {version: 1, entries, dependenciesSha256, scope: '真实HTML截图和实际PDF栅格图；归属与字节可核对，目视审查另记'};
}
module.exports = {captureDocument, manifest};
