import type { Locale } from '../site'

export type CommonMessages = {
  skipToContent: string
  homeLabel: string
  primaryNavigation: string
  generate: string
  prepare: string
  developers: string
  preferences: string
  menu: string
  openNavigationMenu: string
  closeNavigationMenu: string
  create: string
  convert: string
  palettes: string
  colorNames: string
  imageTools: string
  forAi: string
  languageControlLabel: string
  simplifiedChineseLabel: string
  englishLabel: string
  themeControlLabel: string
  lightThemeLabel: string
  darkThemeLabel: string
  systemThemeLabel: string
  footerNavigation: string
  footerTagline: string
  colorTool: string
  agentSkill: string
  feedbackLabel: string
}

export const commonMessages: Record<Locale, CommonMessages> = {
  en: {
    skipToContent: 'Skip to content',
    homeLabel: 'colors-cc home',
    primaryNavigation: 'Primary navigation',
    generate: 'Generate',
    prepare: 'Prepare',
    developers: 'Developers',
    preferences: 'Preferences',
    menu: 'Menu',
    openNavigationMenu: 'Open navigation menu',
    closeNavigationMenu: 'Close navigation menu',
    create: 'Create',
    convert: 'Convert',
    palettes: 'Palettes',
    colorNames: 'Color names',
    imageTools: 'Image tools',
    forAi: 'For AI',
    languageControlLabel: 'Language',
    simplifiedChineseLabel: 'Simplified Chinese',
    englishLabel: 'English',
    themeControlLabel: 'Theme',
    lightThemeLabel: 'Light theme',
    darkThemeLabel: 'Dark theme',
    systemThemeLabel: 'Follow system theme',
    footerNavigation: 'Footer navigation',
    footerTagline: 'Create, prepare, and deliver precise visual assets for people, code, and AI.',
    colorTool: 'Color tool',
    agentSkill: 'Agent Skill',
    feedbackLabel: 'Feedback'
  },
  zh: {
    skipToContent: '跳至正文',
    homeLabel: 'colors-cc 首页',
    primaryNavigation: '主导航',
    generate: '生成素材',
    prepare: '处理素材',
    developers: '开发者',
    preferences: '偏好设置',
    menu: '菜单',
    openNavigationMenu: '打开导航菜单',
    closeNavigationMenu: '关闭导航菜单',
    create: '创建',
    convert: '转换',
    palettes: '配色',
    colorNames: '颜色名称',
    imageTools: '图片工具',
    forAi: 'AI 集成',
    languageControlLabel: '语言',
    simplifiedChineseLabel: '简体中文',
    englishLabel: '英文',
    themeControlLabel: '主题',
    lightThemeLabel: '亮色主题',
    darkThemeLabel: '暗色主题',
    systemThemeLabel: '跟随系统主题',
    footerNavigation: '页脚导航',
    footerTagline: '为用户、代码与 AI 工作流生成、处理并交付精确的视觉素材。',
    colorTool: '色彩工具',
    agentSkill: '智能体技能',
    feedbackLabel: '反馈'
  }
}

type Replacement = readonly [string, string]

const replaceAll = (value: string, replacements: readonly Replacement[]): string =>
  [...replacements]
    .sort(([left], [right]) => right.length - left.length)
    .reduce((result, [source, target]) => result.replaceAll(source, target), value)

const localizeDocument = (
  html: string,
  markupReplacements: readonly Replacement[],
  scriptReplacements: readonly Replacement[] = []
): string =>
  html
    .split(/(<script\b[^>]*>[\s\S]*?<\/script>)/gi)
    .map(part => part.trimStart().toLowerCase().startsWith('<script')
      ? replaceAll(part, scriptReplacements)
      : replaceAll(part, markupReplacements))
    .join('')

