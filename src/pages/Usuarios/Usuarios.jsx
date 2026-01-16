import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import './Usuarios.css';
import '../../styles/shared/shared-search.css';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buscar, setBuscar] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalPerfil, setMostrarModalPerfil] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [prestamosUsuario, setPrestamosUsuario] = useState([]);
  const [tabActivoPerfil, setTabActivoPerfil] = useState('perfil');
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    matricula: '',
    email: '',
    telefono: ''
  });
  const [formDataEdicion, setFormDataEdicion] = useState({
    nombre: '',
    matricula: '',
    email: '',
    telefono: ''
  });

  useEffect(() => {
    if (isInitialLoad) {
      cargarUsuarios(true);
      setIsInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    if (!isInitialLoad) {
      const timeoutId = setTimeout(() => {
        cargarUsuarios(false); // No mostrar loading durante la búsqueda
      }, 300); // Debounce de 300ms

      return () => clearTimeout(timeoutId);
    }
  }, [buscar]);

  const cargarUsuarios = async (mostrarLoading = false) => {
    try {
      if (mostrarLoading) {
        setLoading(true);
      }
      const response = await api.buscarUsuarios(buscar || '');
      if (response.success) {
        setUsuarios(response.data);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      if (mostrarLoading) {
        setLoading(false);
      }
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.registrarUsuario(formData);
      if (response.success) {
        setMostrarModal(false);
        setFormData({
          nombre: '',
          matricula: '',
          email: '',
          telefono: ''
        });
        cargarUsuarios();
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const abrirModalPerfil = async (usuario) => {
    setUsuarioSeleccionado(usuario);
    setFormDataEdicion({
      nombre: usuario.nombre,
      matricula: usuario.matricula,
      email: usuario.email || '',
      telefono: usuario.telefono || ''
    });
    setTabActivoPerfil('perfil');
    setEditandoPerfil(false);
    setMostrarModalPerfil(true);

    // Cargar historial de préstamos
    try {
      const response = await api.obtenerPrestamosPorUsuario(usuario.id);
      if (response.success) {
        setPrestamosUsuario(response.data);
      }
    } catch (error) {
      console.error('Error al cargar préstamos:', error);
      setPrestamosUsuario([]);
    }
  };

  const cerrarModalPerfil = () => {
    setMostrarModalPerfil(false);
    setUsuarioSeleccionado(null);
    setPrestamosUsuario([]);
    setEditandoPerfil(false);
  };

  const handleGuardarPerfil = async (e) => {
    e.preventDefault();
    try {
      const response = await api.actualizarUsuario(usuarioSeleccionado.id, formDataEdicion);
      if (response.success) {
        setEditandoPerfil(false);
        cargarUsuarios();
        // Actualizar usuario seleccionado
        setUsuarioSeleccionado({
          ...usuarioSeleccionado,
          ...formDataEdicion
        });
        alert('Perfil actualizado exitosamente');
      }
    } catch (error) {
      alert('Error al actualizar perfil: ' + error.message);
    }
  };

  const getEstadoBadgeClass = (estado) => {
    const estados = {
      activo: 'activo',
      completado: 'completado',
      vencido: 'vencido'
    };
    return estados[estado] || '';
  };

  const getEstadoLabel = (estado) => {
    const labels = {
      activo: 'En Uso',
      completado: 'Devuelto',
      vencido: 'Vencido'
    };
    return labels[estado] || estado;
  };


  if (loading) {
    return <div className="loading">Cargando usuarios...</div>;
  }

  return (
    <div className="usuarios">
      <div className="usuarios-header">
        <div className="header-content">
          <h1>Gestión de Usuarios</h1>
          <p className="header-subtitle">
            Administra el registro de estudiantes y usuarios del laboratorio.
          </p>
        </div>
        <button onClick={() => setMostrarModal(true)} className="btn-add-equipment">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Nuevo Usuario
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="search-section">
        <div className="search-wrapper">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="search-icon">
            <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M13 13L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre, matrícula o email..."
            className="search-input"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
          />
          {buscar && (
            <button
              className="clear-search-btn"
              onClick={() => setBuscar('')}
              title="Limpiar búsqueda"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="usuarios-grid">
        {usuarios.map((usuario) => (
          <div
            key={usuario.id}
            className="usuario-card"
            onClick={() => abrirModalPerfil(usuario)}
            style={{ cursor: 'pointer' }}
          >
            <div className="usuario-info">
              <h3>{usuario.nombre}</h3>
              <p className="usuario-matricula">{usuario.matricula}</p>
              {usuario.email && <p className="usuario-email">{usuario.email}</p>}
              {usuario.telefono && <p className="usuario-telefono">{usuario.telefono}</p>}
              <p className="usuario-fecha">
                Registrado: {new Date(usuario.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {usuarios.length === 0 && (
        <div className="empty-state">
          <p>No se encontraron usuarios</p>
        </div>
      )}

      {mostrarModal && (
        <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Registrar Nuevo Usuario</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre Completo *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Matrícula *</label>
                <input
                  type="text"
                  value={formData.matricula}
                  onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setMostrarModal(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">Registrar Usuario</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Perfil de Usuario */}
      {mostrarModalPerfil && usuarioSeleccionado && (
        <div className="modal-overlay" onClick={cerrarModalPerfil}>
          <div className="modal-perfil-content" onClick={(e) => e.stopPropagation()}>
            {/* Header del Perfil */}
            <div className="perfil-header">
              <div className="perfil-header-info">
                <div className="perfil-avatar">
                  <span>{usuarioSeleccionado.nombre.charAt(0)}</span>
                </div>
                <div className="perfil-datos">
                  <h2>{usuarioSeleccionado.nombre}</h2>
                  <span className="badge-activo">ACTIVO</span>
                  <div className="perfil-detalles">
                    <div className="perfil-detalle-item">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M2.66667 13.3333C2.66667 11.1242 4.45753 9.33333 6.66667 9.33333H9.33333C11.5425 9.33333 13.3333 11.1242 13.3333 13.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      <span>Matrícula: {usuarioSeleccionado.matricula}</span>
                    </div>
                    {usuarioSeleccionado.email && (
                      <div className="perfil-detalle-item">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M2.66667 3.33333H13.3333C14.2538 3.33333 15 4.07952 15 5V11C15 11.9205 14.2538 12.6667 13.3333 12.6667H2.66667C1.74619 12.6667 1 11.9205 1 11V5C1 4.07952 1.74619 3.33333 2.66667 3.33333Z" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M15 5L8 9L1 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <span>Email: {usuarioSeleccionado.email}</span>
                      </div>
                    )}
                    {usuarioSeleccionado.telefono && (
                      <div className="perfil-detalle-item">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M14.6667 11.3067V13.3333C14.6667 13.6869 14.5262 14.0261 14.2761 14.2761C14.0261 14.5262 13.6869 14.6667 13.3333 14.6667C6.55567 14.6667 1.33333 9.44433 1.33333 2.66667C1.33333 2.31305 1.47381 1.97391 1.72386 1.72386C1.97391 1.47381 2.31305 1.33333 2.66667 1.33333H4.69333C5.04695 1.33333 5.38609 1.47381 5.63614 1.72386C5.88619 1.97391 6.02667 2.31305 6.02667 2.66667V4.69333C6.02667 5.04695 5.88619 5.38609 5.63614 5.63614C5.38609 5.88619 5.04695 6.02667 4.69333 6.02667H3.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <span>Teléfono: {usuarioSeleccionado.telefono}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="perfil-header-actions">
                {tabActivoPerfil === 'perfil' && (
                  <button
                    className="btn-edit-profile"
                    onClick={() => setEditandoPerfil(!editandoPerfil)}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M11.333 2.667C11.5084 2.49167 11.7167 2.404 11.958 2.404C12.1993 2.404 12.4077 2.49167 12.583 2.667C12.7584 2.84233 12.846 3.05067 12.846 3.292C12.846 3.53333 12.7584 3.74167 12.583 3.917L5.083 11.417L2.333 12.167L3.083 9.417L10.583 1.917L11.333 2.667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {editandoPerfil ? 'Cancelar' : 'Editar Perfil'}
                  </button>
                )}
                <button
                  className="btn-close-modal"
                  onClick={cerrarModalPerfil}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="perfil-tabs">
              <button
                className={`perfil-tab ${tabActivoPerfil === 'perfil' ? 'active' : ''}`}
                onClick={() => setTabActivoPerfil('perfil')}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M2.66667 13.3333C2.66667 11.1242 4.45753 9.33333 6.66667 9.33333H9.33333C11.5425 9.33333 13.3333 11.1242 13.3333 13.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Perfil
              </button>
              <button
                className={`perfil-tab ${tabActivoPerfil === 'historial' ? 'active' : ''}`}
                onClick={() => setTabActivoPerfil('historial')}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 5V8L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Historial de Préstamos
              </button>
            </div>

            {/* Contenido de los Tabs */}
            <div className="perfil-tab-content">
              {tabActivoPerfil === 'perfil' && (
                <div className="perfil-form-section">
                  {editandoPerfil ? (
                    <form onSubmit={handleGuardarPerfil}>
                      <div className="form-group">
                        <label>Nombre Completo *</label>
                        <input
                          type="text"
                          value={formDataEdicion.nombre}
                          onChange={(e) => setFormDataEdicion({ ...formDataEdicion, nombre: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Matrícula *</label>
                        <input
                          type="text"
                          value={formDataEdicion.matricula}
                          onChange={(e) => setFormDataEdicion({ ...formDataEdicion, matricula: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Email</label>
                          <input
                            type="email"
                            value={formDataEdicion.email}
                            onChange={(e) => setFormDataEdicion({ ...formDataEdicion, email: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label>Teléfono</label>
                          <input
                            type="tel"
                            value={formDataEdicion.telefono}
                            onChange={(e) => setFormDataEdicion({ ...formDataEdicion, telefono: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="modal-actions">
                        <button
                          type="button"
                          onClick={() => setEditandoPerfil(false)}
                          className="btn-secondary"
                        >
                          Cancelar
                        </button>
                        <button type="submit" className="btn-primary">
                          Guardar Cambios
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="perfil-view-mode">
                      <h3 className="perfil-section-title">Datos Personales</h3>
                      <div className="perfil-details-list">
                        <div className="perfil-detail-row">
                          <span className="perfil-detail-label">Nombre Completo:</span>
                          <span className="perfil-detail-value">{usuarioSeleccionado.nombre}</span>
                        </div>
                        <div className="perfil-detail-row">
                          <span className="perfil-detail-label">Matrícula:</span>
                          <span className="perfil-detail-value">{usuarioSeleccionado.matricula}</span>
                        </div>
                        {usuarioSeleccionado.email && (
                          <div className="perfil-detail-row">
                            <span className="perfil-detail-label">Email:</span>
                            <span className="perfil-detail-value">{usuarioSeleccionado.email}</span>
                          </div>
                        )}
                        {usuarioSeleccionado.telefono && (
                          <div className="perfil-detail-row">
                            <span className="perfil-detail-label">Teléfono:</span>
                            <span className="perfil-detail-value">{usuarioSeleccionado.telefono}</span>
                          </div>
                        )}
                        <div className="perfil-detail-row">
                          <span className="perfil-detail-label">Fecha de Registro:</span>
                          <span className="perfil-detail-value">
                            {new Date(usuarioSeleccionado.created_at).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {tabActivoPerfil === 'historial' && (
                <div className="historial-section">
                  <div className="historial-header">
                    <h3>Registros de Préstamos de Equipos</h3>
                  </div>
                  {prestamosUsuario.length > 0 ? (
                    <div className="historial-table-container">
                      <table className="historial-table">
                        <thead>
                          <tr>
                            <th>Fecha Préstamo</th>
                            <th>Equipo</th>
                            <th>Fecha Devolución Esperada</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {prestamosUsuario.map((prestamo) => (
                            <tr key={prestamo.id}>
                              <td>{new Date(prestamo.fecha_prestamo).toLocaleDateString()}</td>
                              <td>
                                <div className="equipo-info-cell">
                                  <span className="equipo-nombre">{prestamo.equipo_nombre}</span>
                                  <span className="equipo-codigo">({prestamo.equipo_codigo})</span>
                                </div>
                              </td>
                              <td>{new Date(prestamo.fecha_devolucion_esperada).toLocaleDateString()}</td>
                              <td>
                                <span className={`badge badge-${getEstadoBadgeClass(prestamo.estado)}`}>
                                  {getEstadoLabel(prestamo.estado)}
                                </span>
                              </td>
                              <td>
                                {prestamo.estado === 'activo' && (
                                  <button className="btn-view-details">Ver detalles</button>
                                )}
                                {prestamo.estado === 'completado' && (
                                  <button className="btn-view-receipt">Recibo</button>
                                )}
                                {prestamo.estado === 'vencido' && (
                                  <button className="btn-send-alert">Enviar Alerta</button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="empty-historial">
                      <p>No hay préstamos registrados para este usuario</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;
