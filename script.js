const form = document.getElementById('urlForm');
const urlInput = document.getElementById('urlInput');
const urlResult = document.getElementById('urlResult');
const statusText = document.getElementById('statusText');
const previewFrame = document.getElementById('previewFrame');

form.addEventListener('submit', event => {
  event.preventDefault();
  const rawUrl = urlInput.value.trim();
  if (!rawUrl) {
    statusText.textContent = 'Введите корректную ссылку.';
    return;
  }

  const url = normalizeUrl(rawUrl);
  if (!url) {
    statusText.textContent = 'Неверный формат ссылки. Используй https://example.com.';
    return;
  }

  urlResult.innerHTML = `<p>Введённая ссылка: <a href="${url}" target="_blank" rel="noreferrer">${url}</a></p>`;
  statusText.textContent = 'Ссылка принята. Если сайт не отображается, он может блокировать загрузку в iframe.';
  previewFrame.innerHTML = `<iframe src="${url}" title="Превью ссылки"></iframe>`;
});

function normalizeUrl(value) {
  try {
    return new URL(value).href;
  } catch (error) {
    if (!/^https?:\/\//i.test(value)) {
      try {
        return new URL(`https://${value}`).href;
      } catch {
        return null;
      }
    }
    return null;
  }
}