const commonEnglishToChinese: readonly Replacement[] = [
  ['Skip to content', '跳至正文'],
  ['colors-cc home', 'colors-cc 首页'],
  ['Primary navigation', '主导航'],
  ['>Create</a>', '>创建</a>'],
  ['>Convert</a>', '>转换</a>'],
  ['>Palettes</a>', '>配色</a>'],
  ['>Color names</a>', '>颜色名称</a>'],
  ['>Image tools</a>', '>图片工具</a>'],
  ['>For AI</a>', '>AI 集成</a>'],
  ['Footer navigation', '页脚导航'],
  ['Agent Skill', '智能体技能']
]

const homeEnglishToChinese: readonly Replacement[] = [
  ['Create, Prepare, and Deliver Visual Assets', '生成、处理并交付视觉素材'],
  ['Create reproducible placeholders and curated palettes, process images privately in your browser, and deliver precise outputs to people, code, and AI agents.', '生成可复现的占位图与精选配色，在浏览器中私密处理图片，并向用户、代码与 AI 智能体交付精确输出。'],
  ['placeholder generator, image compressor, image watermark, SVG gradient, color API, AI agents, palette generator', '占位图生成器, 图片压缩, 图片水印, SVG 渐变, 颜色 API, AI 智能体, 配色生成器'],
  ['Visual Asset Studio | colors-cc', '视觉素材工作台 | colors-cc'],
  ['Generate, prepare, and ship visual assets for creative, development, and AI workflows.', '为创作、开发和 AI 工作流生成、处理并交付视觉素材。'],
  ['Generate placeholders, prepare images locally, and ship deterministic visual outputs.', '生成占位图，在本地处理图片，并交付稳定可复现的视觉结果。'],
  ['colors-cc Visual Asset Studio', 'colors-cc 视觉素材工作台'],
  ['Generate placeholders and palettes, prepare images locally, and ship visual assets to people, code, and AI agents.', '生成占位图与配色，在本地处理图片，并向用户、代码和 AI 智能体交付视觉素材。'],
  ['Visual asset studio · Local-first', '视觉素材工作台 · 本地优先'],
  ['Create, prepare, and deliver visual assets.', '生成、处理并交付视觉素材。'],
  ['Choose how to begin', '选择开始方式'],
  ['>Generate</strong>', '>生成</strong>'],
  ['>Prepare</strong>', '>处理</strong>'],
  ['One reproducible URL for every workflow.', '一个可复现的 URL，贯穿每种工作流。'],
  ['Reuse the same placeholder URL in previews, code, and AI prompts—no account required.', '在预览、代码和 AI 提示词中复用同一个占位图 URL，无需账户。'],
  ['Aurora mesh SVG placeholder generated by colors-cc', '由 colors-cc 生成的极光网格 SVG 占位图'],
  ['Aurora mesh placeholder', '极光网格占位图'],
  ['SVG · 1200 × 630 · deterministic URL', 'SVG · 1200 × 630 · 固定 URL'],
  ['Tools for every step', '覆盖每一步的工具'],
  ['Create reproducible placeholders and explore curated color systems.', '生成可复现的占位图，并探索精选色彩系统。'],
  ['Compress, watermark, and arrange images privately in your browser—no upload required.', '在浏览器本地压缩、添加水印并排列图片，全程无需上传。'],
  ['Generate, prepare, and ship visual assets.', '生成、处理并交付视觉素材。'],
  ['Create prototype-ready visuals, process real images locally, and deliver exact outputs to people, code, and AI agents.', '生成可直接用于原型的视觉素材，在本地处理真实图片，并向用户、代码和 AI 智能体交付精确结果。'],
  ['Choose a visual asset workflow', '选择视觉素材工作流'],
  ['Generate assets', '生成素材'],
  ['Placeholder · palette · color', '占位图 · 配色 · 颜色'],
  ['Prepare images', '处理图片'],
  ['Compress · watermark · arrange', '压缩 · 水印 · 排列'],
  ['One visual workflow', '一条视觉工作流'],
  ['From blank canvas to a ready-to-ship asset.', '从空白画布到可交付素材。'],
  ['Start with generated material or bring your own images. Every path ends in a result you can download, copy, or hand to an agent.', '从生成素材开始，或直接带来自己的图片。每条路径都会得到可下载、可复制或可交给智能体的结果。'],
  ['>Generate</h3>', '>生成</h3>'],
  ['Fast · reproducible', '快速 · 可复现'],
  ['Animated placeholder result', '动态占位图结果'],
  ['Generate tools', '生成素材工具'],
  ['>Placeholder</strong>', '>占位图</strong>'],
  ['Dynamic SVG assets', '动态 SVG 素材'],
  ['>Palette</strong>', '>配色</strong>'],
  ['>Converter</strong>', '>转换器</strong>'],
  ['HEX · RGB · HSL · CMYK', 'HEX · RGB · HSL · CMYK'],
  ['>Prepare</h3>', '>处理</h3>'],
  ['Local · no upload', '本地 · 不上传'],
  ['Image processing results', '图片处理结果'],
  ['Watermarked image proof', '图片水印效果'],
  ['Fan layout proof', '扇形排列效果'],
  ['Prepare tools', '图片处理工具'],
  ['>Compress</strong>', '>压缩</strong>'],
  ['Smaller PNG &amp; JPEG', '缩小 PNG 与 JPEG'],
  ['>Watermark</strong>', '>添加水印</strong>'],
  ['Private batch proofs', '本地批量确认图'],
  ['>Arrange</strong>', '>排列</strong>'],
  ['Fan-layout canvas', '扇形排列画布'],
  ['−72% · ready', '−72% · 可交付'],
  ['AI-Ready Color Workbench | colors-cc', '面向 AI 的色彩工作台 | colors-cc'],
  ['Design visually. Export deterministically. Give AI agents an exact, machine-readable result.', '可视化设计，以可复现的方式导出，并为 AI 智能体提供精确、机器可读的结果。'],
  ['A visual color workbench with deterministic API, code, and agent outputs.', '一款可视化色彩工作台，可生成稳定、可复现的 API 地址、代码和智能体指令。'],
  ['colors-cc Color Workbench', 'colors-cc 色彩工作台'],
  ['Create SVG placeholders and machine-ready color outputs for developers and AI agents.', '面向开发者和 AI 智能体，创建 SVG 占位图并输出机器可读的颜色数据。'],
  ['AI-Ready Placeholder & Color Workbench', '面向 AI 的占位图与色彩工作台'],
  ['Create animated SVG placeholders, palettes, and production-ready color snippets for humans and AI agents. Free, stateless, and edge-native.', '为用户和 AI 智能体制作动态 SVG 占位图、配色方案及可直接用于生产的颜色代码片段。免费、无状态，并原生运行于边缘节点。'],
  ['Color tools, ready to use.', '即开即用的色彩工具。'],
  ['Create placeholders, convert colors, build palettes, search names, and process images.', '创建占位图、转换颜色、生成配色、查询颜色名称，并在本地处理图片。'],
  ['Choose a color tool', '选择色彩工具'],
  ['Color tools', '色彩工具'],
  ['Primary tool', '主要工具'],
  ['Placeholder generator', '占位图生成器'],
  ['Create SVG placeholders', '创建 SVG 占位图'],
  ['Color converter', '颜色转换器'],
  ['Palette generator', '配色生成器'],
  ['Theme-ready colors', '生成主题配色'],
  ['Search CSS names', '搜索 CSS 颜色名称'],
  ['Most used', '最受欢迎'],
  ['Compress · watermark · layout', '压缩 · 水印 · 排版'],
  ['Local image studio · No upload', '本地图片工作台 · 不上传'],
  ['Compress, watermark, and arrange images - without uploading.', '压缩、加水印、排版图片--全程不上传。'],
  ['Compress images', '压缩图片'],
  ['Private by default', '默认私密'],
  ['Files are processed locally and never uploaded.', '图片仅在本地处理，不会上传。'],
  ['Smart compression', '智能压缩'],
  ['PNG-8 quantization plus OxiPNG, and adaptive JPEG quality.', 'PNG-8 量化加 OxiPNG 无损，JPEG 自适应质量。'],
  ['Watermark &amp; layout', '水印与排版'],
  ['Build client proofs and batch exports on one canvas.', '在一张画布上完成客户确认图与批量导出。'],
  ['>Convert</span>', '>转换</span>'],
  ['>Explore</span>', '>探索</span>'],
  ['>Reference</span>', '>查询</span>'],
  ['>Local</span>', '>本地</span>'],
  ['>Color names</strong>', '>颜色名称</strong>'],
  ['>Image tools</strong>', '>图片工具</strong>'],
  ['Color infrastructure · Human + machine', '色彩服务 · 人机皆宜'],
  ['Build in color.', '用色彩构建。'],
  ['Ship at machine speed.', '像机器一样快速交付。'],
  ['Create expressive SVG placeholders visually, then hand developers and AI agents the exact same deterministic URL, code, and instruction.', '通过可视化界面制作富有表现力的 SVG 占位图，再把对应的固定 URL、代码和指令原样交给开发者与 AI 智能体。'],
  ['Open the workbench', '开始创作'],
  ['Connect an AI agent', '接入 AI 智能体'],
  ['Product attributes', '产品能力'],
  ['Machine-readable API example', '机器可读的 API 示例'],
  ['Agent request', '智能体指令'],
  ['>Ready</span>', '>就绪</span>'],
  ['Create a <strong>1200×630 mesh hero</strong>', '创建一张 <strong>1200×630 网格渐变头图</strong>'],
  ['with an aurora palette', '使用极光配色'],
  ['One intent → one reproducible asset.', '一句需求 → 一份可复现素材。'],
  ['Give every agent precise, reliable context.', '为每个智能体提供精确、可靠的上下文。'],
  ['Choose compact API context, a structured OpenAPI contract, or an installable skill—all describe the same capabilities consistently.', '可选择精简的 API 上下文、结构化的 OpenAPI 契约或可安装的技能；三者都能一致地描述相同能力。'],
  ['A short, precise rule keeps placeholder output reliable and consistent across coding tools.', '一条简短而精确的规则，让不同编码工具可靠、一致地生成占位图。'],
  ['Developer resources', '开发者资源'],
  ['Choose the smallest reliable context for your workflow.', '为当前工作流选择最精简、可靠的上下文。'],
  ['Compact API context', '精简 API 上下文'],
  ['Structured contract', '结构化契约'],
  ['Installable instructions', '可安装的指令'],
  ['Color workbench', '色彩工作台'],
  ['Placeholder workbench', '占位图工作台'],
  ['Tune the visual once, then reuse the same reproducible URL in previews, code, and AI prompts.', '只需调整一次视觉效果，即可在预览、代码和 AI 提示词中复用同一个可复现的 URL。'],
  ['Color tasks', '色彩工具'],
  ['Live placeholder preview', '占位图实时预览'],
  ['Open SVG', '查看 SVG'],
  ['Copy URL', '复制 URL'],
  ['Generated mesh gradient placeholder preview', '生成的网格渐变占位图'],
  ['Rendering preview…', '正在生成预览…'],
  ['Placeholder controls', '占位图设置'],
  ['>Effect</span>', '>效果</span>'],
  ['>Palette</span>', '>配色</span>'],
  ['Custom HEX colors', '自定义 HEX 色值'],
  ['2–10 six-digit HEX values', '2～10 个六位 HEX 色值'],
  ['Dimensions', '尺寸'],
  ['Width in pixels', '宽度（像素）'],
  ['Height in pixels', '高度（像素）'],
  ['Animation duration', '动画时长'],
  ['Center label', '居中文字'],
  ['optional', '可选'],
  ['AI-ready color', '面向 AI 的色彩'],
  ['Show the subtle colors-cc attribution watermark', '显示淡化的 colors-cc 来源水印'],
  ['Generated output', '输出结果'],
  ['Output format', '输出格式'],
  ['Agent prompt', '智能体提示词'],
  ['Copy API URL', '复制 API URL'],
  ['One color system', '一套色彩体系'],
  ['Move from inspiration to implementation.', '让灵感落地。'],
  ['Explore, translate, and reuse color through interfaces that produce both a human result and a machine-ready contract.', '借助这些工具探索、转换并复用色彩，同时获得直观的视觉结果和便于机器读取的规范数据。'],
  ['Universal converter', '通用颜色转换器'],
  ['Keep HEX, RGB, HSL, and CMYK synchronized.', '让 HEX、RGB、HSL 和 CMYK 始终保持同步。'],
  ['Curated palettes', '精选配色方案'],
  ['Generate and copy theme-driven color systems.', '按主题生成配色方案并一键复制。'],
  ['CSS color atlas', 'CSS 颜色图谱'],
  ['Search the complete named-color directory.', '浏览并搜索完整的 CSS 颜色名称列表。'],
  ['Fluid SVG studio', '流体 SVG 工作台'],
  ['Focus on animated, production-ready hero assets.', '专为制作可直接用于生产的动态头图素材而设。'],
  ['Local image studio', '本地图片工作台'],
  ['Compress, watermark, and arrange images without uploading them.', '无需上传，即可在本地压缩、添加水印并排列图片。'],
  ['AI First by contract', '契约先行 · AI First'],
  ['Give agents facts, not screenshots.', '为智能体提供结构化数据，而不是截图。'],
  ['Every capability has a compact LLM context, a structured OpenAPI contract, and an installable skill with failure-resistant examples.', '每项能力都配有精简的 LLM 上下文、结构化的 OpenAPI 契约和可安装的技能，并附带不易出错的示例。'],
  ['Copy an agent rule', '复制智能体规则'],
  ['Drop this into Cursor, Cline, Codex, or another coding agent.', '将这条规则粘贴到 Cursor、Cline、Codex 或其他编码智能体中。'],
  ['Copy agent rule', '复制智能体规则'],
  ['Machine-readable surfaces', '机器可读资源'],
  ['Choose the smallest context your agent needs. All three describe the same API contract.', '按需选择最精简的上下文；三种资源描述的都是同一份 API 契约。'],
  ['Free color infrastructure for humans and AI agents.', '面向用户和 AI 智能体的免费色彩服务。'],
  ['Ready · SVG generated at the edge', '生成完成 · SVG 已在边缘节点生成'],
  ['Preview could not load. Your generated URL is still available below.', '预览加载失败，但仍可使用下方生成的 URL。'],
  ['Copied ✓', '复制成功 ✓'],
  ['>Create</span>', '>创建</span>'],
  ['>Palette</span>', '>配色</span>'],
  ['>Convert</span>', '>转换</span>'],
  ['>Names</span>', '>颜色名称</span>'],
  ['>Width</label>', '>宽度</label>'],
  ['>Height</label>', '>高度</label>'],
  ['Copy agent prompt', '复制智能体提示词'],
  ['Copy agent rule', '复制智能体规则']
]

