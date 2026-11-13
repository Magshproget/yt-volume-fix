// bridge.js: передає налаштування зі сховища Chrome у головний світ сторінки
(() => {
  'use strict';

  const DEFAULTS = {
    exponent: 2.5,
    wheelSteps: 20,
    scrollWholePlayer: false
  };

  function syncSettings(settings) {
    window.postMessage({ type: 'YT_VOLUME_SET_SETTINGS', settings }, '*');
  }

  // Отримуємо збережені налаштування
  chrome.storage.sync.get(DEFAULTS, (items) => {
    syncSettings(items);
  });

  // Слухаємо оновлення в реальному часі
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync') {
      chrome.storage.sync.get(DEFAULTS, (items) => {
        syncSettings(items);
      });
    }
  });

  // Відповідаємо на запит від content.js
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'YT_VOLUME_REQUEST_SETTINGS') {
      chrome.storage.sync.get(DEFAULTS, (items) => {
        syncSettings(items);
      });
    }
  });
})();
