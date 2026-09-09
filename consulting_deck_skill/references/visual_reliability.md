# 构图、几何与执行可靠性 · V11

用于有同行比较、复杂标注、多个证据模块或跨Agent制作的页面。共用接口承担测量和派生，作者保留分析与表达选择；不增加固定模板、图型配额或审查轮数。

## 整页创作先于精度工具

页面构思与四项决定统一见[整页创作](slide_anatomy.md)：证明什么、哪些关系如何可见、主次与阅读顺序、空间及对齐取舍。本文件负责把这些决定落实到真实对象，不另设一套构图流程。先让主证据和关系充分展开，再按需要建立轨道与测量。

收束辅助说明后仍要重新统筹全页；自然高度、边界对齐或无溢出均不能证明完成。`.proof-layout`和`.plot-stack`是可选接口，不应把全篇引向固定主辅模板。分隔线与锚点服务真实关系；主辅不强齐底边，独立补充不强配行。

## 共享排版与真实测量

- `scripts/render_comparison_rows.cjs`的`render({id,rows,columns,domain,decimals})`生成HTML同行比较。columns中的key可为label/value/bar及其他数据字段；同页id唯一。换行使用原文`\n`。行内共享首行基线，数值共享实际文字右缘，数据条在独立行中心按含零尺度计算；负数同样绑定零点。
- CSS来自自动装配的`assets/deck-geometry.css`。通过`--comparison-columns`调整列轨道，内容决定行高；禁止逐标签translateY修补基线。
- 自定义HTML/SVG可在实际文字上声明`data-geo-baseline="组ID"`、`data-geo-left/right/top/bottom/center-y="组ID"`。文字默认首行，末行加`data-geo-line="last"`；不能把基线锚点放在flex/grid外框。数值right测实际文字范围。SVG支持alphabetic实际字符基线及transform，其他baseline模式明确未支持。
- `.precision-bar-track`通过`data-geo-row-center`对应`data-geo-row`，图形中心与文字基线分别核对。跨图对齐应声明真实plot边缘/标题等锚点，不能只声明SVG容器。
- 同层标题需要共享基线时，在实际标题文字上声明同组锚点，并统一必要的字体及line-height；主区继承normal、侧栏继承固定行高时，容器同顶仍可能文字错位。使用共同样式修正，不能逐标题偏移。
- QA等待字体和图形稳定，检查实际字体身份后，将screen坐标除以页面实际scale。当前Chromium容差0.35逻辑px，已知4px和注入2px反例必须失败；换渲染环境先运行`test_reliability.cjs`校准，不调宽容差迁就可见错误。

| 路线 | 自动实现与验证 | 明确边界 |
|---|---|---|
| HTML同行比较 | 首行/末行、数值右缘、条长和行中心；混排、换行、400/600、负值小数、2倍缩放 | 字形自然顶底不同不强行拉齐；小数点对齐需另提供decimal轨道，不以右缘冒充 |
| 静态SVG | 实际字符基线、transform后锚点；专业图共用数据映射及fontkit候选布局 | 原生ECharts/custom SVG须提供真实对象适配；不因图型名称推断支持 |
| Canvas | 保留现有渲染、字体与打印检查 | 未提供可观测锚点适配器时记UNSUPPORTED_WITHOUT_ADAPTER，不声称同行/标注精度通过 |
| 最终PDF | qa检查嵌入字体、文字与页数；`audit_pdf_geometry.cjs`读取实际PDF文字对象并按HTML测量锚点核对 | 只覆盖可提取文字的水平基线和右缘；矢量归属、断层及整体构图仍实际渲染看图 |

六类专业标注的API、支持组合及退化策略见 [precision_exhibits.md](precision_exhibits.md)；图示的自动布局和示例见 [diagram_layouts.md](diagram_layouts.md)。

## 执行接缝

1. `apply_theme.cjs`自动内联布局与几何CSS。QA核对`.layout-split`等实际计算样式；缺CSS应在首个代表页暴露。`probe_capabilities.cjs`探测字体、渲染、PDF条件，图像能力需真实挑战图与回答验证，不接受模型自报支持。
2. planner加载只说明资源可读。按实际`skill_file`执行规划并验证plan，采纳时保留同一数据版本。已有清晰表达可直接做，写明重要取舍即可。
3. 若用了planner，复用`deck.html.page-spec.json`交接记录，QA自动调用`check_planner_execution.cjs`核对数据/plan哈希、schema、成稿可见关系；也可单独调用。检查结果分别为loaded/planned/implemented。plan.data.ref必须引用与record.data相同的实际本地文件（路径相对plan解析），plan.data.sha256记录规划时数据版本，并与record及实际文件核对；引用可附JSON片段。schema和可见图元存在不证明含义正确，四层复核继续核对实际关系。

page_spec接入例（路径相对此JSON；sha256取实际文件，不复制占位值）：

```json
{
  "data":{"path":"data.json","sha256":"实际SHA256"},
  "planner":{"root":"加载的skill_root","sourceSha256":"加载的source_sha256"},
  "plans":[{"path":"plan.json","sha256":"实际SHA256"}],
  "pages":[{"page":2,"proves":"两期哪些对象发生变化","roles":{"primary":"差异图","support":"收益边界"},"readingOrder":["两期端点","差额","限制"],"alignment":["行基线","共同尺度"],"plan":0,"relationships":[{"selector":"[data-role=delta-arrow]","minCount":1,"meaning":"真实两期端点比较"}]}]
}
```

