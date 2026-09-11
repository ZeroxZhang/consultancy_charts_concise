# 交付契约：任务合同、门禁与同版产物

**什么时候读这一份**：S1 开工登记任务合同时，以及 S6 交付时。

**读完要能做到**：写出正确的 `task.json`、按合同安排复核、生成能被聚合的门禁产物、把 HTML 与 PDF 同版交付出去。

**这份文件是 `task.json` 字段与 `review` 结构的唯一来源。** 其他文件只引用，不重复定义。

## task.json：唯一的任务合同

制作前把它写进任务目录。它同时驱动装配参数、复核要求和交付校验，所以**先写它，再动手**。

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

字段含义：

| 字段 | 取值 | 含义 |
|---|---|---|
| `version` | `1` | 合同版本，目前只接受 1 |
| `workMode` | `editorial` / `analytical` / `exploratory` | 决定分析深度与必要工作；选择依据见[分析](analysis.md) |
| `complexity` | `simple` / `complex` | **未判断时按 `complex`**；`simple` 必须是真实判断，不能为绕过复核而填。判据是任务范围而不是材料多少：材料多但只需按原文重新组织、不做新研究也不做新推理时可以是 simple；一旦需要新的计算、新的方法选择或新的结论就必须 complex |
| `majorConclusion` | `true` / `false` | 是否承载重大结论或建议，必须明确写出 boolean |
| `mode` | `reading` / `presentation` | 深度研究、预读用 reading；现场讲述用 presentation。正文页的类名要与它一致 |
| `theme` | `mckinsey` / `bcg` / `accenture` | 必须是 `assets/deck-themes.js` 里已注册的名字 |
| `typography` | 已注册的字体预设名 | 必须是 `assets/deck-typography.js` 里已注册的名字；不能提供嵌入字体的系统字体预设会被静态装配拒绝 |
| `ratio` | `16x9` / `4x3` | 4:3 需要重新布局，不是等比缩放 |
| `kind` | `report` / `fragment` / `collection` | **只控制首尾编排，不决定风险。** 不能用 fragment 绕过风险复核，也不让简单的完整稿重做复杂研究 |
| `planner` | `{mode, record?, sha256?, reason?}` | 见下 |
| `pages` | `{record, sha256?}` | S3 的逐页形式声明（pages.json）。`record` 相对 `task.json` 解析；给了 `sha256` 就要与文件实际摘要一致。**传了合同的装配缺这一项直接失败**，见下 |
| `critical` | 数组，可为空 | 少量会改变判断的关键语义声明，见下 |

**派生规则**：`complexity === "complex"` 或 `majorConclusion === true` 时，复核要求派生为 independent，否则为 author。不要手填与风险冲突的 `reviewPolicy`——填了且冲突会被直接拒绝。

`fragment` 是单篇片段，`collection` 是多篇合集演示——两者都不要求首尾页；只有 `report` 才按首尾规则编排。`report` 只是声明：封面、参考资料、封底仍由作者按[首尾页面](bookends.md)提供，装配器不自动补页。

### planner

| mode | 什么时候用 | 必须补什么 |
|---|---|---|
| `direct` | 本任务确实没有采用 planner，直接制作 | 无 |
| `used` | 实际采用了 planner 的选型 | `record`（相对 `task.json` 的路径）与 `sha256`（64 位十六进制）。装配时校验并把路径换算为相对输出 HTML 的路径；未给 sha256 时装配器读取真实文件填入 |
| `unavailable` | planner 在当前环境确实不可用 | `reason` 说明实际限制 |

**不能把"已经采用但记录缺失"改写成 `direct`。** 只做到 S3 是阶段范围，不是环境不可用；续作时重新决定并更新。

### pages：逐页形式声明

`pages.json` 是 S3 的机器可读产物：**内容和它的组织形式一起定下来**，而不是先写标题、实现阶段再临场找图。装配器用它和成稿逐页对账，QA 用它出全篇形式清单，交付门禁要求它 `PASS`。

```json
{
  "version": 1,
  "pages": [
    {
      "page": 3,
      "proves": "商超是净下滑的主要来源，电商只抵消约三分之一",
      "form": "kit.waterfall",
      "regions": [
        {"slot": "main", "span": 7, "form": "kit.waterfall", "role": "primary"},
        {"slot": "aside", "span": 5, "form": "kit.dumbbell", "role": "support"}
      ],
      "annotations": [{"on": "bar:商超", "kind": "delta", "text": "主要拖累 {value}"}],
      "fallback": {"if": "容量不足", "then": "kit.stacked + 完整数据表"}
    }
  ]
}
```

