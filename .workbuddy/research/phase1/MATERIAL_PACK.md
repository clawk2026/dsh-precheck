# DeepSeek Harness 生态调研 · Phase 1 结构化素材包

- 整理人：深度调研专家团 信息搜集专员「查文渊」（接续收尾任务）
- 任务定位：**基于上一位同事已落盘的一手素材整理回传，不重新抓取**；不含战略结论、不含优化建议（属 Phase 2/3）
- 统一抓取时间：**2026-11-10**（下称「抓取日」，取自工作记录 jsonl 时间戳与各文件 mtime）
- 素材根目录：`/Users/zxc/工作/AI/AIs/Github/zhuanqiancha/dsh-precheck/.workbuddy/research/phase1/`
- 上一位同事工作记录：`/Users/zxc/.workbuddy/projects/Users-zxc-工作-AI-AIs-Github-zhuanqiancha-dsh-precheck/f686d838-8d40-4f2d-ac24-13616a20f493/subagents/agent-36214829-a95c-4803-b27f-a999de73aa5a.jsonl`（163 行，1.1 MB；含已核实 URL、curl 原始输出与阶段性结论）
- 来源规模：落盘可核实独立来源 52 条（外部 URL 去重后）；本包 E 段精选 **40 条** 入索引，≥20 条要求已满足，故未触发额外联网补齐（用户【必做】2 的前置条件为「不足 20 条」）
- 证据分级标签：**【官方披露】**（官方仓库/文档/公告）、**【第三方统计】**（GitHub/npm API 原始返回、媒体）、**【本地缓存】**（抓取日落盘文件）、**【用户给定背景】**（委托方提供，非本次抓取）
- 纪律声明：所有数字均可追溯到具体文件/来源编号；无编造 URL、数字、引文；查不到写「未找到」；原文摘录一律不改写。

---

## A. 名词核实结论

**DeepSeek Harness（`dsh`）是什么**： DeepSeek AI 开发的开源 agent harness（智能体运行框架），核心设计为「一切皆插件」（everything-is-a-plugin），由 Cordis 驱动，其设计参见论文 *A Programming Paradigm for Spatiotemporal Composability*（arxiv.org/abs/2608.25512）。【官方披露 / 本地缓存：S01、S02、S11】

> 原文：「DeepSeek Harness (`dsh`) is an open-source agent harness developed by DeepSeek AI.」「It is built on an **everything-is-a-plugin** architecture and powered by Cordis」（S01, dsh-README.md L5–L7）

**官方仓库与定位**：`https://github.com/deepseek-ai/deepseek-harness`，仓库描述 `DeepSeek Harness: Everything is a Plugin.`，主语言 TypeScript，默认分支 `master`。文档站 `https://deepseek-harness.github.io/deepseek-harness/`。npm 包 `@deepseek-ai/dsh`（`npx @deepseek-ai/dsh web`，默认在 `http://127.0.0.1:3080` 启动 Web UI）。【官方披露 / 第三方统计：S01、S14、S16】

**许可证**：**MIT**。README、SAFETY.md、根 `package.json`（`@deepseek-ai/dsh-root` 0.2.2-rc.1）、GitHub API `license=MIT`、npm registry 顶层 `license=MIT` 五处一致。【官方披露 / 第三方统计：S01、S03、S14、S15、S16】
- 存疑点：npm registry 元数据中**最早版本 0.0.1-rc.1 的 `license` 为 `BSD-3-Clause`**，与当前 MIT 不一致，属早期版本字段，见 D 段。

**experimental 状态**（三处官方口径互相印证）：
- README：「DeepSeek Harness is in _developer preview_ and iterating rapidly. **THERE WILL BE COMPATIBILITY-BREAKING CHANGES.**」/ 中文版「处于 _开发者预览_ 阶段……**未来将出现破坏兼容性的变更**」。【S01、S02】
- SAFETY.md：「DeepSeek Harness is experimental developer-preview software. **It has not undergone a security audit and must not be treated as secure or production-ready.**」/ 中文版「是实验性的开发者预览软件。它**尚未接受安全审计，不得视为安全或可用于生产环境的软件**」。【S03、S04】
- AGENTS.md 目录说明：`experimental/` = 「evaluated capabilities without a product-support commitment」。【官方披露 / 本地缓存：`dsh_AGENTS.md` L68，见 F1】
- 中华网 2026-11-10 亦复述：「Harness 目前仍处于预览和持续开发阶段。官方已经提示，部分核心功能和插件接口仍可能随着后续版本更新发生不兼容的变化。」【S29】

**发布时间线**（每条均可追源）：

| 日期 | 事件 | 来源 |
|---|---|---|
| 2026-08-10 | npm `@deepseek-ai/dsh` 首个版本 `0.0.1-rc.1` 发布（registry `time.created` = 2026-08-10T19:41:11.384Z） | S16 |
| 2026-08-13 | 官方宣布开发者预览版 **v0.1 上线**、以 **MIT 协议开源**；GitHub 仓库 `created_at` = 2026-08-13T11:56:32Z | S14、S28、S32 |
| 2026-08-13/14 | 上证报、光明网等报道「黑鲸出水」/「DeepSeek 重磅更新」 | S32 及落盘 52 条候选来源 |
| 2026-09-29 | 桌面端产品正式推出 | S28 |
| 2026-09-30 | DAU（7 日均值）27.1 万 | S31 |
| 2026-10-07 | DAU 42.9 万 | S31 |
| 2026-10-16 | **CVE-2026-95182** 发布（保留于 2026-09-22） | S33、S34、S35、S37 |
| 2026-11-04 | 官方生态数据统计截止日 | S28 |
| 2026-11-05 | 官方披露首份生态成绩单；宣布「健全插件安全防护机制、搭建官方插件市场、筹备插件作者支持计划」；npm `0.2.2-rc.1` 发布（registry `time.modified` = 2026-11-05T13:21:52.829Z） | S16、S28 |
| 2026-11-08 | 官方在 X 平台发文（PANews/腾讯新闻转述），称将加强插件安全、打造官方插件市场、开放作者扶持意向征集表单 | S30 |
| 2026-11-10 | **本地抓取日**；GitHub repo-meta `updated_at` = 2026-11-10T09:40:08Z | S14 及全部落盘文件 mtime |

---

## B. 分维度事实清单

> 每条以 `[Sxx]` 标注来源编号（对应 E 段索引表）；类型标签见文首。

### ① 项目本体与插件机制

1. **架构**：Cordis 框架下「插件贡献 services / typed events / reversible effects 到共享 context」；「A **profile** is a named composition stored in the Harness home. It lists the bundles it stacks, holds any out-of-tree plugins it installs」；`dsh-base` 是 `web`、`headless`、`sdk`、`acp` 四个 profile 的共享第一层（model adapters、tools、persistence、sandbox）。【官方披露：S11】
2. **两个清单概念**：`bundle`（npm 包，声明 `dsh.bundle`，贡献一层 patch）与 `profile`（`$DSH_HOME/profiles/<name>` 目录，声明 `dsh.profile.bundles` 顺序）；「A bundle is what you author and distribute; a profile is what a user boots with `dsh --profile <name>`. Nothing is both.」【官方披露：S07、S11】
3. **`plugin add` 机制**：`dsh plugin --profile <name> <args...>` **原样转发给 pnpm**（「forwards to pnpm in the profile directory, so every pnpm verb works」），可用 `add` / `remove` / `why`；CLI help 明列 `dsh plugin --profile tui add <package>`。【官方披露：S07、S08】
4. **安装来源（四类）**：本地目录（`add ./hello-plugin`）、npm 包（`add your-package`）、Git 主机（`add github:you/hello-plugin`）、tarball（`add ./hello-plugin-0.1.0.tgz`）；索引格式中版本 `source` 为 `{type:"npm", registry?}` 或 `{type:"git", url, commit: 40-hex-sha, path?}`。【官方披露：S05、S07】
   - 关键安全口径：「**Treat that allowance as permission to execute the package's code on your machine at install time, outside any sandbox the agent runs under.** Only allow packages whose source you trust, and pin a commit」（Git 安装的 `prepare` 构建脚本需用户显式 `allowBuilds` 放行，且**运行在 agent 沙箱之外**）。【官方披露：S07 L181】
5. **profile 与权限**：`--profile <name>`；headless 支持 `--permission-mode <preset>`、`--approval-policy <ask|never>`、`--add-dir <path>`；web 支持 `--public-url`（help 明确标注 `grants no trust`）、`--trusted-host`、`--tls-cert/--tls-key`。【官方披露：S08】
6. **官方索引/市场文档**：存在 `docs/user/guide/plugin-market(.zh).md`（「自定义插件索引 / Custom plugin indexes」实验性 bundle，开启后 Plugins 页出现 **Discover** 标签页）。**「DSH ships no index source.」/「DSH 不内置任何索引源」**；索引源由用户自行添加 URL（`http:`/`https:`），每个源属于当前 profile；安装前有确认框展示来源，**「nothing is installed without that confirmation」**；索引为第三方内容，**「DSH checks the file format but not those claims」/「DSH 检查文件格式，但不验证这些声明」**。【官方披露：S05、S06】
   - 索引为 UTF-8 JSON，默认 ≤128 MiB，字段含 `format`、`plugins[].versions[].source`、`engines.dsh`；官方提供参考生成器（`pnpm --filter @deepseek-ai/dsh-plugin-market-generator start ...`），「The generator only downloads and reads files; it **never installs packages or runs their code**」。【S05、S06】
