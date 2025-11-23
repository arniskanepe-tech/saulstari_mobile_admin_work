// admin.js
const STATUS_OPTIONS = ['pieejams', 'neliels daudzums', 'nav pieejams'];
const UNIT_OPTIONS = ['€/m3', '€/t'];

const lastUpdatedInput = document.querySelector('#globalUpdatedAt');
const materialsBody = document.querySelector('#materialsBody');
const saveBtn = document.querySelector('#saveBtn');
const reloadBtn = document.querySelector('#reloadBtn');
const addBtn = document.querySelector('#addMaterialBtn');
const statusText = document.querySelector('#loadStatus');

let materialsData = {
  lastUpdated: '',
  materials: []
};

initAdmin();

function initAdmin() {
  if (reloadBtn) reloadBtn.addEventListener('click', loadFromServer);
  if (saveBtn) saveBtn.addEventListener('click', handleSave);
  if (addBtn) addBtn.addEventListener('click', handleAddMaterial);

  // dzēšanu klausāmies uz visas tabulas (event delegation)
  if (materialsBody) {
    materialsBody.addEventListener('click', (e) => {
      const btn = e.target.closest('.delete-material-btn');
      if (!btn) return;
      const row = btn.closest('tr');
      const index = Number(row.dataset.index);
      if (Number.isNaN(index)) return;

      if (confirm('Vai tiešām dzēst šo materiālu?')) {
        materialsData.materials.splice(index, 1);
        renderTable();
        showStatus('Materiāls izdzēsts (jālejupielādē materials.json, lai saglabātos).', 'info');
      }
    });
  }

  loadFromServer();
}

function loadFromServer() {
  fetch('data/materials.json?_=' + Date.now())
    .then(r => r.json())
    .then(data => {
      materialsData.lastUpdated = data.lastUpdated || '';
      materialsData.materials = data.materials || data.items || [];

      if (lastUpdatedInput) {
        lastUpdatedInput.value = materialsData.lastUpdated || '';
      }

      renderTable();
      showStatus('Dati ielādēti no servera.', 'ok');
    })
    .catch(err => {
      console.error('Neizdevās ielādēt materials.json', err);
      showStatus('Kļūda ielādējot materials.json', 'error');
    });
}

function renderTable() {
  if (!materialsBody) return;
  materialsBody.innerHTML = '';

  materialsData.materials.forEach((mat, index) => {
    const tr = document.createElement('tr');
    tr.dataset.index = index;

    // Nosaukums
    const nameTd = document.createElement('td');
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = mat.name || '';
    nameInput.className = 'admin-input';
    nameTd.appendChild(nameInput);
    tr.appendChild(nameTd);

    // Cena
    const priceTd = document.createElement('td');
    const priceInput = document.createElement('input');
    priceInput.type = 'number';
    priceInput.step = '0.1';
    priceInput.min = '0';
    priceInput.value =
      mat.price !== undefined && mat.price !== null ? String(mat.price) : '';
    priceInput.className = 'admin-input';
    priceTd.appendChild(priceInput);
    tr.appendChild(priceTd);

    // Mērvienība
    const unitTd = document.createElement('td');
    const unitSelect = document.createElement('select');
    unitSelect.className = 'admin-select';
    UNIT_OPTIONS.forEach(u => {
      const opt = document.createElement('option');
      opt.value = u;
      opt.textContent = u;
      if (mat.unit === u) opt.selected = true;
      unitSelect.appendChild(opt);
    });
    unitTd.appendChild(unitSelect);
    tr.appendChild(unitTd);

    // Statuss
    const statusTd = document.createElement('td');
    const statusSelect = document.createElement('select');
    statusSelect.className = 'admin-select';
    STATUS_OPTIONS.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = s;
      if (mat.status === s) opt.selected = true;
      statusSelect.appendChild(opt);
    });
    statusTd.appendChild(statusSelect);
    tr.appendChild(statusTd);

    // Piezīmes
    const notesTd = document.createElement('td');
    const notesArea = document.createElement('textarea');
    notesArea.className = 'admin-textarea';
    notesArea.rows = 1;
    notesArea.value = mat.notes || '';
    notesTd.appendChild(notesArea);
    tr.appendChild(notesTd);

    // ID (read-only)
    const idTd = document.createElement('td');
    const idSpan = document.createElement('span');
    idSpan.className = 'admin-id-pill';
    idSpan.textContent = mat.id || generateIdFromName(mat.name, index);
    idTd.appendChild(idSpan);
    tr.appendChild(idTd);

    // Dzēst poga
    const deleteTd = document.createElement('td');
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn btn-danger delete-material-btn';
    deleteBtn.textContent = 'Dzēst';
    deleteTd.appendChild(deleteBtn);
    tr.appendChild(deleteTd);

    materialsBody.appendChild(tr);
  });
}

function handleAddMaterial() {
  materialsData.materials.push({
    name: 'Jauns materiāls',
    price: '',
    unit: '€/m3',
    status: 'pieejams',
    notes: '',
    id: 'material-' + (materialsData.materials.length + 1)
  });
  renderTable();
  showStatus('Pievienots jauns materiāls (neaizmirsti lejupielādēt materials.json).', 'info');
}

function handleSave() {
  // nolasa vērtības no tabulas atpakaļ materialsData
  const rows = materialsBody ? Array.from(materialsBody.querySelectorAll('tr')) : [];

  materialsData.materials = rows.map((row, index) => {
    const [nameTd, priceTd, unitTd, statusTd, notesTd, idTd] =
      Array.from(row.children);

    const name = nameTd.querySelector('input').value.trim();
    const priceStr = priceTd.querySelector('input').value.trim();
    const unit = unitTd.querySelector('select').value;
    const status = statusTd.querySelector('select').value;
    const notes = notesTd.querySelector('textarea').value.trim();
    const id = idTd.querySelector('.admin-id-pill').textContent.trim() ||
      generateIdFromName(name, index);

    const price = priceStr === '' ? '' : Number(priceStr);

    return { id, name, price, unit, status, notes };
  });

  if (lastUpdatedInput) {
    materialsData.lastUpdated = lastUpdatedInput.value.trim();
  }

  const jsonStr = JSON.stringify(materialsData, null, 2);
  downloadFile('materials.json', jsonStr);
  showStatus('Izmaiņas saglabātas. Lejupielādēts materials.json.', 'ok');
}

function downloadFile(filename, content) {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function generateIdFromName(name, index) {
  if (!name) return 'material-' + (index + 1);
  return name
    .toLowerCase()
    .replace(/[\/\s]+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/\-+/g, '-')
    .replace(/^\-+|\-+$/g, '') || 'material-' + (index + 1);
}

function showStatus(msg, mode) {
  if (!statusText) return;
  statusText.textContent = msg;
  statusText.classList.remove('status-ok', 'status-error', 'status-info');

  if (mode === 'ok') statusText.classList.add('status-ok');
  else if (mode === 'error') statusText.classList.add('status-error');
  else statusText.classList.add('status-info');
}
