# ⚡ Despliegue Rápido - LabIOS

Guía rápida para desplegar el proyecto en **Render** (recomendado para reclutadores).

## 🚀 Despliegue en 5 Pasos

### Paso 1: Subir a GitHub

```bash
# Si aún no tienes el proyecto en GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/lab-ios.git
git push -u origin main
```

### Paso 2: Crear cuenta en Render

1. Ve a [render.com](https://render.com)
2. Crea una cuenta (puedes usar GitHub para login rápido)
3. Conecta tu cuenta de GitHub

### Paso 3: Desplegar con Blueprint

1. En el dashboard de Render, haz clic en **"New +"** → **"Blueprint"**
2. Selecciona tu repositorio `lab-ios`
3. Render detectará automáticamente el archivo `render.yaml`
4. Haz clic en **"Apply"**
5. Render creará automáticamente:
   - ✅ Backend (PHP/Apache)
   - ✅ Frontend (React/Nginx)
   - ✅ Base de datos MySQL

### Paso 4: Configurar Variables de Entorno

Después del primer despliegue:

1. Ve al servicio **labios-frontend**
2. En **"Environment"**, agrega:
   ```
   VITE_API_URL=https://labios-backend.onrender.com/api
   ```
   (Reemplaza con la URL real que Render te dio)

3. Haz clic en **"Save Changes"** y Render redeployará automáticamente

### Paso 5: Configurar Base de Datos MySQL (Railway)

Si Render creó PostgreSQL en lugar de MySQL, usa Railway para MySQL (gratis):

1. Ve a [railway.app](https://railway.app) y crea una cuenta
2. Crea un nuevo proyecto
3. Agrega un servicio **"MySQL"**
4. Espera a que se despliegue (debería decir "ACTIVE")

**Luego conecta Render con Railway:**
- Consulta `CONECTAR_RENDER_RAILWAY.md` para instrucciones detalladas
- O sigue los pasos rápidos abajo

### Paso 6: Inicializar Base de Datos

Necesitas ejecutar los scripts SQL para crear las tablas y datos iniciales.

#### Opción 1: Usar la Consola SQL de Render (Más Fácil)

1. Ve al servicio **labios-db** en Render
2. Haz clic en la pestaña **"Connect"** o **"Info"**
3. Copia las credenciales de conexión:
   - **Host**: (algo como `dpg-xxxxx-a.oregon-postgres.render.com`)
   - **Puerto**: `3306` (o el que muestre)
   - **Database**: `labios_db`
   - **User**: `labios_user`
   - **Password**: (la contraseña generada)
4. Haz clic en **"Connect"** o busca el botón **"Open in MySQL Workbench"** / **"Connect via CLI"**
5. Si Render tiene consola SQL integrada, úsala. Si no, continúa con la Opción 2

#### Opción 2: Usar MySQL Workbench con Railway (Recomendado si usas Railway)

1. **Descarga MySQL Workbench** (gratis): https://dev.mysql.com/downloads/workbench/

2. **Obtén las credenciales de Railway**:
   - En Railway, ve a tu servicio **MySQL**
   - Ve a la pestaña **"Variables"**
   - Busca estas variables (Railway las crea automáticamente):
     - `MYSQLHOST` o `MYSQL_HOST` - Host
     - `MYSQLPORT` o `MYSQL_PORT` - Puerto (generalmente 3306)
     - `MYSQLDATABASE` o `MYSQL_DATABASE` - Base de datos
     - `MYSQLUSER` o `MYSQL_USER` - Usuario
     - `MYSQLPASSWORD` o `MYSQL_PASSWORD` - Contraseña
   - **O** ve a la pestaña **"Connect"** y copia la URL de conexión

3. **Conecta a la base de datos**:
   - En MySQL Workbench: `Database` → `Connect to Database`
   - Host: `[MYSQLHOST de Railway]`
   - Port: `[MYSQLPORT de Railway]` (generalmente 3306)
   - Username: `[MYSQLUSER de Railway]`
   - Password: `[MYSQLPASSWORD de Railway]`
   - Default Schema: `[MYSQLDATABASE de Railway]` o `labios_db`
   - Haz clic en **"Test Connection"** para verificar

4. **Crear la base de datos** (si no existe):
   ```sql
   CREATE DATABASE IF NOT EXISTS labios_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   USE labios_db;
   ```

5. **Ejecuta los scripts SQL**:
   - Abre `database/schema.sql` en un editor de texto
   - Copia TODO el contenido (Ctrl+A, Ctrl+C)
   - En MySQL Workbench, pega en la consola SQL (Ctrl+V)
   - Ejecuta (botón ⚡ o F9)
   - Repite con `database/seed_inventario.sql`
   - Repite con `database/seed_prestamos.sql`

**📌 Importante**: Después de ejecutar los scripts, configura las variables de entorno en Render para que el backend se conecte a Railway. Consulta `CONECTAR_RENDER_RAILWAY.md` para instrucciones detalladas.

#### Opción 3: Usar Adminer desde Docker Local

1. **Obtén las credenciales de Render**:
   - Ve a `labios-db` → **"Info"** → Copia Host, Puerto, User, Password

2. **Levanta Adminer localmente**:
```bash
cd docker
docker-compose up -d adminer
```

3. **Accede a Adminer**: http://localhost:8082

4. **Conecta usando las credenciales de Render**:
   - Sistema: `MySQL`
   - Servidor: (el HOST de Render, sin el puerto)
   - Usuario: `labios_user`
   - Contraseña: (la contraseña de Render)
   - Base de datos: `labios_db`

5. **Ejecuta los scripts**:
   - Ve a la pestaña **"SQL command"**
   - Abre `database/schema.sql` en un editor
   - Copia y pega el contenido completo
   - Haz clic en **"Execute"**
   - Repite con los otros dos scripts

#### Opción 4: Usar línea de comandos (CLI)

Si tienes `mysql` instalado localmente:

```bash
# Obtén las credenciales de Render primero
mysql -h [HOST_DE_RENDER] -P 3306 -u labios_user -p labios_db < database/schema.sql
# Te pedirá la contraseña, ingrésala
mysql -h [HOST_DE_RENDER] -P 3306 -u labios_user -p labios_db < database/seed_inventario.sql
mysql -h [HOST_DE_RENDER] -P 3306 -u labios_user -p labios_db < database/seed_prestamos.sql
```

**Orden de ejecución (IMPORTANTE):**
1. ✅ `database/schema.sql` - Crea las tablas
2. ✅ `database/seed_inventario.sql` - Agrega datos de inventario
3. ✅ `database/seed_prestamos.sql` - Agrega datos de préstamos y administrador

## ✅ Verificar Despliegue

1. **Frontend**: `https://labios-frontend.onrender.com`
2. **Backend API**: `https://labios-backend.onrender.com/api`
3. **Login con credenciales por defecto**:
   - Email: `admin@labios.local`
   - Contraseña: `admin123`

## 🔧 Solución de Problemas

### El frontend no carga
- Verifica que `VITE_API_URL` esté configurada correctamente
- Revisa los logs del servicio frontend en Render

### Error de CORS
- Verifica que `FRONTEND_URL` en el backend apunte a tu dominio de Render
- Revisa `backend/config/cors.php`

### La base de datos está vacía
- Ejecuta los scripts SQL manualmente
- Verifica las credenciales de conexión

## 📝 URLs para Compartir

Una vez desplegado, comparte estas URLs con los reclutadores:

- **Aplicación**: `https://labios-frontend.onrender.com`
- **Repositorio**: `https://github.com/TU_USUARIO/lab-ios`

## 💡 Tips

- Render tiene un plan gratuito generoso (750 horas/mes)
- Los servicios gratuitos se "duermen" después de 15 minutos de inactividad
- La primera carga después de dormir puede tardar ~30 segundos
- Considera el plan pago ($7/mes) si necesitas que esté siempre activo

---

¿Necesitas más ayuda? Revisa `GUIA_DESPLIEGUE.md` para opciones alternativas.
