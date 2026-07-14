import type { Locale } from '../site'

export type CommonMessages = {
  skipToContent: string
  homeLabel: string
  primaryNavigation: string
  create: string
  convert: string
  palettes: string
  colorNames: string
  imageTools: string
  colorTheme: string
  systemTheme: string
  lightTheme: string
  darkTheme: string
  forAi: string
  switchLanguage: string
  switchLanguageText: string
  footerNavigation: string
  footerTagline: string
  colorTool: string
  agentSkill: string
}

export const commonMessages: Record<Locale, CommonMessages> = {
  en: {
    skipToContent: 'Skip to content',
    homeLabel: 'colors-cc home',
    primaryNavigation: 'Primary navigation',
    create: 'Create',
    convert: 'Convert',
    palettes: 'Palettes',
    colorNames: 'Color names',
    imageTools: 'Image tools',
    colorTheme: 'Color theme',
    systemTheme: 'System',
    lightTheme: 'Light',
    darkTheme: 'Dark',
    forAi: 'For AI',
    switchLanguage: 'Switch language',
    switchLanguageText: '中文',
    footerNavigation: 'Footer navigation',
    footerTagline: 'Edge-native color infrastructure for humans and AI agents.',
    colorTool: 'Color tool',
    agentSkill: 'Agent Skill'
  },
  zh: {
    skipToContent: '跳到主要内容',
    homeLabel: 'colors-cc 首页',
    primaryNavigation: '主导航',
    create: '创作',
    convert: '转换',
    palettes: '配色',
    colorNames: '颜色名',
    imageTools: '图片工具',
    colorTheme: '颜色主题',
    systemTheme: '跟随系统',
    lightTheme: '浅色',
    darkTheme: '深色',
    forAi: 'AI 接入',
    switchLanguage: '切换语言',
    switchLanguageText: 'English',
    footerNavigation: '页脚导航',
    footerTagline: '为用户和 AI 智能体提供边缘原生颜色基础设施。',
    colorTool: '颜色工具',
    agentSkill: '智能体技能'
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
  ['Skip to content', '跳到主要内容'],
  ['colors-cc home', 'colors-cc 首页'],
  ['Primary navigation', '主导航'],
  ['Color theme', '颜色主题'],
  ['<option value="system">System</option>', '<option value="system">跟随系统</option>'],
  ['<option value="light">Light</option>', '<option value="light">浅色</option>'],
  ['<option value="dark">Dark</option>', '<option value="dark">深色</option>'],
  ['>Create</a>', '>创作</a>'],
  ['>Convert</a>', '>转换</a>'],
  ['>Palettes</a>', '>配色</a>'],
  ['>Color names</a>', '>颜色名</a>'],
  ['>Image tools</a>', '>图片工具</a>'],
  ['>For AI</a>', '>AI 接入</a>'],
  ['Footer navigation', '页脚导航'],
  ['Agent Skill', '智能体技能']
]

const homeEnglishToChinese: readonly Replacement[] = [
  ['AI-Ready Color Workbench | colors-cc', 'AI 友好颜色工作台 | colors-cc'],
  ['Design visually. Export deterministically. Give AI agents an exact, machine-readable result.', '可视化设计、确定性导出，并为 AI 智能体提供精确的机器可读结果。'],
  ['A visual color workbench with deterministic API, code, and agent outputs.', '可视化颜色工作台，提供确定性的 API、代码和智能体输出。'],
  ['colors-cc Color Workbench', 'colors-cc 颜色工作台'],
  ['Create SVG placeholders and machine-ready color outputs for developers and AI agents.', '为开发者和 AI 智能体创建 SVG 占位图和机器可读颜色输出。'],
  ['AI-Ready Placeholder & Color Workbench', 'AI 友好的占位图与颜色工作台'],
  ['Create animated SVG placeholders, palettes, and production-ready color snippets for humans and AI agents. Free, stateless, and edge-native.', '为用户和 AI 智能体创建动态 SVG 占位图、配色和可直接上线的颜色代码。免费、无状态、边缘原生。'],
  ['Color infrastructure · Human + machine', '颜色基础设施 · 人类 + 机器'],
  ['Build in color.', '用颜色构建。'],
  ['Ship at machine speed.', '以机器速度交付。'],
  ['Create expressive SVG placeholders visually, then hand developers and AI agents the exact same deterministic URL, code, and instruction.', '可视化创建富有表现力的 SVG 占位图，再将同一条可重现 URL、代码和指令交给开发者与 AI 智能体。'],
  ['Open the workbench', '打开工作台'],
  ['Connect an AI agent', '接入 AI 智能体'],
  ['Product attributes', '产品特性'],
  ['Machine-readable API example', '机器可读 API 示例'],
  ['Agent request', '智能体请求'],
  ['>Ready</span>', '>就绪</span>'],
  ['Create a <strong>1200×630 mesh hero</strong>', '创建一张 <strong>1200×630 网格首图</strong>'],
  ['with an aurora palette', '使用极光配色'],
  ['One intent → one reproducible asset.', '一个意图 → 一份可重现资产。'],
  ['Color workbench', '颜色工作台'],
  ['Color tasks', '颜色任务'],
  ['Live placeholder preview', '占位图实时预览'],
  ['Open SVG', '打开 SVG'],
  ['Copy URL', '复制 URL'],
  ['Generated mesh gradient placeholder preview', '生成的网格渐变占位图预览'],
  ['Rendering preview…', '正在渲染预览…'],
  ['Placeholder controls', '占位图控制'],
  ['>Effect</span>', '>效果</span>'],
  ['>Palette</span>', '>配色</span>'],
  ['Custom HEX colors', '自定义 HEX 颜色'],
  ['2–10 six-digit HEX values', '2–10 个六位 HEX 值'],
  ['Dimensions', '尺寸'],
  ['Width in pixels', '宽度（像素）'],
  ['Height in pixels', '高度（像素）'],
  ['Animation duration', '动画时长'],
  ['Center label', '中央标签'],
  ['optional', '可选'],
  ['AI-ready color', 'AI 友好颜色'],
  ['Show the subtle colors-cc attribution watermark', '显示低调的 colors-cc 归属水印'],
  ['Generated output', '生成结果'],
  ['Output format', '输出格式'],
  ['Agent prompt', '智能体提示词'],
  ['Copy API URL', '复制 API URL'],
  ['One color system', '一套颜色系统'],
  ['Move from inspiration to implementation.', '从灵感走向实现。'],
  ['Explore, translate, and reuse color through interfaces that produce both a human result and a machine-ready contract.', '通过同时产出人类结果和机器可读契约的界面，探索、转换并复用颜色。'],
  ['Universal converter', '通用颜色转换器'],
  ['Keep HEX, RGB, HSL, and CMYK synchronized.', '保持 HEX、RGB、HSL 和 CMYK 同步。'],
  ['Curated palettes', '精选配色'],
  ['Generate and copy theme-driven color systems.', '生成并复制主题驱动的颜色系统。'],
  ['CSS color atlas', 'CSS 颜色图鉴'],
  ['Search the complete named-color directory.', '搜索完整的颜色名目录。'],
  ['Fluid SVG studio', '流体 SVG 工作室'],
  ['Focus on animated, production-ready hero assets.', '专注于可直接上线的动态首图资产。'],
  ['Local image studio', '本地图片工作室'],
  ['Compress, watermark, and arrange images without uploading them.', '无需上传即可压缩、添加水印和排列图片。'],
  ['AI First by contract', '契约驱动的 AI First'],
  ['Give agents facts, not screenshots.', '给智能体事实，而不是截图。'],
  ['Every capability has a compact LLM context, a structured OpenAPI contract, and an installable skill with failure-resistant examples.', '每项能力都提供精简的 LLM 上下文、结构化 OpenAPI 契约和带稳健示例的可安装技能。'],
  ['Copy an agent rule', '复制智能体规则'],
  ['Drop this into Cursor, Cline, Codex, or another coding agent.', '将它放入 Cursor、Cline、Codex 或其他编码智能体。'],
  ['Copy agent rule', '复制智能体规则'],
  ['Machine-readable surfaces', '机器可读入口'],
  ['Choose the smallest context your agent needs. All three describe the same API contract.', '选择智能体所需的最小上下文，三种入口描述同一份 API 契约。'],
  ['Free color infrastructure for humans and AI agents.', '面向用户和 AI 智能体的免费颜色基础设施。'],
  ['Ready · SVG generated at the edge', '就绪 · SVG 已在边缘生成'],
  ['Preview could not load. Your generated URL is still available below.', '预览加载失败，生成的 URL 仍可在下方使用。'],
  ['Copied ✓', '已复制 ✓'],
  ['>Create</span>', '>创作</span>'],
  ['>Palette</span>', '>配色</span>'],
  ['>Convert</span>', '>转换</span>'],
  ['>Names</span>', '>颜色名</span>'],
  ['>Width</label>', '>宽度</label>'],
  ['>Height</label>', '>高度</label>'],
  ['Copy agent prompt', '复制智能体提示词'],
  ['Copy agent rule', '复制智能体规则']
]

const homeScriptEnglishToChinese: readonly Replacement[] = [
  ['Ready · SVG generated at the edge', '就绪 · SVG 已在边缘生成'],
  ['Preview could not load. Your generated URL is still available below.', '预览加载失败，生成的 URL 仍可在下方使用。'],
  ['Enter between 2 and 10 valid six-digit HEX colors.', '请输入 2 到 10 个有效的六位 HEX 颜色。'],
  ['Rendering preview…', '正在渲染预览…'],
  ['Copy agent prompt', '复制智能体提示词'],
  ['Copy API URL', '复制 API URL'],
  ['Rule copied ✓', '规则已复制 ✓'],
  ['Copied ✓', '已复制 ✓'],
  ["'Copy '", "'复制 '"],
  ["'Use '", "'使用 '"],
  ["' palette'", "' 配色'"]
]

const toolEnglishToChinese: readonly Replacement[] = [
  ['CSS color atlas', 'CSS 颜色图鉴'],
  ['Fluid SVG studio', '流体 SVG 工作室'],
  ['Palette controls', '配色控制'],
  ['Choose a visual direction, then regenerate variations.', '选择视觉方向，然后重新生成变体。'],
  ['Theme', '主题'],
  ['Generate palette', '生成配色'],
  ['Preparing palette…', '正在准备配色…'],
  ['API request', 'API 请求'],
  ['Copy request URL', '复制请求 URL'],
  ['Generated system', '生成的颜色系统'],
  ['Click any swatch to copy its HEX value.', '点击任意色块复制其 HEX 值。'],
  ['Generated colors', '生成的颜色'],
  ['Curated palette generator', '精选配色生成器'],
  ['Generate theme-driven color systems, inspect them visually, and copy the exact API request or individual HEX values.', '生成主题驱动的颜色系统，可视化查看并复制精确 API 请求或单个 HEX 值。'],
  ['Explore · Palette', '探索 · 配色'],
  ['Search by name and copy a standards-based HEX value.', '按名称搜索并复制标准 HEX 值。'],
  ['Search color names', '搜索颜色名'],
  ['Try Tomato, Slate, or Blue…', '试试 Tomato、Slate 或 Blue…'],
  ['Loading CSS color names…', '正在加载 CSS 颜色名…'],
  ['CSS color search results', 'CSS 颜色搜索结果'],
  ['Search the complete CSS named-color directory and copy precise, machine-readable HEX values.', '搜索完整的 CSS 颜色名目录，并复制精确、机器可读的 HEX 值。'],
  ['Reference · Color names', '参考 · 颜色名'],
  ['Animation controls', '动画控制'],
  ['Compose a fluid SVG with a deterministic URL.', '用确定性 URL 组合流体 SVG。'],
  ['Palette preset', '配色预设'],
  ['Flow state', '流动状态'],
  ['Live animated SVG', '实时动态 SVG'],
  ['Lightweight, infinitely looping, and ready to embed.', '轻量、无限循环，可直接嵌入。'],
  ['Animated fluid gradient placeholder preview', '流体渐变占位图动画预览'],
  ['Create smooth, animated gradient placeholders with exact palette, timing, text, and an embeddable API URL.', '使用精确配色、时长和文字创建平滑的动态渐变占位图，并获得可嵌入 API URL。'],
  ['Create · Motion', '创作 · 动效'],
  ['Visual result', '视觉结果'],
  ['The swatch updates from any valid input format.', '色块会根据任意有效输入格式更新。'],
  ['Synchronized values', '同步值'],
  ['Edit any field. Copy the representation you need.', '编辑任意字段，复制所需表示。'],
  ['More conversions', '更多转换'],
  ['Color conversion pages', '颜色转换页面'],
  ['Universal color converter', '通用颜色转换器'],
  ['Convert between HEX, RGB, HSL, and CMYK while keeping every representation synchronized.', '在 HEX、RGB、HSL 和 CMYK 之间转换，并保持所有表示同步。'],
  ['Translate · Color', '转换 · 颜色'],
  ['>Copy</button>', '>复制</button>'],
  ['Rendering preview…', '正在渲染预览…'],
  ['Ready · animated SVG loaded', '就绪 · 动态 SVG 已加载'],
  ['Preview could not load. The API URL remains available below.', '预览加载失败，API URL 仍可在下方使用。'],
  ['Ready · all formats synchronized', '就绪 · 所有格式已同步'],
  ['Animation duration', '动画时长'],
  ['Center label', '中央标签'],
  ['Custom HEX colors', '自定义 HEX 颜色'],
  ['API pattern', 'API 模式'],
  ['Copy API URL', '复制 API URL'],
  ['optional', '可选'],
  ['Ready · enter a color in any field', '就绪 · 在任意字段输入颜色'],
  ['Enter between 2 and 10 valid six-digit HEX colors.', '请输入 2 到 10 个有效的六位 HEX 颜色。'],
  ['Palette could not load. Check your connection and try again.', '配色加载失败，请检查网络后重试。'],
  ['Color names could not load. Refresh the page to retry.', '颜色名加载失败，请刷新页面重试。'],
  ['No named colors match your search.', '没有命名颜色匹配搜索条件。'],
  ['Request copied ✓', '请求已复制 ✓'],
  ['API URL copied ✓', 'API URL 已复制 ✓'],
  ['Generating ', '正在生成 '],
  [' palette…', ' 配色…'],
  [' colors from the edge', ' 种颜色已从边缘加载'],
  ['Showing ', '正在显示 '],
  [' named colors', ' 个命名颜色'],
  [' copied', ' 已复制'],
  ['UNAVAILABLE', '不可用'],
  ['LOADING', '加载中'],
  [' COLORS', ' 种颜色'],
  ['4 FORMATS', '4 种格式']
]

const toolScriptEnglishToChinese: readonly Replacement[] = [
  ['Enter between 2 and 10 valid six-digit HEX colors.', '请输入 2 到 10 个有效的六位 HEX 颜色。'],
  ['Palette could not load. Check your connection and try again.', '配色加载失败，请检查网络后重试。'],
  ['Color names could not load. Refresh the page to retry.', '颜色名加载失败，请刷新页面重试。'],
  ['Preview could not load. The API URL remains available below.', '预览加载失败，API URL 仍可在下方使用。'],
  ['No named colors match your search.', '没有命名颜色匹配搜索条件。'],
  ['Ready · all formats synchronized', '就绪 · 所有格式已同步'],
  ['Ready · animated SVG loaded', '就绪 · 动态 SVG 已加载'],
  ['Rendering preview…', '正在渲染预览…'],
  ['Request copied ✓', '请求已复制 ✓'],
  ['API URL copied ✓', 'API URL 已复制 ✓'],
  ['Generating ', '正在生成 '],
  [' palette…', ' 配色…'],
  [' colors from the edge', ' 种颜色已从边缘加载'],
  ['Showing ', '正在显示 '],
  [' named colors', ' 个命名颜色'],
  [' copied', ' 已复制'],
  ['UNAVAILABLE', '不可用'],
  ['LOADING', '加载中'],
  [' COLORS', ' 种颜色'],
  ['Copied ✓', '已复制 ✓']
]

const imageChineseToEnglish: readonly Replacement[] = [
  ['在浏览器本地压缩、排列图片并添加水印。图片不会上传到服务器。', 'Compress, arrange, and watermark images locally in your browser. Images are never uploaded to a server.'],
  ['图片压缩、排列与水印', 'Image compression, layout, and watermarking'],
  ['在一个工作台中整理图片、生成客户确认图，或批量导出压缩和水印版本。', 'Organize images, create client proofs, or batch-export compressed and watermarked versions in one workspace.'],
  ['图片仅在当前浏览器中处理，不会上传', 'Images are processed only in this browser and are never uploaded'],
  ['图片处理设置', 'Image processing settings'],
  ['图片工作台', 'Image workspace'],
  ['0 张', '0 images'],
  ['选择图片', 'Choose images'],
  ['支持多选和拖放', 'Multiple selection and drag-and-drop supported'],
  ['模式', 'Mode'],
  ['一张图', 'Single canvas'],
  ['逐张水印', 'Watermark each'],
  ['仅压缩', 'Compress only'],
  ['尺寸', 'Size'],
  ['宽度 px', 'Width px'],
  ['高度 px', 'Height px'],
  ['保持画布比例', 'Keep canvas ratio'],
  ['扇形排布', 'Fan layout'],
  ['重叠比例', 'Overlap'],
  ['水印', 'Watermark'],
  ['文字', 'Text'],
  ['样图', 'SAMPLE'],
  ['字号 px', 'Font size px'],
  ['透明度', 'Opacity'],
  ['输出质量', 'Output quality'],
  ['JPEG 质量', 'JPEG quality'],
  ['操作', 'Actions'],
  ['导出 JPEG', 'Export JPEG'],
  ['清空', 'Clear'],
  ['图片顺序', 'Image order'],
  ['画布预览', 'Canvas preview'],
  ['等待图片', 'Waiting for images'],
  ['未选择图片', 'No image selected'],
  ['图片会按列表顺序扇形排布到同一张大图', 'Images will be arranged in a fan on one canvas in list order'],
  ['图片会在浏览器本地处理，不会上传到服务器。', 'Images are processed locally in your browser and are never uploaded to a server.'],
  ['读取图片中', 'Reading images'],
  ['每张图片单独添加水印后导出', 'Each image will be exported with its own watermark'],
  ['图片会按原始尺寸压缩，不添加水印', 'Images will be compressed at their original size without a watermark'],
  ['点击导出下载压缩图片', 'click export to download compressed images'],
  ['张图片待压缩', ' images ready to compress'],
  ['张已压缩，质量', ' images compressed, quality '],
  ['张，质量', ' images, quality '],
  ['张，', ' images, '],
  ['张已导出', ' images exported'],
  ['导出水印图片', 'Export watermarked images'],
  ['正在压缩…', 'Compressing…'],
  ['压缩中…', 'Compressing…'],
  ['质量 ', 'quality '],
  ['重叠', 'overlap'],
  ['预览', 'Preview'],
  ['导出', 'Export'],
  [' 第 ', ' '],
  ['上移', 'Move up'],
  ['下移', 'Move down'],
  ['删除', 'Delete'],
  ['加载失败', 'failed to load'],
  ['压缩模式', 'Compression mode'],
  ['处理水印中…', 'Applying watermark…'],
  ['已导出', 'exported'],
  ['张', ' images']
]

const imageEnglishToChinese: readonly Replacement[] = [
  ['Create · Local image studio', '创作 · 本地图片工作室'],
  ['Browser-only image processing · Your files stay on this device.', '仅在浏览器中处理图片 · 文件始终保留在当前设备。'],
  ['Canvas 预览', '画布预览'],
  ['Controls', '控制'],
  ['>Home</a>', '>首页</a>'],
  ['Agent Skill', '智能体技能']
]

export const localizeHomeHtml = (html: string, locale: Locale): string =>
  locale === 'zh'
    ? localizeDocument(html, [...commonEnglishToChinese, ...homeEnglishToChinese], homeScriptEnglishToChinese)
    : html

export const localizeToolHtml = (html: string, locale: Locale): string =>
  locale === 'zh' ? localizeDocument(html, toolEnglishToChinese, toolScriptEnglishToChinese) : html

export const localizeImageHtml = (html: string, locale: Locale): string => {
  if (locale === 'en') return localizeDocument(html, imageChineseToEnglish, imageChineseToEnglish)
  return localizeDocument(html, [...commonEnglishToChinese, ...imageEnglishToChinese])
}
