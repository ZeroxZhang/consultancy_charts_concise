# HTML + PDF 交付系统

本参考只处理定稿后的交付，不改变分析、storyline、页面规格、图表或字体生成方法。

## 正式交付契约

- 默认交付同名的 `<报告名>.html` 与 `<报告名>.pdf`。
- PDF 是经 S7 验收的定稿快照，一张 slide 对应一页，尺寸继承 HTML 的 16:9 或 4:3；不改排为 A4。
- HTML 内嵌该 PDF 的原始字节。“下载分页 PDF”按钮离线可用，下载结果必须与独立 PDF 的 SHA-256 完全一致。
- HTML 同时保留“打印 / 另存 PDF”入口。它调用浏览器打印，仅用于临时打印；正式归档与转发使用随附 PDF。
- 导出控件不进入 PDF。打开 HTML 不需要 Node、Playwright、字体安装或网络。

内嵌采用 base64，通常会让 HTML 增加约 `PDF 字节 × 4/3`。这是标准交付的可接受成本；用户明确提出文件大小上限时，才交付不内嵌 PDF 的轻量 HTML，并说明其中只有浏览器打印入口。

## 定稿顺序

1. 完成内容、图表和字体打包，得到最终待验收 HTML。
2. 运行 `qa_deck.cjs`，它基于该 HTML 生成 `renders/deck.pdf`、逐页截图和 `audit.json`。
3. 完成逐页图片与 PDF 目视验收，修清 Blocking/Major；任何 HTML 修改都返回第 2 步。
4. 用同一份 HTML 和刚验收的 PDF 运行交付打包：

```bash
node scripts/package_delivery.cjs deck.html renders/deck.pdf delivery 报告名
```

输出为 `delivery/报告名.html` 和 `delivery/报告名.pdf`。默认拒绝覆盖已有交付；确认替换同名文件时添加 `--force`。

`package_delivery.cjs`默认读取 PDF 同目录的 `audit.json`，核对 S7 记录的 HTML/PDF 路径、页数和 SHA-256。缺少审计、工程验收未通过、任一文件在验收后变化、输入不是 PDF、HTML 没有 slide、HTML/PDF 页数不同或输出会覆盖输入时均拒绝打包。脚本在写出前再次核对内嵌字节，并报告页数、体积和 PDF SHA-256。

## 交付验收

- 独立 PDF 页数等于 `.slide` 数量，页序、尺寸、背景、字体、关键图表与标签正确。
- PDF 字体已嵌入、文字可检索；`qa_deck.cjs` 的工程状态通过，且逐页截图和 PDF 已实际目视。
- 断网从任意本地目录打开交付 HTML，“下载分页 PDF”可见且可用。
- 下载文件名与独立 PDF 一致，下载内容与独立 PDF 逐字节一致。
- 下载前后保持当前页、URL hash、总览和全屏状态；按钮不触发翻页。
- PDF 控件在打印媒介隐藏；取消浏览器打印后恢复原页面状态。

打包后的 PDF 是定稿快照。若之后修改 HTML 的正文、数据、主题、字体或页序，必须重新生成、验收并打包 PDF；不能把旧 PDF 留在新 HTML 中。
