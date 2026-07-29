export const sharedStyles = `
  :root {
    color-scheme: light;
    --paper: #f7f6f2;
    --paper-elevated: #fffefa;
    --ink: #1d1d1f;
    --ink-muted: #5f5f63;
    --accent-cyan: #087f8c;
    --accent-violet: #7157c6;
    --accent-coral: #d45d4c;
    --state-success: #168454;
    --state-danger: #b93e50;
    --surface-canvas: #eceae4;
    --surface-panel: #fffefa;
    --surface-muted: #efede7;
    --radius-control: 8px;
    --radius-panel: 12px;
    --shadow-panel: 0 1px 2px rgba(29, 29, 31, 0.06);
    --bg: var(--paper);
    --bg-elevated: var(--paper-elevated);
    --surface: var(--surface-panel);
    --surface-strong: var(--paper-elevated);
    --surface-soft: rgba(29, 29, 31, 0.045);
    --line: rgba(29, 29, 31, 0.12);
    --line-strong: rgba(29, 29, 31, 0.22);
    --text: var(--ink);
    --text-muted: var(--ink-muted);
    --text-subtle: #727276;
    --violet: var(--accent-violet);
    --cyan: var(--accent-cyan);
    --pink: var(--accent-coral);
    --green: var(--state-success);
    --danger: var(--state-danger);
    --focus-ring: var(--accent-violet);
    --radius-sm: var(--radius-control);
    --radius-md: 10px;
    --radius-lg: var(--radius-panel);
    --radius-xl: 16px;
    --shadow: var(--shadow-panel);
    --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
    --font-mono: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
    --leading-body: 1.62;
    --leading-copy: 1.68;
    --leading-heading: 1.22;
    --leading-display: 1.12;
    --leading-hero: 1.08;
    --leading-control: 1.42;
    --tracking-display: -.055em;
    --nav-bg: rgba(247, 246, 242, 0.96);
    --brand-border: rgba(29, 29, 31, 0.24);
    --brand-inset: var(--paper-elevated);
    --hover-border: rgba(29, 29, 31, 0.28);
    --hover-bg: rgba(29, 29, 31, 0.07);
    --field-label: #354055;
    --input-bg: rgba(255, 255, 255, 0.88);
    --input-focus-bg: #ffffff;
    --code-bg: #111827;
    --code-text: #d8f7fa;
    --preview-bg: var(--surface-muted);
    --workspace-bg: #efede8;
    --canvas-bg: var(--surface-canvas);
    --canvas-tile: rgba(255, 255, 255, 0.6);
    --primary-bg: #087f8c;
    --primary-hover-bg: #066a75;
    --primary-text: #ffffff;
    --primary-gradient: var(--primary-bg);
    --primary-gradient-hover: var(--primary-hover-bg);
  }

  html[lang="zh-CN"] {
    --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
    --leading-body: 1.75;
    --leading-copy: 1.8;
    --leading-heading: 1.35;
    --leading-display: 1.2;
    --leading-hero: 1.18;
    --leading-control: 1.55;
    --tracking-display: -.025em;
  }

  :root[data-theme='dark'] {
    color-scheme: dark;
    --paper: #101011;
    --paper-elevated: #1c1c1e;
    --ink: #f5f5f7;
    --ink-muted: #a1a1a6;
    --accent-cyan: #62d5df;
    --accent-violet: #aa96ef;
    --accent-coral: #ef8b78;
    --state-success: #62d39b;
    --state-danger: #f37f91;
    --surface-canvas: #0d0e10;
    --surface-panel: #1c1c1e;
    --surface-muted: #252527;
    --shadow-panel: 0 1px 2px rgba(0, 0, 0, 0.32);
    --bg: var(--paper);
    --bg-elevated: var(--paper-elevated);
    --surface: var(--surface-panel);
    --surface-strong: var(--paper-elevated);
    --surface-soft: rgba(255, 255, 255, 0.05);
    --line: rgba(255, 255, 255, 0.12);
    --line-strong: rgba(255, 255, 255, 0.2);
    --text: var(--ink);
    --text-muted: var(--ink-muted);
    --text-subtle: #8e8e93;
    --violet: var(--accent-violet);
    --cyan: var(--accent-cyan);
    --pink: var(--accent-coral);
    --green: var(--state-success);
    --danger: var(--state-danger);
    --focus-ring: var(--accent-cyan);
    --shadow: var(--shadow-panel);
    --nav-bg: rgba(16, 16, 17, 0.96);
    --brand-border: rgba(255, 255, 255, 0.16);
    --brand-inset: rgba(7, 8, 12, 0.68);
    --hover-border: rgba(255, 255, 255, 0.3);
    --hover-bg: rgba(255, 255, 255, 0.08);
    --field-label: #d9deea;
    --input-bg: #1c1c1e;
    --input-focus-bg: #242426;
    --code-bg: #07090e;
    --code-text: #bdeff5;
    --preview-bg: var(--surface-muted);
    --workspace-bg: #151516;
    --canvas-bg: var(--surface-canvas);
    --canvas-tile: rgba(255, 255, 255, 0.025);
    --primary-bg: #62d5df;
    --primary-hover-bg: #8de1e8;
    --primary-text: #071016;
  }

  @media (prefers-color-scheme: dark) {
    :root:not([data-theme='light']) {
      color-scheme: dark;
      --paper: #101011;
      --paper-elevated: #1c1c1e;
      --ink: #f5f5f7;
      --ink-muted: #a1a1a6;
      --accent-cyan: #62d5df;
      --accent-violet: #aa96ef;
      --accent-coral: #ef8b78;
      --state-success: #62d39b;
      --state-danger: #f37f91;
      --surface-canvas: #0d0e10;
      --surface-panel: #1c1c1e;
      --surface-muted: #252527;
      --shadow-panel: 0 1px 2px rgba(0, 0, 0, 0.32);
      --bg: var(--paper);
      --bg-elevated: var(--paper-elevated);
      --surface: var(--surface-panel);
      --surface-strong: var(--paper-elevated);
      --surface-soft: rgba(255, 255, 255, 0.05);
      --line: rgba(255, 255, 255, 0.12);
      --line-strong: rgba(255, 255, 255, 0.2);
      --text: var(--ink);
      --text-muted: var(--ink-muted);
      --text-subtle: #8e8e93;
      --violet: var(--accent-violet);
      --cyan: var(--accent-cyan);
      --pink: var(--accent-coral);
      --green: var(--state-success);
      --danger: var(--state-danger);
      --focus-ring: var(--accent-cyan);
      --shadow: var(--shadow-panel);
      --nav-bg: rgba(16, 16, 17, 0.96);
      --brand-border: rgba(255, 255, 255, 0.16);
      --brand-inset: rgba(7, 8, 12, 0.68);
      --hover-border: rgba(255, 255, 255, 0.3);
      --hover-bg: rgba(255, 255, 255, 0.08);
      --field-label: #d9deea;
      --input-bg: #1c1c1e;
      --input-focus-bg: #242426;
      --code-bg: #07090e;
      --code-text: #bdeff5;
      --preview-bg: var(--surface-muted);
      --workspace-bg: #151516;
      --canvas-bg: var(--surface-canvas);
      --canvas-tile: rgba(255, 255, 255, 0.025);
      --primary-bg: #62d5df;
      --primary-hover-bg: #8de1e8;
      --primary-text: #071016;
    }
  }

  *, *::before, *::after { box-sizing: border-box; }

  html { scroll-behavior: smooth; }

  body {
    min-width: 320px;
    margin: 0;
    color: var(--text);
    background: var(--bg);
    font-family: var(--font-sans);
    line-height: var(--leading-body);
    -webkit-font-smoothing: antialiased;
  }

  a { color: inherit; }
  p, li { text-wrap: pretty; }
  h1, h2, h3 { text-wrap: balance; }
  button, input, select { font: inherit; line-height: var(--leading-control); }
  button { color: inherit; }
  img, svg { display: block; }

  :focus-visible {
    outline: 3px solid var(--focus-ring);
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
    --shell-inline-padding: 28px;
    width: 100%;
    margin: 0 auto;
    padding: 0 28px 56px;
  }

  .site-chrome-slot { display: contents; }

  .app-shell > main,
  .app-shell > .site-footer,
  .site-chrome-slot > .site-footer {
    width: min(1384px, 100%);
    margin-inline: auto;
  }

  .site-nav {
    position: sticky;
    top: 0;
    z-index: 40;
    min-height: 60px;
    display: flex;
    align-items: center;
    gap: 24px;
    width: calc(100% + (2 * var(--shell-inline-padding)));
    margin-left: calc(-1 * var(--shell-inline-padding));
    padding-inline: var(--shell-inline-padding);
    border-bottom: 1px solid var(--line);
    background: var(--nav-bg);
    backdrop-filter: blur(10px);
  }

  .brand {
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    gap: 9px;
    flex: 0 0 auto;
    text-decoration: none;
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .brand-mark {
    position: relative;
    width: 30px;
    height: 26px;
    flex: 0 0 auto;
  }
  .brand-mark-generate,
  .brand-mark-prepare {
    position: absolute;
    width: 19px;
    height: 19px;
    border-radius: 5px;
  }
  .brand-mark-generate {
    top: 1px;
    left: 1px;
    background: var(--accent-cyan);
  }
  .brand-mark-prepare {
    right: 1px;
    bottom: 1px;
    border: 2px solid var(--text);
    background: var(--brand-inset);
    box-shadow: inset 0 0 0 3px var(--brand-inset);
  }
  .brand-mark-prepare::before,
  .brand-mark-prepare::after {
    position: absolute;
    background: var(--text);
    content: '';
  }
  .brand-mark-prepare::before {
    top: 4px;
    right: -3px;
    width: 7px;
    height: 2px;
  }
  .brand-mark-prepare::after {
    right: 4px;
    bottom: -3px;
    width: 2px;
    height: 7px;
  }

  .nav-menu {
    min-width: 0;
    flex: 1;
  }
  .nav-menu-toggle { display: none; }
  .nav-menu-panel,
  .nav-menu:not([open]) > .nav-menu-panel {
    display: flex;
    align-items: center;
    gap: 18px;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 2px;
    flex: 1;
  }

  .nav-link {
    padding: 6px 9px;
    border-radius: 7px;
    color: var(--text-muted);
    font-size: .84rem;
    line-height: var(--leading-control);
    text-decoration: none;
    transition: color 140ms ease, background 140ms ease;
  }
  .nav-link:hover, .nav-link[aria-current="page"] { color: var(--text); background: var(--surface-soft); }

  .nav-actions { display: flex; align-items: center; gap: 16px; }
  .nav-preferences { display: flex; align-items: center; }

  .nav-utility-group {
    display: inline-flex;
    align-items: center;
    gap: 16px;
  }
  .nav-preference-control {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .nav-segmented {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 0;
    border: 0;
    border-radius: 12px;
    background: transparent;
  }
  .nav-switch-option {
    width: 32px;
    height: 32px;
    min-height: 32px;
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    font-size: .72rem;
    font-weight: 720;
    line-height: 1;
    text-decoration: none;
    white-space: nowrap;
    transition: color 150ms ease, background 150ms ease;
  }
  .nav-switch-option:hover { color: var(--text); background: var(--surface-soft); }
  .nav-switch-option[aria-current='page'],
  .nav-switch-option[aria-pressed='true'] {
    background: var(--surface-strong);
    color: var(--text);
    box-shadow: none;
  }
  .language-option[aria-current='page'] { color: var(--cyan); }
  .theme-option-icon { width: 17px; height: 17px; }
  .theme-option-light[aria-pressed='true'] { color: #9a6700; }
  .theme-option-dark[aria-pressed='true'] { color: var(--violet); }

  .button {
    min-height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 0 16px;
    border: 1px solid var(--line-strong);
    border-radius: 9px;
    background: var(--surface-soft);
    color: var(--text);
    cursor: pointer;
    font-size: .86rem;
    font-weight: 680;
    line-height: var(--leading-control);
    text-decoration: none;
    transition: border-color 140ms ease, background 140ms ease;
  }
  .button:hover { border-color: var(--hover-border); background: var(--hover-bg); }
  .button-primary {
    border-color: transparent;
    background: var(--primary-bg);
    color: var(--primary-text);
    box-shadow: none;
  }
  .button-primary:hover { border-color: transparent; background: var(--primary-hover-bg); }
  .button-quiet { background: transparent; }
  .button-small { min-height: 34px; padding: 0 11px; border-radius: 9px; font-size: .78rem; }
  .nav-actions > .button-quiet {
    border: 0;
    background: transparent;
    color: var(--text-muted);
  }
  .nav-actions > .button-quiet:hover { transform: none; color: var(--text); background: var(--surface-soft); }
  .button-block { width: 100%; }

  .eyebrow {
    display: inline-flex;
    align-items: center;
    margin: 0 0 14px;
    color: var(--text-muted);
    font-size: .78rem;
    font-weight: 620;
    line-height: var(--leading-control);
    letter-spacing: .01em;
  }

  .page-heading {
    max-width: 780px;
    padding: 40px 0 24px;
  }
  .breadcrumb {
    max-width: 100%;
    display: flex;
    align-items: center;
    gap: 7px;
    margin-bottom: 14px;
    color: var(--text-subtle);
    font-size: .72rem;
    line-height: var(--leading-control);
  }
  .breadcrumb a { color: var(--text-muted); text-decoration: none; }
  .breadcrumb a:hover { color: var(--text); }
  .breadcrumb span[aria-current='page'] {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .page-heading h1 {
    margin: 0;
    font-size: clamp(2rem, 4vw, 3.35rem);
    line-height: var(--leading-display);
    letter-spacing: var(--tracking-display);
  }
  .page-heading p { max-width: 680px; margin: 20px 0 0; color: var(--text-muted); font-size: 1.05rem; line-height: var(--leading-copy); }

  .gradient-text {
    background: none;
    color: var(--text);
  }

  .panel {
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    background: var(--surface);
    box-shadow: var(--shadow);
  }

  .panel-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
    padding: 22px 24px;
    border-bottom: 1px solid var(--line);
  }
  .panel-header h2, .panel-header h3 { margin: 0; font-size: 1rem; line-height: var(--leading-heading); letter-spacing: -.01em; }
  .panel-header p { margin: 5px 0 0; color: var(--text-muted); font-size: .82rem; line-height: var(--leading-copy); }
  .panel-body { padding: 24px; }

  .section-label {
    display: block;
    margin: 0 0 10px;
    color: var(--text-muted);
    font-family: var(--font-mono);
    font-size: .7rem;
    font-weight: 700;
    line-height: var(--leading-control);
    letter-spacing: .09em;
    text-transform: uppercase;
  }

  .field { display: grid; gap: 8px; }
  .field + .field { margin-top: 17px; }
  .field label, .field-label { color: var(--field-label); font-size: .82rem; font-weight: 640; line-height: var(--leading-control); }
  .field-hint { color: var(--text-subtle); font-size: .72rem; line-height: var(--leading-control); }

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
  .input:focus, .select:focus { border-color: rgba(94, 231, 247, .62); background: var(--input-focus-bg); }
  .input-mono { font-family: var(--font-mono); font-size: .84rem; }

  input[type="range"] { width: 100%; accent-color: var(--cyan); cursor: pointer; }

  .field-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
  .inline-field { display: flex; align-items: center; gap: 10px; }

  .status {
    min-height: 42px;
    display: flex;
    align-items: center;
    margin-top: 12px;
    padding: 9px 11px;
    border: 1px solid var(--line);
    border-radius: var(--radius-control);
    background: var(--surface-soft);
    color: var(--text-muted);
    font-size: .78rem;
    line-height: var(--leading-control);
  }
  .status[data-tone="error"] { border-color: color-mix(in srgb, var(--danger) 32%, transparent); color: var(--danger); }
  .status[data-tone="success"] { border-color: color-mix(in srgb, var(--green) 30%, transparent); color: var(--green); }

  .panel-copy-feedback {
    min-width: 72px;
    transition: color 140ms ease, border-color 140ms ease, background 140ms ease, transform 140ms ease;
  }

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
  .converter-layout {
    grid-template-columns: minmax(0, 1.35fr) minmax(280px, .75fr);
  }
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
  .color-card-name { font-size: .8rem; font-weight: 680; line-height: var(--leading-control); }
  .color-card-code { color: var(--text-muted); font: .7rem/var(--leading-control) var(--font-mono); }

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
    line-height: var(--leading-control);
    text-decoration: none;
  }
  .tool-link:hover { border-color: var(--line-strong); color: var(--text); }

  .site-footer {
    padding: 26px 0 0;
    border-top: 1px solid var(--line);
    color: var(--text-subtle);
    font-size: .76rem;
    line-height: var(--leading-body);
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
    .nav-actions .button-quiet { display: none; }
  }

  @media (max-width: 1100px) {
    .app-shell { --shell-inline-padding: 18px; padding-inline: 18px; }
    .tool-layout { grid-template-columns: 1fr; }
    .converter-layout { grid-template-columns: 1fr; }
    .tool-sticky { position: static; }
    .palette-grid { grid-template-columns: repeat(5, minmax(92px, 1fr)); overflow-x: auto; padding-bottom: 7px; }
  }

  @media (max-width: 760px) {
    .app-shell { --shell-inline-padding: 14px; padding-inline: 14px; padding-bottom: 38px; }
    .site-nav {
      min-height: 56px;
      flex-wrap: nowrap;
      justify-content: space-between;
      gap: 14px;
    }
    .nav-menu {
      position: static;
      min-width: auto;
      flex: 0 0 auto;
      margin-left: auto;
    }
    .nav-menu-toggle {
      min-width: 44px;
      min-height: 44px;
      display: grid;
      place-items: center;
      padding: 0;
      border: 1px solid var(--line);
      border-radius: var(--radius-control);
      background: var(--surface);
      color: var(--text);
      cursor: pointer;
      list-style: none;
    }
    .nav-menu-toggle::-webkit-details-marker { display: none; }
    .nav-menu-icon,
    .nav-menu-icon::before,
    .nav-menu-icon::after {
      width: 18px;
      height: 2px;
      display: block;
      border-radius: 999px;
      background: currentColor;
      content: '';
      transition: transform 160ms ease;
    }
    .nav-menu-icon { position: relative; }
    .nav-menu-icon::before { position: absolute; top: -6px; }
    .nav-menu-icon::after { position: absolute; top: 6px; }
    .nav-menu[open] .nav-menu-icon { background: transparent; }
    .nav-menu[open] .nav-menu-icon::before { top: 0; transform: rotate(45deg); }
    .nav-menu[open] .nav-menu-icon::after { top: 0; transform: rotate(-45deg); }
    .nav-menu-panel,
    .nav-menu:not([open]) > .nav-menu-panel {
      display: none;
    }
    .nav-menu[open] > .nav-menu-panel {
      position: absolute;
      top: 100%;
      right: 0;
      left: 0;
      display: grid;
      gap: 0;
      padding: 12px 14px 16px;
      border-bottom: 1px solid var(--line);
      background: var(--paper-elevated);
      box-shadow: 0 8px 24px rgba(29, 29, 31, 0.08);
    }
    .nav-links {
      display: grid;
      gap: 2px;
    }
    .nav-link {
      min-height: 44px;
      display: flex;
      align-items: center;
      padding-inline: 12px;
    }
    .nav-actions {
      justify-content: space-between;
      gap: 12px;
      padding: 12px 8px 0;
      border-top: 1px solid var(--line);
    }
    .nav-preferences { min-height: 44px; }
    .nav-utility-group { gap: 8px; }
    .nav-segmented { border-radius: 11px; }
    .nav-actions .button-quiet { display: inline-flex; min-height: 44px; }
    .button-small, .result-field .button { min-height: 44px; }
    .page-heading { padding: 28px 0 20px; }
    .page-heading h1 { font-size: clamp(1.9rem, 9vw, 2.65rem); }
    .nav-switch-option {
      width: 44px;
      height: 44px;
      min-height: 44px;
    }
    .panel { border-radius: var(--radius-lg); }
    .panel-header, .panel-body { padding: 18px; }
    .field-row, .result-grid { grid-template-columns: 1fr; }
    .preview-frame { min-height: 240px; }
    .site-footer-main { align-items: flex-start; flex-direction: column; }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
  }
`
