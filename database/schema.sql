-- Sistema Integral de Gestión de Inventario y Control de Préstamos (SIGEP)
-- Base de datos para LabIOS

CREATE DATABASE IF NOT EXISTS labios_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE labios_db;

-- Tabla de administradores
CREATE TABLE IF NOT EXISTS administradores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('super_admin', 'admin', 'viewer') DEFAULT 'admin',
    puede_editar BOOLEAN DEFAULT TRUE,
    ultimo_login DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_rol (rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de usuarios (alumnos)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    matricula VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100),
    telefono VARCHAR(20),
    foto_credencial VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_matricula (matricula),
    INDEX idx_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de equipos (inventario)
CREATE TABLE IF NOT EXISTS equipos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    marca VARCHAR(50),
    modelo VARCHAR(50),
    estado ENUM('disponible', 'prestado', 'mantenimiento', 'baja', 'perdido', 'fuera_de_uso') DEFAULT 'disponible',
    descripcion TEXT,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_codigo (codigo),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de préstamos
CREATE TABLE IF NOT EXISTS prestamos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    equipo_id INT NOT NULL,
    fecha_prestamo DATETIME NOT NULL,
    fecha_devolucion_esperada DATETIME NOT NULL,
    fecha_devolucion_real DATETIME NULL,
    estado ENUM('activo', 'completado', 'vencido') DEFAULT 'activo',
    observaciones TEXT,
    firma_digital TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE RESTRICT,
    INDEX idx_usuario (usuario_id),
    INDEX idx_equipo (equipo_id),
    INDEX idx_estado (estado),
    INDEX idx_fecha_prestamo (fecha_prestamo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de reportes de equipos
CREATE TABLE IF NOT EXISTS reportes_equipos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipo_id INT NOT NULL,
    tipo_reporte ENUM('dañado', 'maltratado', 'perdido', 'extraviado', 'fuera_de_uso') NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_incidente DATE NOT NULL,
    observaciones TEXT,
    evidencia VARCHAR(255),
    estado ENUM('pendiente', 'en_revision', 'en_observacion', 'resuelto', 'rechazado') DEFAULT 'pendiente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE RESTRICT,
    INDEX idx_equipo (equipo_id),
    INDEX idx_estado (estado),
    INDEX idx_tipo_reporte (tipo_reporte)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insertar administrador por defecto
-- Email: admin@labios.local
-- Password: admin123
INSERT INTO administradores (nombre, email, password_hash, rol, puede_editar) 
VALUES ('Administrador', 'admin@labios.local', '$2y$10$fAGJVPfdqbmhuTQOEKKqM.hUACHv6WZ8WuHXI.5YQKlUdJRXfNQtS', 'super_admin', TRUE)
ON DUPLICATE KEY UPDATE nombre=nombre;

-- Datos de ejemplo para pruebas
INSERT INTO equipos (codigo, nombre, tipo, marca, modelo, estado, descripcion) VALUES
('LAP001', 'Laptop Dell Inspiron', 'Laptop', 'Dell', 'Inspiron 15', 'disponible', 'Laptop Dell con procesador Intel i5'),
('LAP002', 'Laptop HP Pavilion', 'Laptop', 'HP', 'Pavilion 14', 'disponible', 'Laptop HP con Windows 11'),
('MOUSE001', 'Mouse Logitech', 'Periférico', 'Logitech', 'M705', 'disponible', 'Mouse inalámbrico Logitech'),
('TEC001', 'Teclado Mecánico', 'Periférico', 'Redragon', 'K552', 'disponible', 'Teclado mecánico RGB')
ON DUPLICATE KEY UPDATE codigo=codigo;