7. **安装注册表设计（易混淆点）**：官方 `.agents/notes` 2026-09-18 明确 `PluginManager.Config` 的 `registry` / `fallbackRegistries`（默认 npmmirror）是 **npm 镜像源/可用性回退**，并专门写了「**Fall back to the public registries after a private one. Rejected: dependency confusion.**」——**不是信任评级注册表**。2026-09-15 note 补充 `inspect`（`pnpm view` 只读预检、无 bundle patch 直接拒绝）、失败分类、取消回滚、`enabled: false` 安装后再让用户启用、构建脚本审批界面。【官方披露：S09、S10】
8. **社区发现机制**：README 要求「Add the `dsh-plugin` topic to your plugin repository for discoverability」。中文 README 的社区入口为企微群 + 微信公众号，英文 README 为 GitHub Discussions + Discord（两版不一致，见 D 段）。【官方披露：S01、S02】
9. **官方对第三方的态度**：CONTRIBUTING.md「We do not believe that packages in the official repository are inherently more important than packages created by the community.」并说明「We are sorry that we cannot accept external pull requests at the moment」，鼓励社区自建插件并打 `dsh-plugin` topic。【官方披露：S12】

### ② 官方安全机制

1. **SAFETY.md 原文口径（决定性一手证据）**：
   - 「It has **not undergone a security audit** and must not be treated as secure or production-ready.」/「**尚未接受安全审计，不得视为安全或可用于生产环境的软件**」。【S03、S04】
   - 「The project can execute model-generated code and commands, load third-party plugins, and access the network, processes, credentials, and files made available to it. Incorrect model output, defects, misconfiguration, malicious input, or **untrusted plugins may damage the host computer, modify or delete files, disclose data or credentials**」。【S03、S04】
   - **沙箱局限**：「Sandboxing, approval prompts, and permission controls **can reduce risk, but they do not guarantee isolation or prevent damage. Even correctly enforced restrictions cannot protect resources that the project is allowed to access.**」/「沙箱、审批提示与权限控制可以降低风险，**但不保证隔离，也不能保证防止损害**」。【S03、S04】
   - 「**Do not rely on DeepSeek Harness as the sole security control for untrusted workloads.**」/「不要把 DeepSeek Harness 当作不可信工作负载唯一的安全控制措施」。【S03、S04】
   - 负责任使用清单：「Run the project with the least privileges」「Prefer a disposable virtual machine, container」「**Review plugins, configuration, and proposed commands before allowing them to run**」/「在允许运行前检查插件、配置和拟执行命令」；MIT 无保证、不承担责任。【S03、S04】
2. **用户协议口径**：「错误的模型输出、缺陷、配置错误、恶意输入或**不可信插件可能损坏宿主计算机、修改或删除文件、泄露数据或凭据**……您知悉并确认我们仅提供 AI 辅助操作技术服务」。【官方披露：S13】
3. **官方公开的信任边界事实汇总**：无插件签名/校验、无官方审核、无黑名单、无内置索引源；官方提供的是「格式校验 + 兼容性检查 + 注册表检查 + 安装确认 + 沙箱/审批（且明确不保证隔离）」，并把信任责任交给用户（「Add only sources you trust」）。【S03–S10、S13】
4. **官方 2026-11-05 市场与安全机制计划**（【官方披露，经二手媒体转述】）：
   - 环球网转载官方公告原文：「针对插件生态下一步发展，**官方表示，将持续优化插件 API 的稳定性与兼容性，健全插件安全防护机制，搭建官方插件市场，简化插件上传、检索使用流程，打通创作者与使用者之间的渠道**。与此同时，平台正在筹备面向插件作者的专项支持计划，依托 Token 激励、技术交流、作品流量推荐等方式……平台也向创业团队、各类企业敞开合作大门」。【S28】
   - 微信公众号转载稿：「建设官方插件市场（Plugin Marketplace）改变此前主要依靠 GitHub、社区帖子自发分发的现状……**完善插件安全审核机制，防止越权调用与敏感数据泄露**」。【S40】
   - 腾讯新闻/PANews 2026-11-08：「DeepSeek Harness 官方在 X 平台发文称，将进一步提升插件 API 的稳定性和兼容性、**加强插件安全，并打造官方插件市场**……团队正在筹备插件作者扶持计划……目前已开放意向征集表单」。【S30】
   - 中华网 2026-11-10 复述并加注：「按照团队公布的后续计划，Harness 将进一步提高插件接口的稳定性和兼容性，**完善相关安全机制，并推动建设官方插件市场**……这些措施目前仍处于逐步推进阶段，具体实施效果还有待观察」。【S29】
   - 事实边界：以上为**计划/方向**，落盘素材中**未找到**已上线的官方插件市场或已生效的官方插件审核机制的证据（官方索引文档仍为「DSH 不内置任何索引源」）。【S05、S06、S28–S30】

### ③ 生态规模（严格区分口径）

| 数字 | 口径 | 类型 | 来源 |
|---|---|---|---|
| **约 3.49 万个** | 官方「平台公开第三方插件总量」（统计截至 2026-11-04） | 官方披露（媒体转述） | S28 |
| GitHub 渠道 2.94 万个 / npm 渠道 1.85 万个 | 官方分渠道口径（两渠道有重叠，去重后约 3.49 万） | 官方披露 | S28 |
| **约 3.5 万个** | 官方数据的约数表述（多家简讯） | 官方披露（媒体转述） | S30、S31、S32、S40 |
| **29,303** | GitHub `topic:dsh-plugin` 检索命中**仓库数**，`total_count`（抓取日 2026-11-10） | 第三方统计 / 本地缓存（GitHub API） | S18 |
| 154 万 DAU / 548 万 MAU / 日 92 万亿 Token / 人均日请求 261 次 | 官方披露，「以使用官方 API 的用户为统计口径」，较桌面端发布增长 545% / 306% | 官方披露 | S28、S31、S40 |
| 58.94% 活跃用户创建或使用过自定义插件（另有「约 60%」约数） | 官方披露 | 官方披露 | S28、S30 |
| **826,548** | npm `@deepseek-ai/dsh` **周下载**，区间 2026-11-02～11-08 | 第三方统计 / 本地缓存（npm API，抓取日 2026-11-10） | S17 |
| 2,596,914 | 同包月下载，区间 2026-10-11～11-09 | 第三方统计 | S17 |
| **329** | 竞品 `dsh-plugin-gate` 周下载（同批次） | 第三方统计 | S21 |
| 277,815 stars / 34,098 forks / 1,153 subscribers | GitHub API 仓库快照（updated_at 2026-11-10T09:40:08Z） | 第三方统计 | S14 |
| 23,540 | 默认分支 git tree 文件条目数（`tree` 数组长度，`truncated=false`） | 第三方统计 / 本地缓存 | F 段 dsh-tree.json |

**口径差异提示**（详见 D 段）：29,303 ≈ 官方「GitHub 渠道 2.94 万」，但二者统计对象不同；`dsh-topic-repos.json` 的 `items` 样本含 `morluto/rea`（★448292）、`nexu-io/open-design`、`tw93/Mole` 等通用项目，说明 `topic:dsh-plugin` 被泛用，29,303 应理解为「打该 topic 的仓库数」而非「插件数」。【S18】

### ④ 竞品与同类

1. **`dsh-plugin-gate`（863683348，直接竞品）**：【官方披露（竞品仓库一手）：S20、S19、S21】
   - 形态：作为 DSH 插件安装（`dsh plugin --profile <profile> add dsh-plugin-gate`），向 agent 注入 `gate_scan` 工具；**本地静态扫描**（local directory 或 npm tarball）。
   - 能力：**60 条静态签名规则（31 high / 24 medium / 5 low）**，覆盖 Scripts / Obfuscation / Permissions / Network / Secrets / Supply chain；**精确版本依赖查询 Google OSV**（`osvCheck` 默认 true，离线降级）；12 种破坏性命令模式 + workspace 边界检查（`gate_guard`）；BLOCK/WARN/PASS 三级判定；v1.3 提供 `gate_diff` 基线与 `gate_report` 报告。
   - 原文：「The gate is **read-only**: it never executes scanned code and never writes files.」「It is a **heuristic signature scanner** — it can miss novel malware and over-flag innocent code.」
   - 自述局限与路线：「pre-install interception, dependency SBOM, team policy & CI」（ROADMAP，尚未落地）。
   - 热度：GitHub ★1 / forks 2 / open issues 10（created 2026-08-17，pushed 2026-09-11，MIT，JavaScript）；npm `dsh-plugin-gate` latest **1.3.2**，共 4 个版本，**周下载 329**（抓取日 2026-11-10，区间同上）。【S19、S21】
2. **同名/近名仓库**（GitHub API 元数据，抓取日落盘）：`youkongling/dsh-plugin-gate`（「Standalone pre-install security gate for DeepSeek Harness plugins, with npm, Git, and local source review.」，Apache-2.0，★0，created 2026-08-16）、`xypure-x/dsh-plugin-gate`（★0，无描述，master 分支）、`BaqiF2/dsh-plugin-precheck`（与用户产品同名，★1，MIT，created 2026-09-17，无描述）。【S22】
3. **`dsh-search-gate.json`**：GitHub 检索 `total_count = 26` 的同类仓库集合，`items` 含上述 gate/precheck 仓库及大量 `*-gateway` 类插件（如 `Clarklevis1995/dsh-plugin-mobile-gateway` ★157），显示「网关类」插件数量远多于「安全检查类」。【第三方统计 / 本地缓存：S19】
4. **泛生态参照（非 DSH 专用）**：Claude Code 官方插件安全文档（「A Claude Code plugin you install can execute arbitrary code on [your machine]」、市场信任警告与完整性检查）、Socket.dev MCP Security（MCP Registry 仍为 preview、是 metaregistry 不解决信任）、npm audit / OpenSSF Scorecard / Snyk 类供应链扫描讨论。【S39 及 52 条候选来源中 socket.dev、getcommit.dev、sscsecurity.dev 等】
5. **平台自建（计划中）**：官方插件市场 + 健全安全机制（见 B②-4），形态上属「第一方目录站 + 审核」，当前状态为「计划/推进中」。【S28–S30】

