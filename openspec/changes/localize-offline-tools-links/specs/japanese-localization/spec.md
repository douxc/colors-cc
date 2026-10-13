# Spec Delta

## MODIFIED Requirements

### Requirement: Deployment and route compatibility

系统 MUST 保持全球站现有英文、中文与无语言前缀地址的兼容性。中国站 MUST 保持仅简体中文部署，其 sitemap 与静态构建不增加日文页面或日文文档。通向外部工具的移交 MUST 按访客浏览的语言送达目的地对应语言的规范路径：日语页面送达 `/ja` 前缀路径，中文页面送达 `/zh` 前缀路径，英语页面送达根路径且 MUST NOT 送达 `/en` 前缀路径。

#### Scenario: Chinese deployment stays Chinese
- **WHEN** 构建或访问中国站
- **THEN** 原有中文首页和工具可用，站内语言入口不指向中国站不存在的日文页面，sitemap 保持 17 个中文页面，输出没有 `/ja` 页面或文档

#### Scenario: Existing bookmarks
- **WHEN** 访客使用已有 `/`、`/en`、`/zh` 或无前缀工具书签
- **THEN** 原有语言和工具仍然可用，既有外部工具重定向继续有效

#### Scenario: External migration keeps the browsing language
- **WHEN** 访客从 `/ja/tools/image-compress`、`/zh/tools/image-compress` 或 `/en/tools/image-compress` 进入迁移地址
- **THEN** 分别送达 `/ja` 前缀路径、`/zh` 前缀路径与英语根路径，送达语言与访客浏览页面一致，不出现英语目标被送往 `/en` 前缀路径的情况
