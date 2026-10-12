# 实现与验收记录

变更：`add-japanese-localization-and-tool-ux`。验收日期：2026-10-11 至 2026-10-12。

## 自动检查与构建

| 检查 | 结果 |
| --- | --- |
| `pnpm validate` | 类型检查通过；11 个测试文件、108 个测试全部通过 |
| `pnpm build:worker` | dry-run 成功；291.54 KiB，gzip 70.24 KiB |
| `pnpm build:vps` | 生成 27 个文件；18 个 HTML 均为中文（含根首页兼容地址）；无 `/ja` 页面或文档 |
| 全球 SEO 本地检查 | 51 个语言页面、两个 sitemap、爬虫响应、资源及迁移重定向通过 |
| 中国站 SEO 本地检查 | 17 个中文语言页面通过；英文、日文页面及日文文档返回 404 |

构建与测试日志位于 `dist/japanese-validation.log`、`dist/japanese-worker-build.log`、`dist/japanese-vps-build.log`。SEO 日志位于 `dist/japanese-qa/seo-global.log` 与 `seo-cn.log`。

## 日文页面覆盖

下列 17 页逐页检查了标题、说明、控件标签、动态状态及可访问名称。全部页面在 360×800 与 1280×800 视口内无页面级横向溢出；已显示的交互目标均至少 44×44 CSS 像素。代码容器采用独立滚动。逐页尺寸及动态状态记录见 `dist/japanese-qa/pages.json`（34 条记录）。

| 地址 | 可见/动态/ARIA 检查 | 标准机器值 |
| --- | --- | --- |
| `/ja` | 配色、尺寸、文字、预览状态、高级设置、复制与五种输出 | 原效果 ID、HEX、尺寸、署名参数保留 |
| `/ja/tools/converter` | 当前来源、四种示例、结果、复制、重试 | HEX/RGB/HSL/CMYK 保留 |
| `/ja/tools/hex-to-rgb` | HEX 来源优先，RGB 目标优先；真实 API 成功 | HEX/RGB 保留 |
| `/ja/tools/hex-to-hsl` | HEX 来源优先，HSL 目标优先；真实 API 成功 | HEX/HSL 保留 |
| `/ja/tools/hex-to-cmyk` | HEX 来源优先，CMYK 目标优先；真实 API 成功 | HEX/CMYK 保留 |
| `/ja/tools/rgb-to-hex` | RGB 来源优先，HEX 目标优先；真实 API 成功 | RGB/HEX 保留 |
| `/ja/tools/rgb-to-hsl` | RGB 来源优先，HSL 目标优先；真实 API 成功 | RGB/HSL 保留 |
| `/ja/tools/rgb-to-cmyk` | RGB 来源优先，CMYK 目标优先；真实 API 成功 | RGB/CMYK 保留 |
| `/ja/tools/hsl-to-hex` | HSL 来源优先，HEX 目标优先；真实 API 成功 | HSL/HEX 保留 |
| `/ja/tools/hsl-to-rgb` | HSL 来源优先，RGB 目标优先；真实 API 成功 | HSL/RGB 保留 |
| `/ja/tools/hsl-to-cmyk` | HSL 来源优先，CMYK 目标优先；真实 API 成功 | HSL/CMYK 保留 |
| `/ja/tools/cmyk-to-hex` | CMYK 来源优先，HEX 目标优先；真实 API 成功 | CMYK/HEX 保留 |
| `/ja/tools/cmyk-to-rgb` | CMYK 来源优先，RGB 目标优先；真实 API 成功 | CMYK/RGB 保留 |
| `/ja/tools/cmyk-to-hsl` | CMYK 来源优先，HSL 目标优先；真实 API 成功 | CMYK/HSL 保留 |
| `/ja/tools/random-palette` | 四主题、单色及整组复制、数量、加载与重试 | cyberpunk/vaporwave/retro/monochrome 保留 |
| `/ja/tools/color-names` | 搜索、数量、清除、卡片复制、失败重试 | 标准英文 CSS 名称与 HEX 保留 |
| `/ja/tools/fluid-placeholder` | 四预设、配色、周期、文字、预览、复制与重试 | 原预设颜色、fluid 与 API 参数保留 |

实际转换结果存在来源格式的正常舍入差异，例如 HSL 示例转换后的 HEX 为 `#7C3BED`，页面展示 API 返回的数值。

三份日文文档均以本地 HTTP 响应确认，记录见 `dist/japanese-qa/documents.json`：

