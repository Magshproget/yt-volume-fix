// content.js: перехоплює гучність і динамічно застосовує степінь
(() => {
  'use strict';

  let exponent = 2.5;

  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'YT_VOLUME_SET_EXPONENT') {
      const val = parseFloat(event.data.exponent);
      if (!isNaN(val) && val > 0 && val !== exponent) {
        exponent = val;
        // Оновлюємо гучність поточного відео під новий степінь
        const video = document.querySelector('video');
        if (video) {
          const currentVirtualVolume = video.volume;
          video.volume = currentVirtualVolume;
        }
      }
    }
  });

  // Запитуємо збережений степінь у bridge.js
  window.postMessage({ type: 'YT_VOLUME_REQUEST_EXPONENT' }, '*');

  const nativeDesc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'volume');
  if (!nativeDesc || !nativeDesc.set || !nativeDesc.get) return;

  Object.defineProperty(HTMLMediaElement.prototype, 'volume', {
    get() {
      const actual = nativeDesc.get.call(this);
      return Math.min(1, Math.max(0, Math.pow(actual, 1 / exponent)));
    },
    set(val) {
      const clamped = Math.min(1, Math.max(0, Number(val) || 0));
      const adjusted = Math.pow(clamped, exponent);
      nativeDesc.set.call(this, adjusted);
    },
    configurable: true,
    enumerable: true
  });
})();
