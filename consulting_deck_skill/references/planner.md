# 独立选型：planner 接入

S4 需要实质选型时读。读完要能：判断这次该不该调用 planner、把任务完整交出去、把结果正确接回制作，并知道哪些检查不能省。

`echarts-viz-planner` 是独立维护的选型模块。本文件只约定 deck 上下文、加载与接回；输出字段语义以实际加载到的 planner 自身契约为准。

## 什么时候值得选型，什么时候直接做

混合材料、复杂比较、图表与表格取舍、机制与数字组合，或现有表达无法承担本页证明任务时，需要实质选型。

已明确图型的实现、简单查数与文字编辑、成熟页面复用**直接制作，不重复选型**。不为走流程调用 planner，也不为遵循流程增加固定代理。

可独立判断的问题且当前允许委派时交给子代理，否则主会话读取同一 planner 执行；按独立问题或相关页面组分派，给相邻论证上下文，任务较小只派一个。**全篇节奏、页面排布与实体语义由主会话统一。**

S3 的骨架提供方向，但仍可被证据质疑。先提出页面要显露的关系与空间需求，规格再进入[整页创作](page_design.md)；不能只把局部展品与说明拼接、自然高度贴顶就当页面完成。

## 加载

从本技能实际目录执行（其他工作目录用脚本绝对路径）：

```bash
node scripts/load_viz_planner.cjs
node scripts/load_viz_planner.cjs --planner /path/to/echarts-viz-planner --cache-dir /path/to/cache --offline
```

加载器依次检查显式路径（也支持 `ECHARTS_VIZ_PLANNER_PATH`）、本地常见技能目录、与锁文件一致的缓存、随本技能分发的解包快照。**本地安装、缓存与随包快照都可直接使用**，离线环境通常也能跑起来，不要求新开会话或全局注册。

缓存里的技能尚未进入工具的技能目录时，直接读取返回路径的 `SKILL.md` 及其相对引用即可在当前任务执行；**不要只在提示里写技能名而不读取它**。`ok` 返回 `skill_root`、`skill_file`、来源与契约信息。加载器只准备可读资源，**不会自动创建子代理、也不会完成选型**。

