# Design

## Context

动机见 proposal.md。影响方案取舍的现状与约束：

- **外链目前是单一来源常量。** `src/site.ts` 的 `TOOL_REDIRECTS` 定义为 `'/tools/image-compress' → 'https://offline-tools.colors-cc.top/image-compress/'`，同时被两处使用：`src/app.tsx` 的 301 循环、`src/templates/site-chrome.ts` 的顶部导航 Prepare 入口。首页 hero 与工具索引的 3 个卡片则在 `src/templates/home.html` 中写死同一绝对地址。
- **渲染期只改写站内相对地址。** `src/app.tsx` 的 `prefixInternalLinks` 只替换 `href="/tools/`、`href="/#`、`href="/"`，外部绝对地址不被触及，因此同一份模板在三个语言下产出完全相同的目标地址。
- **重定向不携带查询串，且有断言守护。** `src/app.tsx` 注释说明 `c.redirect` 不携带查询串、`?mode=*` 深链会被丢弃；`scripts/verify-seo.ts` 的 `verifyRedirect` 进一步断言 `location` 不含 `?`。
- **目标站的语言契约已定稿并归档。** offline-tools 变更 `2026-10-13-add-trilingual-i18n` 已归档，其 `i18n` spec 规定：英语用根路径、日语用 `/ja`、中文用 `/zh`，**SHALL NOT 存在 `/en` 前缀**，且 SHALL NOT 依赖任何语言查询参数。该 spec 以 `/zh/video-frame/` 为例明确门户直链是契约的一部分。
- **两侧默认语言一致。** colors-cc 的 `defaultLocale` 是 `en`（无前缀路由按英语渲染），目标站的默认语言也是英语、同样占据根路径。因此「无前缀 = 英语」在两侧含义相同，不存在跨站默认语言错配。
- **三条目标路径均已上线。** 实测 `/image-compress/` 为英语、`/zh/image-compress/` 为中文、`/ja/image-compress/` 为日语，均返回 200 且 `<html lang>` 与页面语言一致；`/en/image-compress/` 返回 404。
- **公开文档也是外链出口。** `src/routes/docs/japanese.ts` 的 `japaneseLlmsContent` 同样写死了目标地址，`/ja/llms.txt` 目前把日语读者指向英语页面。文档地址与页面链接属于同一契约，必须一并修正。

## Goals / Non-Goals

**Goals:**

- 站点渲染出的每一个 offline-tools 入口都按当前页面语言生成目标地址，同页不出现语言混用。
- 迁移重定向送达的语言与访客原本浏览的语言一致。
- 语言到目标路径的映射只有一处定义，重定向与站内链接共用，避免两边漂移。
- 保持既有约定：重定向不把访客查询条件带到目标，301 状态码与既有地址兼容性不变。

**Non-Goals:**

- 不实现 offline-tools 侧的语言页面与部署（属于目标站变更）。
- 不为 `api.colors-cc.top` 片段地址、GitHub 页脚链接增加语言维度。
- 不新增 offline-tools 的工具入口：colors-cc 当前只链接 `/image-compress/`，`/video-frame/` 等路径虽然目标站已支持，但本站并无入口指向它们。
- 不改动 colors-cc 自身的页面路由与语言切换器。

## Decisions

### 决策 1：按语言前缀的**路径**表达语言，而不是查询参数

目标站 spec 明确「SHALL NOT 依赖任何语言查询参数来决定语言」，其实测行为也一致（`?lang=ja` 与无参数返回同一响应、字节相同）。

**备选（已否决）**：门户追加 `?lang=ja`。该方案在目标站的 design 中已被评估并否决——它把语言决定推迟到客户端脚本，代价是每次跳转多一次导航、多一个必须早于首帧执行的脚本，以及「参数与路径不一致时以谁为准」的额外规则；而收益只是门户少写一点 URL。目标站还给出反例场景：外部用 `?lang=` 链接时语言只由路径决定，参数不影响结果。

### 决策 2：直接复用 colors-cc 已有的语言前缀，不新增映射表

目标站的前缀恰好与 colors-cc 的内部 locale 取值一一对应：`en` → 根路径（无前缀）、`zh` → `/zh`、`ja` → `/ja`。`src/site.ts` 已有的 `localePrefix(locale)` 正是这个形态，因此目标地址可由既有函数拼接，无需为外链再造一张映射表。

**需要显式守护的是两个否定条件**：不得出现 `/en` 前缀（目标站明确不存在该路径），也不得把 BCP-47 标签 `zh-CN` 当作路径段。后者是真实风险——`localeInfo` 里的 `lang` 是 `zh-CN`，它是 `<html lang>`/`hreflang` 的权威取值，但**不是**路径段；实现必须用 locale（`zh`）而非 `lang`（`zh-CN`）拼路径。

**备选**：在 `localeInfo` 中新增一个独立的「目标站前缀」字段。否决理由：当两侧取值天然一致时，额外字段只是需要同步维护的第二来源，反而更容易漂移；否定条件更适合由测试守护。

### 决策 3：映射收敛到 `src/site.ts`，重定向与站内链接共用一份

`TOOL_REDIRECTS` 的当前价值正是「重定向与导航链接的单一来源」，该性质必须保留：把常量改为「按语言解析目标」的解析函数后，301 循环与导航渲染仍读同一处。

