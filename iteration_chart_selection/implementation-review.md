# 本轮选型接入实现：独立审查

结论：在下述限定范围与复验版本中，未发现仍待解决的实现问题。审查中发现的通用 SVG 实际图型缺失及主区声明冲突已由主会话修正，本审查者未修改技能源码。该结论不代表图形内容、成稿美学或最终 HTML/PDF 已验收。

## 范围与方法

审查相对 Git 当前基线的相关 diff：`scripts/check_pages.cjs`、`assemble_deck.cjs`、`qa_deck.cjs`、`sweep_forms.cjs`、`load_viz_planner.cjs`，以及本轮变动的 `test_pages_contract.cjs`、`test_viz_planner_loader.cjs`。为理解调用链，只读追踪 `report_contract.cjs`、`check_planner_execution.cjs` 和相关合同说明，未扩展为历史缺陷普查。

关注四项：自定义新图型的入口、实际图型重复计数与成稿对账、常规选型的外部依赖、已采纳 planner 的版本与数据链。未联网、安装、运行选型专家或进行跨模型实验。

## 发现、修正与复验

初次代码审查发现一个 P2 契约缺口，包含同一根因下的两种表现：`visual` 被当作完全可选字段，而非通用 SVG 的必需语义。

1. `form: "svg.custom"` 未填写 `visual` 时，`check()` 返回 PASS；`verifyDeck()` 也不会检查成稿的 `data-visual`。因此可跳过本轮新增的实际图型记录与对账。
2. 页级写 `visual: "forest"`、primary region 写 `visual: "bar"`，且两者均为 `svg.custom` 时，`check()` 仍返回 PASS。库存与主区能指向不同实际表达。

最小复现（在技能目录执行；当前修复后应均为 FAIL）：

```js
const C = require('./scripts/check_pages.cjs');
const base = {page: 1, form: 'svg.custom', proves: '比较估计与区间'};
C.check({version: 1, pages: [base]});
C.check({version: 1, pages: [{...base, visual: 'forest', regions: [
  {slot: 'main', role: 'primary', span: 1, form: 'svg.custom', visual: 'bar'}
]}]});
```

主会话随后为页与 regions 增加通用 SVG 必填 `visual`，并核对 primary region 与页级 `visual` 一致性。独立复验结果：

| 用例 | 当前结果 |
|---|---|
| 通用 SVG 页缺 visual | FAIL：必须声明实际表达 |
| 通用 SVG region 缺 visual | FAIL：必须声明实际表达 |
| 页 forest、primary region bar | FAIL：主区与页面 visual 不一致 |
| 合同 forest、成稿缺 data-visual | 对账失败 |
| 合同 forest、成稿 data-visual=bar | 对账失败 |
| 合同 forest、成稿 data-visual=forest | 对账通过 |

初次问题已关闭，不列为未决缺陷。原已生成文件没有因此被本审查改写；旧 `svg.custom` 底稿如需重新进入新合同，应补真实表达名称，不应猜填。

## 四项检查结论

**新图型不会再被旧能力映射挡住。** `check_pages` 移除了 planner capability 与有限组件映射的强绑定；未知具体图型可以通过已有 `svg.custom` 实现入口并声明 `visual`。`sweep_forms` 只列本地实现入口，明确引向 `charts.md` 与自定义通道。入口名仍需真实存在，这没有把实际图型重新封闭成组件目录。

**重复计数与成稿对账接通。** `expression()` 统一使用非空 `visual`，其他入口未提供时按 `form` 回退，符合当前合同。测试覆盖三种自定义图不误算为一种、同一实际表达换三种实现仍触发重复说明、说明补齐后通过。`assemble_deck` 从页面读取 `data-visual`，`qa_deck` 从实际浏览器 DOM 读取同字段，均传入同一 `verifyDeck()`；pages 内容摘要的原有校验继续保留。计数是声明审计，不会自动识别图形语义或防止作者给同图型乱起别名，仍须按技能要求目视判断。

**普通选型不再隐含加载 planner。** `sweep_forms` 不再 require loader、不读目录快照；本地清单测试检查 loader 未出现在模块缓存中。新 loader 只读显式路径或已安装路径，不包含解压、写缓存、网络获取、安装或同步逻辑。显式资源缺失/不兼容会如实失败，不以其他安装静默替代。空环境测试通过且不创建目录。

**已采用 planner 的链路没有因本轮简化而被绕过。** `report_contract` 仍在 `mode=used` 时绑定并核对记录摘要；`qa_deck` 仍调用 `check_planner_execution`。后者继续检查实际资源根与源码摘要、plan 文件摘要、data 文件摘要、plan 指向同一实际数据文件，以及 plan 内数据摘要与当前值一致。新 loader 移除自动恢复后，绑定资源缺失会失败，不会降级成 direct。

