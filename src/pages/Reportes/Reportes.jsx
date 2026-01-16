import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import './Reportes.css';

const Reportes = () => {
  const [reportes, setReportes] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [formData, setFormData] = useState({
    equipo_id: '',
    tipo_reporte: '',
    descripcion: '',
    fecha_incidente: '',
    observaciones: '',
    evidencia: null
  });
  const [evidenciaPreview, setEvidenciaPreview] = useState(null);
  const [mensajeExito, setMensajeExito] = useState(null);
  const [mensajeError, setMensajeError] = useState(null);
  const [menuAbiertoId, setMenuAbiertoId] = useState(null);

  useEffect(() => {
    cargarReportes();
    cargarEquipos();
  }, []);

  const cargarReportes = async () => {
    try {
      setLoading(true);
      const response = await api.listarReportes();
      if (response.success) {
        setReportes(response.data || []);
      }
    } catch (error) {
      console.error('Error al cargar reportes:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarEquipos = async () => {
    try {
      const response = await api.listarEquipos();
      if (response.success) {
        setEquipos(response.data || []);
      }
    } catch (error) {
      console.error('Error al cargar equipos:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (mensajeExito) setMensajeExito(null);
    if (mensajeError) setMensajeError(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMensajeError('El archivo es demasiado grande. Máximo 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setMensajeError('Solo se permiten archivos de imagen');
        return;
      }

      setFormData({
        ...formData,
        evidencia: file
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        setEvidenciaPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.equipo_id) {
      setMensajeError('Por favor selecciona un equipo');
      return;
    }

    if (!formData.tipo_reporte) {
      setMensajeError('Por favor selecciona el tipo de reporte');
      return;
    }

    if (!formData.descripcion.trim()) {
      setMensajeError('Por favor describe el problema');
      return;
    }

    if (!formData.fecha_incidente) {
      setMensajeError('Por favor indica la fecha del incidente');
      return;
    }

    try {
      setEnviando(true);
      setMensajeError(null);

      let evidenciaBase64 = null;
      if (formData.evidencia) {
        evidenciaBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(formData.evidencia);
        });
      }

      const reporteData = {
        equipo_id: formData.equipo_id,
        tipo_reporte: formData.tipo_reporte,
        descripcion: formData.descripcion,
        fecha_incidente: formData.fecha_incidente,
        observaciones: formData.observaciones || '',
        evidencia: evidenciaBase64
      };

      const response = await api.crearReporte(reporteData);

      if (response.success) {
        setMensajeExito('Reporte enviado exitosamente');
        setFormData({
          equipo_id: '',
          tipo_reporte: '',
          descripcion: '',
          fecha_incidente: '',
          observaciones: '',
          evidencia: null
        });
        setEvidenciaPreview(null);
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
        setMostrarFormulario(false);
        cargarReportes();
      } else {
        setMensajeError(response.message || 'Error al enviar el reporte');
      }
    } catch (error) {
      console.error('Error al enviar reporte:', error);
      setMensajeError(error.message || 'Error al enviar el reporte. Por favor intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  const actualizarEstadoReporte = async (reporteId, nuevoEstado) => {
    try {
      const response = await api.actualizarEstadoReporte(reporteId, nuevoEstado);
      if (response.success) {
        cargarReportes();
        setMenuAbiertoId(null);
        setMensajeExito('Reporte marcado como atendido');
        setTimeout(() => setMensajeExito(null), 3000);
      } else {
        setMensajeError(response.message || 'Error al actualizar el reporte');
      }
    } catch (error) {
      console.error('Error al actualizar reporte:', error);
      setMensajeError('Error al actualizar el estado del reporte');
    }
  };

  const toggleMenu = (reporteId, event) => {
    event.stopPropagation();
    setMenuAbiertoId(menuAbiertoId === reporteId ? null : reporteId);
  };

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuAbiertoId && !event.target.closest('.acciones-menu-wrapper') && !event.target.closest('.acciones-menu')) {
        setMenuAbiertoId(null);
      }
    };

    if (menuAbiertoId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuAbiertoId]);

  const getTipoReporteLabel = (tipo) => {
    const tipos = {
      dañado: 'Dañado',
      maltratado: 'Maltratado',
      perdido: 'Perdido',
      extraviado: 'Extraviado',
      fuera_de_uso: 'Fuera de Uso'
    };
    return tipos[tipo] || tipo;
  };

  const getEstadoBadgeClass = (estado) => {
    const estados = {
      pendiente: 'warning',
      resuelto: 'success',
      rechazado: 'danger'
    };
    return estados[estado] || 'warning';
  };

  const getEstadoLabel = (estado) => {
    const estados = {
      pendiente: 'Pendiente',
      resuelto: 'Atendido',
      rechazado: 'Rechazado'
    };
    return estados[estado] || estado;
  };

  const limpiarFormulario = () => {
    setFormData({
      equipo_id: '',
      tipo_reporte: '',
      descripcion: '',
      fecha_incidente: '',
      observaciones: '',
      evidencia: null
    });
    setEvidenciaPreview(null);
    setMensajeExito(null);
    setMensajeError(null);
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  if (loading) {
    return <div className="loading">Cargando reportes...</div>;
  }

  return (
    <div className="reportes">
      <div className="reportes-header">
        <div className="header-content">
          <h1>Reportes de Equipos</h1>
          <p className="header-subtitle">
            Gestiona los reportes de equipos dañados, maltratados, perdidos, extraviados o fuera de uso.
          </p>
        </div>
        <button
          className="btn-nuevo-reporte"
          onClick={() => {
            setMostrarFormulario(!mostrarFormulario);
            if (mostrarFormulario) {
              limpiarFormulario();
            }
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {mostrarFormulario ? 'Cancelar' : ' Nuevo Reporte'}
        </button>
      </div>

      {/* Mensajes globales */}
      {mensajeExito && (
        <div className="mensaje mensaje-exito">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="currentColor" strokeWidth="2" />
            <path d="M7 10L9 12L13 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {mensajeExito}
        </div>
      )}

      {mensajeError && (
        <div className="mensaje mensaje-error">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="currentColor" strokeWidth="2" />
            <path d="M10 6V10M10 14H10.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {mensajeError}
        </div>
      )}

      {/* Formulario desplegable */}
      {mostrarFormulario && (
        <div className="reporte-form-container">
          <form className="reporte-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="equipo_id">
                Equipo a Reportar <span className="required">*</span>
              </label>
              <select
                id="equipo_id"
                name="equipo_id"
                value={formData.equipo_id}
                onChange={handleInputChange}
                required
                className="form-select"
              >
                <option value="">Selecciona un equipo</option>
                {equipos.map((equipo) => (
                  <option key={equipo.id} value={equipo.id}>
                    {equipo.codigo} - {equipo.nombre} ({equipo.marca} {equipo.modelo})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="tipo_reporte">
                Tipo de Reporte <span className="required">*</span>
              </label>
              <select
                id="tipo_reporte"
                name="tipo_reporte"
                value={formData.tipo_reporte}
                onChange={handleInputChange}
                required
                className="form-select"
              >
                <option value="">Selecciona el tipo de reporte</option>
                <option value="dañado">Dañado</option>
                <option value="maltratado">Maltratado</option>
                <option value="perdido">Perdido</option>
                <option value="extraviado">Extraviado</option>
                <option value="fuera_de_uso">Fuera de Uso</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="fecha_incidente">
                Fecha del Incidente <span className="required">*</span>
              </label>
              <input
                type="date"
                id="fecha_incidente"
                name="fecha_incidente"
                value={formData.fecha_incidente}
                onChange={handleInputChange}
                required
                className="form-input"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label htmlFor="descripcion">
                Descripción del Problema <span className="required">*</span>
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                required
                rows="5"
                className="form-textarea"
                placeholder="Describe detalladamente el problema o situación del equipo..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="observaciones">Observaciones Adicionales</label>
              <textarea
                id="observaciones"
                name="observaciones"
                value={formData.observaciones}
                onChange={handleInputChange}
                rows="3"
                className="form-textarea"
                placeholder="Información adicional que consideres relevante..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="evidencia">Evidencia (Opcional)</label>
              <div
                className="file-upload-wrapper"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.add('drag-over');
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.remove('drag-over');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.remove('drag-over');
                  const file = e.dataTransfer.files[0];
                  if (file) {
                    const fakeEvent = { target: { files: [file] } };
                    handleFileChange(fakeEvent);
                  }
                }}
              >
                <input
                  type="file"
                  id="evidencia"
                  name="evidencia"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                />
                <label htmlFor="evidencia" className="file-label">
                  <svg width="32" height="32" viewBox="0 0 20 20" fill="none">
                    <path d="M10 3V17M3 10H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span>{formData.evidencia ? formData.evidencia.name : 'Arrastra una imagen aquí o haz clic para seleccionar'}</span>
                </label>
              </div>
              {evidenciaPreview && (
                <div className="evidencia-preview">
                  <img src={evidenciaPreview} alt="Preview" />
                  <button
                    type="button"
                    onClick={() => {
                      setEvidenciaPreview(null);
                      setFormData({ ...formData, evidencia: null });
                      const fileInput = document.querySelector('input[type="file"]');
                      if (fileInput) fileInput.value = '';
                    }}
                    className="remove-image-btn"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              )}
              <p className="file-hint">Máximo 5MB. Formatos: JPG, PNG, GIF</p>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => {
                  setMostrarFormulario(false);
                  limpiarFormulario();
                }}
                className="btn-secondary"
                disabled={enviando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={enviando}
              >
                {enviando ? (
                  <>
                    <svg className="spinner" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2" strokeDasharray="43.98" strokeDashoffset="10.99" strokeLinecap="round" />
                    </svg>
                    Enviando...
                  </>
                ) : (
                  'Enviar Reporte'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Historial de Reportes */}
      <div className="reportes-historial">
        <h2>Historial de Reportes</h2>
        {reportes.length > 0 ? (
          <div className="table-container">
            <table className="reportes-table">
              <thead>
                <tr>
                  <th>Equipo</th>
                  <th>Tipo</th>
                  <th>Fecha Incidente</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th>Fecha Reporte</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reportes.map((reporte) => (
                  <tr key={reporte.id}>
                    <td>
                      <div className="equipo-info">
                        <span className="equipo-codigo">{reporte.equipo_codigo}</span>
                        <span className="equipo-nombre">{reporte.equipo_nombre}</span>
                      </div>
                    </td>
                    <td>{getTipoReporteLabel(reporte.tipo_reporte)}</td>
                    <td>{new Date(reporte.fecha_incidente).toLocaleDateString()}</td>
                    <td className="descripcion-cell">
                      <div className="descripcion-text" title={reporte.descripcion}>
                        {reporte.descripcion.length > 50
                          ? reporte.descripcion.substring(0, 50) + '...'
                          : reporte.descripcion}
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${getEstadoBadgeClass(reporte.estado)}`}>
                        {getEstadoLabel(reporte.estado)}
                      </span>
                    </td>
                    <td>{new Date(reporte.created_at).toLocaleDateString()}</td>
                    <td>
                      {reporte.estado !== 'resuelto' && (
                        <div className="acciones-menu-wrapper">
                          <button
                            onClick={(e) => toggleMenu(reporte.id, e)}
                            className="btn-acciones"
                            title="Acciones"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            Acciones
                          </button>
                          {menuAbiertoId === reporte.id && (
                            <div className="acciones-menu">
                              <button
                                onClick={() => actualizarEstadoReporte(reporte.id, 'resuelto')}
                                className="accion-item"
                              >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                  <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Atendido
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>No hay reportes registrados</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reportes;
