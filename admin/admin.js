const DATA_URL = "/api/materials";

const tableBody = document.querySelector("#materialsTableBody");
const saveStatus = document.querySelector("#saveStatus");
const saveBtn = document.querySelector("#saveBtn");
const reloadBtn = document.querySelector("#reloadBtn");
const addRowBtn = document.querySelector("#addRowBtn");
const lastUpdateInput = document.querySelector("#lastUpdate");
const adminStatus = document.querySelector("#adminStatus");

// Palīgfunkcijas statusam
function statusCodeFromAvailability(av) {
  const a = (av || "").toLowerCase();
  if (a === "nav pieejams") return "oos";
  if (a.includes("neliels")) return "low";
  return "available";
}

function availabilityFromStatusCode(code) {
  const c = (code || "").toLowerCase();
  if (c === "oos") return "nav pieejams";
  if (c === "low") return "neliels daudzums";
  return "pieejams";
}

// Palīgfunkcija mērvienībai
function unitShortFromFull(unit) {
  const u = (unit || "").toLowerCase();
  if (u.includes("t")) return "t";
  return "m3";
}

function unitFullFromShort(short) {
  return short === "t" ? "€/t" : "€/m3";
}

// ===== IELĀDE NO SERVERA =====
async function loadMaterials() {
  try {
    saveStatus.textContent = "Ielādēju datus...";
    saveStatus.style.color = "black";
    if (adminStatus) {
      adminStatus.textContent = "Ielādēju datus no servera...";
    }

    const res = await fetch(DATA_URL);
    const data = await res.json();

    // Datums augšā
    if (lastUpdateInput) {
      lastUpdateInput.value = data.lastUpdate || "";
    }

    tableBody.innerHTML = "";

    (data.materials || []).forEach(material => addMaterialRow(material));

    saveStatus.textContent = "Dati ielādēti no servera.";
    saveStatus.style.color = "green";
    if (adminStatus) {
      adminStatus.textContent = "Dati ielādēti no materials.json.";
    }
  } catch (e) {
    console.error(e);
    saveStatus.textContent = "Kļūda, ielādējot datus.";
    saveStatus.style.color = "red";
    if (adminStatus) {
      adminStatus.textContent = "Kļūda, ielādējot materials.json.";
    }
  }
}

// ===== RINDAS UZBŪVE =====
function addMaterialRow(material) {
  const row = document.createElement("tr");
  row.classList.add("material-row");
  row.dataset.id = material.id || "";

  const unitShort = unitShortFromFull(material.unit);
  const statusCode = statusCodeFromAvailability(material.availability);

  row.innerHTML = `
    <td><input type="text" class="name" value="${material.name || ""}"></td>
    <td><input type="number" step="0.1" class="price" value="${material.price != null ? material.price : ""}"></td>
    <td>
      <select class="unit">
        <option value="m3" ${unitShort === "m3" ? "selected" : ""}>€/m3</option>
        <option value="t" ${unitShort === "t" ? "selected" : ""}>€/t</option>
      </select>
    </td>
    <td>
      <select class="status">
        <option value="available" ${statusCode === "available" ? "selected" : ""}>pieejams</option>
        <option value="oos" ${statusCode === "oos" ? "selected" : ""}>nav pieejams</option>
        <option value="low" ${statusCode === "low" ? "selected" : ""}>neliels daudzums</option>
      </select>
    </td>
    <td><textarea class="notes">${material.notes || ""}</textarea></td>
    <td><input type="text" class="id" value="${material.id || ""}"></td>
  `;

  tableBody.appendChild(row);
}

// ===== SAGLABĀŠANA (PUT /api/materials) =====
async function saveChanges() {
  saveStatus.textContent = "Saglabāju...";
  saveStatus.style.color = "black";

  const rows = document.querySelectorAll(".material-row");
  const materials = [];

  rows.forEach(row => {
    const id = row.querySelector(".id").value.trim();
    const name = row.querySelector(".name").value.trim();
    const price = parseFloat(
      (row.querySelector(".price").value || "").replace(",", ".")
    ) || 0;
    const unitShort = row.querySelector(".unit").value;
    const statusCode = row.querySelector(".status").value;
    const notes = row.querySelector(".notes").value.trim();

    materials.push({
      id,
      name,
      price,
      unit: unitFullFromShort(unitShort),
      availability: availabilityFromStatusCode(statusCode),
      notes
    });
  });

  // Datums no augšējā lauka (ja tukšs – ģenerējam jaunu)
  let lastUpdate = lastUpdateInput ? lastUpdateInput.value.trim() : "";
  if (!lastUpdate) {
    const now = new Date();
    const pad = n => (n < 10 ? "0" + n : n);
    lastUpdate =
      now.getFullYear() +
      "-" +
      pad(now.getMonth() + 1) +
      "-" +
      pad(now.getDate()) +
      " " +
      pad(now.getHours()) +
      ":" +
      pad(now.getMinutes());
    if (lastUpdateInput) lastUpdateInput.value = lastUpdate;
  }

  try {
    const res = await fetch(DATA_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lastUpdate, materials })
    });

    if (res.ok) {
      saveStatus.textContent = "Izmaiņas saglabātas.";
      saveStatus.style.color = "green";
      if (adminStatus) {
        adminStatus.textContent = "Izmaiņas saglabātas materials.json.";
      }
    } else {
      saveStatus.textContent = "Kļūda saglabājot datus.";
      saveStatus.style.color = "red";
    }
  } catch (e) {
    console.error(e);
    saveStatus.textContent = "Kļūda saglabājot datus.";
    saveStatus.style.color = "red";
  }
}

// ===== JAUNA RINDA =====
function addEmptyRow() {
  const newMaterial = {
    id: "new-" + Math.random().toString(36).slice(2, 8),
    name: "",
    price: 0,
    unit: "€/m3",
    availability: "pieejams",
    notes: ""
  };
  addMaterialRow(newMaterial);
  saveStatus.textContent = "Jauna rinda pievienota (neaizmirsti saglabāt).";
  saveStatus.style.color = "black";
}

// ===== EVENT LISTENERI =====
if (saveBtn) saveBtn.addEventListener("click", saveChanges);
if (reloadBtn) reloadBtn.addEventListener("click", loadMaterials);
if (addRowBtn) addRowBtn.addEventListener("click", addEmptyRow);

// startā ielādējam datus
loadMaterials();
