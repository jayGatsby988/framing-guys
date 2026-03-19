// AURA Content Script — injected into every page
// Applies accessibility modifications based on popup settings
// Includes floating overlay panel for quick access on any website

const AURA_ID = 'aura-a11y-styles';
const AURA_OVERLAY_ID = 'aura-caption-overlay';
const AURA_FAB_ID = 'aura-fab';
const AURA_PANEL_ID = 'aura-panel';

// Color filter matrices
const colorFilters = {
  none: '',
  protanopia: 'url(#aura-protanopia)',
  deuteranopia: 'url(#aura-deuteranopia)',
  tritanopia: 'url(#aura-tritanopia)',
};

// Inject SVG filters for color blindness simulation
function injectColorFilters() {
  if (document.getElementById('aura-svg-filters')) return;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.id = 'aura-svg-filters';
  svg.setAttribute('style', 'position:absolute;width:0;height:0;');
  svg.innerHTML = `
    <defs>
      <filter id="aura-protanopia">
        <feColorMatrix type="matrix" values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0"/>
      </filter>
      <filter id="aura-deuteranopia">
        <feColorMatrix type="matrix" values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0"/>
      </filter>
      <filter id="aura-tritanopia">
        <feColorMatrix type="matrix" values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0"/>
      </filter>
    </defs>
  `;
  document.body.appendChild(svg);
}

const fontSizeSteps = [80, 90, 100, 110, 120, 130, 150, 175, 200];
const lineHeightValues = [1.2, 1.5, 1.8, 2.2, 2.6];
const letterSpacingValues = [0, 1, 2, 3, 4];

