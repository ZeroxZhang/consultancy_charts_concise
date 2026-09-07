# 字体系统 · v1.1

这是本项目的排版方案，不是咨询公司的官方字体规范。字体版本独立于配色版本、分析模式和ECharts6.1.0。

## 角色与基线

唯一配置：assets/deck-typography.js。固定一套中西文标题搭配与一套中西文正文搭配，默认最多四个实际家族；备注与数字复用正文。

| 角色 | 中文 | 西文 | 1280×720 reading基线 |
|---|---|---|---|
| 封面主标题 | Noto Serif SC700 | Playfair Display700 | 46px / 1.2 |
| 章节标题 | 同上 | 同上 | 38px / 1.25 |
| 页主判断 | 同上 | 同上 | 32px / 1.28，通常两行 |
| 模块、展品标题 | Noto Sans SC600 | Inter600 | 18–20px / 1.3 |
| 正文、解释 | Noto Sans SC400 | Inter400 | 16–17px / 约1.5 |
| 常规表格数据 | Noto Sans SC400 | Inter400，选择性600 | 15–16px；表头15px／600 |
| 图表标签、数据 | Noto Sans SC400 | Inter400，选择性600 | 通常14–16px，按图与媒介预算 |
| 副题 | 同正文 | 同正文 | 15px / 约1.45 |
| 解释备注、口径 | 同正文 | 同正文 | 14–15px / 1.5 |
| Source、页码 | 同正文 | 同正文 | 12px；深灰且反差达标 |

仅封面、章节、页主判断使用衬线，不能将所有h2改为衬线。重要限制按解释性正文呈现，不压进12px Source；不要默认细字重、中文斜体或拉大字距。正文强调使用真实600，主标题默认真实700；不能把全页改为粗体。角色变量--fs-data/--fs-table-head/--fs-subtitle/--fs-exhibit-title/--fs-annotation提供制作入口；常规查数表不要默认放大成KPI。已有认可成稿时继承其角色层级，必要变化明确说明并同内容对照。

新reading默认serif-report-bold：中文Noto Serif SC700＋西文Playfair Display700，均为真实静态实例。原serif-report仍使用DM Serif Text400＋Noto Serif SC600，不偷偷改变旧预设。DM Serif Text当前资源没有粗体；新粗标题因此显式采用Playfair，西文字形与换行必须复验。引擎按所选配置给.type-latin字重，font-synthesis:none防伪粗。标题中的日期/百分比保留标题字体，正文数字自然排列。数据表和图表文字启用lining-nums/tabular-nums，HTML、浏览器测量探针和SSR fontkit使用同一数字特性。混排西文优先回退中文家族，中文标点保留；页面语言需正确标记。

## 配置与继承

- serif-report-bold：新研究报告默认，Noto Serif SC700＋Playfair Display700标题；正文资源与旧版完全相同。
- serif-report：旧报告兼容选择，Noto Serif SC600 + DM Serif Text400标题；Noto Sans SC / Inter正文。
- serif-playfair：显式选择时以Playfair Display500替换英文标题；整份统一，不逐页混用。
- sans-presentation：新现场演示默认，标题改用Noto Sans SC / Inter600。字号仍需按场地和内容预算扩大，本预设本身不保证投影可读。
- legacy-system：系统字体兼容方案，QA标为LEGACY_NOT_LOCKED，不声称跨设备实际字形锁定或复刻任意旧稿。历史报告保留原文件，迁移新建输出并重验。

用户明确选择 > 项目已有记录 > 新报告媒介默认。配色变化不触发字体变化。记录typography_id/version/selection_basis/font_delivery；非法ID报错。自定义品牌字体必须补全资源与字重，不可只局部写死字体名。

## 固定资源与构建

assets/fonts/manifest.json记录固定上游提交、URL、SHA256、字重、体积和许可。资源为真实字重的WOFF2静态实例；Inter固定text光学尺寸14。CSS以Deck前缀别名引用，不通过local()调用本机可能不同的版本。

已交付HTML打开时不需要Node或Python。构建时：

