/* 从实际PDF生成逐页审查图及文字位置；与HTML截屏分开，保留源PDF摘要。 */
const fs = require('node:fs'), path = require('node:path'), {pathToFileURL} = require('node:url');
async function render(pdfFile, out) {
  const canvas = require(process.env.PDF_CANVAS_MODULE || '@napi-rs/canvas');
  Object.assign(globalThis, {DOMMatrix: canvas.DOMMatrix, ImageData: canvas.ImageData, Path2D: canvas.Path2D});
  const pdfjs = await import(pathToFileURL(require.resolve(process.env.PDFJS_MODULE || 'pdfjs-dist/legacy/build/pdf.mjs')).href);
  const doc = await pdfjs.getDocument({data: new Uint8Array(fs.readFileSync(pdfFile)), useSystemFonts: true}).promise;
  fs.mkdirSync(out, {recursive: true});
  const rows = [];
  try {
    for (let n = 1; n <= doc.numPages; n++) {
      const page = await doc.getPage(n), viewport = page.getViewport({scale: 4 / 3});
      const surface = canvas.createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
      await page.render({canvasContext: surface.getContext('2d'), viewport}).promise;
      const file = path.join(out, 'pdf-p' + String(n).padStart(2, '0') + '.png'); fs.writeFileSync(file, surface.toBuffer('image/png'));
      const {items} = await page.getTextContent();
      const words = items.filter(i => i.str).map(i => { const t = pdfjs.Util.transform(viewport.transform, i.transform), h = Math.hypot(t[2], t[3]); return {text: i.str, x: t[4], y: t[5] - h, width: i.width * 4 / 3, height: h}; });
      rows.push({page: n, path: file, words, width: viewport.width, height: viewport.height});
    }
    return rows;
  } finally { await doc.destroy(); }
}
module.exports = {render};
