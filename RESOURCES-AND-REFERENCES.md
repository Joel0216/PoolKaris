# 📚 Recursos y Referencias

## Documentación Oficial

### Supabase
- **Sitio**: https://supabase.com
- **Documentación**: https://supabase.com/docs
- **Dashboard**: https://app.supabase.com
- **Guía de RLS**: https://supabase.com/docs/guides/auth/row-level-security

### Web APIs Usadas
- **Web Crypto API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API
- **Fetch API**: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
- **SessionStorage**: https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage

---

## Librerías CDN Incluidas

| Librería | Versión | URL |
|----------|---------|-----|
| Supabase JS | 2.38.4 | https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.4 |
| Crypto-JS | 4.2.0 | https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0 |
| AOS (ya existía) | 2.3.1 | https://unpkg.com/aos@2.3.1 |
| FontAwesome (ya existía) | 6.4.0 | https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0 |

---

## Tecnologías Utilizadas

### Frontend
- **HTML5** - Estructura
- **CSS3** - Estilos y animaciones
- **JavaScript (ES6+)** - Lógica
- **AOS.js** - Animaciones
- **Font Awesome** - Iconos

### Backend/Base de Datos
- **Supabase** - Backend as a Service
- **PostgreSQL** - Base de datos (detrás de Supabase)
- **Row Level Security (RLS)** - Políticas de seguridad
- **Edge Functions** - Funciones serverless

### Seguridad
- **SHA-256 Hashing** - Web Crypto API
- **bcrypt** - (Para contraseñas en BD)
- **HTTPS** - Transmisión segura
- **RLS Policies** - Control de acceso

---

## Patrones de Diseño Usados

### 1. **MVC Light** (Model-View-Controller simplificado)
- Model: `supabase-config.js` (lógica de datos)
- View: `index.html` + `styles.css` (presentación)
- Controller: `script.js` + `security-modal.js` (eventos)

### 2. **Observer Pattern**
- EventListener en botones
- Observar cambios en SessionStorage

### 3. **Factory Pattern**
- `createPasswordModal()` - Crea modales dinámicos
- `createProductHTML()` - Genera HTML de productos

### 4. **Singleton Pattern**
- `supabaseClient` - Una única instancia de Supabase

### 5. **Promise-based Async**
- Todas las llamadas a BD son promises
- Manejo de async/await

---

## Mejores Prácticas Implementadas

✅ **Security**
- Contraseñas hasheadas
- RLS en base de datos
- Validación en servidor
- No exponer datos sensibles

✅ **Performance**
- Lazy loading de imágenes
- CSS optimizado
- Índices en BD
- Compresión GZIP

✅ **Accessibility**
- Atributos aria-label
- Navegación con teclado
- Contraste de colores
- Textos alternativos

