# Fork 差异台账

本文件维护 `yachen4ever/ZCodium` 的 `main` 与上游 `ZCodium-project/ZCodium` 的 `main`
之间的**全部差异**。任何让两者分叉的改动都必须在这里登记，否则下一次同步上游时会被无声冲掉。

## 关系与协作模型

- 本仓库是 `ZCodium-project/ZCodium` 的 fork，上游地址 `git@github.com:ZCodium-project/ZCodium.git`。
- `yachen4ever` 是上游的**协作者**（具备写权限，可直接推分支提 PR），但不推任何修改到上游 `main`——**一律走 PR**。
- 分工基线：**我们只负责提 PR，review 与合并统一由上游维护者（@SudoUserReal）承担**。`.github/CODEOWNERS` 只有他一人，这是有意为之，不是疏漏。
- 本 fork 的 `main` = 上游 `main` + 下表登记的差异。它是我们自己的产品线，发版也从这里出。

## 差异清单

| # | 差异 | 上游 PR | 状态 |
|---|---|---|---|
| 1 | 移除智谱套餐体系，Provider 拉平为普通预设 | [#16](https://github.com/ZCodium-project/ZCodium/pull/16) | 待 review |
| 2 | 许可台账漂移闸门 + 清理 9 条 stale override | [#21](https://github.com/ZCodium-project/ZCodium/pull/21) | 待 review |
| 3 | office 四技能（docx / xlsx / pptx / pdf） | [#22](https://github.com/ZCodium-project/ZCodium/pull/22) | 待 review（堆叠在 #21 上） |

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

> 依赖关系：#3 堆叠在 #2 上，因为 #2 未合入前上游台账无法重生成。

### 3. office 四技能

从公开仓库 `MiniMaxAI/minimax-code` 按 revision `564e9166` 锁定 vendored（MIT），沿用仓库既有的
`third-party/copied-components.json` 机制登记来源与哈希。该文件对它是**有门禁**的：哈希对不上抛
`Changed copied-source license`，copied roots 之外有改动抛 `Modified source outside copied roots`。

`skillsService` 按目录扫描发现 `.agents/skills/`，无注册清单，因此这是纯新增，不碰装配代码。

## 同步上游

```bash
git fetch upstream
git checkout -b sync/upstream-<date> upstream/main
# 把本文件表格里状态仍为「待 review」的差异逐条 cherry-pick 或手工移植
git checkout main && git merge --no-ff sync/upstream-<date>
```

同步后必须跑：`pnpm typecheck`、`pnpm lint`、`pnpm architecture:check --changed`、
`pnpm --filter @zcode/services test`。任一失败**不要**改本文件掩盖，先查清是不是上游改了同一处契约。

差异条目在上游合入后**不删除**，改成「已合入 #NN」并保留一行说明——同步上游时需要知道哪些改动已经
不需要再移植了。

## 发版

本 fork 的 `main` 是产品线发版源。版本号沿用上游 `3.x` 体系还是另起一套，尚未决定；
在决定前，发版前请确认 `packages/desktop/package.json` 与 `package.json` 的版本来源，
不要默认沿用上游号。