| 地址 | 响应 | 内容检查 |
| --- | --- | --- |
| `/ja/llms.txt` | 200，text/plain | 日文使用说明及原外部 API 地址 |
| `/ja/openapi.json` | 200，application/json | 可解析的 OpenAPI 3.0.0；日文说明；机器结构与根规范一致 |
| `/ja/skills/colors-cc.md` | 200，text/markdown | 日文步骤、参数规则及有效代码示例 |

根文档保持原地址与英文内容。JSON 结构兼容性、语言映射、canonical、Open Graph 与 reciprocal hreflang 另由集成测试验证。

## 三语言访客流程

真实浏览器中，对英文、中文、日文分别在 360 与 1280 像素宽度完成以下五组流程，共 30 组。每组核对复制得到的实际剪贴板内容、同页语言切换后的查询状态和刷新后的地址。另补充 30 组实际字段恢复检查，见 `dist/japanese-qa/restoration.json`。

| 工具 | 修改与复制 | 切换/刷新 |
| --- | --- | --- |
| 首页 | 输入 `日本語 & preview`；复制与打开 SVG 地址一致 | 文字及其他草稿参数保留 |
| 转换器 | 输入 `#112233`；等待结果并复制 HEX | 来源格式与色值保留 |
| 配色 | 选择 retro；整组复制按显示顺序排列 | 主题保留 |
| 颜色名称 | 搜索 Blue；复制首个匹配颜色的 HEX | 搜索词保留 |
| 流动图 | 输入 `#112233,#445566`；复制对应有效链接 | 配色保留；补查周期 6 与文字「流動」恢复 |

额外检查三语言五类工具展开菜单及高级区域后的触摸目标，30 个组合均无小于 44×44 的目标或页面溢出。复选框由完整标签提供触摸区域。

键盘检查：Enter 展开菜单和高级设置；Escape 关闭语言菜单并返回 summary；小屏幕导航可关闭并恢复焦点。输出标签支持左右方向键、Home、End，选中标签与 tabpanel 关联一致；键盘复制 HTML 的实际内容与选中格式一致。字段错误具有 `aria-invalid` 和 `aria-describedby`，状态及复制反馈使用实时区域。

截图：`dist/japanese-qa/desktop.jpg`、`mobile.jpg`、`manual-copy.jpg`。

## 可控故障与恢复

| 场景 | 验证方式与结果 |
| --- | --- |
| 网络失败与重试 | 真实浏览器的临时本地服务先返回 503，再返回有效颜色数据；重试后仍按 Blue 过滤，查询没有丢失 |
| 剪贴板与备用方法均失败 | 临时页面让两种方法失败；三语言均显示失败提示及完整原文，无成功反馈；原文自动选中，Escape 返回色卡焦点 |
| 图片乱序与失败 | 客户端回归测试控制 onload/onerror 顺序；旧成功/失败均不能覆盖新预设；合法 URL 在预览失败时仍可复制并重试 |
| 延迟期间的新意图 | 回归测试控制转换器请求、配色请求及延迟触发；旧响应不能被标为当前结果 |
| 无效草稿 | 空尺寸、越界尺寸、无效配色条目和未知枚举均保留原输入；阻止当前输出复制；错误明确关联字段 |
| 搜索早于数据完成 | 回归测试确认数据完成后应用当前搜索词，失败重试不清空搜索 |
| 连续复制 | 回归测试确认较早复制及恢复计时不会覆盖较新反馈 |

真实浏览器故障记录见 `dist/japanese-qa/faults.json`。临时故障服务及生成资料仅用于本地验收，未加入生产路由。

## 验收范围与限制

- 本地页面与外部 API 的正常流程已验证；请求乱序和故障由可控回归测试及本地故障页面验证，不保证外部服务持续可用。
- 使用浏览器可访问性树、属性检查和实际键盘流程；未逐一验证各实体移动设备或屏幕阅读器的语音输出。
- Wrangler 本地预览会改写部分外部重定向地址；因此完整 SEO 检查针对本地 Hono 原始响应执行，应用重定向另有集成测试。
- 浏览器查看纯文本文档曾受到查看器限制，使用本地 HTTP 响应确认内容与响应类型。
- 追加复查曾因自动审批使用额度限制中断；用户继续后已完成实际字段恢复检查及截图保存。
- 当前成果为本地实现与构建，尚未发布。线上收录及访问变化需在发布后另行观察。
