# 🔗 Conectar Render con Railway MySQL

Guía paso a paso para conectar tu backend en Render con MySQL en Railway.

## 📋 Paso 1: Obtener Credenciales de Railway

1. En Railway, haz clic en tu servicio **MySQL**
2. Ve a la pestaña **"Variables"** o **"Connect"**
3. Busca estas variables de entorno (Railway las crea automáticamente):
   - `MYSQLHOST` o `MYSQL_HOST` - Host de la base de datos
   - `MYSQLPORT` o `MYSQL_PORT` - Puerto (generalmente 3306)
   - `MYSQLDATABASE` o `MYSQL_DATABASE` - Nombre de la base de datos
   - `MYSQLUSER` o `MYSQL_USER` - Usuario
   - `MYSQLPASSWORD` o `MYSQL_PASSWORD` - Contraseña

**O busca la sección "Connect"** donde Railway muestra la URL de conexión:
```
mysql://user:password@host:port/database
```

## 🔧 Paso 2: Configurar Variables de Entorno en Render

1. Ve a tu dashboard de Render: https://dashboard.render.com
2. Haz clic en el servicio **labios-backend**
3. Ve a la pestaña **"Environment"**
4. Actualiza o crea estas variables de entorno:

```
DB_HOST=[MYSQLHOST de Railway]
DB_NAME=[MYSQLDATABASE de Railway]
DB_USER=[MYSQLUSER de Railway]
DB_PASSWORD=[MYSQLPASSWORD de Railway]
```

**Ejemplo:**
```
DB_HOST=containers-us-west-xxx.railway.app
DB_NAME=railway
DB_USER=root
DB_PASSWORD=tu_password_aqui
```

5. Haz clic en **"Save Changes"**
6. Render redeployará automáticamente el backend

## 📝 Paso 3: Crear Base de Datos y Ejecutar Scripts SQL

### Opción A: Usar MySQL Workbench (Recomendado)

1. **Obtén las credenciales de Railway**:
   - Ve a MySQL → Pestaña **"Variables"**
   - O ve a **"Connect"** → Copia la URL de conexión

2. **Conecta con MySQL Workbench**:
   - Abre MySQL Workbench
   - Crea una nueva conexión:
     ```
     Connection Name: Railway MySQL
     Hostname: [MYSQLHOST de Railway]
     Port: [MYSQLPORT de Railway - generalmente 3306]
     Username: [MYSQLUSER de Railway]
     Password: [MYSQLPASSWORD de Railway]
     Default Schema: [MYSQLDATABASE de Railway]
     ```
   - Haz clic en **"Test Connection"**
   - Si funciona, haz clic en **"OK"** y luego **"Connect"**

3. **Crear la base de datos** (si no existe):
   ```sql
   CREATE DATABASE IF NOT EXISTS labios_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   USE labios_db;
   ```

4. **Ejecutar los scripts SQL**:
   - Abre `database/schema.sql` en un editor de texto
   - Copia TODO el contenido (Ctrl+A, Ctrl+C)
   - En MySQL Workbench, pega en la consola SQL (Ctrl+V)
   - Ejecuta (botón ⚡ o F9)
   - Repite con `database/seed_inventario.sql`
   - Repite con `database/seed_prestamos.sql`

### Opción B: Usar la Terminal de Railway

1. En Railway, ve a tu servicio **MySQL**
2. Haz clic en la pestaña **"Deployments"**
3. Haz clic en el botón **"..."** (tres puntos) → **"Open in Terminal"**
4. Conéctate a MySQL:
   ```bash
   mysql -u $MYSQLUSER -p$MYSQLPASSWORD $MYSQLDATABASE
   ```
5. Ejecuta los scripts:
   ```bash
   # Desde la terminal de Railway
   mysql -u $MYSQLUSER -p$MYSQLPASSWORD $MYSQLDATABASE < /path/to/schema.sql
   ```

### Opción C: Usar Adminer desde Docker Local

1. **Obtén las credenciales de Railway** (del Paso 1)

2. **Levanta Adminer localmente**:
   ```bash
   cd docker
   docker-compose up -d adminer
   ```

3. **Accede a Adminer**: http://localhost:8082

4. **Conecta usando las credenciales de Railway**:
   - Sistema: `MySQL`
   - Servidor: `[MYSQLHOST de Railway]`
   - Usuario: `[MYSQLUSER de Railway]`
   - Contraseña: `[MYSQLPASSWORD de Railway]`
   - Base de datos: `[MYSQLDATABASE de Railway]` o `labios_db`

5. **Ejecuta los scripts**:
   - Ve a la pestaña **"SQL command"**
   - Copia y pega cada script SQL
   - Haz clic en **"Execute"**

## ✅ Paso 4: Verificar Conexión

1. **Verifica que las tablas se crearon**:
   ```sql
   USE labios_db;
   SHOW TABLES;
   ```
   
   Deberías ver:
   - `administradores`
   - `usuarios`
   - `equipos`
   - `prestamos`
   - `reportes`

2. **Verifica que hay un administrador**:
   ```sql
   SELECT * FROM administradores;
   ```
   
   Deberías ver un registro con:
   - Email: `admin@labios.local`

3. **Prueba el login en tu aplicación**:
   - Ve a tu frontend en Render
   - Intenta iniciar sesión con:
     - Email: `admin@labios.local`
     - Contraseña: `admin123`

## 🔍 Solución de Problemas

### Error: "Access denied"
- Verifica que las credenciales en Render sean exactamente las mismas que en Railway
- Asegúrate de copiar sin espacios adicionales

### Error: "Can't connect to MySQL server"
- Verifica que el `DB_HOST` en Render sea correcto
- Railway puede usar un hostname diferente para conexiones externas
- Busca en Railway la sección **"Public Networking"** o **"Connect"** para obtener el hostname público

### Error: "Unknown database"
- Crea la base de datos manualmente:
  ```sql
  CREATE DATABASE labios_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```

### Las variables de entorno no se actualizan
- Asegúrate de hacer clic en **"Save Changes"** en Render
- Espera a que Render redeploye automáticamente
- O haz un **"Manual Deploy"** después de guardar

## 📌 Notas Importantes

1. **Railway puede cambiar el hostname**: Si el backend no se conecta, verifica las variables de entorno en Railway nuevamente
2. **Base de datos por defecto**: Railway puede crear una base de datos llamada `railway` por defecto. Puedes usarla o crear `labios_db`
3. **Puerto**: Railway MySQL generalmente usa el puerto `3306`
4. **Seguridad**: Las credenciales de Railway son seguras y únicas para tu proyecto

## 🎯 Resumen Rápido

1. ✅ Obtén credenciales de Railway (Variables o Connect)
2. ✅ Actualiza variables de entorno en Render backend
3. ✅ Conecta con MySQL Workbench usando credenciales de Railway
4. ✅ Ejecuta los 3 scripts SQL en orden
5. ✅ Verifica que todo funciona

---

¿Necesitas ayuda con algún paso específico? Avísame y te guío.
