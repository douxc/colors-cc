# localized-outbound-links Specification

## Purpose

站点把访客移交给外部目的地时，用一个与页面语言一致的规范路径表达语言，使访客到达目标即是对应语言，不经过重定向、不出现语言闪烁；并明确在目标站尚未提供该语言路径之前不得切换。

## Requirements

### Requirement: 按语言解析外部目的地的规范路径

每个语言 SHALL 映射到 offline-tools 的规范路径前缀：英语使用根路径（无前缀），中文使用 `/zh`，日语使用 `/ja`。站点 SHALL NOT 生成 `/en` 或 `/zh-CN` 前缀的目标地址。

#### Scenario: 日语页面送达日语路径
- **WHEN** 访客在 `/ja` 或任一 `/ja/tools/*` 页面激活指向 offline-tools 的链接
- **THEN** 目标地址为 `https://offline-tools.colors-cc.top/ja/image-compress/`

#### Scenario: 英语页面送达英语根路径
- **WHEN** 访客在 `/en` 或任一 `/en/tools/*` 页面激活指向 offline-tools 的链接
- **THEN** 目标地址为 `https://offline-tools.colors-cc.top/image-compress/`，且不含 `/en` 前缀

#### Scenario: 中文页面送达中文路径
- **WHEN** 访客在 `/zh` 或任一 `/zh/tools/*` 页面激活指向 offline-tools 的链接
- **THEN** 目标地址为 `https://offline-tools.colors-cc.top/zh/image-compress/`

### Requirement: 同页所有外部入口送达同一语言

同一个页面上所有指向 offline-tools 的链接 SHALL 解析为同一目标语言，不因链接所处位置而异。

#### Scenario: 五个入口保持一致
- **WHEN** 获取任一语言首页的完整 HTML
- **THEN** 顶部导航的 Prepare 入口、hero 的准备入口、工具索引 prepare 分组的三个卡片全部指向该语言的同一目标地址，不存在指向其他语言版本的混用

### Requirement: 公开文档中的外部地址按语言修正

面向该语言的公开文档中出现的 offline-tools 地址 SHALL 指向该语言的目标路径，使文档读者与页面访客到达同一语言版本。

#### Scenario: 日语文档指向日语路径
- **WHEN** 获取 `/ja/llms.txt`
- **THEN** 其中的 offline-tools 地址为 `/ja/image-compress/`，不指向英语根路径或中文路径

### Requirement: 迁移重定向按被请求地址的语言解析目标

`/tools/image-compress` 迁移重定向 SHALL 按被请求地址所属语言解析目标，使重定向后的语言与访客原本浏览的语言一致；无语言前缀的既有地址 SHALL 按其所属默认语言解析。

#### Scenario: 各语言旧地址送达对应语言
- **WHEN** 访客请求 `/ja/tools/image-compress`、`/zh/tools/image-compress` 或 `/en/tools/image-compress`
- **THEN** 三者分别重定向到 `/ja/image-compress/`、`/zh/image-compress/` 与英语根路径 `/image-compress/`，且状态码仍为 301

#### Scenario: 无前缀旧地址仍按默认语言解析
- **WHEN** 访客使用既有书签 `/tools/image-compress`
- **THEN** 该地址按站点默认语言（英语）解析目标，重定向继续有效，不出现死链

### Requirement: 移交不依赖语言查询参数

站点 SHALL 把语言表达在目标路径中，SHALL NOT 通过查询参数传递语言，SHALL NOT 向目标地址追加 `lang` 参数。

#### Scenario: 目标地址不含 lang 参数
- **WHEN** 获取任一语言页面中指向 offline-tools 的链接地址
- **THEN** 该地址不包含 `lang` 查询参数，语言语义完全由路径前缀表达

#### Scenario: 不泄漏访客原有查询条件
- **WHEN** 访客带着查询条件请求一个迁移地址
- **THEN** 重定向目标保留站点既有的查询处理约定，不把访客的查询条件原样带到目标地址

### Requirement: 语言路径不可用前不得切换目标

当目标站的某一语言路径尚未对外提供时，站点 SHALL NOT 向该路径移交访客；切换 SHALL 以目标站已实际提供对应语言路径为前提。

#### Scenario: 目标语言路径未上线
- **WHEN** 目标站对某语言路径返回 404
- **THEN** 站点不把该语言的访客送往该路径，送达该语言前需等待目标站提供对应页面
