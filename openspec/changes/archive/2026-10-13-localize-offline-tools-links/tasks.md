# Tasks

## 1. 前置确认：目标站语言路径已可用（已完成）

- [x] 1.1 确认 offline-tools 变更 `2026-10-13-add-trilingual-i18n` 已归档并上线，实测三条目标地址：`/image-compress/` 返回 200 且 `lang="en"`、`/zh/image-compress/` 返回 200 且 `lang="zh-CN"`、`/ja/image-compress/` 返回 200 且 `lang="ja"`；并确认 `/en/image-compress/` 返回 404（该前缀不存在）。验证方式：已记录状态码与页面标题，三条语言路径均可用，本组通过。

## 2. 外链语言映射（单一来源）

- [x] 2.1 在 `src/site.ts` 把 `TOOL_REDIRECTS` 改为按语言解析目标地址的单一来源：英语拼接根路径、中文拼接 `/zh`、日语拼接 `/ja`，复用既有的 `localePrefix`，不要用 `localeInfo.lang`（`zh-CN`）拼路径。验证方式：`pnpm typecheck` 通过，并对三种语言断言解析结果分别为 `/image-compress/`、`/zh/image-compress/`、`/ja/image-compress/`，且不含 `lang` 查询参数。
- [x] 2.2 在 `src/index.test.ts` 为映射与目标地址形态补充表驱动断言（三语言 × 目标地址、禁止 `/en` 与 `/zh-CN` 前缀、禁止 `lang` 查询参数），并替换写死单一常量的断言（该常量共 9 处引用，另有两处按字面量匹配外链数量的正则需一并表驱动化）。验证方式：`pnpm test` 通过。

## 3. 迁移重定向按语言解析

- [x] 3.1 修改 `src/app.tsx` 的迁移重定向，使其按被请求地址所属语言解析目标；保持 301、保持既有丢弃访客查询串的约定。验证方式：`pnpm test` 中 `/ja/tools/image-compress`、`/zh/tools/image-compress`、`/en/tools/image-compress`、`/tools/image-compress` 四类地址的断言分别指向 `/ja/image-compress/`、`/zh/image-compress/`、根路径 `/image-compress/`、默认语言根路径，且 `location` 不含 `?`。

## 4. 站内链接按语言渲染

- [x] 4.1 修改 `src/templates/site-chrome.ts` 的顶部导航 Prepare 入口，使其使用按语言解析的目标地址。验证方式：`pnpm test` 中共享品牌导航断言在 `/`、`/tools/converter`、`/ja`、`/zh` 下分别指向根路径、根路径、`/ja/image-compress/`、`/zh/image-compress/`。
- [x] 4.2 把 `src/templates/home.html` 的 hero 准备入口与工具索引 prepare 分组的三个卡片改为占位符，并在 `src/app.tsx` 的 `renderHome` 中按语言替换（见 design 决策 6），保证同一页面上五个外链入口一致。验证方式：`pnpm test` 中断言任一语言首页的五个入口全部指向该语言的同一目标地址，且不存在指向其他语言版本的混用。

## 5. 公开文档按语言修正

- [x] 5.1 修改 `src/routes/docs/japanese.ts` 的 `japaneseLlmsContent`，使其中的 offline-tools 地址复用同一解析函数而非写死字面量（见 design 决策 7）。验证方式：`pnpm test` 中断言 `/ja/llms.txt` 的内容包含 `https://offline-tools.colors-cc.top/ja/image-compress/`，且不包含未带前缀的 `https://offline-tools.colors-cc.top/image-compress/`。
- [x] 5.2（范围追加，用户确认）英语 `src/routes/docs/llms.ts` 中的同一处过期地址改为直链 offline-tools 规范路径，去掉 `https://colors-cc.top/tools/image-compress` 这一跳 301。验证方式：`pnpm test` 中断言 `/llms.txt` 包含 `https://offline-tools.colors-cc.top/image-compress/` 且不再包含 `colors-cc.top/tools/image-compress`。

## 6. 部署校验脚本对齐

- [x] 6.1 更新 `scripts/verify-seo.ts`，把写死的单一外链常量断言改为按语言断言四个迁移地址的目标，并保留「`location` 不含 `?`」的检查。验证方式：`pnpm typecheck` 与 `pnpm test` 通过；`pnpm verify:seo` 在目标站语言路径可用时通过，不可用时给出明确失败信息而非误报成功。

## 7. 集成校验

- [x] 7.1 运行 `pnpm validate` 与 `pnpm test:e2e`，确认全量类型检查、单元测试与语言切换浏览器验证通过，且未引入非外链相关的断言回归。验证方式：两条命令均以 0 退出。
- [x] 7.2 构建产物核对：运行 `pnpm build:worker` 后确认产物中不存在 `?lang=` 形式的目标地址，且不出现 `/en/` 或 `/zh-CN/` 前缀的 offline-tools 地址。验证方式：对 `dist/worker` 检索上述形态，结果均为零命中。
- [x] 7.3 线上核验（部署后）：分别获取 `https://colors-cc.top/`、`/zh`、`/ja` 三个首页，确认页面上五个 offline-tools 入口分别指向 `/image-compress/`、`/zh/image-compress/`、`/ja/image-compress/`，并抽验三条目标地址返回的语言与来源页面一致。验证方式：记录三个语言首页的入口地址与三条目标地址的 `<html lang>`。

## Workflow follow-up

- 实现完成并核验后归档本变更：`/openspec-archive-change`。
- 若目标站再次变更语言路径或回滚三语改造，需同步回退本仓库的外链目标；当前根路径指向英语，回滚的代价是日语与中文访客再次被送到英语页。
