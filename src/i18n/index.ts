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
    forAi: 'For AI',
    languageControlLabel: 'Language',
    simplifiedChineseLabel: 'Simplified Chinese',
    englishLabel: 'English',
    themeControlLabel: 'Theme',
    lightThemeLabel: 'Light theme',
    darkThemeLabel: 'Dark theme',
    systemThemeLabel: 'Follow system theme',
    footerNavigation: 'Footer navigation',
    footerTagline: 'Edge-native color infrastructure for humans and AI agents.',
    colorTool: 'Color tool',
    agentSkill: 'Agent Skill'
  },
  zh: {
    skipToContent: '跳至正文',
    homeLabel: 'colors-cc 首页',
    primaryNavigation: '主导航',
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
    footerTagline: '为用户和 AI 智能体提供运行于边缘节点的色彩基础服务。',
    colorTool: '色彩工具',
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
  ['Process files locally', '在本地处理文件'],
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
  ['Color workbench', '色彩工作台'],
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
  ['Generate theme-driven color systems, inspect them visually, and copy the exact API request or individual HEX values.', '按主题生成配色方案，可视化查看结果，并复制对应的 API 请求地址或单个 HEX 色值。'],
  ['Explore · Palette', '探索 · 配色'],
  ['Search by name and copy a standards-based HEX value.', '按名称搜索，点击即可复制符合 CSS 标准的 HEX 色值。'],
  ['Search color names', '搜索颜色名称'],
  ['Try Tomato, Slate, or Blue…', '输入 Tomato、Slate 或 Blue 试试…'],
  ['Loading CSS color names…', '正在加载 CSS 颜色名称…'],
  ['CSS color search results', 'CSS 颜色搜索结果'],
  ['Search the complete CSS named-color directory and copy precise, machine-readable HEX values.', '浏览并搜索完整的 CSS 颜色名称列表，再复制精确、机器可读的 HEX 色值。'],
  ['Reference · Color names', '参考 · 颜色名称'],
  ['Animation controls', '动画设置'],
  ['Compose a fluid SVG with a deterministic URL.', '调整参数，生成拥有固定 URL 的流体 SVG。'],
  ['Palette preset', '配色预设'],
  ['Flow state', '流动渐变'],
  ['Live animated SVG', '动态 SVG 实时预览'],
  ['Lightweight, infinitely looping, and ready to embed.', '体积小巧、无限循环，可直接嵌入页面。'],
  ['Animated fluid gradient placeholder preview', '动态流体渐变占位图预览'],
  ['Create smooth, animated gradient placeholders with exact palette, timing, text, and an embeddable API URL.', '精确设置配色、时长和文字，创建平滑的动态渐变占位图，并获取可嵌入的 API URL。'],
  ['Create · Motion', '创作 · 动态效果'],
  ['Visual result', '颜色预览'],
  ['The swatch updates from any valid input format.', '输入任意有效格式的色值，色块都会随之更新。'],
  ['Synchronized values', '各格式色值'],
  ['Edit any field. Copy the representation you need.', '任意编辑一种格式，再复制所需的色值。'],
  ['More conversions', '更多格式转换'],
  ['Color conversion pages', '颜色格式转换页面'],
  ['Universal color converter', '通用颜色转换器'],
  ['Convert between HEX, RGB, HSL, and CMYK while keeping every representation synchronized.', '在 HEX、RGB、HSL 和 CMYK 之间转换，所有格式的色值始终保持同步。'],
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

const imageChineseToEnglish: readonly Replacement[] = [
  ['面包屑导航', 'Breadcrumb'],
  ['>首页</a>', '>Home</a>'],
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
  ['压缩质量', 'Compression quality'],
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
  ['PNG 自动选择 PNG-8 或无损优化，其他图片按自适应质量导出', 'PNG images automatically use PNG-8 or lossless optimization; other images use adaptive-quality export'],
  ['PNG 将自动选择量化或无损方案', 'PNG will automatically use quantization or lossless optimization'],
  ['自动策略：图标、截图和透明素材使用 PNG-8 量化并由 OxiPNG 优化；', 'Automatic strategy: icons, screenshots, and transparent artwork use PNG-8 quantization followed by OxiPNG; '],
  ['连续色调 PNG', 'continuous-tone PNG images'],
  ['仅做无损优化。只保留比原图更小的结果。', 'receive lossless optimization only. A result is used only when it is smaller than the original.'],
  ['点击导出下载压缩图片', 'click export to download compressed images'],
  ['自动压缩并导出', 'Compress and export automatically'],
  ['PNG 压缩组件加载失败', 'The PNG compression component failed to load'],
  ['PNG 压缩超时', 'PNG compression timed out'],
  ['JPEG 编码失败', 'JPEG encoding failed'],
  ['JPEG 自适应质量', 'JPEG adaptive quality'],
  ['OxiPNG 无损', 'OxiPNG lossless'],
  ['原图已最优', 'Original already optimal'],
  ['张已压缩，共节省', ' images compressed, saved '],
  ['张失败', ' failed'],
  ['压缩失败', 'Compression failed'],
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
  ['Create · Local image studio', '创作 · 本地图片处理'],
  ['Browser-only image processing · Your files stay on this device.', '所有图片仅在浏览器本地处理，不会离开当前设备。'],
  ['Redistribution permitted · No warranty.', '允许再分发 · 不提供任何担保。'],
  ['Canvas 预览', '画布预览'],
  ['Controls', '处理设置'],
  ['>Home</a>', '>首页</a>'],
  ['Agent Skill', '智能体技能'],
  ['>Source</a>', '>源代码</a>'],
  ['>Third-party notices</a>', '>第三方声明</a>']
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
