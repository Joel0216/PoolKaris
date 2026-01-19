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
    initializeFilterSystem();
    initializeBackToTop();
    initializeImageLazyLoading();
    initializeAnimations();
    initializeContactForms();
    initializeMobileOptimizations();
    initializeAuthenticationSystem();
}

// ===== SISTEMA DE FILTROS Y PRODUCTOS =====
function initializeFilterSystem() {
    const filterCards = document.querySelectorAll('.filter-card');
    const backButton = document.getElementById('backToFilters');
    const filtersGrid = document.getElementById('filtersGrid');
    const productsView = document.getElementById('productsView');
    const productsGrid = document.getElementById('productsGrid');
    const currentFilterTitle = document.getElementById('currentFilterTitle');

    // Manejar clicks en filtros
    filterCards.forEach(card => {
        card.addEventListener('click', function() {
            const filterName = this.dataset.filter;
            showProducts(filterName);
        });
    });

    // Botón de volver
    if (backButton) {
        backButton.addEventListener('click', function() {
            showFilters();
        });
    }

    function showProducts(filterName) {
        // Verificar si requiere autenticación (global)
        if (!isUserAuthenticated()) {
            showAuthModal(filterName);
            return;
        }

        // Si está autenticado, mostrar productos
        loadAndShowProducts(filterName);
    }

    function loadAndShowProducts(filterName) {
        // Ocultar filtros y mostrar productos
        filtersGrid.style.display = 'none';
        productsView.style.display = 'block';
        currentFilterTitle.textContent = filterName;

        // Cargar productos del filtro
        loadProductsFromFilter(filterName);

        // Scroll al inicio de la sección
        document.getElementById('productos').scrollIntoView({ behavior: 'smooth' });
    }

    function showFilters() {
        // Mostrar filtros y ocultar productos
        filtersGrid.style.display = 'grid';
        productsView.style.display = 'none';
        productsGrid.innerHTML = '';

        // Scroll al inicio de la sección
        document.getElementById('productos').scrollIntoView({ behavior: 'smooth' });
    }

    async function loadProductsFromFilter(filterName) {
        productsGrid.innerHTML = '<div class="loading-products">Cargando productos...</div>';

        try {
            // Obtener lista de imágenes del filtro
            const products = await getProductsFromFilter(filterName);
            
            if (products.length === 0) {
                productsGrid.innerHTML = '<div class="no-products">No se encontraron productos en este filtro.</div>';
                return;
            }

            // Crear HTML para productos
            let productsHTML = '';
            products.forEach((product, index) => {
                productsHTML += createProductHTML(product, filterName, index);
            });

            productsGrid.innerHTML = productsHTML;

            // Reinicializar animaciones AOS
            if (typeof AOS !== 'undefined') {
                AOS.refresh();
            }

            // Agregar eventos a botones de WhatsApp
            initializeWhatsAppButtons();
            
            // Agregar protección a las imágenes de productos
            addProtectionOverlayToProducts();

        } catch (error) {
            console.error('Error cargando productos:', error);
            productsGrid.innerHTML = '<div class="error-products">Error al cargar productos. Por favor, intenta de nuevo.</div>';
        }
    }

    async function getProductsFromFilter(filterName) {
        // Obtener productos reales basados en la estructura de carpetas
        const products = [];
        
        // Mapeo de nombres de archivos reales por filtro (los que ya conocemos)
        const knownProducts = {
            'Álbum Firmas': [
                'FIR 01-A.png', 'FIR 01.png', 'FIR 101.png', 'FIR 17-A.png', 'FIR 17.png',
                'FIR-02.png', 'FIR-04.png', 'FIR-10.png', 'FIR-190.png', 'FIR-32.png'
            ],
            'Álbum Fotos': [
                'AFM-3.png', 'AFN-1.png', 'AFN-10.png', 'AFN-11.png', 'AFN-2.png',
                'AFN-4.png', 'FOT 20-1.png', 'FOT-01.png', 'FOT-11.png', 'FOT-190.png'
            ],
            'Biblias': [
                'Biblia-101.png', 'Biblia-1011.png', 'Biblia-1040.png', 'Biblia-1042.png',
                'Biblia-15.png', 'Biblia-16.png', 'Biblia-181.png', 'Biblia-20.png',
                'Biblia-32.png', 'Biblia17-2.png', 'Biblia17-3.png', 'Biblia18-1.png'
            ],
            'Canastas': [
                '000.png', '001.png', '002.png', '003.png', '008.png', 
                'Canasta JUMBO.png', 'pétalos mediana.png'
            ],
            'Copas': [
                'COP 16-7.png', 'COP 22-01.png', 'COP 22-1.png', 'COP-001.png', 'COP-10.png',
                'COP-101.png', 'COP-102.png', 'COP-104.png', 'COP-111.png', 'COP-18.png',
                'COP-19.png', 'COP-190.png', 'COP-191.png', 'COP-192-B.png', 'COP-192.png',
                'COP-20-1.png', 'COP-200.png', 'COP-201.png', 'COP-202.png', 'COP-203.png',
                'COP-204.png', 'COP-22-02.png', 'COP-22-03.png', 'COP-22.png', 'COP-306.png',
                'COP-307.png', 'COP-32.png', 'COP-Moño.png'
            ],
            'Coronas': [
                'BE 17-2.png', 'BE 17-3.png', 'BE 18-1.png', 'BE 18-2.png', 'BE 19-1.png',
                'BJ 17-17.png', 'BJ 17-18.png', 'BJ 18-11.png', 'BJ 18-12.png', 'BJ 18-13.png',
                'BJ 18-15.png', 'BJ 18-9.png', 'BJ 19-1.png', 'BJ 19-2.png', 'BJ 19-4.png',
                'BJ 19-5.png', 'BJ 19-6.png', 'BJ 19-7.png', 'TE 17-11.png', 'TJ 16-4.png'
            ],
            'Cojines': [
                'AGE-101.png', 'AGE-17.png', 'AGE-190.png', 'AGE-2.png', 'AGE-200.png',
                'AGE-201.png', 'AGE-29.png', 'AGE-30.png', 'AGE-32.png', 'AGE-50.png',
                'AGE-51.png', 'AGE-52.png', 'AGE-7.png', 'AJ 14-05.png', 'AJ 14-09.png',
                'AJ 14-15.png', 'AJ 14-16.png', 'AJ 15-02.png', 'AJ 15-100.png', 'AJ 16-1.png',
                'AJ 16-2.png', 'AJ 16-4.png', 'AJ 16-7.png', 'AJ 17-01.png', 'AJ 18-4.png',
                'AJ 19-32.png', 'AJ 20-001.png', 'AJ 20-1.png', 'AJ-17 01.png', 'AJ-221.png',
                'AJ-222.png', 'AJ-223.png', 'AJ-224.png', 'AJ-225.png'
            ],
            'Cubiertos': [
                'CUB-100.png', 'CUB-11.png', 'CUB-11A.png', 'CUB-180 230.png', 'CUB-180.png',
                'CUB-182 180.png', 'CUB-190.png', 'CUB-2 200.png', 'CUB-22.png', 'CUB-32 170.png',
                'CUB-32A.png'
            ],
            'Fistoles': [
                'FE-15-6.png', 'FE-15-8.png', 'FE-15-9.png', 'FE-202.png', 'FE-207.png',
                'FE-208.png', 'FE-30.png', 'FE-31.png', 'FJ-038.png', 'FJ-039.png',
                'FJ-040.png', 'FJ-080.png', 'FJ-10.png', 'FJ-11.png', 'FJ-181.png',
                'FJ-182.png', 'FJ-183.png', 'FJ-184.png', 'FJ-185.png', 'FJ-186.png',
                'FJ-190.png', 'FJ-192.png', 'FJ-2.png', 'FJ-2218.png', 'FJ-5.png',
                'FJ-6.png', 'FJ-7.png', 'FJ-9.png'
            ],
            'Ligas y Banditas': [
                'BE-16-12.png', 'BE-16-4.png', 'BE-16-8.png', 'BE-18-5.png', 'BE-18-6.png',
                'BE-18-7.png', 'BE-19-2.png', 'BE-19-4.png', 'BE-19-5.png', 'BE-19-6.png',
                'BE-19-7.png', 'BE-19-9.png', 'BJ-13-3.png', 'BJ-15-10.png', 'BJ-15-11.png',
                'BJ-15-11A.png', 'BJ-15-12.png', 'BJ-15-19.png', 'BJ-15-20.png', 'BJ-15-8.png',
                'BJ-16-2.png', 'BJ-16-9.png', 'BJ-17-3.png', 'BJ-17-5.png', 'BJ-17-6.png',
                'BJ-18-1.png', 'BJ-18-14.png', 'BJ-18-2.png', 'BJ-18-22.png', 'BJ-18-25.png',
                'BJ-18-3.png', 'BJ-18-7.png', 'BJ-19-10.png', 'BJ-19-16.png', 'BJ-19-17.png',
                'BJ-19-18.png', 'KIKI-2-03.png', 'KIKI-21-03.png', 'KIS-21-01.png', 'KIS-21-02.png',
                'KIS-21-03.png', 'KIS-21-04.png', 'KIS-21-06.png', 'KIS-21-07.png', 'KIS-21-08.png',
                'KIS-21-09 (2).png', 'KIS-21-09.png', 'KIS-21-10.png', 'KIS-21-11.png', 'KISI-21-12.png',
                'LE-14-10.png', 'LE-14-11.png', 'LE-14-4.png', 'LE-14-8.png', 'LE-14-9.png',
                'LE-15-1.png', 'LE-15-2.png', 'LE-18-2.png', 'LE-20-1.png', 'LE-20-2.png',
                'LE-20-3.png', 'LE-20-5.png', 'LJ-17-2.png', 'LJ-18-1.png', 'LJ-18-11.png',
                'LJ-18-12.png', 'LJ-18-13.png', 'LJ-18-4.png', 'LJ-18-5.png', 'LJ-18-6.png',
                'LJ-19-1.png', 'LJ-19-2.png', 'LJ-19-3.png', 'LJ-19-4.png', 'LN-14-1.png',
                'LN-14-2.png', 'TE-19-2.png', 'TE-19-5.png', 'TE-21-10 (A).png', 'TE-21-10.png',
                'TE-21-11.png', 'TE-21-135.png', 'TE-21-3.png', 'TE-21-9.png', 'TJ-15-63.png'
            ],
            'Tocados y Guías': [
                'BE-14-31 (2).png', 'BE-14-31.png', 'BE-14-35.png', 'BE-18-3.png', 'BE-18-9.png',
                'BJ-13-25.png', 'BJ-13-28.png', 'BJ-13-3-A.png', 'BJ-13-31.png', 'BJ-14-01.png',
                'BJ-14-2.png', 'BJ-15-2.png', 'BJ-15-4.png', 'BJ-15-7.png', 'BJ-16-1.png',
                'BJ-16-3.png', 'BJ-16-5.png', 'BJ-16-8.png', 'BJ-17-10-R.png', 'BJ-17-10.png',
                'BJ-17-11.png', 'BJ-17-14.png', 'BJ-17-17.png', 'BJ-17-9.png', 'BJ-18-18.png',
                'BJ-18-20.png', 'BJ-18-21.png', 'BJ-18-23.png', 'BJ-18-6.png', 'BJ-19-10.png',
                'BJ-19-11.png', 'BJ-19-12.png', 'BJ-19-13.png', 'BJ-19-14.png', 'BJ-19-19.png',
                'BJ-19-20.png', 'BJ-19-21.png', 'BJ-19-22.png', 'BJ-19-23.png', 'BJ-19-24.png',
                'BJ-19-25.png', 'BJ-19-26.png', 'BJ-19-8.png', 'BJ-19-9.png', 'KIKI-2-01.png',
                'KIKI-2-02.png', 'KIKI-2-03.png', 'KIKI-2-04.png', 'KIKI-2-05.png', 'OJ-15-19.png',
                'OJ-15-20.png', 'OJ-15-21.png', 'OJ-15-22.png', 'OJ-15-23.png', 'OJ-15-9.png',
                'RT-14-12-A.png', 'RT-14-14.png', 'RT-14-26.png', 'RT-15-3.png', 'RT-15-4.png',
                'RT-15-7.png', 'RT-15-8.png', 'TE-13-51-A.png', 'TE-14-24.png', 'TE-15-14.png',
                'TE-15-24.png', 'TE-15-26.png', 'TE-15-3.png', 'TE-15-34.png', 'TE-15-4.png',
                'TE-15-9.png', 'TE-16-13.png', 'TE-16-16.png', 'TE-16-20-D.png', 'TE-16-20.png',
                'TE-16-21.png', 'TE-16-22.png', 'TE-16-30.png', 'TE-16-5.png', 'TE-16-7.png',
                'TE-16-9.png', 'TE-17-13.png', 'TE-17-15.png', 'TE-17-16.png', 'TE-17-3.png',
                'TE-17-7.png', 'TE-17-9.png', 'TE-18-1.png', 'TE-18-2.png', 'TE-18-4.png',
                'TE-19-1.png', 'TE-19-2.png', 'TE-19-4.png', 'TE-19-5.png', 'TE-19-7.png',
                'TE-21-1.png', 'TE-21-10.png', 'TE-21-11.png', 'TE-21-12.png', 'TE-21-120.png',
                'TE-21-132.png', 'TE-21-133.png', 'TE-21-2.png', 'TE-21-4.png', 'TE-21-5.png',
                'TE-21-6.png', 'TE-21-9.png', 'TJ-13-22.png', 'TJ-13-27.png', 'TJ-13-42.png',
                'TJ-13-46.png', 'TJ-13-50.png', 'TJ-13-51.png', 'TJ-14-31.png', 'TJ-14-32.png',
                'TJ-14-35.png', 'TJ-14-4.png', 'TJ-14-50.png', 'TJ-14-61-A.png', 'TJ-14-61.png',
                'TJ-15-23.png', 'TJ-16-16.png', 'TJ-16-21.png', 'TJ-16-27.png', 'TJ-16-29.png',
                'TJ-16-3.png', 'TJ-16-35.png', 'TJ-16-36.png', 'TJ-16-9.png', 'TJ-17-11.png',
                'TJ-17-14.png', 'TJ-17-18.png', 'TJ-17-21.png', 'TJ-17-26.png', 'TJ-17-27.png',
                'TJ-17-28.png', 'TJ-17-32.png', 'TJ-17-4.png', 'TJ-17-7-A.png', 'TJ-17-7.png',
                'TJ-17-8.png', 'TJ-18-12.png', 'TJ-18-2.png', 'TJ-18-5.png', 'TJ-18-6.png',
                'TJ-19-1.png', 'TJ-19-10.png', 'TJ-19-11.png', 'TJ-19-12.png', 'TJ-19-13.png',
                'TJ-19-14.png', 'TJ-19-2.png', 'TJ-19-3.png', 'TJ-19-4.png', 'TJ-19-5.png',
                'TJ-19-6.png', 'TJ-19-7.png', 'TJ-19-8.png', 'TJ-19-9.png', 'TJ-22-02.png',
                'TJ-22-04.png', 'TJ-22-05.png', 'TJ-22-06.png', 'TJ-22-08.png', 'TJ-22-09.png',
                'TJ-22-101.png', 'TJ-22-15.png', 'TJ-22-16.png', 'TJ-22-17.png', 'TJ-22-19.png',
                'TJ-22-20.png', 'TJ-22-23.png', 'TJ-22-27.png', 'TJ-22-28.png', 'TJ-22-30.png',
                'TJ-22-31.png', 'TJ-22-32.png', 'TJ-22-33.png', 'TJ-22-34.png', 'TJ-22-35.png'
            ],
            'velas': [
                'BJ-22-08.png', 'CE-15-10.png', 'CE-15-4.png', 'CE-15-8.png', 'CE-17-1.png',
                'CE-17-10.png', 'CE-17-11.png', 'CE-17-13.png', 'CE-17-14.png', 'CE-17-15.png',
                'CE-17-2.png', 'CE-17-3.png', 'CE-19-2.png', 'CE-19-5.png', 'CE-19-6.png',
                'CE-20-11.png', 'CE-20-14.png', 'CE-20-16.png', 'CE-20-4.png', 'CE-20-8.png',
                'CJ-14-1.png', 'CJ-14-14.png', 'CJ-14-16.png', 'CJ-14-19.png', 'CJ-14-3.png',
                'CJ-14-5.png', 'CJ-15-13.png', 'CJ-16-1.png', 'CJ-16-14.png', 'CJ-16-15.png',
                'CJ-16-16.png', 'CJ-16-19.png', 'CJ-16-2.png', 'CJ-16-20.png', 'CJ-16-23.png',
                'CJ-16-26.png', 'CJ-16-27.png', 'CJ-17-10.png', 'CJ-17-11.png', 'CJ-17-14.png',
                'CJ-17-2.png', 'CJ-17-5.png', 'CJ-17-6.png', 'CJ-17-7.png', 'CJ-18-2.png',
                'CJ-19-1.png', 'CJ-19-10.png', 'CJ-19-11.png', 'CJ-19-12.png', 'CJ-19-13.png',
                'CJ-19-14.png', 'CJ-19-15.png', 'CJ-19-16.png', 'CJ-19-2.png', 'CJ-19-3.png',
                'CJ-19-4.png', 'CJ-19-5.png', 'CJ-19-6.png', 'CJ-19-7.png', 'CJ-19-8.png',
                'CJ-19-9.png', 'CJ-21-30.png', 'CJ-21-40.png', 'CJ-22-01.png', 'CJ-22-02.png',
                'CJ-22-03.png', 'CJ-22-04.png', 'CJ-22-06.png', 'CJ-22-07.png', 'CJ-22-09.png',
                'CJ-22-10.png', 'CRIS-1-01.png', 'CRIS-1-02.png', 'CRIS-1-03.png', 'CRIS-1-04.png',
                'CRIS-1-05.png', 'CRIS-1-06.png', 'CRIS-1-07.png', 'CRIS-1-08.png', 'CRIS-1-09.png',
                'CRIS-1-10.png', 'CRIS-1-11.png', 'CRIS-1-12.png', 'CRIS-1-13.png', 'CRIS-1-14.png',
                'CRIS-1-15.png', 'CRIS-1-16.png', 'CRIS-1-17.png', 'CRIS-1-18.png', 'CRIS-1-19.png',
                'CRIS-1-20.png', 'CRIS-1-21.png', 'CRIS-1-22.png', 'CRIS-1-23.png', 'CRIS-1-29.png',
                'CRIS-1-30.png', 'CRIS-1-31.png', 'CRIS-1-32.png', 'CRIS-1-40.png', 'CRIS-1-41.png',
                'CRIS-1-42.png', 'CRIS-1-50.png', 'CRIS-1-51.png', 'CS-22-05.png', 'IJ-15-10.png',
                'IJ-15-19.png', 'IJ-15-20.png', 'IJ-15-8.png', 'VE-1-5.png', 'VE-16-1.png',
                'VE-16-16.png', 'VE-16-17.png', 'VE-16-21.png', 'VE-16-25.png', 'VE-16-33.png',
                'VE-16-36.png', 'VE-16-5.png', 'VE-16-9.png', 'VE-17-1.png', 'VE-17-10.png',
                'VE-17-11.png', 'VE-17-12.png', 'VE-17-13.png', 'VE-17-16.png', 'VE-17-18.png',
                'VE-17-19.png', 'VE-17-23.png', 'VE-17-28.png', 'VE-17-3.png', 'VE-17-34.png',
                'VE-17-36.png', 'VE-17-37.png', 'VE-17-39.png', 'VE-17-5.png', 'VE-17-6.png',
                'VE-17-8.png', 'VE-17-9.png', 'VE-18-1.png', 'VE-18-10.png', 'VE-18-13.png',
                'VE-18-14.png', 'VE-18-2.png', 'VE-18-20.png', 'VE-18-31.png', 'VE-18-33.png',
                'VE-18-36.png', 'VE-18-5.png', 'VE-18-8.png', 'VE-19-1.png', 'VE-19-10.png',
                'VE-19-12.png', 'VE-19-14.png', 'VE-19-15.png', 'VE-19-16.png', 'VE-19-2.png',
                'VE-19-3.png', 'VE-19-4.png', 'VE-19-6.png', 'VE-19-8.png', 'VE-19-9.png',
                'VE-20-1-A.png', 'VE-20-1.png', 'VE-20-10.png', 'VE-20-11.png', 'VE-20-14.png',
                'VE-20-15.png', 'VE-20-19.png', 'VE-20-20.png', 'VE-20-26.png', 'VE-20-27.png',
                'VE-20-28.png', 'VE-20-29.png', 'VE-20-3.png', 'VE-20-30.png', 'VE-20-32.png',
                'VE-20-33.png', 'VE-20-34.png', 'VE-20-35.png', 'VE-20-36.png', 'VE-20-38.png',
                'VE-20-40.png', 'VE-20-41.png', 'VE-20-7.png', 'VE-20-8.png', 'VE-21-1.png',
                'VE-21-10.png', 'VE-21-11.png', 'VE-21-12-A.png', 'VE-21-12.png', 'VE-21-13.png',
                'VE-21-14.png', 'VE-21-3.png', 'VE-21-4.png', 'VE-21-6.png', 'VE-21-7.png',
                'VE-21-8.png', 'VELAS-22.png', 'VELAS-32.png', 'VJ-16-1.png', 'VJ-16-11.png',
                'VJ-16-12.png', 'VJ-16-15.png', 'VJ-16-16.png', 'VJ-16-18.png', 'VJ-16-19.png',
                'VJ-16-20.png', 'VJ-16-22.png', 'VJ-16-24.png', 'VJ-16-25.png', 'VJ-16-27.png',
                'VJ-16-3.png', 'VJ-16-36.png', 'VJ-16-38.png', 'VJ-16-4.png', 'VJ-16-8.png',
                'VJ-16-9.png', 'VJ-17-11.png', 'VJ-17-16.png', 'VJ-17-17.png', 'VJ-17-19.png',
                'VJ-17-2.png', 'VJ-17-24.png', 'VJ-17-3.png', 'VJ-17-9.png', 'VJ-18-10.png',
                'VJ-18-11.png', 'VJ-18-12.png', 'VJ-18-15.png', 'VJ-18-17.png', 'VJ-18-19.png',
                'VJ-18-2.png', 'VJ-18-20.png', 'VJ-18-25.png', 'VJ-18-26.png', 'VJ-18-27.png',
                'VJ-18-28.png', 'VJ-18-29.png', 'VJ-18-3.png', 'VJ-18-30.png', 'VJ-18-4.png',
                'VJ-18-5.png', 'VJ-18-6.png', 'VJ-18-7.png', 'VJ-18-8.png', 'VJ-18-9.png',
                'VJ-19-1.png', 'VJ-19-10.png', 'VJ-19-100.png', 'VJ-19-11.png', 'VJ-19-12.png',
                'VJ-19-13.png', 'VJ-19-14.png', 'VJ-19-15.png', 'VJ-19-16.png', 'VJ-19-17.png',
                'VJ-19-18.png', 'VJ-19-19.png', 'VJ-19-2.png', 'VJ-19-20.png', 'VJ-19-21.png',
                'VJ-19-22.png', 'VJ-19-23.png', 'VJ-19-24.png', 'VJ-19-25.png', 'VJ-19-26.png',
                'VJ-19-28.png', 'VJ-19-29.png', 'VJ-19-3.png', 'VJ-19-30.png', 'VJ-19-4.png',
                'VJ-19-5.png', 'VJ-19-6.png', 'VJ-19-7.png', 'VJ-19-8.png', 'VJ-19-9.png',
                'VJ-22-01.png', 'VJ-22-03.png', 'VJ-22-06-A.png', 'VJ-22-06.png', 'VJ-22-07.png',
                'VJ-22-09.png', 'WJ-15-13.png', 'WJ-15-20.png'
            ]
        };
        
        // Si tenemos productos conocidos para este filtro, usarlos
        const productFiles = knownProducts[filterName];
        
        if (productFiles && productFiles.length > 0) {
            productFiles.forEach((fileName, index) => {
                // Extraer nombre del modelo del archivo
                const modelName = fileName.replace('.png', '').replace('.jpg', '');
                
                products.push({
                    name: modelName,
                    image: `Filtros/${filterName}/${filterName}/${fileName}`,
                    description: `Hermoso modelo ${modelName} de ${filterName.toLowerCase()} diseñado especialmente para tu evento.`
                });
            });
        } else {
            // Para filtros sin productos conocidos, crear productos de ejemplo
            const exampleCount = 5;
            for (let i = 1; i <= exampleCount; i++) {
                products.push({
                    name: `${filterName} Modelo ${i}`,
                    image: `Filtros/${filterName}/${filterName}.png`, // Usar la imagen del filtro como placeholder
                    description: `Hermoso modelo de ${filterName.toLowerCase()} diseñado especialmente para tu evento. Contáctanos para ver más opciones disponibles.`
                });
            }
        }

        return products;
    }

    function getProductCountForFilter(filterName) {
        // Número estimado de productos por filtro
        const productCounts = {
            'Álbum Firmas': 8,
            'Álbum Fotos': 6,
            'Biblias': 5,
            'Canastas': 10,
            'Cojines': 7,
            'Copas': 4,
            'Coronas': 6,
            'Cubiertos': 3,
            'Diademas': 9,
            'Fistoles': 5,
            'Ligas y Banditas': 8,
            'Ramos': 12,
            'Tocados y Guías': 7,
            'velas': 6
        };
        
        return productCounts[filterName] || 5;
    }

    function createProductHTML(product, filterName, index) {
        return `
            <div class="product-card individual-product" data-aos="fade-up" data-aos-delay="${(index + 1) * 100}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='Logo.png'">
                    <div class="product-overlay">
                        <div class="overlay-content">
                            <i class="fas fa-heart"></i>
                            <span class="overlay-text">Me Interesa</span>
                        </div>
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <button class="whatsapp-btn" data-filter="${filterName}" data-product="${product.name}">
                        <i class="fab fa-whatsapp"></i>
                        <span>Me gusta este modelo</span>
                    </button>
                </div>
            </div>
        `;
    }

    function initializeWhatsAppButtons() {
        const whatsappBtns = document.querySelectorAll('.whatsapp-btn');
        
        whatsappBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const filterName = this.dataset.filter;
                const productName = this.dataset.product;
                
                const message = `Hola! Me gustó este modelo "${filterName}" del "${productName}". Me gustaría obtener más información.`;
                const phoneNumber = '523331583111';
                const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                
                // Efecto visual en el botón
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
                
                // Abrir WhatsApp
                window.open(whatsappURL, '_blank');
            });
        });
    }
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

