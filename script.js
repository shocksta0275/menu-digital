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
        item.categoria = (item.categoria || "").trim();
        item.subCategoria = (item.sub_categoria || "").trim();
        item.orden = parseInt(item.orden) || 999;
        item.imagen = (item.imagen || "").trim();
        item.precio = (item.precio || "").trim();
        if (item.precio !== "") {
          item.precio = parseFloat(item.precio).toFixed(2);
        }
        item.precio_2 = (item.precio_2 || "").trim(); 
        if (item.precio_2 !== "") {
         item.precio_2 = parseFloat(item.precio_2).toFixed(2); }
        item.trago = (item.trago || "").trim(); 
        if (item.trago !== "") {
         item.trago = parseFloat(item.trago).toFixed(2); }
        item.botella = (item.botella || "").trim(); 
        if (item.botella !== "") {
         item.botella = parseFloat(item.botella).toFixed(2); }
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
    // "sin_subcategoria"
    const sub = item.subCategoria || " ";
    if (!grupos[sub]) grupos[sub] = [];
    grupos[sub].push(item);
  });

  // Construir HTML por grupos
  let html = "";
  Object.keys(grupos).forEach(sub => {
    html += `<h2 class="subcategoria-titulo">${capitalize(sub)}</h2>`;
    grupos[sub].forEach(item => {
      html += renderItem(item);
      
    });
    html += `<hr class="linea4">`;
  });

  listContainer.innerHTML = html;
}

// ----------------------------
// Renderizar por subcategoría
function renderSubCategoria(subCategoria) {
  const filtered = menuData
    .filter(i => i.subCategoria === subCategoria)
    .sort((a, b) => a.orden - b.orden);

  if (!filtered.length) {
    listContainer.innerHTML = "<p>No hay items en esta subcategoría.</p>";
    return;
  }

  let html = `<h2 class="subcategoria-titulo">${capitalize(subCategoria)}</h2>`;

  filtered.forEach(item => {
    html += renderItem(item);
  });

  listContainer.innerHTML = html;
}

// ----------------------------
// Renderizar un item individual
function renderItem(item) {
  const tieneImagen = Boolean(item.imagen);
  const sub_categoria = item.sub_categoria;
  
  const bebidasList = ["Ginebra", "Vodka", "Ron", "Seco", "Tequila", "Whisky"];

  if (bebidasList.includes(sub_categoria) && tieneImagen) 
  {
    return `
      <div class="item-con-imagen layout">
        <div class="col-izq">
          <img src="${item.imagen}" alt="${item.nombre}" onclick="abrirLightbox('${item.imagen}')">
        </div>
      
        <div class="col-der detalle">
          <div class="fila"><h3>${item.nombre}</h3>
          ${item.ingredientes ? `${item.ingredientes}` : ''}
          </div>
          <div class="fila-doble">
            <div class="col-50 precio">
            <b>Trago: <h4>${item.trago}</h4></b>
            </div>
            <div class="col-50 precio d"><b>
            Botella: <h4>${item.botella}</h4></b>
            </div>
          </div>
          <div class="fila-doble">
            <div class="col-50">
            ${item.nota ? `${item.nota}` : ''}
            </div>
            <div class="col-50 d"> 
              ${item.precio_2 ? `Precio regular: <span class="tachado"> ${item.precio_2}</span>` : ''}</div>
            </div>
          </div>
        </div>`;
  } 
  
  else if (bebidasList.includes(sub_categoria)) {
    return `<div class="item-sin-imagen detalle col-der">
          <div class="fila"><h3>${item.nombre}</h3>
          ${item.ingredientes ? `${item.ingredientes}</p>` : ''}
          </div>
          <div class="fila fila-doble">
            <div class="col-50 precio d">
            <b>Trago: <h4>${item.trago}</h4></b>
            </div>
            <div class="col-50 precio d"><b>
            Botella: <h4>${item.botella}</h4></b>
            </div>
          </div>
        </div>
        <div class="fila fila-doble">
            <div class="col-50">
            ${item.nota ? `${item.nota}` : ''}
            </div>
            <div class="col-50 d"> 
              ${item.precio_2 ? `Precio regular: <span class="tachado"> ${item.precio_2}</span>` : ''}</div>
          </div>`;
  }
  else if (tieneImagen) {
    return `
    <div class="item-con-imagen layout">
        <div class="col-izq">
          <img src="${item.imagen}" alt="${item.nombre}" onclick="abrirLightbox('${item.imagen}')">
        </div>
      
        <div class="col-der detalle">
          <div class="fila"><h3>${item.nombre}</h3>
          ${item.ingredientes ? `${item.ingredientes}` : ''}
          ${item.do ? `<p><b>D.O.:</b> ${item.do}</p>` : ''}
          ${item.uva ? `<p><b>Uva:</b> ${item.uva}</p>` : ''}
          ${item.crianza ? `<p><b>Crianza:</b> ${item.crianza}</p>` : ''}
          ${item.maridaje ? `<p><b>Maridaje:</b> ${item.maridaje}</p>` : ''}
          </div>
          <div class="fila fila-doble">
            <div class="col-50"></div>
            <div class="col-50 precio d"><b>B/. <h4>${item.precio}</h4></b> </div>
          </div>
        </div>
      </div>
      <div class="fila fila-doble">
            <div class="col-50">
            ${item.nota ? `${item.nota}` : ''}
            </div>
            <div class="col-50 d"> 
              ${item.precio_2 ? `Precio regular: <span class="tachado"> ${item.precio_2}</span>` : ''}
            </div>
      </div>`;
        
  } 
  else {
    return `
    <div class="item-sin-imagen detalle col-der">
          <div class="fila"><h3>${item.nombre}</h3>
          ${item.ingredientes ? `${item.ingredientes}` : ''}
          ${item.do ? `<p><b>D.O.:</b> ${item.do}</p>` : ''}
          ${item.uva ? `<p><b>Uva:</b> ${item.uva}</p>` : ''}
          ${item.crianza ? `<p><b>Crianza:</b> ${item.crianza}</p>` : ''}
          ${item.maridaje ? `<p><b>Maridaje:</b> ${item.maridaje}</p>` : ''}
          </div>
          <div class="fila fila-doble">
            <div class="col-50 precio d"></div>
            <div class="col-50 precio d"><b>
            B/. <h4>${item.precio}</h4></b>
          </div>
          </div>
          <div class="fila fila-doble">
            <div class="col-50">
            ${item.nota ? `${item.nota}` : ''}
            </div>
            <div class="col-50 d"> 
              ${item.precio_2 ? `Precio regular: <span class="tachado"> ${item.precio_2}</span>` : ''}
            </div>
          </div>
        </div>`;
  }
}
// nuevo render


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
