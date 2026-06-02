const protocolData = [
  { name: 'HTTP', value: 74 },
  { name: 'DNS', value: 58 },
  { name: 'SSH', value: 40 },
  { name: 'ICMP', value: 28 }
];

const alerts = [
  'Внезапный рост количества SSH-подключений',
  'Обнаружена попытка сканирования портов',
  'Необычный трафик на 10.0.0.21',
];

const connections = [
  { src: '192.168.1.12', dst: '10.0.0.21', protocol: 'SSH', status: 'Подозрительно' },
  { src: '192.168.1.45', dst: '8.8.8.8', protocol: 'DNS', status: 'Норма' },
  { src: '172.16.0.10', dst: '104.21.3.148', protocol: 'HTTP', status: 'Норма' },
  { src: '10.1.1.5', dst: '10.0.0.5', protocol: 'ICMP', status: 'Подозрительно' },
];

function renderProtocolChart() {
  const chart = document.getElementById('protocolChart');
  protocolData.forEach(item => {
    const bar = document.createElement('span');
    bar.style.height = `${item.value}%`;
    bar.dataset.label = `${item.name} ${item.value}%`;
    chart.appendChild(bar);
  });
}

function renderAlerts() {
  const list = document.getElementById('alertList');
  alerts.forEach(text => {
    const li = document.createElement('li');
    li.textContent = text;
    list.appendChild(li);
  });
}

function renderConnections() {
  const tbody = document.getElementById('connectionTable');
  connections.forEach(conn => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${conn.src}</td>
      <td>${conn.dst}</td>
      <td>${conn.protocol}</td>
      <td>${conn.status}</td>
    `;
    tbody.appendChild(row);
  });
}

renderProtocolChart();
renderAlerts();
renderConnections();