| 字段 | 必填 | 含义 |
|---|---|---|
| `page` | 是 | 正文页序，从 1 连续；封面/参考资料/封底不登记 |
| `proves` | 是 | 这一页要让读者看出的**一个**关系；与 `data-proves` 一致时会被核对 |
| `form` | 是 | 本页主形式，取值来自 `assets/deck-forms.js` 的封闭枚举——每个值都对应一个真实可执行入口，不登记渲染不出来的名字 |
| `regions` | 否 | 一页多展品时写明分区；必须恰好一个 `role:"primary"` 且与 `form` 一致 |
| `annotations` | 否 | 图上的旁解读，见[证据与表达](exhibits.md)的"旁解读"一节；**只有 `annotation:'layer'` 的形式能声明**，其余会被明确拒绝而不是静默忽略 |
| `repetitionReason` | 视情况 | 同一形式第 3 次起、或连续 3 页同形式时必须写 |
| `fallback` | 否 | 容量不足时改用什么 |

成稿每页必须显式声明 `data-form`（封面、参考资料、封底、分隔页除外），取值与 `pages.json` 一致；**没有静默默认值**，缺了或写了枚举以外的名字装配直接失败。`data-proves` 可选，写了就必须与 `pages.json` 的 `proves` 一致。

**反单调不是图型配额。** 规则只有一条：**重复必须是被解释的决定，不能是默认**。同一形式第 3 次出现、或连续三页同形式，作者必须写一句 `repetitionReason` 说明为什么这里还是它。它不规定用几种图、不因数量给页面定级，也不替代"这条形式是否真的适合本页证明责任"的判断——那是 S3 的取舍和 S5 的目视验收。

### critical：少量关键语义

只登记会改变理解或判断的内容，不登记普通句子：关键数字及其单位与分母、适用期间、否定或成立条件、事实/预测/假设的身份、会改变建议的反证。空数组不证明没有关键风险，识别责任仍在作者。

每项形如 `{"id": "唯一标识", "text": "原文限定", "target": "可选，对象 id"}`。`id` 与 `target` 用字母开头的标识符，`id` 不能重复，`text` 必须非空。

声明只有落到页面上才能被核对：HTML 一侧用 `data-critical-id`（对应 `id`）和 `data-critical-for`（关联对象）标在真实对象上，用法见[精度与标注](precision.md)。只写进 task.json 而没有落到 DOM 的声明会被判为未落实。

它检查的是**已声明的关键内容**在屏幕、打印和实际 PDF 里是否仍然存在、位置是否正确；audit 会标注为 `DECLARED_ONLY`，它不覆盖未声明的业务语义。

## 装配：把自由页面接回引擎

作者只写 `pages.html`：每页一个完整的顶层 `<section class="slide reading" data-frame-boundary="integrated">…</section>`，可以自由使用 HTML、表格、内联 SVG 和自己的布局 CSS。示例里的 reading 与 integrated 是作者选择，要按实际页面决定。片段里可以带 `style`，也可以另给 CSS 文件。

```sh
node scripts/assemble_deck.cjs /任务/pages.html /任务/deck.html \
  --css /任务/page.css --title "报告标题" --contract /任务/task.json
```

| 参数 | 取值 | 说明 |
|---|---|---|
| `--contract` | 任务合同路径 | 主路径。统一模式、主题、字体、画幅、kind、风险与 planner 记录 |
| `--css` | 自定义 CSS 路径 | 作者样式排在公共默认样式之后 |
| `--title` | 报告标题 | 写入文档标题 |
| `--kind` | `fragment` / `report` / `collection` | 覆盖合同里的 kind |
| `--theme` / `--typography` / `--ratio` | 已注册的主题名、字体预设名、`16x9`/`4x3` | 显式覆盖；与合同冲突时应当修正输入 |

不传合同的兼容调用会采用保守的 `complex` 默认值，不能据此绕过独立复核。

