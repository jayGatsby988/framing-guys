chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'AURA_TTS') {
    chrome.tts.stop();
    chrome.tts.speak(message.text, {
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      enqueue: false,
    });
  }

  if (message.type === 'AURA_STOP_TTS') {
    chrome.tts.stop();
  }

  if (message.type === 'AURA_STATE_CHANGED') {
    chrome.runtime.sendMessage(message).catch(() => {});
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get('auraState', (result) => {
    if (!result.auraState) {
      chrome.storage.local.set({
        auraState: {
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
        }
      });
    }
  });
});
