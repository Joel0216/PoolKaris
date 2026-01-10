// ===== CONFIGURACIÓN INICIAL =====
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
});

function initializeWebsite() {
    // Detectar dispositivo móvil
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Inicializar AOS (Animate On Scroll) con configuración optimizada para móviles
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: isMobile ? 600 : 800,
            easing: 'ease-in-out',
            once: true,
            offset: isMobile ? 50 : 100,
            disable: function() {
                // Deshabilitar en pantallas muy pequeñas para mejor rendimiento
                return window.innerWidth < 320;
            }
        });
    }
    
    // Inicializar todas las funcionalidades
    initializeLoading();
    initializeNavigation();
    initializeScrollEffects();
    initializeProductCards();
    initializeBackToTop();
    initializeImageLazyLoading();
    initializeAnimations();
    initializeContactForms();
    initializeMobileOptimizations();
}

// ===== OPTIMIZACIONES MÓVILES =====
function initializeMobileOptimizations() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        // Optimizar background-attachment para móviles
        const body = document.body;
        const header = document.querySelector('.fixed-header');
        
        // Cambiar background-attachment a scroll en móviles para mejor rendimiento
        body.style.backgroundAttachment = 'scroll';
        if (header) {
            header.style.backgroundAttachment = 'scroll';
        }
        
        // Reducir animaciones en dispositivos de baja potencia
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
            document.documentElement.style.setProperty('--transition-fast', '0.2s ease');
            document.documentElement.style.setProperty('--transition-medium', '0.3s ease');
            document.documentElement.style.setProperty('--transition-slow', '0.4s ease');
        }
        
        // Optimizar scroll en iOS
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            document.body.style.webkitOverflowScrolling = 'touch';
        }
        
        // Mejorar rendimiento de hover en touch devices
        addTouchSupport();
    }
}

function addTouchSupport() {
    // Reemplazar hover con touch events para mejor experiencia móvil
    const productCards = document.querySelectorAll('.product-card');
    const contactBtns = document.querySelectorAll('.contact-btn');
    const navButtons = document.querySelectorAll('.nav-button');
    
    [...productCards, ...contactBtns, ...navButtons].forEach(element => {
        element.addEventListener('touchstart', function() {
            this.classList.add('touch-active');
        });
        
        element.addEventListener('touchend', function() {
            setTimeout(() => {
                this.classList.remove('touch-active');
            }, 150);
        });
    });
}

// ===== LOADING SCREEN =====
function initializeLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    // Simular tiempo de carga
    setTimeout(() => {
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
            // Remover del DOM después de la animación
            setTimeout(() => {
                loadingOverlay.remove();
            }, 800);
        }
    }, 2000);
}

// ===== NAVEGACIÓN MEJORADA =====
function initializeNavigation() {
    // Smooth scrolling para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.fixed-header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Agregar efecto visual al botón clickeado
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            }
        });
    });
}

// ===== EFECTOS DE SCROLL OPTIMIZADOS =====
function initializeScrollEffects() {
    let lastScrollTop = 0;
    let scrollTimeout;
    let ticking = false;
    const isMobile = window.innerWidth <= 768;

    function updateScrollEffects() {
        const header = document.querySelector('.fixed-header');
        const scrolled = window.pageYOffset;
        const heroSection = document.querySelector('.hero');
        const heroHeight = heroSection ? heroSection.offsetHeight : 0;
        
        // Efecto de header al hacer scroll (más suave en móviles)
        if (scrolled > (isMobile ? 50 : 100)) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Ocultar/mostrar header inteligentemente (menos agresivo en móviles)
        const hideThreshold = isMobile ? heroHeight * 0.6 : heroHeight * 0.8;
        const scrollDifference = Math.abs(scrolled - lastScrollTop);
        
        if (scrolled > hideThreshold && scrollDifference > 5) {
            if (scrolled > lastScrollTop && scrolled > (isMobile ? 150 : 200)) {
                header.classList.add('hidden');
            } else {
                header.classList.remove('hidden');
            }
        } else {
            header.classList.remove('hidden');
        }
        
        lastScrollTop = scrolled;
        
        // Mostrar header después de parar el scroll (más rápido en móviles)
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            if (scrolled > hideThreshold) {
                header.classList.remove('hidden');
            }
        }, isMobile ? 500 : 1000);
        
        // Actualizar botón back to top
        updateBackToTop(scrolled);
        
        ticking = false;
    }

    // Usar requestAnimationFrame para mejor rendimiento
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateScrollEffects);
            ticking = true;
        }
    }, { passive: true });
    
    // Optimización adicional para móviles
    if (isMobile) {
        let scrollTimer;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimer);
            document.body.classList.add('scrolling');
            scrollTimer = setTimeout(() => {
                document.body.classList.remove('scrolling');
            }, 150);
        }, { passive: true });
    }
}