### ⑤ 机会信号与社区痛点（仅列事实，不作结论）

1. **已确认 CVE**：`CVE-2026-95182`（别名 `GHSA-g5wx-c65h-w9px`、VulDB `VDB-421302`），**An untrusted search path in DeepSeek Harness (dsh) commit c291e796 allows attackers to execute arbitrary code via supplying and opening crafted executable files in place of legitimate content.**（CWE-426 Untrusted Search Path）。【S33、S34、S35、S36、S37】
   - 时间：保留（reserved）2026-09-22，发布（published）2026-10-16；影响 commit `c291e796`。【S34、S37】
   - 严重度口径不一：GitHub Advisory「**Critical severity Unreviewed**」「CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H」（10.0），「**Package No package listed**、**Affected versions Unknown**、**Patched versions Unknown**」；VulDB「CVSS 7.0 (VulDB)、EPSS 0.00533、KEV No」；SecurityFocus/EchelonGraph 显示 CVSS 10。【S33、S34、S39、E 段外候选】
   - 修复状态：CosmicBytez Labs 分析「**no patched version has been publicly documented for CVE-2026-95182 at time of writing**」；建议「Run dsh inside a disposable, isolated sandbox or container」。【S37】
   - 参考链接（落盘可见）：`https://nvd.nist.gov/vuln/detail/CVE-2026-95182`、`https://www.cve.org/CVERecord?id=CVE-2026-95182`、`https://www.cvedetails.com/cve/CVE-2026-95182/`、`https://gist.github.com/lkloliver/46a88c7d619e487327a1122c20ff8e32`、`https://github.com/lkloliver/poc/tree/main/CVE-2026-95182`。【S33、S34、S35】
   - 三源确认状态与存疑标注见 D 段。
2. **官方自述空白**（一手）：未接受安全审计；不可信插件可能损坏宿主；沙箱不保证隔离；索引「检查文件格式，但不验证这些声明」；Git 安装构建脚本在沙箱外执行；「运行前请检查插件」但**未配套工具**。【S03–S07、S13】
3. **社区/媒体反复出现的痛点表述**（二手，仅记录其存在）：
   - 中文媒体/公众号标题：「154 万人用 DeepSeek Harness，3.5 万插件却没人审」「3.5 万个插件跑在审核前面」。【S40 及 52 条候选来源中 mp.weixin 3 条】
   - 第三方安全博客：「DSH 插件以你的智能体权限运行……安装时，从 GitHub 获取的插件可能执行构建脚本。Harness 会征求批准，但代码是在你的机器上运行的」。【S38】
   - 控场AI：「其插件系统绕过了沙箱的安全边界：每个插件都以与宿主进程相同的权限运行，可以自由访问文件系统和 Shell」。【52 条候选来源 kongchang.com】
   - trueNetLab：「开放插件平台带来可替换性，但也带来新的 supply chain……**来源几乎会变得与功能同等[重要]**」。【52 条候选来源 truenetlab.com】
   - 中华网对官方数据口径的提示：「这些用户规模数据来自 DeepSeek 团队自行披露，**目前并不能直接视为经过独立第三方审计的结果**」「154 万日活并不是对桌面客户端独立活跃用户的直接统计」。【S29】
4. **平台方动向事实**：官方已公开宣布「健全插件安全防护机制 / 搭建官方插件市场 / 插件作者支持计划 / 企业合作开放」，并披露 3.49 万插件、58.94% 活跃用户参与插件生态。【S28–S30】
5. **未找到**：落盘素材中未找到官方已上线插件签名/校验、官方黑名单、官方插件审核结果页面、官方安全事件响应公告、付费/定价页面的一手证据。

### ⑥ 用户产品 dshprecheck 现状

1. **定位**：官网标题 `DSH Precheck — Security & Trust Checks for DeepSeek Harness Plugins`；meta description「Know what a DSH plugin can access before you give it control of your agent. **Check before you install.**」；footer「Independent risk grades based on public code and declarations. **Not a security guarantee.**」；仓库描述 `Security & Trust Checks for DeepSeek Harness Plugins`。【S23、S24、S27】
2. **官网分级口径（一手 app.js）**：`GRADE_META` 定义 **5 种展示状态**（委托方背景称「四级」，落盘显示另有第 5 种 `unknown`）：
   - `green` = **Clear**：「No clear risk signals under current rules. Fine to consider with normal caution.」
   - `yellow` = **Watch**：「Signals are mild; review before relying on it.」
   - `orange` = **Caution**：「Risk behaviors were found. Read the evidence before installing.」
   - `red` = **High risk**：「High-risk evidence was found. Verify permissions and data flows before install.」
   - `unknown` = **Pending**：「Not enough evidence yet, or assessment is still in progress.」
   - Methodology 页面列出 Clear / Watch / Caution / High risk / Pending 五项，并声明「**Grades are not a warranty or penetration-test report.**」；CLI 说明「use **dsh-precheck** to wrap `dsh plugin add` with the same grades」。【S23】
   - 严重度 `P0 Critical / P1 Risk / P2 Note`；规则族 R1 硬编码密钥、R2 破坏性命令、R3 远程代码执行、R4 敏感文件外泄、R5 外部数据外泄、R6 提示注入、R7 混淆执行、R8 可疑出网、R9 凭据/环境泄漏、R13 加壳、R14 网络监听、R16 本地 shell、LLM 辅助复核；详情页四层：Risk grade / Permission clarity / Data destinations / Author track record。【S23】
3. **官网 API 与数据流（一手 app.js）**：SPA 路由 `/`、`/methodology`、`/plugin/<owner>/<repo>`；`fetch('/api/catalog')`（列式 `cols`+`rows`）、`fetch('/api/shard/<000-255>')`（`fnv1a(slug)%256` 分片，取 `data.tools[slug]` 与 `data.findings[slug]`）、`fetch('/api/resolve?url=...')`（`202`=已入队、`200`=FC 已有但 catalog 滞后、`503`=未配置排队）。【S23】
4. **未知插件入队与约 3 小时（一手原文）**：「has been added to the scan queue. Assessment is **not instant** — the pipeline usually runs about every **3 hours**. Please check back in a few hours (up to ~3 hours), then tap Try again.」；详情页同类表述「results usually appear within a few hours (scheduled pipeline about every 3 hours)」。【S23，与【用户给定背景】一致】
5. **catalog 规模与结构（本地缓存，抓取日 2026-11-10）**：`dshprecheck-catalog_dsh.json` 与 `dshprecheck-api-catalog.json` 同为列式 `{"cols":[slug,name,grade,author,author_id,category,source,finding_count,top_severity,downloads,install_count],"rows":[...]}`；因文件尾部截断，可正则解析出**完整行 15,202 条（至少值，非全量）**，`source` 全部为 `dsh`；可解析部分 `grade` 分布：**green 4,697 / yellow 204 / orange 95 / red 14 / unknown 10,192**；`top_severity` P0 49 / P1 272 / P2 4,688 / None 10,193。【S25】
6. **API 字段（一手 api-shard0.json）**：单条 `tools[slug]` 记录含 **30 个字段**：`slug, name, source, source_url, category, grade, grade_evidence_basis, ungated, author, author_id, status, first_seen_at, last_seen_at, install_count, finding_count, top_severity, summary, downloads, stars, verified, requires_api_key, origin_channel, upstream_url, version, description, icon_url, license_spdx, archived, upstream_updated_at, author_tools`。可解析值分布：`first_seen_at`/`last_seen_at` 为 `YYYY-MM-DD HH:MM:SS`（样本 2026-08-20 14:14:03 / 2026-11-05 22:29:28）；`origin_channel` = clawhub 219 / community 137 / enterprise 81 / github 23 / skillhub-plugins 6；`grade_evidence_basis` = code 286 / doc 180；`verified` = true 15 / false 428 / null 23；`status` = active 466 / benign 203 / queued 12 / suspicious 1；`source` = skillhub 437 / github 23 / dsh 6（与 catalog 的 `source=dsh` 口径不同，见 D 段）。【S26】
7. **仓库现状（GitHub API，抓取日 2026-11-10）**：`clawk2026/dsh-precheck`，**0 star / 0 fork / 0 open issue**，`releases.json` 与 `issues.json` 内容均为 `[\n\n]\n`（空数组，即 **0 release / 0 issue**）；`created_at` 2026-08-20T10:03:13Z，`pushed_at` **2026-08-21T11:31:25Z**；commits 共 5 条，最新一条 `b059ed5…` 日期 **2026-08-21T11:31:22Z**，message 为 `8.21`；MIT、TypeScript、main 分支。【S27】
8. **【用户给定背景，非落盘抓取】**（委托方提供，供 Phase 2/3 判断相关性，本包不核验、不评论）：dsh-precheck 为 DeepSeek Harness 插件预安装信任检查**薄客户端 CLI**，无本地规则引擎，从 FC `/trust/resolve` 与 `s.dshprecheck.com/catalog_dsh.json` 拉取 green/yellow/orange/red 四级评级；**默认 fail-soft**（未收录/扫描中/报错一律放行），`--strict` 才 fail-closed；未知插件仅入队、约 3 小时出结果；**catalog 只覆盖默认分支**，pinned ref 在 strict 下直接拒绝。
   - 落盘可交叉印证部分：「约 3 小时」有 S23 官网原文；`/api/resolve` 端点有 S23；`catalog_dsh.json` 文件名与列式结构有 S25。fail-soft / `--strict` / pinned ref / `/trust/resolve` 在落盘素材中**未找到**独立证据。

