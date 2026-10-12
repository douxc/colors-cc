import { Hono } from 'hono'
import { API_BASE_URL, PALETTE_THEMES, PLACEHOLDER_EFFECTS, PLACEHOLDER_LIMITS } from '../../contracts/colors-api'
import { createOpenApiRoute } from './openapi'

export const japaneseLlmsContent = `# colors-cc.top — エージェント・LLM向けドキュメント
> UI用の画像、配色、色を作成する、無料のステートレスAPIです。

## APIのベースURL
${API_BASE_URL}

## エージェントが守るルール
1. 記載されているパラメーターだけを使用してください。
2. URL内のHEX色の # は、必ず %23 にエンコードしてください。
3. 画像URLをMarkdownの ![説明](URL) またはHTMLの <img> に直接埋め込んでください。SVGを取得して再エンコードしないでください。
4. 幅と高さは50〜4000ピクセルの範囲に自動調整されます。
5. プレースホルダーの文字は100文字までです。超過分は切り詰められます。

## 1. グラデーションSVGプレースホルダー
GET ${API_BASE_URL}/placeholder
軽量なSVG画像を、サイズ、文字、配色、効果を指定して作成します。

- w / width：幅。初期値800、範囲50〜4000ピクセル。
- h / height：高さ。初期値400、範囲50〜4000ピクセル。
- text：中央の文字。URLエンコードが必要です。省略時はサイズを表示し、最大100文字です。
- effect：効果。${PLACEHOLDER_EFFECTS.join(', ')}。APIの初期値はstaticです。
- palette：HEX、RGB、HSL形式の色をカンマで区切って2〜10色指定します。省略時はランダムな2色です。
- speed：静止以外の効果の周期。初期値10秒、範囲1〜30秒。
- attribution：小さなブランドの透かし。初期値true、falseまたは0で非表示になります。

### 使用例
1200×630のバナー：
<img src="${API_BASE_URL}/placeholder?w=1200&h=630&text=Hero+Banner" alt="バナー">
暖色のメッシュ画像：
<img src="${API_BASE_URL}/placeholder?w=800&h=400&effect=mesh&palette=%23FFD6A5,%23FFADAD,%23E2A0FF" alt="暖色のメッシュ画像">
ホログラムのアニメーション：
<img src="${API_BASE_URL}/placeholder?w=800&h=400&effect=holographic&palette=%2300FF41,%2300B8FF&speed=5" alt="ホログラム">

レスポンス：SVG画像。Cache-Control: public, max-age=31536000, immutable

## 2. 動くグラデーションSVG
GET ${API_BASE_URL}/fluid-placeholder
/placeholder?effect=fluid の別名です。色がなめらかに変化するアニメーション画像を作成します。
w、h、palette、speed、text、attributionは同じ指定方法です。初期サイズは800×400、周期10秒、文字は任意です。

オーロラ風のバナー：
<img src="${API_BASE_URL}/fluid-placeholder?w=1200&h=400&palette=%2300FF41,%2300B8FF,%237000FF" alt="オーロラのバナー">
文字付きのサイバーパンク背景：
<img src="${API_BASE_URL}/fluid-placeholder?w=800&h=600&palette=%23FCEE09,%23FF003C,%2300B8FF&speed=5&text=Welcome" alt="サイバーパンクの背景">
レスポンス：アニメーションSVG。キャッシュヘッダーは通常のプレースホルダーと同じです。

## 3. ランダムな色
GET ${API_BASE_URL}/random
HEX、RGB、タイムスタンプをJSONで返します。
例：{"hex":"#A1B2C3","rgb":"rgb(161, 178, 195)","timestamp":"2024-03-12T10:30:00.000Z"}
ボタンの色を選ぶ場合：fetch('${API_BASE_URL}/random')
サンプルデータに複数のランダム色が必要な場合は、ループからこのエンドポイントを呼び出します。

## 4. テーマ別の配色
GET ${API_BASE_URL}/palette?theme={theme_name}
theme：${PALETTE_THEMES.join(', ')}。初期値はcyberpunkです。
テーマに応じた配色をJSONで返します。同じテーマの再取得で別の配色になるとは限りません。
例：{"theme":"cyberpunk","colors":["#FCEE09","#00FF41","#00B8FF"],"count":3}
サイバーパンク配色：fetch('${API_BASE_URL}/palette?theme=cyberpunk')
レトロ配色：fetch('${API_BASE_URL}/palette?theme=retro')

## 5. カラーコード変換
GET ${API_BASE_URL}/convert?{param}={value}
次のうち1つの入力パラメーターだけを指定してください。
- hex：%23FF5733 または FF5733
- rgb：rgb(255,87,51)
- hsl：hsl(10,100%,60%)
- cmyk：cmyk(0%,65%,80%,0%)
レスポンス：{"hex":"#FF5733","rgb":"rgb(255, 87, 51)","hsl":"hsl(10, 100%, 60%)","cmyk":"cmyk(0%, 66%, 80%, 0%)"}
入力エラー：HTTP 400、{"error":"Invalid color format"}
HEXからRGB：fetch('${API_BASE_URL}/convert?hex=%23FF5733')
HSLからHEX：fetch('${API_BASE_URL}/convert?hsl=hsl(200,50%,50%)')

## 6. CSS標準色名
GET ${API_BASE_URL}/all-names
標準色名からHEXへの対応表をJSONで返します。
例：{"AliceBlue":"#F0F8FF","Tomato":"#FF6347"}
Tomatoの値が必要な場合は、取得したオブジェクトの data.Tomato を参照してください。
CSSの識別子は翻訳せず、そのまま使用します。

## よくある誤り
- 誤：palette=#FF0000,%230000FF ／ 正：palette=%23FF0000,%230000FF
- 範囲外のサイズは自動調整されます。w=800&h=600など、有効なサイズを指定してください。
- SVGを取得・再エンコードせず、URLを <img> に直接使用してください。
- paletteには少なくとも2色が必要です。例：palette=%23FF0000,%230000FF

## 契約上の上限
- サイズ：${PLACEHOLDER_LIMITS.width.min}〜${PLACEHOLDER_LIMITS.width.max}ピクセル
- 配色：${PLACEHOLDER_LIMITS.palette.min}〜${PLACEHOLDER_LIMITS.palette.max}色
- 周期：${PLACEHOLDER_LIMITS.speed.min}〜${PLACEHOLDER_LIMITS.speed.max}秒
- 文字：最大${PLACEHOLDER_LIMITS.textMaxLength}文字

## 呼び出し回数
APIドキュメント上、すべてのエンドポイントは無料で回数制限はありません。

## ブラウザーで使うツール
- プレースホルダー：https://colors-cc.top/ja
- 色変換：https://colors-cc.top/ja/tools/converter
- 配色：https://colors-cc.top/ja/tools/random-palette
- CSS色名：https://colors-cc.top/ja/tools/color-names
- 動くSVG：https://colors-cc.top/ja/tools/fluid-placeholder
- 画像圧縮・透かし・配置：https://offline-tools.colors-cc.top/image-compress/ — 別アプリです。端末内で処理し、画像をアップロードしません。
`

