import type { Locale } from '../site'
import { renderHomeMessages } from './messages'

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
  breadcrumb: string
  home: string
  notices: string
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
    feedbackLabel: 'Feedback',
    breadcrumb: 'Breadcrumb',
    home: 'Home',
    notices: 'Third-party notices'
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
    feedbackLabel: '反馈',
    breadcrumb: '面包屑导航',
    home: '首页',
    notices: '第三方声明'
  },
  ja: {
    skipToContent: '本文へ移動',
    homeLabel: 'colors-cc ホーム',
    primaryNavigation: 'メインナビゲーション',
    generate: '画像を作成',
    prepare: '画像を編集',
    developers: '開発者向け',
    preferences: '表示設定',
    menu: 'メニュー',
    openNavigationMenu: 'メニューを開く',
    closeNavigationMenu: 'メニューを閉じる',
    create: '作成',
    convert: '色変換',
    palettes: '配色',
    colorNames: 'CSS色名',
    imageTools: '画像ツール',
    forAi: 'AI連携',
    languageControlLabel: '言語',
    simplifiedChineseLabel: '简体中文',
    englishLabel: 'English',
    themeControlLabel: 'テーマ',
    lightThemeLabel: 'ライトテーマ',
    darkThemeLabel: 'ダークテーマ',
    systemThemeLabel: 'システム設定に合わせる',
    footerNavigation: 'フッターナビゲーション',
    footerTagline: '画像と配色を作成・編集し、デザイン、コード、AIに利用できます。',
    colorTool: 'カラーツール',
    agentSkill: 'エージェント用スキル',
    feedbackLabel: 'フィードバック',
    breadcrumb: 'パンくずリスト',
    home: 'ホーム',
    notices: 'サードパーティーの表記'
  }
}

export const localizeHomeHtml = renderHomeMessages