// ===== LOADING SCREEN RÁPIDO =====
function initializeLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    // Tiempo de carga reducido para mejor experiencia
    setTimeout(() => {
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
            // Remover del DOM después de la animación
            setTimeout(() => {
                loadingOverlay.remove();
            }, 500);
        }
    }, 800); // Reducido de 2000ms a 800ms
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

// ===== SISTEMA DE AUTENTICACIÓN Y PROTECCIÓN =====

// Configuración de seguridad
const SECURITY_CONFIG = {
    correctPassword: 'Cristy', // Contraseña correcta
    protectionImagePath: 'C:\\Users\\denic\\Downloads\\PoolKaris\\Cuadro transparente.png',
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 horas en milisegundos
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000 // 15 minutos
};

// Sistema de almacenamiento de sesión (GLOBAL)
const AuthSessionManager = {
    globalAuthKey: 'poolkaris_auth_global',
    
    setAuthenticated() {
        const timestamp = Date.now();
        sessionStorage.setItem(this.globalAuthKey, JSON.stringify({
            authenticated: true,
            timestamp: timestamp
        }));
    },
    
    isAuthenticated() {
        const data = sessionStorage.getItem(this.globalAuthKey);
        
        if (!data) return false;
        
        try {
            const parsed = JSON.parse(data);
            const age = Date.now() - parsed.timestamp;
            
            // Verificar si la sesión ha expirado
            if (age > SECURITY_CONFIG.sessionTimeout) {
                this.clearAuthentication();
                return false;
            }
            
            return parsed.authenticated === true;
        } catch (e) {
            return false;
        }
    },
    
    clearAuthentication() {
        sessionStorage.removeItem(this.globalAuthKey);
    }
};

