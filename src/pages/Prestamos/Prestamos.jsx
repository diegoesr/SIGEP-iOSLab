import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import './Prestamos.css';
import '../../styles/shared/shared-search.css';

const Prestamos = () => {
  const [prestamos, setPrestamos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [equiposDisponibles, setEquiposDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('activo');
  const [buscarPrestamo, setBuscarPrestamo] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [pasoActual, setPasoActual] = useState(1);
  const [buscarUsuario, setBuscarUsuario] = useState('');
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const [formData, setFormData] = useState({
    usuario_id: '',
    equipo_id: '',
    fecha_devolucion_esperada: '',
    observaciones: ''
  });
  const [fechaDevolucion, setFechaDevolucion] = useState('');
  const [horaDevolucion, setHoraDevolucion] = useState('13:30');

  const pasos = [
    { numero: 1, nombre: 'Estudiante', completo: false },
    { numero: 2, nombre: 'Equipo', completo: false },
    { numero: 3, nombre: 'Firma', completo: false }
  ];

  useEffect(() => {
    cargarDatos(true);
  }, [filtroEstado]);

  // Debounce para la búsqueda de préstamos
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      cargarDatos(false); // No mostrar loading durante la búsqueda
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [buscarPrestamo]);

  useEffect(() => {
    if (buscarUsuario.length > 2) {
      buscarUsuarios();
    } else {
      setUsuarios([]);
    }
  }, [buscarUsuario]);

  useEffect(() => {
    if (pasoActual === 2) {
      cargarEquiposDisponibles();
    }
  }, [pasoActual]);

  const cargarDatos = async () => {
    try {
      const prestamosRes = await api.listarPrestamos(filtroEstado || null);
      if (prestamosRes.success) {
        let prestamosFiltrados = prestamosRes.data;
        
        // Filtrar por búsqueda si existe
        if (buscarPrestamo) {
          const busqueda = buscarPrestamo.toLowerCase();
          prestamosFiltrados = prestamosFiltrados.filter(prestamo => 
            prestamo.usuario_nombre?.toLowerCase().includes(busqueda) ||
            prestamo.matricula?.toLowerCase().includes(busqueda) ||
            prestamo.equipo_codigo?.toLowerCase().includes(busqueda) ||
            prestamo.equipo_nombre?.toLowerCase().includes(busqueda)
          );
        }
        
        setPrestamos(prestamosFiltrados);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarEquiposDisponibles = async () => {
    try {
      const equiposRes = await api.listarEquipos('disponible');
      if (equiposRes.success) {
        setEquiposDisponibles(equiposRes.data);
      }
    } catch (error) {
      console.error('Error al cargar equipos:', error);
    }
  };

  const buscarUsuarios = async () => {
    try {
      const response = await api.buscarUsuarios(buscarUsuario);
      if (response.success) {
        setUsuarios(response.data);
      }
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
    }
  };

  const seleccionarUsuario = (usuario) => {
    setUsuarioSeleccionado(usuario);
    // Establecer fecha por defecto: 7 días desde hoy
    const fechaDefault = new Date();
    fechaDefault.setDate(fechaDefault.getDate() + 7);
    const fechaFormato = fechaDefault.toISOString().slice(0, 10);
    
    setFechaDevolucion(fechaFormato);
    setHoraDevolucion('13:30');
    setFormData({ 
      ...formData, 
      usuario_id: usuario.id,
      fecha_devolucion_esperada: `${fechaFormato}T13:30`
    });
    setBuscarUsuario(`${usuario.nombre} - ${usuario.matricula}`);
    setUsuarios([]);
  };

  // Actualizar fecha_devolucion_esperada cuando cambian fecha o hora
  useEffect(() => {
    if (fechaDevolucion && horaDevolucion) {
      const fechaCompleta = `${fechaDevolucion}T${horaDevolucion}`;
      setFormData(prev => {
        // Solo actualizar si el valor es diferente para evitar loops
        if (prev.fecha_devolucion_esperada !== fechaCompleta) {
          return { 
            ...prev, 
            fecha_devolucion_esperada: fechaCompleta
          };
        }
        return prev;
      });
    }
  }, [fechaDevolucion, horaDevolucion]);

  const seleccionarEquipo = (equipo) => {
    setEquipoSeleccionado(equipo);
    setFormData({ ...formData, equipo_id: equipo.id });
  };

  const siguientePaso = () => {
    if (pasoActual === 1 && !usuarioSeleccionado) {
      alert('Por favor selecciona un estudiante');
      return;
    }
    if (pasoActual === 2 && !equipoSeleccionado) {
      alert('Por favor selecciona un equipo');
      return;
    }
    if (pasoActual < 3) {
      setPasoActual(pasoActual + 1);
    }
  };

  const pasoAnterior = () => {
    if (pasoActual > 1) {
      setPasoActual(pasoActual - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.crearPrestamo(formData);
      if (response.success) {
        setMostrarModal(false);
        setPasoActual(1);
        setUsuarioSeleccionado(null);
        setEquipoSeleccionado(null);
        setFormData({
          usuario_id: '',
          equipo_id: '',
          fecha_devolucion_esperada: '',
          observaciones: ''
        });
        setFechaDevolucion('');
        setHoraDevolucion('13:30');
        setBuscarUsuario('');
        setUsuarios([]);
        cargarDatos();
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const devolverEquipo = async (id) => {
    if (!confirm('¿Confirmar devolución del equipo?')) return;

    try {
      const response = await api.devolverEquipo(id);
      if (response.success) {
        cargarDatos();
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const cancelarProceso = () => {
    setMostrarModal(false);
    setPasoActual(1);
    setUsuarioSeleccionado(null);
    setEquipoSeleccionado(null);
    setFormData({
      usuario_id: '',
      equipo_id: '',
      fecha_devolucion_esperada: '',
      observaciones: ''
    });
    setFechaDevolucion('');
    setHoraDevolucion('13:30');
    setBuscarUsuario('');
    setUsuarios([]);
  };

  if (loading) {
    return <div className="loading">Cargando préstamos...</div>;
  }

  return (
    <div className="prestamos">
      <div className="prestamos-header">
        <div className="breadcrumbs">
          {mostrarModal && (
            <>
              <span>/</span>
              <span>Nuevo Préstamo</span>
            </>
          )}
        </div>
          {!mostrarModal && (
            <>
              <div>
                <h1>Nuevo Registro de prestamos</h1>
                <p className="section-description">
                  Gestiona y rastrea los préstamos de equipos a estudiantes. 
                </p>
              </div>
              <div className="prestamos-actions">
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Todos</option>
                  <option value="activo">Activos</option>
                  <option value="completado">Completados</option>
                  <option value="vencido">Vencidos</option>
                </select>
                <button onClick={() => setMostrarModal(true)} className="btn-primary">
                  + Nuevo Préstamo
                </button>
              </div>
            </>
          )}
      </div>

      {!mostrarModal && (
        <>
          {/* Barra de búsqueda */}
          <div className="search-section">
            <div className="search-wrapper">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="search-icon">
                <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M13 13L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="Buscar por usuario, matrícula, código de equipo o nombre..."
                className="search-input"
                value={buscarPrestamo}
                onChange={(e) => setBuscarPrestamo(e.target.value)}
              />
              {buscarPrestamo && (
                <button 
                  className="clear-search-btn"
                  onClick={() => setBuscarPrestamo('')}
                  title="Limpiar búsqueda"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="prestamos-table-container">
            <table className="prestamos-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Matrícula</th>
                <th>Equipo</th>
                <th>Fecha Préstamo</th>
                <th>Fecha Devolución</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {prestamos.length > 0 ? (
                prestamos.map((prestamo) => (
                  <tr key={prestamo.id}>
                    <td>{prestamo.usuario_nombre}</td>
                    <td>{prestamo.matricula}</td>
                    <td>{prestamo.equipo_codigo}</td>
                    <td>{new Date(prestamo.fecha_prestamo).toLocaleDateString()}</td>
                    <td>{new Date(prestamo.fecha_devolucion_esperada).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge badge-${prestamo.estado}`}>
                        {prestamo.estado}
                      </span>
                    </td>
                    <td>
                      {prestamo.estado === 'activo' && (
                        <button
                          onClick={() => devolverEquipo(prestamo.id)}
                          className="btn-sm btn-success"
                        >
                          Devolver
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">No hay préstamos registrados</td>
                </tr>
              )}
            </tbody>
            </table>
          </div>
        </>
      )}

      {mostrarModal && (
        <div className="new-loan-wizard">
          <div className="wizard-header">
            <h1>Registro de Nuevo Préstamo</h1>
            <p className="wizard-subtitle">Proceso paso a paso para asignar equipos a estudiantes</p>
          </div>

          <div className="progress-section">
            <div className="progress-header">
              <span className="progress-label">PROGRESO ACTUAL</span>
              <span className="progress-step">Paso {pasoActual}: {pasos[pasoActual - 1].nombre}</span>
            </div>
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${(pasoActual / 3) * 100}%` }}
              ></div>
            </div>
            <div className="steps-indicator">
              {pasos.map((paso, index) => (
                <div
                  key={paso.numero}
                  className={`step-item ${pasoActual === paso.numero ? 'active' : pasoActual > paso.numero ? 'completed' : ''}`}
                >
                  <div className="step-number">{paso.numero}</div>
                  <div className="step-label">{paso.nombre}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="wizard-content">
            {pasoActual === 1 && (
              <div className="step-content">
                <div className="step-card">
                  <div className="step-card-header">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <h2>Identificar Estudiante</h2>
                  </div>
                  <div className="step-card-body">
                    <label className="search-label">Buscar por Nombre o Matrícula</label>
                    <div className="search-input-wrapper">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="search-icon">
                        <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
                        <path d="M13 13L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      <input
                        type="text"
                        value={buscarUsuario}
                        onChange={(e) => setBuscarUsuario(e.target.value)}
                        placeholder="Comienza a escribir nombre (ej. Juan Pérez) o ID (ej. 2023001)..."
                        className="search-input"
                      />
                    </div>
                    {usuarios.length > 0 && (
                      <div className="usuarios-dropdown">
                        {usuarios.map((usuario) => (
                          <div
                            key={usuario.id}
                            className="usuario-option"
                            onClick={() => seleccionarUsuario(usuario)}
                          >
                            <strong>{usuario.nombre}</strong> - {usuario.matricula}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="selected-student-box">
                      {usuarioSeleccionado ? (
                        <div className="student-selected">
                          <div className="student-info">
                            <h3>{usuarioSeleccionado.nombre}</h3>
                            <p>Matrícula: {usuarioSeleccionado.matricula}</p>
                            {usuarioSeleccionado.email && <p>Email: {usuarioSeleccionado.email}</p>}
                            {usuarioSeleccionado.telefono && <p>Teléfono: {usuarioSeleccionado.telefono}</p>}
                          </div>
                        </div>
                      ) : (
                        <div className="no-student-selected">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                          <p>No se ha seleccionado ningún estudiante</p>
                          <small>Por favor usa la barra de búsqueda arriba para encontrar un estudiante</small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {pasoActual === 2 && (
              <div className="step-content">
                <div className="step-card">
                  <div className="step-card-header">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="9" y1="9" x2="15" y2="9"></line>
                      <line x1="9" y1="15" x2="15" y2="15"></line>
                    </svg>
                    <h2>Seleccionar Equipo</h2>
                  </div>
                  <div className="step-card-body">
                    <label className="search-label">Equipos Disponibles</label>
                    <div className="equipos-grid">
                      {equiposDisponibles.length > 0 ? (
                        equiposDisponibles.map((equipo) => (
                          <div
                            key={equipo.id}
                            className={`equipo-card ${equipoSeleccionado?.id === equipo.id ? 'selected' : ''}`}
                            onClick={() => seleccionarEquipo(equipo)}
                          >
                            <div className="equipo-icon-large">
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="9" y1="9" x2="15" y2="9"></line>
                                <line x1="9" y1="15" x2="15" y2="15"></line>
                              </svg>
                            </div>
                            <div className="equipo-info">
                              <h3>{equipo.nombre}</h3>
                              <p>Código: {equipo.codigo}</p>
                              <p>Tipo: {equipo.tipo}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="no-equipos">No hay equipos disponibles</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {pasoActual === 3 && (
              <div className="step-content">
                <div className="step-card">
                  <div className="step-card-header">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <h2>Confirmar y Firmar</h2>
                  </div>
                  <div className="step-card-body">
                    <form onSubmit={handleSubmit}>
                      <div className="summary-section">
                        <div className="summary-item">
                          <h3>Estudiante Seleccionado</h3>
                          <p>{usuarioSeleccionado?.nombre} - {usuarioSeleccionado?.matricula}</p>
                        </div>
                        <div className="summary-item">
                          <h3>Equipo Seleccionado</h3>
                          <p>{equipoSeleccionado?.nombre} ({equipoSeleccionado?.codigo})</p>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Fecha de Devolución Esperada *</label>
                        <div className="date-time-container">
                          <div className="date-time-inputs">
                            <div className="date-input-wrapper">
                              <input
                                type="date"
                                value={fechaDevolucion}
                                onChange={(e) => setFechaDevolucion(e.target.value)}
                                min={new Date().toISOString().slice(0, 10)}
                                className="date-input"
                                required
                              />
                            </div>
                            <div className="time-input-wrapper">
                              <input
                                type="time"
                                value={horaDevolucion}
                                onChange={(e) => setHoraDevolucion(e.target.value)}
                                className="time-input"
                                required
                              />
                            </div>
                          </div>
                          <div className="quick-date-options">
                            <button
                              type="button"
                              className="quick-date-btn"
                              onClick={() => {
                                const fecha = new Date();
                                fecha.setDate(fecha.getDate() + 1);
                                setFechaDevolucion(fecha.toISOString().slice(0, 10));
                                setHoraDevolucion('13:30');
                              }}
                            >
                              Mañana 13:30
                            </button>
                            <button
                              type="button"
                              className="quick-date-btn"
                              onClick={() => {
                                const fecha = new Date();
                                fecha.setDate(fecha.getDate() + 7);
                                setFechaDevolucion(fecha.toISOString().slice(0, 10));
                                setHoraDevolucion('13:30');
                              }}
                            >
                              +7 días 13:30
                            </button>
                            <button
                              type="button"
                              className="quick-date-btn"
                              onClick={() => {
                                const fecha = new Date();
                                fecha.setDate(fecha.getDate() + 14);
                                setFechaDevolucion(fecha.toISOString().slice(0, 10));
                                setHoraDevolucion('13:30');
                              }}
                            >
                              +14 días 13:30
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Observaciones</label>
                        <textarea
                          value={formData.observaciones}
                          onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                          rows="3"
                          placeholder="Notas adicionales sobre el préstamo..."
                        />
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="wizard-footer">
            <button type="button" onClick={cancelarProceso} className="cancel-link">
              Cancelar Proceso
            </button>
            <div className="footer-buttons">
              {pasoActual > 1 && (
                <button type="button" onClick={pasoAnterior} className="btn-back">
                  Atrás
                </button>
              )}
              {pasoActual < 3 ? (
                <button type="button" onClick={siguientePaso} className="btn-next">
                  Siguiente Paso
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} className="btn-next">
                  Registrar Préstamo
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prestamos;