不用planner的页可用`directReason`替代plan/relationships；不是为所有简单页补记录。重要换图理由写在既有page_spec，不能只保存加载路径。修改数据后更新对应输入/plan/成稿的版本，未经核对不复用旧选型。

## 四层验收和结果完整性

| 层 | 自动定位 | 实际看图 |
|---|---|---|
| page | 模块锚点、内容范围、计算样式 | 主次、重心、留白功能、阅读顺序、母版 |
| exhibit | 同行列、数据完整性、尺度 | 对应自然、分组与线条表达正确关系 |
| annotation | 派生值、端点、候选碰撞/越界 | 小值辨认、箭头含义、引线归属、比较便利性 |
| typography | 实际字体、文字基线、数字格式 | 正常阅读与放大局部的字形、间隔、可读性 |

一层的通过不能抵消另一层错误。page层先对照原始目标与用户明确要求判断，具体方法见[成品验收](workflow_qa.md)；无碰撞、证据哈希齐全不等于整页成立。字体自然字形差异与合理中文换行可接受；错误数据、明显错位、错误指认、不可读必须返工。完整报告实际查看每页HTML截图及最终PDF，关键标注/排印放大检查；打印DOM不是最终PDF。

继续保留`review.json`和`audit.json`；新稿data-reliability-version="2"使用schemaVersion 3，完整字段和主命令见[交付契约](delivery_system.md)。独立要求由task的complexity/majorConclusion派生，与kind无关。作者及必要独立审查分别覆盖四层、每页HTML和真实PDF；coverage.evidence只引用本次audit.evidenceManifest中的id，如html:page-1和pdf:page-1，不能自行登记任意图片路径代替。

QA清单绑定媒介、页号、稳定pageId、页面内容摘要、共享依赖摘要、源HTML/PDF摘要及真实渲染图字节。需要局部继承时主动提供稳定且全篇唯一的`data-page-id`；默认page-N会随页序变化，不是持久语义身份。清单绑定文件归属，不证明实际看过。

每份返回实际完成后才声明complete，并提供analysis/evidence/visual合法status与非空basis；聚合不能把作者结果升级为独立复核。最终PDF审计无可测锚点仍为NOT_DECLARED/PARTIAL，不可称完整精度通过。

### 关键内容不可被总覆盖率替代

把会改变判断的少量关键否定、口径、单位或前提放进task.critical，例如`{"id":"share-boundary","text":"不是市场收入份额","target":"visibility-chart"}`；正文对应`<span data-critical-id="share-boundary" data-critical-for="visibility-chart">不是市场收入份额</span>`，关联对象同页`id="visibility-chart"`。id唯一，声明text须与可见正文一致（允许空白差异）；target可省略，存在时须关联真实可见对象。

QA核对声明、屏幕/打印DOM完整性，以及实际PDF对应位置内的关键文字与关联对象文字。PDF采用可提取文字对象，不能把Canvas或图片里的字当已自动验证。此机制只覆盖显式声明，不会自动找齐所有业务限制；作者仍须核对重要语义和视觉归属，不能因为整体文字覆盖率较高忽略一句否定丢失。

### 有限继承：只保留未变且已真实复核的范围

coverage项可加`inheritedFrom`：`{"audit":{"path":"旧audit.json","sha256":"旧文件字节SHA256"},"review":{"path":"旧review.json","sha256":"旧文件字节SHA256"},"basis":"实际变更及未受影响依据"}`，路径相对当前review文件。旧audit/review、旧HTML/PDF及旧证据必须仍在，旧工程和完整审查必须有效；不能从incomplete或legacy记录直接继承。

继承范围必须保持同一审查者与独立性、页身份、页号、页面内容摘要、共享依赖摘要及当前双媒介截图字节；页序、字体样式、任务/环境依赖或图像变化均要求重审，不能仅凭正文文本未变继承。目前task整体参与共享依赖摘要，包括critical清单：即使只改一页关键限定的声明，也会保守要求全篇重审；普通非关键文字的局部改动可在其余条件不变时继承。旧未决问题须保留，循环/过深继承被拒绝。条件不满足时实际重看受影响页；不要改哈希掩盖变化。机器校验只约束继承边界，不能代替判断。

PDF文字关系与跨媒介位置分别报告：同组基线/右缘spread仍须≤0.35逻辑px；文字须完整对应。Chrome打印可能将整行基线取到最近CSS像素，小数行高实测夹具已验证该签名。仅在整组对齐、每段均符合最近整数（数值残差≤0.02px）、共同量化≤0.5px时标`CALIBRATED_BASELINE_ROUNDING`，保留原始偏移；右缘不套用该模型。任意整组平移、单元素2/4px偏移、缺字与18px片段移位仍失败。其他打印路径若不符合已验证模型需单独适配，不能通过放宽组内容差解决。

该记录用于绑定实际工作，不是审查真实性证明；不能先填通过再看图。交付脚本核对覆盖集合与证据字节。修改文字、数据、字体、样式、页序后更新受影响HTML/PDF、截图和review哈希；未覆盖明确保留，不能升级为正式通过。
