import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      const response = await api.obtenerEstadisticas();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // Si es hoy
    const isToday = date.toDateString() === now.toDateString();
    
    if (diffMins < 1) {
      return 'Hace un momento';
    } else if (diffMins < 60) {
      return `Hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
    } else if (diffHours < 24 && isToday) {
      return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    } else if (diffDays === 1 || (diffDays === 0 && !isToday)) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
    } else if (isToday) {
      return `Hoy, ${date.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('es-MX', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    }
  };

  const getActivityIcon = (estado, isOverdue) => {
    if (estado === 'completado') {
      // Checkmark verde
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="9" fill="#10B981"/>
          <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    } else if (estado === 'activo' && !isOverdue) {
      // Flecha azul hacia arriba-derecha
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="9" fill="#f3742f"/>
          <path d="M7 13L13 7M13 7H9M13 7V11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    } else if (isOverdue) {
      // Exclamación roja
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="9" fill="#EF4444"/>
          <path d="M10 6V10M10 14H10.01" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    } else {
      // Engranaje amarillo
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="9" fill="#F59E0B"/>
          <path d="M10 4V2M10 18V16M16 10H18M2 10H4M15.657 4.343L17.071 2.929M2.929 17.071L4.343 15.657M15.657 15.657L17.071 17.071M2.929 2.929L4.343 4.343" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
    }
  };

  if (loading) {
    return <div className="loading">Cargando estadísticas...</div>;
  }

  if (!stats) {
    return <div className="error">Error al cargar las estadísticas</div>;
  }

  const totalEquipos = stats.equipos_por_estado.reduce((sum, e) => sum + parseInt(e.total), 0);
  const equiposPrestados = stats.equipos_por_estado.find(e => e.estado === 'prestado')?.total || 0;
  const equiposMantenimiento = stats.equipos_por_estado.find(e => e.estado === 'mantenimiento')?.total || 0;
  const prestamosVencidos = stats.prestamos_vencidos || 0;
  const totalReportes = stats.total_reportes || 0;

  // Preparar datos para el gráfico de categorías
  const equiposPorCategoria = stats.equipos_por_categoria || [];
  const chartData = {
    labels: equiposPorCategoria.map(item => item.categoria || 'Sin categoría'),
    datasets: [
      {
        label: 'Veces Prestado',
        data: equiposPorCategoria.map(item => parseInt(item.veces_prestado) || 0),
        backgroundColor: [
          'rgba(243, 116, 47, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderColor: [
          'rgba(243, 116, 47, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    indexAxis: 'y', // Cambiar a barras horizontales
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(26, 26, 26, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      y: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  return (
    <div className="dashboard-overview">
      <div className="dashboard-header">
        <div>
          <h1>Resumen del Dashboard</h1>
          <p className="dashboard-subtitle">Bienvenido de nuevo, administrador. Esto es lo que está pasando hoy.</p>
        </div>
        <button className="new-loan-btn" onClick={() => navigate('/prestamos')}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Nuevo Préstamo
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <h3>Equipos Totales</h3>
            <p className="stat-value">{totalEquipos.toLocaleString()}</p>
            <p className="stat-trend positive">
              <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{color: '#10b981'}}>
                  <path d="M6 2L10 6H7V10H5V6H2L6 2Z" fill="currentColor"/>
                </svg>
                <span style={{color: '#10b981', fontWeight: '600', fontSize: '0.9375rem'}}>+2.4%</span>
                <span style={{color: '#10b981', fontSize: '0.8125rem', marginLeft: '0.5rem'}}>del mes pasado</span>
              </div>
            </p>
          </div>
          <div className="stat-icon blue">
            <svg viewBox="0 0 24 24" fill="none" style={{ width: '100%', height: '100%', padding: '10px' }}>
              {/* Monitor */}
              <rect x="3" y="4" width="10" height="8" rx="1" fill="white" opacity="0.2"/>
              <rect x="3" y="4" width="10" height="8" rx="1" stroke="white" strokeWidth="1.5" fill="none"/>
              <rect x="5" y="6" width="6" height="4" rx="0.5" fill="white" opacity="0.3"/>
              <path d="M5 12H11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M6 14H10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              {/* Dispositivo móvil */}
              <rect x="14" y="6" width="5" height="9" rx="1" fill="white" opacity="0.2"/>
              <rect x="14" y="6" width="5" height="9" rx="1" stroke="white" strokeWidth="1.5" fill="none"/>
              <rect x="15.5" y="8" width="2" height="3" rx="0.3" fill="white" opacity="0.3"/>
              <circle cx="16.5" cy="13" r="0.5" fill="white"/>
            </svg>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>En Préstamo</h3>
            <p className="stat-value">{equiposPrestados}</p>
            <p className="stat-trend positive">
              <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{color: '#10b981'}}>
                  <path d="M6 2L10 6H7V10H5V6H2L6 2Z" fill="currentColor"/>
                </svg>
                <span style={{color: '#10b981', fontWeight: '600', fontSize: '0.9375rem'}}>+5.2%</span>
                <span style={{color: '#10b981', fontSize: '0.8125rem', marginLeft: '0.5rem'}}>vs ayer</span>
              </div>
            </p>
          </div>
          <div className="stat-icon green">
            <svg viewBox="0 0 24 24" fill="none" style={{ width: '100%', height: '100%', padding: '10px' }}>
              <rect x="4" y="6" width="16" height="14" rx="2" fill="white" opacity="0.2"/>
              <path d="M4 8L12 4L20 8V18C20 19.105 19.105 20 18 20H6C4.895 20 4 19.105 4 18V8Z" stroke="white" strokeWidth="2" fill="none"/>
              <path d="M8 6V4C8 2.895 8.895 2 10 2H14C15.105 2 16 2.895 16 4V6" stroke="white" strokeWidth="2"/>
              <path d="M12 10V16M9 13H15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>En Mantenimiento</h3>
            <p className="stat-value">{equiposMantenimiento}</p>
            <p className="stat-trend warning">
              <div style={{display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap'}}>
                <span style={{color: '#f59e0b', fontWeight: '700', fontSize: '1.125rem', lineHeight: '1'}}>3</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{color: '#f59e0b'}}>
                  <path d="M6 2L10 6H7V10H5V6H2L6 2Z" fill="currentColor"/>
                </svg>
                <span style={{color: '#f59e0b', fontSize: '0.8125rem', marginLeft: '0.25rem'}}>requieren</span>
                <span style={{color: '#f59e0b', fontWeight: '600', fontSize: '0.8125rem'}}>activos</span>
                <span style={{color: '#f59e0b', fontWeight: '600', fontSize: '0.8125rem'}}>atención</span>
              </div>
            </p>
          </div>
          <div className="stat-icon yellow">
            <svg viewBox="0 0 24 24" fill="none" style={{ width: '100%', height: '100%', padding: '10px' }}>
              <circle cx="12" cy="12" r="10" fill="white" opacity="0.2"/>
              <path d="M14.7 6.3C15.1 5.9 15.1 5.3 14.7 4.9L13.1 3.3C12.7 2.9 12.1 2.9 11.7 3.3L3.3 11.7C2.9 12.1 2.9 12.7 3.3 13.1L4.9 14.7C5.3 15.1 5.9 15.1 6.3 14.7L14.7 6.3Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 20L14.7 14.7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>Reportes</h3>
            <p className="stat-value red-text">{totalReportes}</p>
            <button 
              className="priority-action-btn" 
              style={{alignSelf: 'center'}}
              onClick={() => navigate('/reportes')}
            >
              Ver Reportes
            </button>
          </div>
          <div className="stat-icon red">
            <svg viewBox="0 0 24 24" fill="none" style={{ width: '100%', height: '100%', padding: '10px' }}>
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="white" opacity="0.2"/>
              <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="2" fill="white"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="dashboard-content-grid">
        <div className="chart-section">
          <div className="section-header">
            <h2>Uso de Equipos por Categoría</h2>
            <select className="time-select">
              <option>Últimos 30 días</option>
              <option>Últimos 7 días</option>
              <option>Último año</option>
            </select>
          </div>
          <div className="chart-container">
            {equiposPorCategoria.length > 0 ? (
              <Bar data={chartData} options={chartOptions} />
            ) : (
              <div className="chart-placeholder">
                <p>No hay datos disponibles para mostrar</p>
              </div>
            )}
          </div>
        </div>

        <div className="activity-section">
          <div className="section-header">
            <h2>Actividad Reciente</h2>
            <a href="#" className="view-all-link">Ver Todo</a>
          </div>
          <div className="activity-list">
            {stats.prestamos_recientes && stats.prestamos_recientes.length > 0 ? (
              stats.prestamos_recientes.slice(0, 4).map((prestamo) => {
                const isOverdue = prestamo.estado === 'vencido' || 
                  (prestamo.estado === 'activo' && new Date(prestamo.fecha_devolucion_esperada) < new Date());
                const isReturned = prestamo.estado === 'completado';
                const isLoaned = prestamo.estado === 'activo' && !isOverdue;
                const isMaintenance = prestamo.equipo_estado === 'mantenimiento';
                
                let iconClass = 'blue';
                let description = '';
                
                if (isReturned) {
                  iconClass = 'green';
                  description = `Devuelto por ${prestamo.usuario_nombre}`;
                } else if (isLoaned) {
                  iconClass = 'blue';
                  description = `Prestado a ${prestamo.usuario_nombre}`;
                } else if (isOverdue) {
                  iconClass = 'red';
                  const daysOverdue = Math.floor((new Date() - new Date(prestamo.fecha_devolucion_esperada)) / 86400000);
                  description = `Vencido (${daysOverdue} ${daysOverdue === 1 ? 'día' : 'días'})`;
                } else if (isMaintenance) {
                  iconClass = 'yellow';
                  description = 'Movido a Mantenimiento';
                } else {
                  iconClass = 'yellow';
                  description = 'Movido a Mantenimiento';
                }
                
                return (
                  <div key={prestamo.id} className="activity-item">
                    <div className={`activity-icon ${iconClass}`}>
                      {getActivityIcon(prestamo.estado, isOverdue)}
                    </div>
                    <div className="activity-content">
                      <p className="activity-equipment">{prestamo.equipo_nombre || prestamo.equipo_codigo}</p>
                      <p className={`activity-description ${isOverdue ? 'overdue-text' : ''}`}>{description}</p>
                    </div>
                    <p className="activity-time">{formatTimeAgo(prestamo.fecha_prestamo)}</p>
                  </div>
                );
              })
            ) : (
              <div className="no-activity">No hay actividad reciente</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
