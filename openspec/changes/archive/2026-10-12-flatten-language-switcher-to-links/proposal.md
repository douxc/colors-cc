# 彻底展平语言切换为常显链接

## Why

语言切换在所有页面、所有语言下都点不动：实测 `/en`、`/zh`、`/ja` 三个页面上，点击 `简体中文` / `English` 只会收到 `pointerdown` 和 `mousedown`，**没有 `mouseup`、没有 `click`、不产生任何导航**，用户看到的就是"面板闪一下就收了，什么都没发生"。

根因不在 URL 方案，也不在链接本身——三个语言项早就是纯 `<a href="/zh">`，canonical 与 reciprocal hreflang 也都是服务端直出。问题出在包裹它们的 `<details>` 开合外壳：`site-chrome.ts` 的 `focusout` 监听用 `queueMicrotask` 关闭面板，微任务在同一个事件循环里早于 `mouseup` 执行，链接在点击手势中途从布局中消失，浏览器因此永远不合成 `click`。键盘路径同样失效：实测在展开的面板上按一次 `Tab`，面板立即关闭、焦点落回 `BODY`，键盘用户根本到不了这三个链接。

同一页面上的主题切换（三个裸按钮、无开合外壳、零 JS）工作完全正常——差别就是那层壳。因此把语言切换收敛成与主题切换同构的常显链接，不是换一种实现，而是删掉唯一需要 JS 伺候的那部分。顺带删掉每页 719 字节的 `<details>`/`<summary>` 冗余，并让三个跨语言链接进入每一页的初始渲染 DOM，把站内链接权重还给它们。

## What Changes

- **移除** `<details class="nav-preference-control language-control">` 与 `<summary>` 外壳，语言切换改为与主题切换同构的常显分段控件：一个 `.nav-preference-control.language-control` 容器，内含 `.nav-segmented` 与三个直出链接。
- **移除** `siteNavScript` 中针对 `.language-control` 的全部行为：`focusout` + `queueMicrotask` 关闭、`keydown` Escape 关闭。删除后不再有打断点击手势或吞掉焦点的代码路径。
- **移除** 每页 719 字节的 `<details>`/`<summary>` 标记（三个选项本身各 162 字节，继续保留）。
- **新增** 服务端渲染即可用的语言入口：三个 `<a href>` 无需 JavaScript 即常显可点、可 Tab 到达、可被键盘激活；`aria-current="page"` 标记当前语言，沿用已有的 `.language-option[aria-current='page']` 青色高亮。
- **保留** 链接上的 `lang`、`data-locale`、`aria-label`（语言自称）、`aria-current="page"`，以及 `runtime.ts` 中"切换语言保留 `?palette=`/`?text=` 等查询条件与 hash"的 href 重写；保留 canonical 与全部 hreflang。
- **新增** 移动端布局约束：760px 断点以下语言项必须继续以常显、可直接点击的形态排布（具体排布方式由测量结果决定，见设计）。
- **BREAKING**（限内部标记契约）：`class="nav-switch-option language-option"` 上不再存在可展开的 `summary`，依赖 `.language-toggle` 选择器或"语言菜单可展开"假设的代码与测试必须同步更新。

## Capabilities

### New Capabilities

无。本变更只修正既有能力的行为，不引入新的能力边界。

### Modified Capabilities

- `japanese-localization`: `Explicit language navigation` 的措辞与场景依赖"展开语言菜单"这一交互；改为常显链接后，该要求必须改写为"语言入口在初始 HTML 中常显可用，标识当前语言，并由显式 URL 决定语言"，同时保留语言自称、当前语言标示与不按浏览器语言重定向的约束。
- `visitor-tool-workflows`: `Locale switching preserves visitor state` 只约束"切换后状态被保留"，并未约束"切换动作必须真的发生"。需补充：语言入口必须以服务端直出的链接完成导航，鼠标点击与键盘激活均须到达目标语言页面，不依赖 JavaScript 才能成立。

## Impact

- `src/templates/nav-controls.ts` — `renderNavUtilityControlItems` 中语言控件的标记结构（删除 `<details>`/`<summary>`）。
- `src/templates/site-chrome.ts` — `siteNavScript` 中 `.language-control` 的 `focusout`、`queueMicrotask`、Escape 处理全部删除。
- `src/templates/styles.ts` — `.language-control` 的 `position: relative`、下拉定位与 `:not([open])` 隐藏规则；760px 断点下 `.nav-actions` 的排布。
- `src/index.test.ts`、`src/templates/site-chrome.test.ts` — 依赖 `.nav-switch-option language-option`、`>简体中文</a>` 等标记字符串的断言；新增"点击语言链接真的换页"与键盘可达性的回归覆盖。
- 不受影响：`src/client/runtime.ts` 的状态保留逻辑、`src/seo.ts` 的 canonical/hreflang 输出、路由与 sitemap、`src/i18n/*` 文案。
- 依赖关系：本变更修改的两个能力目前只存在于未归档的 `add-japanese-localization-and-tool-ux` 的 delta 中（`openspec/specs/` 尚为空），归档顺序上需该变更先落地。