### ⑦ 时间性说明

1. 全部落盘素材抓取日为 **2026-11-10**；GitHub repo-meta `updated_at` = 2026-11-10T09:40:08Z，`pushed_at` = 2026-11-04T13:06:39Z。【S14】
2. 官方生态数据为「统计截至 **2026-11-04**」的一次性披露（2026-11-05 晚公布），非实时值；DAU 154 万限定「使用官方 API 的用户」口径，且中华网提示未经第三方审计。【S28、S29、S31】
3. npm 下载量为**周/月区间快照**：周区间 2026-11-02～11-08、月区间 2026-10-11～11-09，抓取动作发生在 2026-11-10；「周下载」是滚动窗口值，不同抓取日会变化。【S17、S21】
4. `dsh-topic-repos.json` 的 29,303 是抓取日 GitHub Search API 的瞬时 `total_count`；`incomplete_results=false`。【S18】
5. `dshprecheck-catalog_dsh.json` / `api-shard0.json` 中 `last_seen_at` 最新样本为 2026-11-05 22:29:28，说明用户产品数据快照约截至 11-05，滞后于抓取日 5 天。【S26】
6. 用户产品仓库最后提交 2026-08-21，与抓取日相隔约 2.5 个月；竞品 `dsh-plugin-gate` 最后推送 2026-09-11、npm 最后发布 2026-09-11。【S21、S22、S27】
7. CVE 与官方市场计划均为 2026-10/11 事件，属「抓取日前最近窗口」；官方市场计划截至抓取日仍为「计划/推进中」。【S28–S30、S33–S37】

---

## C. 竞品 / 同类清单表

| 名称 | 形态 | 能力边界（事实） | 分发渠道 | 热度（抓取日） | 对 dsh-precheck 的威胁点（事实性差异，非结论） |
|---|---|---|---|---|---|
| `dsh-plugin-gate`（863683348） | 本地静态扫描（作为 DSH 插件注入 `gate_scan` 工具） | 60 条静态签名规则（31/24/5）+ Google OSV 精确依赖查询 + 12 种破坏性命令模式；BLOCK/WARN/PASS；只读、不执行被扫代码；自述「heuristic，可能漏报/误报」；roadmap 含 pre-install interception / SBOM / team policy | npm（`dsh-plugin-gate` 1.3.2）+ GitHub；`dsh plugin --profile <p> add` | ★1 / fork 2 / issues 10；npm 周下载 **329** | 同为「预装检查」赛道且已发 npm；**本地规则引擎、无需联网评级**；有 OSV、基线（`gate_diff`）、报告（`gate_report`）；已在 DSH 插件形态内 |
| `youkongling/dsh-plugin-gate` | 本地扫描（npm / Git / local source review） | 描述称「Standalone pre-install security gate」，仓库 size 62 KB、无 README 落盘 | GitHub（Apache-2.0） | ★0 / fork 0 | 同名独立实现，创建于 2026-08-16（早于用户产品 08-20） |
| `xypure-x/dsh-plugin-gate` | 未明（无描述） | 无描述、无 README 落盘；size 127 KB | GitHub（master，无 license） | ★0 / fork 0 | 同名仓库占位，创建于 2026-08-15 |
| `BaqiF2/dsh-plugin-precheck` | 未明（无描述） | 无描述；size 34 KB；MIT、JavaScript | GitHub | ★1 / fork 0 | **与用户产品同名**（dsh-plugin-precheck），创建于 2026-09-17 |
| 官方「自定义插件索引 / Discover」 | 目录站（第三方自建索引，官方内置浏览能力） | 「DSH 不内置任何索引源」；索引为第三方内容，官方只校验文件格式、不验证声明；安装前需确认 | 任意静态主机上的 `index.json`（GitHub Pages / GitLab Pages / 对象存储） | 随 DSH 发行（实验性 bundle） | 第一方已提供插件发现/安装通道，且明确不承担信任验证 |
| 官方插件市场（计划中） | 目录站（第一方，规划） | 2026-11-05 宣布「健全插件安全防护机制、搭建官方插件市场、简化插件上传检索」；截至抓取日未见上线证据 | 官方（未上线） | 未找到 | 第一方计划自建市场与安全机制（事实，不作吞噬判断） |
| Claude Code 官方插件目录 / 安全文档 | 远程目录 + 审核（他方生态参照） | 官方管理目录、市场信任警告、完整性检查失败时拒绝而非警告；「plugin ... can execute arbitrary code」 | 官方 marketplace + GitHub | 未找到（非本包抓取重点） | 说明「平台自建审核目录」在同类 harness 中已有先例 |
| MCP Registry / Socket.dev / npm audit / OpenSSF Scorecard / Snyk | 通用供应链扫描 / 元注册表 | 面向 npm/PyPI/MCP 生态，非 DSH 专用；MCP Registry 截至 2026-10 仍为 preview 且是 metaregistry「不解决信任」 | 各自平台 | 未找到 | 通用工具不覆盖 DSH 插件评级字段与 `dsh:` slug 体系 |
| `*-gateway` 类插件（`dsh-search-gate.json` 内） | 网关/连接类插件（非安全检查） | 如 `dsh-plugin-mobile-gateway` ★157、`astrbot_plugin_dsh_gateway` 等 | GitHub topic | 检索 total_count 26 中占多数 | 显示 topic 生态以功能型插件为主，安全类为少数 |

> 表中「热度」均为抓取日 2026-11-10 的 GitHub API / npm API 快照；「威胁点」为可核对的事实性差异，不含战略判断或优化建议。

---

## D. 数据冲突与存疑点 + 待验证假设清单

### D1 必须标注项

1. **两个 0 字节失败下载（不可用）**：`dshprecheck-api-catalog.full.json`（0 字节）、`dshprecheck-catalog_dsh.full.json`（0 字节）。工作记录 MSG 14/27 显示后台完整 catalog 下载失败（服务器极慢），改用分段 Range 请求后仍未完成；这两份为失败产物，忽略其内容。
2. **另发现三个「非 0 字节但 JSON 截断损坏」文件（额外标注，用户清单未提及）**：
   - `dshprecheck-api-catalog.json`（69,468 字节）在 char 69,468 处 `Expecting ',' delimiter`，JSON 无效；
   - `dshprecheck-api-shard0.json`（670,930 字节）在 char 575,270 处 `Unterminated string`；
   - `dshprecheck-catalog_dsh.json`（1,756,856 字节）在 char 1,756,836 处 `Unterminated string`。
   - 三者均为**尾部截断、前缀可读**：本包 B⑥ 的 catalog 行数与分级分布来自正则解析的**完整行前缀**，须标注「至少值、非全量」，不可当作完整统计。
3. **CVE 是否由 GitHub Advisory / NVD / VulDB 三源确认**：
   - **GitHub Advisory（GHSA-g5wx-c65h-w9px）**：落盘有**页面级摘要原文**（Critical / Unreviewed / Published Oct 16, 2026 to the GitHub Advisory Database / CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H / Package No package listed / Affected versions Unknown / Patched versions Unknown / 「Published by the National Vulnerability Database Oct 16, 2026」）。【S33】
   - **VulDB（VDB-421302）**：落盘有**两个语言版本的页面级摘要原文**（CWE-426、CVSS 7.0、EPSS 0.00533、KEV No、保留 22/09/2026、发布 16/10/2026，并列 MITRE/NVD/CVE Details 来源链接）。【S34】
   - **NVD**：落盘**未见独立抓取的 NVD 页面原文**；仅有 `https://nvd.nist.gov/vuln/detail/CVE-2026-95182` 链接，出现在 VulDB 与 GitHub Advisory 的参考链接中，且 GitHub Advisory 明确写「Published by the National Vulnerability Database」。工作记录 MSG 25 结论为「CVE 已由 GitHub Advisory/NVD/VulDB 多源确认」。
   - **结论（保守标注）**：三源**条目均存在且互相交叉引用，可按「基本确认」使用**；但按落盘证据强度，**NVD 属「转引链接 + 他库标注」而非「独立抓取页面原文」**，标注为**低度存疑**；另 GitHub Advisory 状态为 `Unreviewed` 且 `Patched versions Unknown`，CVSS 10.0 与 VulDB 7.0 冲突（不同机构独立评分），均须保留。
