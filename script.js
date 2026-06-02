const form = document.getElementById('urlForm');
const urlInput = document.getElementById('urlInput');
const urlResult = document.getElementById('urlResult');
const statusText = document.getElementById('statusText');
const previewFrame = document.getElementById('previewFrame');
const activityResult = document.getElementById('activityResult');

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
  statusText.textContent = 'Анализ сайта запущен...';
  previewFrame.innerHTML = `<iframe src="${url}" title="Превью ссылки"></iframe>`;
  analyzeUrl(url);
});

async function analyzeUrl(url) {
  const analysisResult = document.getElementById('analysisResult');
  analysisResult.innerHTML = '<p>Выполняется анализ…</p>';

  const start = performance.now();
  try {
    const response = await fetch(url, { cache: 'no-store' });
    const elapsed = Math.round(performance.now() - start);
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');

    const title = doc.querySelector('title')?.textContent?.trim() || 'Не найдено';
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || 'Не указано';
    const links = Array.from(doc.querySelectorAll('a[href]'));
    const base = new URL(url);
    const internal = links.filter(link => {
      try {
        const href = new URL(link.getAttribute('href'), base);
        return href.origin === base.origin;
      } catch {
        return false;
      }
    }).length;
    const external = links.length - internal;
    const scripts = doc.querySelectorAll('script').length;
    const images = doc.querySelectorAll('img').length;
    const stylesheets = Array.from(doc.querySelectorAll('link[rel="stylesheet"]')).length;
    const pageSize = new TextEncoder().encode(text).length;
    const https = url.startsWith('https://');
    const activityScore = calculateActivityScore({ links, scripts, images, stylesheets, elapsed, https });
    const activityLabel = activityScore >= 75 ? 'Высокая' : activityScore >= 45 ? 'Средняя' : 'Низкая';

    statusText.textContent = `Анализ завершён за ${elapsed} мс. Статус HTTP ${response.status}.`;
    analysisResult.innerHTML = `
      <dl>
        <div><dt>Статус HTTP</dt><dd>${response.status} ${response.statusText}</dd></div>
        <div><dt>Заголовок страницы</dt><dd>${escapeHtml(title)}</dd></div>
        <div><dt>Описание</dt><dd>${escapeHtml(description)}</dd></div>
        <div><dt>HTTPS</dt><dd>${https ? 'Да' : 'Нет'}</dd></div>
        <div><dt>Размер HTML</dt><dd>${pageSize.toLocaleString()} байт</dd></div>
        <div><dt>Ссылок на странице</dt><dd>${links.length} (внутренних ${internal}, внешних ${external})</dd></div>
        <div><dt>Скриптов</dt><dd>${scripts}</dd></div>
        <div><dt>Изображений</dt><dd>${images}</dd></div>
        <div><dt>CSS-файлов</dt><dd>${stylesheets}</dd></div>
        <div><dt>Время ответа</dt><dd>${elapsed} мс</dd></div>
      </dl>
    `;

    activityResult.innerHTML = `
      <dl>
        <div><dt>Уровень активности</dt><dd>${activityLabel}</dd></div>
        <div><dt>Баллы активности</dt><dd>${activityScore} / 100</dd></div>
        <div><dt>Интерактивных ресурсов</dt><dd>${scripts + stylesheets} (${scripts} JS, ${stylesheets} CSS)</dd></div>
        <div><dt>Графических элементов</dt><dd>${images}</dd></div>
      </dl>
    `;
  } catch (error) {
    const message = error.message || 'Ошибка сети';
    statusText.textContent = `Не удалось проанализировать сайт: ${message}`;
    analysisResult.innerHTML = `<p>Анализ не выполнен. ${message}</p>`;
    activityResult.innerHTML = `<p>Активность не определена. Проверь URL и доступность сайта.</p>`;
  }
}

function calculateActivityScore({ links, scripts, images, stylesheets, elapsed, https }) {
  const linkScore = Math.min(links / 20, 1) * 30;
  const scriptScore = Math.min(scripts / 10, 1) * 25;
  const imageScore = Math.min(images / 20, 1) * 20;
  const cssScore = Math.min(stylesheets / 10, 1) * 15;
  const speedScore = Math.max(0, 20 - elapsed / 100) ;
  const httpsScore = https ? 10 : 0;
  return Math.round(Math.min(100, linkScore + scriptScore + imageScore + cssScore + speedScore + httpsScore));
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

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
