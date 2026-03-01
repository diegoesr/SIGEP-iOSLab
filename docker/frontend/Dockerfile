# Dockerfile para Frontend (React/Vite)
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias primero (para cache de Docker)
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar solo los archivos necesarios para el frontend
COPY index.html ./
COPY vite.config.js ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY eslint.config.js ./
COPY src/ ./src/
COPY public/ ./public/

# Construir la aplicación
# VITE_API_URL se pasa automáticamente desde las variables de entorno de Render
# Vite solo expone variables que empiezan con VITE_ durante el build
RUN npm run build

# Imagen de producción con Nginx
FROM nginx:alpine

# Copiar archivos construidos
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de Nginx
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