4. **3.49 万 vs 29,303 的口径差异**：
   - 3.49 万 = 官方「平台公开第三方插件总量」（去重后，GitHub 渠道 2.94 万 + npm 渠道 1.85 万，两渠道有重叠，故 2.94+1.85≠3.49）；媒体另有「约 3.5 万个」约数。【S28、S30、S31】
   - 29,303 = 抓取日 GitHub `topic:dsh-plugin` 检索的**仓库数**（`total_count`），与官方「GitHub 渠道 2.94 万」高度接近（差约 303）。【S18】
   - 差异来源：①统计对象不同（去重插件数 vs 打 topic 的仓库数）；②渠道范围不同（含 npm 渠道 vs 仅 GitHub topic）；③`topic` 可被非插件仓库泛用（`items` 样本含 `tw93/Mole` 等通用工具），故 29,303 不宜直接当作插件数；④时点不同（官方截至 11-04，API 为 11-10）。
   - 待验证假设：官方「2.94 万 GitHub 渠道插件」是否即由 `topic:dsh-plugin` 统计得出——**未找到**官方方法说明。
5. **npm 下载量抓取日期**：826,548（周）/ 2,596,914（月）与竞品 329 均来自抓取日 **2026-11-10** 的 `api.npmjs.org/downloads/point/last-week|last-month` 调用；周区间 **2026-11-02～11-08**、月区间 **2026-10-11～11-09**。**重要**：该数字仅存于**工作记录 jsonl 的 curl 输出**（`{"downloads":826548,"start":"2026-11-02","end":"2026-11-08","package":"@deepseek-ai/dsh"}`），落盘的 `npm__deepseek-ai_dsh.json` / `npm_dsh-plugin-gate.json` 是 **registry 元数据**（`versions`/`time`/`dist-tags`），**不含 downloads 字段**；即下载量**无独立落盘文件**，引用时须注明来源为工作记录。【S17、S21】

### D2 其他冲突与存疑

6. **star 快照差异**：`dsh-repo-meta.json` = 277,815 stars；`dsh-topic-repos.json` 的 `items` 中同一仓库 = 277,826。两者为同一抓取日不同 API 端点/时刻的快照，差 11，属正常波动，统一以 repo-meta 为准并注明。【S14、S18】
7. **3.49 万 / 3.5 万 / 34900**：官方详细稿为 3.49 万（含 2.94 万 + 1.85 万分渠道），简讯多为「约 3.5 万个」「约 60% 活跃用户」；「58.94%」与「超五成 / 约 60%」并存。属精确值 vs 约数差异，非矛盾。【S28、S30、S31、S40】
8. **许可证历史字段**：npm registry 中 `@deepseek-ai/dsh` 最早版本 `0.0.1-rc.1` 的 `license` 为 `BSD-3-Clause`，而顶层 `license`、`dist-tags.latest 0.2.2-rc.1` 对应版本及仓库均为 MIT。**未找到**许可证变更说明。【S16】
9. **README 英中版社区入口不一致**：英文版为 GitHub Discussions + Discord（`discord.gg/4MrtZUhpxg`）+ `dsh-plugin` topic；中文版为企微群问卷（飞书表单）+ 微信公众号二维码，且中文版链接 `CONTRIBUTING.zh.md` / `SAFETY.zh.md` / `index.zh.md`。属本地化差异。【S01、S02】
10. **Node 版本口径**：README 称「Install Node.js (^22.19 || >=24)」（搜索结果摘要），而根 `package.json` 的 `engines.node = ">=24.9.0"`、`packageManager = pnpm@11.28.5`。前者为用户运行口径、后者为仓库构建口径，未在落盘 README 原文中同时出现，标注为口径差异。【S15 与 52 条候选来源中 README 摘要】
11. **官网「四级」vs 落盘五级**：委托方背景称 green/yellow/orange/red 四级；落盘 `app.js` 的 `GRADE_META` 与 Methodology 页面实际为 **5 种状态**（多 `unknown` / Pending）。catalog 的 `grade` 列亦含 `unknown`（可解析 10,192 条，占比最高）。【S23、S25】
12. **catalog 与 shard 的 `source` 口径不同**：`catalog_dsh.json` 全部 `source=dsh`（15,202 行）；`api-shard0.json` 的 `source` 为 skillhub 437 / github 23 / dsh 6，且 `origin_channel` 含 clawhub/community/enterprise/skillhub-plugins。二者似为不同数据集/不同端点，落盘未见说明文档，**存疑**。【S25、S26】
13. **用户产品仓库 `open_issues_count=0` 与 `issues.json` 空数组一致**；`releases.json` 同为 `[\n\n]\n`。二者为 5 字节文件，属可用（内容为空数组），非失败下载。【S27、F 段】
14. **工作记录中断点**：上一位同事在 MSG 28「Interrupted by user」，尚未输出素材包；其最后动作是「后台 `catalog_dsh.json` 下载失败 / `/api/catalog` 仍在跑，改用分段 Range 请求」。本包已承接其全部已核实结论（MSG 4–27），未推翻任何一条。【工作记录 jsonl】

### D3 待验证假设清单（均未验证，供 Phase 2/3）

| # | 假设 | 当前证据状态 | 建议核验方向（仅列方向，不执行） |
|---|---|---|---|
| H1 | CVE-2026-95182 已有官方修复版本 | 落盘均为「Patched versions Unknown / no patched version publicly documented」 | 官方 releases / commit 历史 / NVD 更新 |
| H2 | 官方「2.94 万 GitHub 渠道插件」= `topic:dsh-plugin` 仓库数 | 数值接近但无方法说明 | 官方数据方法披露 |
| H3 | 官方插件市场/安全审核机制已上线 | 落盘仅见 2026-11-05/11-08「计划」表述，索引文档仍「不内置索引源」 | 官方仓库/文档站更新 |
| H4 | `s.dshprecheck.com/catalog_dsh.json` 与落盘 catalog 为同一数据 | 文件名与列式结构一致，但落盘文件截断 | 完整性校验 |
| H5 | catalog 只覆盖默认分支、pinned ref 在 strict 下拒绝 | **仅【用户给定背景】**，落盘无独立证据 | 用户产品 CLI 源码/README |
| H6 | fail-soft 默认放行、`--strict` fail-closed | **仅【用户给定背景】**，落盘无独立证据 | 同上 |
| H7 | `api-shard0.json` 的 `origin_channel`/`verified` 与 CLI `/trust/resolve` 返回值一致 | 字段存在但端点映射未见文档 | 用户产品 API 文档 |
| H8 | 竞品 `dsh-plugin-gate` 的 Google OSV 查询在生产中默认开启且联网 | README 写 `osvCheck: true`、`offline-degrades`，无运行时证据 | 竞品源码/运行测试 |
| H9 | 用户产品 0 star / 0 fork / 0 release 反映真实冷启动状态 | GitHub API 快照一致，但不含站外流量/下载数据 | 官网流量/npm/其他分发 |
| H10 | 52 条外部来源中的第三方博客/聚合站内容准确 | 多为二手、部分站点权威性未知 | 一手复核（本次未做，理由见文首） |

---

## E. 来源索引表（40 条）

> 「位置」列：网络来源给出已核实 URL；本地归档给出 `phase1/` 下文件名（其在线出处见「URL」列或 S14 官方仓库）。发布日期查不到写「未找到」。可信度为本次整理判断（高/中高/中/中低）。摘录一律原文、不改写。