function applyStyles(state) {
  if (!state || !state.enabled) {
    removeStyles();
    return;
  }

  injectColorFilters();

  let css = '';
  const fsIdx = Math.max(0, Math.min(fontSizeSteps.length - 1, 2 + (state.fontSize || 0)));
  const lhIdx = Math.max(0, Math.min(lineHeightValues.length - 1, 1 + (state.lineHeight || 0)));
  const lsIdx = Math.max(0, Math.min(letterSpacingValues.length - 1, state.letterSpacing || 0));

  const fontSize = fontSizeSteps[fsIdx];
  const lineHeight = lineHeightValues[lhIdx];
  const letterSpacing = letterSpacingValues[lsIdx];

  if (fontSize !== 100) {
    css += `html { font-size: ${fontSize}% !important; }\n`;
  }
  if (lineHeight !== 1.5) {
    css += `body, p, li, td, th, span, div, article, section { line-height: ${lineHeight} !important; }\n`;
  }
  if (letterSpacing > 0) {
    css += `body, p, li, td, th, span, div { letter-spacing: ${letterSpacing}px !important; }\n`;
  }
  if (state.highContrast) {
    css += `
      html { filter: contrast(1.4) !important; }
      body { background: #000 !important; color: #fff !important; }
      a { color: #5eead4 !important; }
      img { filter: brightness(1.1) contrast(1.2) !important; }
    `;
  }
  if (state.dyslexiaFont) {
    css += `
      @font-face {
        font-family: 'OpenDyslexic';
        src: url('https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/OpenDyslexic-Regular.otf') format('opentype');
      }
      body, p, li, td, th, span, div, article, section, h1, h2, h3, h4, h5, h6, a, button, input, textarea, select {
        font-family: 'OpenDyslexic', sans-serif !important;
      }
    `;
  }
  if (state.reducedMotion) {
    css += `
      *, *::before, *::after {
        animation-duration: 0.001ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.001ms !important;
        scroll-behavior: auto !important;
      }
    `;
  }
  if (state.largeCursor) {
    css += `
      html, body, * {
        cursor: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><circle cx='20' cy='20' r='18' fill='%236366F1' opacity='0.5' stroke='white' stroke-width='2'/><circle cx='20' cy='20' r='4' fill='white'/></svg>") 20 20, auto !important;
      }
      a, button, [role='button'], input, select, textarea, label {
        cursor: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><circle cx='20' cy='20' r='18' fill='%23EC4899' opacity='0.5' stroke='white' stroke-width='2'/><circle cx='20' cy='20' r='4' fill='white'/></svg>") 20 20, pointer !important;
      }
    `;
  }
  if (state.focusHighlight) {
    css += `
      *:focus {
        outline: 3px solid #FBBF24 !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 6px rgba(251, 191, 36, 0.3) !important;
      }
      a:focus, button:focus, input:focus, select:focus, textarea:focus, [tabindex]:focus {
        outline: 3px solid #FBBF24 !important;
        outline-offset: 2px !important;
      }
    `;
  }
  if (state.hideImages) {
    css += `
      img, svg, video, canvas, picture, figure, [role="img"] {
        opacity: 0.1 !important;
        filter: grayscale(1) !important;
      }
    `;
  }
  if (state.colorFilter && state.colorFilter !== 'none') {
    css += `html { filter: ${colorFilters[state.colorFilter]} !important; }\n`;
  }
  // Reading guide — horizontal ruler that follows cursor
  if (state.readingGuide) {
    css += `
      #aura-reading-guide {
        display: block !important;
      }
    `;
  }
  // Highlight all links
  if (state.highlightLinks) {
    css += `
      a, a * {
        background: rgba(99,102,241,0.15) !important;
        outline: 2px solid rgba(99,102,241,0.4) !important;
        outline-offset: 1px !important;
        border-radius: 2px !important;
        text-decoration: underline !important;
      }
      a:visited, a:visited * {
        background: rgba(168,85,247,0.15) !important;
        outline-color: rgba(168,85,247,0.4) !important;
      }
    `;
  }
  // Select-to-speak: highlight selected text with a speak cursor
  if (state.selectTTS) {
    css += `
      ::selection {
        background: rgba(236,72,153,0.3) !important;
        color: inherit !important;
      }
    `;
  }
  if (state.simplify) {
    css += `
      header, footer, nav, aside, [role="banner"], [role="navigation"], [role="complementary"],
      .sidebar, .nav, .header, .footer, .ad, .advertisement, .social-share, .cookie-banner,
      [class*="cookie"], [class*="banner"], [class*="popup"], [class*="modal"],
      [class*="sidebar"], [class*="widget"], [class*="ad-"], [id*="ad-"] {
        display: none !important;
      }
      main, article, [role="main"], .content, .post, .article {
        max-width: 680px !important;
        margin: 0 auto !important;
        padding: 24px !important;
        font-size: 18px !important;
        line-height: 1.8 !important;
      }
      body {
        background: #111 !important;
        color: #e0e0e0 !important;
      }
    `;
  }

  // === Education Tools ===
  // Focus Mode - dim distracting elements
  if (state.focusMode) {
    css += `
      header, footer, nav, aside, [role="banner"], [role="complementary"],
      .sidebar, .nav, .ad, .advertisement, .social-share,
      [class*="cookie"], [class*="banner"], [class*="popup"],
      [class*="sidebar"], [class*="widget"], [class*="ad-"] {
        opacity: 0.15 !important;
        transition: opacity 0.3s !important;
      }
      header:hover, footer:hover, nav:hover, aside:hover,
      .sidebar:hover, .nav:hover {
        opacity: 1 !important;
      }
      main, article, [role="main"], .content, .post, .article {
        position: relative;
        z-index: 1;
        box-shadow: 0 0 60px rgba(99,102,241,0.08);
      }
    `;
  }
  // Highlight Headings - make h1-h6 stand out
  if (state.highlightHeadings) {
    css += `
      h1, h2, h3, h4, h5, h6 {
        background: linear-gradient(90deg, rgba(99,102,241,0.15), transparent) !important;
        border-left: 3px solid #6366F1 !important;
        padding-left: 12px !important;
        margin-left: -15px !important;
        border-radius: 0 4px 4px 0 !important;
      }
    `;
  }
  // Line Ruler - persistent horizontal line that follows scroll position
  if (state.lineRuler) {
    css += `
      #aura-line-ruler {
        display: block !important;
      }
    `;
    createLineRuler();
  } else {
    removeLineRuler();
  }

  // Don't hide AURA's own elements
  css += `
    #${AURA_FAB_ID}, #${AURA_FAB_ID} *, #${AURA_PANEL_ID}, #${AURA_PANEL_ID} *,
    #${AURA_OVERLAY_ID}, #${AURA_OVERLAY_ID} *, #aura-line-ruler {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      letter-spacing: normal !important;
      line-height: normal !important;
      filter: none !important;
      cursor: auto !important;
      animation-duration: unset !important;
      transition-duration: unset !important;
    }
  `;

  let styleEl = document.getElementById(AURA_ID);
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = AURA_ID;
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = css;
}

function removeStyles() {
  const el = document.getElementById(AURA_ID);
  if (el) el.remove();
  const svg = document.getElementById('aura-svg-filters');
  if (svg) svg.remove();
  removeCaptionOverlay();
  removeLineRuler();
}

