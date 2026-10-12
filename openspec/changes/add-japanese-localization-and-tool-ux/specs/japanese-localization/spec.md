# Spec Delta

## Purpose

为全球站的日文访客提供完整、可理解的页面与公开文档，使访客能够用日文完成颜色和占位图任务，并通过正确的语言入口及搜索元信息发现对应内容。

## ADDED Requirements

### Requirement: Complete Japanese page coverage

全球站 MUST 提供 `/ja` 首页及现有全部 16 个工具页面的日文版本。页面中的说明、导航、表单、主题与预设显示名称、按钮、反馈、辅助技术文本，以及生成片段中的人类可读说明 MUST 使用日文。

#### Scenario: Visit all Japanese page types
- **WHEN** 访客访问 `/ja`、`/ja/tools/converter`、12 个 HEX/RGB/HSL/CMYK 两两定向转换地址，以及 `/ja/tools/random-palette`、`/ja/tools/color-names`、`/ja/tools/fluid-placeholder`
- **THEN** 每个地址返回可用页面，页面声明 `lang="ja"`，标题、正文与共享导航使用日文

#### Scenario: Japanese dynamic feedback
- **WHEN** 日文访客触发加载、复制成功或失败、无搜索结果、输入错误、网络错误或重试
- **THEN** 可见消息和辅助技术收到的反馈均为日文，不出现英文默认提示

#### Scenario: Generated human-readable text
- **WHEN** 访客在日文页面复制 HTML、Markdown 或供代理使用的说明
- **THEN** 自动生成的说明及替代文本使用日文，用户自填文字保留原文，代码语法和 API 地址仍然有效

### Requirement: Localized display labels preserve machine contracts

系统 MUST 翻译主题、效果和预设的显示名称，同时保留 API 参数值、标准 CSS 颜色名、色值、代码标识符及外部服务地址。

#### Scenario: Localized effect selection
- **WHEN** 访客选择显示为日文的流动效果或赛博朋克配色
- **THEN** 请求仍使用既有 `fluid` 或 `cyberpunk` 参数，复制结果与对应预览采用相同参数

#### Scenario: CSS standard names
- **WHEN** 访客查看或复制 CSS 颜色名称参考中的 `Tomato`
- **THEN** 页面说明使用日文，标准名称 `Tomato` 与其 HEX 值保持准确，搜索提示解释可使用这些标准名称

### Requirement: Additive Japanese public documentation

全球站 MUST 提供 `/ja/llms.txt`、`/ja/skills/colors-cc.md` 和 `/ja/openapi.json`。文档描述 MUST 使用日文，保留现有 API 结构、参数、操作标识符和有效示例；日文页面的文档入口 MUST 指向对应日文文档。

#### Scenario: Follow Japanese developer links
- **WHEN** 日文访客使用页面中的 LLM 文档、代理技能或 OpenAPI 链接
- **THEN** 进入相应的 `/ja/` 文档，获得日文说明；OpenAPI 文档仍为可解析的兼容 JSON 规范

#### Scenario: Legacy documentation consumer
- **WHEN** 既有客户端请求 `/llms.txt`、`/skills/colors-cc.md` 或 `/openapi.json`
- **THEN** 既有地址、响应类型和 API 契约继续可用，不强制迁移到日文文档

### Requirement: Explicit language navigation

语言菜单 MUST 使用语言自称 `English`、`简体中文`、`日本語`，标示当前语言，并依据当前部署支持的语言提供可用入口。系统 MUST 以显式 URL 决定语言，不强制按浏览器语言重定向。

#### Scenario: Global language choices
- **WHEN** 访客在全球站任一工具页面展开语言菜单
- **THEN** 能识别三种语言、当前选择及各自入口，切换到同一工具的对应语言地址

#### Scenario: Explicit Japanese URL
- **WHEN** 浏览器首选语言为英文但访客访问 `/ja/tools/converter`
- **THEN** 页面保持日文，不重定向到英文

### Requirement: Japanese search metadata and discovery

日文页面 MUST 使用日文标题、描述及相关结构化文本，canonical 指向自身日文路径。各语言页面 MUST 提供互相对应的 `ja` hreflang；全球 XML 和 TXT sitemap MUST 包含全部日文页面，保留既有语言页面。

#### Scenario: Metadata for a Japanese tool
- **WHEN** 获取 `/ja/tools/hex-to-rgb` 的页面源码
- **THEN** canonical 为全球站该日文地址，Open Graph locale 为 `ja_JP`，结构化数据声明日文，并具有对应英文、简体中文、日文及既有 x-default 入口

#### Scenario: Sitemap completeness
- **WHEN** 获取全球站 `/sitemap.xml` 和 `/sitemap.txt`
- **THEN** 两者均列出 17 个日文页面，全球语言页面共 51 个；XML 中的语言映射互相对应且不将查询参数作为 canonical

#### Scenario: Reciprocal deployment alternates
- **WHEN** 获取全球英文、全球中文或中国站中文工具页面
- **THEN** 其 hreflang 包含同一工具的全球日文地址，原有中国站中文和 x-default 映射保持有效

### Requirement: Deployment and route compatibility

系统 MUST 保持全球站现有英文、中文与无语言前缀地址的兼容性。中国站 MUST 保持仅简体中文部署，其 sitemap 与静态构建不增加日文页面或日文文档。

#### Scenario: Chinese deployment stays Chinese
- **WHEN** 构建或访问中国站
- **THEN** 原有中文首页和工具可用，站内语言入口不指向中国站不存在的日文页面，sitemap 保持 17 个中文页面，输出没有 `/ja` 页面或文档

#### Scenario: Existing bookmarks
- **WHEN** 访客使用已有 `/`、`/en`、`/zh` 或无前缀工具书签
- **THEN** 原有语言和工具仍然可用，既有外部工具重定向继续有效
