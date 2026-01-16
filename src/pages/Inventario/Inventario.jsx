import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import './Inventario.css';
import '../../styles/shared/shared-search.css';

const Inventario = () => {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buscarEquipo, setBuscarEquipo] = useState('');
  const [tabActivo, setTabActivo] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(10);
  const [categoriasDisponibles, setCategoriasDisponibles] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [mostrarModalHistorial, setMostrarModalHistorial] = useState(false);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const [historialEquipo, setHistorialEquipo] = useState([]);
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    tipo: '',
    marca: '',
    modelo: '',
    descripcion: ''
  });

  useEffect(() => {
    cargarEquipos(true);
  }, [filtroEstado, filtroCategoria, tabActivo]);

  // Debounce para la búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      cargarEquipos(false); // No mostrar loading durante la búsqueda
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [buscarEquipo]);

  const cargarEquipos = async (mostrarLoading = true) => {
    try {
      if (mostrarLoading) {
        setLoading(true);
      }
      // Determinar el estado según el tab activo o filtro manual
      let estadoFiltro = filtroEstado;
      if (!estadoFiltro && tabActivo !== 'todos') {
        if (tabActivo === 'disponible') estadoFiltro = 'disponible';
        else if (tabActivo === 'prestado') estadoFiltro = 'prestado';
        else if (tabActivo === 'mantenimiento') estadoFiltro = 'mantenimiento';
      }
      
      const response = await api.listarEquipos(estadoFiltro || null, buscarEquipo || '');
      if (response.success) {
        let equiposFiltrados = response.data;
        
        // Filtrar por categoría si está seleccionada (normalizando categorías)
        if (filtroCategoria) {
          equiposFiltrados = equiposFiltrados.filter(e => {
            // Normalizar categorías antiguas
            const tipoNormalizado = e.tipo === 'Periférico' ? 'Periféricos' : 
                                   (e.tipo === 'Tablet' || e.tipo === 'Ipad') ? 'iPad' : e.tipo;
            return tipoNormalizado === filtroCategoria;
          });
        }
        
        setEquipos(equiposFiltrados);
      }
    } catch (error) {
      console.error('Error al cargar equipos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.crearEquipo(formData);
      if (response.success) {
        setMostrarModal(false);
        setFormData({
          codigo: '',
          nombre: '',
          tipo: '',
          marca: '',
          modelo: '',
          descripcion: ''
        });
        cargarEquipos(true);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      const response = await api.actualizarEstadoEquipo(id, nuevoEstado);
      if (response.success) {
        cargarEquipos(true);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEditar = (equipo) => {
    setEquipoSeleccionado(equipo);
    setFormData({
      codigo: equipo.codigo,
      nombre: equipo.nombre,
      tipo: equipo.tipo,
      marca: equipo.marca || '',
      modelo: equipo.modelo || '',
      descripcion: equipo.descripcion || ''
    });
    setMostrarModalEditar(true);
  };

  const handleVerHistorial = async (equipo) => {
    setEquipoSeleccionado(equipo);
    // Por ahora, simulamos el historial. En el futuro se puede obtener de la API
    setHistorialEquipo([
      { fecha: equipo.created_at, accion: 'Equipo registrado', usuario: 'Sistema' },
      { fecha: equipo.updated_at || equipo.created_at, accion: 'Última actualización', usuario: 'Sistema' }
    ]);
    setMostrarModalHistorial(true);
  };

  const exportarInventario = () => {
    // Crear CSV con formato mejorado para Excel
    const headers = ['ID', 'Nombre', 'Categoría', 'Marca', 'Modelo', 'Número de Serie', 'Estado', 'Descripción'];
    
    // Función para escapar valores CSV correctamente
    const escapeCSV = (value) => {
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      // Si contiene comas, comillas o saltos de línea, envolver en comillas y escapar comillas internas
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const rows = equipos.map(equipo => [
      escapeCSV(equipo.codigo),
      escapeCSV(equipo.nombre),
      escapeCSV(equipo.tipo),
      escapeCSV(equipo.marca),
      escapeCSV(equipo.modelo),
      escapeCSV(equipo.numero_serie),
      escapeCSV(equipo.estado),
      escapeCSV(equipo.descripcion)
    ]);

    // Crear contenido CSV con separador de punto y coma para mejor compatibilidad con Excel
    // Excel en español usa punto y coma como separador por defecto
    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.join(';'))
    ].join('\r\n'); // Usar \r\n para mejor compatibilidad con Excel en Windows

    // Agregar BOM UTF-8 para Excel (permite que Excel reconozca UTF-8 correctamente)
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const fecha = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `Inventario_LabIOS_${fecha}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGuardarEdicion = async (e) => {
    e.preventDefault();
    if (!equipoSeleccionado) return;
    
    try {
      // Actualizar estado si cambió
      if (equipoSeleccionado.estado !== formData.estado) {
        await api.actualizarEstadoEquipo(equipoSeleccionado.id, equipoSeleccionado.estado);
      }
      // TODO: En el futuro crear un endpoint para actualizar todos los campos del equipo
      // Por ahora solo actualizamos el estado
      setMostrarModalEditar(false);
      setEquipoSeleccionado(null);
      setFormData({
        codigo: '',
        nombre: '',
        tipo: '',
        marca: '',
        modelo: '',
        descripcion: ''
      });
        cargarEquipos(true);
      alert('Equipo actualizado exitosamente');
    } catch (error) {
      alert('Error al actualizar equipo: ' + error.message);
    }
  };

  const getEstadoBadgeClass = (estado) => {
    const estados = {
      disponible: 'success',
      prestado: 'warning',
      mantenimiento: 'info',
      baja: 'danger'
    };
    return estados[estado] || '';
  };

  const getEstadoLabel = (estado) => {
    const labels = {
      disponible: 'Disponible',
      prestado: 'Prestado',
      mantenimiento: 'Mantenimiento',
      baja: 'Dañado'
    };
    return labels[estado] || estado;
  };

  const getEquipoIcon = (tipo) => {
    if (!tipo) {
      // Icono por defecto si no hay tipo
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="5" width="16" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <rect x="6" y="8" width="12" height="7" rx="0.5" fill="currentColor" opacity="0.2"/>
          <path d="M8 19H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M10 21H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
    }
    
    // Normalizar el tipo: convertir a minúsculas y manejar variaciones
    const tipoNormalizado = tipo.toLowerCase().trim();
    
    if (tipoNormalizado === 'desktop') {
      // Icono de computadora desktop
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <rect x="5" y="7" width="14" height="8" rx="0.5" fill="currentColor" opacity="0.2"/>
          <path d="M8 16H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M10 19H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <rect x="11" y="19" width="2" height="2" rx="0.5" fill="currentColor" opacity="0.3"/>
        </svg>
      );
    } else if (tipoNormalizado === 'laptop') {
      // Icono de laptop
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="6" width="18" height="11" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <rect x="5" y="9" width="14" height="7" rx="0.5" fill="currentColor" opacity="0.2"/>
          <path d="M2 17H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <rect x="10" y="17" width="4" height="1.5" rx="0.3" fill="currentColor" opacity="0.3"/>
        </svg>
      );
    } else if (tipoNormalizado === 'ipad' || tipoNormalizado === 'tablet') {
      // Icono de tablet/iPad
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="6" y="3" width="12" height="18" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <rect x="8" y="6" width="8" height="12" rx="0.5" fill="currentColor" opacity="0.2"/>
          <circle cx="12" cy="20" r="1" fill="currentColor" opacity="0.5"/>
        </svg>
      );
    } else if (tipoNormalizado === 'periféricos' || tipoNormalizado === 'periférico' || tipoNormalizado.includes('perif')) {
      // Icono de lápiz (Apple Pencil)
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M18.5 2.5L21.5 5.5L19 8L16 5L18.5 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 5L19 8L8 19L5 16L16 5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5 16L8 19L3 21L5 16Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 5L19 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
    } else {
      // Icono por defecto (monitor)
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="5" width="16" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <rect x="6" y="8" width="12" height="7" rx="0.5" fill="currentColor" opacity="0.2"/>
          <path d="M8 19H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M10 21H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
    }
  };

  // Paginación
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const indiceFin = indiceInicio + itemsPorPagina;
  const equiposPaginados = equipos.slice(indiceInicio, indiceFin);
  const totalPaginas = Math.ceil(equipos.length / itemsPorPagina);

  // Cargar categorías disponibles al montar el componente
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const response = await api.listarEquipos(null, '');
        if (response.success) {
          const categoriasUnicas = [...new Set(response.data.map(e => e.tipo).filter(Boolean))];
          // Normalizar categorías: convertir "Periférico" a "Periféricos" y "Tablet"/"Ipad" a "iPad"
          const categoriasNormalizadas = categoriasUnicas.map(cat => {
            if (cat === 'Periférico') return 'Periféricos';
            if (cat === 'Tablet' || cat === 'Ipad') return 'iPad';
            return cat;
          });
          // Eliminar duplicados después de normalizar
          const categoriasUnicasNormalizadas = [...new Set(categoriasNormalizadas)];
          // Ordenar según el orden especificado: Desktop, Laptop, Periféricos, iPad
          const ordenCategorias = ['Desktop', 'Laptop', 'Periféricos', 'iPad'];
          const categoriasOrdenadas = categoriasUnicasNormalizadas.sort((a, b) => {
            const indexA = ordenCategorias.indexOf(a);
            const indexB = ordenCategorias.indexOf(b);
            if (indexA === -1 && indexB === -1) return a.localeCompare(b);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
          });
          setCategoriasDisponibles(categoriasOrdenadas);
        }
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      }
    };
    cargarCategorias();
  }, []);

  if (loading) {
    return <div className="loading">Cargando inventario...</div>;
  }

  return (
    <div className="inventario">
      {/* Header */}
      <div className="inventario-header">
        <div className="header-content">
          <h1>Inventario de Equipos</h1>
          <p className="header-subtitle">Gestiona y rastrea los activos del laboratorio, su estado e historial de mantenimiento.</p>
        </div>
        <button onClick={() => setMostrarModal(true)} className="btn-add-equipment">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Agregar Nuevo Equipo
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="search-section">
        <div className="search-wrapper">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="search-icon">
            <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M13 13L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar por código, nombre, tipo, marca o modelo..."
            className="search-input"
            value={buscarEquipo}
            onChange={(e) => {
              setBuscarEquipo(e.target.value);
              setPaginaActual(1);
            }}
          />
          {buscarEquipo && (
            <button 
              className="clear-search-btn"
              onClick={() => {
                setBuscarEquipo('');
                setPaginaActual(1);
              }}
              title="Limpiar búsqueda"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="inventario-tabs">
        <button 
          className={`tab-item ${tabActivo === 'todos' ? 'active' : ''}`}
          onClick={() => {
            setTabActivo('todos');
            setFiltroEstado('');
            setPaginaActual(1);
          }}
        >
          Todos los Items
        </button>
        <button 
          className={`tab-item ${tabActivo === 'disponible' ? 'active' : ''}`}
          onClick={() => {
            setTabActivo('disponible');
            setFiltroEstado('disponible');
            setPaginaActual(1);
          }}
        >
          Disponible
        </button>
        <button 
          className={`tab-item ${tabActivo === 'prestado' ? 'active' : ''}`}
          onClick={() => {
            setTabActivo('prestado');
            setFiltroEstado('prestado');
            setPaginaActual(1);
          }}
        >
          Prestado
        </button>
        <button 
          className={`tab-item ${tabActivo === 'mantenimiento' ? 'active' : ''}`}
          onClick={() => {
            setTabActivo('mantenimiento');
            setFiltroEstado('mantenimiento');
            setPaginaActual(1);
          }}
        >
          En Mantenimiento
        </button>
      </div>

      {/* Filtros */}
      <div className="filters-section">
        <span className="filter-label">FILTRAR POR:</span>
        <select
          value={filtroCategoria}
          onChange={(e) => {
            setFiltroCategoria(e.target.value);
            setPaginaActual(1); // Resetear a primera página al cambiar filtro
          }}
          className="filter-dropdown"
        >
          <option value="">Todas las Categorías</option>
          {categoriasDisponibles.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={filtroEstado}
          onChange={(e) => {
            setFiltroEstado(e.target.value);
            setPaginaActual(1); // Resetear a primera página al cambiar filtro
            // Si se selecciona un estado manualmente, cambiar el tab
            if (e.target.value === 'disponible') setTabActivo('disponible');
            else if (e.target.value === 'prestado') setTabActivo('prestado');
            else if (e.target.value === 'mantenimiento') setTabActivo('mantenimiento');
            else if (e.target.value === '') setTabActivo('todos');
          }}
          className="filter-dropdown"
        >
          <option value="">Todos los Estados</option>
          <option value="disponible">Disponible</option>
          <option value="prestado">Prestado</option>
          <option value="mantenimiento">Mantenimiento</option>
          <option value="baja">Dañado</option>
        </select>
        <button 
          className="filter-icon-btn" 
          title="Descargar inventario en CSV"
          onClick={exportarInventario}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 3V13M10 13L6 9M10 13L14 9M3 17H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Tabla */}
      <div className="table-container">
        <table className="equipos-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>NOMBRE DEL EQUIPO</th>
              <th>CATEGORÍA</th>
              <th>NÚMERO DE SERIE</th>
              <th>ESTADO</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {equiposPaginados.map((equipo) => (
              <tr key={equipo.id}>
                <td className="equipo-id">{equipo.codigo}</td>
                <td className="equipo-nombre-cell">
                  <div className="equipo-icon">
                    {getEquipoIcon(equipo.tipo)}
                  </div>
                  {equipo.nombre}
                </td>
                <td>{equipo.tipo || '-'}</td>
                <td>{equipo.modelo || '-'}</td>
                <td>
                  <span className={`badge badge-${getEstadoBadgeClass(equipo.estado)}`}>
                    {getEstadoLabel(equipo.estado)}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button 
                      className="action-btn edit-btn"
                      onClick={() => handleEditar(equipo)}
                      title="Editar"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M11.333 2.667C11.5084 2.49167 11.7167 2.404 11.958 2.404C12.1993 2.404 12.4077 2.49167 12.583 2.667C12.7584 2.84233 12.846 3.05067 12.846 3.292C12.846 3.53333 12.7584 3.74167 12.583 3.917L5.083 11.417L2.333 12.167L3.083 9.417L10.583 1.917L11.333 2.667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button 
                      className="action-btn history-btn"
                      onClick={() => handleVerHistorial(equipo)}
                      title="Historial"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M8 5V8L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {equipos.length === 0 && (
        <div className="empty-state">
          <p>No hay equipos registrados</p>
        </div>
      )}

      {/* Paginación */}
      {equipos.length > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Mostrando {indiceInicio + 1} a {Math.min(indiceFin, equipos.length)} de {equipos.length} items
          </div>
          <div className="pagination-controls">
            <button 
              className="pagination-btn"
              onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
              disabled={paginaActual === 1}
            >
              Anterior
            </button>
            {Array.from({ length: Math.min(totalPaginas, 5) }, (_, i) => {
              let pagina;
              if (totalPaginas <= 5) {
                pagina = i + 1;
              } else if (paginaActual <= 3) {
                pagina = i + 1;
              } else if (paginaActual >= totalPaginas - 2) {
                pagina = totalPaginas - 4 + i;
              } else {
                pagina = paginaActual - 2 + i;
              }
              return (
                <button
                  key={pagina}
                  className={`pagination-btn ${pagina === paginaActual ? 'active' : ''}`}
                  onClick={() => setPaginaActual(pagina)}
                >
                  {pagina}
                </button>
              );
            })}
            {totalPaginas > 5 && (
              <>
                <span className="pagination-ellipsis">...</span>
                <button
                  className="pagination-btn"
                  onClick={() => setPaginaActual(totalPaginas)}
                >
                  {totalPaginas}
                </button>
              </>
            )}
            <button 
              className="pagination-btn"
              onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
              disabled={paginaActual === totalPaginas}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {mostrarModal && (
        <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Nuevo Equipo</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Código *</label>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Tipo *</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Desktop">Desktop</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Periféricos">Periféricos</option>
                    <option value="iPad">iPad</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Marca</label>
                  <input
                    type="text"
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Modelo</label>
                <input
                  type="text"
                  value={formData.modelo}
                  onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setMostrarModal(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Equipo */}
      {mostrarModalEditar && equipoSeleccionado && (
        <div className="modal-overlay" onClick={() => {
          setMostrarModalEditar(false);
          setEquipoSeleccionado(null);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Editar Equipo</h2>
            <form onSubmit={handleGuardarEdicion}>
              <div className="form-group">
                <label>Código *</label>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  required
                  disabled
                />
                <small style={{color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem'}}>El código no se puede modificar</small>
              </div>
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Tipo *</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Desktop">Desktop</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Periféricos">Periféricos</option>
                    <option value="iPad">iPad</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Marca</label>
                  <input
                    type="text"
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Modelo</label>
                <input
                  type="text"
                  value={formData.modelo}
                  onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Estado</label>
                <select
                  value={equipoSeleccionado.estado}
                  onChange={(e) => setEquipoSeleccionado({ ...equipoSeleccionado, estado: e.target.value })}
                >
                  <option value="disponible">Disponible</option>
                  <option value="prestado">Prestado</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="baja">Dañado</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => {
                  setMostrarModalEditar(false);
                  setEquipoSeleccionado(null);
                }} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Historial */}
      {mostrarModalHistorial && equipoSeleccionado && (
        <div className="modal-overlay" onClick={() => {
          setMostrarModalHistorial(false);
          setEquipoSeleccionado(null);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '600px'}}>
            <h2 style={{color: '#ffffff'}}>Historial - {equipoSeleccionado.nombre}</h2>
            <div style={{marginBottom: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px'}}>
              <p style={{margin: '0.25rem 0', fontSize: '0.875rem', color: '#ffffff'}}><strong style={{color: '#ffffff'}}>Código:</strong> {equipoSeleccionado.codigo}</p>
              <p style={{margin: '0.25rem 0', fontSize: '0.875rem', color: '#ffffff'}}><strong style={{color: '#ffffff'}}>Estado actual:</strong> {getEstadoLabel(equipoSeleccionado.estado)}</p>
            </div>
            <div style={{maxHeight: '400px', overflowY: 'auto'}}>
              {historialEquipo.length > 0 ? (
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                  {historialEquipo.map((item, index) => (
                    <div key={index} style={{
                      padding: '0.75rem',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '6px',
                      borderLeft: '3px solid #f3742f'
                    }}>
                      <p style={{margin: '0 0 0.25rem 0', fontWeight: '600', fontSize: '0.875rem', color: '#ffffff'}}>{item.accion}</p>
                      <p style={{margin: '0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)'}}>
                        {new Date(item.fecha).toLocaleString('es-MX')} - {item.usuario}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{textAlign: 'center', color: 'rgba(255,255,255,0.5)', padding: '2rem'}}>
                  No hay historial disponible
                </p>
              )}
            </div>
            <div className="modal-actions" style={{marginTop: '1.5rem'}}>
              <button type="button" onClick={() => {
                setMostrarModalHistorial(false);
                setEquipoSeleccionado(null);
              }} className="btn-secondary">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventario;
