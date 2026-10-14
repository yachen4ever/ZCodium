# Fork 差异台账

本文件维护 `yachen4ever/ZCodium` 的 `main` 与上游 `ZCodium-project/ZCodium` 的 `main`
之间的**全部差异**。任何让两者分叉的改动都必须在这里登记，否则下一次同步上游时会被无声冲掉。

## 关系与协作模型

- 本仓库是 `ZCodium-project/ZCodium` 的 fork，上游地址 `git@github.com:ZCodium-project/ZCodium.git`。
- `yachen4ever` 是上游的**协作者**（具备写权限，可直接推分支提 PR），但不推任何修改到上游 `main`——**一律走 PR**。
- 分工基线：**我们只负责提 PR，review 与合并统一由上游维护者（@SudoUserReal）承担**。`.github/CODEOWNERS` 只有他一人，这是有意为之，不是疏漏。
- 本 fork 的 `main` = 上游 `main` + 下表登记的差异，作为**贡献线的集成分支**：差异先落这里验证，再以 PR 回馈上游。
  2026-10-11 起私人产品线独立为 `yachen4ever/yazcode`（26.x 线），本 fork 不再承担日常发版——release 页目前仅有
  一个未转正的 `v1.0.0` draft（2026-10-03）。

## 差异清单

| # | 差异 | 上游 PR | 状态 |
|---|---|---|---|
| 1 | 移除智谱套餐体系，Provider 拉平为普通预设 | [#16](https://github.com/ZCodium-project/ZCodium/pull/16) | 已合入上游（2026-10-05）。注意：上游后续以 [#25](https://github.com/ZCodium-project/ZCodium/pull/25) 恢复了 Z.ai / BigModel Coding Plan 的 API-Key 预设模板，与本 fork 立场相悖未跟随，同步时需重新表态 |
| 2 | 许可台账漂移闸门 + 清理 9 条 stale override | [#21](https://github.com/ZCodium-project/ZCodium/pull/21) | 已合入上游（2026-10-05）；AND 混合表达式按最严成员分类的后续修复亦已合入（[#33](https://github.com/ZCodium-project/ZCodium/pull/33)） |
| 3 | office 四技能（docx / xlsx / pptx / pdf） | [#22](https://github.com/ZCodium-project/ZCodium/pull/22) | #22 已关闭；由 [#24](https://github.com/ZCodium-project/ZCodium/pull/24) 替代合入（2026-10-05），但上游只收了 docx / xlsx——**pptx / pdf 仍为本 fork 独有**（2026-10-14 随同步移植到再基线后的基座） |

## 上游同步状态（2026-10-14 核实）

- **已合入上游的本 fork 贡献**：#16 / #21 / #23 / #24 / #31 / #33 / #35 / #37 / #41 全部 squash 合入；
  在途仅剩 [#40](https://github.com/ZCodium-project/ZCodium/pull/40)（对话动作行常驻、用户消息时间戳、回复速度展示）。
- **上游已整体再基线**：2026-10-11 维护者以 [#43](https://github.com/ZCodium-project/ZCodium/pull/43) 把 main 再基线到
  zai-org v3.15.1（遥测剥离，约 1.17 万文件量级，带入 UI Plugin / gen-ui 等新面），10-12 又以
  [#45](https://github.com/ZCodium-project/ZCodium/pull/45) 修复 release 构建与打包版启动/登录链路。
  **2026-10-14 同步完成**：main 重置到 upstream/main（e02e5909，含 #43 再基线与 #45），再移植 fork 独有差异
  （本台账、pptx/pdf 技能及其 copied-components 登记，notices 由生成器重跑）。重置前的旧 main 留档于
  `backup/main-pre-sync-20261014` 分支。#25 恢复的 Coding Plan 预设模板**跟随上游**（激进去套餐立场由 yazcode 线保持；
  如需改变立场，后续单独 revert 再登记）。
- 上游另有本 fork 之外的变化：#15 OrcaRouter、#27 linked-issue 门禁、#29 Codex hooks 兼容，
  以及 #19 数据根归属文件 + 决策式迁移（替代了本 fork 被关闭的 #12/#13 方案，两侧迁移方式已定型分歧）。
- 两侧 `package.json` 均为 `1.0.0`（上游经 #41 采纳了同一套 1.y.z 体系）。

### 1. 去智谱化（`feat!: 移除智谱套餐体系`）

产品规格见 `docs/specs/flatten-provider-zones.md`（随 PR 一起提交到上游）。要点：

- 数据层：builtin 配置删除 8 条 `account:*` Provider 与 `zai-api` / `bigmodel-api` 两条套餐模板，保留
  `zai-standard-api` / `bigmodel-standard-api` 等 18 个普通 api-key 预设。
- 数据源治理：**builtin 配置的唯一事实源是仓库内的 `config/provider/zcode-builtin.json`**。官方 CDN 远端源与
  数据目录缓存物化是套餐模板的投递与复活通道，已停用。**这条决策在与上游沟通时要守住**——
  上游 review 曾建议对 `clientConfig` 改用「下载后过滤」，我们没采纳，改为收窄该开关语义。
- 官方服务开关：移除随去智谱化失效的 `account` / `feedback` / `codingPlan` / `officialMcp` / `offPeak`
  五个（BREAKING）；`clientConfig` 保留但收窄为 `helpAppConfig` / `clientConfigService` /
  `contextPromptRollout` 三项。
- 存量数据：`packages/provider-node/src/retired-zhipu-provider-migration.ts` 在 provider 配置运行时启动边界
  做一次性对账。选中模型回退按 `account:zai-*` / `account:bigmodel-*` 分族，且**必须先验证回退目标存在**
  ——`zai-standard-api` 是模板不是 Provider，用户没创建过就没有对应条目，此时清空选中项而不是回退成同名
  providerId（那只是把一个悬空引用换成另一个）。

### 2. 许可台账漂移闸门

`scripts/licenses.mjs` 与台账在上游已存在，但**上游没有任何 CI 触发重生成**。本 fork 补上闸门：
依赖图或台账输入一变就在 Linux CI 上重生成并与已入库台账比对，不一致直接失败。

落地时发现上游已漂移：`third-party/npm-overrides.json` 里 9 条 Sentry RUM / rrweb 遥测 override
（正是当初「移除全部监控与遥测」时漏删的）会让生成器 fail-closed 抛 `Stale npm notice override`，
即**上游 main 上根本跑不出新的声明**。

> 依赖关系：#3 原堆叠在 #2 上（#2 未合入前上游台账无法重生成）；两者均已合入，依赖解除。

### 3. office 四技能

从公开仓库 `MiniMaxAI/minimax-code` 按 revision `564e9166` 锁定 vendored（MIT），沿用仓库既有的
`third-party/copied-components.json` 机制登记来源与哈希。该文件对它是**有门禁**的：哈希对不上抛
`Changed copied-source license`，copied roots 之外有改动抛 `Modified source outside copied roots`。

`skillsService` 按目录扫描发现 `.agents/skills/`，无注册清单，因此这是纯新增，不碰装配代码。

## 版本体系

本 fork **不沿用上游的 3.x 编号**，走独立的 `1.y.z`：

- `y` = 对齐上游的同步批次（同步一次上游 main 递增一次）
- `z` = 本 fork 自身迭代
- 首个版本从 `1.0.0` 起步，与上游 `3.14.x` 完全脱钩

**为什么**：两边同号会让「这个 3.14.7 是谁的构建」分不清——上游发 3.14.8 时我们无法跟着发同号而不产生歧义，而不同号又看不出我们基于哪个上游版本。拆成两条线后，版本号只表达「我们走到哪了」，上游位置由 git 历史和本文件登记的差异决定。

沿用的既有约定：

- 预发布用日期式后缀：`1.0.0-audit.20260922`，同日重复构建自动追加 `.2` / `.3`；
- 版本号**不编码**上游 commit sha，对应关系记在本文件和各次 release 说明里；
- workflow 的版本校验正则本就是通用 semver，无需为 1.x 改动。

`package.json` 是版本号的唯一来源；`release.yml` 的输入提示与注释已同步为 1.y.z 语义。

> 2026-10-11 上游经 [#41](https://github.com/ZCodium-project/ZCodium/pull/41) 采纳了同一套体系，两侧 `y`=同步上游批次的语义已一致。

## 同步上游

```bash
git fetch upstream
# 先备份当前 main（旧谱系留成分支，随时可回）
git branch backup/main-pre-sync-<date> main
# 从 upstream/main 切 sync 分支，逐条移植本文件登记的 fork 独有差异后提交
git checkout -b sync/upstream-<date> upstream/main
# ……移植、跑验证……
# main 重置到 sync 分支，保持「上游 main + 本文件登记差异」的形态
git checkout main && git reset --hard sync/upstream-<date>
git push origin backup/main-pre-sync-<date>
git push --force-with-lease origin main
```

> 2026-10-14 做法变更：原来的「`git merge --no-ff` 回 main」写于本 fork 还背着大量未合入差异的时期。
> 如今 fork 差异要么已被上游吸收、要么只剩本文件表格所列几项，改为**重置式同步**——main 始终等于
> `upstream/main` + 登记差异，避免同一批改动在历史里长期存在两份。旧谱系必须先推 backup 分支再重置。

同步后必须跑：`pnpm typecheck`、`pnpm lint`、`pnpm architecture:check --changed`、
`pnpm --filter @zcode/services test`。任一失败**不要**改本文件掩盖，先查清是不是上游改了同一处契约。

差异条目在上游合入后**不删除**，改成「已合入 #NN」并保留一行说明——同步上游时需要知道哪些改动已经
不需要再移植了。

## 发版

本 fork 的 `main` 是产品线发版源，版本走上面的 `1.y.z` 体系。发版走仓库自带的
`release.yml`（GitHub Actions，`workflow_dispatch` 触发）：在 `yachen4ever/ZCodium`
上手动跑，传版本号、是否预发布、是否构建产物。CI 会在 5 个桌面平台出包并合并 sha256，
全部上传成功才把 draft release 转正——这套流程本来就是为「产物齐了才发布」设计的，
沿用即可。

> 注意：`packages/desktop` 的 `build` 脚本**不含 electron-builder**，本地想出包要走
> `pnpm bundle:desktop -- --os win --arch x64`，不能用 `pnpm build` 代替。

