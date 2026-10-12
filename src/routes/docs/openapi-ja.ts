const descriptions: Readonly<Record<string, string>> = {
  'A stateless API for random colors, palettes, and SVG placeholder generation. Built for AI agents and developers.': 'ランダム色、配色、SVGプレースホルダーを作成するステートレスAPIです。AIエージェントと開発者向けに設計されています。',
  'API server': 'APIサーバー',
  'Get a random HEX and RGB color': 'ランダムなHEX・RGB色を取得',
  'Returns a randomly generated color in HEX and RGB formats with a timestamp.': 'ランダムな色をHEX、RGB、タイムスタンプとともに返します。',
  'Successful response': '正常なレスポンス',
  '6-digit HEX color code': '6桁のHEXカラーコード',
  'RGB color format': 'RGB形式の色',
  'ISO 8601 timestamp': 'ISO 8601形式のタイムスタンプ',
  'Get a curated color palette': 'テーマ別の配色を取得',
  'Returns a curated color palette based on the specified theme.': '指定したテーマに応じた配色を返します。',
  'Theme name for the palette': '配色のテーマ名',
  'Palette with theme and colors': 'テーマ名と色の配列を含む配色',
  'Convert between color formats': '色の形式を変換',
  'Convert a color between HEX, RGB, HSL, and CMYK formats. Provide ONE input parameter.': 'HEX、RGB、HSL、CMYK間で色を変換します。入力パラメーターは1つだけ指定してください。',
  'HEX color (e.g., %23FF5733 or FF5733)': 'HEX色（例：%23FF5733 または FF5733）',
  'RGB color (e.g., rgb(255,87,51))': 'RGB色（例：rgb(255,87,51)）',
  'HSL color (e.g., hsl(10,100%,60%))': 'HSL色（例：hsl(10,100%,60%)）',
  'CMYK color (e.g., cmyk(0%,65%,80%,0%))': 'CMYK色（例：cmyk(0%,65%,80%,0%)）',
  'Converted color in all formats': 'すべての形式に変換した色',
  'Invalid input or missing parameter': '入力が無効、またはパラメーターが未指定',
  'Get all CSS color names': 'すべてのCSS色名を取得',
  'Returns a mapping of all standard CSS color names to their HEX values.': 'すべての標準CSS色名とHEX値の対応表を返します。',
  'Object with color names as keys and HEX codes as values': '色名をキー、HEX値を値とするオブジェクト',
  'Generate SVG placeholder image': 'SVGプレースホルダー画像を作成',
  'Creates a dynamic SVG gradient placeholder image with customizable dimensions, text, colors, and visual effects.': 'サイズ、文字、配色、効果を指定してグラデーションSVG画像を作成します。',
  'Width in pixels': '幅（ピクセル）',
  'Height in pixels': '高さ（ピクセル）',
  'Center text (defaults to dimensions)': '中央の文字（省略時はサイズを表示）',
  'Visual effect': '画像の効果',
  'Comma-separated colors in HEX, RGB, or HSL format (2-10 colors, default: 2 random colors). Example: %23FFD6A5,%23FFADAD': 'HEX、RGB、HSL形式の色をカンマで区切ります（2〜10色、初期値はランダムな2色）。例：%23FFD6A5,%23FFADAD',
  'Animation duration in seconds for non-static effects': '静止以外の効果の周期（秒）',
  'Include branding watermark (default: true). Set to false or 0 to disable': 'ブランドの透かしを表示（初期値true）。falseまたは0で非表示',
  'SVG placeholder image': 'SVGプレースホルダー画像',
  'public, max-age=31536000, immutable': 'public, max-age=31536000, immutable',
  'Invalid dimensions, palette, effect, speed, or text parameter': 'サイズ、配色、効果、周期、文字のパラメーターが無効',
  'Generate animated fluid SVG placeholder': '動くグラデーションSVGを作成',
  'Alias for /placeholder?effect=fluid. Creates a dynamic SVG gradient with smooth, infinitely-looping color transitions.': '/placeholder?effect=fluid の別名です。色がなめらかに変化し、繰り返し再生されるSVGを作成します。',
  'Animation duration in seconds': 'アニメーションの周期（秒）',
  'Optional center text': '中央の文字（任意）',
  'Animated SVG placeholder image': 'アニメーションSVG画像',
  'Invalid dimensions, palette, speed, or text parameter': 'サイズ、配色、周期、文字のパラメーターが無効'
}

export const localizeJapaneseOpenApi = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(localizeJapaneseOpenApi)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.entries(value).map(([key, child]) => {
    if ((key === 'description' || key === 'summary') && typeof child === 'string') {
      const translation = descriptions[child]
      if (!translation) throw new Error(`Missing Japanese OpenAPI description: ${child}`)
      return [key, translation]
    }
    return [key, localizeJapaneseOpenApi(child)]
  }))
}