装配器用 Chromium 解析 HTML/SVG，验证独立页结构后替换引擎唯一的 `#stage`，保留导航、缩放、深链、打印和已验收 PDF 下载接口。它只补缺失的母版节点；**每页必须由作者显式选择合法的 `data-frame-boundary`**，首尾页可用 `data-frame="off"` 配合 `space`。缺失或非法边界会失败，不自动选择横线。合同与显式主题/字体参数冲突时应当修正输入，不能静默接受。

**静态装配只接受内联 SVG 与 `data:` 资源。** 以下会明确失败：`script`、`canvas`、`.chart`、`data-opt`/`data-recipe`、事件处理器、外部图片/样式/字体、`@import`、重复或引擎保留的 id、嵌套 slide、未闭合的 section、完整 HTML 输入。动态图表先沿 `render_echarts_svg.cjs` 等入口渲染成内联 SVG；内嵌位图用 base64 data URL，SVG 直接内联以继承报告字体。CSS 里的外部 URL 与 `@import` 要先内联，普通来源超链接可以保留。

主题、公共布局、共享几何、母版和字体都通过现有 `apply_theme.cjs` 装配（其中已调用 `pack_fonts.cjs`），没有第二份样式实现。只有静态路线会去掉不使用的 ECharts 与在线图标加载器；正文的中文、西文和内联 SVG 文字进入最终字体子集。构建需要与 QA 相同的 Playwright/Chrome、Python/fontTools 和本地字体资产，可用 `PLAYWRIGHT_MODULE`、`CHROME_CHANNEL`、`FONT_PYTHON` 指向已配置的运行时。

API：`await assemble({pagesFile, outputFile, contractFile?, cssFile?, title?, kind?, theme?, typography?, ratio?})`。成功返回 `{status:"assembled", output, pages, theme, typography, kind, ratio, sha256, route:"static-html-svg"}`；失败不写输出。

装配器不计算数据、不排查视觉碰撞、不宣称最终 PDF 已经通过。它只保证接回成功，之后仍要继续成稿 QA 与实际看图。

### 动态路线

不走静态装配时：用 `apply_theme.cjs` 初始化，编辑或在 SSR/资源内联之后，用 `pack_fonts.cjs` 定稿；新增文字要重新打包字体。两条路线都要继续成稿 QA 与实际看图。

## 交付门禁链

链式的，断任何一环都不能正式交付：

1. **装配**——`assemble_deck.cjs` 把任务合同写进 HTML，并声明 `data-reliability-version="2"` 与 `data-deck-kind`。传了合同时逐页 `data-form` 必须存在、取值合法，并与 `pages.json` 一一对应；缺 `pages` 或缺声明直接失败。
2. **工程与证据**——`node scripts/qa_deck.cjs /任务/deck.html /任务/renders` 生成 `audit.json` 与真实的双媒介逐页证据。audit 必须 `geometryStatus === "PASS"` 且 `errors` 为空；缺少任一媒介的任一页证据都会失败。audit 同时给出 `pagesCheck` 与 `pagesInventory`（全篇形式与族的分布、最长连续段）。
3. **审查归属**——`review` 必须 `status: "complete"`，证据 id 取自本次 `audit.evidenceManifest.entries`，并绑定当前 HTML、PDF 与 audit 的摘要。审查者要读 `pagesInventory`，对"全篇是否重复同一弱结构"给出具体判断。
4. **打包**——`package_delivery.cjs` 复核页数、SHA-256、任务合同与证据归属；`pagesCheck` 不是 `PASS` 时拒绝正式打包，只能用 `--preview`。内嵌 PDF 的字节必须等于独立 PDF。

**工程通过不代表已经审过内容或视觉。** audit 里的 `visualStatus` 只会是 `NOT_REVIEWED`——它明确说明自动检查没有看图。

## review：现行结构

```json
{
  "schemaVersion": 3,
  "status": "incomplete",
  "reviewer": "实际审查者",
  "independence": "author",
  "htmlSha256": "audit.htmlArtifact.sha256",
  "pdfSha256": "audit.pdfArtifact.sha256",
  "auditSha256": "对 audit 解析对象执行 hash(stable(audit)) 的实际值",
  "checks": {
    "analysis": {"status": "not_reviewed", "basis": ""},
    "evidence": {"status": "not_reviewed", "basis": ""},
    "visual": {"status": "not_reviewed", "basis": ""}
  },
  "coverage": [],
  "issues": []
}
```

**这是未完成结构，不是通过样例。** 实际检查之后再填 `basis`、`coverage` 和结论。

