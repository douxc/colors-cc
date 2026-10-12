# Tasks

## 1. 移除语言控件的开合行为并建立回归防线

- [x] 1.1 删除 `src/templates/site-chrome.ts` 中 `siteNavScript` 内针对 `.language-control` 的三段监听：`focusout` + `queueMicrotask` 关闭、`keydown` Escape 关闭；确认 `keydown` 与 `focusout` 两处只作用于语言控件，导航菜单的 `toggle`/Escape 行为保持原样（源码复核：改动后脚本中不再出现 `language-control`）
- [x] 1.2 在 `src/client/browser-test-utils.ts` 增加能力：在 `toolBrowser` 运行页面脚本前记录 `EventTarget.prototype.addEventListener` 的调用（元素 tagName、className、事件类型），运行后还原原方法并随返回值暴露记录，使测试可以断言"某元素没有注册某类监听"
- [x] 1.3 新建 `src/templates/language-switch.test.ts`，覆盖 1.1：加载 `/en` 与 `/zh` 后断言监听记录中不存在任何以 `.language-control` 为目标的 `focusout`、`keydown`、`toggle` 监听，且页面脚本执行零异常（`toolBrowser` 的 `errors` 为空）
- [x] 1.4 在同一测试中锁定页面脚本契约：断言渲染出的 HTML 中不存在 `class="nav-preference-control language-control"` 的 `<details>` 元素，且语言控件内没有 `<summary>`（防止开合外壳被重新引入）

## 2. 展平语言控件标记

- [x] 2.1 改写 `src/templates/nav-controls.ts` 的 `languageOption` 与 `renderNavUtilityControlItems`：语言控件改为 `.nav-preference-control.language-control` 容器 + `.nav-segmented[role="group"]` + 三个直接子级 `<a class="nav-switch-option language-option">`，保留 `href`（`localizedPath`）、`lang`、`data-locale`、`aria-label`（语言自称）与当前语言的 `aria-current="page"`；`config.enabledLocales.length > 1` 的判断保持不变
- [x] 2.2 扩展 `src/templates/site-chrome.test.ts`：对 `/zh/tools/converter` 断言三个语言入口都是 `role="group"` 的直接子级链接、当前语言恰有一个 `aria-current="page"`、且各自 `href` 指向同一工具的对应语言地址；CN 站（`enabledLocales.length === 1`）断言仍不渲染任何语言入口
- [x] 2.3 核对 `src/index.test.ts` 中依赖旧标记的断言并同步：`should render language and theme switches on %s`、`should remove the language preference visible label while keeping accessible names`、`should hide language switching while keeping theme controls`，确保三条在展平结构下仍然表达原本意图（语义不变、选择器随标记更新）

## 3. 清理下拉样式并加入移动端整行规则

- [x] 3.1 删除 `src/templates/styles.ts` 中只服务于开合外壳的规则：`.language-control` 的 `position: relative`、`.language-control > summary`、下拉绝对定位的 `.language-control .nav-segmented`、以及 `.language-control:not([open]) .nav-segmented { display: none; }`
- [x] 3.2 在 `@media (max-width: 760px)` 内新增作用域限定在语言控件内的规则，使语言项按标签自然宽度伸展（`width: auto`、`flex: 1 1 auto`、保留内边距），同时确保主题按钮仍为 44×44 方块；记录所选选择器与既有移动端 `.nav-switch-option` 44px 规则的特异性关系（该规则与基础规则同特异性、靠源码顺序胜出，覆盖规则必须提高特异性且不得波及主题按钮）
- [x] 3.3 更新 `src/index.test.ts` 中 `/@media \(max-width: 760px\)[\s\S]*\.nav-switch-option \{[^}]*width: 44px;...` 这条断言：把"移动端选项固定 44px"的约束限定到主题按钮，并补一条语言项在移动端可伸展、不被 44px 固定的断言（防止 3.2 静默失效）
- [x] 3.4 运行 `pnpm test` 与 `pnpm typecheck`，确认全量通过后再进入第 4 组

## 4. 端到端行为与响应式验证

- [x] 4.1 验证鼠标路径：启动本地站点（`node_modules/.bin/wrangler dev`），在无头浏览器中以真实指针事件激活 `/en` 上的 `简体中文`，断言最终 URL 为 `/zh` 且 `<html lang>` 为 `zh-CN`；对 `/zh` → `English`、`/ja` → `简体中文` 各重复一次，三次均须到达目标语言页面（同时确认这条路径不再依赖任何展开动作）
- [x] 4.2 验证键盘路径：直接在服务端渲染的 HTML 上按 DOM 顺序 Tab 至第二个语言入口并激活（不先展开任何界面），断言焦点落到语言链接、面板/容器不消失、并到达目标语言页面
- [x] 4.3 验证响应式：在 360、390、430、760、1280px 宽度下断言 header 无横向溢出、三个语言标签无截断（`scrollWidth <= clientWidth`）、主题按钮仍为 44×44；360px 与 1280px 为必测边界
- [x] 4.4 验证状态保留未被破坏：在 `/?palette=%23112233,%23445566&text=日本語#agent-output` 上激活语言入口，断言目标 URL 同时保留查询条件与片段（对应 `Locale switching preserves visitor state` 既有场景）

## Workflow follow-up

- 先归档前置变更 `add-japanese-localization-and-tool-ux`：本变更的两份 delta 均为 MODIFIED，而 `japanese-localization` 与 `visitor-tool-workflows` 目前只存在于该变更的 delta 中；`openspec validate` 已确认此时归档会以 "target spec does not exist" 拒绝。
- 前置变更归档后，用 `openspec validate flatten-language-switcher-to-links --strict` 复验，再归档本变更；顺序颠倒时归档会显式失败，不要用 `openspec sync` 绕过。