// === Line Ruler (Education Tool) ===
function createLineRuler() {
  if (document.getElementById('aura-line-ruler')) return;
  const ruler = document.createElement('div');
  ruler.id = 'aura-line-ruler';
  ruler.style.cssText = `
    position: fixed; left: 0; right: 0; height: 40px; z-index: 2147483640;
    pointer-events: none; top: 50%;
    background: linear-gradient(180deg,
      rgba(99,102,241,0.08) 0%,
      transparent 15%,
      transparent 85%,
      rgba(99,102,241,0.08) 100%);
    border-top: 2px solid rgba(99,102,241,0.25);
    border-bottom: 2px solid rgba(99,102,241,0.25);
    transition: top 0.05s ease-out;
  `;
  document.body.appendChild(ruler);

  // Follow mouse
  document.addEventListener('mousemove', _auraRulerFollow);
}

function _auraRulerFollow(e) {
  const ruler = document.getElementById('aura-line-ruler');
  if (ruler) {
    ruler.style.top = (e.clientY - 20) + 'px';
  }
}

function removeLineRuler() {
  const ruler = document.getElementById('aura-line-ruler');
  if (ruler) ruler.remove();
  document.removeEventListener('mousemove', _auraRulerFollow);
}

// === Read Aloud ===
function readPageAloud() {
  const main = document.querySelector('main, article, [role="main"], .content, .post') || document.body;
  const text = main.innerText || main.textContent || '';
  const trimmed = text.substring(0, 10000);
  chrome.runtime.sendMessage({ type: 'AURA_TTS', text: trimmed });
}

// === Live Captions Overlay ===
function createCaptionOverlay() {
  if (document.getElementById(AURA_OVERLAY_ID)) return;

  const overlay = document.createElement('div');
  overlay.id = AURA_OVERLAY_ID;
  overlay.innerHTML = `
    <div style="
      position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
      max-width: 600px; width: 90%; z-index: 2147483647;
      background: rgba(0,0,0,0.85); backdrop-filter: blur(12px);
      border: 1px solid rgba(99,102,241,0.3); border-radius: 16px;
      padding: 16px 20px; color: white; font-family: -apple-system, sans-serif;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    ">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
        <div style="width:8px;height:8px;border-radius:50%;background:#EC4899;animation:aura-pulse 1.5s infinite;"></div>
        <span style="font-size:11px;color:rgba(255,255,255,0.4);font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">AURA Live Captions</span>
      </div>
      <div id="aura-caption-text" style="font-size:16px;line-height:1.6;color:rgba(255,255,255,0.9);min-height:24px;">
        Listening...
      </div>
    </div>
    <style>
      @keyframes aura-pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
    </style>
  `;
  document.body.appendChild(overlay);
  startCaptionRecognition();
}

function removeCaptionOverlay() {
  const overlay = document.getElementById(AURA_OVERLAY_ID);
  if (overlay) overlay.remove();
  if (window._auraRecognition) {
    window._auraRecognition.stop();
    window._auraRecognition = null;
  }
}

function startCaptionRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    const textEl = document.getElementById('aura-caption-text');
    if (textEl) textEl.textContent = 'Speech recognition not supported in this browser.';
    return;
  }

  const recognition = new SR();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = (event) => {
    const textEl = document.getElementById('aura-caption-text');
    if (!textEl) return;
    let final = '';
    let interim = '';
    for (let i = 0; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        final += event.results[i][0].transcript + ' ';
      } else {
        interim += event.results[i][0].transcript;
      }
    }
    const display = (final.slice(-200) + interim).trim();
    textEl.textContent = display || 'Listening...';
  };

  recognition.onerror = (event) => {
    if (event.error === 'no-speech') return;
    console.log('AURA caption error:', event.error);
  };

  recognition.onend = () => {
    if (document.getElementById(AURA_OVERLAY_ID)) {
      try { recognition.start(); } catch (e) { /* ignore */ }
    }
  };

  recognition.start();
  window._auraRecognition = recognition;
}


// ═══════════════════════════════════════════════════════════
// FLOATING ACTION BUTTON + OVERLAY PANEL
// Provides quick access to all AURA controls on any website
// ═══════════════════════════════════════════════════════════

let _panelOpen = false;
let _currentState = null;

