# 可视化专家协作 · V10

S4–S5按需读取。`echarts-viz-planner`是独立维护的选型模块；本文件只约定deck上下文、加载与接回方式。通用输出字段及语义以实际加载的planner `references/api-contract.md`为准。

## 何时选型与委派

混合材料、复杂比较、图表/表格取舍、机制与数字组合、现有表达无法承担证明任务时，需要实质选型。可独立的问题且当前允许委派时交给子代理，否则主会话读取同一planner执行；不为遵循流程增加固定代理。S3的骨架提供方向但仍可被证据质疑。探索任务可在S2按需调用，探索建议经分析确认后才进入报告。

按可独立判断的问题或相关页面组分派，给相邻论证上下文；任务较小只派一个。全篇节奏、页面排布与实体语义由主会话统一。先提出页面要显露的关系和空间需求，planner规格再进入[整页创作](slide_anatomy.md)；不能只把局部展品与说明拼接、自然高度贴顶就当页面完成。已明确图型的实现、简单查数/文字编辑与成熟页面复用直接制作，不重复选型。

## 加载：只装主技能也能运行

从本技能实际目录执行（其他工作目录使用脚本绝对路径）：

```bash
node scripts/load_viz_planner.cjs
# 显式位置、私有缓存或离线环境按需指定
node scripts/load_viz_planner.cjs --planner /path/to/echarts-viz-planner --cache-dir /path/to/cache --offline
```

加载器优先检查显式路径（也支持`ECHARTS_VIZ_PLANNER_PATH`）、本地常见技能目录，再检查与锁文件一致的缓存、解包随本技能分发的快照。仅当快照文件缺失、锁文件提供可获取的固定revision且允许联网时，才自动获取固定版本源码；没有固定revision不会自动下载仓库HEAD，损坏快照也不会被网络静默替换。相容性要求契约1.1、decision输出、ECharts6.1.0及完整运行资源清单，旧安装跳过并在`attempts`中给理由，不覆盖原安装。

快照是从独立仓库生成的分发产物，源码只维护一处。目录缓存按内容寻址；解包、复用均核对完整性。快照存在时首次调用无需网络，不写全局技能注册配置，不要求新开会话或出现第二个斜杠命令。缓存中技能尚未进入工具的技能目录时，代理直接读取返回路径的`SKILL.md`及其相对引用，即可在当前任务执行；不要只在提示里写技能名而不读取它。

`ok`返回`skill_root`、`skill_file`、来源与契约信息。将这个绝对路径交给子代理，模板见`assets/subagent_prompts.md`的V任务。加载器只准备可读技能资源，**不会自动创建子代理或完成选型**。

`unavailable`/`incompatible`返回原因和下一步，主会话先按下节尝试可行的获取/恢复路径，不因“未安装”就省去本应执行的选型。确实无法取得兼容资源时，用已有分析和制作能力完成可成立的部分，记录未调用planner及实际限制。无文件工具时使用当前已加载资源；没有任何planner资源就不能声称已调用它。不因加载失败向用户重复询问已给过的业务信息。

## 本地未安装时：官方仓库与在线获取

