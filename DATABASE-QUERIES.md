# 📊 Ejemplos de Consultas y Mantenimiento de Base de Datos

## Consultas Útiles para Supabase

### 1. DASHBOARD DE RENDIMIENTO

#### Productos Más Likeados (Top 10)
```sql
SELECT 
  filtro,
  imagen,
  likes_count,
  created_at,
  updated_at
FROM productos
ORDER BY likes_count DESC
LIMIT 10;
```

#### Productos Sin Likes Aún
```sql
SELECT 
  filtro,
  imagen,
  created_at
FROM productos
WHERE likes_count = 0
ORDER BY created_at DESC;
```

#### Distribución de Likes por Filtro
```sql
SELECT 
  filtro,
  COUNT(*) as total_productos,
  SUM(likes_count) as total_likes,
  AVG(likes_count)::INT as likes_promedio,
  MAX(likes_count) as max_likes
FROM productos
GROUP BY filtro
ORDER BY total_likes DESC;
```

---

### 2. SEGURIDAD Y ACCESO

#### Intentos de Acceso Exitosos (Últimas 24 horas)
```sql
SELECT 
  filter_name,
  COUNT(*) as accesos_exitosos,
  COUNT(DISTINCT ip_address) as usuarios_unicos
FROM password_attempts
WHERE success = true
AND attempted_at > NOW() - INTERVAL '24 hours'
GROUP BY filter_name
ORDER BY accesos_exitosos DESC;
```

#### Detectar Posibles Ataques de Fuerza Bruta
```sql
SELECT 
  ip_address,
  filter_name,
  COUNT(*) as intentos_fallidos,
  MIN(attempted_at) as primer_intento,
  MAX(attempted_at) as ultimo_intento
FROM password_attempts
WHERE success = false
AND attempted_at > NOW() - INTERVAL '1 hour'
GROUP BY ip_address, filter_name
HAVING COUNT(*) > 3  -- Más de 3 intentos fallidos
ORDER BY intentos_fallidos DESC;
```

#### IPs Bloqueadas (muy agresivas)
```sql
SELECT 
  ip_address,
  COUNT(*) as total_intentos_fallidos,
  COUNT(DISTINCT filter_name) as filtros_atacados
FROM password_attempts
WHERE success = false
AND attempted_at > NOW() - INTERVAL '24 hours'
GROUP BY ip_address
HAVING COUNT(*) > 10
ORDER BY total_intentos_fallidos DESC;
```

#### Historial de Acceso por Usuario (IP)
```sql
SELECT 
  ip_address,
  filter_name,
  success,
  attempted_at,
  CASE WHEN success THEN '✅' ELSE '❌' END as estado
FROM password_attempts
WHERE ip_address = '192.168.1.100'  -- Cambiar por IP real
ORDER BY attempted_at DESC
LIMIT 50;
```

---

### 3. ANÁLISIS DE LIKES

#### Usuarios Más Activos (por cantidad de likes)
```sql
SELECT 
  ip_address,
  COUNT(*) as likes_realizados,
  COUNT(DISTINCT product_id) as productos_likeados,
  MIN(liked_at) as primer_like,
  MAX(liked_at) as ultimo_like
FROM product_likes
GROUP BY ip_address
ORDER BY likes_realizados DESC
LIMIT 20;
```

#### Actividad de Likes por Hora
```sql
SELECT 
  DATE_TRUNC('hour', liked_at) as hora,
  COUNT(*) as likes_en_hora
FROM product_likes
WHERE liked_at > NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', liked_at)
ORDER BY hora DESC;
```

#### Tasa de Conversión (% de visitantes que dan like)
```sql
SELECT 
  COUNT(DISTINCT p.id) as total_productos,
  COUNT(DISTINCT pl.ip_address) as usuarios_que_likearon,
  COUNT(DISTINCT pl.product_id) as productos_likeados,
  ROUND(
    COUNT(DISTINCT pl.product_id)::NUMERIC / 
    COUNT(DISTINCT p.id) * 100, 
    2
  ) as "%_productos_likeados"
FROM productos p
LEFT JOIN product_likes pl ON p.id = pl.product_id;
```