// Sistema de intentos fallidos
const LoginAttemptManager = {
    attemptsKey: 'poolkaris_login_attempts',
    lockoutKey: 'poolkaris_lockout_time',
    
    recordFailedAttempt() {
        let attempts = this.getAttempts();
        attempts += 1;
        localStorage.setItem(this.attemptsKey, attempts.toString());
        
        if (attempts >= SECURITY_CONFIG.maxLoginAttempts) {
            this.lockout();
        }
        
        return attempts;
    },
    
    getAttempts() {
        const attempts = localStorage.getItem(this.attemptsKey);
        return parseInt(attempts) || 0;
    },
    
    reset() {
        localStorage.removeItem(this.attemptsKey);
        localStorage.removeItem(this.lockoutKey);
    },
    
    lockout() {
        const lockoutTime = Date.now() + SECURITY_CONFIG.lockoutDuration;
        localStorage.setItem(this.lockoutKey, lockoutTime.toString());
    },
    
    isLockedOut() {
        const lockoutTime = localStorage.getItem(this.lockoutKey);
        if (!lockoutTime) return false;
        
        if (Date.now() > parseInt(lockoutTime)) {
            this.reset();
            return false;
        }
        
        return true;
    },
    
    getRemainingLockoutTime() {
        const lockoutTime = parseInt(localStorage.getItem(this.lockoutKey)) || 0;
        const remaining = lockoutTime - Date.now();
        return Math.max(0, remaining);
    }
};