独立技能的官方来源是 [ZeroxZhang/echarts-viz-planner](https://github.com/ZeroxZhang/echarts-viz-planner)。已有可用缓存或随包快照时可直接执行，尤其在离线环境；需要独立下载版，或本地、缓存和随包资源均不可用且允许联网时，先下载完整仓库，再校验加载。不要只下载`SKILL.md`，其目录、契约、schema和脚本属于运行依赖。

以下命令从本主技能目录执行，将源码放入任务可用的缓存目录，不修改已有安装；同一任务已有下载目录时直接复用并校验，无须反复下载：

```bash
planner_base="${CONSULTING_DECK_CACHE_DIR:-$HOME/.cache/consulting-deck-skill}/external"
mkdir -p "$planner_base"
planner_source="$(mktemp -d "$planner_base/echarts-viz-planner.XXXXXX")"
git clone --depth 1 https://github.com/ZeroxZhang/echarts-viz-planner.git "$planner_source"
git -C "$planner_source" rev-parse HEAD
node scripts/load_viz_planner.cjs --planner "$planner_source"
```

也可从官方仓库下载完整源码压缩包，解压后将含`SKILL.md`的仓库根目录传给`--planner`。记录实际提交或版本及加载器返回的`source_sha256`，不要仅记录“最新版”。这只是当前任务的源码准备，不要求全局安装、注册技能或重启会话。

根据返回结果继续：

- `status: ok`且`origin: explicit`：下载版通过校验，主会话/子代理读取返回的`skill_file`及相关资源后执行。
- `status: ok`但`origin`为`installed`、`cache`或`bundled-snapshot`等其他来源：实际采用了其他可用版本；检查`attempts`中下载路径的原因，准确记录回退来源。
- 下载失败、返回`unavailable`/`incompatible`或下载版较旧：保留兼容缓存/随包快照，或恢复主技能完整分发包；资源均不可用时说明未调用planner。不能通过降低契约版本、跳过校验或更改锁文件把不兼容源码冒充可用依赖。

在线HEAD与随包快照可能处于不同发布状态，不能假定最新下载必然支持主技能要求。主技能维护者更新依赖时，应先在独立仓库发布兼容提交，再同步bundle与lock，才能让自动固定版本获取可复现。

## 主会话交接

提供足够证据上下文，不先将所有文件压缩成几条摘要。大型输入用文件与原文定位，给必要明细入口；子代理可以检查选型前提，不重做无关研究。

```yaml
mode: api
contract_version: "1.1"
output_level: decision
data:
  file: /absolute/path/analysed-data.json
  sha256: 实际输入文件SHA256
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

以上尺寸只是示例，必须替换为页面实际正文区域；主题、字体、跨图实体色与必要模块数在context/constraints中传实际约束，品牌token读取本技能配置。`target_carrier: web`仅表示HTML宿主，静态/离线要求由constraints表达。依赖按当前制作环境填写；需要扩展时可以落实依赖并复验，也可以选择保留表达意图的现有实现。`composition`按证明任务开启，不把默认模块数变为整份报告上限。

原始文件只读，标准结果由主会话统一维护。`transform_policy: propose`让planner给出排序、聚合、派生等建议；主会话核对并落实到一份可复算数据。不能为配色合并“其他”，不能把缺失填0；已分析过的结果不重复清洗或换算。

## 接回与制作

子代理输出一个或按独立任务输出数个plan JSON；主结果保持轻量，复杂规格可用`spec_ref`指向同任务目录下的JSON文件。相对路径以plan所在目录解析，移动底稿时一并保留。调用实际加载技能的校验器：

```bash
python3 /resolved/planner/scripts/validate_plan.py /absolute/path/plan.json --schema
```

落地执行记录使用本地冻结文件：plan.data.ref.id指向该文件（相对plan位置解析），plan.data.sha256保留规划时的实际文件SHA256，并与page_spec的record.data三方一致。外部引用或多源材料先按原始结构冻结为一个可追溯输入；不要修改数据后仅刷新record哈希而复用旧plan。

检查已解析的规格与证据，不只读一句summary。主会话采纳或作有依据的调整，复用该结果进入page_plan/page_spec，不另建一套候选评分。普通页可只保留plan引用和必要制作决定；复杂页展开实际几何和容量。

| 返回内容 | 主会话的用途 |
|---|---|
| capability_id、rationale、alternatives | 理解选型与有实质意义的取舍；目录ID不是图示创作上限 |
| spec / spec_ref | 数值图的映射与比较口径、表格列与行组织、图示结构与关系语义 |
| bindings、transforms | 核对真实来源、注入目标与统一数据版本；不能只向dataset.source塞全部数据 |
| assumptions、open_questions、risks | 判断哪些影响表达与结论；主会话决定补分析或收窄结论 |
| verify_hints、carrier_adaptation | 制作后检查标签、尺度、关系、静态内容及打印 |

decision输出不是已执行代码。表格使用HTML/CSS；机制、旅程、战略屋、鱼骨等按语义规格用专用SVG或其他合适路径；数值图可用ECharts、ExhibitKit或自定义实现。custom需要函数时由作者实现并验证，不把JSON里的函数字符串当成已可运行对象。所有数据绑定落实后，按现有S6静态SVG、字体打包、截图与PDF流程制作；planner默认网页渲染壳不作为deck引擎。

| status | 接回处理 |
|---|---|
| ok | 可以进入制作规格，仍需检查证据、绑定与最终可读性 |
| ok_with_assumptions | 判断假设影响；高影响问题先补证或收窄，不能只在脚注披露后沿用确定结论 |
| insufficient_data | 根据missing补受影响数据，或交付清楚的未知；不重复无关研究 |
| unsupported | 转专用SVG/HTML或其他适用能力；保持读者任务与证据边界 |
| policy_blocked | 核实依赖/约束，选择保留意图的替代；不能将缺失依赖称为图型不受支持 |

子代理api零提问不代表问题都已解决；`open_questions.blocking:false`仅描述子代理不会等待用户回答。主会话仍承担方向与数据责任。参与选型的代理不能算该稿独立QA。

## 更新与验证

在独立planner源目录修改与验证后，用主技能脚本重建分发快照：

```bash
node scripts/pack_viz_planner.cjs --source /path/to/echarts-viz-planner --output-dir dependencies
node scripts/test_viz_planner_loader.cjs
```

锁文件记录实际内容与源提交；本地未发布改动标记为工作树快照，不能把旧GitHub HEAD当成新增能力已发布。更新时同步生成bundle和lock，不手工编辑压缩文件或复制一份独立维护的源码。运行包的ECharts/字体/母版版本独立，不因流程版本变化而升级依赖。

planner的`capabilities.json.required_files`声明完整运行资源；增删运行文件时在独立源目录同步该清单。加载与打包都会检查，防止缺少目录或模板的残缺安装抢先挡住完整快照。

接入规则或契约改变时，用真实代理做前向选型，并制作代表性的数值、表格/机制、复杂绑定页面。校验器通过不代替选型质量，成功解包不代替实际调用；最终沿用S7–S8作者复核、独立看图与同版交付检查。常规制稿只检查受影响成稿，不重复加载器和整套组件回归。

## V11成稿接回

在既有page_spec记录同一数据/plan版本及实际图元关系，保存为deck.html.page-spec.json可被QA自动核对；接口见 [visual_reliability.md](visual_reliability.md)。load/plan/implement分别记录，加载成功不能算已选型，计划schema与图元存在不能算关系已经视觉验收。无子代理时主会话读取同一资源、实际规划、校验并落实。流程、机制、责任/旅程与条件的检索卡维护在独立源，主技能自动布局见 [diagram_layouts.md](diagram_layouts.md)。

## V11.2显式任务绑定

使用planner时task.json写`planner:{"mode":"used","record":"deck.html.page-spec.json","sha256":"实际记录文件SHA256"}`；record相对task.json，装配器转换为相对输出HTML并校验实际摘要。记录结构沿用[视觉可靠性](visual_reliability.md)的data/planner/plans/pages；plan.data.ref与record.data指向同一冻结数据、三方摘要一致。不能只保存加载路径，也不能漏交record后让QA误当未使用。

直接制作写mode=direct；资源确实不可用写mode=unavailable并给reason与实际替代路径。加载成功但未规划不算used，实际采用过planner也不能填direct规避版本链。数据或plan变化后先重核对应关系，再更新record/task并重装配、QA及审查；新audit不自动继承旧审查。审查采用schemaVersion 3真实双媒介证据，风险要求由task决定，详见[交付契约](delivery_system.md)。