---

### 4. LIMPIEZA Y MANTENIMIENTO

#### Eliminar Productos Sin Likes (opcional)
```sql
DELETE FROM productos
WHERE likes_count = 0
AND created_at < NOW() - INTERVAL '30 days';
```

#### Limpiar Logs de Intentos Fallidos Antiguos
```sql
DELETE FROM password_attempts
WHERE success = false
AND attempted_at < NOW() - INTERVAL '90 days';
```

#### Consolidar Estadísticas (Backup)
```sql
-- Crear tabla de respaldo
CREATE TABLE productos_backup AS
SELECT * FROM productos 
WHERE created_at < NOW() - INTERVAL '1 year';

-- Después de verificar, eliminar registros antiguos
DELETE FROM productos 
WHERE created_at < NOW() - INTERVAL '1 year';
```

---

### 5. REPORTES SEMANALES

#### Resumen Semanal
```sql
SELECT 
  'RESUMEN DE SEMANA' as tipo,
  (SELECT COUNT(*) FROM password_attempts 
   WHERE attempted_at > NOW() - INTERVAL '7 days' 
   AND success = true) as accesos_exitosos,
  (SELECT COUNT(*) FROM password_attempts 
   WHERE attempted_at > NOW() - INTERVAL '7 days' 
   AND success = false) as intentos_fallidos,
  (SELECT COUNT(*) FROM product_likes 
   WHERE liked_at > NOW() - INTERVAL '7 days') as likes_realizados,
  (SELECT COUNT(DISTINCT ip_address) FROM product_likes 
   WHERE liked_at > NOW() - INTERVAL '7 days') as usuarios_unicos;
```

#### Top 5 Filtros por Accesos
```sql
SELECT 
  filter_name,
  COUNT(*) as total_accesos,
  COUNT(CASE WHEN success THEN 1 END) as accesos_exitosos,
  COUNT(CASE WHEN NOT success THEN 1 END) as accesos_fallidos,
  ROUND(
    COUNT(CASE WHEN success THEN 1 END)::NUMERIC / 
    COUNT(*) * 100,
    1
  ) as "tasa_exito_%"
FROM password_attempts
WHERE attempted_at > NOW() - INTERVAL '7 days'
GROUP BY filter_name
ORDER BY total_accesos DESC;
```

---

## Scripts de Mantenimiento Automático

### Crear Trigger para Actualizar `updated_at`
```sql
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_timestamp_productos
BEFORE UPDATE ON productos
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_timestamp_filter_passwords
BEFORE UPDATE ON filter_passwords
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
```

### Crear Tabla de Estadísticas Diarias
```sql
CREATE TABLE IF NOT EXISTS daily_statistics (
  id BIGSERIAL PRIMARY KEY,
  stat_date DATE UNIQUE,
  total_accesos INT DEFAULT 0,
  accesos_exitosos INT DEFAULT 0,
  total_likes INT DEFAULT 0,
  usuarios_unicos INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Función para agregar estadísticas diarias
CREATE OR REPLACE FUNCTION update_daily_stats()
RETURNS void AS $$
BEGIN
  INSERT INTO daily_statistics 
    (stat_date, total_accesos, accesos_exitosos, total_likes, usuarios_unicos)
  SELECT 
    CURRENT_DATE,
    COUNT(DISTINCT p.id),
    COUNT(DISTINCT CASE WHEN p.success THEN p.id END),
    COUNT(pl.id),
    COUNT(DISTINCT pl.ip_address)
  FROM password_attempts p
  LEFT JOIN product_likes pl ON DATE(pl.liked_at) = CURRENT_DATE
  WHERE DATE(p.attempted_at) = CURRENT_DATE
  ON CONFLICT (stat_date) DO UPDATE SET
    total_accesos = EXCLUDED.total_accesos,
    accesos_exitosos = EXCLUDED.accesos_exitosos,
    total_likes = EXCLUDED.total_likes,
    usuarios_unicos = EXCLUDED.usuarios_unicos;
END;
$$ LANGUAGE plpgsql;

-- Ejecutar diariamente (se puede hacer con cron job o desde la app)
SELECT update_daily_stats();
```