**备选**：让重定向先算目标语言再拼路径，站内链接各自拼。否决理由：两处各拼一次即引入漂移风险，而测试很难覆盖全部组合。

### 决策 4：无前缀迁移地址按默认语言（英语）解析到根路径

无前缀路由在 colors-cc 侧本就按默认语言 `en` 渲染，因此 `/tools/image-compress` 送达 `https://offline-tools.colors-cc.top/image-compress/`（根路径）。

**这与旧契约下的结论相反，值得留意**：如果目标站仍以中文占据根路径，无前缀地址就应该走「跨站默认语言错配」的特殊处理；现在两侧默认语言一致，该特殊情况消失，解析规则退化为「一切按 locale 拼接」。

**已知代价**：使用旧中文书签（无前缀）的访客会落到英语页面。这是站点既有模型的结果而非本变更引入——无前缀地址在 colors-cc 侧从来不是中文。显式带 `/zh` 的中文书签正确送达 `/zh/image-compress/`。

### 决策 5：保留「不泄漏查询串」的既有约定

现有实现丢弃访客查询串，`verify-seo.ts` 断言 `location` 不含 `?`。新方案不引入查询参数，因此**该断言无需修改**——这是选择路径方案的附带收益：原先若走 `?lang=` 方案，这条断言会与之直接冲突。

### 决策 6：`home.html` 用渲染期占位符注入目标地址

`src/templates/home.html` 是一份被三个语言共用的模板，其 hero 与工具索引的 4 处外链写死了绝对地址；而 `prefixInternalLinks` 只改写站内相对地址，不会触及外部地址。因此模板改为写入占位符，由 `src/app.tsx` 的 `renderHome` 按语言解析后替换——与该模板已有的 `__THEME_INIT_SCRIPT__`、`__SKIP_TO_CONTENT__` 等占位符机制一致。

**备选**：把外链改为站内相对地址再交给 `prefixInternalLinks` 处理。否决理由：外链是另一个 host 的绝对地址，伪装成相对地址会让该函数的语义（站内前缀）失真，并在替换顺序上产生隐式依赖。

### 决策 7：公开文档中的外链地址与页面链接走同一解析

`japaneseLlmsContent` 是一段多行模板字符串，其 offline-tools 地址同样按语言解析后插入，而不是再写一份字面量。若只在文档里替换字符串而不复用解析函数，就会出现「页面正确、文档过期」的分裂——本次正是因为 `/ja/llms.txt` 与页面共享同一个写死地址，才同时被契约变更影响。

**范围说明**：站点当前只为 `ja` 派生文档前缀（`documentationPath`），不存在 `/zh/llms.txt`，因此中文文档不在本次范围；英语文档中的地址恰好等于根路径，无需改动。

## Risks / Trade-offs

- **[既有测试写死单一外链常量]** → `src/index.test.ts` 的 `OFFLINE_IMAGE_COMPRESS`（9 处引用，另有两处按字面量匹配外链数量的正则）与 `scripts/verify-seo.ts` 的 `OFFLINE_IMAGE_COMPRESS` 需改为按语言表驱动，否则新增语言维度即失败；这与目标站 design 中记录的同类问题同源。
- **[把 `zh-CN` 误当作路径段]** → 见决策 2。`localeInfo.lang` 是 `zh-CN`，用它拼出的 `/zh-CN/image-compress/` 会让中文访客落到 404。任务中以「禁止 `/zh-CN` 与 `/en` 前缀」的断言守护。
- **[公开文档被遗漏]** → 见决策 7。`/ja/llms.txt` 已实测指向英语页面，任务中单列一条并在集成校验中核对。
- **[目标站回滚会同时打断语言路径]** → 两侧的回滚不是独立的：目标站回滚后 `/zh/`、`/ja/` 会变为 404 或改变语言归属，需同步回退本站的外链目标。
- **[目标站路径形态后续变化]** → 契约已归档，属稳定接口；若形态变化，解析函数集中在 `src/site.ts` 一处，改动面可控。

## Migration Plan

1. ~~等待目标站上线语言路径~~ **已完成**：`2026-10-13-add-trilingual-i18n` 已归档并上线，三条目标路径实测 200 且语言正确。
2. 合并本站外链本地化改动，重定向、站内链接与 `/ja/llms.txt` 同时切换；因是纯前端产物，部署即 `pnpm deploy`。
3. 回滚：回退本仓库 commit 即可——外链目标回到单一常量地址。注意该常量地址现今指向英语页面，因此回滚的代价是日语与中文访客再次被送到英语页，而不是死链。

## Open Questions

- 目标站的语言切换器上线后，从门户进入的访客若切换语言，是否希望门户侧感知该偏好（影响后续是否需要在链接中携带偏好而非仅路径）。当前 spec 不依赖此答案。
- 是否把 `/video-frame/` 等目标站已支持的其他工具纳入 colors-cc 的 prepare 分组入口。这是产品范围问题，不影响本变更的映射与解析机制。
- 站点是否要为中文提供 `/zh/llms.txt` 等本地化公开文档（现状只有 `ja` 有）。不影响本次外链修正。
