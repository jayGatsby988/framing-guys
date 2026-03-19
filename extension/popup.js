const defaults = {
  enabled: true,
  fontSize: 0,
  lineHeight: 0,
  letterSpacing: 0,
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
  readingGuide: false,
  highlightLinks: false,
  selectTTS: false,
  focusMode: false,
  highlightHeadings: false,
  lineRuler: false,
  ttsSpeed: 2,
};

const fontSizeSteps = [80, 90, 100, 110, 120, 130, 150, 175, 200];
const lineHeightLabels = ['Tight', 'Normal', 'Relaxed', 'Loose', 'Extra'];
const lineHeightValues = [1.2, 1.5, 1.8, 2.2, 2.6];
const letterSpacingLabels = ['Normal', '+1px', '+2px', '+3px', '+4px'];
const letterSpacingValues = [0, 1, 2, 3, 4];
const ttsSpeedLabels = ['0.5x', '0.75x', '1.0x', '1.25x', '1.5x', '2.0x'];
const ttsSpeedValues = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

const DASHBOARD_URL = 'https://aura-accessibility.vercel.app/dashboard';

let state = { ...defaults };

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
  const powerBtn = document.getElementById('power-btn');
  powerBtn.classList.toggle('active', state.enabled);

  const fsIdx = Math.max(0, Math.min(fontSizeSteps.length - 1, 2 + state.fontSize));
  document.getElementById('fontSize-value').textContent = fontSizeSteps[fsIdx] + '%';

  const lhIdx = Math.max(0, Math.min(lineHeightLabels.length - 1, 1 + state.lineHeight));
  document.getElementById('lineHeight-value').textContent = lineHeightLabels[lhIdx];

  const lsIdx = Math.max(0, Math.min(letterSpacingLabels.length - 1, state.letterSpacing));
  document.getElementById('letterSpacing-value').textContent = letterSpacingLabels[lsIdx];

  setToggle('toggle-contrast', state.highContrast);
  setToggle('toggle-dyslexia', state.dyslexiaFont);
  setToggle('toggle-motion', state.reducedMotion);
  setToggle('toggle-cursor', state.largeCursor);
  setToggle('toggle-focus', state.focusHighlight);
  setToggle('toggle-images', state.hideImages);

  document.querySelectorAll('.color-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === state.colorFilter);
  });

  document.getElementById('btn-read-aloud').classList.toggle('active', state.readAloud);
  document.getElementById('btn-simplify').classList.toggle('active', state.simplify);
  document.getElementById('btn-captions').classList.toggle('active', state.captions);
  document.getElementById('btn-reading-guide').classList.toggle('active', state.readingGuide);
  document.getElementById('btn-highlight-links').classList.toggle('active', state.highlightLinks);
  document.getElementById('btn-text-select').classList.toggle('active', state.selectTTS);

  setToggle('toggle-focus-mode', state.focusMode);
  setToggle('toggle-headings', state.highlightHeadings);
  setToggle('toggle-ruler', state.lineRuler);

  const ttsIdx = Math.max(0, Math.min(ttsSpeedLabels.length - 1, state.ttsSpeed));
  document.getElementById('ttsSpeed-value').textContent = ttsSpeedLabels[ttsIdx];

  chrome.storage.local.get('auraQuickNotes', (result) => {
    const notesEl = document.getElementById('quick-notes');
    if (notesEl && result.auraQuickNotes && !notesEl._userEdited) {
      notesEl.value = result.auraQuickNotes;
    }
  });
}

function setToggle(id, value) {
  const el = document.getElementById(id);
  el.setAttribute('aria-checked', value ? 'true' : 'false');
}

function applyToPage() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'AURA_UPDATE', state });
    }
  });
}

document.getElementById('power-btn').addEventListener('click', () => {
  state.enabled = !state.enabled;
  save();
  render();
});

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
    } else if (action === 'ttsSpeed') {
      state.ttsSpeed = Math.max(0, Math.min(ttsSpeedValues.length - 1, state.ttsSpeed + dir));
    }

    save();
    render();
  });
});

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

document.querySelectorAll('.color-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    state.colorFilter = btn.dataset.filter;
    save();
    render();
  });
});

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

document.getElementById('btn-simplify').addEventListener('click', () => {
  state.simplify = !state.simplify;
  save();
  render();
});

document.getElementById('btn-captions').addEventListener('click', () => {
  state.captions = !state.captions;
  save();
  render();
});

document.getElementById('btn-reading-guide').addEventListener('click', () => {
  state.readingGuide = !state.readingGuide;
  save();
  render();
});

document.getElementById('btn-summarize').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'AURA_SUMMARIZE' });
    }
  });
});

document.getElementById('btn-highlight-links').addEventListener('click', () => {
  state.highlightLinks = !state.highlightLinks;
  save();
  render();
});

document.getElementById('btn-text-select').addEventListener('click', () => {
  state.selectTTS = !state.selectTTS;
  save();
  render();
});

document.getElementById('btn-dashboard').addEventListener('click', () => {
  chrome.tabs.create({ url: DASHBOARD_URL });
});

const eduToggleMap = {
  'toggle-focus-mode': 'focusMode',
  'toggle-headings': 'highlightHeadings',
  'toggle-ruler': 'lineRuler',
};

Object.entries(eduToggleMap).forEach(([id, key]) => {
  document.getElementById(id).addEventListener('click', () => {
    state[key] = !state[key];
    save();
    render();
  });
});

const notesEl = document.getElementById('quick-notes');
notesEl.addEventListener('input', () => {
  notesEl._userEdited = true;
  chrome.storage.local.set({ auraQuickNotes: notesEl.value });
});

document.getElementById('btn-copy-notes').addEventListener('click', () => {
  navigator.clipboard.writeText(notesEl.value).then(() => {
    const btn = document.getElementById('btn-copy-notes');
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
  });
});

document.getElementById('btn-clear-notes').addEventListener('click', () => {
  notesEl.value = '';
  chrome.storage.local.set({ auraQuickNotes: '' });
});

document.getElementById('btn-send-dashboard').addEventListener('click', () => {
  const notes = notesEl.value;
  if (notes.trim()) {
    chrome.tabs.create({ url: DASHBOARD_URL + '/notes?quicknote=' + encodeURIComponent(notes) });
  } else {
    chrome.tabs.create({ url: DASHBOARD_URL + '/notes' });
  }
});

document.getElementById('btn-reset').addEventListener('click', () => {
  state = { ...defaults };
  save();
  render();
});
