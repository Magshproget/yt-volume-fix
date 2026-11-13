// ==UserScript==
// @name         YouTube Volume Fix
// @namespace    https://github.com/Magshproget/yt-volume-fix
// @version      1.3.1
// @description  Perceptual volume curve and customizable mouse wheel step size for YouTube
// @author       Magshproget
// @match        *://*.youtube.com/*
// @match        *://music.youtube.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        unsafeWindow
// @run-at       document-start
// @updateURL    https://raw.githubusercontent.com/Magshproget/yt-volume-fix/main/yt-volume-fix.user.js
// @downloadURL  https://raw.githubusercontent.com/Magshproget/yt-volume-fix/main/yt-volume-fix.user.js
// ==/UserScript==

(() => {
  'use strict';

  // Отримуємо доступ до контексту сторінки YouTube
  const pageWindow = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

  // Зчитування збережених параметрів
  let exponent = GM_getValue('exponent', 2.5);
  let wheelSteps = GM_getValue('wheelSteps', 20);

  function registerMenu() {
    GM_registerMenuCommand(`Крива гучності (степінь): ${exponent}`, () => {
      const input = prompt('Введіть степінь кривої (1.0 - 4.0, за замовчуванням 2.5):', exponent);
      if (input !== null) {
        const val = parseFloat(input);
        if (!isNaN(val) && val >= 1.0 && val <= 5.0) {
          exponent = val;
          GM_setValue('exponent', exponent);
          const video = pageWindow.document.querySelector('video');
          if (video) video.volume = video.volume;
          alert(`Збережено! Новий степінь: ${exponent}`);
        } else {
          alert('Некоректне значення. Введіть число від 1.0 до 5.0');
        }
      }
    });

    GM_registerMenuCommand(`Кроки колеса мишки: ${wheelSteps} (${Math.round(100 / wheelSteps)}%)`, () => {
      const input = prompt('Кількість кроків від 0% до 100% при прокрутці (наприклад: 20 = 5% за крок):', wheelSteps);
      if (input !== null) {
        const val = parseInt(input, 10);
        if (!isNaN(val) && val >= 5 && val <= 100) {
          wheelSteps = val;
          GM_setValue('wheelSteps', wheelSteps);
          alert(`Збережено! Нова кількість кроків: ${wheelSteps} (${Math.round(100 / wheelSteps)}% за крок)`);
        } else {
          alert('Некоректне значення. Введіть ціле число від 5 до 100');
        }
      }
    });

    GM_registerMenuCommand('Скинути налаштування до стандартних', () => {
      exponent = 2.5;
      wheelSteps = 20;
      GM_setValue('exponent', 2.5);
      GM_setValue('wheelSteps', 20);
      alert('Налаштування скинуто до дефолтних (степінь 2.5, 20 кроків)');
    });
  }

  try {
    registerMenu();
  } catch (e) {
    console.error('Menu registration failed', e);
  }

  // 1. Корекція кривої сприйняття звуку через реальний прототип сторінки
  const MediaElem = pageWindow.HTMLMediaElement;
  if (!MediaElem) return;

  const nativeDesc = Object.getOwnPropertyDescriptor(MediaElem.prototype, 'volume');
  if (nativeDesc && nativeDesc.set && nativeDesc.get) {
    Object.defineProperty(MediaElem.prototype, 'volume', {
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

  pageWindow.addEventListener('wheel', (e) => {
    const target = e.target;
    const isVolumeArea = Boolean(target && target.closest && target.closest('.ytp-volume-area, .ytp-volume-panel'));
    if (!isVolumeArea) return;

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
    const doc = pageWindow.document;
    const player = doc.getElementById('movie_player') || doc.querySelector('.html5-video-player');
    const video = doc.querySelector('video');

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
