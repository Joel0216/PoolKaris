// ===== CONFIGURACIÓN DE SUPABASE =====
// Credenciales de tu proyecto Supabase

const SUPABASE_URL = 'https://yjgdxqkhrijwrarhsrycm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqZ2R4cWtocmp3cmFyaHNyeWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NjIxNzUsImV4cCI6MjA4NDMzODE3NX0.IKmz4Br4CIx4HxYva4vdvRUhJid4c1IthjOC9aeNsng';

// Inicializar cliente de Supabase (requiere cargar desde CDN en HTML)
let supabaseClient = null;

async function initSupabase() {
    if (typeof window.supabase === 'undefined') {
        console.warn('Supabase JS no está cargado');
        return false;
    }
    
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✓ Supabase conectado correctamente');
        return true;
    } catch (error) {
        console.error('Error inicializando Supabase:', error);
        return false;
    }
}

// ===== FUNCIONES DE CONTRASEÑA =====
// Usar hashing para evitar enviar plain text

async function hashPassword(password) {
    // Usar Web Crypto API para hash SHA-256
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

async function verifyFilterPassword(filterName, password) {
    if (!supabaseClient) {
        console.error('Supabase no inicializado');
        return false;
    }

    try {
        // Obtener IP del usuario (aproximadamente)
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        const userIp = ipData.ip;

        // Hash de la contraseña ingresada
        const passwordHash = await hashPassword(password);

        // Enviar a función Edge (será más seguro que verificar en cliente)
        // Por ahora, hacer una llamada a verificación simple
        const { data, error } = await supabaseClient
            .rpc('verify_filter_password', {
                p_filter_name: filterName,
                p_password: password,
                p_ip_address: userIp
            });

        if (error) {
            console.error('Error verificando contraseña:', error);
            recordPasswordAttempt(filterName, userIp, false);
            return false;
        }

        if (data && data.success) {
            recordPasswordAttempt(filterName, userIp, true);
            // Guardar en sessionStorage que este filtro fue autenticado
            sessionStorage.setItem(`filter_auth_${filterName}`, 'true');
            return true;
        }

        recordPasswordAttempt(filterName, userIp, false);
        return false;

    } catch (error) {
        console.error('Error en verificación:', error);
        return false;
    }
}

async function recordPasswordAttempt(filterName, ipAddress, success) {
    if (!supabaseClient) return;

    try {
        await supabaseClient
            .from('password_attempts')
            .insert([{
                filter_name: filterName,
                ip_address: ipAddress,
                success: success
            }]);
    } catch (error) {
        console.error('Error registrando intento:', error);
    }
}

function isFilterAuthenticated(filterName) {
    return sessionStorage.getItem(`filter_auth_${filterName}`) === 'true';
}

// ===== FUNCIONES DE LIKES =====

async function addLike(productId, productName, filterName) {
    if (!supabaseClient) return false;

    try {
        // Obtener IP aproximada del usuario
        const ipResponse = await fetch('https://api.ipify.org?format=json').catch(() => null);
        const userIp = ipResponse ? (await ipResponse.json()).ip : 'unknown';

        // Insertar like
        const { error } = await supabaseClient
            .from('product_likes')
            .insert([{
                product_id: productId,
                ip_address: userIp,
                user_agent: navigator.userAgent.substring(0, 200)
            }]);

        if (error) {
            if (error.code === '23505') {
                // Unique constraint - ya existe un like de esta IP
                console.log('Ya likeaste este producto');
                return false;
            }
            console.error('Error agregando like:', error);
            return false;
        }

        // Actualizar contador en tabla productos
        const { data: currentProduct } = await supabaseClient
            .from('productos')
            .select('likes_count')
            .eq('id', productId)
            .single();

        const newCount = (currentProduct?.likes_count || 0) + 1;

        await supabaseClient
            .from('productos')
            .update({ likes_count: newCount })
            .eq('id', productId);

        return true;

    } catch (error) {
        console.error('Error en addLike:', error);
        return false;
    }
}

async function getLikeCount(productId) {
    if (!supabaseClient) return 0;

    try {
        const { data, error } = await supabaseClient
            .from('productos')
            .select('likes_count')
            .eq('id', productId)
            .single();

        return error ? 0 : (data?.likes_count || 0);
    } catch (error) {
        console.error('Error obteniendo likes:', error);
        return 0;
    }
}

async function getTopProductsByFilter(filterName, limit = 5) {
    if (!supabaseClient) return [];

    try {
        const { data, error } = await supabaseClient
            .from('productos')
            .select('id, nombre, imagen, likes_count')
            .eq('filtro', filterName)
            .order('likes_count', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error obteniendo top productos:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error en getTopProductsByFilter:', error);
        return [];
    }
}

async function createOrGetProduct(filterName, imageName) {
    if (!supabaseClient) return null;

    try {
        // Intentar obtener producto existente
        let { data, error } = await supabaseClient
            .from('productos')
            .select('id')
            .eq('filtro', filterName)
            .eq('imagen', imageName)
            .single();

        if (!error && data) {
            return data;
        }

        // Si no existe, crear
        const { data: newProduct, error: insertError } = await supabaseClient
            .from('productos')
            .insert([{
                nombre: imageName,
                filtro: filterName,
                imagen: imageName,
                likes_count: 0
            }])
            .select()
            .single();

        if (insertError) {
            console.error('Error creando producto:', insertError);
            return null;
        }

        return newProduct;

    } catch (error) {
        console.error('Error en createOrGetProduct:', error);
        return null;
    }
}