// ===== TARJETAS DE PRODUCTOS MEJORADAS =====
function initializeProductCards() {
    const productCards = document.querySelectorAll('.product-card');
    
    // Intersection Observer para animaciones
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                // Agregar delay escalonado
                const delay = Array.from(productCards).indexOf(entry.target) * 100;
                entry.target.style.animationDelay = `${delay}ms`;
            }
        });
    }, observerOptions);

    productCards.forEach(card => {
        observer.observe(card);
        
        // Efectos de hover mejorados
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px) scale(1.02)';
            
            // Efecto en la imagen
            const img = this.querySelector('.product-image img');
            if (img) {
                img.style.transform = 'scale(1.1)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
            
            // Resetear imagen
            const img = this.querySelector('.product-image img');
            if (img) {
                img.style.transform = '';
            }
        });
        
        // Efecto de click
        card.addEventListener('click', function(e) {
            if (!e.target.closest('a')) {
                this.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
                
                // Aquí podrías agregar funcionalidad de modal o detalle del producto
                showProductDetail(this);
            }
        });
    });
}

// ===== BOTÓN BACK TO TOP =====
function initializeBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            // Efecto visual
            backToTopBtn.style.transform = 'scale(0.9)';
            setTimeout(() => {
                backToTopBtn.style.transform = '';
            }, 150);
        });
    }
}

function updateBackToTop(scrolled) {
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        if (scrolled > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }
}

// ===== LAZY LOADING DE IMÁGENES =====
function initializeImageLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Efecto de fade in
                    img.style.opacity = '0';
                    img.style.transition = 'opacity 0.5s ease';
                    
                    img.onload = () => {
                        img.style.opacity = '1';
                    };
                    
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px'
        });

        document.querySelectorAll('img[data-src], img.lazy').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// ===== ANIMACIONES ADICIONALES =====
function initializeAnimations() {
    // Animación de números en estadísticas
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const numberObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumber(entry.target);
                numberObserver.unobserve(entry.target);
            }
        });
    });
    
    statNumbers.forEach(stat => {
        numberObserver.observe(stat);
    });
    
    // Animación de elementos flotantes
    createFloatingElements();
}

function animateNumber(element) {
    const target = parseInt(element.textContent.replace(/\D/g, ''));
    const suffix = element.textContent.replace(/\d/g, '');
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current) + suffix;
    }, 30);
}

function createFloatingElements() {
    // Crear elementos flotantes adicionales si es necesario
    const hero = document.querySelector('.hero');
    if (hero && !hero.querySelector('.floating-elements')) {
        const floatingContainer = document.createElement('div');
        floatingContainer.className = 'floating-elements';
        
        // Agregar más elementos flotantes dinámicamente
        for (let i = 0; i < 6; i++) {
            const element = document.createElement('div');
            element.className = 'floating-element';
            element.style.cssText = `
                --delay: ${Math.random() * 5}s;
                --duration: ${6 + Math.random() * 4}s;
                top: ${Math.random() * 80}%;
                left: ${Math.random() * 90}%;
            `;
            element.textContent = ['✨', '🌹', '💫', '⭐'][Math.floor(Math.random() * 4)];
            floatingContainer.appendChild(element);
        }
        
        hero.appendChild(floatingContainer);
    }
}

// ===== FORMULARIOS DE CONTACTO =====
function initializeContactForms() {
    // Efectos en botones de contacto
    const contactBtns = document.querySelectorAll('.contact-btn');
    
    contactBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            // Efecto de ripple
            createRippleEffect(this, e);
            
            // Tracking de eventos (opcional)
            if (this.classList.contains('whatsapp-btn')) {
                console.log('WhatsApp button clicked');
                // Aquí podrías agregar Google Analytics o similar
            }
        });
    });
}

function createRippleEffect(button, event) {
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    `;
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// ===== FUNCIONES AUXILIARES =====
function showProductDetail(productCard) {
    const productName = productCard.querySelector('.product-name').textContent;
    const productDescription = productCard.querySelector('.product-description').textContent;
    
    // Aquí podrías implementar un modal o redirección
    console.log(`Producto seleccionado: ${productName}`);
    
    // Ejemplo de notificación simple
    showNotification(`Has seleccionado: ${productName}`);
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--gradient-primary);
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: var(--shadow-medium);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// ===== MANEJO DE ERRORES =====
window.addEventListener('error', function(e) {
    console.error('Error en la aplicación:', e.error);
});

// Manejo de errores de imágenes
document.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG') {
        console.log('Error loading image:', e.target.src);
        // Podrías agregar una imagen placeholder aquí
        e.target.style.opacity = '0.5';
    }
}, true);

// ===== CSS DINÁMICO PARA ANIMACIONES =====
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .animate-in {
        animation: fadeInUp 0.8s ease forwards;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// ===== PERFORMANCE OPTIMIZATION =====
// Debounce function para optimizar eventos de scroll
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Preload de imágenes críticas
function preloadCriticalImages() {
    const criticalImages = [
        'Logo.png',
        'Baner.png'
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Inicializar preload
preloadCriticalImages();