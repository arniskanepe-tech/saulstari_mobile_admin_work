// admin/admin.js
const DATA_URL = '/api/materials';

function statusLabel(av) {
  if (!av) return '';
  const val = av.toLowerCase();
  if (val === 'pieejams') return 'available';
  if (val === 'nav pieejams') return 'oos';
  if (val.includes('neliels')) return 'low';
  return 'other';
}

function statusTextFromLabel(label) {
  if (!label) return '';
  const v = label.toLowerCase();
  if (v === 'available') return 'pieejams';
  if (v === 'oos') return 'nav pieejams';
  if (v === 'low') return 'neliels daudzums';
  return label;
}

function statusClass(label) {
  if (!label) return '';
  const v = label.toLowerCase();
  if (v === 'available') return 'status-available';
  if (v === 'oos') return 'status-oos';
  if (v === 'low') return 'status-low';
  return '';
}

function renderTable(data) {
  const tbody = document.querySelector('#materialsTable tbody');
  const lastUpdateInput = document.getElementById('lastUpdate');
  const adminStatus = document.getElementById('adminStatus');

  if (!tbody) return;

  tbody.innerHTML = '';
  lastUpdateInput.value = data.lastUpdate || '';

  data.materials.forEach(mat => {
    const tr = document.createElement('tr');
    const statusLabelInitial = statusLabel(mat.availability);

    tr.innerHTML = `
      <td data-label="Nosaukums">
        <input type="text" class="js-name" value="${mat.name || ''}">
      </td>
      <td data-label="Cena">
        <input type="number" step="0.1" class="js-price" value="${mat.price != null ? mat.price : ''}">
      </td>
      <td data-label="Mērvienība">
        <input type="text" class="js-unit" value="${mat.unit || ''}">
      </td>
      <td data-label="Statuss">
        <select class="js-status">
          <option value="available">pieejams</option>
          <option value="oos">nav pieejams</option>
          <option value="low">neliels daudzums</option>
        </select>
        <div class="status-pill ${statusClass(statusLabelInitial)} js-status-pill">
          ${statusTextFromLabel(statusLabelInitial)}
        </div>
      </td>
      <td data-label="Piezīmes">
        <textarea class="js-notes">${mat.notes || ''}</textarea>
      </td>
      <td data-label="ID">
        <input type="text" class="js-id" value="${mat.id || ''}" readonly>
      </td>
    `;

    const selectEl = tr.querySelector('.js-status');
    const pillEl = tr.querySelector('.js-status-pill');

    // iestata sākotnējo select vērtību
    if (statusLabelInitial) {
      selectEl.value = statusLabelInitial;
    }

    selectEl.addEventListener('change', () => {
      const val = selectEl.value;
      pillEl.textContent = statusTextFromLabel(val);
      pillEl.className = 'status-pill ' + statusClass(val);
    });

    tbody.appendChild(tr);
  });

  if (adminStatus) {
    adminStatus.textContent = 'Dati ielādēti no materials.json.';
  }
}

function collectDataFromForm() {
  const tbody = document.querySelector('#materialsTable tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  const lastUpdate = document.getElementById('lastUpdate').value || '';

  const materials = rows.map(row => {
    return {
      id: row.querySelector('.js-id').value.trim(),
      name: row.querySelector('.js-name').value.trim(),
      price: parseFloat(row.querySelector('.js-price').value.replace(',', '.')) || 0,
      unit: row.querySelector('.js-unit').value.trim(),
      availability: statusTextFromLabel(row.querySelector('.js-status').value),
      notes: row.querySelector('.js-notes').value.trim()
    };
  });

  return { lastUpdate, materials };
}

function downloadJson(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'materials.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function loadData() {
  const adminStatus = document.getElementById('adminStatus');
  if (adminStatus) adminStatus.textContent = 'Ielādē datus...';

  fetch(DATA_URL)
    .then(r => r.json())
    .then(renderTable)
    .catch(err => {
      console.error('Neizdevās ielādēt materials.json', err);
      if (adminStatus) adminStatus.textContent = 'Kļūda, ielādējot materials.json.';
    });
}

document.addEventListener('DOMContentLoaded', () => {
  loadData();

  const dlBtn = document.getElementById('downloadJsonBtn');
  const reloadBtn = document.getElementById('reloadBtn');

  if (dlBtn) {
    dlBtn.addEventListener('click', () => {
      const data = collectDataFromForm();
      downloadJson(data);
    });
  }

  if (reloadBtn) {
    reloadBtn.addEventListener('click', () => {
      loadData();
    });
  }
});
