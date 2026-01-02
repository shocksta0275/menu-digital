// ---------------------
// URL CSV publicado
const sheetCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQLt9xWlULnMP50kZ3MniL6eVxfFayhDmvXQaBUhe_tvWuvcOrn5TLilupN3lvJaU0gXvg-EAt1sv4v/pub?output=csv";

// Contenedor donde se renderizan los items
const listContainer = document.getElementById("list");

// Variables globales
let menuData = [];

// ---------------------
// Cargar CSV con PapaParse
function loadCSV() {
  Papa.parse(sheetCSV, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      menuData = results.data.map(item => {
        item.categoria = item.categoria?.toLowerCase().trim() || "";
        item.subCategoria = item.sub_categoria?.toLowerCase().trim() || "";
        item.orden = parseInt(item.orden) || 999;
        item.imagen = item.imagen?.trim() || "";
        item.precio = item.precio?.trim() || "";
        item.precio_2 = item.precio_2?.trim() || "";
        item.nota = item.nota?.trim() || "";
        item.ingredientes = item.ingredientes?.trim() || "";
        item.do = item.do?.trim() || "";
        item.uva = item.uva?.trim() || "";
        item.crianza = item.crianza?.trim() || "";
        item.maridaje = item.maridaje?.trim() || "";
        return item;
      });

      // Inicializar dropdown y tabs
      buildDropdown();
      initTabs();

      // Renderizar tab activo por defecto
      const activeTab = document.querySelector(".tab.active")?.dataset.cat || menuData[0]?.categoria;
      renderCategoria(activeTab);
    }
  });
}

// ---------------------
// Inicializar tabs
let tabs;
function initTabs() {
  tabs = document.querySelectorAll(".tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      // Remover active de todos
      tabs.forEach(t => t.classList.remove("active"));
      // Activar el clickeado
      tab.classList.add("active");

      // Renderizar categoría del tab
      const cat = tab.dataset.cat;
      renderCategoria(cat);

      // Reset dropdown
      const dropdown = document.getElementById("categoria-dropdown");
      if (dropdown) dropdown.value = "";
    });
  });
}

// ---------------------
// Construir dropdown colapsable
function buildDropdown() {
  const dropdown = document.getElementById("categoria-dropdown");
  dropdown.innerHTML = `<option value="">Todas las subcategorías</option>`;

  // Agrupar subcategorías por categoría y obtener orden mínimo
  const catMap = {};
  menuData.forEach(item => {
    const cat = item.categoria || "sin_categoria";
    const sub = item.subCategoria || "sin_subcategoria";

    if (!catMap[cat]) catMap[cat] = {};
    if (!catMap[cat][sub]) catMap[cat][sub] = item.orden;
    else catMap[cat][sub] = Math.min(catMap[cat][sub], item.orden);
  });

  // Construir optgroups
  Object.keys(catMap).forEach(cat => {
    const optGroup = document.createElement("optgroup");
    optGroup.label = capitalize(cat);

    // Ordenar subcategorías por orden mínimo
    const subOrdenadas = Object.keys(catMap[cat]).sort((a, b) => catMap[cat][a] - catMap[cat][b]);
    subOrdenadas.forEach(sub => {
      const opt = document.createElement("option");
      opt.value = sub;
      opt.textContent = capitalize(sub);
      optGroup.appendChild(opt);
    });

    dropdown.appendChild(optGroup);
  });

  // Listener para filtrar al seleccionar
  dropdown.addEventListener("change", () => {
    const val = dropdown.value;
    if (val === "") {
      const activeTab = document.querySelector(".tab.active")?.dataset.cat;
      renderCategoria(activeTab || "");
    } else {
      const item = menuData.find(i => i.subCategoria === val);
      if (item) {
        const tabActual = document.querySelector(".tab.active")?.dataset.cat;
        if (item.categoria !== tabActual) {
          // Cambiar tab automáticamente
          tabs.forEach(t => t.classList.remove("active"));
          const nuevoTab = Array.from(tabs).find(t => t.dataset.cat === item.categoria);
          if (nuevoTab) nuevoTab.classList.add("active");
        }
      }
      renderCategoriaDropdown(val);
    }
  });
}

// ---------------------
// Renderizar por categoría
function renderCategoria(categoria) {
  const filtered = menuData
    .filter(i => i.categoria === categoria)
    .sort((a, b) => a.orden - b.orden);

  listContainer.innerHTML = filtered.length
    ? filtered.map(renderItem).join("")
    : "<p>No hay items en esta categoría.</p>";
}

// ---------------------
// Renderizar por subcategoría
function renderCategoriaDropdown(subCategoria) {
  const filtered = menuData
    .filter(i => i.subCategoria === subCategoria)
    .sort((a, b) => a.orden - b.orden);

  listContainer.innerHTML = filtered.length
    ? filtered.map(renderItem).join("")
    : "<p>No hay items en esta subcategoría.</p>";
}

// ---------------------
// Renderizar un item
function renderItem(item) {
  const mostrarImagen = item.imagen && item.imagen !== "";

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

// ---------------------
// Lightbox
function abrirLightbox(src) {
  const lb = document.createElement("div");
  lb.className = "lightbox";
  lb.innerHTML = `<img src="${src}" alt="Imagen del producto">`;
  lb.addEventListener("click", () => lb.remove());
  document.body.appendChild(lb);
}

// ---------------------
// Capitalizar
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ---------------------
// Inicializar
loadCSV();      const cols = row.split(",");
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
