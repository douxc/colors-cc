# 修正键盘场景中过时的"语言菜单"措辞

## Why

`visitor-tool-workflows` 的 `Responsive and keyboard-accessible workflows` 里，场景 `Keyboard navigation and disclosure` 仍写着"操作导航、语言菜单"以及"菜单可关闭且焦点合理返回"。语言切换在 `flatten-language-switcher-to-links` 之后已经没有可展开、可关闭的菜单，只剩常显链接，因此这条场景的措辞与已实现并已声明的行为不符：照字面读会让人以为语言入口是一个需要开合并管理焦点的收合界面。

规格是评审、测试与后续变更共同依据的来源，留下与实际行为不符的描述会持续产生误导；本变更只修正该场景的措辞，使其与 `Locale switching preserves visitor state` 中"语言入口以服务端渲染的链接完成导航"保持一致。

## What Changes

- **修改** `visitor-tool-workflows` 的 `Responsive and keyboard-accessible workflows` 需求：仅改写场景 `Keyboard navigation and disclosure` 的 WHEN/THEN，把"语言菜单"改为"语言入口"，并去掉只对收合界面成立的"菜单可关闭"表述。
- **保留** 该需求的正文（360 像素宽度、无横向溢出、可辨识标签、可见焦点、至少 44×44 触摸目标、辅助技术可感知）与其余三个场景，逐字不变。
- **保留** 场景标题 `Keyboard navigation and disclosure` 不变，使已有引用该场景名的地方继续有效。
- **不涉及** 任何代码、样式、文案或用户可见行为的改动：`/en`、`/zh`、`/ja` 三个部署的行为与本次变更前完全一致。

## Capabilities

### New Capabilities

无。本变更只修正既有能力中一处与实现不符的描述，不引入新的能力边界。

### Modified Capabilities

- `visitor-tool-workflows`: `Responsive and keyboard-accessible workflows` 的 `Keyboard navigation and disclosure` 场景措辞更新——键盘用户操作的是常显语言入口（可由 Tab 到达并激活），而不是可展开、可关闭的语言菜单。

## Impact

- `openspec/specs/visitor-tool-workflows/spec.md` — 仅该需求下 `Keyboard navigation and disclosure` 场景的 WHEN/THEN 两行。
- 不受影响：`src/` 下全部代码与样式、`e2e/` 与 `src/` 下全部测试、`openspec/specs/japanese-localization/spec.md`、canonical 与 hreflang、路由与 sitemap。
- 与既有变更的关系：措辞依据是已归档的 `flatten-language-switcher-to-links`（其 delta 已把 `Locale switching preserves visitor state` 更新为"服务端渲染的链接完成导航"）；本变更消除同能力内另一条需求残留的旧表述。
