const API_BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Agregar timeout de 10 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(url, {
      ...config,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Verificar si la respuesta es JSON
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error('Non-JSON response:', text);
      throw new Error(`Respuesta no válida del servidor: ${text.substring(0, 200)}`);
    }

    if (!response.ok) {
      if (response.status === 401) {
        // Token expirado o inválido - solo redirigir si no estamos ya en login
        const currentPath = window.location.pathname;
        if (currentPath !== '/login') {
          console.warn('Token inválido o expirado, redirigiendo al login');
          localStorage.removeItem('token');
          localStorage.removeItem('usuario');
          // Usar un pequeño delay para evitar redirecciones inmediatas
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        }
      }
      throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', {
      endpoint: `${API_BASE_URL}${endpoint}`,
      error: error.message,
      stack: error.stack
    });
    
    // Manejar errores de conexión específicos
    if (error.name === 'AbortError') {
      throw new Error('Tiempo de espera agotado. Verifica que XAMPP (Apache y MySQL) estén corriendo.');
    }
    
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('No se puede conectar al servidor. Verifica que XAMPP (Apache y MySQL) estén corriendo.');
    }
    
    throw error;
  }
}

export const api = {
  // Autenticación
  login: (email, password) => 
    request('/auth_direct.php', {
      method: 'POST',
      body: { action: 'login', email, password }
    }),

  // Usuarios
  buscarUsuarios: (search) => 
    request(`/usuarios?search=${encodeURIComponent(search)}`),
  
  registrarUsuario: (usuarioData) => 
    request('/usuarios', {
      method: 'POST',
      body: usuarioData
    }),

  actualizarUsuario: (id, usuarioData) =>
    request('/usuarios', {
      method: 'PUT',
      body: { id, ...usuarioData }
    }),

  // Inventario
  listarEquipos: (estado, search = '') => {
    let url = '/inventario';
    const params = [];
    if (estado) params.push(`estado=${estado}`);
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (params.length > 0) url += '?' + params.join('&');
    return request(url);
  },
  
  crearEquipo: (equipoData) => 
    request('/inventario', {
      method: 'POST',
      body: equipoData
    }),

  actualizarEstadoEquipo: (id, estado) =>
    request('/inventario', {
      method: 'PUT',
      body: { id, estado }
    }),

  // Préstamos
  crearPrestamo: (prestamoData) => 
    request('/prestamos', {
      method: 'POST',
      body: prestamoData
    }),
  
  listarPrestamos: (estado) => {
    const url = estado ? `/prestamos?estado=${estado}` : '/prestamos';
    return request(url);
  },

  obtenerPrestamosPorUsuario: (usuarioId) =>
    request(`/prestamos?usuario_id=${usuarioId}`),

  devolverEquipo: (id) =>
    request('/prestamos', {
      method: 'PUT',
      body: { id, action: 'devolver' }
    }),

  // Dashboard
  obtenerEstadisticas: () => 
    request('/dashboard'),

  // Reportes
  listarReportes: () =>
    request('/reportes'),

  crearReporte: (reporteData) =>
    request('/reportes', {
      method: 'POST',
      body: reporteData
    }),

  actualizarEstadoReporte: (id, estado) =>
    request('/reportes', {
      method: 'PUT',
      body: { id, estado }
    }),

  // Administradores
  listarAdministradores: () =>
    request('/administradores'),

  crearAdministrador: (adminData) =>
    request('/administradores', {
      method: 'POST',
      body: adminData
    }),

  actualizarAdministrador: (id, adminData) =>
    request('/administradores', {
      method: 'PUT',
      body: { id, ...adminData }
    }),

  eliminarAdministrador: (id) =>
    request('/administradores', {
      method: 'DELETE',
      body: { id }
    }),
};
