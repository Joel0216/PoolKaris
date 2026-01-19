// ===== MODAL DE CONTRASEÑA =====

function createPasswordModal(filterName) {
    const modal = document.createElement('div');
    modal.className = 'password-modal-overlay';
    modal.id = `password-modal-${filterName}`;
    
    modal.innerHTML = `
        <div class="password-modal">
            <div class="password-modal-content">
                <button class="password-modal-close" aria-label="Cerrar">×</button>
                
                <div class="password-modal-header">
                    <h2>Acceso Restringido</h2>
                    <p>Ingresa la contraseña para ver los productos de <strong>${filterName}</strong></p>
                </div>
                
                <form class="password-form" id="password-form-${filterName}">
                    <div class="form-group">
                        <input 
                            type="password" 
                            id="password-input-${filterName}" 
                            placeholder="Contraseña" 
                            class="password-input"
                            autocomplete="off"
                            required
                        />
                    </div>
                    
                    <button type="submit" class="btn-verify-password">
                        <span>Verificar Acceso</span>
                    </button>
                    
                    <div class="password-error" id="password-error-${filterName}"></div>
                    <div class="password-success" id="password-success-${filterName}"></div>
                </form>
                
                <div class="password-info">
                    <small>Información de los productos protegida</small>
                </div>
            </div>
        </div>
    `;
    
    return modal;
}

function showPasswordModal(filterName) {
    // Verificar si ya está autenticado
    if (isFilterAuthenticated(filterName)) {
        return Promise.resolve(true);
    }
    
    // Limpiar modales anteriores
    const existingModal = document.getElementById(`password-modal-${filterName}`);
    if (existingModal) {
        existingModal.remove();
    }
    
    // Crear y mostrar nuevo modal
    const modal = createPasswordModal(filterName);
    document.body.appendChild(modal);
    
    // Mostrar con animación
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    return new Promise((resolve) => {
        const closeModal = () => {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        };
        
        const closeButton = modal.querySelector('.password-modal-close');
        closeButton.addEventListener('click', () => {
            closeModal();
            resolve(false);
        });
        
        // Cerrar al hacer clic fuera del modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
                resolve(false);
            }
        });
        
        const form = modal.querySelector(`#password-form-${filterName}`);
        const passwordInput = modal.querySelector(`#password-input-${filterName}`);
        const errorDiv = modal.querySelector(`#password-error-${filterName}`);
        const successDiv = modal.querySelector(`#password-success-${filterName}`);
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const password = passwordInput.value;
            const submitButton = form.querySelector('button[type="submit"]');
            
            // Deshabilitar botón durante verificación
            submitButton.disabled = true;
            submitButton.innerHTML = '<span>Verificando...</span>';
            errorDiv.textContent = '';
            successDiv.textContent = '';
            
            try {
                // Llamar función de Supabase
                const isValid = await verifyFilterPassword(filterName, password);
                
                if (isValid) {
                    successDiv.textContent = '✓ Acceso concedido';
                    passwordInput.value = '';
                    
                    setTimeout(() => {
                        closeModal();
                        resolve(true);
                    }, 500);
                } else {
                    errorDiv.textContent = '✗ Contraseña incorrecta. Intenta nuevamente.';
                    passwordInput.value = '';
                    passwordInput.focus();
                }
            } catch (error) {
                errorDiv.textContent = '✗ Error al verificar. Intenta más tarde.';
                console.error(error);
            } finally {
                submitButton.disabled = false;
                submitButton.innerHTML = '<span>Verificar Acceso</span>';
            }
        });
        
        // Enfocar input automáticamente
        passwordInput.focus();
    });
}

// ===== MODAL DE CARRUSEL TOP PRODUCTOS =====

function createTopProductsCarousel(filterName, products) {
    if (!products || products.length === 0) {
        return null;
    }
    
    const carousel = document.createElement('div');
    carousel.className = 'top-products-carousel';
    
    let itemsHTML = '';
    products.forEach((product, index) => {
        const imagePath = `Filtros/${filterName}/${filterName}/${product.imagen}`;
        itemsHTML += `
            <div class="carousel-item" data-index="${index}">
                <div class="carousel-product-image">
                    <img src="${imagePath}" alt="${product.nombre}" loading="lazy" />
                    <div class="carousel-overlay"></div>
                </div>
                <div class="carousel-product-info">
                    <span class="product-likes-badge">❤️ ${product.likes_count}</span>
                </div>
            </div>
        `;
    });
    
    carousel.innerHTML = `
        <div class="carousel-header">
            <h3>🏆 Productos Favoritos</h3>
        </div>
        <div class="carousel-container">
            <button class="carousel-prev" aria-label="Anterior">‹</button>
            <div class="carousel-track">
                ${itemsHTML}
            </div>
            <button class="carousel-next" aria-label="Siguiente">›</button>
        </div>
    `;
    
    // Agregar funcionalidad de carousel
    setupCarousel(carousel);
    
    return carousel;
}

