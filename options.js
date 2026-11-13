// options.js: збереження налаштувань степеня та кроків колеса
const expSlider = document.getElementById('expSlider');
const expValue = document.getElementById('expValue');

const stepsSlider = document.getElementById('stepsSlider');
const stepsValue = document.getElementById('stepsValue');

const wholePlayerCheckbox = document.getElementById('wholePlayerCheckbox');
const statusMsg = document.getElementById('statusMsg');

let saveTimeout = null;

function showSaved() {
  statusMsg.classList.add('visible');
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    statusMsg.classList.remove('visible');
  }, 1200);
}

function formatStepsBadge(steps) {
  const percent = (100 / steps).toFixed(0);
  return `${steps} (${percent}%)`;
}

function saveSettings() {
  const settings = {
    exponent: parseFloat(expSlider.value),
    wheelSteps: parseInt(stepsSlider.value, 10),
    scrollWholePlayer: wholePlayerCheckbox.checked
  };

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.set(settings, () => {
      showSaved();
    });
  } else {
    showSaved();
  }
}

// Завантаження збережених значень
if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
  chrome.storage.sync.get({
    exponent: 2.5,
    wheelSteps: 20,
    scrollWholePlayer: false
  }, (items) => {
    expSlider.value = items.exponent.toFixed(1);
    expValue.textContent = items.exponent.toFixed(1);

    stepsSlider.value = items.wheelSteps;
    stepsValue.textContent = formatStepsBadge(items.wheelSteps);

    wholePlayerCheckbox.checked = items.scrollWholePlayer;
  });
} else {
  // Fallback для локального перегляду
  expSlider.value = (2.5).toFixed(1);
  expValue.textContent = (2.5).toFixed(1);
  stepsSlider.value = 20;
  stepsValue.textContent = formatStepsBadge(20);
}

// Слухачі змін повзунків
expSlider.addEventListener('input', (e) => {
  expValue.textContent = parseFloat(e.target.value).toFixed(1);
  saveSettings();
});

stepsSlider.addEventListener('input', (e) => {
  const steps = parseInt(e.target.value, 10);
  stepsValue.textContent = formatStepsBadge(steps);
  saveSettings();
});

wholePlayerCheckbox.addEventListener('change', () => {
  saveSettings();
});

// Кнопки-пресети
document.querySelectorAll('button.preset').forEach((btn) => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.type;
    const val = btn.dataset.val;

    if (type === 'exp') {
      expSlider.value = parseFloat(val).toFixed(1);
      expValue.textContent = parseFloat(val).toFixed(1);
    } else if (type === 'steps') {
      const steps = parseInt(val, 10);
      stepsSlider.value = steps;
      stepsValue.textContent = formatStepsBadge(steps);
    }
    saveSettings();
  });
});