function isFilterAuthenticated(filterName) {
    return AuthSessionManager.isAuthenticated(filterName);
}

function isUserAuthenticated() {
    return AuthSessionManager.isAuthenticated();
}

function showAuthModal(filterName) {
    // Resetear el formulario
    document.getElementById('authPassword').value = '';
    document.getElementById('authError').style.display = 'none';
    
    // Actualizar el título del modal
    document.getElementById('authFilterName').textContent = `Acceso a: ${filterName}`;
    
    // Mostrar modal
    const modal = document.getElementById('authModal');
    modal.classList.add('show');
    modal.style.display = 'flex';
    
    // Enfocar en el input de contraseña
    document.getElementById('authPassword').focus();
    
    // Guardar el nombre del filtro para usarlo después
    modal.dataset.filterName = filterName;
    
    // Verificar si está bloqueado
    if (LoginAttemptManager.isLockedOut()) {
        showLockedOutMessage();
    }
}

function showLockedOutMessage() {
    const remainingTime = LoginAttemptManager.getRemainingLockoutTime();
    const minutes = Math.ceil(remainingTime / 60000);
    
    const errorEl = document.getElementById('authError');
    errorEl.textContent = `Demasiados intentos fallidos. Intenta de nuevo en ${minutes} minuto(s).`;
    errorEl.style.display = 'block';
    
    document.getElementById('authSubmit').disabled = true;
    document.getElementById('authPassword').disabled = true;
}

