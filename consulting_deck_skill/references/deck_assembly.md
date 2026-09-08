# 自由页面的静态装配入口

作者只写 `pages.html`：每页一个完整的顶层 `<section class="slide reading" data-frame-boundary="integrated">…</section>`，可以自由使用HTML、表格、内联SVG和自己的布局CSS。示例中的reading与integrated是作者选择，需按实际页面确定；片段可含`style`，也可另给CSS文件。不要复制引擎，不需要逐一替换七页示例。

```sh
node scripts/assemble_deck.cjs pages.html deck.html \
  --css page.css --title "报告标题" --kind fragment \
  --theme mckinsey --typography serif-report-bold
node scripts/qa_deck.cjs deck.html renders
```

可选项：`--css`、`--title`、`--kind fragment|report|collection`、`--theme`、`--typography`、`--ratio 16x9|4x3`。默认fragment、McKinsey、serif-report-bold、16:9。`report`只是声明，封面/参考资料/封底仍由作者按首尾规则提供，不自动补页。`legacy-system`不能提供嵌入字体，静态自包含入口明确拒绝。

装配器用Chromium解析HTML/SVG，验证独立页结构后替换现有引擎唯一`#stage`；保留引擎导航、缩放、深链、打印和已验收PDF下载接口。它只补缺失的母版节点，每页必须由作者显式选择合法的`data-frame-boundary="line|integrated|space"`；首尾页可用`data-frame="off"`配合`space`。缺失或非法边界会失败，不自动选择横线。作者声明reading则保留；没有reading则保留现有引擎的presentation模式，不从字体预设推断模式。作者CSS置于公共默认样式之后，任意页构图、信息密度和图型仍由作者决定。

主题、公共布局、共享几何、母版和字体均通过现有`apply_theme.cjs`装配（其中已调用`pack_fonts.cjs`），未建立第二份样式实现。仅对静态路线去除不使用的ECharts/在线图标加载器；正文的中文、西文和内联SVG文字进入最终字体子集。构建需要与QA相同的Playwright/Chrome、Python/fontTools及本地字体资产；可设置`PLAYWRIGHT_MODULE`、`CHROME_CHANNEL`、`FONT_PYTHON`使用已配置运行时。

当前入口只接静态HTML/内联SVG。Canvas、`.chart`、`data-opt/data-recipe`、作者脚本和事件处理器、外部图片/样式/字体等会明确失败。动态图表先沿已有`render_echarts_svg.cjs`等入口渲染为内联SVG，或继续原动态装配流程；不自动猜测选项或丢弃图形。内嵌raster图片使用base64 data URL；SVG直接内联以继承报告字体。CSS中的外部URL和`@import`须先内联，普通来源超链接可保留。重复/引擎保留ID、嵌套slide、未闭合section、完整HTML输入也会失败。

API：`await assemble({pagesFile, outputFile, cssFile?, title?, kind?, theme?, typography?, ratio?})`。成功返回`{status:"assembled", output, pages, theme, typography, kind, ratio, sha256, route:"static-html-svg"}`；失败不写输出。装配器实际运行原引擎、等待字体和遍历每页，拒绝运行错误及外部请求；它不计算数据、排查视觉碰撞或宣称最终PDF已经通过。随后继续成稿QA与实际看图；`package_delivery.cjs`负责将已验收PDF接入下载按钮。

`test_assemble_deck.cjs`用四页合成片段验证：七页示例已移除、布局/母版/字体内联、离线无请求/错误、#3及总览/翻页正常、实际PDF四页且标题与SVG文字可提取；作者模式/合法边界保留，缺失或非法边界明确失败，Chrome启动失败仍清理临时目录。测试不使用或补做跨模型实验的未完成片段。