function createFAB() {
  if (document.getElementById(AURA_FAB_ID)) return;

  const fab = document.createElement('div');
  fab.id = AURA_FAB_ID;
  fab.innerHTML = `
    <style>
      #${AURA_FAB_ID} {
        position: fixed !important;
        bottom: 24px !important;
        right: 24px !important;
        z-index: 2147483646 !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      }
      .aura-fab-btn {
        width: 48px; height: 48px; border-radius: 16px;
        background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
        border: 1px solid rgba(255,255,255,0.15);
        box-shadow: 0 4px 24px rgba(99,102,241,0.4), 0 2px 8px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; transition: all 0.3s ease;
        color: white; position: relative;
      }
      .aura-fab-btn:hover {
        transform: scale(1.08);
        box-shadow: 0 6px 32px rgba(99,102,241,0.5), 0 2px 8px rgba(0,0,0,0.3);
      }
      .aura-fab-btn.active {
        border-radius: 12px;
        background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
      }
      .aura-fab-btn svg {
        width: 22px; height: 22px; transition: transform 0.3s ease;
      }
      .aura-fab-btn.active svg {
        transform: rotate(45deg);
      }
      .aura-fab-dot {
        position: absolute; top: -2px; right: -2px;
        width: 10px; height: 10px; border-radius: 50%;
        background: #22C55E; border: 2px solid #0A0A10;
      }
    </style>
    <button class="aura-fab-btn" id="aura-fab-toggle" title="AURA Accessibility">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2a4 4 0 0 1 4 4M12 2a4 4 0 0 0-4 4M12 2v2M8 6h8M9 14l-2 6M15 14l2 6M12 8v6"/>
      </svg>
      <div class="aura-fab-dot" style="display:none;" id="aura-fab-active-dot"></div>
    </button>
  `;
  document.body.appendChild(fab);

  document.getElementById('aura-fab-toggle').addEventListener('click', () => {
    _panelOpen = !_panelOpen;
    const btn = document.getElementById('aura-fab-toggle');
    btn.classList.toggle('active', _panelOpen);
    if (_panelOpen) {
      createPanel();
    } else {
      removePanel();
    }
  });

  // Show active dot if any settings are active
  updateFABDot();
}

function updateFABDot() {
  const dot = document.getElementById('aura-fab-active-dot');
  if (!dot || !_currentState) return;
  const isActive = _currentState.enabled && (
    _currentState.fontSize !== 0 ||
    _currentState.lineHeight !== 0 ||
    _currentState.letterSpacing !== 0 ||
    _currentState.highContrast ||
    _currentState.dyslexiaFont ||
    _currentState.reducedMotion ||
    _currentState.largeCursor ||
    _currentState.focusHighlight ||
    _currentState.hideImages ||
    _currentState.colorFilter !== 'none' ||
    _currentState.simplify ||
    _currentState.captions ||
    _currentState.readAloud
  );
  dot.style.display = isActive ? 'block' : 'none';
}