const homeScriptEnglishToChinese: readonly Replacement[] = [
  ['Ready · SVG generated at the edge', '生成完成 · SVG 已在边缘节点生成'],
  ['Preview could not load. Your generated URL is still available below.', '预览加载失败，但仍可使用下方生成的 URL。'],
  ['Enter between 2 and 10 valid six-digit HEX colors.', '请输入 2～10 个有效的六位 HEX 色值。'],
  ['Rendering preview…', '正在生成预览…'],
  ['Copy agent prompt', '复制智能体提示词'],
  ['Copy API URL', '复制 API URL'],
  ['Rule copied ✓', '规则复制成功 ✓'],
  ['Copied ✓', '复制成功 ✓'],
  ["'Copy '", "'复制 '"],
  ["'Use '", "'使用 '"],
  ["' palette'", "' 配色'"]
]

const toolEnglishToChinese: readonly Replacement[] = [
  ['CSS color atlas', 'CSS 颜色图谱'],
  ['Fluid SVG studio', '流体 SVG 工作台'],
  ['Palette controls', '配色设置'],
  ['Choose a visual direction, then regenerate variations.', '选择一种视觉风格，然后生成更多配色方案。'],
  ['Theme', '主题'],
  ['Generate palette', '生成配色'],
  ['Preparing palette…', '正在生成配色…'],
  ['API request', 'API 请求地址'],
  ['Copy request URL', '复制请求地址'],
  ['Generated system', '生成的配色方案'],
  ['Click any swatch to copy its HEX value.', '点击任意色块即可复制对应的 HEX 色值。'],
  ['Generated colors', '已生成的颜色'],
  ['Curated palette generator', '精选配色生成器'],
  ['Generate a complete, curated palette for your chosen theme, inspect every color, and copy exact HEX values or the API request.', '根据所选主题生成完整、精选的配色方案，查看每种颜色，并复制精确的 HEX 色值或 API 请求地址。'],
  ['Explore · Palette', '探索 · 配色'],
  ['Search by name and copy a standards-based HEX value.', '按名称搜索，点击即可复制符合 CSS 标准的 HEX 色值。'],
  ['Search color names', '搜索颜色名称'],
  ['Try Tomato, Slate, or Blue…', '输入 Tomato、Slate 或 Blue 试试…'],
  ['Loading CSS color names…', '正在加载 CSS 颜色名称…'],
  ['CSS color search results', 'CSS 颜色搜索结果'],
  ['Search the complete CSS named-color directory and copy precise, standards-based HEX values.', '搜索完整的 CSS 颜色名称目录，并复制精确、符合标准的 HEX 色值。'],
  ['Reference · Color names', '参考 · 颜色名称'],
  ['Animation controls', '动画设置'],
  ['Fine-tune a fluid SVG and get a reproducible URL.', '精细调整流体 SVG，并获得可复现的 URL。'],
  ['Palette preset', '配色预设'],
  ['Flow state', '流动渐变'],
  ['Live animated SVG', '动态 SVG 实时预览'],
  ['Lightweight, smoothly animated, and ready to embed.', '轻量、动画流畅，可直接嵌入页面。'],
  ['Animated fluid gradient placeholder preview', '动态流体渐变占位图预览'],
  ['Create lightweight SVG placeholders with smooth, looping animation, precise control over palette, timing, and text, and a reproducible API URL.', '生成轻量、流畅循环的 SVG 占位图，精确控制配色、时长和文字，并获得可复现的 API URL。'],
  ['Create · Motion', '创作 · 动态效果'],
  ['Visual result', '颜色预览'],
  ['The swatch updates from any valid input format.', '输入任意有效格式的色值，色块都会随之更新。'],
  ['Synchronized values', '各格式色值'],
  ['Edit any field. Copy the representation you need.', '任意编辑一种格式，再复制所需的色值。'],
  ['More conversions', '更多格式转换'],
  ['Color conversion pages', '颜色格式转换页面'],
  ['Universal color converter', '通用颜色转换器'],
  ['Convert instantly between HEX, RGB, HSL, and CMYK with precise, synchronized values.', '在 HEX、RGB、HSL 和 CMYK 之间即时转换，获得精确、同步的各格式色值。'],
  ['Translate · Color', '转换 · 色彩'],
  ['>Copy</button>', '>复制</button>'],
  ['Rendering preview…', '正在生成预览…'],
  ['Ready · animated SVG loaded', '动态 SVG 加载完成'],
  ['Preview could not load. The API URL remains available below.', '预览加载失败，但仍可使用下方的 API URL。'],
  ['Ready · all formats synchronized', '转换完成 · 所有颜色格式已同步'],
  ['Animation duration', '动画时长'],
  ['Center label', '居中文字'],
  ['Custom HEX colors', '自定义 HEX 色值'],
  ['API pattern', 'API 请求示例'],
  ['Copy API URL', '复制 API URL'],
  ['optional', '可选'],
  ['Ready · enter a color in any field', '请输入任意格式的色值'],
  ['Enter between 2 and 10 valid six-digit HEX colors.', '请输入 2～10 个有效的六位 HEX 色值。'],
  ['Palette could not load. Check your connection and try again.', '配色加载失败，请检查网络连接后重试。'],
  ['Color names could not load. Refresh the page to retry.', '颜色名称加载失败，请刷新页面重试。'],
  ['No named colors match your search.', '没有找到符合条件的颜色名称。'],
  ['Request copied ✓', '请求地址复制成功 ✓'],
  ['API URL copied ✓', 'API URL 复制成功 ✓'],
  ['Generating ', '正在生成 '],
  [' palette…', ' 配色…'],
  [' colors from the edge', ' 种颜色已从边缘节点加载'],
  ['Showing ', '当前显示 '],
  [' named colors', ' 个颜色名称'],
  [' copied', ' 复制成功'],
  ['UNAVAILABLE', '不可用'],
  ['LOADING', '加载中'],
  [' COLORS', ' 种颜色'],
  ['4 FORMATS', '4 种格式']
]

