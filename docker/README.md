# 🐳 Configuración Docker

Esta carpeta contiene todos los archivos de configuración de Docker para el proyecto LabIOS.

## Estructura

```
docker/
├── docker-compose.yml      # Orquestación de servicios
├── frontend/
│   ├── Dockerfile          # Imagen del frontend React
│   └── nginx.conf          # Configuración de Nginx
└── backend/
    ├── Dockerfile          # Imagen del backend PHP
    └── apache-config.conf  # Configuración de Apache
```

## Uso Rápido

Desde esta carpeta (`docker/`), ejecuta:

```bash
# Construir y ejecutar todos los servicios
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

## Acceso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8888/api
- **Base de datos**: localhost:3307
- **Adminer (Gestor BD)**: http://localhost:8082

### Credenciales para Adminer

Al acceder a http://localhost:8082, usa:
- **Sistema**: MySQL
- **Servidor**: `db`
- **Usuario**: `labios_user`
- **Contraseña**: `labios_password`
- **Base de datos**: `labios_db`

Para más información, consulta el README principal del proyecto.
