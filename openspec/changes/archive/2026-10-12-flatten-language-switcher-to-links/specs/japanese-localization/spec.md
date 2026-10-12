# Spec Delta

## MODIFIED Requirements

### Requirement: Explicit language navigation

语言入口 MUST 使用语言自称 `English`、`简体中文`、`日本語`，标示当前语言，并依据当前部署支持的语言提供可用入口。语言入口 MUST 在每一页初始 HTML 中常显可用，机器与访客无需展开任何收合界面即可获取其地址；其地址 MUST 为指向对应语言页面的普通链接。系统 MUST 以显式 URL 决定语言，不强制按浏览器语言重定向。

#### Scenario: Global language choices

- **WHEN** 访客在全球站任一工具页面查看语言入口
- **THEN** 能识别三种语言、当前选择及各自入口，切换到同一工具的对应语言地址

#### Scenario: Explicit Japanese URL

- **WHEN** 浏览器首选语言为英文但访客访问 `/ja/tools/converter`
- **THEN** 页面保持日文，不重定向到英文

#### Scenario: Entries present without expansion

- **WHEN** 解析任一页面的初始 HTML，不执行任何脚本、不展开任何收合界面
- **THEN** 三种语言入口及其目标地址均已存在，且各自指向对应语言的同一页面
