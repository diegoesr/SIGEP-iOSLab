# SIGEP - Sistema Integral de Gestión de Inventario y Control de Préstamos

Sistema web Fullstack para la gestión de inventario y control de préstamos del Laboratorio Abierto (LabIOS).

## 🚀 Tecnologías

### Frontend
- **React 19** - Biblioteca de UI
- **React Router DOM** - Navegación
- **Vite** - Build tool y dev server
- **CSS3** - Estilos personalizados

### Backend
- **PHP 8.x** - Lenguaje del servidor
- **MySQL/MariaDB** - Base de datos
- **Apache** - Servidor web (XAMPP)

## 📋 Requisitos Previos

- XAMPP instalado y configurado
- Node.js 18+ y npm
- Navegador web moderno

## 🛠️ Instalación

### 1. Configurar Base de Datos

1. Inicia XAMPP y asegúrate de que Apache y MySQL estén corriendo
2. Abre phpMyAdmin: `http://localhost/phpmyadmin`
3. Importa el archivo `database/schema.sql` para crear la base de datos y tablas

### 2. Instalar Dependencias del Frontend

```bash
npm install
```

### 3. Configurar Backend

El backend PHP ya está configurado en `backend/`. Asegúrate de que:
- Los directorios `uploads/responsivas` y `uploads/reportes` existan
- Los permisos de escritura estén habilitados en estos directorios
- La configuración de base de datos en `backend/config/database.php` coincida con tu entorno XAMPP (por defecto: usuario `root`, contraseña vacía)

### 4. Iniciar el Proyecto

```bash
# Terminal 1: Frontend (React)
npm run dev

# Terminal 2: Asegúrate de que XAMPP esté corriendo
# Apache y MySQL deben estar activos
```

## 🌐 Acceso

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost/lab-ios/backend/api
- **phpMyAdmin**: http://localhost/phpmyadmin

## 🔐 Credenciales por Defecto

- **Email**: admin@labios.local
- **Contraseña**: admin123

## 📁 Estructura del Proyecto

```
lab-ios/
├── backend/              # API PHP
│   ├── api/             # Endpoints
│   ├── config/          # Configuración
│   ├── middleware/     # Autenticación
│   └── utils/           # Utilidades
├── database/            # Scripts SQL
├── src/                 # Frontend React
│   ├── components/      # Componentes reutilizables
│   ├── pages/           # Páginas principales
│   ├── services/        # Servicios API
│   └── context/         # Context API
└── uploads/             # Archivos subidos
```

## ✨ Funcionalidades

- ✅ Dashboard con estadísticas en tiempo real
- ✅ Gestión de inventario de equipos
- ✅ Sistema de préstamos y devoluciones
- ✅ Registro de usuarios
- ✅ Búsqueda avanzada de usuarios
- ✅ Autenticación de administradores
- ✅ Interfaz moderna y responsive

## 📸 Capturas de Pantalla

### Página de Login
![Login](docs/screenshots/login.jpg)
*Interfaz de inicio de sesión con diseño moderno y animación Dark Veil*

### Dashboard Principal
![Dashboard](docs/screenshots/dashboard.png)
*Dashboard con estadísticas en tiempo real, gráficos y métricas del sistema*

### Gestión de Inventario
![Inventario](docs/screenshots/inventario.png)
*Vista completa del inventario con búsqueda, filtros y acciones rápidas*

### Sistema de Préstamos
![Préstamos](docs/screenshots/prestamos.png)
*Interfaz para gestionar préstamos y devoluciones de equipos*

### Gestión de Usuarios
![Usuarios](docs/screenshots/usuarios.png)
*Registro y gestión de usuarios del sistema*

### Reportes de Equipos
![Reportes](docs/screenshots/reportes.png)
*Sistema de reportes para equipos dañados, perdidos o fuera de uso*

### Configuración y Administradores
![Configuración](docs/screenshots/configuracion.png)
*Panel de configuración y gestión de administradores*

> **Nota**: Para agregar tus propias capturas de pantalla, colócalas en la carpeta `docs/screenshots/` y actualiza las rutas en esta sección.

## 📝 Notas de Desarrollo

- El proyecto está configurado para desarrollo local con XAMPP
- Las imágenes se almacenan en `uploads/` como archivos base64
- El token de autenticación se guarda en localStorage
- El proxy de Vite redirige `/api` al backend PHP

## 🔄 Próximas Mejoras

- [ ] Implementar firmas digitales con canvas
- [ ] Generación de reportes PDF/Excel
- [ ] Notificaciones de préstamos vencidos
- [ ] Historial completo de préstamos por usuario
- [ ] Sistema de roles y permisos

## 📄 Licencia

Proyecto académico para servicio social - LabIOS