| 编号 | 标题 | URL / 位置 | 发布日期 | 一手/二手 | 可信度 | 归属维度 | 150 字内摘要 | 原文摘录（不改写） |
|---|---|---|---|---|---|---|---|---|
| S01 | DeepSeek Harness README（英） | https://github.com/deepseek-ai/deepseek-harness ；本地 `dsh-README.md` | 未找到（抓取日 2026-11-10） | 一手·官方 | 高 | ①②⑦ | 官方定位「一切皆插件」、Cordis 驱动、开发者预览与破坏性变更警告、npm/源码两种运行方式、`dsh-plugin` topic 发现机制、MIT 许可、引用信息。 | 「DeepSeek Harness (`dsh`) is an open-source agent harness developed by DeepSeek AI.」「DeepSeek Harness is in _developer preview_ and iterating rapidly. **THERE WILL BE COMPATIBILITY-BREAKING CHANGES.**」 |
| S02 | DeepSeek Harness README（中） | 同上仓库；本地 `dsh_README.zh.md` | 未找到（抓取日 2026-11-10） | 一手·官方 | 高 | ①② | 中文版定位与运行方式；社区入口为企微群问卷与微信公众号（与英文版 Discord 不同）。 | 「DeepSeek Harness（`dsh`）是由 DeepSeek AI 开发的开源 agent harness（智能体框架）。」「它构建于**一切皆插件**的架构之上，由 Cordis 驱动」 |
| S03 | SAFETY.md（英） | 官方仓库 `SAFETY.md`；本地 `dsh_SAFETY.md` | 未找到（抓取日 2026-11-10） | 一手·官方 | 高 | ②⑤ | 决定性安全口径：未接受安全审计、不可信插件可损坏宿主、沙箱不保证隔离、不得作为唯一安全控制、运行前检查插件。 | 「It has not undergone a security audit and must not be treated as secure or production-ready.」「Sandboxing, approval prompts, and permission controls can reduce risk, but they do not guarantee isolation or prevent damage.」 |
| S04 | SAFETY.zh.md（中） | 官方仓库 `SAFETY.zh.md`；本地 `dsh_SAFETY.zh.md` | 未找到（抓取日 2026-11-10） | 一手·官方 | 高 | ②⑤ | S03 中文版，口径一致。 | 「它尚未接受安全审计，不得视为安全或可用于生产环境的软件。」「不要把 DeepSeek Harness 当作不可信工作负载唯一的安全控制措施。」 |
| S05 | Plugin indexes（插件索引，英） | 官方文档站 https://deepseek-harness.github.io/deepseek-harness/ ；本地 `dsh_docs_user_guide_plugin-market.md` | 未找到（抓取日 2026-11-10） | 一手·官方 | 高 | ①②⑤ | 实验性「自定义插件索引」、Discover 标签页、索引格式与参考生成器；明确不内置索引源、只校验格式不验证声明。 | 「DSH ships no index source.」「Indexes are third-party content. An index chooses each plugin's title, description, icon, author, and source; **DSH checks the file format but not those claims.**」 |
| S06 | 插件索引（中） | 同上；本地 `dsh_docs_user_guide_plugin-market.zh.md` | 未找到（抓取日 2026-11-10） | 一手·官方 | 高 | ①②⑤ | S05 中文版。 | 「DSH 不内置任何索引源。」「DSH 检查文件格式，但不验证这些声明。只添加你信任的索引源，并在安装前核对确认框中的来源。」 |
| S07 | Package and install a plugin（publish.md） | 官方文档站；本地 `dsh_docs_user_develop_basic_publish.md` | 未找到（抓取日 2026-11-10） | 一手·官方 | 高 | ①②⑤ | bundle/profile 双清单、`dsh plugin add` 转发 pnpm、四类安装来源、Git 安装构建脚本在沙箱外执行需放行、engines.dsh 兼容检查。 | 「`dsh plugin --profile <name> <args...>` forwards to pnpm in the profile directory, so every pnpm verb works.」「**Treat that allowance as permission to execute the package's code on your machine at install time, outside any sandbox the agent runs under.**」 |
| S08 | dsh CLI help | 官方文档站；本地 `dsh_docs_cli-help.md` | 未找到（抓取日 2026-11-10） | 一手·官方 | 高 | ① | launcher / plugin / acp / headless / sdk / web 全部命令帮助；profile、permission-mode、approval-policy、public-url「grants no trust」。 | 「manage a profile's plugins by forwarding the remaining arguments to pnpm in the profile directory」「`dsh plugin --profile tui add <package>`    install a plugin into the tui profile」 |
| S09 | Agent Note: Plugin install registries (2026-09-18) | 官方仓库 `.agents/notes/implemented/architecture/`；本地 `dsh_.agents_notes_...2026-09-18-plugin-install-registries.md` | 2026-09-18 | 一手·官方 | 高 | ①② | registry/fallbackRegistries 为 npm 镜像源回退设计，明确拒绝私有源回退公有源以防 dependency confusion；非信任评级注册表。 | 「**Fall back to the public registries after a private one.** Rejected: dependency confusion.」 |
| S10 | Agent Note: Guided plugin installation (2026-09-15) | 同上目录；本地 `dsh_.agents_notes_...2026-09-15-guided-plugin-installation.md` | 2026-09-15 | 一手·官方 | 高 | ①② | 安装前 `pnpm view` 只读预检、无 bundle patch 拒绝、失败回滚、取消语义、安装后再启用、构建脚本审批界面。 | 「A package without a bundle patch is refused here, before pnpm runs: the manager installs bundles only.」「The run installs with `enabled: false`」 |
| S11 | docs/architecture.md | 官方文档站；本地 `dsh_docs_architecture.md` | 未找到（抓取日 2026-11-10） | 一手·官方 | 高 | ① | Cordis、profile 为命名组合、bundle 层叠顺序、dsh-base 为四 profile 共享第一层（含 sandbox）、HMR。 | 「A **profile** is a named composition stored in the Harness home. It lists the bundles it stacks, holds any out-of-tree plugins it installs」 |
| S12 | CONTRIBUTING.md | 官方仓库；本地 `dsh_CONTRIBUTING.md` | 未找到（抓取日 2026-11-10） | 一手·官方 | 高 | ① | 官方称不认为官方仓库的包比社区创建的包更重要；暂不接受外部 PR，鼓励社区自建插件并打 topic。 | 「We do not believe that packages in the official repository are inherently more important than packages created by the community.」 |
| S13 | DeepSeek Harness 用户协议 | https://deepseek.com/harness/terms-of-use | 未找到（抓取日 2026-11-10 抓取） | 一手·官方 | 高 | ②⑤ | 使用协议中的固有风险与责任条款，与 SAFETY.md 口径一致。 | 「错误的模型输出、缺陷、配置错误、恶意输入或不可信插件可能损坏宿主计算机、修改或删除文件、泄露数据或凭据，或造成其他非预期影响。」 |
| S14 | GitHub API 仓库元数据 | https://api.github.com/repos/deepseek-ai/deepseek-harness ；本地 `dsh-repo-meta.json` | 快照 updated_at 2026-11-10T09:40:08Z | 一手·API | 高 | ①③⑦ | 277,815 stars / 34,098 forks / 1,153 subscribers、MIT、TypeScript、master、created 2026-08-13、pushed 2026-11-04、topics 含 dsh-plugin。 | 「"description": "DeepSeek Harness: Everything is a Plugin."」「"stargazers_count": 277815, "forks_count": 34098」 |
| S15 | 根 package.json | 官方仓库；本地 `dsh_package.json` | 未找到（抓取日 2026-11-10） | 一手·官方 | 高 | ① | `@deepseek-ai/dsh-root` 0.2.2-rc.1、MIT、private、node>=24.9.0、pnpm@11.28.5、6 个 workspaces。 | 「"name": "@deepseek-ai/dsh-root", "version": "0.2.2-rc.1", "license": "MIT"」 |
| S16 | npm registry `@deepseek-ai/dsh` 元数据 | https://registry.npmjs.org/@deepseek-ai/dsh ；本地 `npm__deepseek-ai_dsh.json` | created 2026-08-10 / modified 2026-11-05 | 一手·API | 高 | ①③⑦ | 42 个版本、dist-tags latest/next 0.2.2-rc.1、alpha 0.2.2-alpha.3、license MIT、时间线。 | 「"dist-tags":{"latest":"0.2.2-rc.1","alpha":"0.2.2-alpha.3","next":"0.2.2-rc.1"}」 |
| S17 | npm 下载量 API（周/月） | https://api.npmjs.org/downloads/point/last-week/@deepseek-ai/dsh （及 last-month）；数据见工作记录 jsonl | 周区间 2026-11-02～11-08，抓取 2026-11-10 | 一手·API | 高 | ③⑦ | `@deepseek-ai/dsh` 周下载 826,548、月下载 2,596,914；数据仅存于工作记录 curl 输出，无独立落盘文件。 | 「{"downloads":826548,"start":"2026-11-02","end":"2026-11-08","package":"@deepseek-ai/dsh"}」 |
| S18 | GitHub `topic:dsh-plugin` 检索 | https://api.github.com/search/repositories（q=topic:dsh-plugin）；本地 `dsh-topic-repos.json` | 抓取日 2026-11-10 | 一手·API | 高 | ③⑦ | `total_count=29303`、`incomplete_results=false`；items 含非插件通用仓库，topic 被泛用。 | 「"total_count": 29303, "incomplete_results": false」 |
| S19 | GitHub 同类/gate 检索 | https://api.github.com/search/repositories（gate 相关 query）；本地 `dsh-search-gate.json` | 抓取日 2026-11-10 | 一手·API | 高 | ④ | `total_count=26`；items 含 4 个 gate/precheck 仓库与多个 gateway 类插件。 | 「"total_count": 26」「clawk2026/dsh-precheck ★0 | Security & Trust Checks for DeepSeek Harness Plugins」 |
| S20 | `dsh-plugin-gate` README（863683348） | https://github.com/863683348/dsh-plugin-gate ；本地 `comp_863683348_dsh-plugin-gate_README.md` | 未找到（抓取日 2026-11-10） | 一手·竞品 | 高 | ④⑤ | 60 条静态规则（31/24/5）、Google OSV、只读本地扫描、BLOCK/WARN/PASS、gate_diff/gate_report/gate_guard、启发式局限、roadmap。 | 「**60 static signature rules (31 high / 24 medium / 5 low)** scan plugin sources ... before you run `dsh plugin add`」「The gate is **read-only**: it never executes scanned code and never writes files.」 |
| S21 | npm registry `dsh-plugin-gate` 元数据 + 下载量 | https://registry.npmjs.org/dsh-plugin-gate ；本地 `npm_dsh-plugin-gate.json`；下载量见工作记录 | 版本 created 2026-08-19 / modified 2026-09-11；周下载抓取 2026-11-10 | 一手·API | 高 | ③④⑦ | latest 1.3.2、4 个版本、MIT；竞品周下载仅 329（同批次）。 | 「"dist-tags":{"latest":"1.3.2"}」「一手 npm 数据到手：`@deepseek-ai/dsh` 周下载 826,548；直接竞品 `dsh-plugin-gate` 周下载仅 329。」（工作记录 MSG 26） |
| S22 | 三个同类仓库元数据 | https://github.com/youkongling/dsh-plugin-gate 、https://github.com/xypure-x/dsh-plugin-gate 、https://github.com/BaqiF2/dsh-plugin-precheck ；本地 `comp_*_gate_meta.json` / `comp_BaqiF2_*_meta.json` | created 2026-08-15～09-17 | 一手·API | 高 | ④ | youkongling（Apache-2.0，含 npm/Git/本地源码审查描述）、xypure-x（无描述）、BaqiF2（与用户产品同名，★1）。 | 「Standalone pre-install security gate for DeepSeek Harness plugins, with npm, Git, and local source review.」 |
| S23 | 用户产品官网 `app.js` | https://dshprecheck.com/（SPA 资源 `/assets/app.js`）；本地 `dshprecheck-app.js` | 未找到（抓取日 2026-11-10） | 一手·产品 | 高 | ⑥ | 五级 GRADE_META/GRADE_DEF、Methodology、`/api/catalog` + `/api/shard/<n>` + `/api/resolve`、约 3 小时出结果、P0/P1/P2 与规则族。 | 「green: { label: "Clear" ... }, yellow: { label: "Watch" ... }, orange: { label: "Caution" ... }, red: { label: "High risk" ... }, unknown: { label: "Pending" ... }」「the pipeline usually runs about every **3 hours**」 |
| S24 | 用户产品官网首页 HTML | https://dshprecheck.com/ ；本地 `dshprecheck-home.html` | 未找到（抓取日 2026-11-10） | 一手·产品 | 高 | ⑥ | 标题/meta/导航（Home、Methodology）/footer 免责声明/canonical/JSON-LD。 | 「Know what a DSH plugin can access before you give it control of your agent. Check before you install.」「Independent risk grades based on public code and declarations. Not a security guarantee.」 |
| S25 | 用户产品 catalog（列式） | https://s.dshprecheck.com/catalog_dsh.json （用户给定）；本地 `dshprecheck-catalog_dsh.json`、`dshprecheck-api-catalog.json` | 抓取日 2026-11-10（尾部截断） | 一手·产品缓存 | 中（截断） | ⑥⑦ | `cols`+`rows` 列式，11 列；可解析完整行 15,202 条；green 4697/yellow 204/orange 95/red 14/unknown 10192。 | 「{"cols":["slug", "name", "grade", "author", "author_id", "category", "source", "finding_count", "top_severity", "downloads", "install_count"],"rows":[["dsh:liustack/modlens","modlens","red",...」 |
| S26 | 用户产品 API shard0 | 本地 `dshprecheck-api-shard0.json`（`/api/shard/000` 类端点） | 抓取日 2026-11-10（尾部截断） | 一手·产品缓存 | 中（截断） | ⑥⑦ | `tools` 字典，单条 30 字段；`first_seen_at`/`last_seen_at`/`origin_channel`/`grade_evidence_basis`/`verified` 等。 | 「"grade_evidence_basis":"code","ungated":false,"author":"Takinggg",...,"first_seen_at":"2026-08-20 14:14:03","last_seen_at":"2026-11-05 22:29:28"」 |
| S27 | 用户产品仓库元数据 + commits | https://github.com/clawk2026/dsh-precheck ；本地 `dshprecheck-repo-meta.json`、`-commits.json`、`-releases.json`、`-issues.json` | created 2026-08-20 / pushed 2026-08-21 | 一手·API | 高 | ⑥⑦ | 0 star / 0 fork / 0 release / 0 issue；5 条提交，最新 2026-08-21「8.21」；MIT、TypeScript。 | 「"stargazers_count": 0, "forks_count": 0」「('2026-08-21T11:31:22Z', '8.21')」「[\n\n]\n」（releases/issues 内容） |
| S28 | 环球网转载：官方 11/5 生态成绩单与官方市场计划 | https://so.html5.qq.com/page/real/search_news?docid=70000021_5586aed3a7468052 | 2026-11-06 | 二手·媒体（转述官方披露） | 中高 | ②③⑤⑦ | 官方 11/5 披露：DAU 154 万、MAU 548 万、日 92 万亿 Token、插件总量约 3.49 万（GitHub 2.94 万/npm 1.85 万）、58.94% 参与率；宣布健全安全机制、搭建官方插件市场、作者支持计划、企业合作。 | 「目前平台公开第三方插件总量约3.49万个，其中GitHub渠道插件2.94万个，npm渠道插件1.85万个。」「官方表示，将持续优化插件API的稳定性与兼容性，健全插件安全防护机制，搭建官方插件市场」 |
| S29 | 中华网：DeepSeek 把战场搬到了「驾驭层」 | https://news.china.com/socialgd/10000169/20261110/49856671_all.html | 2026-11-10 | 二手·媒体 | 中高 | ②⑤⑦ | 复述官方计划并加注：用户规模为团队自行披露、未经第三方审计；154 万 DAU 非桌面客户端独立活跃统计；仍处预览阶段、接口可能不兼容变化。 | 「这些用户规模数据来自DeepSeek团队自行披露，目前并不能直接视为经过独立第三方审计的结果。」 |
| S30 | 腾讯新闻 / PANews：将推出官方插件市场及作者扶持计划 | https://news.qq.com/rain/a/20261108A0CCSO00 | 2026-11-08 | 二手·媒体 | 中高 | ②③⑤ | 官方在 X 平台发文：提升插件 API 稳定性兼容性、加强插件安全、打造官方插件市场；作者扶持计划已开放意向征集表单；约 3.5 万插件、约 60% 活跃用户。 | 「将进一步提升插件API的稳定性和兼容性、加强插件安全，并打造官方插件市场，方便开发者发布插件、用户查找所需插件。」 |
| S31 | 澎湃新闻：日活用户超 150 万 | https://www.thepaper.cn/newsDetail_forward_34418709 | 2026-11-06 | 二手·媒体 | 中高 | ③⑦ | 官方数据时间线：9/30 DAU 27.1 万、10/7 42.9 万、11/4 154 万；日 92 万亿 Token。 | 「在9月30日，DeepSeek Harness日活跃用户（7天日均值）仅27.1万，10月7日达到42.9万，11月4日攀升至154万」 |
| S32 | 中国证券网：黑鲸出水 开发者预览版上线 | https://www.cnstock.com/commonDetail/759632 | 2026-08-13 | 二手·媒体 | 中高 | ①⑦ | v0.1 开发者预览版 8/13 晚官宣、MIT 开源，被称智能体赛道关键一子。 | 「8月13日晚间,DeepSeek Harness团队通过官方公众号宣布,DeepSeek Harness的开发者预览版(v0.1版本)正式面向全球开发者开放测试,并同步以MIT协议开放源代码。」 |
| S33 | GitHub Advisory GHSA-g5wx-c65h-w9px | https://github.com/advisories/GHSA-g5wx-c65h-w9px | 2026-10-16 | 一手·漏洞库 | 高 | ⑤⑦ | CVE-2026-95182 的 GitHub Advisory 条目：Critical/Unreviewed、CVSS 10.0 向量、无 package/受影响版本/修复版本，参考 NVD 与 PoC gist。 | 「Critical severity Unreviewed Published Oct 16, 2026 to the GitHub Advisory Database」「CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H」 |
| S34 | VulDB VDB-421302（CVE-2026-95182） | https://vuldb.com/am/cve/CVE-2026-95182 （另有 /kk/ 版本） | 2026-10-16（保留 2026-09-22） | 一手·聚合库 | 中高 | ⑤⑦ | CWE-426、CVSS 7.0、EPSS 0.00533、KEV No；列 MITRE/NVD/CVE Details 来源链接。 | 「An untrusted search path in DeepSeek Harness (dsh) commit c291e796 allows attackers to execute arbitrary code via supplying and opening crafted executable files in place of legitimate content.」 |
| S35 | MITRE CVE Record | https://www.cve.org/CVERecord?id=CVE-2026-95182 | 2026-10-16 | 一手·漏洞库 | 高 | ⑤ | CVE 编号登记页（落盘为 VulDB 与 GitHub Advisory 中的来源链接，未见独立抓取原文）。 | 「MITRE https://www.cve.org/CVERecord?id=CVE-2026-95182」（VulDB 页面来源链接原文） |
| S36 | NVD 漏洞详情页 | https://nvd.nist.gov/vuln/detail/CVE-2026-95182 | 2026-10-16 | 一手·漏洞库 | 高（落盘仅链接/转引） | ⑤⑦ | NVD 条目；GitHub Advisory 标注「Published by the National Vulnerability Database」；落盘未见独立抓取页面原文，见 D1-3。 | 「Published by the National Vulnerability Database Oct 16, 2026」（GitHub Advisory 页面原文） |
| S37 | CosmicBytez Labs：CVE-2026-95182 分析 | https://labs.cosmicbytez.ca/security/deepseek-harness-untrusted-search-path-cve-2026-95182 | 2026-10-16 后（未找到精确日） | 二手·安全博客 | 中 | ⑤ | 影响评估、保留/发布时间、commit c291e796、无公开修复版本、建议一次性沙箱/容器与固定版本。 | 「CVE-2026-95182 was reserved on 2026-09-22 and published on 2026-10-16 against DeepSeek Harness commit c291e796.」「no patched version has been publicly documented for CVE-2026-95182 at time of writing」 |
| S38 | 第三方安全博客：DSH 插件安全吗？ | https://deepseek-harness-plugin.com/zh-CN/blog/dsh-plugin-safety | 未找到 | 二手·博客 | 中低 | ⑤ | 社区对插件权限、安装脚本、网络请求的常见疑问与最佳实践清单；结论偏「总体安全、风险可管理」。 | 「DSH 插件以你的智能体权限运行」「安装时,从 GitHub 获取的插件可能执行构建脚本。Harness 会征求批准,但代码是在你的机器上运行的」 |
| S39 | Claude Code 插件安全和信任文档 | https://code.claude.com/docs/en/plugins/security （及 /zh-CN/ 版） | 未找到（抓取日 2026-11-10） | 一手·他方官方 | 高 | ④⑤ | 他方 harness 的插件信任模型：安装前信任警告、不受信市场与完整性检查失败时拒绝、可执行任意代码。 | 「A Claude Code plugin you install can execute arbitrary code on」「Make sure you trust a plugin before installing, updating, or using it.」 |
| S40 | 微信公众号：日活破 154 万·官方插件市场与作者激励 | http://mp.weixin.qq.com/s?__biz=MjM5ODMzODgzMg==&mid=2247483919&idx=1&sn=d5d2af5c5959f09845228696664de730 | 2026-11-05 后 | 二手·自媒体（转述官方披露） | 中 | ②③⑤ | 「核心战报」与「官方三大重措」：建设官方插件市场、升级插件 API 稳定性与安全拦截（完善插件安全审核机制）、创作者激励与企业合作。 | 「建设官方插件市场(Plugin Marketplace)改变此前主要依靠 GitHub、社区帖子自发分发的现状」「完善插件安全审核机制,防止越权调用与敏感数据泄露」 |