function hideAuthModal() {
    const modal = document.getElementById('authModal');
    modal.classList.remove('show');
    modal.style.display = 'none';
    document.getElementById('authPassword').value = '';
}

function authenticateFilter(password, filterName) {
    // Verificar si está bloqueado
    if (LoginAttemptManager.isLockedOut()) {
        showLockedOutMessage();
        return false;
    }
    
    // Verificar contraseña
    if (verifyPassword(password)) {
        // Contraseña correcta - AUTENTICACIÓN GLOBAL
        AuthSessionManager.setAuthenticated();
        LoginAttemptManager.reset();
        hideAuthModal();
        
        // Mostrar los productos
        loadAndShowProducts(filterName);
        
        return true;
    } else {
        // Contraseña incorrecta
        const attempts = LoginAttemptManager.recordFailedAttempt();
        const remaining = SECURITY_CONFIG.maxLoginAttempts - attempts;
        
        const errorEl = document.getElementById('authError');
        
        if (remaining > 0) {
            errorEl.textContent = `Contraseña incorrecta. Intentos restantes: ${remaining}`;
        } else {
            errorEl.textContent = `Contraseña incorrecta. Cuenta bloqueada por ${Math.ceil(SECURITY_CONFIG.lockoutDuration / 60000)} minutos.`;
        }
        
        errorEl.style.display = 'block';
        document.getElementById('authPassword').classList.add('error-shake');
        
        setTimeout(() => {
            document.getElementById('authPassword').classList.remove('error-shake');
        }, 500);
        
        return false;
    }
}