---

## Exportar Datos (Backups)

### Exportar Productos a CSV
```sql
COPY (
  SELECT id, filtro, imagen, likes_count, created_at, updated_at
  FROM productos
  ORDER BY likes_count DESC
)
TO STDOUT
WITH CSV HEADER;
```

### Exportar Estadísticas de Seguridad
```sql
COPY (
  SELECT filter_name, ip_address, success, attempted_at
  FROM password_attempts
  WHERE attempted_at > NOW() - INTERVAL '30 days'
  ORDER BY attempted_at DESC
)
TO STDOUT
WITH CSV HEADER;
```

---

## Indexación para Mejor Rendimiento

### Índices Ya Creados
```sql
-- Ver todos los índices
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### Agregar Más Índices si es Necesario
```sql
-- Para búsquedas de likes por date
CREATE INDEX IF NOT EXISTS idx_product_likes_date 
ON product_likes(liked_at DESC);

-- Para búsquedas de intentos por fecha
CREATE INDEX IF NOT EXISTS idx_password_attempts_date 
ON password_attempts(attempted_at DESC);

-- Para búsquedas de productos por likes
CREATE INDEX IF NOT EXISTS idx_productos_likes_desc 
ON productos(likes_count DESC, filtro);
```

---

## Monitoreo en Tiempo Real

### Conexiones Activas
```sql
SELECT 
  usename,
  application_name,
  state,
  query,
  query_start
FROM pg_stat_activity
WHERE datname = current_database()
ORDER BY query_start DESC;
```

### Tamaño de Tablas
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS tamaño
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Restaurar de Backup (Emergencia)

```sql
-- Si necesitas restaurar todos los productos
DELETE FROM productos;

-- Insertar desde backup
INSERT INTO productos (nombre, filtro, imagen, likes_count, created_at)
VALUES 
  ('Producto1', 'Filtro1', 'imagen1.png', 0, NOW()),
  ('Producto2', 'Filtro1', 'imagen2.png', 5, NOW());

-- Insertar desde archivo CSV (si tienes)
COPY productos(nombre, filtro, imagen, likes_count)
FROM '/path/to/backup.csv'
WITH CSV HEADER;
```

---

## Pruebas de Carga

### Simular Múltiples Likes Rápido
```sql
-- Cuidado: esto agrega 100 likes a un producto en segundos
INSERT INTO product_likes (product_id, ip_address, user_agent)
SELECT 
  1,
  '192.168.1.' || (RANDOM() * 254)::INT,
  'Test User Agent'
FROM generate_series(1, 100);

-- Actualizar contador
UPDATE productos SET likes_count = (
  SELECT COUNT(*) FROM product_likes WHERE product_id = 1
) WHERE id = 1;
```

---

## Notificaciones de Alertas

### Crear Tabla de Alertas
```sql
CREATE TABLE IF NOT EXISTS alerts (
  id BIGSERIAL PRIMARY KEY,
  alert_type TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'info',
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

-- Insertar alerta si hay muchos intentos fallidos
INSERT INTO alerts (alert_type, message, severity)
SELECT 
  'SECURITY',
  'Múltiples intentos fallidos desde IP: ' || ip_address,
  'warning'
FROM password_attempts
WHERE success = false
AND attempted_at > NOW() - INTERVAL '1 hour'
GROUP BY ip_address
HAVING COUNT(*) > 5;
```

---

## Resumen de Mejores Prácticas

✅ Haz backups diarios de la BD  
✅ Revisa logs de seguridad semanalmente  
✅ Mantén índices optimizados  
✅ Limpia datos antiguos regularmente  
✅ Monitorea IPs sospechosas  
✅ Cifra todas las contraseñas (bcrypt)  
✅ Usa RLS siempre  
✅ Audita cambios importantes  

---

**Última actualización**: 18 de enero de 2026