- `status` 最终必须是 `complete`。
- `htmlSha256` 与 `pdfSha256` 取 audit 的产物摘要。`auditSha256` 是对 audit **解析对象**做的规范化摘要，**不是 `audit.json` 的原始字节摘要**；算法由 `scripts/report_contract.cjs` 的 `hash` 与 `stable` 提供。
- `checks.analysis` 与 `checks.evidence` 为 `pass`，或有实际理由的 `not_applicable`；`checks.visual` **必须是实际看图后的 `pass`**。三项都要有非空 `basis`，写清实际看到什么、依据是什么。
- `independence` 为 `author` 或 `independent`。不能由脚本预填通过判断。

### coverage

每项包含 `reviewer`、`independence`、四层 `layers`（`page`、`exhibit`、`annotation`、`typography`）、`htmlPages`、`pdfPages`，以及 `evidence`：

```json
"evidence": [{"id": "html:实际pageId"}, {"id": "pdf:实际pageId"}]
```

- 证据 `id` **必须从本次 `audit.evidenceManifest.entries` 里选**，媒介与页号要逐一匹配。
- 不能用一张截图覆盖多页，也不能用 HTML 图充当 PDF 证据。
- `htmlPages` 与 `pdfPages` 必须与所引证据的媒介和页号集合完全一致。
- 同一份真实图像可以被作者和独立审查者分别引用，不需要重复生成截图。
- 复杂任务由作者与独立角色**各自覆盖全页、两种媒介**；简单任务由作者覆盖全页、两种媒介。**作者结果不能填补独立结果的缺失。**
- 同一角色内部可以合并分工结果，但作者与独立审查者的身份不能重叠。

### issues

每项形如 `{"severity": "minor|major|blocking", "status": "open|resolved", "description": "..."}`。**major 与 blocking 必须 resolved 才能交付。** 没有问题也要给出空数组，明确表示检查过。

### 有限继承

局部修改之后，只有同时满足全部条件的未变范围才可以引用旧审查：

- 页面内容、依赖数据、字体与公共样式、渲染图像和页序经核对均未变；
- 旧 audit、旧 review 与两份产物文件的摘要仍然一致，且旧 audit 的工程检查通过；
- 旧审查者本人覆盖过该条证据；旧的未决问题被本次完整保留。

任一条不能证明，就复验该页。**共享样式变化不能因为"源文字没改"而跳过。** 旧 major 的"已修"还需要本次证据，不能只把状态改成 resolved。不得给旧截图换上当前哈希来冒认本次看图。

### 聚合与打包

```sh
node scripts/aggregate_reviews.cjs /任务/renders/audit.json /任务/renders/review.json /任务/renders/author.json /任务/renders/independent.json
node scripts/package_delivery.cjs /任务/deck.html /任务/renders/deck.pdf /任务/delivery 报告名
```

简单任务不提供独立结果参数。输入必须是真实的结构化 JSON；聚合结果 `incomplete` 时要补查，不能把自然语言、缺项或错误格式当成空问题。作者与独立审查使用同一套结构，**不能用 Markdown 报告替代聚合输入**。

打包默认拒绝覆盖已存在的交付文件，确认替换时加 `--force`。

## 未做完：只用预览

审查还没做完时，在打包命令加 `--preview`：输出名、标题与元信息都会标成预览，不能称正式通过。预览仍然要通过工程与文件一致性底线，只是不检查 review。

## 旧格式与新稿

旧格式的审查只在兼容路径下被接受，不是新稿示例。不要删除版本属性或任务合同来降级绕过检查；迁移后要执行现行 QA 与审查。

## 一致性与变更

打包会核对当前 HTML/PDF 的路径、页数、SHA-256、audit 与 review；内嵌 PDF 必须逐字节等于独立 PDF，且不更改正文。修改文字、数据、主题、字体或页序之后，重建受影响的产物并复核；只有满足有限继承的未变范围可以引用旧审查。后续反馈推翻旧验收时，保留原记录并明确撤回范围，不继续引用旧结论。

交付给两个可打开的文件、页数、验证状态和实际限制。下载按钮提供已验收的 PDF，浏览器打印只是临时用途。交付层改动跑 `test_delivery.cjs`，QA 规则改动跑 `test_qa_policy.cjs`；常规制稿只做受影响成稿检查与实际复核。
