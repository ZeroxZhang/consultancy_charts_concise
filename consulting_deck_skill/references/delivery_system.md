# HTML＋PDF交付 · V11.2

交付同名自包含HTML与分页PDF，HTML内嵌同一份PDF供离线下载。以下命令从实际skill根目录运行，任务文件使用实际绝对路径。源码接口已接线不等于该任务已验收，最终以本次真实audit与审查为准。

## 任务合同：制作与验收共同输入

在制作前保存`task.json`，示例中的任务判断须换成实际选择。S0的规划字段随实际决策更新；仅做到S3时在笔记明确“尚未进入选型”，不声称planner完成。S4–S5决定实现后更新planner，S6装配前冻结最终选择；制作后的变更需重建并复验：

```json
{
  "version": 1,
  "workMode": "editorial",
  "complexity": "simple",
  "majorConclusion": false,
  "mode": "reading",
  "theme": "mckinsey",
  "typography": "serif-report-bold",
  "ratio": "16x9",
  "kind": "fragment",
  "planner": {"mode": "direct"},
  "critical": []
}
```

`workMode`为editorial/analytical/exploratory；`complexity`为simple/complex，未判断时默认complex。complex或majorConclusion=true派生独立复核要求，否则作者复核；不手填冲突的reviewPolicy。kind为report/fragment/collection，仅控制编排，不决定风险。mode为reading/presentation，ratio为16x9/4x3；字体与主题使用现有注册名。simple必须有真实判断依据，不能为绕过复核填写。

planner.mode为direct/used/unavailable。used须给record路径（相对task.json）及实际sha256；装配时校验并换算为相对输出HTML的路径，未给sha256时装配器读取真实文件填入。unavailable须给reason，记录实际限制；不能把已采用但记录缺失的planner改写为direct；direct表示本任务实际未采用planner。仅停在S3是阶段范围，不是环境unavailable，续作时重新决定并更新。关键否定、口径、单位和条件使用少量显式critical声明，字段及HTML关联见[视觉可靠性](visual_reliability.md)。空数组不证明没有关键风险，作者仍承担识别责任。

## 从成稿到交付

```sh
node scripts/assemble_deck.cjs /任务/pages.html /任务/deck.html --css /任务/page.css --title "报告标题" --contract /任务/task.json
node scripts/qa_deck.cjs /任务/deck.html /任务/renders
```

首次环境/环境变化先运行`node scripts/probe_capabilities.cjs /任务/capabilities`；除Playwright/Chrome、Python/fontTools与Poppler外，实际PDF栅格和文字坐标路线使用`PDFJS_MODULE`与`PDF_CANVAS_MODULE`指定本地模块。探针完成真实渲染和图像挑战后才报告对应能力，不用打印DOM冒充。

初始化稿嵌入deck-task-contract并声明data-reliability-version="2"。QA生成audit.json和真实双媒介逐页证据；工程PASS不代表已审内容或视觉。实际核对原材料、关键计算、总览、每页HTML截图与最终PDF栅格图，再记录真实结果；打印DOM不能替代PDF。按合同风险安排未参与制作的独立复核，作者和独立结果分别保留。

## 现行review：schemaVersion 3

主路径只使用schemaVersion 3。下例是**未完成结构**，不是可交付的通过样例；在实际检查后填写basis、coverage与结论：

```json
{
  "schemaVersion": 3,
  "status": "incomplete",
  "reviewer": "实际审查者",
  "independence": "author",
  "htmlSha256": "audit.htmlArtifact.sha256",
  "pdfSha256": "audit.pdfArtifact.sha256",
  "auditSha256": "对audit解析对象执行hash(stable(audit))的实际值",
  "checks": {
    "analysis": {"status": "not_reviewed", "basis": ""},
    "evidence": {"status": "not_reviewed", "basis": ""},
    "visual": {"status": "not_reviewed", "basis": ""}
  },
  "coverage": [],
  "issues": []
}
```

哈希算法由`scripts/report_contract.cjs`的hash/stable提供；auditSha256是规范化对象摘要，不是audit.json原始文件字节摘要。实际完成后status为complete；analysis/evidence为pass或有实际理由的not_applicable，visual必须为实际看图后的pass，三项均有非空basis。independence为author或independent；不能脚本预填通过判断。

coverage每项包含reviewer、independence、四层layers（page/exhibit/annotation/typography）、htmlPages、pdfPages，以及`evidence:[{"id":"html:实际pageId"},{"id":"pdf:实际pageId"}]`。id必须从本次audit.evidenceManifest.entries选择；媒介与页号必须逐一匹配，不能用一张截图覆盖多页或PDF。各层检查及安全继承见[视觉可靠性](visual_reliability.md)。复杂任务作者和独立角色各自覆盖全页双媒介；简单任务作者覆盖全页双媒介。分工结果可在同一角色内合并，但作者结果不能填补独立结果。

```sh
node scripts/aggregate_reviews.cjs /任务/renders/audit.json /任务/renders/review.json /任务/renders/author.json /任务/renders/independent.json
node scripts/package_delivery.cjs /任务/deck.html /任务/renders/deck.pdf /任务/delivery 报告名
```

简单任务不提供独立结果参数。输入须为真实结构化JSON；聚合结果incomplete要补查，不能把自然语言、缺项或错误格式当作空问题。issues使用severity=minor/major/blocking、status=open/resolved和description；major/blocking必须解决。用户明确构图、留白、对齐和禁用装饰色条均属合同，不以“个人审美”豁免。

未做完审查可在打包命令加`--preview`：输出名、标题与元信息标预览，不能称正式通过；预览仍须满足工程及文件一致性底线。记录简洁即可，不逐页复制通过话术。证据绑定只证明文件归属，不证明判断真实或设计达标。

## 一致性、变更与历史兼容

打包核对当前HTML/PDF路径、页数、SHA-256、audit和review，内嵌PDF字节须等于独立PDF；不更改正文。修改文字、数据、主题、字体或页序后重建受影响产物并复核；只有满足[有限继承](visual_reliability.md)的未变范围可引用旧审查。后续反馈推翻旧验收时保留原记录并明确撤回范围，不继续引用旧PASS。

旧稿schema 2或更早审查仅属于legacy兼容路径，不是新稿示例。不要删除版本属性或任务合同降级绕过检查；迁移后执行现行QA及schema 3审查。

交付给两个可打开文件、页数、验证状态及实际限制。下载按钮提供已验收PDF，浏览器打印仅临时用途。技能维护直接改实际源目录，不主动生成ZIP、安装副本或发布产物。交付层改动运行test_delivery.cjs，QA规则改动运行test_qa_policy.cjs；常规制稿只做受影响成稿检查与实际复核。
