// 1. Actualiza el diccionario de nombres de pestañas agregando la de contacto:
const pageTitles = {
    '#home': 'Inicio',
    '#about': 'Sobre Mí',
    '#portfolio': 'Proyectos',
    '#blog': 'Blog',
    '#tutorial': 'Tutoriales',
    '#courses': 'Cursos Impartidos',
    '#contact': 'Contacto' // <- Nueva línea
};

const baseTitle = 'Edwin Gallego | Dev';

const router = () => {
    const hash = window.location.hash || '#home';

    // 1. Ocultar todas las secciones
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.add('hidden'));

    // 2. Encontrar la sección objetivo o hacer fallback a #home
    const targetScreen = document.querySelector(hash) || document.querySelector('#home');
    
    // 3. Mostrar la sección
    targetScreen.classList.remove('hidden');
    
    // 4. Magia SEO: Actualizar el título de la pestaña
    const sectionName = pageTitles[hash] || 'Inicio';
    document.title = `>_ ${sectionName} | ${baseTitle}`;

    // --- MAGIA DE ACCESIBILIDAD (a11y) ---
    
    // a. Avisar al lector de pantalla
    const announcer = document.getElementById('a11y-announcer');
    if (announcer) {
        announcer.textContent = `Navegado a la sección ${sectionName}`;
    }

    // b. Mover el foco al título de la nueva sección
    const sectionTitle = targetScreen.querySelector('h2');
    if (sectionTitle) {
        // Necesitamos un pequeño timeout para asegurar que el DOM se actualizó
        // y el elemento ya no está "hidden" antes de darle el foco.
        setTimeout(() => {
            sectionTitle.focus();
        }, 50);
    }
};

// Escuchar cambios en la URL y la carga inicial
window.addEventListener('hashchange', router);
window.addEventListener('load', router);

// --- CONTROL DEL BOTÓN DE REDUCCIÓN DE MOVIMIENTO ---
window.addEventListener('DOMContentLoaded', () => {
    const a11yButton = document.getElementById('a11y-toggle');
    const body = document.body;

    if(a11yButton) {
        a11yButton.addEventListener('click', () => {
            body.classList.toggle('reduce-motion');
            
            // Actualizar el texto y el estado ARIA del botón
            if (body.classList.contains('reduce-motion')) {
                a11yButton.textContent = "Activar Efectos CRT";
                a11yButton.setAttribute('aria-pressed', 'true');
            } else {
                a11yButton.textContent = "Desactivar Efectos CRT";
                a11yButton.setAttribute('aria-pressed', 'false');
            }
        });
    }
});

// 2. AGREGA ESTO AL FINAL DEL ARCHIVO PARA LA NAVEGACIÓN POR TECLADO
const sectionsOrder = ['#home', '#about', '#portfolio', '#blog', '#tutorial', '#courses', '#contact'];

window.addEventListener('keydown', (e) => {
    // Si el usuario presiona flecha derecha o izquierda
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const currentHash = window.location.hash || '#home';
        let currentIndex = sectionsOrder.indexOf(currentHash);
        
        if (e.key === 'ArrowRight') {
            // Avanzar a la siguiente sección (vuelve al inicio si está en la última)
            currentIndex = (currentIndex + 1) % sectionsOrder.length;
        } else if (e.key === 'ArrowLeft') {
            // Retroceder a la sección anterior (va a la última si está en la primera)
            currentIndex = (currentIndex - 1 + sectionsOrder.length) % sectionsOrder.length;
        }
        
        // Cambiar el hash en la URL dispara automáticamente tu función router()
        window.location.hash = sectionsOrder[currentIndex];
    }
});

// --- LÓGICA DEL FORMULARIO DE CONTACTO ---
const contactForm = document.getElementById('retro-contact-form');
const formStatus = document.getElementById('form-status');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        // Evitamos que la página se recargue (comportamiento por defecto)
        e.preventDefault(); 

        // Efecto visual de terminal procesando
        formStatus.classList.remove('hidden');
        formStatus.textContent = "> Procesando paquete de datos...";
        
        // Simulamos un retraso de conexión de red antigua (1.5 segundos)
        setTimeout(() => {
            formStatus.textContent = "> TRANSMISIÓN EXITOSA. Mensaje recibido en el servidor local.";
            formStatus.style.color = "var(--primary-color)";
            formStatus.classList.remove('alert'); // Quitamos el parpadeo de alerta
            
            // Limpiamos los campos del formulario
            contactForm.reset(); 
            
            // Ocultamos el mensaje después de 4 segundos
            setTimeout(() => {
                formStatus.classList.add('hidden');
                formStatus.textContent = "";
                formStatus.classList.add('alert'); // Restauramos la clase por si hay un error en el futuro
            }, 4000);
        }, 1500);
    });
}