# Spec Delta

## Purpose

让首次访问者能够从明确的任务入口获得默认结果，理解必要参数并可靠复制；统一各工具的输入提示、语言切换、加载和失败恢复体验，使桌面、小屏幕及键盘操作均能完成相同任务。

## ADDED Requirements

### Requirement: Task-oriented entry and progressive disclosure

首页 MUST 提供按访客任务命名的占位图、配色、颜色转换和颜色名称入口。每个工具 MUST 提供可理解的默认状态、主要结果区域及明确的主要操作；高级参数和开发者代码 MUST 可按需展开，基础流程不依赖阅读 API 文档。

#### Scenario: First visit to placeholder generation
- **WHEN** 首次访问者进入首页
- **THEN** 可以直接到达生成区域，看到默认参数、预览加载状态和主要复制入口，调整尺寸或文字无需展开开发者说明

#### Scenario: Access advanced output
- **WHEN** 访客需要 HTML、CSS、Markdown 或代理说明
- **THEN** 可以展开输出选项并选择需要的格式，基础预览和主要复制入口继续可用

### Requirement: Locale switching preserves visitor state

切换语言 MUST 保留同一页面、当前工具输入和查询条件，以及已有页面片段定位。支持恢复的工具状态 MUST 在刷新和共享页面地址后保持一致；语言切换不强制重置用户输入。

#### Scenario: Switch placeholder locale
- **WHEN** 访客设置尺寸、效果、配色、速度、自定义文字和署名选项后切换至日本語
- **THEN** 日文页面恢复全部参数及同一片段位置，生成的 API 参数与切换前一致

#### Scenario: Switch other tools
- **WHEN** 访客在转换器输入 RGB 值、配色页选择主题、颜色名称页输入搜索词或流动图页修改配色后切换语言
- **THEN** 对应来源格式和值、主题、搜索词或流动图参数被保留，重新加载该地址仍可恢复这些状态

#### Scenario: Preserve invalid draft
- **WHEN** 访客在输入有误时切换语言
- **THEN** 原始输入仍可编辑，错误说明使用目标语言，系统不以默认值掩盖错误

### Requirement: Local validation and actionable recovery

工具 MUST 在相关字段附近说明输入要求，并对不合法输入提供具体修正提示。系统 MUST 保留输入与最近有效结果，区分输入错误、无搜索结果与网络失败；网络失败 MUST 提供页面内重试，重试保留当前参数。

#### Scenario: Invalid palette entry
- **WHEN** 配色输入中包含非法颜色，即使其余合法颜色数量满足要求
- **THEN** 系统指出有误条目及允许格式，不静默忽略该条目，不提交该无效配色

#### Scenario: Network failure with an existing result
- **WHEN** 请求新结果失败且页面已有有效结果
- **THEN** 页面保留该结果并明确标示其属于上次成功配置，显示当前请求失败及重试入口，用户无需刷新页面

#### Scenario: Empty filtered color list
- **WHEN** 当前搜索词没有匹配的 CSS 颜色名
- **THEN** 页面显示无匹配结果、建议或清除入口，不显示网络错误

### Requirement: Latest input controls asynchronous results

页面 MUST 只将最近一次用户意图对应的异步响应应用到结果、状态和复制内容。过期的成功或失败响应 MUST 不覆盖较新输入和结果。

#### Scenario: Out-of-order responses
- **WHEN** 访客连续选择配色 A 和 B，B 的响应先完成，随后 A 的响应或错误到达
- **THEN** 页面保持 B 的结果和状态，复制内容属于 B

#### Scenario: Edit during debounce
- **WHEN** 转换器旧请求仍在加载，访客输入新值且新请求尚处于延迟触发阶段
- **THEN** 旧响应不覆盖新输入、不宣告新输入已完成，也不将旧结果标示为新输入的结果

#### Scenario: Search before reference data loads
- **WHEN** 访客在颜色名称数据加载完成前输入查询
- **THEN** 加载完成后应用当前查询，显示过滤后的列表和数量

### Requirement: Confirmed clipboard feedback

复制操作 MUST 仅在复制接口或备用复制方法确认成功后显示成功。失败时 MUST 提供可选择的原文和手动复制说明；每次操作的反馈 MUST 与该次操作对应，支持辅助技术通知。

#### Scenario: Clipboard denied and fallback fails
- **WHEN** 浏览器拒绝剪贴板访问且备用复制方法也失败
- **THEN** 页面显示复制失败与手动复制入口，不显示“已复制”，用户能够选择完整内容并继续操作

#### Scenario: Repeated copy operations
- **WHEN** 访客连续复制多个颜色或输出
- **THEN** 每个按钮反馈对应所复制内容，较早操作的定时恢复不覆盖较新反馈

### Requirement: Placeholder generation with valid outputs

