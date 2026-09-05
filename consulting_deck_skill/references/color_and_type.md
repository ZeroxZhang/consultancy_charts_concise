# 语义色与字体系统 · v3

以下色值是本项目可执行预设，不代表咨询公司的官方模板。借鉴深蓝/绿/红可以，
不能由公司名推导“密度排名”“必须画某种图”或官方字号。

## 六种角色，先选语义再选颜色

| 角色 | 默认token | 用法 | 不应混用 |
|---|---|---|---|
| 品牌/结构 | brand | 标题、表头、边界 | 不自动给所有系列 |
| 关键强调 | accent | 关键论据、注释 | 不改变实体登记 |
| 分类实体 | cat-1..6 | 无序实体，跨页一致 | 不表示排名/状态 |
| 顺序量值 | seq-1..5 | 同量尺低→高 | 缺失不等于零 |
| 数学偏差 | delta-negative/neutral/positive | 围绕0或目标，附+/- | 正数不自动好 |
| 经营评价 | good/risk/caution | 已定义指标的评价，附文字 | 不与分类混成同一图例 |

视觉规范必须提供实体登记表：`实体 | token | 可用图型 | 标签 | 例外`。
如果品牌红与风险红冲突：品牌保留标题结构，状态用文本/图形并调整专用色。
实体图的重点可用描边、编号箭头、局部底纹或直接文字，不必将实体改色。
一个图可有多于4种类别色，但先测试是否可用分面/直接标签减少识别负担。
不设颜色硬配额；禁止颜色没有图例或语义。灰色可表示背景/基准/未选择，不笼统等于“不重要”。

## 三套独立预设与唯一色值源

具体色值统一从 `assets/deck-themes.js` 读取，不手工复制旧色值。
品牌依据、完整设计表和三套差异见 `theme_research.md`。McKinsey 默认；BCG强调深绿；Accenture强调深紫。
所有主题分析页白底；亮色accent-vivid只限非文字点缀，不用于白字底色或关键细线。
BCG品牌绿不表示利好；独立状态列使用good专用深蓝和“达标/改善”等文字。

```js
const themes = require('./assets/deck-themes.js');
const theme = themes.get('bcg'); // 缺失默认麦肯锡，非法ID抛错
const palette = themes.palette(theme.id);
const svg = kit.heatmap({ ...spec, palette });
const css = themes.css(theme.id);
```

CSS角色：brand/accent/on-brand/on-accent、ink/gray-1..4/page-bg、surface/selected；
cat-1..6分类、seq-1..5连续量、delta-negative/neutral/positive数学偏差；good/risk/caution经营状态。
兼容pos/neg/warn仅指经营状态，瀑布正负必须用delta角色。
ECharts优先通过`data-recipe` + `data-spec`调用标准配方；未封装类型才用`data-opt`原生option。
两条路径都可使用 `"color":["@cat-1","@cat-2"]`、`"itemStyle":{"color":"@accent"}`；
引擎递归解析为当前CSS值，未知角色报错。visualMap同样使用@seq-1..5，且给出量尺上下限。
SVG组件传入themes.palette(theme_id)，热力图按seq插值并计算文字反差；任意自画SVG也从palette或CSS变量取色。
实体登记存索引/token，不只存HEX。同一图内类别与状态分开图例/列，保留标签、符号或线型。
静态SVG已经固化fill：换主题必须重生成，单独替换CSS不足以完成切换。
`apply_theme.cjs`只负责引擎起始主题；完整可复现样稿用build_reference_deck。

## 层级与可读性

1280×720 reading默认：标题28–32px、模块标题18–20、正文16–18、数据/标签14–16、Source12。
presentation需更大字号并按实际场地检查。字号是逻辑像素，不冒称PowerPoint点数。
≤2字体家族；中文系统黑体，西文和数字Arial；表格数字右对齐且tabular-nums。
标题最多两行，按实际测量换行，不强行用20中文字截断完整判断。
普通文字对背景至少4.5:1，浅灰只用辅助线/底纹；正文和来源不使用#8A9199对白底。
颜色、大小、字重、位置一起建立层级；不要用所有内容加粗消除层次。

## 验收

原尺寸、缩略图、灰度均查看。比较对焦关键点、实体识别、状态解释、来源可读性。
单独保留不依赖颜色的标签、+/-、线型或状态文字。完整信息必须在静态打印中保留。
