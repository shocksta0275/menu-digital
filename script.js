// ----------------------------
// CONFIGURACIÓN CSV
// ----------------------------
const sheetCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQLt9xWlULnMP50kZ3MniL6eVxfFayhDmvXQaBUhe_tvWuvcOrn5TLilupN3lvJaU0gXvg-EAt1sv4v/pub?output=csv";

// ----------------------------
// ELEMENTOS DOM
// ----------------------------
const listContainer = document.getElementById("list");
const dropdown = document.getElementById("categoria-dropdown");
const tabs = document.querySelectorAll(".tab");

// ----------------------------
// VERIFICACIÓN MÍNIMA
// ----------------------------
if (!listContainer) alert("No se encontró el contenedor #list en el DOM");
if (!dropdown) alert("No se encontró el dropdown #categoria-dropdown en el DOM");
if (!tabs.length) alert("No se encontraron tabs en el DOM");

// ----------------------------
// VARIABLES GLOBALES
// ----------------------------
let menuData = [];

// ----------------------------
// CARGAR CSV
// ----------------------------
async function loadCSV() {
  try {
    const response = await fetch(sheetCSV);
    const data = await response.text();

    const rows = data.split("\n").filter(r => r.trim() !== "");
    const headers = rows[0].split(",");

    menuData = rows.slice(1).map(row => {
      const cols = row.split(",");
      let item = {};
      headers.forEach((h, i) => {
        item[h.trim()] = (cols[i] || "").trim();
      });

      // Normalizamos campos
      item.categoria = (item.categoria || "").toLowerCase();
      item.subCategoria = (item.sub_categoria || "").toLowerCase();
      item.orden = parseInt(item.orden) || 999;
      item.imagen = item.imagen || "";
      return item;
    });

    buildDropdown();
    renderTab(getActiveTab());
  } catch (e) {
    listContainer.innerHTML = `<p>Error cargando CSV: ${e.message}</p>`;
  }
}

// ----------------------------
// TABS
// ----------------------------
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    dropdown.value = "";
    renderTab(tab.dataset.cat);
  });
});

function getActiveTab() {
  const active = document.querySelector(".tab.active");
  return active ? active.dataset.cat : tabs[0].dataset.cat;
}

// ----------------------------
// DROPDOWN
// ----------------------------
function buildDropdown() {
  dropdown.innerHTML = `<option value="">Todas las subcategorías</option>`;

  const subCategorias = [...new Set(menuData.map(i => i.subCategoria).filter(Boolean))];
  subCategorias.forEach(sub => {
    const opt = document.createElement("option");
    opt.value = sub;
    opt.textContent = capitalize(sub);
    dropdown.appendChild(opt);
  });

  dropdown.addEventListener("change", () => {
    const val = dropdown.value;
    if (!val) {
      renderTab(getActiveTab());
    } else {
      // Cambiar al tab correspondiente si la subcategoria está en otro tab
      const item = menuData.find(i => i.subCategoria === val);
      if (item && item.categoria !== getActiveTab()) {
        tabs.forEach(t => t.classList.remove("active"));
        const newTab = [...tabs].find(t => t.dataset.cat === item.categoria);
        if (newTab) newTab.classList.add("active");
      }
      renderSubCategoria(val);
    }
  });
}

// ----------------------------
// RENDER
// ----------------------------
function renderTab(categoria) {
  const filtered = menuData
    .filter(i => i.categoria === categoria)
    .sort((a, b) => a.orden - b.orden);

  listContainer.innerHTML = filtered.length
    ? filtered.map(renderItem).join("")
    : "<p>No hay items en esta categoría.</p>";
}

function renderSubCategoria(subCategoria) {
  const filtered = menuData
    .filter(i => i.subCategoria === subCategoria)
    .sort((a, b) => a.orden - b.orden);

  listContainer.innerHTML = filtered.length
    ? filtered.map(renderItem).join("")
    : "<p>No hay items en esta subcategoría.</p>";
}

// ----------------------------
// RENDER ITEM
// ----------------------------
function renderItem(item) {
  const mostrarImagen = item.imagen.trim() !== "";

  if (mostrarImagen) {
    return `
      <div class="item-con-imagen">
        <img src="${item.imagen}" alt="${item.nombre}" onclick="abrirLightbox('${item.imagen}')">
        <div class="info">
          <h3>${item.nombre}</h3>
          <p>${item.precio}${item.precio_2 ? ' | ' + item.precio_2 : ''}</p>
          ${item.nota ? `<small>${item.nota}</small>` : ''}
          ${item.ingredientes ? `<p>${item.ingredientes}</p>` : ''}
          ${item.do ? `<p><i>D.O.: ${item.do}</i></p>` : ''}
          ${item.uva ? `<p><i>Uva: ${item.uva}</i></p>` : ''}
          ${item.crianza ? `<p><i>Crianza: ${item.crianza}</i></p>` : ''}
          ${item.maridaje ? `<p><i>Maridaje: ${item.maridaje}</i></p>` : ''}
        </div>
      </div>
    `;
  } else {
    return `
      <div class="item-sin-imagen">
        <h3>${item.nombre}</h3>
        <p>${item.precio}${item.precio_2 ? ' | ' + item.precio_2 : ''}</p>
        ${item.nota ? `<small>${item.nota}</small>` : ''}
      </div>
    `;
  }
}

// ----------------------------
// LIGHTBOX
// ----------------------------
function abrirLightbox(src) {
  const lb = document.createElement("div");
  lb.className = "lightbox";
  lb.innerHTML = `<img src="${src}" alt="Imagen del producto">`;
  lb.addEventListener("click", () => lb.remove());
  document.body.appendChild(lb);
}

// ----------------------------
// HELPERS
// ----------------------------
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ----------------------------
// INIT
// ----------------------------
loadCSV();