export const japaneseSkillContent = `# SKILL: ColorsCC

## 説明
OpenClaw、Cursor、Cline、GPTsなどのAIエージェントで、UI画像の作成、配色選び、色変換に使用するスキルです。APIが返す正確な値を使用してください。

## 使用する場面
- プレースホルダー、サンプル画像、デモコンテンツが必要なとき
- 配色、ランダム色、色変換が必要なとき
- UIのモックアップやプロトタイプを作成するとき
- 画像を使ったフロントエンドコードを生成するとき

## 必ず守るルール
1. URL内の # を %23 にエンコードします。
2. SVGのURLを <img> に直接指定し、取得・再エンコードは行いません。
3. 記載されたパラメーターだけを使用します。
4. 幅と高さは50〜4000ピクセルです。範囲外は自動調整されます。
5. 中央の文字は最大100文字です。超過分は切り詰められます。

## APIへのアクセス
ベースURL：${API_BASE_URL}

## 早見表

### プレースホルダー
\`\`\`html
<!-- 基本画像 -->
<img src="${API_BASE_URL}/placeholder?w=800&h=400" alt="プレースホルダー">
<!-- 文字付き -->
<img src="${API_BASE_URL}/placeholder?w=1200&h=630&text=Hero+Banner" alt="バナー">
<!-- 配色の指定 -->
<img src="${API_BASE_URL}/placeholder?w=400&h=300&palette=%23FF003C,%2300B8FF" alt="カード">
<!-- 文字付きアニメーション -->
<img src="${API_BASE_URL}/fluid-placeholder?w=1200&h=600&palette=%2300FF41,%2300B8FF,%237000FF&text=Coming+Soon&speed=8" alt="アニメーション画像">
\`\`\`

### JSONを取得
\`\`\`bash
# ランダムな色：hex、rgb、timestampを返します
curl ${API_BASE_URL}/random
# 配色：theme、colors、countを返します
curl '${API_BASE_URL}/palette?theme=cyberpunk'
# 色変換：hex、rgb、hsl、cmykを返します
curl '${API_BASE_URL}/convert?hex=%23FF5733'
# CSS色名からHEXへの対応表
curl '${API_BASE_URL}/all-names'
\`\`\`
配色のテーマ：${PALETTE_THEMES.join(', ')}。
色変換は ?rgb=...、?hsl=...、?cmyk=... も使用できます。同時に複数の色パラメーターを指定しないでください。
画像の効果：${PLACEHOLDER_EFFECTS.join(', ')}。サイズは${PLACEHOLDER_LIMITS.width.min}〜${PLACEHOLDER_LIMITS.width.max}ピクセルです。

## 使用例
### ランディングページ
\`\`\`html
<section><img src="${API_BASE_URL}/placeholder?w=1200&h=600&text=Hero+Section" alt="メイン画像"></section>
<div class="features">
  <img src="${API_BASE_URL}/placeholder?w=400&h=300&text=Feature+1" alt="機能1">
  <img src="${API_BASE_URL}/placeholder?w=400&h=300&text=Feature+2" alt="機能2">
</div>
\`\`\`
### 色付きのサンプルデータ
\`\`\`javascript
const palette = await fetch('${API_BASE_URL}/palette?theme=vaporwave').then(r => r.json())
const mockData = palette.colors.map((color, i) => ({ id: i, name: '項目' + (i + 1), color }))
\`\`\`
### カラーピッカー
\`\`\`javascript
async function getRandomColor() {
  const data = await fetch('${API_BASE_URL}/random').then(r => r.json())
  return data.hex
}
\`\`\`

## 誤りと修正
- # の未エンコード：palette=#FF0000 は不可。palette=%23FF0000,%230000FF を使用します。
- SVGの再処理：fetch(placeholderUrl) と btoa(svg) は不要です。URLを直接画像に使用します。
- 無効なサイズ：w=10は50に、w=9999は4000に調整されます。w=800&h=600などを指定します。
- 複数の色入力：/convert?hex=%23FF0000&rgb=rgb(255,0,0) は不可。/convert?hex=%23FF0000 のように1つだけ指定します。

## 画面から操作
- 色変換：https://colors-cc.top/ja/tools/converter
- 配色：https://colors-cc.top/ja/tools/random-palette
- CSS色名：https://colors-cc.top/ja/tools/color-names
- 動くSVG：https://colors-cc.top/ja/tools/fluid-placeholder

## 詳細資料
- LLM向け説明：https://colors-cc.top/ja/llms.txt
- OpenAPI仕様：https://colors-cc.top/ja/openapi.json
`

export const createJapaneseDocsRoute = (): Hono => {
  const app = new Hono()
  app.get('/llms.txt', c => {
    c.header('Content-Type', 'text/plain; charset=utf-8')
    c.header('Cache-Control', 'public, max-age=86400')
    return c.body(japaneseLlmsContent)
  })
  app.get('/skills/colors-cc.md', c => {
    c.header('Content-Type', 'text/markdown; charset=utf-8')
    c.header('Cache-Control', 'public, max-age=86400')
    return c.body(japaneseSkillContent)
  })
  app.route('/', createOpenApiRoute('ja'))
  return app
}
