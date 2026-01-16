import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import './Configuracion.css';

const Configuracion = () => {
  const [loading, setLoading] = useState(false);
  const [cargandoAdmins, setCargandoAdmins] = useState(true);
  const [administradores, setAdministradores] = useState([]);
  const [mostrarModalAdmin, setMostrarModalAdmin] = useState(false);
  const [editandoAdmin, setEditandoAdmin] = useState(null);
  const [mensajeExito, setMensajeExito] = useState(null);
  const [mensajeError, setMensajeError] = useState(null);
  const [configuracion, setConfiguracion] = useState({
    nombre_laboratorio: 'iOS Development Lab',
    email_contacto: 'labios@university.edu',
    telefono_contacto: '',
    dias_prestamo_default: 7,
    notificaciones_email: true,
    notificaciones_sistema: true
  });
  const [formAdmin, setFormAdmin] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'admin'
  });

  useEffect(() => {
    cargarAdministradores();
  }, []);

  const cargarAdministradores = async () => {
    try {
      setCargandoAdmins(true);
      const response = await api.listarAdministradores();
      if (response.success) {
        setAdministradores(response.data || []);
      }
    } catch (error) {
      console.error('Error al cargar administradores:', error);
      setMensajeError('Error al cargar la lista de administradores');
    } finally {
      setCargandoAdmins(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfiguracion({
      ...configuracion,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleAdminInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormAdmin({
      ...formAdmin,
      [name]: type === 'checkbox' ? checked : value
    });
    if (mensajeExito) setMensajeExito(null);
    if (mensajeError) setMensajeError(null);
  };

  const abrirModalAdmin = (admin = null) => {
    if (admin) {
      setEditandoAdmin(admin);
      setFormAdmin({
        nombre: admin.nombre,
        email: admin.email,
        password: '',
        rol: admin.rol || 'admin'
      });
    } else {
      setEditandoAdmin(null);
      setFormAdmin({
        nombre: '',
        email: '',
        password: '',
        rol: 'admin'
      });
    }
    setMostrarModalAdmin(true);
  };

  const cerrarModalAdmin = () => {
    setMostrarModalAdmin(false);
    setEditandoAdmin(null);
    setFormAdmin({
      nombre: '',
      email: '',
      password: '',
      rol: 'admin'
    });
  };

  const handleSubmitAdmin = async (e) => {
    e.preventDefault();
    
    if (!formAdmin.nombre || !formAdmin.email) {
      setMensajeError('Nombre y email son requeridos');
      return;
    }
    
    if (!editandoAdmin && !formAdmin.password) {
      setMensajeError('La contraseña es requerida para nuevos administradores');
      return;
    }

    try {
      setLoading(true);
      setMensajeError(null);
      
      const adminData = {
        nombre: formAdmin.nombre,
        email: formAdmin.email,
        rol: formAdmin.rol
      };
      
      if (formAdmin.password) {
        adminData.password = formAdmin.password;
      }

      let response;
      if (editandoAdmin) {
        response = await api.actualizarAdministrador(editandoAdmin.id, adminData);
      } else {
        response = await api.crearAdministrador(adminData);
      }
      
      if (response.success) {
        setMensajeExito(editandoAdmin ? 'Administrador actualizado exitosamente' : 'Administrador creado exitosamente');
        cerrarModalAdmin();
        cargarAdministradores();
        setTimeout(() => setMensajeExito(null), 3000);
      } else {
        setMensajeError(response.message || 'Error al guardar el administrador');
      }
    } catch (error) {
      console.error('Error al guardar administrador:', error);
      setMensajeError(error.message || 'Error al guardar el administrador');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarAdmin = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este administrador?')) {
      return;
    }

    try {
      const response = await api.eliminarAdministrador(id);
      if (response.success) {
        setMensajeExito('Administrador eliminado exitosamente');
        cargarAdministradores();
        setTimeout(() => setMensajeExito(null), 3000);
      } else {
        setMensajeError(response.message || 'Error al eliminar el administrador');
      }
    } catch (error) {
      console.error('Error al eliminar administrador:', error);
      setMensajeError('Error al eliminar el administrador');
    }
  };

  const getRolLabel = (rol) => {
    const roles = {
      super_admin: 'Super Administrador',
      admin: 'Administrador',
      viewer: 'Solo Lectura'
    };
    return roles[rol] || rol;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensajeError(null);
    setMensajeExito(null);

    try {
      // Aquí puedes agregar la lógica para guardar la configuración
      // Por ahora simulamos el guardado
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMensajeExito('Configuración guardada exitosamente');
      setTimeout(() => setMensajeExito(null), 3000);
    } catch (error) {
      setMensajeError('Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="configuracion">
      <div className="configuracion-header">
        <div className="header-content">
          <h1>Configuración</h1>
          <p className="header-subtitle">
            Administra la configuración general del sistema y las preferencias.
          </p>
        </div>
      </div>

      {/* Mensajes */}
      {mensajeExito && (
        <div className="mensaje mensaje-exito">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M7 10L9 12L13 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {mensajeExito}
        </div>
      )}

      {mensajeError && (
        <div className="mensaje mensaje-error">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M10 6V10M10 14H10.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          {mensajeError}
        </div>
      )}

      <div className="configuracion-content">
        {/* Sección de Administradores */}
        <div className="config-section">
          <div className="section-header-with-button">
            <h2>Administradores</h2>
            <button
              type="button"
              className="btn-nuevo-admin"
              onClick={() => abrirModalAdmin()}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Agregar Nuevo Administrador
            </button>
          </div>
          
          {cargandoAdmins ? (
            <div className="loading">Cargando administradores...</div>
          ) : (
            <div className="table-container">
              <table className="administradores-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Nombre</th>
                    <th>Rol</th>
                    <th>Último Login</th>
                    <th>Puede Editar</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {administradores.length > 0 ? (
                    administradores.map((admin) => (
                      <tr key={admin.id}>
                        <td>{admin.email}</td>
                        <td>{admin.nombre}</td>
                        <td>
                          <span className={`badge badge-rol badge-${admin.rol}`}>
                            {getRolLabel(admin.rol)}
                          </span>
                        </td>
                        <td>
                          {admin.ultimo_login 
                            ? new Date(admin.ultimo_login).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'Nunca'}
                        </td>
                        <td>
                          <span className={`badge ${admin.puede_editar === 1 || admin.puede_editar === true ? 'badge-success' : 'badge-danger'}`}>
                            {admin.puede_editar === 1 || admin.puede_editar === true ? 'Sí' : 'No'}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              onClick={() => abrirModalAdmin(admin)}
                              className="action-btn edit-btn"
                              title="Editar"
                            >
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M11.333 2.667C11.5084 2.49167 11.7167 2.404 11.958 2.404C12.1993 2.404 12.4077 2.49167 12.583 2.667C12.7584 2.84233 12.846 3.05067 12.846 3.292C12.846 3.53333 12.7584 3.74167 12.583 3.917L5.083 11.417L2.333 12.167L3.083 9.417L10.583 1.917L11.333 2.667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            <button
                              onClick={() => handleEliminarAdmin(admin.id)}
                              className="action-btn delete-btn"
                              title="Eliminar"
                            >
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="empty-state-cell">
                        No hay administradores registrados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <form className="configuracion-form" onSubmit={handleSubmit}>
          {/* Información General */}
          <div className="config-section">
            <h2>Información General</h2>
            <div className="form-group">
              <label htmlFor="nombre_laboratorio">Nombre del Laboratorio</label>
              <input
                type="text"
                id="nombre_laboratorio"
                name="nombre_laboratorio"
                value={configuracion.nombre_laboratorio}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email_contacto">Email de Contacto</label>
                <input
                  type="email"
                  id="email_contacto"
                  name="email_contacto"
                  value={configuracion.email_contacto}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="telefono_contacto">Teléfono de Contacto</label>
                <input
                  type="tel"
                  id="telefono_contacto"
                  name="telefono_contacto"
                  value={configuracion.telefono_contacto}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Configuración de Préstamos */}
          <div className="config-section">
            <h2>Configuración de Préstamos</h2>
            <div className="form-group">
              <label htmlFor="dias_prestamo_default">Días de Préstamo por Defecto</label>
              <input
                type="number"
                id="dias_prestamo_default"
                name="dias_prestamo_default"
                value={configuracion.dias_prestamo_default}
                onChange={handleInputChange}
                min="1"
                max="30"
                className="form-input form-input-small"
              />
              <p className="form-hint">Número de días que se prestará un equipo por defecto</p>
            </div>
          </div>

          {/* Notificaciones */}
          <div className="config-section">
            <h2>Notificaciones</h2>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="notificaciones_email"
                  checked={configuracion.notificaciones_email}
                  onChange={handleInputChange}
                  className="checkbox-input"
                />
                <span>Enviar notificaciones por email</span>
              </label>
            </div>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="notificaciones_sistema"
                  checked={configuracion.notificaciones_sistema}
                  onChange={handleInputChange}
                  className="checkbox-input"
                />
                <span>Mostrar notificaciones en el sistema</span>
              </label>
            </div>
          </div>

          {/* Botones */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="spinner" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2" strokeDasharray="43.98" strokeDashoffset="10.99" strokeLinecap="round"/>
                  </svg>
                  Guardando...
                </>
              ) : (
                'Guardar Configuración'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Administrador */}
      {mostrarModalAdmin && (
        <div className="modal-overlay" onClick={cerrarModalAdmin}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editandoAdmin ? 'Editar Administrador' : 'Nuevo Administrador'}</h2>
            <form onSubmit={handleSubmitAdmin}>
              <div className="form-group">
                <label htmlFor="admin_nombre">
                  Nombre Completo <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="admin_nombre"
                  name="nombre"
                  value={formAdmin.nombre}
                  onChange={handleAdminInputChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="admin_email">
                  Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="admin_email"
                  name="email"
                  value={formAdmin.email}
                  onChange={handleAdminInputChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="admin_password">
                  {editandoAdmin ? 'Nueva Contraseña (dejar vacío para mantener)' : 'Contraseña'} 
                  {!editandoAdmin && <span className="required">*</span>}
                </label>
                <input
                  type="password"
                  id="admin_password"
                  name="password"
                  value={formAdmin.password}
                  onChange={handleAdminInputChange}
                  required={!editandoAdmin}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="admin_rol">Rol</label>
                <select
                  id="admin_rol"
                  name="rol"
                  value={formAdmin.rol}
                  onChange={handleAdminInputChange}
                  className="form-select"
                >
                  <option value="super_admin">Super Administrador</option>
                  <option value="admin">Administrador</option>
                  <option value="viewer">Solo Lectura</option>
                </select>
                <p className="form-hint">
                  Nota: Solo el Super Administrador y el Administrador pueden editar.
                </p>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={cerrarModalAdmin}
                  className="btn-secondary"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="spinner" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2" strokeDasharray="43.98" strokeDashoffset="10.99" strokeLinecap="round"/>
                      </svg>
                      Guardando...
                    </>
                  ) : (
                    editandoAdmin ? 'Actualizar' : 'Crear'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Configuracion;
