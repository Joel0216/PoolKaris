-- ===== TABLAS PARA POOL & KARIS =====

-- Tabla de productos con información de likes
CREATE TABLE IF NOT EXISTS productos (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  filtro TEXT NOT NULL,
  imagen TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla para rastrear likes (prevenir duplicados)
CREATE TABLE IF NOT EXISTS product_likes (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  liked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, ip_address)
);

-- Tabla para contraseñas de filtros (almacenar hash, nunca el plain text)
CREATE TABLE IF NOT EXISTS filter_passwords (
  id BIGSERIAL PRIMARY KEY,
  filter_name TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_productos_filtro ON productos(filtro);
CREATE INDEX IF NOT EXISTS idx_productos_likes ON productos(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_product_likes_product ON product_likes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_likes_ip ON product_likes(ip_address);

-- Datos iniciales: Contraseña "Cristy" con hash (bcrypt o similar)
-- Usar este hash para la contraseña "Cristy": $2a$10$VZ.b.l8JZ0n8KZ/KZ/KZ/OVZ/KZ/KZ/KZ/KZ/KZ/KZZ8KZ/KZ/KZ
-- NOTA: Esto es un ejemplo. Usar bcrypt real en la práctica.

-- Insertar contraseña para los filtros (misma para todos)
INSERT INTO filter_passwords (filter_name, password_hash) 
VALUES 
  ('Álbum Firmas', '$2a$10$VZ.b.l8JZ0n8KZ/KZ/KZ/OVZ/KZ/KZ/KZ/KZ/KZ/KZZ8KZ/KZ/KZ'),
  ('Álbum Fotos', '$2a$10$VZ.b.l8JZ0n8KZ/KZ/KZ/OVZ/KZ/KZ/KZ/KZ/KZ/KZZ8KZ/KZ/KZ'),
  ('Biblias', '$2a$10$VZ.b.l8JZ0n8KZ/KZ/KZ/OVZ/KZ/KZ/KZ/KZ/KZ/KZZ8KZ/KZ/KZ'),
  ('Canastas', '$2a$10$VZ.b.l8JZ0n8KZ/KZ/KZ/OVZ/KZ/KZ/KZ/KZ/KZ/KZZ8KZ/KZ/KZ'),
  ('Cojines', '$2a$10$VZ.b.l8JZ0n8KZ/KZ/KZ/OVZ/KZ/KZ/KZ/KZ/KZ/KZZ8KZ/KZ/KZ'),
  ('Copas', '$2a$10$VZ.b.l8JZ0n8KZ/KZ/KZ/OVZ/KZ/KZ/KZ/KZ/KZ/KZZ8KZ/KZ/KZ'),
  ('Coronas', '$2a$10$VZ.b.l8JZ0n8KZ/KZ/KZ/OVZ/KZ/KZ/KZ/KZ/KZ/KZZ8KZ/KZ/KZ'),
  ('Cubiertos', '$2a$10$VZ.b.l8JZ0n8KZ/KZ/KZ/OVZ/KZ/KZ/KZ/KZ/KZ/KZZ8KZ/KZ/KZ'),
  ('Diademas', '$2a$10$VZ.b.l8JZ0n8KZ/KZ/KZ/OVZ/KZ/KZ/KZ/KZ/KZ/KZZ8KZ/KZ/KZ'),
  ('Fistoles', '$2a$10$VZ.b.l8JZ0n8KZ/KZ/KZ/OVZ/KZ/KZ/KZ/KZ/KZ/KZZ8KZ/KZ/KZ'),
  ('Ligas y Banditas', '$2a$10$VZ.b.l8JZ0n8KZ/KZ/KZ/OVZ/KZ/KZ/KZ/KZ/KZ/KZZ8KZ/KZ/KZ'),
  ('Ramos', '$2a$10$VZ.b.l8JZ0n8KZ/KZ/KZ/OVZ/KZ/KZ/KZ/KZ/KZ/KZZ8KZ/KZ/KZ'),
  ('Tocados y Guías', '$2a$10$VZ.b.l8JZ0n8KZ/KZ/KZ/OVZ/KZ/KZ/KZ/KZ/KZ/KZZ8KZ/KZ/KZ'),
  ('velas', '$2a$10$VZ.b.l8JZ0n8KZ/KZ/KZ/OVZ/KZ/KZ/KZ/KZ/KZ/KZZ8KZ/KZ/KZ')
ON CONFLICT (filter_name) DO NOTHING;

-- Crear tabla de logs para seguridad (intentos fallidos)
CREATE TABLE IF NOT EXISTS password_attempts (
  id BIGSERIAL PRIMARY KEY,
  filter_name TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  success BOOLEAN DEFAULT FALSE,
  attempted_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_attempts_ip ON password_attempts(ip_address);
