// ----------------------------
// URL CSV publicado
const sheetCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQLt9xWlULnMP50kZ3MniL6eVxfFayhDmvXQaBUhe_tvWuvcOrn5TLilupN3lvJaU0gXvg-EAt1sv4v/pub?output=csv";

// Contenedor donde se renderizan los items
const listContainer = document.getElementById("list");
const dropdown = document.getElementById("categoria-dropdown");

// Variables globales
let menuData = [];
let tabs;

// ----------------------------
// Cargar CSV con PapaParse
function loadCSV() {
  Papa.parse(sheetCSV, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      menuData = results.data.map(item => {
        item.categoria = (item.categoria || "").toLowerCase().trim();
        item.subCategoria = (item.sub_categoria || "").toLowerCase().trim();
        item.orden = parseInt(item.orden) || 999;
        item.imagen = (item.imagen || "").trim();
        item.precio = (item.precio || "").trim();
        item.precio_2 = (item.precio_2 || "").trim();
        item.nota = (item.nota || "").trim();
        item.ingredientes = (item.ingredientes || "").trim();
        item.do = (item.do || "").trim();
        item.uva = (item.uva || "").trim();
        item.crianza = (item.crianza || "").trim();
        item.maridaje = (item.maridaje || "").trim();
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

// ----------------------------
// Inicializar tabs
function initTabs() {
  tabs = document.querySelectorAll(".tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      renderCategoria(tab.dataset.cat);

      // Reset dropdown
      if (dropdown) dropdown.value = "";
    });
  });
}

// ----------------------------
// Construir dropdown colapsable con categorías y subcategorías
function buildDropdown() {
  dropdown.innerHTML = `<option value="">Explorar menú...</option>`;

  // Agrupar subcategorías por categoría y calcular orden mínimo
  const catMap = {};
  menuData.forEach(item => {
    const cat = item.categoria || "sin_categoria";
    const sub = item.subCategoria || "sin_subcategoria";

    if (!catMap[cat]) catMap[cat] = {};
    if (!catMap[cat][sub]) catMap[cat][sub] = item.orden;
    else catMap[cat][sub] = Math.min(catMap[cat][sub], item.orden);
  });

  // Crear optgroups
  Object.keys(catMap).forEach(cat => {
    const optGroup = document.createElement("optgroup");
    optGroup.label = capitalize(cat);

    // Ordenar subcategorías
    const subOrdenadas = Object.keys(catMap[cat]).sort((a, b) => catMap[cat][a] - catMap[cat][b]);
    subOrdenadas.forEach(sub => {
      const opt = document.createElement("option");
      opt.value = sub;
      opt.textContent = capitalize(sub);
      optGroup.appendChild(opt);
    });

    dropdown.appendChild(optGroup);
  });

  // Listener cambio dropdown
  dropdown.addEventListener("change", () => {
    const val = dropdown.value;

    if (!val) {
      renderCategoria(getActiveTab());
    } else {
      // Cambiar al tab correspondiente si es diferente
      const item = menuData.find(i => i.subCategoria === val);
      if (item && item.categoria !== getActiveTab()) {
        tabs.forEach(t => t.classList.remove("active"));
        const newTab = Array.from(tabs).find(t => t.dataset.cat === item.categoria);
        if (newTab) newTab.classList.add("active");
      }
      renderSubCategoria(val);
    }
  });
}

// ----------------------------
// Obtener tab activo
function getActiveTab() {
  const active = document.querySelector(".tab.active");
  return active ? active.dataset.cat : tabs[0].dataset.cat;
}

// ----------------------------
// Renderizar por categoría
function renderCategoria(categoria) {
  // Filtrar items de la categoría seleccionada
  const filtered = menuData
    .filter(i => i.categoria === categoria)
    .sort((a, b) => a.orden - b.orden);

  if (!filtered.length) {
    listContainer.innerHTML = "<p>No hay items en esta categoría.</p>";
    return;
  }

  // Agrupar por subCategoria
  const grupos = {};
  filtered.forEach(item => {
    const sub = item.subCategoria || "sin_subcategoría";
    if (!grupos[sub]) grupos[sub] = [];
    grupos[sub].push(item);
  });

  // Construir HTML por grupos
  let html = "";
  Object.keys(grupos).forEach(sub => {
    html += `<span class="categ">CATEGORIA:</span><h2 class="subcategoria-titulo">${capitalize(sub)}</h2>`;
    grupos[sub].forEach(item => {
      html += renderItem(item);
    });
  });

  listContainer.innerHTML = html;
}

// ----------------------------
// Renderizar por subcategoría
function renderSubCategoria(subCategoria) {
  const filtered = menuData
    .filter(i => i.subCategoria === subCategoria)
    .sort((a, b) => a.orden - b.orden);

  listContainer.innerHTML = filtered.length
    ? filtered.map(renderItem).join("")
    : "<p>No hay items en esta subcategoría.</p>";
}

// ----------------------------
// Renderizar un item individual
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

// ----------------------------
// Lightbox
function abrirLightbox(src) {
  const lb = document.createElement("div");
  lb.className = "lightbox";
  lb.innerHTML = `<img src="${src}" alt="Imagen del producto">`;
  lb.addEventListener("click", () => lb.remove());
  document.body.appendChild(lb);
}

// ----------------------------
// Capitalizar texto
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ----------------------------
// Inicializar
loadCSV();
