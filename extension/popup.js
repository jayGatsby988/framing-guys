// Default state
const defaults = {
  enabled: true,
  fontSize: 0,        // offset from 100% in steps of 10
  lineHeight: 0,      // offset steps
  letterSpacing: 0,   // offset steps
  highContrast: false,
  dyslexiaFont: false,
  reducedMotion: false,
  largeCursor: false,
  focusHighlight: false,
  hideImages: false,
  colorFilter: 'none',
  readAloud: false,
  simplify: false,
  captions: false,
};

const fontSizeSteps = [80, 90, 100, 110, 120, 130, 150, 175, 200];
const lineHeightLabels = ['Tight', 'Normal', 'Relaxed', 'Loose', 'Extra'];
const lineHeightValues = [1.2, 1.5, 1.8, 2.2, 2.6];
const letterSpacingLabels = ['Normal', '+1px', '+2px', '+3px', '+4px'];
const letterSpacingValues = [0, 1, 2, 3, 4];

let state = { ...defaults };

// Load state from storage
chrome.storage.local.get('auraState', (result) => {
  if (result.auraState) {
    state = { ...defaults, ...result.auraState };
  }
  render();
});

function save() {
  chrome.storage.local.set({ auraState: state });
  applyToPage();
}

function render() {
  // Power button
  const powerBtn = document.getElementById('power-btn');
  powerBtn.classList.toggle('active', state.enabled);

  // Font size
  const fsIdx = Math.max(0, Math.min(fontSizeSteps.length - 1, 2 + state.fontSize));
  document.getElementById('fontSize-value').textContent = fontSizeSteps[fsIdx] + '%';

  // Line height
  const lhIdx = Math.max(0, Math.min(lineHeightLabels.length - 1, 1 + state.lineHeight));
  document.getElementById('lineHeight-value').textContent = lineHeightLabels[lhIdx];

  // Letter spacing
  const lsIdx = Math.max(0, Math.min(letterSpacingLabels.length - 1, state.letterSpacing));
  document.getElementById('letterSpacing-value').textContent = letterSpacingLabels[lsIdx];

  // Toggles
  setToggle('toggle-contrast', state.highContrast);
  setToggle('toggle-dyslexia', state.dyslexiaFont);
  setToggle('toggle-motion', state.reducedMotion);
  setToggle('toggle-cursor', state.largeCursor);
  setToggle('toggle-focus', state.focusHighlight);
  setToggle('toggle-images', state.hideImages);

  // Color filter buttons
  document.querySelectorAll('.color-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === state.colorFilter);
  });

  // Action buttons
  document.getElementById('btn-read-aloud').classList.toggle('active', state.readAloud);
  document.getElementById('btn-simplify').classList.toggle('active', state.simplify);
  document.getElementById('btn-captions').classList.toggle('active', state.captions);
}

function setToggle(id, value) {
  const el = document.getElementById(id);
  el.setAttribute('aria-checked', value ? 'true' : 'false');
}

// Send settings to content script
function applyToPage() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'AURA_UPDATE', state });
    }
  });
}

// === Event Listeners ===

// Power toggle
document.getElementById('power-btn').addEventListener('click', () => {
  state.enabled = !state.enabled;
  save();
  render();
});

// Step buttons (font size, line height, letter spacing)
document.querySelectorAll('.step-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.action;
    const dir = parseInt(btn.dataset.dir);

    if (action === 'fontSize') {
      state.fontSize = Math.max(-2, Math.min(fontSizeSteps.length - 3, state.fontSize + dir));
    } else if (action === 'lineHeight') {
      state.lineHeight = Math.max(-1, Math.min(lineHeightLabels.length - 2, state.lineHeight + dir));
    } else if (action === 'letterSpacing') {
      state.letterSpacing = Math.max(0, Math.min(letterSpacingValues.length - 1, state.letterSpacing + dir));
    }

    save();
    render();
  });
});

// Toggle switches
const toggleMap = {
  'toggle-contrast': 'highContrast',
  'toggle-dyslexia': 'dyslexiaFont',
  'toggle-motion': 'reducedMotion',
  'toggle-cursor': 'largeCursor',
  'toggle-focus': 'focusHighlight',
  'toggle-images': 'hideImages',
};

Object.entries(toggleMap).forEach(([id, key]) => {
  document.getElementById(id).addEventListener('click', () => {
    state[key] = !state[key];
    save();
    render();
  });
});

// Color filter buttons
document.querySelectorAll('.color-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    state.colorFilter = btn.dataset.filter;
    save();
    render();
  });
});

// Read Aloud
document.getElementById('btn-read-aloud').addEventListener('click', () => {
  state.readAloud = !state.readAloud;
  save();
  render();

  if (state.readAloud) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'AURA_READ_ALOUD' });
      }
    });
  } else {
    chrome.tts.stop();
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'AURA_STOP_READING' });
      }
    });
  }
});

// Simplify
document.getElementById('btn-simplify').addEventListener('click', () => {
  state.simplify = !state.simplify;
  save();
  render();
});

// Captions
document.getElementById('btn-captions').addEventListener('click', () => {
  state.captions = !state.captions;
  save();
  render();
});

// Dashboard - open in new tab
document.getElementById('btn-dashboard').addEventListener('click', () => {
  chrome.tabs.create({ url: 'http://localhost:3000/dashboard' });
});

// Reset
document.getElementById('btn-reset').addEventListener('click', () => {
  state = { ...defaults };
  save();
  render();
});
