import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario guardado
    const usuarioGuardado = localStorage.getItem('usuario');
    const token = localStorage.getItem('token');
    
    if (usuarioGuardado && token) {
      try {
        setUsuario(JSON.parse(usuarioGuardado));
      } catch (e) {
        localStorage.removeItem('usuario');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.login(email, password);
      
      if (response && response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('usuario', JSON.stringify(response.usuario));
        setUsuario(response.usuario);
        return { success: true };
      } else {
        return { 
          success: false, 
          message: response?.message || 'Error desconocido en el login' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message || 'Error de conexión' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