没有可用资源且允许联网时，从[官方仓库](https://github.com/ZeroxZhang/echarts-viz-planner)下载**完整仓库**再交给 `--planner` 校验——目录、契约、schema 与脚本都是运行依赖，**只下载 `SKILL.md` 不够**。记录实际提交与返回的 `source_sha256`，不要只记"最新版"；同一任务已有下载目录就复用。**不能靠降低契约版本、跳过校验或改锁文件把不兼容源码冒充可用依赖。**

## 交接

给足证据上下文，不要先把所有文件压成几条摘要；大型输入用文件与原文定位，给必要明细入口。

```yaml
mode: api
contract_version: "1.1"
output_level: decision
data:
  file: /absolute/path/analysed-data.json
  sha256: 实际输入文件 SHA256
  transform_policy: propose
goal: 让读者看清当前页面需要完成的比较或判断
questions: [本次需要解决的视觉问题]
scenario: executive
target_carrier: web
context:
  reader_task: 决策或研究用途、阅读方式、相邻论证
  findings: [已完成发现及结论类型，必要时给文件定位]
  evidence_refs: [原文页/表/段与数据版本定位]
  boundaries: [分母与期间，反证、缺口、允许表达范围]
constraints:
  static: true
  offline: true
  size: {width: 1080, height: 440}
  allow_extensions: false
  allow_3d: false
  runtime: {echarts: "6.1.0", renderer: svg, available_dependencies: []}
composition: false
```

尺寸必须换成页面实际正文区域；主题、字体、跨图实体色与必要模块数在 context/constraints 传实际约束，品牌 token 读本技能配置。`target_carrier: web` 只表示 HTML 宿主，静态与离线要求由 constraints 表达；`composition` 按证明任务开启，不把默认模块数变成整份报告的上限。

原始文件只读，标准结果由主会话统一维护。`transform_policy: propose` 让 planner 给出排序、聚合、派生建议，主会话核对后落实到一份可复算数据；**不能为配色合并"其他"，不能把缺失填 0**，已分析过的结果不重复清洗或换算。

## 接回

子代理输出一个或按独立任务输出数个 plan JSON；主结果保持轻量，复杂规格可用 `spec_ref` 指向同任务目录下的 JSON，相对路径以 plan 所在目录解析，移动底稿时一并保留。用实际加载技能的校验器校验：

```bash
python3 /resolved/planner/scripts/validate_plan.py /absolute/path/plan.json --schema
```

检查已解析的规格与证据，**不只读一句 summary**；主会话采纳或作有依据的调整，复用该结果进入制作，不另建一套候选评分。普通页可只保留 plan 引用与必要制作决定，复杂页才展开实际几何与容量。

| 返回内容 | 主会话的用途 |
|---|---|
| capability_id、rationale、alternatives | 理解选型与有实质意义的取舍；目录 ID 不是图示创作上限 |
| spec / spec_ref | 数值图的映射与比较口径、表格列与行组织、图示结构与关系语义 |
| bindings、transforms | 核对真实来源、注入目标与统一数据版本；不能只往 dataset.source 塞全部数据 |
| assumptions、open_questions、risks | 判断哪些影响表达与结论；主会话决定补分析或收窄结论 |
| verify_hints、carrier_adaptation | 制作后检查标签、尺度、关系、静态内容与打印 |
| status = ok | 可进入制作规格，仍需检查证据、绑定与最终可读性 |
| ok_with_assumptions | 判断假设影响；高影响问题先补证或收窄，不能只在脚注披露后沿用确定结论 |
| insufficient_data | 按 missing 补受影响数据，或交付清楚的未知；不重复无关研究 |
| unsupported | 转专用 SVG/HTML 或其他适用能力；保持读者任务与证据边界 |
| policy_blocked | 核实依赖与约束，选择保留意图的替代；不能把缺失依赖称为图型不受支持 |

**decision 输出不是已执行代码。** 表格用 HTML/CSS；机制、旅程、战略屋、鱼骨等按语义规格用专用 SVG 或其他合适路径；数值图可用 ECharts、ExhibitKit 或自定义实现。custom 需要函数时由作者实现并验证，**不把 JSON 里的函数字符串当成已可运行对象**。数据绑定落实后按 S4–S5 的静态 SVG、字体打包、截图与 PDF 流程制作；planner 默认的网页渲染壳不是 deck 引擎。

**子代理 api 零提问不代表问题都已解决**：`open_questions.blocking:false` 只说明它不会等待用户回答，主会话仍承担方向与数据责任。**参与选型的代理不能算该稿的独立复核。**

## 数据版本链

使用 planner 时在 `task.json` 写（字段定义见[交付契约](delivery.md)）：

```json
{"planner":{"mode":"used","record":"deck.html.page-spec.json","sha256":"实际记录文件 SHA256"}}
```

record 相对 `task.json` 解析，装配器转换为相对输出 HTML 的路径并校验实际摘要。记录里的 `plan.data.ref.id` 指向本地冻结数据文件（相对 plan 位置解析），`plan.data.sha256` 是规划时的实际文件摘要，两者与 record 的数据摘要**三方一致**。外部引用或多源材料先按原始结构冻结为一个可追溯输入；**不要修改数据后只刷新 record 哈希就复用旧 plan**；数据或 plan 变化后先重核对应关系，再更新 record 与 task，然后重装配、重 QA、重审查，**新 audit 不自动继承旧审查**。

`mode` 取 direct / used / unavailable：直接制作写 `direct`；资源确实不可用写 `unavailable` 并给 reason 与实际替代路径。**加载成功但未规划不算 used**；实际采用过 planner 也不能填 `direct` 规避版本链。不能只保存加载路径，也不能漏交 record 让 QA 误当未使用。

## 加载成功不等于成稿成功

加载成功、plan 合法、组件存在，**都不等于成稿成功**。选型只解决"用什么表达"，不解决材料、全篇与整页；校验器通过不代替选型质量，成功解包不代替实际调用。资源确实无法取得时，用已有分析与制作能力完成能成立的部分，记录未调用 planner 及实际限制——不因"未安装"省掉本应执行的选型，也不因加载失败向用户重复询问已给过的业务信息。
