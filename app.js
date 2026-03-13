const STORAGE_KEY = "sistema-academico-data";

const state = loadState();

const tabs = document.querySelectorAll(".tab-button");
const panels = document.querySelectorAll(".tab-panel");

tabs.forEach((button) => {
  button.addEventListener("click", () => {
    const tab = button.dataset.tab;
    tabs.forEach((b) => b.classList.toggle("active", b === button));
    panels.forEach((p) => p.classList.toggle("active", p.id === tab));
  });
});

document.getElementById("carrera-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const nombre = e.target.nombre.value.trim();
  if (!nombre) return;
  state.carreras.push({ id: crypto.randomUUID(), nombre });
  e.target.reset();
  sync();
});

document.getElementById("clase-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const nombre = e.target.nombre.value.trim();
  if (!nombre) return;
  state.clases.push({ id: crypto.randomUUID(), nombre });
  e.target.reset();
  sync();
});

document.getElementById("anio-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const nombre = e.target.nombre.value.trim();
  if (!nombre) return;
  state.anios.push({ id: crypto.randomUUID(), nombre });
  e.target.reset();
  sync();
});

document.getElementById("alumno-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const nombre = e.target.nombre.value.trim();
  const apellido = e.target.apellido.value.trim();
  const documento = e.target.documento.value.trim();
  if (!nombre || !apellido || !documento) return;
  state.alumnos.push({ id: crypto.randomUUID(), nombre, apellido, documento });
  e.target.reset();
  sync();
});

document.getElementById("carrera-anio-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const carreraId = document.getElementById("ca-carrera").value;
  const anioId = document.getElementById("ca-anio").value;
  if (!carreraId || !anioId) return;
  const exists = state.carreraAnio.some((x) => x.carreraId === carreraId && x.anioId === anioId);
  if (!exists) state.carreraAnio.push({ carreraId, anioId });
  sync();
});

document.getElementById("anio-clase-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const anioId = document.getElementById("ac-anio").value;
  const claseId = document.getElementById("ac-clase").value;
  if (!anioId || !claseId) return;
  const exists = state.anioClase.some((x) => x.anioId === anioId && x.claseId === claseId);
  if (!exists) state.anioClase.push({ anioId, claseId });
  sync();
});

document.getElementById("alumno-anio-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const alumnoId = document.getElementById("aa-alumno").value;
  const anioId = document.getElementById("aa-anio").value;
  if (!alumnoId || !anioId) return;
  const current = state.alumnoAnio.find((x) => x.alumnoId === alumnoId);
  if (current) current.anioId = anioId;
  else state.alumnoAnio.push({ alumnoId, anioId });
  sync();
});

function loadState() {
  const fallback = {
    carreras: [],
    clases: [],
    anios: [],
    alumnos: [],
    carreraAnio: [],
    anioClase: [],
    alumnoAnio: [],
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function render() {
  renderList("carreras-list", state.carreras.map((x) => x.nombre));
  renderList("clases-list", state.clases.map((x) => x.nombre));
  renderList("anios-list", state.anios.map((x) => x.nombre));
  renderList(
    "alumnos-list",
    state.alumnos.map((x) => `${x.nombre} ${x.apellido} (${x.documento})`)
  );

  fillSelect("ca-carrera", state.carreras, "Seleccione carrera");
  fillSelect("ca-anio", state.anios, "Seleccione año");
  fillSelect("ac-anio", state.anios, "Seleccione año");
  fillSelect("ac-clase", state.clases, "Seleccione clase");
  fillSelect("aa-alumno", state.alumnos, "Seleccione alumno", (x) => `${x.nombre} ${x.apellido}`);
  fillSelect("aa-anio", state.anios, "Seleccione año");

  renderList(
    "carrera-anio-list",
    state.carreraAnio.map(({ carreraId, anioId }) => `${getNombre(state.carreras, carreraId)} → ${getNombre(state.anios, anioId)}`)
  );
  renderList(
    "anio-clase-list",
    state.anioClase.map(({ anioId, claseId }) => `${getNombre(state.anios, anioId)} → ${getNombre(state.clases, claseId)}`)
  );
  renderList(
    "alumno-anio-list",
    state.alumnoAnio.map(({ alumnoId, anioId }) => `${getNombre(state.alumnos, alumnoId, (x) => `${x.nombre} ${x.apellido}`)} → ${getNombre(state.anios, anioId)}`)
  );

  renderResumen();
}

function renderResumen() {
  const body = document.getElementById("resumen-body");
  body.innerHTML = "";

  state.alumnoAnio.forEach(({ alumnoId, anioId }) => {
    const alumno = state.alumnos.find((x) => x.id === alumnoId);
    if (!alumno) return;

    const carreraRef = state.carreraAnio.find((x) => x.anioId === anioId);
    const carrera = carreraRef ? state.carreras.find((x) => x.id === carreraRef.carreraId) : null;
    const anio = state.anios.find((x) => x.id === anioId);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${alumno.nombre} ${alumno.apellido}</td>
      <td>${carrera?.nombre ?? "Sin carrera"}</td>
      <td>${anio?.nombre ?? "Sin año"}</td>
    `;
    body.appendChild(tr);
  });
}

function renderList(id, items) {
  const el = document.getElementById(id);
  el.innerHTML = "";
  if (!items.length) {
    const li = document.createElement("li");
    li.textContent = "Sin registros";
    el.appendChild(li);
    return;
  }

  items.forEach((text) => {
    const li = document.createElement("li");
    li.textContent = text;
    el.appendChild(li);
  });
}

function fillSelect(id, items, placeholder, labelFn = (x) => x.nombre) {
  const select = document.getElementById(id);
  const previous = select.value;

  select.innerHTML = `<option value="">${placeholder}</option>`;
  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = labelFn(item);
    select.appendChild(option);
  });

  if (items.some((x) => x.id === previous)) {
    select.value = previous;
  }
}

function getNombre(items, id, labelFn = (x) => x.nombre) {
  const item = items.find((x) => x.id === id);
  return item ? labelFn(item) : "(eliminado)";
}

function sync() {
  saveState();
  render();
}

render();
