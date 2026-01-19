# 🚀 Guía Rápida de Instalación y Configuración

## Paso 1: Preparar el Proyecto Localmente

```bash
cd c:\Users\denic\Downloads\PoolKaris
npm install
```

---

## Paso 2: Configurar Supabase (IMPORTANTE ⚠️)

### 2.1 Crear las Tablas Base

1. Ve a https://app.supabase.com
2. Selecciona tu proyecto
3. En el menú lateral, ve a **SQL Editor**
4. Copia todo el contenido del archivo `supabase-setup.sql` (en tu proyecto)
5. Pégalo en el editor SQL
6. Haz clic en **Run** (ejecutar)

### 2.2 Configurar Políticas RLS

1. En **SQL Editor**, copia el contenido de `supabase-rls-policies.sql`
2. Ejecuta cada comando SQL por separado o todo junto
3. Esto crea funciones seguras para verificar contraseñas

**⚠️ IMPORTANTE**: Las políticas RLS protegen tu base de datos de accesos no autorizados.

### 2.3 Verificar que las Tablas se Crearon

1. Ve a **Database** en el menú lateral
2. Verifica que veas estas 4 tablas:
   - ✅ `productos`
   - ✅ `product_likes`
   - ✅ `filter_passwords`
   - ✅ `password_attempts`

---

## Paso 3: Verificar la Imagen de Watermark

**Obligatorio**: La imagen `Cuadro transparente.png` debe estar en la carpeta raíz:

```
c:\Users\denic\Downloads\PoolKaris\
├── Cuadro transparente.png  ← DEBE ESTAR AQUÍ
├── index.html
├── script.js
├── styles.css
├── supabase-config.js
├── security-modal.js
└── ... (otros archivos)
```

Si no tienes esta imagen:
- Puedes crear una imagen PNG transparente de cualquier tamaño (ejemplo: 100x100px)
- O usar una imagen con patrón/cuadrícula transparente
- Guarda como "Cuadro transparente.png" en la raíz

---

## Paso 4: Pruebas Locales

### 4.1 Iniciar Servidor Local

```bash
npm start
```

El servidor debería iniciar en `http://localhost:8080` (o el puerto que uses)

### 4.2 Probar la Contraseña

1. Abre `http://localhost:8080` en el navegador
2. Haz clic en cualquier filtro (ej: "Velas", "Ramos", etc.)
3. Debería aparecer un modal pidiendo contraseña
4. Ingresa: **Cristy**
5. Si funciona, deberías ver los productos

### 4.3 Probar los Likes

1. Dentro de los productos, busca el botón con corazón ❤️
2. Haz clic en el corazón
3. Debería cambiar a rojo y mostrar "1" like
4. Si lo intentas de nuevo desde la misma IP, dirá "Ya likeaste"

### 4.4 Probar Protección de Imágenes

1. Intenta hacer clic derecho en una imagen
2. Debería mostrar aviso "Descarga no permitida"
3. La imagen tiene un overlay transparente encima

---

## Paso 5: Verificar en Supabase

Para confirmar que todo funciona:

### 5.1 Ver Intentos de Contraseña

En Supabase SQL Editor, ejecuta:

```sql
SELECT * FROM password_attempts 
ORDER BY attempted_at DESC 
LIMIT 10;
```

Deberías ver tus intentos de login.

### 5.2 Ver Likes Registrados

```sql
SELECT product_id, COUNT(*) as total_likes
FROM product_likes
GROUP BY product_id
ORDER BY total_likes DESC;
```

### 5.3 Ver Productos

```sql
SELECT id, filtro, imagen, likes_count
FROM productos
ORDER BY likes_count DESC
LIMIT 20;
```

---

## Paso 6: Desplegar en Producción

### Opción A: Usar Vercel (Recomendado)

1. Pushea tu proyecto a GitHub
2. Ve a https://vercel.com
3. Importa tu repositorio
4. Haz clic en Deploy
5. Tu sitio estará en vivo

### Opción B: Usar Netlify

1. Crea una cuenta en https://netlify.com
2. Arrastra tu carpeta al area de drop
3. O conecta GitHub y autoriza deploy automático

### Opción C: Hosting Propio

Usa cualquier hosting que soporte archivos estáticos HTML/CSS/JS

---