首页占位图工具 MUST 提供常见尺寸预设、可编辑尺寸、配色和文字，默认结果采用现有有效配置。高级效果与代码输出 MUST 可展开；复制链接及打开 SVG MUST 始终对应明确的有效参数，预览失败不使合法链接失效。

#### Scenario: Choose a size preset
- **WHEN** 访客选择方形、卡片或横幅尺寸预设
- **THEN** 尺寸字段同步更新，预览与复制链接使用相同尺寸，访客仍可编辑尺寸

#### Scenario: Valid URL with failed preview
- **WHEN** 参数合法但外部 SVG 预览加载失败
- **THEN** 显示失败及重试入口，保留合法链接和打开 SVG 操作；若保留旧预览则说明其来源，避免误认其为当前结果

### Requirement: Conversion pages clarify source and target

转换器 MUST 清楚说明可编辑的来源与可复制的结果，提供各格式的有效示例。定向转换页面 MUST 优先展示对应来源和目标；结果尚未就绪或当前输入无效时 MUST 阻止复制被标示为当前结果的未验证数值。

#### Scenario: Enter a directed conversion page
- **WHEN** 访客进入 `/ja/tools/rgb-to-hsl` 且没有保存的工具状态
- **THEN** RGB 为初始编辑来源，提供 RGB 示例，HSL 为优先结果，其他格式仍可查看和复制

#### Scenario: Use example and copy result
- **WHEN** 访客选择示例并等待转换成功
- **THEN** 显示对应预览及各格式结果，可以复制 HSL 等目标数值，操作旁显示确认反馈

### Requirement: Palette results support individual and group copying

配色工具 MUST 显示易理解的主题名称，支持复制单个 HEX 值及整组 HEX 配色，并提供加载状态、失败重试及可选 API 信息。刷新操作 MUST 不承诺同一主题一定产生不同配色。

#### Scenario: Copy a complete palette
- **WHEN** 一个主题的配色加载成功，访客选择复制整组配色
- **THEN** 复制按显示顺序排列、以逗号分隔的 HEX 值，可直接用于占位图配色输入

#### Scenario: Retry a theme
- **WHEN** 当前主题加载失败后访客选择重试
- **THEN** 使用该主题重新请求并保留主题选择，无需重新进入页面

### Requirement: Searchable CSS color reference

颜色名称工具 MUST 提供标准名称及颜色值的搜索说明、结果数量、清除搜索与数据加载重试入口；搜索至少保留现有标准名称查询能力。颜色卡 MUST 提供清晰的 HEX 复制操作。

#### Scenario: Clear a query
- **WHEN** 访客清除搜索词
- **THEN** 列表恢复全部已加载颜色并更新数量，焦点留在可继续输入的搜索位置

#### Scenario: Retry initial reference load
- **WHEN** 首次加载颜色名称数据失败后选择重试
- **THEN** 保留搜索词并在加载成功后按该词过滤列表

### Requirement: Fluid preview and output share valid state

流动占位图工具 MUST 保持预设、配色输入、动画速度、文字、预览状态及复制链接的一致性。无效草稿 MUST 不生成可复制的新链接；最近有效预览可以保留，但 MUST 清楚说明其为上次结果。

#### Scenario: Invalid draft after successful preview
- **WHEN** 已有成功预览后访客输入无效配色
- **THEN** 显示字段错误并停用当前草稿对应的复制操作，保留且标示上次预览，不从无效草稿拼接链接

#### Scenario: Select a preset
- **WHEN** 访客选择新的配色预设
- **THEN** 配色输入同步更新，加载成功后的预览与复制链接采用该预设，旧加载结果不覆盖它

### Requirement: Responsive and keyboard-accessible workflows

所有语言的核心工具流程 MUST 在 360 像素宽屏幕与桌面可完成，无页面级横向溢出；代码区域可以独立横向滚动。交互控件 MUST 具有可辨识标签、可见焦点和至少 44×44 CSS 像素的触摸目标，状态与错误 MUST 可被辅助技术感知。

#### Scenario: Mobile visitor completes a task
- **WHEN** 访客以 360 像素宽视口操作日文占位图或颜色工具
- **THEN** 必要输入、结果和复制按钮可见且可用，日文标签不会截断到无法辨认，页面无需横向滚动

#### Scenario: Keyboard navigation and disclosure
- **WHEN** 访客仅使用键盘操作导航、语言菜单、高级选项及输出格式
- **THEN** 可以完成选择与复制，菜单可关闭且焦点合理返回；如使用标签页则支持相应方向键操作及选中状态

#### Scenario: Accessible field error
- **WHEN** 输入校验失败或复制完成
- **THEN** 错误与字段关联、无效状态可读取，非紧急状态通过适当的实时区域通知，提示不只依赖颜色
