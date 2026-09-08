# HTML＋PDF交付 · v9

交付同名自包含HTML与分页PDF，HTML内嵌同一份PDF供离线下载。修改文字、数据、主题、字体或页序后重建受影响产物并复核。同版路径/页数/SHA-256检查继续保留。

## 从成稿到交付

1. `node scripts/qa_deck.cjs deck.html renders`：生成逐页PNG、overview和deck.pdf，记录audit.json。自动PASS表示已覆盖工程检查通过，不代表内容或视觉已审。
2. 实际核对关键分析/证据、逐页与PDF，写简短`renders/review.json`。普通任务可作者复核，复杂新deck使用独立代理，准确记录；不需要外部真人签字或用户逐阶段批准。
3. `node scripts/package_delivery.cjs deck.html renders/deck.pdf delivery 报告名`：校验审查与成稿版本后打包。未做完审查可加`--preview`；输出名带-preview、HTML标题与元信息标预览，不能对用户称正式通过。预览仍须通过文件一致性和工程底线。

review.json的最小例子（哈希从本次audit复制，basis写真实检查及证据位置，不照抄示例作为已做过）：

```json
{
  "status":"complete",
  "reviewer":"实际审查者或代理任务名",
  "independence":"author",
  "htmlSha256":"本次audit.htmlArtifact.sha256",
  "pdfSha256":"本次audit.pdfArtifact.sha256",
  "checks":{
    "analysis":{"status":"pass","basis":"关键计算、判断和反证的实际复核记录位置"},
    "evidence":{"status":"pass","basis":"原文定位及关键数值核对范围"},
    "visual":{"status":"pass","basis":"实际看过的逐页图片、PDF及问题处置"}
  },
  "issues":[]
}
```

independence为author或independent。analysis/evidence在任务范围确实不适用时可not_applicable并说明原因；简单编辑仍做必要内容核对，不补造分析台账。visual需实际看图。issues可记minor未决细节；blocking/major必须resolved，包含severity/status/description。建议字号或审查者个人偏好不自动构成major；用户明确的构图/风格要求、关键关系和整页完成度按任务合同验收，不能用工程通过代替。

记录要简洁，一份文件即可；不逐页填写相同的通过话术。审查文件不是数字签名或真实性自动证明，不能用脚本替人写出未做过的检查。

成稿复核先按workflow_qa的“成品是否完成任务”判断，再填写记录；覆盖每页和哈希绑定仅证明记录指向哪些文件，不证明设计达标。后续反馈推翻原验收时保留原记录，另明确标注已撤回的范围与后继结果，不继续引用原PASS作为当前质量证据。

本脚本装配同版HTML/PDF及下载控件，不生成技能分发ZIP。技能维护直接改实际源目录；没有用户的分发要求，不另外生成ZIP、安装副本或发布产物。

## 一致性与限制

package_delivery保留audit中的路径、HTML/PDF页数和哈希检查，内嵌字节等于独立PDF；review另绑定相同成稿哈希。打包只增加交付控件需要的内嵌内容和状态元信息，不更改幻灯片正文。

交付时给两个可打开文件、页数、验证状态及需要说明的限制。下载按钮下载已验收PDF；浏览器打印用于临时打印。不要把HTML扩展名改成其他格式。

交付层变更运行test_delivery.cjs；QA规则变更运行test_qa_policy.cjs。本层未改变时，常规制稿只需成稿QA和实际复核。

## V11覆盖集合

新初始化稿自动声明data-reliability-version="1"，review增加schemaVersion:2及coverage，字段见 [visual_reliability.md](visual_reliability.md)。完整报告作者与独立审查分别覆盖每页HTML和实际PDF、四层目标与当前证据哈希；简单片段可作者复核。旧稿继续兼容原review；不要删除版本属性绕过新版检查。`aggregate_reviews.cjs`可聚合真实返回，输出incomplete须补查；不会把自然语言或缺结果当成空问题。
