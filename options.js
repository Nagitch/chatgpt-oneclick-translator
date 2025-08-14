const models = [
  'gpt-4o-mini',
  'gpt-4o',
  'gpt-3.5-turbo'
];

const restoreOptions = () => {
  chrome.storage.sync.get(['apiKey', 'defaultModel'], (data) => {
    document.querySelector('#apiKey').value = data.apiKey || '';
    const select = document.querySelector('#defaultModel');
    models.forEach((m) => {
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = m;
      select.appendChild(opt);
    });
    select.value = data.defaultModel || 'gpt-4o-mini';
  });
};

document.querySelector('#save').addEventListener('click', () => {
  const apiKey = document.querySelector('#apiKey').value.trim();
  const defaultModel = document.querySelector('#defaultModel').value;
  chrome.storage.sync.set({ apiKey, defaultModel }, () => {
    const status = document.querySelector('#status');
    status.textContent = 'Saved.';
    setTimeout(() => status.textContent = '', 1000);
  });
});

document.addEventListener('DOMContentLoaded', restoreOptions);
