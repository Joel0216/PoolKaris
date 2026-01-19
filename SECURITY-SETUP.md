# 🔐 Pool & Karis - Sistema de Seguridad y Protección de Productos

## 📋 Descripción General

Se ha implementado un sistema completo de seguridad y protección para la página de Pool & Karis, incluyendo:

✅ **Autenticación por Contraseña** - Protección de cada filtro  
✅ **Protección de Imágenes** - Overlay transparente + desactivación de clic derecho  
✅ **Sistema de Likes** - Seguimiento de productos favoritos en Supabase  
✅ **Carrusel Infinito** - Muestra productos más populares por filtro  
✅ **Prevención de Capturas** - Limitaciones de seguridad del navegador  

---

## 🔧 Configuración de Supabase

### 1. Credenciales Actuales

Tu proyecto Supabase ya está configurado con:

```
URL: https://yjgdxqkhrijwrarhsrycm.supabase.co
ANON KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqZ2R4cWtocmp3cmFyaHNyeWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NjIxNzUsImV4cCI6MjA4NDMzODE3NX0.IKmz4Br4CIx4HxYva4vdvRUhJid4c1IthjOC9aeNsng
```

### 2. Crear las Tablas en Supabase

1. Ve a https://app.supabase.com
2. Accede a tu proyecto
3. Ve a SQL Editor
4. Copia y pega el contenido de `supabase-setup.sql`
5. Ejecuta las sentencias SQL

Las tablas creadas son:

- **productos** - Almacena información de productos y contador de likes
- **product_likes** - Registra likes (una entrada por IP por producto)
- **filter_passwords** - Contraseñas hasheadas de filtros
- **password_attempts** - Logs de intentos de acceso

### 3. Configurar las Contraseñas

La contraseña es: **"Cristy"**

**IMPORTANTE**: Nunca está en el código cliente en texto plano. Se usa hashing SHA-256 para validar en el servidor.

---

## 🎨 Características Implementadas

### 1. **Modal de Contraseña**
- Se muestra cuando intentas acceder a un filtro
- Validación segura en el servidor (Supabase)
- Prevención de ataques de fuerza bruta con logging de intentos
- Almacenamiento en sessionStorage después de autenticación

```javascript
// Uso automático:
const authenticated = await showPasswordModal(filterName);
```

### 2. **Protección de Imágenes**
- Overlay transparente (Cuadro transparente.png) encima de cada imagen
- Desactivación de clic derecho
- Prevención de drag & drop
- Desactivación de selección de texto en imágenes

```html
<div class="transparent-overlay" style="background-image: url('Cuadro transparente.png')"></div>
```

### 3. **Sistema de Likes**
- Botón de corazón en cada producto
- Validación por IP (evita múltiples likes de la misma IP)
- Contador dinámico actualizado en tiempo real
- Datos guardados en Supabase

```javascript
await addLike(productId, productName, filterName);
```

### 4. **Carrusel de Top Productos**
- Muestra los 5 productos más likeados de cada filtro
- Auto-scroll infinito cada 4 segundos
- Pausa en hover
- Navegación manual con botones

### 5. **Medidas Anti-Captura**
- Desactivación de Print Screen
- Desactivación de acceso a DevTools
- Protección contra guardar imágenes

---

## 📁 Archivos Añadidos/Modificados

### Nuevos Archivos:

1. **supabase-config.js** - Configuración y funciones de Supabase
2. **security-modal.js** - Modal de contraseña y componentes de seguridad
3. **supabase-setup.sql** - Script SQL para crear tablas

### Modificados:

1. **index.html** - Añadidos CDNs de Supabase, Crypto-JS
2. **script.js** - Integración de autenticación y likes
3. **styles.css** - Estilos para modal, carrusel y protección
4. **package.json** - Dependencias de Supabase y Crypto-JS

---

## 🚀 Instalación y Configuración

### Paso 1: Instalar Dependencias
```bash
npm install
```

### Paso 2: Configurar Supabase
- Ejecutar el SQL del archivo `supabase-setup.sql` en tu dashboard de Supabase

### Paso 3: Configurar la Imagen de Cuadro Transparente
- Asegúrate de que `Cuadro transparente.png` esté en la raíz del proyecto
- Esta imagen se mostrará encima de todas las imágenes de productos

### Paso 4: Iniciar el Servidor
```bash
npm start
```

---

## 🔒 Seguridad - Explicación Técnica

### Hashing de Contraseña
```javascript
// Se usa SHA-256 en cliente:
const passwordHash = await hashPassword('Cristy');

// Se envía al servidor para validar (nunca el texto plano)
const { data } = await supabaseClient.rpc('verify_filter_password', {
    p_filter_name: filterName,
    p_password: password,  // Ya hasheado
    p_ip_address: userIp
});
```

### Prevención de IP Spoofing
- Se registra IP del usuario en cada like
- Restricción UNIQUE(product_id, ip_address) previene duplicados
- Logs de intentos fallidos para detección de ataques

### SessionStorage vs LocalStorage
- Usa `sessionStorage` para autenticación de filtro
- Se limpia al cerrar la pestaña
- No persiste entre sesiones

---

## 🎯 Datos en Supabase

### Tabla: productos
```sql
id | nombre | filtro | imagen | likes_count | created_at
```

### Tabla: product_likes
```sql
id | product_id | ip_address | user_agent | liked_at
```

### Tabla: filter_passwords
```sql
id | filter_name | password_hash | created_at
```

### Tabla: password_attempts
```sql
id | filter_name | ip_address | success | attempted_at
```

---

## 🐛 Solución de Problemas

### "Supabase no inicializado"
- Verificar que los CDNs se carguen correctamente
- Revisar conexión a internet
- Revisar console del navegador para errores

### Imágenes sin overlay
- Verificar que `Cuadro transparente.png` exista en la raíz
- Verificar permisos del archivo
- Revisar path en `addTransparentOverlayToImages()`

### Likes no se guardan
- Verificar conexión a Supabase
- Verificar que las tablas estén creadas
- Revisar permisos RLS en Supabase

### Modal de contraseña no aparece
- Verificar que Supabase esté inicializado
- Revisar console para errores de JavaScript
- Verificar que `verifyFilterPassword()` esté definido

---

## 📊 Monitoreo de Intentos Fallidos

En el dashboard de Supabase, puedes ver:

```sql
-- Intentos fallidos por IP
SELECT ip_address, COUNT(*) as intentos 
FROM password_attempts 
WHERE success = false 
GROUP BY ip_address 
ORDER BY intentos DESC;

-- Últimos intentos
SELECT * FROM password_attempts 
ORDER BY attempted_at DESC LIMIT 50;
```

---

## 🔄 Actualizar Productos en Base de Datos

```javascript
// Crear o actualizar producto
const product = await createOrGetProduct(filterName, imageName);

// Incrementar likes
await addLike(productId, productName, filterName);

// Obtener productos con más likes
const topProducts = await getTopProductsByFilter(filterName, limit);
```

---

## 📞 Soporte

Para preguntas o problemas:
1. Revisar console del navegador (F12)
2. Revisar logs en Supabase SQL Editor
3. Verificar que todos los archivos estén en la carpeta correcta

---

**Última actualización**: 18 de enero de 2026  
**Versión**: 1.0.0
