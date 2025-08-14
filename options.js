const models = [
  'gpt-4o-mini',
  'gpt-4o',
  'gpt-3.5-turbo'
];

function restoreOptions() {
  chrome.storage.sync.get(['apiKey', 'defaultModel'], (data) => {
    document.getElementById('apiKey').value = data.apiKey || '';
    const select = document.getElementById('defaultModel');
    models.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = m;
      select.appendChild(opt);
    });
    select.value = data.defaultModel || 'gpt-4o-mini';
  });
}

document.getElementById('save').addEventListener('click', () => {
  const apiKey = document.getElementById('apiKey').value.trim();
  const defaultModel = document.getElementById('defaultModel').value;
  chrome.storage.sync.set({ apiKey, defaultModel }, () => {
    const status = document.getElementById('status');
    status.textContent = 'Saved.';
    setTimeout(() => status.textContent = '', 1000);
  });
});

document.addEventListener('DOMContentLoaded', restoreOptions);