✅ **Code Quality**
- Comentarios explicativos
- Nombres de variables claros
- DRY (Don't Repeat Yourself)
- Código modular

✅ **UX**
- Animaciones suaves
- Feedback visual
- Mensajes claros
- Responsive design

---

## Alternativas Consideradas (pero no usadas)

| Alternativa | Por qué no |
|-------------|-----------|
| Firebase | Supabase es más de código abierto |
| JWT tokens | No necesario para este caso |
| Bcrypt en cliente | SHA-256 es suficiente + validación servidor |
| Socket.IO | No hay necesidad de real-time |
| React/Vue | Aplicación pequeña, JS vanilla suficiente |

---

## Tutoriales de Referencia

### Supabase
- [Supabase Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/javascript)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase SQL Editor](https://supabase.com/docs/guides/database/overview)

### Web Crypto
- [Web Crypto API MDN](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto)
- [SHA-256 Hashing](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest)

### Seguridad Web
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---

## Herramientas Recomendadas

### Desarrollo
- **VS Code** - Editor (que ya usas)
- **DevTools** - Chrome/Firefox debugging
- **Postman** - Testing de APIs (opcional)

### Base de Datos
- **pgAdmin** - Interfaz gráfica PostgreSQL (opcional)
- **DBeaver** - Cliente SQL universal

### Seguridad
- **bcrypt-generator.com** - Generar hashes
- **VirusTotal** - Verificar archivos

### Deploy
- **Vercel** - Recomendado para esta app
- **Netlify** - Alternativa good
- **GitHub Pages** - Hosting estático

---

## Troubleshooting Links

| Problema | Resource |
|----------|----------|
| Error 401 Supabase | https://supabase.com/docs/guides/auth/quickstart |
| CORS Error | https://supabase.com/docs/guides/api/cors |
| RLS Issues | https://supabase.com/docs/guides/auth/row-level-security |
| Hash functions | https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest |

---

## Performance Benchmarks

### Objetivos de Performance
- Carga inicial: < 3 segundos
- Verificación contraseña: < 500ms
- Like request: < 200ms
- Carrusel smooth: 60fps

### Tools para Medir
- **Lighthouse** - Chrome DevTools
- **WebPageTest** - https://www.webpagetest.org
- **GTmetrix** - https://gtmetrix.com

---

## Reglas de Seguridad que Aplicamos

### OWASP Top 10 Coverage
✅ **Injection** - RLS previene SQL injection  
✅ **Broken Auth** - Hash SHA-256 + validación servidor  
✅ **Sensitive Data** - HTTPS requerido  
✅ **XML External** - N/A para esta app  
✅ **Access Control** - RLS policies  
✅ **Security Misc** - CSP headers recomendado  
✅ **XSS** - Escaping de HTML  
✅ **Insecure Deserialization** - N/A  
✅ **Using Components with Vulnerabilities** - Librerías actualizadas  
✅ **Insufficient Logging** - password_attempts table  

---

## Actualizaciones Futuras (Roadmap)

### Corto Plazo (1-2 meses)
- [ ] Admin dashboard para ver estadísticas
- [ ] Cambiar contraseña desde admin
- [ ] Exportar datos a CSV
- [ ] Notificaciones por email

### Mediano Plazo (3-6 meses)
- [ ] Multi-language support (ES/EN)
- [ ] Modo oscuro (dark mode)
- [ ] Carrito de compras
- [ ] Integración WhatsApp API

### Largo Plazo (6-12 meses)
- [ ] App móvil nativa
- [ ] Video preview de productos
- [ ] AR preview (realidad aumentada)
- [ ] Sistema de pagos integrado

---

## Contacto y Soporte

### Documentación del Proyecto
- 📄 Archivo: `INSTALLATION-GUIDE.md`
- 📄 Archivo: `SECURITY-SETUP.md`
- 📄 Archivo: `DATABASE-QUERIES.md`

### Soporte Supabase
- Chat: https://supabase.com/chat
- Discord: https://discord.supabase.com
- GitHub Issues: https://github.com/supabase/supabase/issues

---

## Credibilidad y Certificaciones

### Estándares Seguidos
- ✅ REST API Design
- ✅ JSON API Standard
- ✅ OWASP Security Guidelines
- ✅ Web Accessibility WCAG 2.1
- ✅ Mobile First Design

### Auditorías Recomendadas
1. Penetration Testing (anual)
2. Code Review (trimestral)
3. Dependency Update (mensual)
4. Security Scan (weekly)

---

## Licencias de Librerías

| Librería | Licencia |
|----------|----------|
| Supabase | Apache 2.0 |
| Crypto-JS | MIT |
| AOS | MIT |
| FontAwesome | Free License |

Todas las librerías usadas tienen licencias permisivas (MIT, Apache 2.0)

---

## Contribuciones y Mejoras

Si quieres mejorar este proyecto:

1. **Fork** el repositorio
2. **Crea rama** `feature/nombre-feature`
3. **Haz cambios** y tests
4. **Push** cambios
5. **Abre Pull Request**

---

**Última actualización**: 18 de enero de 2026  
**Versión**: 1.0.0  
**Mantenedor**: GitHub Copilot