function verifyPassword(inputPassword) {
    // Comparación segura de contraseña
    // En producción, esto debería usar un hash adecuado
    return inputPassword === SECURITY_CONFIG.correctPassword;
}

function initializeAuthenticationUI() {
    const authModal = document.getElementById('authModal');
    const authCloseBtn = document.getElementById('authCloseBtn');
    const authSubmit = document.getElementById('authSubmit');
    const authPassword = document.getElementById('authPassword');
    const togglePasswordBtn = document.getElementById('togglePassword');
    
    // Cerrar modal
    if (authCloseBtn) {
        authCloseBtn.addEventListener('click', hideAuthModal);
    }
    
    // Cerrar al presionar ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && authModal.classList.contains('show')) {
            hideAuthModal();
        }
    });
    
    // Cerrar al hacer click fuera del modal
    if (authModal) {
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) {
                hideAuthModal();
            }
        });
    }
    
    // Botón de envío
    if (authSubmit) {
        authSubmit.addEventListener('click', () => {
            const filterName = authModal.dataset.filterName;
            const password = authPassword.value.trim();
            
            if (!password) {
                document.getElementById('authError').textContent = 'Por favor ingresa la contraseña';
                document.getElementById('authError').style.display = 'block';
                return;
            }
            
            authenticateFilter(password, filterName);
        });
    }
    
    // Permitir Enter para enviar
    if (authPassword) {
        authPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const filterName = authModal.dataset.filterName;
                const password = authPassword.value.trim();
                
                if (password) {
                    authenticateFilter(password, filterName);
                }
            }
        });
    }
    
    // Toggle para mostrar/ocultar contraseña
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', () => {
            const type = authPassword.type === 'password' ? 'text' : 'password';
            authPassword.type = type;
            
            const icon = togglePasswordBtn.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            }
        });
    }
}