> 补充：落盘另有 12 条候选外部来源未逐条入表（均为二手），含 `www.163.com`、`www.jwview.com`、`www.toutiao.com`、`m.gmw.cn`、`www.nfnews.com`、`www.cnenergynews.cn`、`www.thepaper.cn` 系列、`www.panewslab.com`、`www.securityfocus.com`、`www.cvedetails.com`、`echelongraph.io`、`kongchang.com`、`truenetlab.com`、`cruxdigits.nl`、`socket.dev`、`mindgard.ai`、`getcommit.dev`、`sscsecurity.dev` 等，标题/URL/摘要存于 `/tmp/phase1_sources.txt`（本次整理中间产物）及工作记录 jsonl；本表 40 条已满足 ≥20 条要求。

---

## F. 本地归档文件清单（按类别分组）

> 目录：`.../phase1/`。**实际 42 个文件**（用户任务描述称 43 个；逐一核对未见第 43 个，工作记录 jsonl 位于目录外，见文首）。大小单位为字节（stat）。「可用」判定：0 字节 = 不可用；尾部截断 = 部分可用（前缀可读、JSON 解析失败）；其余 = 可用。

### F1 官方一手文档（19 个，均可用）

| 文件 | 大小 | 可用 | 说明 |
|---|---|---|---|
| `dsh-README.md` | 2,673 | 可用 | 英文 README |
| `dsh_README.zh.md` | 3,371 | 可用 | 中文 README |
| `dsh_SAFETY.md` | 1,673 | 可用 | 英文安全说明（决定性证据） |
| `dsh_SAFETY.zh.md` | 1,530 | 可用 | 中文安全说明 |
| `dsh_AGENTS.md` | 19,319 | 可用 | 面向 agent 的仓库约定（含 experimental/ 定义） |
| `dsh_CONTRIBUTING.md` | 1,574 | 可用 | 贡献指南 |
| `dsh_docs_architecture.md` | 18,853 | 可用 | 架构文档 |
| `dsh_docs_cli-help.md` | 7,607 | 可用 | CLI 全量帮助 |
| `dsh_docs_config-catalog.md` | 244,648 | 可用 | 配置目录（5,123 行，生成物） |
| `dsh_docs_cookbook_extension-cookbook.md` | 11,330 | 可用 | 扩展 cookbook（含 permission-gate 示例） |
| `dsh_docs_user_develop_basic_index.md` | 3,937 | 可用 | 开发入门索引 |
| `dsh_docs_user_develop_basic_publish.md` | 11,228 | 可用 | 打包与安装插件教程（决定性证据） |
| `dsh_docs_user_guide_index.md` | 1,397 | 可用 | 用户指南索引 |
| `dsh_docs_user_guide_plugin-market.md` | 9,781 | 可用 | 插件索引（英，决定性证据） |
| `dsh_docs_user_guide_plugin-market.zh.md` | 9,480 | 可用 | 插件索引（中，决定性证据） |
| `dsh_docs_user_guide_public-deployments.md` | 4,819 | 可用 | 公共部署与 browser-trust fence |
| `dsh_.agents_notes_implemented_architecture_2026-09-14-current-profile-plugin-management.md` | 6,306 | 可用 | 架构笔记 |
| `dsh_.agents_notes_implemented_architecture_2026-09-15-guided-plugin-installation.md` | 8,148 | 可用 | 架构笔记（引导式安装） |
| `dsh_.agents_notes_implemented_architecture_2026-09-18-plugin-install-registries.md` | 9,504 | 可用 | 架构笔记（安装注册表） |

