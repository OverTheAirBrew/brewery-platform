/* Shared appearance preference for all controller pages. */
(() => {
  'use strict';

  const storageKey = 'heater-controller-theme';

  const applyTheme = (mode) => {
    const isLightMode = mode === 'light';
    document.body.classList.toggle('light', isLightMode);
    localStorage.setItem(storageKey, isLightMode ? 'light' : 'dark');

    const button = document.getElementById('theme-toggle');
    if (!button) {
      return;
    }

    button.innerHTML = isLightMode
      ? '<span class="theme-icon" aria-hidden="true">☾</span>Dark mode'
      : '<span class="theme-icon" aria-hidden="true">☀</span>Light mode';
    button.setAttribute(
      'aria-label',
      isLightMode ? 'Switch to dark mode' : 'Switch to light mode',
    );
  };

  const savedTheme = localStorage.getItem(storageKey);
  applyTheme(savedTheme === 'light' ? 'light' : 'dark');

  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.onclick = () => {
      applyTheme(document.body.classList.contains('light') ? 'dark' : 'light');
    };
  }
})();
