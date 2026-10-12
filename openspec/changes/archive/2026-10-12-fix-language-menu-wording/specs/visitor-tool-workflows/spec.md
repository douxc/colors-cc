# Spec Delta

## MODIFIED Requirements

### Requirement: Responsive and keyboard-accessible workflows

所有语言的核心工具流程 MUST 在 360 像素宽屏幕与桌面可完成，无页面级横向溢出；代码区域可以独立横向滚动。交互控件 MUST 具有可辨识标签、可见焦点和至少 44×44 CSS 像素的触摸目标，状态与错误 MUST 可被辅助技术感知。

#### Scenario: Mobile visitor completes a task

- **WHEN** 访客以 360 像素宽视口操作日文占位图或颜色工具
- **THEN** 必要输入、结果和复制按钮可见且可用，日文标签不会截断到无法辨认，页面无需横向滚动

#### Scenario: Keyboard navigation and disclosure

- **WHEN** 访客仅使用键盘操作导航、常显语言入口、高级选项及输出格式
- **THEN** 可以完成选择与复制，需要开合的界面可关闭且焦点合理返回；如使用标签页则支持相应方向键操作及选中状态

#### Scenario: Accessible field error

- **WHEN** 输入校验失败或复制完成
- **THEN** 错误与字段关联、无效状态可读取，非紧急状态通过适当的实时区域通知，提示不只依赖颜色
