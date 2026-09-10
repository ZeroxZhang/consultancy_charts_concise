/* schema3证据归属与有限继承。校验文件关联，不宣称能机器证明人的判断。 */
const fs = require('node:fs'), path = require('node:path');
const {hash, fileHash, stable, requiresIndependent} = require('./report_contract.cjs');
const layers = ['page', 'exhibit', 'annotation', 'typography'];
function validate(review, audit, {baseDir = process.cwd(), auditDir = baseDir, partial = false, trail = []} = {}) {
  const errors = [], fail = msg => errors.push(msg);
  if (!review || review.schemaVersion !== 3) return ['新版交付必须使用review schemaVersion:3'];
  if (review.status !== 'complete') fail('审查未完成');
  if (review.htmlSha256 !== audit.htmlArtifact?.sha256 || review.pdfSha256 !== audit.pdfArtifact?.sha256 || review.auditSha256 !== hash(stable(audit))) fail('审查未绑定当前HTML/PDF/audit');
  if (typeof review.reviewer !== 'string' || !review.reviewer.trim() || !['author', 'independent'].includes(review.independence)) fail('审查身份缺失');
  for (const k of ['analysis', 'evidence', 'visual']) {
    const c = review.checks?.[k];
    if (!c || !(k === 'visual' ? ['pass'] : ['pass', 'not_applicable']).includes(c.status) || typeof c.basis !== 'string' || !c.basis.trim()) fail(k + '未完成或依据缺失');
  }
  if (!Array.isArray(review.issues)) fail('缺少issues');
  for (const i of review.issues || []) if (!i || !['minor', 'major', 'blocking'].includes(i.severity) || !['open', 'resolved'].includes(i.status) || !i.description?.trim() || i.severity !== 'minor' && i.status !== 'resolved') fail('问题未解决或格式无效');
  if (review.aggregationErrors?.length) fail('聚合仍有错误');
  const manifest = audit.evidenceManifest?.entries;
  if (!Array.isArray(manifest) || !manifest.length) return [...errors, 'audit缺少真实渲染证据清单'];
  const ids = new Set(), slots = new Set(), pageIds = new Map(), verified = new Map();
  for (const e of manifest) {
    if (!e || ids.has(e.id) || !/^[\w-]+$/.test(e.pageId || '') || !['html', 'pdf'].includes(e.medium) || e.id !== e.medium + ':' + e.pageId || !Number.isInteger(e.page) || e.page < 1 || e.page > audit.pages) {fail('audit证据身份无效'); continue;}
    ids.add(e.id);
    const slot=e.medium+':'+e.page;
    if(slots.has(slot))fail('audit同一媒介/页号重复：'+slot);
    slots.add(slot);
    if(pageIds.has(e.page)&&pageIds.get(e.page)!==e.pageId)fail('audit同页身份不一致：'+e.page);
    pageIds.set(e.page,e.pageId);
    if (e.sourceSha256 !== audit[e.medium + 'Artifact']?.sha256 || !/^[a-f0-9]{64}$/.test(e.pageSha256 || '') || e.dependenciesSha256 !== audit.evidenceManifest.dependenciesSha256) fail('audit证据来源/依赖错配：' + e.id);
    try { if (!fs.statSync(path.resolve(auditDir, e.path)).isFile() || fileHash(path.resolve(auditDir, e.path)) !== e.sha256) throw Error(); verified.set(e.id, e); }
    catch { fail('当前渲染图缺失/已改变：' + e.id); }
  }
  for(const medium of ['html','pdf'])for(let page=1;page<=audit.pages;page++)if(!slots.has(medium+':'+page))fail('audit渲染证据缺页：'+medium+':'+page);
  if (!Array.isArray(review.coverage) || !review.coverage.length) return [...errors, '审查coverage缺失'];
  const sets = {author: {html: new Set(), pdf: new Set()}, independent: {html: new Set(), pdf: new Set()}};
  const reviewers={author:new Set(),independent:new Set()};
  for (const c of review.coverage) {
    if (!c || !sets[c.independence] || typeof c.reviewer !== 'string' || !c.reviewer.trim() || !Array.isArray(c.layers) || layers.some(l => !c.layers.includes(l))) {fail('coverage身份/四层范围无效'); continue;}
    reviewers[c.independence].add(c.reviewer.trim());
    if(partial&&(c.reviewer!==review.reviewer||c.independence!==review.independence))fail('原始审查coverage与顶层身份不一致');
    const refs = Array.isArray(c.evidence) ? c.evidence.map(e => e?.id) : [];
    if (!refs.length || new Set(refs).size !== refs.length || refs.some(id => !verified.has(id))) fail('coverage证据不属于当前audit');
    for (const medium of ['html', 'pdf']) {
      const pages = c[medium + 'Pages'];
      if (!Array.isArray(pages) || new Set(pages).size !== pages.length || pages.some(n => !Number.isInteger(n) || n < 1 || n > audit.pages)) {fail('coverage页集合无效'); continue;}
      const covered = refs.map(id => verified.get(id)).filter(e => e?.medium === medium).map(e => e.page);
      if (covered.length !== pages.length || pages.some(n => !covered.includes(n))) fail('coverage页号/媒介与证据不匹配');
      pages.forEach(n => sets[c.independence][medium].add(n));
    }
    if (c.inheritedFrom) {
      try {
        const old = c.inheritedFrom;
        if (!old.basis?.trim() || trail.length >= 12) throw Error('继承缺少变更依据或链过深');
        const auditFile = path.resolve(baseDir, old.audit.path), reviewFile = path.resolve(baseDir, old.review.path);
        if (trail.includes(reviewFile)) throw Error('审查继承循环');
        if (fileHash(auditFile) !== old.audit.sha256 || fileHash(reviewFile) !== old.review.sha256) throw Error('旧审查/audit摘要不符');
        const oa = JSON.parse(fs.readFileSync(auditFile)), or = JSON.parse(fs.readFileSync(reviewFile));
        if (oa.geometryStatus !== 'PASS' || oa.errors?.length) throw Error('旧工程检查未通过');
        for (const medium of ['html', 'pdf']) if (fileHash(path.resolve(path.dirname(auditFile), oa[medium + 'Artifact'].path)) !== oa[medium + 'Artifact'].sha256) throw Error('旧产物缺失/已修改');
        const oldErrors = validate(or, oa, {baseDir: path.dirname(reviewFile), auditDir: path.dirname(auditFile), trail: [...trail, reviewFile]});
        if (oldErrors.length) throw Error(oldErrors.join('；'));
        for (const id of refs) {
          const current = verified.get(id), previous = oa.evidenceManifest.entries.find(e => e.id === id);
          if (!current || !previous || ['pageSha256', 'dependenciesSha256', 'sha256', 'page'].some(k => current[k] !== previous[k])) throw Error('页面/字体样式/图像/页序已变，须重新审查：' + id);
          if (!or.coverage.some(oc => oc.reviewer === c.reviewer && oc.independence === c.independence && oc.evidence?.some(e => e.id === id))) throw Error('旧审查者未覆盖此证据：' + id);
        }
        for (const issue of or.issues.filter(i => i.status === 'open')) if (!review.issues.some(i => i.description === issue.description)) throw Error('继承时丢失旧未决问题');
      } catch (e) { fail('继承无效：' + e.message); }
    }
  }
  for(const name of reviewers.author)if(reviewers.independent.has(name))fail('作者与独立审查者身份重叠：'+name);
  if(!partial){
    const names=[...new Set([...reviewers.author,...reviewers.independent])].sort().join('; ');
    if(review.reviewer!==names||review.independence!==(reviewers.independent.size?'independent':'author'))fail('审查汇总身份与coverage不一致');
  }
  if (!partial) for (const role of requiresIndependent(audit) ? ['author', 'independent'] : ['author']) for (const medium of ['html', 'pdf']) for (let n = 1; n <= audit.pages; n++) if (!sets[role][medium].has(n)) fail(role + ' ' + medium + '缺页：' + n);
  return errors;
}
module.exports = {validate, layers};