function createPanel() {
  if (document.getElementById(AURA_PANEL_ID)) return;

  const panel = document.createElement('div');
  panel.id = AURA_PANEL_ID;
  panel.innerHTML = `
    <style>
      #${AURA_PANEL_ID} {
        position: fixed !important;
        bottom: 82px !important;
        right: 24px !important;
        width: 300px !important;
        max-height: 480px !important;
        z-index: 2147483646 !important;
        background: #0C0C12 !important;
        border: 1px solid rgba(255,255,255,0.08) !important;
        border-radius: 20px !important;
        box-shadow: 0 12px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1) !important;
        overflow: hidden !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        color: #e8e8f0 !important;
        font-size: 13px !important;
        animation: aura-panel-in 0.25s ease !important;
      }
      @keyframes aura-panel-in {
        from { opacity: 0; transform: translateY(12px) scale(0.95); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      .aura-p-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.05);
        background: linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.03));
      }
      .aura-p-logo {
        display: flex; align-items: center; gap: 8px;
        font-weight: 700; font-size: 14px; color: #818CF8;
      }
      .aura-p-power {
        width: 28px; height: 28px; border-radius: 8px;
        border: 1px solid rgba(255,255,255,0.1);
        background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.3);
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        transition: all 0.2s;
      }
      .aura-p-power:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.6); }
      .aura-p-power.on { background: rgba(99,102,241,0.2); border-color: rgba(99,102,241,0.3); color: #818CF8; }
      .aura-p-body {
        padding: 12px; max-height: 380px; overflow-y: auto;
      }
      .aura-p-body::-webkit-scrollbar { width: 4px; }
      .aura-p-body::-webkit-scrollbar-track { background: transparent; }
      .aura-p-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
      .aura-p-section {
        margin-bottom: 12px;
      }
      .aura-p-section-title {
        font-size: 9px; font-weight: 600; text-transform: uppercase;
        letter-spacing: 0.08em; color: rgba(255,255,255,0.25);
        margin-bottom: 8px; padding: 0 4px;
      }
      .aura-p-row {
        display: flex; align-items: center; justify-content: space-between;
        padding: 6px 8px; border-radius: 8px;
        transition: background 0.15s;
      }
      .aura-p-row:hover { background: rgba(255,255,255,0.03); }
      .aura-p-row label {
        font-size: 12px; color: rgba(255,255,255,0.55);
      }
      .aura-p-toggle {
        position: relative; width: 34px; height: 18px;
        border-radius: 9px; border: none;
        background: rgba(255,255,255,0.08);
        cursor: pointer; transition: background 0.2s; padding: 0;
      }
      .aura-p-toggle.on { background: #6366F1; }
      .aura-p-toggle-thumb {
        position: absolute; top: 2px; left: 2px;
        width: 14px; height: 14px; border-radius: 50%;
        background: white; transition: transform 0.2s;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      }
      .aura-p-toggle.on .aura-p-toggle-thumb { transform: translateX(16px); }
      .aura-p-stepper {
        display: flex; align-items: center; gap: 6px;
      }
      .aura-p-step-btn {
        width: 24px; height: 24px; border-radius: 6px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.4);
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        font-size: 14px; font-weight: 500; transition: all 0.15s;
      }
      .aura-p-step-btn:hover {
        background: rgba(99,102,241,0.15); border-color: rgba(99,102,241,0.3); color: #A5B4FC;
      }
      .aura-p-step-val {
        font-size: 11px; color: rgba(255,255,255,0.35);
        min-width: 40px; text-align: center;
        font-variant-numeric: tabular-nums;
      }
      .aura-p-actions {
        display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;
        margin-bottom: 8px;
      }
      .aura-p-action-btn {
        display: flex; flex-direction: column; align-items: center; gap: 4px;
        padding: 10px 4px; border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.05);
        background: rgba(255,255,255,0.02);
        color: rgba(255,255,255,0.4); cursor: pointer;
        transition: all 0.2s; font-size: 9px; text-align: center;
      }
      .aura-p-action-btn:hover {
        background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.7);
        border-color: rgba(255,255,255,0.1);
      }
      .aura-p-action-btn.on {
        background: rgba(99,102,241,0.12); border-color: rgba(99,102,241,0.25); color: #A5B4FC;
      }
      .aura-p-action-btn svg {
        width: 16px; height: 16px; flex-shrink: 0;
      }
      .aura-p-color-grid {
        display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px;
      }
      .aura-p-color-btn {
        padding: 6px 8px; border-radius: 6px;
        border: 1px solid rgba(255,255,255,0.05);
        background: rgba(255,255,255,0.02);
        color: rgba(255,255,255,0.4); cursor: pointer;
        font-size: 10px; transition: all 0.2s; text-align: center;
      }
      .aura-p-color-btn:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.6); }
      .aura-p-color-btn.on {
        background: rgba(99,102,241,0.12); border-color: rgba(99,102,241,0.25); color: #A5B4FC;
      }
      .aura-p-reset {
        width: 100%; padding: 8px; border-radius: 8px;
        border: 1px solid rgba(255,255,255,0.05);
        background: rgba(255,255,255,0.02);
        color: rgba(255,255,255,0.25); cursor: pointer;
        font-size: 10px; transition: all 0.2s;
      }
      .aura-p-reset:hover {
        background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.15); color: #F87171;
      }
    </style>

    <div class="aura-p-header">
      <div class="aura-p-logo">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a4 4 0 0 1 4 4M12 2a4 4 0 0 0-4 4M12 2v2M8 6h8M9 14l-2 6M15 14l2 6M12 8v6"/>
        </svg>
        AURA
      </div>
      <button class="aura-p-power ${_currentState?.enabled ? 'on' : ''}" id="aura-p-power-btn" title="Toggle AURA">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M12 2v6M18.36 6.64A9 9 0 1 1 5.64 6.64"/>
        </svg>
      </button>
    </div>
    <div class="aura-p-body" id="aura-p-body">
      <!-- Quick Actions -->
      <div class="aura-p-section">
        <div class="aura-p-section-title">Quick Actions</div>
        <div class="aura-p-actions">
          <button class="aura-p-action-btn ${_currentState?.readAloud ? 'on' : ''}" data-action="readAloud">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            Read Aloud
          </button>
          <button class="aura-p-action-btn ${_currentState?.simplify ? 'on' : ''}" data-action="simplify">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            Simplify
          </button>
          <button class="aura-p-action-btn ${_currentState?.captions ? 'on' : ''}" data-action="captions">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
            Captions
          </button>
        </div>
      </div>

      <!-- Text Controls -->
      <div class="aura-p-section">
        <div class="aura-p-section-title">Text</div>
        <div class="aura-p-row">
          <label>Font Size</label>
          <div class="aura-p-stepper">
            <button class="aura-p-step-btn" data-step="fontSize" data-dir="-1">−</button>
            <span class="aura-p-step-val" id="aura-p-fs-val">${fontSizeSteps[Math.max(0, Math.min(fontSizeSteps.length - 1, 2 + (_currentState?.fontSize || 0)))]  }%</span>
            <button class="aura-p-step-btn" data-step="fontSize" data-dir="1">+</button>
          </div>
        </div>
        <div class="aura-p-row">
          <label>Line Height</label>
          <div class="aura-p-stepper">
            <button class="aura-p-step-btn" data-step="lineHeight" data-dir="-1">−</button>
            <span class="aura-p-step-val" id="aura-p-lh-val">${lineHeightValues[Math.max(0, Math.min(lineHeightValues.length - 1, 1 + (_currentState?.lineHeight || 0)))]}</span>
            <button class="aura-p-step-btn" data-step="lineHeight" data-dir="1">+</button>
          </div>
        </div>
        <div class="aura-p-row">
          <label>Letter Spacing</label>
          <div class="aura-p-stepper">
            <button class="aura-p-step-btn" data-step="letterSpacing" data-dir="-1">−</button>
            <span class="aura-p-step-val" id="aura-p-ls-val">${letterSpacingValues[Math.max(0, Math.min(letterSpacingValues.length - 1, _currentState?.letterSpacing || 0))]}px</span>
            <button class="aura-p-step-btn" data-step="letterSpacing" data-dir="1">+</button>
          </div>
        </div>
      </div>

      <!-- Visual Toggles -->
      <div class="aura-p-section">
        <div class="aura-p-section-title">Visual</div>
        ${['highContrast:High Contrast', 'dyslexiaFont:Dyslexia Font', 'reducedMotion:Reduce Motion', 'largeCursor:Large Cursor', 'focusHighlight:Focus Highlight', 'hideImages:Hide Images'].map(item => {
          const [key, label] = item.split(':');
          return `
            <div class="aura-p-row">
              <label>${label}</label>
              <button class="aura-p-toggle ${_currentState?.[key] ? 'on' : ''}" data-toggle="${key}">
                <div class="aura-p-toggle-thumb"></div>
              </button>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Color Filters -->
      <div class="aura-p-section">
        <div class="aura-p-section-title">Color Vision</div>
        <div class="aura-p-color-grid">
          ${['none:Normal', 'protanopia:Protanopia', 'deuteranopia:Deuteranopia', 'tritanopia:Tritanopia'].map(item => {
            const [key, label] = item.split(':');
            return `<button class="aura-p-color-btn ${_currentState?.colorFilter === key ? 'on' : ''}" data-color="${key}">${label}</button>`;
          }).join('')}
        </div>
      </div>

      <!-- Reset -->
      <button class="aura-p-reset" id="aura-p-reset">Reset All Settings</button>
    </div>
  `;

  document.body.appendChild(panel);
  bindPanelEvents();
}

function removePanel() {
  const panel = document.getElementById(AURA_PANEL_ID);
  if (panel) panel.remove();
}

function bindPanelEvents() {
  const panel = document.getElementById(AURA_PANEL_ID);
  if (!panel) return;

  // Power toggle
  document.getElementById('aura-p-power-btn').addEventListener('click', () => {
    _currentState.enabled = !_currentState.enabled;
    saveAndApply();
    refreshPanel();
  });

  // Quick actions
  panel.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      _currentState[action] = !_currentState[action];
      saveAndApply();
      refreshPanel();

      if (action === 'readAloud') {
        if (_currentState.readAloud) {
          readPageAloud();
        } else {
          chrome.runtime.sendMessage({ type: 'AURA_STOP_TTS' });
        }
      }
      if (action === 'captions') {
        if (_currentState.captions && _currentState.enabled) {
          createCaptionOverlay();
        } else {
          removeCaptionOverlay();
        }
      }
    });
  });

  // Steppers
  panel.querySelectorAll('[data-step]').forEach(btn => {
    btn.addEventListener('click', () => {
      const prop = btn.dataset.step;
      const dir = parseInt(btn.dataset.dir);
      if (prop === 'fontSize') {
        _currentState.fontSize = Math.max(-2, Math.min(fontSizeSteps.length - 3, (_currentState.fontSize || 0) + dir));
      } else if (prop === 'lineHeight') {
        _currentState.lineHeight = Math.max(-1, Math.min(lineHeightValues.length - 2, (_currentState.lineHeight || 0) + dir));
      } else if (prop === 'letterSpacing') {
        _currentState.letterSpacing = Math.max(0, Math.min(letterSpacingValues.length - 1, (_currentState.letterSpacing || 0) + dir));
      }
      saveAndApply();
      updateStepperValues();
    });
  });

  // Toggle switches
  panel.querySelectorAll('[data-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.toggle;
      _currentState[key] = !_currentState[key];
      saveAndApply();
      btn.classList.toggle('on', _currentState[key]);
    });
  });

  // Color filter
  panel.querySelectorAll('[data-color]').forEach(btn => {
    btn.addEventListener('click', () => {
      _currentState.colorFilter = btn.dataset.color;
      saveAndApply();
      panel.querySelectorAll('[data-color]').forEach(b => b.classList.toggle('on', b.dataset.color === _currentState.colorFilter));
    });
  });

  // Reset
  document.getElementById('aura-p-reset').addEventListener('click', () => {
    _currentState = {
      enabled: true, fontSize: 0, lineHeight: 0, letterSpacing: 0,
      highContrast: false, dyslexiaFont: false, reducedMotion: false,
      largeCursor: false, focusHighlight: false, hideImages: false,
      colorFilter: 'none', readAloud: false, simplify: false, captions: false,
    };
    saveAndApply();
    refreshPanel();
  });
}

function updateStepperValues() {
  const fsEl = document.getElementById('aura-p-fs-val');
  const lhEl = document.getElementById('aura-p-lh-val');
  const lsEl = document.getElementById('aura-p-ls-val');
  if (fsEl) fsEl.textContent = fontSizeSteps[Math.max(0, Math.min(fontSizeSteps.length - 1, 2 + (_currentState?.fontSize || 0)))] + '%';
  if (lhEl) lhEl.textContent = String(lineHeightValues[Math.max(0, Math.min(lineHeightValues.length - 1, 1 + (_currentState?.lineHeight || 0)))]);
  if (lsEl) lsEl.textContent = letterSpacingValues[Math.max(0, Math.min(letterSpacingValues.length - 1, _currentState?.letterSpacing || 0))] + 'px';
}

function refreshPanel() {
  removePanel();
  if (_panelOpen) createPanel();
  updateFABDot();
}

function saveAndApply() {
  chrome.storage.local.set({ auraState: _currentState });
  applyStyles(_currentState);
  updateFABDot();
  // Sync popup if open
  chrome.runtime.sendMessage({ type: 'AURA_STATE_CHANGED', state: _currentState });
}


// === Reading Guide ===
const READING_GUIDE_ID = 'aura-reading-guide';

function createReadingGuide() {
  if (document.getElementById(READING_GUIDE_ID)) return;
  const guide = document.createElement('div');
  guide.id = READING_GUIDE_ID;
  guide.style.cssText = `
    position: fixed; left: 0; right: 0; height: 3px; pointer-events: none;
    z-index: 2147483640; display: none;
    background: linear-gradient(90deg, transparent, rgba(99,102,241,0.6) 10%, rgba(99,102,241,0.6) 90%, transparent);
    box-shadow: 0 0 12px rgba(99,102,241,0.3);
    transition: top 0.05s ease-out;
  `;
  document.body.appendChild(guide);
  document.addEventListener('mousemove', (e) => {
    guide.style.top = e.clientY + 'px';
  });
}

function removeReadingGuide() {
  const el = document.getElementById(READING_GUIDE_ID);
  if (el) el.remove();
}

// === Page Summarizer ===
const SUMMARY_OVERLAY_ID = 'aura-summary-overlay';

function showPageSummary() {
  if (document.getElementById(SUMMARY_OVERLAY_ID)) {
    document.getElementById(SUMMARY_OVERLAY_ID).remove();
    return;
  }
  const main = document.querySelector('main, article, [role="main"], .content, .post') || document.body;
  const text = (main.innerText || main.textContent || '').substring(0, 5000).trim();
  if (!text) return;

  // Extract key info
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const topSentences = sentences.slice(0, 5).map(s => s.trim());

  // Get page title and headings
  const title = document.title || 'This Page';
  const headings = [...document.querySelectorAll('h1, h2, h3')].slice(0, 8).map(h => h.textContent.trim()).filter(Boolean);

  const overlay = document.createElement('div');
  overlay.id = SUMMARY_OVERLAY_ID;
  overlay.innerHTML = `
    <div style="
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      max-width: 500px; width: 90%; max-height: 70vh; overflow-y: auto;
      z-index: 2147483647; background: #0C0C14; backdrop-filter: blur(20px);
      border: 1px solid rgba(99,102,241,0.2); border-radius: 20px;
      padding: 24px; color: white; font-family: -apple-system, sans-serif;
      box-shadow: 0 20px 60px rgba(0,0,0,0.8);
    ">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#6366F1,#8B5CF6);display:flex;align-items:center;justify-content:center;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <span style="font-weight:700;font-size:14px;color:#818CF8;">Page Summary</span>
        </div>
        <button id="aura-summary-close" style="background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;font-size:18px;padding:4px;">&times;</button>
      </div>
      <h3 style="font-size:15px;color:rgba(255,255,255,0.9);margin-bottom:12px;line-height:1.4;">${title}</h3>
      ${headings.length > 0 ? `
        <div style="margin-bottom:12px;">
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.05em;color:rgba(255,255,255,0.3);margin-bottom:6px;">Sections</div>
          ${headings.map(h => `<div style="font-size:12px;color:rgba(255,255,255,0.5);padding:3px 0;border-left:2px solid rgba(99,102,241,0.3);padding-left:8px;margin-bottom:2px;">${h}</div>`).join('')}
        </div>
      ` : ''}
      <div style="margin-bottom:8px;">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.05em;color:rgba(255,255,255,0.3);margin-bottom:6px;">Key Points</div>
        ${topSentences.map(s => `<div style="font-size:12px;color:rgba(255,255,255,0.6);line-height:1.5;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.03);">${s}.</div>`).join('')}
      </div>
      <div style="font-size:10px;color:rgba(255,255,255,0.2);margin-top:12px;text-align:center;">~${text.split(/\s+/).length} words on this page</div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Close on click outside or close button
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  document.getElementById('aura-summary-close').addEventListener('click', () => overlay.remove());
}