function setupCarousel(carouselEl) {
    const track = carouselEl.querySelector('.carousel-track');
    const items = carouselEl.querySelectorAll('.carousel-item');
    const prevBtn = carouselEl.querySelector('.carousel-prev');
    const nextBtn = carouselEl.querySelector('.carousel-next');
    
    let currentIndex = 0;
    let isAnimating = false;
    
    const itemWidth = 150; // ancho de cada item en px
    const gap = 10; // gap entre items
    
    function updateCarousel() {
        const offset = -currentIndex * (itemWidth + gap);
        track.style.transform = `translateX(${offset}px)`;
    }
    
    function nextSlide() {
        if (isAnimating) return;
        isAnimating = true;
        
        currentIndex = (currentIndex + 1) % items.length;
        updateCarousel();
        
        setTimeout(() => {
            isAnimating = false;
        }, 300);
    }
    
    function prevSlide() {
        if (isAnimating) return;
        isAnimating = true;
        
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        updateCarousel();
        
        setTimeout(() => {
            isAnimating = false;
        }, 300);
    }
    
    // Auto-scroll infinito
    let autoScrollInterval = setInterval(() => {
        nextSlide();
    }, 4000);
    
    // Pausar en hover
    carouselEl.addEventListener('mouseenter', () => {
        clearInterval(autoScrollInterval);
    });
    
    carouselEl.addEventListener('mouseleave', () => {
        autoScrollInterval = setInterval(() => {
            nextSlide();
        }, 4000);
    });
    
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);
    
    updateCarousel();
}

// ===== PROTECCIÓN CONTRA CLIC DERECHO EN IMÁGENES =====

function protectProductImages(container) {
    const images = container.querySelectorAll('img');
    
    images.forEach(img => {
        // Prevenir clic derecho
        img.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showToast('Descarga no permitida', 'warning');
            return false;
        });
        
        // Agregar clases para CSS (deshabilitar drag, selección, etc)
        img.classList.add('protected-image');
        
        // Prevenir drag
        img.addEventListener('dragstart', (e) => {
            e.preventDefault();
            return false;
        });
        
        // Agregar marcas de agua invisible (overlay)
        if (!img.parentElement.querySelector('.image-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'image-overlay protected-overlay';
            img.parentElement.style.position = 'relative';
            img.parentElement.appendChild(overlay);
        }
    });
}

// ===== OVERLAY TRANSPARENTE PARA IMÁGENES =====

function addTransparentOverlayToImages(container) {
    const images = container.querySelectorAll('img');
    
    images.forEach(img => {
        if (img.parentElement.querySelector('.transparent-overlay')) {
            return; // Ya tiene overlay
        }
        
        const overlay = document.createElement('div');
        overlay.className = 'transparent-overlay';
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            background-image: url('Cuadro transparente.png');
            background-size: cover;
            background-repeat: no-repeat;
            background-position: center;
        `;
        
        const parent = img.parentElement;
        parent.style.position = 'relative';
        parent.appendChild(overlay);
    });
}

// ===== FUNCIONES DE SEGURIDAD ADICIONALES =====

function disableScreenCapture() {
    // Nota: Esta es una medida limitada. No hay forma 100% segura de prevenir screenshots
    // pero podemos desactivar algunas funciones
    
    // Desactivar Print Screen en Chrome/Edge
    document.addEventListener('keydown', (e) => {
        if (e.key === 'PrintScreen') {
            e.preventDefault();
            showToast('Screenshot no permitido', 'warning');
        }
    });
    
    // Desactivar acceso a DevTools en ciertos navegadores
    setInterval(() => {
        const devtools = /./;
        devtools.toString = function() {
            return "❌ Acceso denegado";
        };
        console.log('%c', devtools);
    }, 100);
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}