### F2 官方仓库 / 包元数据（3 个，均可用）

| 文件 | 大小 | 可用 | 说明 |
|---|---|---|---|
| `dsh-repo-meta.json` | 7,406 | 可用 | GitHub API 仓库元数据（S14） |
| `dsh_package.json` | 19,933 | 可用 | 根 package.json（S15） |
| `dsh-tree.json` | 7,789,705 | 可用 | 默认分支 git tree，`tree` 23,540 项，`truncated=false`（未整份入上下文，仅取统计） |

### F3 生态数据（4 个，均可用）

| 文件 | 大小 | 可用 | 说明 |
|---|---|---|---|
| `dsh-topic-repos.json` | 32,453 | 可用 | `topic:dsh-plugin` 检索，`total_count=29303`（S18） |
| `dsh-search-gate.json` | 68,163 | 可用 | 同类/gate 检索，`total_count=26`（S19） |
| `npm__deepseek-ai_dsh.json` | 312,604 | 可用 | npm registry 元数据，42 版本（S16）；**不含 downloads 字段** |
| `npm_dsh-plugin-gate.json` | 15,127 | 可用 | 竞品 npm registry 元数据，4 版本（S21）；**不含 downloads 字段** |

### F4 竞品（5 个，均可用）

| 文件 | 大小 | 可用 | 说明 |
|---|---|---|---|
| `comp_863683348_dsh-plugin-gate_README.md` | 7,054 | 可用 | 直接竞品 README（S20） |
| `comp_863683348_dsh-plugin-gate_meta.json` | 6,430 | 可用 | 竞品 GitHub API 元数据（★1/fork 2/issues 10） |
| `comp_xypure-x_dsh-plugin-gate_meta.json` | 6,851 | 可用 | 同名仓库元数据（★0） |
| `comp_youkongling_dsh-plugin-gate_meta.json` | 6,329 | 可用 | 同类仓库元数据（Apache-2.0） |
| `comp_BaqiF2_dsh-plugin-precheck_meta.json` | 6,000 | 可用 | 与用户产品同名仓库元数据（★1） |

### F5 用户产品（11 个：6 可用 / 3 部分可用 / 2 不可用）

| 文件 | 大小 | 可用 | 说明 |
|---|---|---|---|
| `dshprecheck-home.html` | 3,461 | 可用 | 官网首页 HTML（S24） |
| `dshprecheck-app.js` | 31,900 | 可用 | 官网 SPA 全量 JS（S23，分级口径/API/3 小时） |
| `dshprecheck-repo-meta.json` | 6,044 | 可用 | 仓库元数据（0 star/0 fork，S27） |
| `dshprecheck-commits.json` | 22,546 | 可用 | 5 条提交（S27） |
| `dshprecheck-releases.json` | 5 | 可用 | 内容 `[\n\n]\n`（0 release） |
| `dshprecheck-issues.json` | 5 | 可用 | 内容 `[\n\n]\n`（0 issue） |
| `dshprecheck-api-catalog.json` | 69,468 | **部分可用（截断）** | 列式 catalog，`Expecting ',' delimiter` @ char 69,468（S25） |
| `dshprecheck-api-shard0.json` | 670,930 | **部分可用（截断）** | shard0，`Unterminated string` @ char 575,270；30 字段（S26） |
| `dshprecheck-catalog_dsh.json` | 1,756,856 | **部分可用（截断）** | 列式 catalog，`Unterminated string` @ char 1,756,836；可解析 15,202 行（S25） |
| `dshprecheck-api-catalog.full.json` | **0** | **不可用（失败下载）** | 后台完整下载失败产物，须忽略（D1-1） |
| `dshprecheck-catalog_dsh.full.json` | **0** | **不可用（失败下载）** | 同上（D1-1） |

（用户产品文件合计 11 个：home / app / repo-meta / commits / releases / issues = 6 个可用；api-catalog / api-shard0 / catalog_dsh = 3 个部分可用；两个 `.full.json` = 2 个不可用。按实际磁盘计数。）

### F6 目录外工作记录（1 个，可用）

| 文件 | 大小 | 可用 | 说明 |
|---|---|---|---|
| `agent-36214829-a95c-4803-b27f-a999de73aa5a.jsonl`（位于 `/Users/zxc/.workbuddy/projects/.../subagents/`） | 1,098,076 / 163 行 | 可用 | 上一位同事 Phase 1 执行日志：29 条 message、30 条 reasoning、53 次 function_call、51 次 result；含 308 个 URL（去重）、11 次 WebSearch、8 次 WebFetch、22 次 Bash（curl 原始输出）；**826,548 / 329 下载量与 3.49 万口径的关键出处**；末行 MSG 28「Interrupted by user」 |

### F7 计数核对

- F1 19 + F2 3 + F3 4 + F4 5 + F5 11 = **42 个**（与 `ls -1 | wc -l` 一致）；F6 为目录外文件，不计入。
- 可用 37 个 / 部分可用（截断）3 个 / 不可用（0 字节）2 个。
- 用户任务描述称「共 43 个文件」，实际目录内 42 个；差 1 个**未找到**（可能为口误或将目录外工作记录计入）。

---

（素材包结束。本包仅做事实整理与来源索引，不含战略结论、不含优化建议；待验证假设见 D3。）