// === Select-to-Speak ===
function setupSelectTTS() {
  document.addEventListener('mouseup', handleSelectTTS);
}

function removeSelectTTS() {
  document.removeEventListener('mouseup', handleSelectTTS);
  const btn = document.getElementById('aura-speak-btn');
  if (btn) btn.remove();
}

function handleSelectTTS() {
  const old = document.getElementById('aura-speak-btn');
  if (old) old.remove();

  if (!_currentState?.selectTTS || !_currentState?.enabled) return;

  const sel = window.getSelection();
  const text = sel?.toString().trim();
  if (!text || text.length < 2) return;

  const range = sel.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  const btn = document.createElement('button');
  btn.id = 'aura-speak-btn';
  btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`;
  btn.style.cssText = `
    position: fixed; z-index: 2147483647;
    top: ${rect.top - 36}px; left: ${rect.left + rect.width / 2 - 16}px;
    width: 32px; height: 32px; border-radius: 10px;
    background: linear-gradient(135deg, #6366F1, #8B5CF6);
    border: 1px solid rgba(255,255,255,0.2);
    color: white; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 16px rgba(99,102,241,0.4);
    animation: aura-panel-in 0.15s ease;
  `;
  btn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'AURA_TTS', text: text.substring(0, 5000) });
    btn.remove();
  });
  document.body.appendChild(btn);

  // Remove after 5 seconds
  setTimeout(() => { if (btn.parentElement) btn.remove(); }, 5000);
}

// === Message Listener ===
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'AURA_UPDATE') {
    const prev = _currentState;
    _currentState = message.state;
    applyStyles(message.state);
    updateFABDot();
    if (_panelOpen) refreshPanel();

    if (message.state.captions && message.state.enabled) {
      createCaptionOverlay();
    } else {
      removeCaptionOverlay();
    }

    // Reading guide
    if (message.state.readingGuide && message.state.enabled) {
      createReadingGuide();
    } else {
      removeReadingGuide();
    }

    // Select-to-speak
    if (message.state.selectTTS && message.state.enabled) {
      setupSelectTTS();
    } else {
      removeSelectTTS();
    }
  }

  if (message.type === 'AURA_READ_ALOUD') {
    readPageAloud();
  }

  if (message.type === 'AURA_STOP_READING') {
    // TTS is stopped via background script
  }

  if (message.type === 'AURA_SUMMARIZE') {
    showPageSummary();
  }
});

// Load and apply saved state on page load, then create FAB
chrome.storage.local.get('auraState', (result) => {
  _currentState = result.auraState || {
    enabled: true, fontSize: 0, lineHeight: 0, letterSpacing: 0,
    highContrast: false, dyslexiaFont: false, reducedMotion: false,
    largeCursor: false, focusHighlight: false, hideImages: false,
    colorFilter: 'none', readAloud: false, simplify: false, captions: false,
    readingGuide: false, highlightLinks: false, selectTTS: false,
  };

  if (_currentState.enabled) {
    applyStyles(_currentState);
    if (_currentState.captions) createCaptionOverlay();
    if (_currentState.readingGuide) createReadingGuide();
    if (_currentState.selectTTS) setupSelectTTS();
  }

  // Create the floating button on every page
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createFAB);
  } else {
    createFAB();
  }
});
