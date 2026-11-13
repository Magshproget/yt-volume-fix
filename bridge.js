// bridge.js: передає налаштування зі сховища Chrome у головний світ сторінки
(() => {
  'use strict';

  function syncExponent(exponent) {
    window.postMessage({ type: 'YT_VOLUME_SET_EXPONENT', exponent }, '*');
  }

  // Отримуємо поточне збережене значення
  chrome.storage.sync.get({ exponent: 2.5 }, (items) => {
    syncExponent(items.exponent);
  });

  // Слухаємо оновлення в реальному часі (якщо користувач змінив налаштування)
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.exponent) {
      syncExponent(changes.exponent.newValue);
    }
  });

  // Відповідаємо на запит значення від content.js, якщо той завантажився раніше
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'YT_VOLUME_REQUEST_EXPONENT') {
      chrome.storage.sync.get({ exponent: 2.5 }, (items) => {
        syncExponent(items.exponent);
      });
    }
  });
})();
