import React, { useEffect, useState } from "react";
import "./App.css";

const STORAGE_KEY = "sistema-academico-data";

const initialState = {
  carreras: [],
  clases: [],
  anios: [],
  alumnos: [],
  carreraAnio: [],
  anioClase: [],
  alumnoAnio: [],
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...initialState, ...JSON.parse(raw) } : initialState;
  } catch {
    return initialState;
  }
}

function App() {
  const [data, setData] = useState(loadState());
  const [activeTab, setActiveTab] = useState("carreras");

  const [carreraNombre, setCarreraNombre] = useState("");
  const [claseNombre, setClaseNombre] = useState("");
  const [anioNombre, setAnioNombre] = useState("");
  const [alumnoForm, setAlumnoForm] = useState({
    nombre: "",
    apellido: "",
    documento: "",
  });

  const [carreraAnioForm, setCarreraAnioForm] = useState({
    carreraId: "",
    anioId: "",
  });

  const [anioClaseForm, setAnioClaseForm] = useState({
    anioId: "",
    claseId: "",
  });

  const [alumnoAnioForm, setAlumnoAnioForm] = useState({
    alumnoId: "",
    anioId: "",
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const addCarrera = (e) => {
    e.preventDefault();
    const nombre = carreraNombre.trim();
    if (!nombre) return;

    setData((prev) => ({
      ...prev,
      carreras: [...prev.carreras, { id: crypto.randomUUID(), nombre }],
    }));
    setCarreraNombre("");
  };

  const addClase = (e) => {
    e.preventDefault();
    const nombre = claseNombre.trim();
    if (!nombre) return;

    setData((prev) => ({
      ...prev,
      clases: [...prev.clases, { id: crypto.randomUUID(), nombre }],
    }));
    setClaseNombre("");
  };

  const addAnio = (e) => {
    e.preventDefault();
    const nombre = anioNombre.trim();
    if (!nombre) return;

    setData((prev) => ({
      ...prev,
      anios: [...prev.anios, { id: crypto.randomUUID(), nombre }],
    }));
    setAnioNombre("");
  };

  const addAlumno = (e) => {
    e.preventDefault();
    const nombre = alumnoForm.nombre.trim();
    const apellido = alumnoForm.apellido.trim();
    const documento = alumnoForm.documento.trim();

    if (!nombre || !apellido || !documento) return;

    setData((prev) => ({
      ...prev,
      alumnos: [
        ...prev.alumnos,
        { id: crypto.randomUUID(), nombre, apellido, documento },
      ],
    }));

    setAlumnoForm({
      nombre: "",
      apellido: "",
      documento: "",
    });
  };

  const addCarreraAnio = (e) => {
    e.preventDefault();
    const { carreraId, anioId } = carreraAnioForm;
    if (!carreraId || !anioId) return;

    const exists = data.carreraAnio.some(
      (x) => x.carreraId === carreraId && x.anioId === anioId
    );
    if (exists) return;

    setData((prev) => ({
      ...prev,
      carreraAnio: [...prev.carreraAnio, { carreraId, anioId }],
    }));

    setCarreraAnioForm({ carreraId: "", anioId: "" });
  };

  const addAnioClase = (e) => {
    e.preventDefault();
    const { anioId, claseId } = anioClaseForm;
    if (!anioId || !claseId) return;

    const exists = data.anioClase.some(
      (x) => x.anioId === anioId && x.claseId === claseId
    );
    if (exists) return;

    setData((prev) => ({
      ...prev,
      anioClase: [...prev.anioClase, { anioId, claseId }],
    }));

    setAnioClaseForm({ anioId: "", claseId: "" });
  };

  const addAlumnoAnio = (e) => {
    e.preventDefault();
    const { alumnoId, anioId } = alumnoAnioForm;
    if (!alumnoId || !anioId) return;

    setData((prev) => {
      const current = prev.alumnoAnio.find((x) => x.alumnoId === alumnoId);

      if (current) {
        return {
          ...prev,
          alumnoAnio: prev.alumnoAnio.map((x) =>
            x.alumnoId === alumnoId ? { ...x, anioId } : x
          ),
        };
      }

      return {
        ...prev,
        alumnoAnio: [...prev.alumnoAnio, { alumnoId, anioId }],
      };
    });

    setAlumnoAnioForm({ alumnoId: "", anioId: "" });
  };

  const getNombre = (items, id, labelFn = (x) => x.nombre) => {
    const item = items.find((x) => x.id === id);
    return item ? labelFn(item) : "(eliminado)";
  };

  const resumen = data.alumnoAnio
    .map(({ alumnoId, anioId }) => {
      const alumno = data.alumnos.find((x) => x.id === alumnoId);
      if (!alumno) return null;

      const carreraRef = data.carreraAnio.find((x) => x.anioId === anioId);
      const carrera = carreraRef
        ? data.carreras.find((x) => x.id === carreraRef.carreraId)
        : null;
      const anio = data.anios.find((x) => x.id === anioId);

      return {
        alumno: `${alumno.nombre} ${alumno.apellido}`,
        carrera: carrera?.nombre ?? "Sin carrera",
        anio: anio?.nombre ?? "Sin año",
      };
    })
    .filter(Boolean);

  const renderList = (items) => {
    if (!items.length) return <li>Sin registros</li>;
    return items.map((text, index) => <li key={index}>{text}</li>);
  };

  return (
    <div>
      <header className="app-header">
        <h1>Sistema Académico</h1>
        <p>Gestión de carreras, clases, años y alumnos</p>
      </header>

      <div className="tabs">
        {[
          ["carreras", "Carreras"],
          ["clases", "Clases"],
          ["anios", "Años"],
          ["alumnos", "Alumnos"],
          ["relaciones", "Relaciones"],
          ["resumen", "Resumen"],
        ].map(([key, label]) => (
          <button
            key={key}
            className={`tab-button ${activeTab === key ? "active" : ""}`}
            onClick={() => setActiveTab(key)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      <main>
        {activeTab === "carreras" && (
          <section className="tab-panel active">
            <div className="grid">
              <div className="card">
                <h2>Registrar carrera</h2>
                <form onSubmit={addCarrera}>
                  <label>Nombre de la carrera</label>
                  <input
                    type="text"
                    placeholder="Ej. Ingeniería en Sistemas"
                    value={carreraNombre}
                    onChange={(e) => setCarreraNombre(e.target.value)}
                  />
                  <button type="submit">Guardar carrera</button>
                </form>
              </div>

              <div className="card">
                <h2>Lista de carreras</h2>
                <ul className="item-list">
                  {renderList(data.carreras.map((x) => x.nombre))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {activeTab === "clases" && (
          <section className="tab-panel active">
            <div className="grid">
              <div className="card">
                <h2>Registrar clase</h2>
                <form onSubmit={addClase}>
                  <label>Nombre de la clase</label>
                  <input
                    type="text"
                    placeholder="Ej. Matemática"
                    value={claseNombre}
                    onChange={(e) => setClaseNombre(e.target.value)}
                  />
                  <button type="submit">Guardar clase</button>
                </form>
              </div>

              <div className="card">
                <h2>Lista de clases</h2>
                <ul className="item-list">
                  {renderList(data.clases.map((x) => x.nombre))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {activeTab === "anios" && (
          <section className="tab-panel active">
            <div className="grid">
              <div className="card">
                <h2>Registrar año</h2>
                <form onSubmit={addAnio}>
                  <label>Nombre del año</label>
                  <input
                    type="text"
                    placeholder="Ej. Primer Año"
                    value={anioNombre}
                    onChange={(e) => setAnioNombre(e.target.value)}
                  />
                  <button type="submit">Guardar año</button>
                </form>
              </div>

              <div className="card">
                <h2>Lista de años</h2>
                <ul className="item-list">
                  {renderList(data.anios.map((x) => x.nombre))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {activeTab === "alumnos" && (
          <section className="tab-panel active">
            <div className="grid">
              <div className="card">
                <h2>Registrar alumno</h2>
                <form onSubmit={addAlumno}>
                  <label>Nombre</label>
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={alumnoForm.nombre}
                    onChange={(e) =>
                      setAlumnoForm({ ...alumnoForm, nombre: e.target.value })
                    }
                  />

                  <label>Apellido</label>
                  <input
                    type="text"
                    placeholder="Apellido"
                    value={alumnoForm.apellido}
                    onChange={(e) =>
                      setAlumnoForm({ ...alumnoForm, apellido: e.target.value })
                    }
                  />

                  <label>Documento</label>
                  <input
                    type="text"
                    placeholder="Documento"
                    value={alumnoForm.documento}
                    onChange={(e) =>
                      setAlumnoForm({
                        ...alumnoForm,
                        documento: e.target.value,
                      })
                    }
                  />

                  <button type="submit">Guardar alumno</button>
                </form>
              </div>

              <div className="card">
                <h2>Lista de alumnos</h2>
                <ul className="item-list">
                  {renderList(
                    data.alumnos.map(
                      (x) => `${x.nombre} ${x.apellido} (${x.documento})`
                    )
                  )}
                </ul>
              </div>
            </div>
          </section>
        )}

        {activeTab === "relaciones" && (
          <section className="tab-panel active">
            <div className="grid">
              <div className="card">
                <h2>Asignar carrera a año</h2>
                <form onSubmit={addCarreraAnio}>
                  <label>Carrera</label>
                  <select
                    value={carreraAnioForm.carreraId}
                    onChange={(e) =>
                      setCarreraAnioForm({
                        ...carreraAnioForm,
                        carreraId: e.target.value,
                      })
                    }
                  >
                    <option value="">Seleccione carrera</option>
                    {data.carreras.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nombre}
                      </option>
                    ))}
                  </select>

                  <label>Año</label>
                  <select
                    value={carreraAnioForm.anioId}
                    onChange={(e) =>
                      setCarreraAnioForm({
                        ...carreraAnioForm,
                        anioId: e.target.value,
                      })
                    }
                  >
                    <option value="">Seleccione año</option>
                    {data.anios.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nombre}
                      </option>
                    ))}
                  </select>

                  <button type="submit">Guardar relación</button>
                </form>

                <ul className="item-list">
                  {renderList(
                    data.carreraAnio.map(
                      ({ carreraId, anioId }) =>
                        `${getNombre(data.carreras, carreraId)} → ${getNombre(
                          data.anios,
                          anioId
                        )}`
                    )
                  )}
                </ul>
              </div>

              <div className="card">
                <h2>Asignar clase a año</h2>
                <form onSubmit={addAnioClase}>
                  <label>Año</label>
                  <select
                    value={anioClaseForm.anioId}
                    onChange={(e) =>
                      setAnioClaseForm({
                        ...anioClaseForm,
                        anioId: e.target.value,
                      })
                    }
                  >
                    <option value="">Seleccione año</option>
                    {data.anios.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nombre}
                      </option>
                    ))}
                  </select>

                  <label>Clase</label>
                  <select
                    value={anioClaseForm.claseId}
                    onChange={(e) =>
                      setAnioClaseForm({
                        ...anioClaseForm,
                        claseId: e.target.value,
                      })
                    }
                  >
                    <option value="">Seleccione clase</option>
                    {data.clases.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nombre}
                      </option>
                    ))}
                  </select>

                  <button type="submit">Guardar relación</button>
                </form>

                <ul className="item-list">
                  {renderList(
                    data.anioClase.map(
                      ({ anioId, claseId }) =>
                        `${getNombre(data.anios, anioId)} → ${getNombre(
                          data.clases,
                          claseId
                        )}`
                    )
                  )}
                </ul>
              </div>

              <div className="card">
                <h2>Asignar alumno a año</h2>
                <form onSubmit={addAlumnoAnio}>
                  <label>Alumno</label>
                  <select
                    value={alumnoAnioForm.alumnoId}
                    onChange={(e) =>
                      setAlumnoAnioForm({
                        ...alumnoAnioForm,
                        alumnoId: e.target.value,
                      })
                    }
                  >
                    <option value="">Seleccione alumno</option>
                    {data.alumnos.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nombre} {item.apellido}
                      </option>
                    ))}
                  </select>

                  <label>Año</label>
                  <select
                    value={alumnoAnioForm.anioId}
                    onChange={(e) =>
                      setAlumnoAnioForm({
                        ...alumnoAnioForm,
                        anioId: e.target.value,
                      })
                    }
                  >
                    <option value="">Seleccione año</option>
                    {data.anios.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nombre}
                      </option>
                    ))}
                  </select>

                  <button type="submit">Guardar relación</button>
                </form>

                <ul className="item-list">
                  {renderList(
                    data.alumnoAnio.map(
                      ({ alumnoId, anioId }) =>
                        `${getNombre(
                          data.alumnos,
                          alumnoId,
                          (x) => `${x.nombre} ${x.apellido}`
                        )} → ${getNombre(data.anios, anioId)}`
                    )
                  )}
                </ul>
              </div>
            </div>
          </section>
        )}

        {activeTab === "resumen" && (
          <section className="tab-panel active">
            <div className="card table-card">
              <h2>Resumen general</h2>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Alumno</th>
                      <th>Carrera</th>
                      <th>Año</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumen.length ? (
                      resumen.map((item, index) => (
                        <tr key={index}>
                          <td>{item.alumno}</td>
                          <td>{item.carrera}</td>
                          <td>{item.anio}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3">Sin registros</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;