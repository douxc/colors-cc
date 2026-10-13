# Proposal

## Why

站点目前有三套语言（`en` / `zh` / `ja`），但通向 offline-tools 的外链只有一条写死的地址：`https://offline-tools.colors-cc.top/image-compress/`。无论访客在哪个语言版本，都被送到同一个页面——而该地址现在是**英语**版本。日语访客在 `/ja` 点导航「画像を編集」得到英语页；中文访客在 `/zh` 点「处理」同样得到英语页。

目标站已经完成三语改造（其变更 `2026-10-13-add-trilingual-i18n` 已归档），其 `i18n` spec 把门户直链定为契约：「外部站点 SHALL 能够通过链接到规范路径把用户直接送达任意语言的目标页」，并以 `/zh/video-frame/` 为例写明门户用法。该站同时规定 **SHALL NOT 依赖任何语言查询参数**，且 **SHALL NOT 存在 `/en` 前缀**。

因此门户要送达语言，唯一有效的方式是把语言写进链接路径本身；现在目标站三条语言路径均已上线可用。

## What Changes

- 站点渲染出的 5 个 offline-tools 外链入口（顶部导航 Prepare、首页 hero prepare、工具索引 prepare 分组的三个卡片）改为按当前页面语言生成目标地址，不再共用同一常量。
- `/ja/llms.txt` 文档中的 offline-tools 地址一并按语言修正——它现在指向英语页面（实测为渲染结果第 102 行）。
- 迁移重定向按被请求地址的语言解析目标：`/ja/tools/image-compress` 送达日语路径、`/zh/...` 送达中文路径、无前缀地址送达英语根路径。
- 语言到目标路径的映射收敛为单一来源，并保留「传入查询串不泄漏到目标」的既有约定。
- 外链契约以目标站 `2026-10-13-add-trilingual-i18n` 的路径形态为准：英语 = 根路径（无前缀），中文 = `/zh`，日语 = `/ja`；**不**输出 `/en` 或 `/zh-CN` 前缀。
- **不采用** `?lang=ja|zh-cn|en` 查询参数方案。目标站 spec 明确「SHALL NOT 依赖任何语言查询参数来决定语言」，其 design 已把「门户传 `?lang=` + 客户端改写」列为否决备选。

## Capabilities

### New Capabilities

- `localized-outbound-links`: 站点向外部目的地移交时，把当前语言表达在链接路径里，使访客到达即是对应语言；涵盖语言到外部规范路径的映射、各语言页面渲染出的外部链接一致、以及外链目标不存在时的切换时机约束。

### Modified Capabilities

- `japanese-localization`: 「Deployment and route compatibility」要求「既有外部工具重定向继续有效」。该要求只保证重定向存在，未规定送达语言；本变更把「重定向送达与页面语言一致的外部路径」补进该要求，并明确英语目标使用根路径而非 `/en` 前缀。

## Impact

**源码**
- `src/site.ts`：`TOOL_REDIRECTS` 目前是「源路径 → 单一绝对地址」的常量，且被重定向与站内导航共用（单一定义点）。需要改为按语言解析目标。
- `src/app.tsx`：`createLocalizedPages` 的重定向循环在 `includeTools` 分支内；现注释说明 `c.redirect` 不携带查询串、`?mode=*` 深链会被丢弃。
- `src/templates/site-chrome.ts`：`renderSiteNav` 的 Prepare 入口直接读 `TOOL_REDIRECTS`。
- `src/templates/home.html`：hero `data-brand-path="prepare"` 与工具索引 prepare 分组的三个链接写死了绝对地址，渲染期由 `prefixInternalLinks` 处理（该函数只改写 `href="/..."`，外部绝对地址不被触及）。
- `src/routes/docs/japanese.ts`：`japaneseLlmsContent` 中写死同一绝对地址，需随语言修正。

**测试与校验**
- `src/index.test.ts`：`OFFLINE_IMAGE_COMPRESS` 常量在该文件出现 9 处——1 处定义、1 处 `TOOL_REDIRECTS` 映射断言、4 处重定向 `location` 断言、3 处链接 `href` 断言（hero、工具索引、共享品牌导航），另有 1 处断言 `scripts/verify-seo.ts` 的源文本包含该常量名；此外第 405、499 行还有按字面量匹配外部链接数量的正则断言。
- `scripts/verify-seo.ts`：`OFFLINE_IMAGE_COMPRESS` / `verifyRedirect` / `verifyMigratedToolRedirects` 目前断言重定向目标为单一常量，并额外断言 `location` 不含 `?`。
- `e2e/language-switch.e2e.test.ts`：语言切换的浏览器验证。

**外部依赖（已解除）**
- offline-tools 变更 `2026-10-13-add-trilingual-i18n` 已归档并上线，三条目标路径均实测可用：`/image-compress/` 为英语、`/zh/image-compress/` 为中文、`/ja/image-compress/` 为日语；`/en/image-compress/` 确认 404（该前缀不存在）。

**不在本次范围**
- offline-tools 侧的语言实现与部署（已完成）。
- 站内 `api.colors-cc.top` 片段地址与 GitHub 页脚链接：前者由目标站 spec 明确不读语言参数，后者无语言维度。
- colors-cc 自身已有的 `/en`、`/zh`、`/ja` 页面路由与语言切换器（已实现）。
- 中文公开文档：`documentationPath` 只为 `ja` 派生 `/ja` 前缀，站点当前不存在 `/zh/llms.txt`，因此本次只涉及英语文档（无页面引用该地址）与 `/ja/llms.txt`。
