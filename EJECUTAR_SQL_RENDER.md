# 📝 Guía: Ejecutar Scripts SQL en Render

Esta guía te ayudará a ejecutar los scripts SQL necesarios para inicializar la base de datos en Render.

## ⚠️ IMPORTANTE: Verificar Tipo de Base de Datos

**Render puede crear PostgreSQL en lugar de MySQL**. Verifica antes de continuar:

- **PostgreSQL**: Hostname empieza con `dpg-`, puerto `5432` ❌
- **MySQL**: Hostname diferente, puerto `3306` ✅

**Si tienes PostgreSQL**, consulta `SOLUCION_POSTGRESQL_RENDER.md` para solucionarlo.

## 🔍 Paso 1: Obtener Credenciales de Render

1. Ve a tu dashboard de Render: https://dashboard.render.com
2. Haz clic en el servicio **labios-db** (base de datos)
3. En la pestaña **"Info"** o **"Connect"**, encontrarás:
   - **Internal Database URL**: `mysql://labios_user:password@host:port/labios_db`
   - O las credenciales individuales:
     - **Host**: (ejemplo: `mysql-xxxxx` o `dpg-xxxxx` - verifica que sea MySQL)
     - **Port**: `3306` para MySQL, `5432` para PostgreSQL
     - **Database**: `labios_db`
     - **User**: `labios_user`
     - **Password**: (contraseña generada)

**⚠️ Si el puerto es 5432 o el hostname empieza con `dpg-`, tienes PostgreSQL, no MySQL.**

## 🛠️ Método Recomendado: MySQL Workbench

### Instalación

1. Descarga MySQL Workbench: https://dev.mysql.com/downloads/workbench/
2. Instálalo (es gratuito)

### Conexión

1. Abre MySQL Workbench
2. Haz clic en el **"+"** junto a "MySQL Connections"
3. Configura la conexión:
   ```
   Connection Name: Render LabIOS
   Hostname: [HOST de Render]
   Port: 3306
   Username: labios_user
   Password: [Contraseña de Render]
   Default Schema: labios_db
   ```
4. Haz clic en **"Test Connection"** para verificar
5. Haz clic en **"OK"** y luego **"Connect"**

### Ejecutar Scripts

1. **Abre el primer script**:
   - Abre `database/schema.sql` en un editor de texto (VS Code, Notepad++)
   - Selecciona TODO el contenido (Ctrl+A)
   - Copia (Ctrl+C)

2. **Pega en MySQL Workbench**:
   - En MySQL Workbench, haz clic en la pestaña **"Query 1"**
   - Pega el contenido (Ctrl+V)
   - Haz clic en el botón ⚡ (Execute) o presiona F9

3. **Verifica que se ejecutó correctamente**:
   - Deberías ver "Query OK" en la parte inferior
   - Si hay errores, revísalos y corrígelos

4. **Repite con los otros scripts**:
   - `database/seed_inventario.sql`
   - `database/seed_prestamos.sql`

## 🌐 Método Alternativo: Adminer (Docker Local)

Si prefieres usar Adminer desde tu máquina local:

### 1. Levantar Adminer

```bash
cd docker
docker-compose up -d adminer
```

### 2. Acceder a Adminer

Abre tu navegador en: http://localhost:8082

### 3. Conectar a Render

En la pantalla de login de Adminer:

- **Sistema**: `MySQL`
- **Servidor**: `[HOST_DE_RENDER]` (sin el puerto, solo el hostname)
- **Usuario**: `labios_user`
- **Contraseña**: `[Contraseña de Render]`
- **Base de datos**: `labios_db`

Haz clic en **"Entrar"**

### 4. Ejecutar Scripts

1. Haz clic en la pestaña **"SQL command"** (arriba)
2. Abre `database/schema.sql` en un editor de texto
3. Copia TODO el contenido
4. Pégalo en el área de texto de Adminer
5. Haz clic en **"Execute"** (Ejecutar)
6. Repite con los otros dos scripts

## 💻 Método CLI (Línea de Comandos)

Si tienes `mysql` instalado en tu sistema:

```bash
# Ejecutar schema.sql
mysql -h [HOST_DE_RENDER] -P 3306 -u labios_user -p labios_db < database/schema.sql

# Ejecutar seed_inventario.sql
mysql -h [HOST_DE_RENDER] -P 3306 -u labios_user -p labios_db < database/seed_inventario.sql

# Ejecutar seed_prestamos.sql
mysql -h [HOST_DE_RENDER] -P 3306 -u labios_user -p labios_db < database/seed_prestamos.sql
```

**Nota**: Te pedirá la contraseña después de cada comando. Ingresa la contraseña de Render.

## ✅ Verificar que Funcionó

Después de ejecutar los scripts, verifica que las tablas se crearon:

1. En MySQL Workbench o Adminer, ejecuta:
```sql
SHOW TABLES;
```

Deberías ver:
- `administradores`
- `usuarios`
- `equipos`
- `prestamos`
- `reportes`

2. Verifica que hay un administrador por defecto:
```sql
SELECT * FROM administradores;
```

Deberías ver un registro con:
- Email: `admin@labios.local`
- Password hash: (un hash largo)

## 🔐 Credenciales por Defecto

Después de ejecutar `seed_prestamos.sql`, podrás iniciar sesión con:

- **Email**: `admin@labios.local`
- **Contraseña**: `admin123`

## ❌ Solución de Problemas

### Error: "Access denied"
- Verifica que las credenciales sean correctas
- Asegúrate de usar el usuario `labios_user`, no `root`

### Error: "Can't connect to MySQL server"
- Verifica que el Host de Render sea correcto
- Asegúrate de que el puerto sea `3306`
- Verifica tu conexión a internet

### Error: "Table already exists"
- Esto significa que ya ejecutaste `schema.sql`
- Puedes continuar con los otros scripts
- O elimina las tablas y vuelve a ejecutar

### Error: "Unknown database 'labios_db'"
- La base de datos debería crearse automáticamente en Render
- Si no existe, créala manualmente:
```sql
CREATE DATABASE labios_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 📚 Archivos SQL a Ejecutar

Asegúrate de ejecutar los scripts en este orden:

1. ✅ `database/schema.sql` - Crea todas las tablas
2. ✅ `database/seed_inventario.sql` - Agrega equipos de ejemplo
3. ✅ `database/seed_prestamos.sql` - Agrega administrador y datos de ejemplo

---

¿Necesitas ayuda? Revisa los logs de Render o consulta la documentación de MySQL.
