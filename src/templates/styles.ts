export const sharedStyles = `
  :root {
    color-scheme: light;
    --bg: #f7f9fc;
    --bg-elevated: #ffffff;
    --surface: rgba(255, 255, 255, 0.9);
    --surface-strong: #ffffff;
    --surface-soft: rgba(15, 23, 42, 0.045);
    --line: rgba(15, 23, 42, 0.12);
    --line-strong: rgba(15, 23, 42, 0.2);
    --text: #172033;
    --text-muted: #596579;
    --text-subtle: #7b8799;
    --violet: #7456d8;
    --cyan: #087f8c;
    --pink: #f472b6;
    --green: #168454;
    --danger: #c3374f;
    --radius-sm: 10px;
    --radius-md: 16px;
    --radius-lg: 24px;
    --radius-xl: 32px;
    --shadow: 0 28px 80px rgba(48, 58, 78, 0.13);
    --font-sans: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    --font-mono: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
    --page-glow-cyan: rgba(8, 127, 140, 0.1);
    --page-glow-violet: rgba(116, 86, 216, 0.1);
    --grid-line: rgba(15, 23, 42, 0.035);
    --nav-bg: rgba(247, 249, 252, 0.82);
    --brand-border: rgba(15, 23, 42, 0.15);
    --brand-inset: rgba(255, 255, 255, 0.76);
    --hover-border: rgba(15, 23, 42, 0.28);
    --hover-bg: rgba(15, 23, 42, 0.075);
    --field-label: #354055;
    --input-bg: rgba(255, 255, 255, 0.88);
    --input-focus-bg: #ffffff;
    --code-bg: #111827;
    --code-text: #d8f7fa;
    --preview-bg: #eef2f7;
    --workspace-bg: #f1f4f8;
    --canvas-bg: #e8edf3;
    --canvas-tile: rgba(255, 255, 255, 0.6);
    --primary-gradient: linear-gradient(135deg, #5ee7f7, #b8f4fc 45%, #c4b5fd);
    --primary-gradient-hover: linear-gradient(135deg, #89effa, #d8f8fc 45%, #d7ccff);
    --gradient-text: linear-gradient(105deg, #172033 5%, #087f8c 42%, #7456d8 72%, #c33778);
  }

  :root[data-theme='dark'] {
    color-scheme: dark;
    --bg: #07080c;
    --bg-elevated: #0d1017;
    --surface: rgba(18, 22, 31, 0.86);
    --surface-strong: #151a24;
    --surface-soft: rgba(255, 255, 255, 0.045);
    --line: rgba(255, 255, 255, 0.1);
    --line-strong: rgba(255, 255, 255, 0.18);
    --text: #f7f8fb;
    --text-muted: #9ba4b7;
    --text-subtle: #687084;
    --violet: #a78bfa;
    --cyan: #5ee7f7;
    --green: #5ee6a8;
    --danger: #fb7185;
    --shadow: 0 28px 80px rgba(0, 0, 0, 0.42);
    --page-glow-cyan: rgba(94, 231, 247, 0.12);
    --page-glow-violet: rgba(167, 139, 250, 0.16);
    --grid-line: rgba(255, 255, 255, 0.018);
    --nav-bg: rgba(7, 8, 12, 0.78);
    --brand-border: rgba(255, 255, 255, 0.16);
    --brand-inset: rgba(7, 8, 12, 0.68);
    --hover-border: rgba(255, 255, 255, 0.3);
    --hover-bg: rgba(255, 255, 255, 0.08);
    --field-label: #d9deea;
    --input-bg: rgba(5, 7, 12, 0.68);
    --input-focus-bg: rgba(8, 11, 17, 0.9);
    --code-bg: #07090e;
    --code-text: #bdeff5;
    --preview-bg: #080a10;
    --workspace-bg: #080a0f;
    --canvas-bg: #090b10;
    --canvas-tile: rgba(255, 255, 255, 0.025);
    --gradient-text: linear-gradient(105deg, #fff 5%, #9eeef8 42%, #b9a7ff 68%, #f9a8d4);
  }

  @media (prefers-color-scheme: dark) {
    :root:not([data-theme='light']) {
      color-scheme: dark;
      --bg: #07080c;
      --bg-elevated: #0d1017;
      --surface: rgba(18, 22, 31, 0.86);
      --surface-strong: #151a24;
      --surface-soft: rgba(255, 255, 255, 0.045);
      --line: rgba(255, 255, 255, 0.1);
      --line-strong: rgba(255, 255, 255, 0.18);
      --text: #f7f8fb;
      --text-muted: #9ba4b7;
      --text-subtle: #687084;
      --violet: #a78bfa;
      --cyan: #5ee7f7;
      --green: #5ee6a8;
      --danger: #fb7185;
      --shadow: 0 28px 80px rgba(0, 0, 0, 0.42);
      --page-glow-cyan: rgba(94, 231, 247, 0.12);
      --page-glow-violet: rgba(167, 139, 250, 0.16);
      --grid-line: rgba(255, 255, 255, 0.018);
      --nav-bg: rgba(7, 8, 12, 0.78);
      --brand-border: rgba(255, 255, 255, 0.16);
      --brand-inset: rgba(7, 8, 12, 0.68);
      --hover-border: rgba(255, 255, 255, 0.3);
      --hover-bg: rgba(255, 255, 255, 0.08);
      --field-label: #d9deea;
      --input-bg: rgba(5, 7, 12, 0.68);
      --input-focus-bg: rgba(8, 11, 17, 0.9);
      --code-bg: #07090e;
      --code-text: #bdeff5;
      --preview-bg: #080a10;
      --workspace-bg: #080a0f;
      --canvas-bg: #090b10;
      --canvas-tile: rgba(255, 255, 255, 0.025);
      --gradient-text: linear-gradient(105deg, #fff 5%, #9eeef8 42%, #b9a7ff 68%, #f9a8d4);
    }
  }

  *, *::before, *::after { box-sizing: border-box; }

  html { scroll-behavior: smooth; }

  body {
    min-width: 320px;
    margin: 0;
    color: var(--text);
    background:
      radial-gradient(circle at 15% -10%, var(--page-glow-cyan), transparent 28rem),
      radial-gradient(circle at 86% 4%, var(--page-glow-violet), transparent 30rem),
      var(--bg);
    font-family: var(--font-sans);
    line-height: 1.55;
    -webkit-font-smoothing: antialiased;
  }

  body::before {
    position: fixed;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    content: '';
    background-image: linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: linear-gradient(to bottom, black, transparent 72%);
  }

  a { color: inherit; }
  button, input, select { font: inherit; }
  button { color: inherit; }
  img, svg { display: block; }

  :focus-visible {
    outline: 3px solid rgba(94, 231, 247, 0.72);
    outline-offset: 3px;
  }

  .skip-link {
    position: fixed;
    top: 12px;
    left: 12px;
    z-index: 100;
    padding: 9px 14px;
    border-radius: 999px;
    background: var(--text);
    color: var(--bg);
    transform: translateY(-180%);
    transition: transform 160ms ease;
  }
  .skip-link:focus { transform: translateY(0); }

  .app-shell {
    width: min(1440px, 100%);
    margin: 0 auto;
    padding: 0 28px 56px;
  }

  .site-nav {
    position: sticky;
    top: 0;
    z-index: 40;
    min-height: 76px;
    display: flex;
    align-items: center;
    gap: 28px;
    border-bottom: 1px solid var(--line);
    background: var(--nav-bg);
    backdrop-filter: blur(22px);
  }

  .brand {
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    gap: 11px;
    flex: 0 0 auto;
    text-decoration: none;
    font-size: 1rem;
    font-weight: 760;
    letter-spacing: -0.02em;
  }

  .brand-mark {
    width: 30px;
    height: 30px;
    display: grid;
    place-items: center;
    border: 1px solid var(--brand-border);
    border-radius: 10px;
    background: conic-gradient(from 210deg, #5ee7f7, #a78bfa, #f472b6, #fbbf24, #5ee7f7);
    box-shadow: inset 0 0 0 6px var(--brand-inset), 0 0 30px rgba(167, 139, 250, .25);
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 5px;
    flex: 1;
  }

  .nav-link {
    padding: 8px 11px;
    border-radius: 9px;
    color: var(--text-muted);
    font-size: .88rem;
    text-decoration: none;
    transition: color 140ms ease, background 140ms ease;
  }
  .nav-link:hover, .nav-link[aria-current="page"] { color: var(--text); background: var(--surface-soft); }

  .nav-actions { display: flex; align-items: center; gap: 8px; }

  .theme-picker { display: inline-flex; align-items: center; }
  .theme-select {
    min-height: 34px;
    padding: 0 28px 0 10px;
    border: 1px solid var(--line-strong);
    border-radius: 9px;
    background-color: var(--surface-soft);
    color: var(--text-muted);
    cursor: pointer;
    font-size: .76rem;
    font-weight: 680;
  }
  .theme-select:hover { border-color: var(--hover-border); color: var(--text); }

  .button {
    min-height: 42px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 0 16px;
    border: 1px solid var(--line-strong);
    border-radius: 12px;
    background: var(--surface-soft);
    color: var(--text);
    cursor: pointer;
    font-size: .86rem;
    font-weight: 680;
    text-decoration: none;
    transition: transform 140ms ease, border-color 140ms ease, background 140ms ease;
  }
  .button:hover { transform: translateY(-1px); border-color: var(--hover-border); background: var(--hover-bg); }
  .button:active { transform: translateY(0); }
  .button-primary {
    border-color: transparent;
    background: var(--primary-gradient);
    color: #071016;
    box-shadow: 0 12px 34px rgba(94, 231, 247, .16);
  }
  .button-primary:hover { background: var(--primary-gradient-hover); }
  .button-quiet { background: transparent; }
  .button-small { min-height: 34px; padding: 0 11px; border-radius: 9px; font-size: .78rem; }
  .button-block { width: 100%; }

  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 14px;
    color: var(--cyan);
    font-family: var(--font-mono);
    font-size: .73rem;
    font-weight: 700;
    letter-spacing: .12em;
    text-transform: uppercase;
  }
  .eyebrow::before { width: 22px; height: 1px; background: currentColor; content: ''; }

  .page-heading {
    max-width: 780px;
    padding: 76px 0 32px;
  }
  .page-heading h1 {
    margin: 0;
    font-size: clamp(2.35rem, 6vw, 4.8rem);
    line-height: .98;
    letter-spacing: -.055em;
  }
  .page-heading p { max-width: 680px; margin: 20px 0 0; color: var(--text-muted); font-size: 1.05rem; }

  .gradient-text {
    background: var(--gradient-text);
    background-clip: text;
    color: transparent;
  }

  .panel {
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    background: var(--surface);
    box-shadow: var(--shadow);
    backdrop-filter: blur(18px);
  }

  .panel-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
    padding: 22px 24px;
    border-bottom: 1px solid var(--line);
  }
  .panel-header h2, .panel-header h3 { margin: 0; font-size: 1rem; letter-spacing: -.01em; }
  .panel-header p { margin: 5px 0 0; color: var(--text-muted); font-size: .82rem; }
  .panel-body { padding: 24px; }

  .section-label {
    display: block;
    margin: 0 0 10px;
    color: var(--text-muted);
    font-family: var(--font-mono);
    font-size: .7rem;
    font-weight: 700;
    letter-spacing: .09em;
    text-transform: uppercase;
  }

  .field { display: grid; gap: 8px; }
  .field + .field { margin-top: 17px; }
  .field label, .field-label { color: var(--field-label); font-size: .82rem; font-weight: 640; }
  .field-hint { color: var(--text-subtle); font-size: .72rem; }

  .input, .select {
    width: 100%;
    min-height: 44px;
    padding: 0 13px;
    border: 1px solid var(--line);
    border-radius: 11px;
    background: var(--input-bg);
    color: var(--text);
    transition: border-color 140ms ease, background 140ms ease;
  }
  .input:hover, .select:hover { border-color: var(--line-strong); }
  .input:focus, .select:focus { border-color: rgba(94, 231, 247, .62); outline: none; background: var(--input-focus-bg); }
  .input-mono { font-family: var(--font-mono); font-size: .84rem; }

  input[type="range"] { width: 100%; accent-color: var(--cyan); cursor: pointer; }

  .field-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
  .inline-field { display: flex; align-items: center; gap: 10px; }

  .status {
    min-height: 22px;
    margin-top: 12px;
    color: var(--text-muted);
    font-size: .78rem;
  }
  .status[data-tone="error"] { color: var(--danger); }
  .status[data-tone="success"] { color: var(--green); }

  .code-surface {
    padding: 15px 16px;
    overflow: auto;
    border: 1px solid var(--line);
    border-radius: 12px;
    background: var(--code-bg);
    color: var(--code-text);
    font-family: var(--font-mono);
    font-size: .78rem;
    line-height: 1.65;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .tool-layout {
    display: grid;
    grid-template-columns: minmax(280px, .78fr) minmax(0, 1.4fr);
    gap: 18px;
    align-items: start;
    padding-bottom: 72px;
  }
  .tool-layout > .panel { min-width: 0; }
  .tool-sticky { position: sticky; top: 96px; }

  .preview-frame {
    position: relative;
    min-height: 360px;
    display: grid;
    place-items: center;
    overflow: hidden;
    border-radius: var(--radius-md);
    background: var(--preview-bg);
  }
  .preview-frame img { width: 100%; height: 100%; object-fit: cover; }

  .palette-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 10px;
  }
  .palette-swatch {
    min-width: 0;
    min-height: 220px;
    display: flex;
    align-items: flex-end;
    padding: 10px;
    overflow: hidden;
    border: 1px solid var(--line-strong);
    border-radius: 14px;
    cursor: pointer;
    transition: transform 150ms ease;
  }
  .palette-swatch:hover { transform: translateY(-3px); }
  .swatch-code { padding: 5px 7px; border-radius: 7px; background: rgba(0,0,0,.62); color: #fff; font: 700 .7rem var(--font-mono); }

  .color-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
  }
  .color-card {
    padding: 0;
    overflow: hidden;
    border: 1px solid var(--line);
    border-radius: 13px;
    background: var(--surface-soft);
    color: var(--text);
    cursor: pointer;
    text-align: left;
  }
  .color-card-swatch { height: 82px; border-bottom: 1px solid var(--line); }
  .color-card-meta { display: grid; gap: 2px; padding: 11px; }
  .color-card-name { font-size: .8rem; font-weight: 680; }
  .color-card-code { color: var(--text-muted); font: .7rem var(--font-mono); }

  .result-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .result-field { position: relative; }
  .result-field .button { position: absolute; right: 5px; bottom: 5px; min-height: 34px; }
  .result-field .input { padding-right: 76px; }

  .tool-links { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 18px; }
  .tool-link {
    padding: 7px 10px;
    border: 1px solid var(--line);
    border-radius: 9px;
    color: var(--text-muted);
    font-size: .74rem;
    text-decoration: none;
  }
  .tool-link:hover { border-color: var(--line-strong); color: var(--text); }

  .site-footer {
    padding: 26px 0 0;
    border-top: 1px solid var(--line);
    color: var(--text-subtle);
    font-size: .76rem;
  }
  .site-footer-main { display: flex; align-items: center; justify-content: space-between; gap: 24px; }
  .footer-links { display: flex; flex-wrap: wrap; gap: 16px; }
  .footer-links a { min-height: 44px; display: inline-flex; align-items: center; color: var(--text-muted); text-decoration: none; }
  .footer-links a:hover { color: var(--text); }
  .site-compliance { width: 100%; padding: 14px 0 6px; text-align: center; font-size: 13px; }
  .site-compliance a { color: var(--text-subtle); text-decoration: none; }
  .site-compliance a:hover { color: var(--text); }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  @media (max-width: 1300px) {
    .nav-actions .button-quiet:not(.language-switch) { display: none; }
  }

  @media (max-width: 1100px) {
    .app-shell { padding-inline: 18px; }
    .site-nav { gap: 16px; }
    .nav-links { display: none; }
    .nav-actions { margin-left: auto; }
    .tool-layout { grid-template-columns: 1fr; }
    .tool-sticky { position: static; }
    .palette-grid { grid-template-columns: repeat(5, minmax(92px, 1fr)); overflow-x: auto; padding-bottom: 7px; }
  }

  @media (max-width: 620px) {
    .app-shell { padding-inline: 14px; padding-bottom: 38px; }
    .site-nav { min-height: 66px; }
    .nav-actions .button-quiet:not(.language-switch) { display: none; }
    .button-small, .result-field .button { min-height: 44px; }
    .page-heading { padding: 52px 0 26px; }
    .page-heading h1 { font-size: clamp(2.4rem, 13vw, 3.55rem); }
    .panel { border-radius: 18px; }
    .panel-header, .panel-body { padding: 18px; }
    .field-row, .result-grid { grid-template-columns: 1fr; }
    .preview-frame { min-height: 240px; }
    .site-footer-main { align-items: flex-start; flex-direction: column; }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
  }
`
