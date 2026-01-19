-- RLS POLICIES PARA POOL & KARIS

ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE filter_passwords ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read all productos"
ON productos FOR SELECT
USING (true);

CREATE POLICY "Allow update productos"
ON productos FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow insert product_likes"
ON product_likes FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow read product_likes"
ON product_likes FOR SELECT
USING (true);

CREATE POLICY "Never allow read passwords"
ON filter_passwords FOR SELECT
USING (false);

CREATE POLICY "Allow insert password_attempts"
ON password_attempts FOR INSERT
WITH CHECK (true);

-- Función para verificar contraseña
CREATE OR REPLACE FUNCTION verify_filter_password(
  p_filter_name TEXT,
  p_password TEXT,
  p_ip_address TEXT
)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
DECLARE
  stored_hash TEXT;
  password_hash TEXT;
BEGIN
  -- Obtener hash almacenado
  SELECT password_hash INTO stored_hash
  FROM filter_passwords
  WHERE filter_name = p_filter_name;
  
  IF stored_hash IS NULL THEN
    -- Registrar intento fallido
    INSERT INTO password_attempts (filter_name, ip_address, success)
    VALUES (p_filter_name, p_ip_address, false);
    
    RETURN QUERY SELECT false, 'Filtro no encontrado'::text;
    RETURN;
  END IF;
  
  -- Hash de la contraseña ingresada (en un caso real, usar bcrypt)
  password_hash := crypt(p_password, stored_hash);
  
  IF password_hash = stored_hash THEN
    -- Contraseña correcta
    INSERT INTO password_attempts (filter_name, ip_address, success)
    VALUES (p_filter_name, p_ip_address, true);
    
    RETURN QUERY SELECT true, 'Acceso concedido'::text;
  ELSE
    -- Contraseña incorrecta
    INSERT INTO password_attempts (filter_name, ip_address, success)
    VALUES (p_filter_name, p_ip_address, false);
    
    RETURN QUERY SELECT false, 'Contraseña incorrecta'::text;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener top productos
CREATE OR REPLACE FUNCTION get_top_products_by_filter(
  p_filter_name TEXT,
  p_limit INT DEFAULT 5
)
RETURNS TABLE(
  id BIGINT,
  nombre TEXT,
  imagen TEXT,
  likes_count INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    productos.id,
    productos.nombre,
    productos.imagen,
    productos.likes_count
  FROM productos
  WHERE productos.filtro = p_filter_name
  ORDER BY productos.likes_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
