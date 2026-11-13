// content.js: перехоплює гучність, застосовує степеневу криву та кастомний крок колеса мишки
(() => {
  'use strict';

  let exponent = 2.5;
  let wheelSteps = 20;
  let scrollWholePlayer = false;

  // Оновлення параметрів при зміні налаштувань
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'YT_VOLUME_SET_SETTINGS') {
      const s = event.data.settings || {};
      if (typeof s.exponent === 'number' && s.exponent > 0) {
        exponent = s.exponent;
        const video = document.querySelector('video');
        if (video) {
          video.volume = video.volume;
        }
      }
      if (typeof s.wheelSteps === 'number' && s.wheelSteps > 0) {
        wheelSteps = s.wheelSteps;
      }
      if (typeof s.scrollWholePlayer === 'boolean') {
        scrollWholePlayer = s.scrollWholePlayer;
      }
    }
  });

  // Запитуємо збережені налаштування
  window.postMessage({ type: 'YT_VOLUME_REQUEST_SETTINGS' }, '*');

  // 1. Корекція кривої сприйняття звуку (логарифмічна/степенева)
  const nativeDesc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'volume');
  if (nativeDesc && nativeDesc.set && nativeDesc.get) {
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
  }

  // 2. Кастомний крок прокрутки колеса мишки
  let wheelAccumulator = 0;
  let resetTimer = null;
  const WHEEL_THRESHOLD = 50;

  window.addEventListener('wheel', (e) => {
    const isVolumeArea = Boolean(e.target && e.target.closest && e.target.closest('.ytp-volume-area, .ytp-volume-panel'));
    const isPlayer = Boolean(scrollWholePlayer && e.target && e.target.closest && e.target.closest('#movie_player, .html5-video-player'));

    if (!isVolumeArea && !isPlayer) return;

    // Перехоплюємо подію, щоб YouTube не застосовував свій дефолтний крок
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    wheelAccumulator += e.deltaY;
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => { wheelAccumulator = 0; }, 200);

    if (Math.abs(wheelAccumulator) < WHEEL_THRESHOLD) return;

    const dir = wheelAccumulator < 0 ? 1 : -1;
    wheelAccumulator = 0;

    const step = 100 / Math.max(1, wheelSteps);
    const player = document.getElementById('movie_player') || document.querySelector('.html5-video-player');
    const video = document.querySelector('video');

    let current = 100;
    if (player && typeof player.getVolume === 'function') {
      current = player.getVolume();
    } else if (video) {
      current = video.volume * 100;
    }

    let next = current + dir * step;
    next = Math.min(100, Math.max(0, Math.round(next)));

    if (player && typeof player.setVolume === 'function') {
      if (dir > 0 && typeof player.isMuted === 'function' && player.isMuted()) {
        player.unMute();
      }
      player.setVolume(next);
    } else if (video) {
      if (dir > 0 && video.muted) {
        video.muted = false;
      }
      video.volume = next / 100;
    }
  }, { capture: true, passive: false });
})();
