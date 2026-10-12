# Tasks

## 1. 修正场景措辞

- [x] 1.1 把 `openspec/specs/visitor-tool-workflows/spec.md` 中 `Responsive and keyboard-accessible workflows` 需求的 `Keyboard navigation and disclosure` 场景 WHEN/THEN 改为：WHEN 操作"导航、常显语言入口、高级选项及输出格式"，THEN 保留"可以完成选择与复制"与标签页方向键要求、把只对收合界面成立的"菜单可关闭且焦点合理返回"改为"需要开合的界面可关闭且焦点合理返回"；验证方式：`grep -n '语言菜单\|菜单可关闭' openspec/specs/visitor-tool-workflows/spec.md` 无输出，且该场景标题仍为 `Keyboard navigation and disclosure`
- [x] 1.2 逐字核对该需求未被改动的部分：正文（360 像素、无横向溢出、44×44 触摸目标、辅助技术可感知）与 `Mobile visitor completes a task`、`Accessible field error` 两个场景必须与变更前完全一致；验证方式：`diff` 该需求块与 Git HEAD 版本，输出仅包含 1.1 涉及的两行

## Workflow follow-up

- 本变更只修正规格文本，无代码改动，归档前无需运行构建或测试；归档后确认 `openspec/specs/visitor-tool-workflows/spec.md` 中该场景已是新措辞，且需求数与场景数保持不变（11 条需求 / 28 个场景）。
