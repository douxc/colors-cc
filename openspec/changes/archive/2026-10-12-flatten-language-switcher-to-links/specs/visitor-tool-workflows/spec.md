# Spec Delta

## MODIFIED Requirements

### Requirement: Locale switching preserves visitor state

切换语言 MUST 保留同一页面、当前工具输入和查询条件，以及已有页面片段定位。支持恢复的工具状态 MUST 在刷新和共享页面地址后保持一致；语言切换不强制重置用户输入。语言入口 MUST 以服务端渲染的链接完成导航：访客点击或键盘激活后 MUST 到达目标语言的对应页面，不依赖 JavaScript 才能生效。

#### Scenario: Switch placeholder locale

- **WHEN** 访客设置尺寸、效果、配色、速度、自定义文字和署名选项后切换至日本語
- **THEN** 日文页面恢复全部参数及同一片段位置，生成的 API 参数与切换前一致

#### Scenario: Switch other tools

- **WHEN** 访客在转换器输入 RGB 值、配色页选择主题、颜色名称页输入搜索词或流动图页修改配色后切换语言
- **THEN** 对应来源格式和值、主题、搜索词或流动图参数被保留，重新加载该地址仍可恢复这些状态

#### Scenario: Preserve invalid draft

- **WHEN** 访客在输入有误时切换语言
- **THEN** 原始输入仍可编辑，错误说明使用目标语言，系统不以默认值掩盖错误

#### Scenario: Pointer activation reaches the target language

- **WHEN** 访客在全球站任一页面用指针激活某一语言入口
- **THEN** 浏览器随即加载该语言的对应页面，页面语言标记与内容随之切换，切换动作不因界面收起或重绘而中断

#### Scenario: Keyboard activation reaches the target language

- **WHEN** 键盘访客把焦点移到某一语言入口并激活它
- **THEN** 该入口在获得焦点及激活期间保持可用，不会被折叠、隐藏或移出焦点顺序，并加载目标语言页面