## 🔐 Cambiar la Contraseña

Si quieres cambiar la contraseña de "Cristy" a otra:

### 1. Generar Hash

Usa cualquier herramienta online bcrypt hash generator:
- https://bcrypt-generator.com/
- Texto: tu nueva contraseña
- Copia el hash generado

### 2. Actualizar en Supabase

```sql
UPDATE filter_passwords
SET password_hash = 'TU_NUEVO_HASH_AQUI'
WHERE filter_name = 'Álbum Firmas';

UPDATE filter_passwords
SET password_hash = 'TU_NUEVO_HASH_AQUI'
WHERE filter_name = 'Álbum Fotos';

-- ... repite para todos los filtros
```

O actualiza todos a la vez:

```sql
UPDATE filter_passwords
SET password_hash = 'TU_NUEVO_HASH_AQUI';
```

---

## 📞 Solución de Problemas Comunes

### Problema: "Supabase no está inicializado"

**Solución:**
1. Verifica que Internet funciona
2. Abre DevTools (F12) → Console
3. Verifica que no haya errores en rojo
4. Recarga la página (F5)

### Problema: Las imágenes no tienen overlay

**Solución:**
1. Verifica que `Cuadro transparente.png` exista en la carpeta raíz
2. Verifica que el archivo sea un PNG válido
3. Abre DevTools → Console y busca errores 404

### Problema: Los likes no se guardan

**Solución:**
1. Verifica que las tablas se crearon en Supabase
2. Abre DevTools → Network y busca errores en llamadas a Supabase
3. Verifica que el anon key sea correcto en `supabase-config.js`

### Problema: Modal de contraseña no aparece

**Solución:**
1. Verifica que `security-modal.js` se cargue en `index.html`
2. Abre DevTools → Console y busca "ReferenceError: showPasswordModal is not defined"
3. Recarga la página completa (Ctrl+Shift+R)

### Problema: Contraseña incorrecta siempre

**Solución:**
1. Verifica que escribas "Cristy" exactamente (mayúscula en C)
2. Verifica en Supabase que el hash de la contraseña esté guardado
3. Intenta cambiar la contraseña según la sección anterior

---

## 📊 Monitoreo Diario

Usa estos comandos SQL para monitorear tu sitio:

### Intentos fallidos de acceso (ataques potenciales)
```sql
SELECT 
  ip_address, 
  COUNT(*) as intentos_fallidos,
  MAX(attempted_at) as ultimo_intento
FROM password_attempts
WHERE success = false 
AND attempted_at > NOW() - INTERVAL '1 hour'
GROUP BY ip_address
ORDER BY intentos_fallidos DESC;
```

### Productos más populares
```sql
SELECT 
  filtro,
  imagen,
  likes_count
FROM productos
WHERE likes_count > 0
ORDER BY likes_count DESC
LIMIT 20;
```

### Estadísticas de acceso
```sql
SELECT 
  DATE(attempted_at) as fecha,
  COUNT(*) as total_intentos,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) as intentos_exitosos
FROM password_attempts
GROUP BY DATE(attempted_at)
ORDER BY fecha DESC;
```

---

## 🎯 Checklist Final

- [ ] Descargué npm (npm install)
- [ ] Ejecuté supabase-setup.sql en Supabase
- [ ] Ejecuté supabase-rls-policies.sql en Supabase
- [ ] Tengo `Cuadro transparente.png` en la carpeta raíz
- [ ] npm start funciona sin errores
- [ ] Puedo ingresar contraseña "Cristy"
- [ ] Veo los productos después de autenticar
- [ ] El botón de like funciona
- [ ] Los likes se guardan en Supabase
- [ ] Veo el carrusel de productos populares
- [ ] Las imágenes tienen overlay transparente

---

## 📧 Próximos Pasos Opcionales

1. **Agregar análisis**: Integra Google Analytics para ver qué productos se visualizan más
2. **Enviar notificaciones**: Cuando un producto se likee mucho, envía email a admin
3. **Dashboard de administrador**: Crea página para ver estadísticas de likes
4. **Exportar datos**: Crea reporte mensual de productos populares

---

**¿Necesitas ayuda?**  
Abre DevTools (F12) y revisa la consola para errores específicos.

Última actualización: 18 de enero de 2026