针对最后一点，执行了临时目录中的隔离绑定验证：完全匹配为 PASS；资源摘要改变、资源缺失、plan 摘要改变、相同内容但不同路径的输入、输入内容改变、输入摘要更新但 plan 仍绑定旧摘要，均为 FAIL。夹具使用最小 JSON 读取器替代外部 schema 校验器、使用可见关系桩替代浏览器，只验证主技能的文件与数据链，**不声称验证了真实外部 schema 或实际可见性**。所有临时文件已清理。初次夹具用 macOS 临时目录别名而非 loader 返回的真实路径，导致基线失败；改为实际根路径后得到上述结果，未将夹具错误记作产品缺陷。

## 已运行的相关检查

```sh
node scripts/test_pages_contract.cjs
node scripts/test_viz_planner_loader.cjs
node scripts/test_task_contract.cjs
```

三项均通过；`test_pages_contract` 在修正前后各运行一次，最终包含本次新增的缺失/冲突反例。另执行上述最小合同反例及隔离绑定验证。没有重跑无关引擎、图表库或 PDF 全套测试；本审查只对装配/QA 的字段读取与调用链做代码检查，实际样张渲染与最终 PDF 由主任务另行验证。

## 复验版本

下表为复验时内容的 SHA-256 前 12 位，用于区分后续更改；不是发布版本或正式交付摘要。

| 文件（均在技能 scripts/ 下） | 摘要前缀 |
|---|---|
| check_pages.cjs | 2750a24e3de1 |
| assemble_deck.cjs | f77276dafb72 |
| qa_deck.cjs | ac145ad05b63 |
| sweep_forms.cjs | 2bf7e0adfb19 |
| load_viz_planner.cjs | 74d46a7ef0cf |
| test_pages_contract.cjs | 193b65f79d3b |
| test_viz_planner_loader.cjs | 5155433d564b |

## 追加：PDF 内部画布统一与透明度规则

本次追加仅审查 `render_pdf_pages.cjs`、`audit_pdf_geometry.cjs` 及新测试 `test_pdf_canvas.cjs`；同时复查 `charts.md` 与 `exhibits.md` 的透明度规则。未修改源码，未扩展为报告制作。

**结论：限定范围内未发现待修问题。** 当前依赖实际存在两种 Canvas：主技能直接解析 `@napi-rs/canvas` 1.0.9，PDF.js 自身模块路径默认解析其嵌套的 0.1.100。结合本地 PDF.js 的 `NodeCanvasFactory` 实现，可以确认默认内部画布与外部传入的主画布具有不同来源；统一工厂直接解决这一类型边界，不需要禁止有意义的数据渐变或透明叠加。

代码审查要点：

- `openPdf()` 从同一模块获取主画布提供者及 DOMMatrix/ImageData/Path2D，向 `getDocument()` 显式传入 CanvasFactory。其 `create/reset/destroy` 形状、画布重置和资源清理行为与当前 PDF.js 所使用的工厂接口匹配；PDF.js 的内部缓存画布会使用该工厂。
- `render()` 与 `inspect()` 均复用 `openPdf()` 返回的提供者创建主画布。`inspect()` 在读取 PDF 后仍先核对摘要，后续页集合、文字匹配、几何容差和未声明状态判断没有被放宽；两条路径仍在 finally 中销毁文档。
- 新测试用 Chromium 实际导出渐变与透明组 PDF，分别检查两条路径输出的栅格像素：渐变左右颜色及红蓝半透明叠加值；同时要求无锚点几何审查保持 PARTIAL、errors 为空。它验证了这里的失效机制与修复结果，没有把“成功生成 PNG”当作颜色正确，也没有把无锚点页冒充精度通过。该测试不证明任意复杂混合模式或所有图形语义都正确，当前文档仍保留实际看 PDF 的要求。

独立执行命令与结果：

```sh
node scripts/test_pdf_canvas.cjs
# PASS real PDF gradient and transparency pixels in page review and geometry audit;
# undeclared geometry remains PARTIAL
```

测试正常结束并清理临时目录。主会话另报告 `test_execution_contracts` 33 例与 `test_qa_integration` 通过，本审查未重复运行这两项，故不将其算作独立复跑证据。

文档的最终状态已同步到 `forward-selection.md`：初次透明度冲突及后来“一律禁透明”的过渡修订都作为历史观察保留，现行规则按数据语义允许透明叠加与连续色阶，检查实际 PDF 的颜色、标签和尺度。普通辅助底纹仍优先主题实色；装饰性色条禁令没有改变。

追加复验 SHA-256 前缀：

| 文件 | 摘要前缀 |
|---|---|
| scripts/render_pdf_pages.cjs | 275e8223e9ec |
| scripts/audit_pdf_geometry.cjs | 4ca3507238c7 |
| scripts/test_pdf_canvas.cjs | e7c86fb725ca |
| references/charts.md | a1efae75729f |
| references/exhibits.md | 4dd2605239af |
