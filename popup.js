const models = [
  'gpt-4o-mini',
  'gpt-4o',
  'gpt-3.5-turbo'
];

function loadOptions() {
  chrome.storage.sync.get(['defaultModel'], (data) => {
    const modelSelect = document.getElementById('model');
    models.forEach(m => {
      const option = document.createElement('option');
      option.value = m;
      option.textContent = m;
      modelSelect.appendChild(option);
    });
    modelSelect.value = data.defaultModel || 'gpt-4o-mini';
  });
}

document.getElementById('translate').addEventListener('click', async () => {
  const model = document.getElementById('model').value;
  const targetLang = navigator.language || 'en';
  const status = document.getElementById('status');
  status.textContent = 'Collecting text...';

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { type: 'collectText' }, async (response) => {
    if (!response || !response.texts.length) {
      status.textContent = 'No text found.';
      return;
    }
    const texts = response.texts;
    chrome.storage.sync.get(['apiKey'], async ({ apiKey }) => {
      if (!apiKey) {
        status.textContent = 'Set API key in options.';
        return;
      }
      status.textContent = 'Translating...';
      const delimiter = '\n###\n';
      const joined = texts.join(delimiter);
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: `You are a translation engine.` },
              { role: 'user', content: `Translate the following text to ${targetLang}. Each segment is separated by ${delimiter.trim()}. Return only the translated segments separated by ${delimiter.trim()}.` },
              { role: 'user', content: joined }
            ]
          })
        });
        const data = await res.json();
        const content = data.choices[0].message.content;
        const translations = content.split(delimiter);
        chrome.tabs.sendMessage(tab.id, { type: 'applyTranslations', translations });
        status.textContent = 'Done';
      } catch (e) {
        console.error(e);
        status.textContent = 'Error translating.';
      }
    });
  });
});

document.addEventListener('DOMContentLoaded', loadOptions);
