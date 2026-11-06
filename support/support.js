/* Optional enhancements only. Navigation, FAQs and email links work without JS. */
(() => {
  'use strict';
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  const button = document.getElementById('copy-email');
  const status = document.getElementById('copy-status');
  if (!button || !status) return;
  button.hidden = false;
  button.addEventListener('click', async () => {
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText('arttica.is@gmail.com');
      status.textContent = 'Email address copied.';
    } catch (_) {
      status.textContent = 'Please select and copy the email address above, or open your email app.';
    }
  });
})();