```bash
npm ci
python3 -m venv .font-venv
.font-venv/bin/pip install -r scripts/requirements-fonts.txt
export FONT_PYTHON="$PWD/.font-venv/bin/python"
node scripts/apply_theme.cjs assets/deck_engine.html draft.html mckinsey serif-report-bold
# 替换内容、内联布局、安排图表之后
node scripts/pack_fonts.cjs draft.html deck.html serif-report-bold
```

源字体随skill提供，不需再下载。只补新增实例可运行`$FONT_PYTHON scripts/font_assets.py prepare noto-serif-sc-700 playfair-display-700`，按固定源SHA核对并保留其他文件。只有重建全部源资源才运行 `$FONT_PYTHON scripts/font_assets.py prepare`，再运行 `node scripts/sync_typography.cjs`；审核资源清单和版本后重建成稿，不手改生成的字体CSS/引擎配置快照。

pack按DOM/SVG文字、隐藏页、data-spec/data-opt及标准动态标记提取字符；保留完整ASCII以覆盖CSS大小写转换，保留字形布局特性、版权和许可；内嵌WOFF2子集及清单。标题和正文分别核对实际字体链覆盖，不能用正文支持的字形掩盖标题缺字；未覆盖的特殊符号需调整表达或完整扩展字体方案，不能静默回退。不求值任意JavaScript，额外动态字符通过 `pack(html,{profile,extraText})` 提供。改字必须重新打包，缺字/缺资源/哈希不符均拒绝。全字符主资源十余MB，逐稿子集以清单实测体积为准，不承诺固定压缩率。

## SVG与实际测量

ExhibitKit、ChartRuntime和render_echarts_svg输入均接受typography_id；浏览器先加载deck-typography.js。HTML比较表继承所在报告配置。SSR使用fontkit + 固定资源 + tnum测字宽；400/500/600及标题700分别匹配真实字重。ChartRuntime统一fontFamily及font简写，未提供的斜体会报错。容量预检仍含保守估算，不能替代最终浏览器字形边界验收。

SSR返回font_delivery: requires-embedding-in-host。SVG的text仍是文字，必须内联到同字体配置并已打包的HTML；不能将此SVG独立冒称字体自包含。独立SVG需另嵌字体并验收；不默认转轮廓，以保留检索、复制与可访问文字。

浏览器加载全部所需字重/字符后才初始化图表，window.deckReady为截图/打印/后续测量入口。动态更改文本需重打包和重建图表，不能仅触发CSS重绘。

SVG统一使用text-rendering:geometricPrecision，避免缩放时实际字形坐标偏离元素框；test_svg_scaling.cjs按三种窗口核对实际字形位置。静态实例保留上游字体内部名称，因此检查器可能显示Thin/ExtraLight；实际字重以资源OS/2、静态字形和CSS映射为准，并非使用细体冒充600。

## 验收与迁移

字体打包或测量代码改动时，按受影响范围运行typography/font_metrics/browser/svg_scaling测试；普通制稿只运行qa_deck和实际查看，不重复整库回归。QA同时检查角色字体链、实际平台字体身份与允许字重，不能只凭isCustomFont通过；另查标题行数、有效数据字号、PDF嵌入与字符映射、新页面冷缓存断网后的字体和几何一致性。字体检查器在导航前启用CDP，避免Chrome对file:内联SVG引用的观察器副作用，页面自身的控制台错误仍全部阻断。逐页截图与PDF目视仍必需。

build_typography_reference.cjs生成同内容的中文长判断、英文分析、混排财务表，包含legacy / DM / Playfair及新粗标题组合。字体变化重算标题和证据区，不缩数据字、不省略证据。不同系统的字形栅格化仍可能略有差别，不承诺跨环境逐像素相同。

设计依据：[DM Serif Text](https://github.com/google/fonts/tree/main/ofl/dmseriftext)、[Playfair Display](https://github.com/google/fonts/tree/main/ofl/playfairdisplay)、[Noto CJK](https://github.com/notofonts/noto-cjk)、[Inter](https://rsms.me/inter/)。最终资源身份以本地manifest固定提交为准。