const toolScriptEnglishToChinese: readonly Replacement[] = [
  ["'Ready · ' + data.colors.length + ' colors from the edge'", "'生成完成 · 已从边缘节点获取 ' + data.colors.length + ' 种颜色'"],
  ['Enter between 2 and 10 valid six-digit HEX colors.', '请输入 2～10 个有效的六位 HEX 色值。'],
  ['Palette could not load. Check your connection and try again.', '配色加载失败，请检查网络连接后重试。'],
  ['Color names could not load. Refresh the page to retry.', '颜色名称加载失败，请刷新页面重试。'],
  ['Preview could not load. The API URL remains available below.', '预览加载失败，但仍可使用下方的 API URL。'],
  ['No named colors match your search.', '没有找到符合条件的颜色名称。'],
  ['Ready · all formats synchronized', '转换完成 · 所有颜色格式已同步'],
  ['Ready · animated SVG loaded', '动态 SVG 加载完成'],
  ['Rendering preview…', '正在生成预览…'],
  ['Request copied ✓', '请求地址复制成功 ✓'],
  ['API URL copied ✓', 'API URL 复制成功 ✓'],
  ['That value is not a valid ', '输入的内容不是有效的 '],
  ['Converting ', '正在转换 '],
  ['Generating ', '正在生成 '],
  [' palette…', ' 配色…'],
  [' colors from the edge', ' 种颜色已从边缘节点加载'],
  ['Showing ', '当前显示 '],
  [' named colors', ' 个颜色名称'],
  [' copied', ' 复制成功'],
  [' color.', ' 色值。'],
  ['COPIED', '复制成功'],
  ['UNAVAILABLE', '不可用'],
  ['LOADING', '加载中'],
  [' COLORS', ' 种颜色'],
  ['Copied ✓', '复制成功 ✓'],
  ["'Copy '", "'复制 '"]
]

export const localizeHomeHtml = (html: string, locale: Locale): string =>
  locale === 'zh'
    ? localizeDocument(html, [...commonEnglishToChinese, ...homeEnglishToChinese], homeScriptEnglishToChinese)
    : html

export const localizeToolHtml = (html: string, locale: Locale): string =>
  locale === 'zh' ? localizeDocument(html, toolEnglishToChinese, toolScriptEnglishToChinese) : html