function addProtectionOverlayToProducts() {
    // Esta función agrará la imagen transparente encima de cada imagen de producto
    // Se ejecutará cuando se muestren los productos
    setTimeout(() => {
        const productImages = document.querySelectorAll('.individual-product .product-image img');
        
        productImages.forEach(img => {
            const container = img.parentElement;
            
            // Evitar que se agregue más de una vez
            if (container.querySelector('.product-protection-overlay')) {
                return;
            }
            
            // Crear overlay de protección
            const overlay = document.createElement('div');
            overlay.className = 'product-protection-overlay';
            
            // Bloquear clic derecho en la imagen
            img.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                showNotification('Descargas de imágenes no permitidas');
                return false;
            });
            
            // Bloquear drag
            img.addEventListener('dragstart', (e) => {
                e.preventDefault();
                return false;
            });
            
            // Agregar CSS para prevenir selección
            img.style.userSelect = 'none';
            img.style.webkitUserSelect = 'none';
            img.style.webkitUserDrag = 'none';
            
            container.appendChild(overlay);
        });
        
        // Agregar protección contra capturas de pantalla
        addScreenshotProtection();
    }, 100);
}

function addScreenshotProtection() {
    // Prevenir capturas de pantalla usando CSS
    const protectionOverlay = document.getElementById('protectionOverlay');
    if (protectionOverlay) {
        protectionOverlay.classList.add('active');
    }
    
    // Detectar intentos de captura de pantalla
    document.addEventListener('keydown', (e) => {
        // Bloqueando combinaciones comunes de captura de pantalla
        if (
            (e.key === 'PrintScreen') ||
            (e.ctrlKey && e.shiftKey && e.key === 'S') || // Windows - Screenshot
            (e.metaKey && e.shiftKey && e.key === '3') || // Mac - Screenshot
            (e.metaKey && e.shiftKey && e.key === '4') // Mac - Partial Screenshot
        ) {
            e.preventDefault();
            showNotification('Las capturas de pantalla están deshabilitadas en esta sección');
            return false;
        }
    });
    
    // Intentar deshabilitar herramientas de desarrollador (opcional, puede ser eludido)
    try {
        // Detectar DevTools
        const threshold = 160;
        setInterval(() => {
            if (window.outerHeight - window.innerHeight > threshold ||
                window.outerWidth - window.innerWidth > threshold) {
                console.clear();
                document.body.innerHTML = '';
            }
        }, 500);
    } catch (e) {
        // Si hay error, continuar sin esta protección
    }
}

// Inicializar sistema de autenticación
function initializeAuthenticationSystem() {
    initializeAuthenticationUI();
    
    // Limpiar sesiones al cerrar la ventana/pestaña
    window.addEventListener('beforeunload', () => {
        // Las sesiones se limpian automáticamente
    });
}

// Agregar CSS dinámico para animaciones de error
const authStyle = document.createElement('style');
authStyle.textContent = `
    @keyframes errorShake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    .auth-input.error-shake {
        animation: errorShake 0.5s ease;
        border-color: #e74c3c;
    }
    
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
`;
document.head.appendChild(authStyle);