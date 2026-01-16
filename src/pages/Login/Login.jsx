import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import DarkVeil from '../../components/ui/dark-veil';
import { cn } from '../../lib/utils';
import './Login.css';

const LabelInputContainer = ({ children, className }) => {
  return (
    <div className={cn("label-input-container", className)}>
      {children}
    </div>
  );
};

const BottomGradient = () => {
  return (
    <>
      <span className="bottom-gradient-1" />
      <span className="bottom-gradient-2" />
    </>
  );
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Error de login:', error);
      setError(error.message || 'Error de conexión. Verifica que el servidor esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <DarkVeil />
      <div className="login-container">
        <div className="shadow-input login-card">
        <div className="login-header">
          <div className="logo-container">
            <img src="/img/logo.png" alt="LabIOS Logo" className="login-logo" />
          </div>
          <h2 className="login-title">Bienvenido de nuevo</h2>
          <p className="login-subtitle">
            Inicia sesión en tu cuenta para continuar
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M10 6V10M10 14H10.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              placeholder="admin@labios.local" 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </LabelInputContainer>

          <LabelInputContainer className="mb-8">
            <Label htmlFor="password">Contraseña</Label>
            <Input 
              id="password" 
              placeholder="••••••••" 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </LabelInputContainer>

          <button
            className="group-btn login-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión →'}
            <BottomGradient />
          </button>

          <div className="login-footer">
            <p>Credenciales por defecto:</p>
            <p className="credentials">admin@labios.local / admin123</p>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
