// options.js: зберігання налаштувань
const slider = document.getElementById('expSlider');
const valueDisplay = document.getElementById('expValue');
const statusMsg = document.getElementById('statusMsg');
let saveTimeout = null;

function showSaved() {
  statusMsg.classList.add('visible');
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    statusMsg.classList.remove('visible');
  }, 1200);
}

function update(val, save = true) {
  const num = parseFloat(val);
  slider.value = num.toFixed(1);
  valueDisplay.textContent = num.toFixed(1);

  if (save) {
    chrome.storage.sync.set({ exponent: num }, () => {
      showSaved();
    });
  }
}

// Завантаження збереженого значення
chrome.storage.sync.get({ exponent: 2.5 }, (items) => {
  update(items.exponent, false);
});

slider.addEventListener('input', (e) => {
  update(e.target.value, true);
});

document.querySelectorAll('button.preset').forEach((btn) => {
  btn.addEventListener('click', () => {
    update(btn.dataset.val, true);
  });
});
