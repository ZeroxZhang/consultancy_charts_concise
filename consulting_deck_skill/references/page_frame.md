# 标题分区与轻量页边识别

目标是整套页面有一致的完成度，同时让结论、关键数字和证据保持视觉优先。默认 quiet 母版使用浅中性细线、左缘短标与右下小折角；色彩来自 gray-2 与页面底色，独立于数据的 accent、类别和风险色。

## 随正文选择边界

| 页面情况 | 建议属性 | 处理 |
|---|---|---|
| 标题之后需要清楚的分区 | `data-frame-boundary="line"` | 在标题组与正文留白中放 1px 淡线 |
| 正文首排模块已有承担分区的顶线 | `data-frame-boundary="integrated"` | 省去额外标题线，保留正文顶线 |
| 全幅图、密集页或留白已足够 | `data-frame-boundary="space"` | 仅保留页边识别 |
| 封面有独立视觉、全出血或其他不适合母版的页面 | `data-frame="off"` | 关闭本页母版装饰 |

integrated 是作者对正文结构的判断，不由程序扫描任意横线推断。图表坐标轴、网格线和数据连线服务数据，不能拿来充当页面边界。封面、章节页沿用同一轻重关系；已有品牌母题时可以关闭页边标记，不额外叠加装饰。

**每页必须显式声明边界**：`data-frame-boundary` 是页面契约的一部分，不留静默默认值。制作时逐页写入 line / integrated / space（封面与全出血页用 `data-frame="off"` 关闭装饰，同时声明 `data-frame-boundary="space"`；off不是boundary的替代字段）；不写就按 line 渲染的静默行为会造成「标题线 + 正文首排顶线」双层边界或线贴内容的观感问题，属于视觉缺陷而非母版选项。

这些是选择工具，不要求每页同样的线条数量；无新增评分、审批或固定模板要求。

## 写入页面

`apply_theme.cjs` 和参考稿构建器已接入母版。新增内容页显式组织标题组与空装饰节点；自由版式可自行实现等效结构：

```html
<section class="slide reading" data-frame-boundary="line">
  <div class="slide__frame" aria-hidden="true"></div>
  <div class="slide__tracker">章节名称</div>
  <header class="slide__header">
    <h1 class="slide__title">本页主判断</h1>
    <p class="slide__lead">必要范围或解释</p>
  </header>
  <div class="slide__body">正文与展品</div>
  <div class="source">来源与边界</div>
  <div class="slide__page">01</div>
</section>
```

标题容器不增加固定高度，细线放在已有间距中；页边元素绝对定位、隐藏于辅助技术且不接收点击。采用独立节点，不占用作者的 slide 伪元素。`apply_frame.cjs` 只注入样式并保留全局 quiet/off 选择，不自动重组旧稿或判断正文。

旧稿先显式加入相应容器，再用 `node scripts/apply_frame.cjs draft.html framed.html` 注入独立样式。该步骤应在 QA 和正式打包之前；改过母版的 HTML 必须重建同版 PDF。

## 适配尺寸与颜色

唯一 CSS 源是 `assets/deck-frame.css`。调整后运行 `node scripts/sync_frame.cjs` 更新源引擎；构建器会再次内联最新 CSS，交付无需额外文件或运行时脚本。

- `--frame-rule` / `--frame-mark`：默认中性灰分别以 24% / 42% 与页面底色混合。可按品牌和实看结果调整；避免与内容重点形成同等信号。
- `--frame-rule-offset`：线相对标题容器底部的位置，默认 −7px，reading 为 −8px。对应正文 margin-top 为 14/16px。配对公式：线下方到正文首排的留白 = 正文 margin-top − offset 绝对值（16−8=8px）。若压小正文 margin-top，必须同步减小 offset，否则标题线会贴到正文首排顶线上；反过来只调 offset 不动 margin 会把线挤进正文。自定义页若副题自身已有下边距，可改为正值把线放回这段留白。
- `--frame-mark-top`、`--frame-mark-width/height`：默认顶边28px、3×40px，reading 顶边32px；跟随具体页面边距调整。
- `--frame-corner-right/bottom/size`：默认10px / 18px / 12px。角标留在页码、来源和展品之外；窄边距或全出血可以直接关闭。

全局 `<html data-frame="off">` 可关闭母版，单页 `data-frame="quiet"` 可重新启用。边界 integrated/space 在该页继续生效。页码保留普通辅助文字样式，母版不提升其色彩或字重。

## 检查与交付

在正常阅读尺寸与分页 PDF 中看标题、副题、首排展品和页角：线不穿内容、双层边界不重复、装饰不抢眼即可。标题行数、图型与页边距改变时重新看受影响页面。浅装饰在灰度或低质量打印中变淡可以接受，信息层级仍应由标题、留白和正文自身成立。

视觉合规另有三项与组件相关的目视项，自动检查只能提示、不能替代：

1. **每页 boundary 显式声明**：内容页没有 `data-frame-boundary` 属性视为未完成母版选择，qa_deck 会告警。
2. **装饰边条禁用**：`.annotation`、`.takeaway`及同类注释/判断块不得带侧边色条，`.kpi-card`及同类数字卡不得带顶部色条；自定义类、伪元素、阴影、渐变及SVG同样适用。去掉边条后按内容重排，不保留巨大空框。v9.3.2的“左3px＋12px内边距”仅为历史契约，现已由此禁令替代。数据线、必要结构分隔与quiet母版不属于禁用模块。
3. **首排顶线合并**：正文首排已有必要结构分隔线（如全宽表格上边）时用 integrated 省去标题线；出现「灰线紧贴正文顶线」的双线即边界选择或 margin/offset 配对错误。不得为使用integrated新增禁用的装饰色条。

日常制稿复用成稿 QA；修改母版实现才跑 `test_frame.cjs`，改源引擎或示例同时跑 `test_engine.cjs`。不因为增加装饰而要求整套图表/框架回归。
