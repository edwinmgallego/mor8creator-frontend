/**
 * Edwin Gallego | Portafolio Retro
 * script.js - Versión Multi-Página (MPA) con Conexión a API (Node.js + MongoDB)
 */

window.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. GESTIÓN DE ENLACES ACTIVOS (SEO & UX) ---
    const highlightActiveNav = () => {
        const navLinks = document.querySelectorAll('.nav-links a');
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';

        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active-link');
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove('active-link');
                link.removeAttribute('aria-current');
            }
        });
    };

    // --- 2. CONTROL DEL MODO ACCESIBILIDAD (CRT) ---
    const setupA11yToggle = () => {
        const a11yButton = document.getElementById('a11y-toggle');
        const body = document.body;

        if (a11yButton) {
            const isReduced = localStorage.getItem('reduce-motion') === 'true';
            if (isReduced) {
                body.classList.add('reduce-motion');
                a11yButton.textContent = "Activar Efectos CRT";
                a11yButton.setAttribute('aria-pressed', 'true');
            }

            a11yButton.addEventListener('click', () => {
                const active = body.classList.toggle('reduce-motion');
                localStorage.setItem('reduce-motion', active); 
                
                a11yButton.textContent = active ? "Activar Efectos CRT" : "Desactivar Efectos CRT";
                a11yButton.setAttribute('aria-pressed', active);
            });
        }
    };

    // --- 3. NAVEGACIÓN POR TECLADO (FLECHAS) ---
    const setupKeyboardNav = () => {
        const pages = ['index.html', 'about.html', 'portfolio.html', 'blog.html', 'tutorial.html', 'courses.html', 'contact.html'];
        
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                const currentPath = window.location.pathname.split('/').pop() || 'index.html';
                let currentIndex = pages.indexOf(currentPath);

                if (e.key === 'ArrowRight') {
                    currentIndex = (currentIndex + 1) % pages.length;
                } else if (e.key === 'ArrowLeft') {
                    currentIndex = (currentIndex - 1 + pages.length) % pages.length;
                }

                window.location.href = pages[currentIndex];
            }
        });
    };

    // --- 4. LÓGICA DEL FORMULARIO DE CONTACTO (CONECTADO A LA API) ---
    const setupContactForm = () => {
        const contactForm = document.getElementById('retro-contact-form');
        const formStatus = document.getElementById('form-status');

        if (contactForm && formStatus) {
            contactForm.addEventListener('submit', async (e) => {
                e.preventDefault(); 

                formStatus.classList.remove('hidden');
                formStatus.textContent = "> ENCRIPTANDO Y ENVIANDO PAQUETE DE DATOS...";
                formStatus.style.color = "var(--primary-color)";
                
                // Extraemos la información de los inputs
                const formData = {
                    name: document.getElementById('senderName').value,
                    email: document.getElementById('senderEmail').value,
                    message: document.getElementById('senderMessage').value
                };

                try {
                    // Enviamos la petición POST al backend
                    const response = await fetch('https://mor8creator-backend.onrender.com:5000/api/messages', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(formData)
                    });

                    if (!response.ok) throw new Error('Fallo en la transmisión del nodo');

                    // Respuesta de éxito
                    formStatus.textContent = "> TRANSMISIÓN EXITOSA. Mensaje registrado en la base de datos central.";
                    formStatus.style.color = "var(--secondary-color)";
                    contactForm.reset(); 
                    
                } catch (error) {
                    console.error('Error al comunicar con la API:', error);
                    formStatus.textContent = "> ERROR_CÓDIGO_ROJO: LA TRANSMISIÓN HA SIDO INTERCEPTADA O RECHAZADA.";
                }

                // Ocultar el mensaje después de 6 segundos
                setTimeout(() => {
                    formStatus.classList.add('hidden');
                    formStatus.textContent = "";
                }, 6000);
            });
        }
    };

    // --- 5. LÓGICA DEL MENÚ HAMBURGUESA (MÓVILES) ---
    const setupMobileMenu = () => {
        const menuToggle = document.getElementById('menu-toggle');
        const mainNav = document.getElementById('main-nav');

        if (menuToggle && mainNav) {
            menuToggle.addEventListener('click', () => {
                const isOpen = mainNav.classList.toggle('is-open');
                menuToggle.setAttribute('aria-expanded', isOpen);
                
                if(isOpen && !document.body.classList.contains('reduce-motion')) {
                    mainNav.style.animation = "none";
                    void mainNav.offsetWidth; 
                    mainNav.style.animation = "crtAnimation 100s linear infinite";
                }
            });
        }
    };

    // --- 6. CONTROL DEL TEMA (MODO CLARO / OSCURO) ---
    const setupThemeToggle = () => {
        const themeButton = document.getElementById('theme-toggle');
        const body = document.body;

        if (themeButton) {
            const isLightMode = localStorage.getItem('light-theme') === 'true';
            
            if (isLightMode) {
                body.classList.add('light-theme');
                themeButton.textContent = "Modo Oscuro";
            }

            themeButton.addEventListener('click', () => {
                const active = body.classList.toggle('light-theme');
                localStorage.setItem('light-theme', active); 
                themeButton.textContent = active ? "Modo Oscuro" : "Modo Claro";
            });
        }
    };

    // --- 7. CARGA DE CONTRIBUCIONES DE GITHUB ---
    const setupGitHubCalendar = () => {
        const calendarContainer = document.querySelector('.calendar-container');
        
        if (calendarContainer) {
            GitHubCalendar(".calendar-container", "edwinmgallego ", {
                responsive: true,
                tooltips: true,
                global_stats: false 
            }).then(() => {
                const loadingText = calendarContainer.previousElementSibling;
                if (loadingText && loadingText.tagName === 'P') {
                    loadingText.textContent = "Matriz de contribuciones sincronizada. [OK]";
                }
            }).catch(e => {
                console.error("Error conectando con el nodo de GitHub:", e);
                calendarContainer.innerHTML = "<p class='alert'>ERROR_DE_CONEXIÓN: No se pudo obtener la matriz de datos.</p>";
            });
        }
    };

    // --- 8. CONEXIÓN A LA API - BLOG VISTA MAESTRA (LISTA DE POSTS) ---
    const setupBlogAPI = async () => {
        const logFeed = document.querySelector('.log-feed');
        if (!logFeed) return;

        const API_URL = 'https://mor8creator-backend.onrender.com:5000/api';

        try {
            logFeed.innerHTML = '<p class="meta-info">>> ESTABLECIENDO CONEXIÓN CON EL NODO CENTRAL...</p>';

            const response = await fetch(`${API_URL}/posts`);
            const posts = await response.json();

            logFeed.innerHTML = '';

            posts.forEach(post => {
                const categoryName = post.category ? post.category.name.toUpperCase() : 'SYSTEM';
                
                const textExtract = post.content.replace(/<[^>]*>/g, '');
                const shortExcerpt = textExtract.length > 140 ? textExtract.substring(0, 140) + '...' : textExtract;

                const article = document.createElement('article');
                article.className = 'log-entry';
                article.style.marginBottom = '2rem';

                article.innerHTML = `
                    <div class="log-meta">
                        <span class="log-date">${post.timestamp}</span>
                        <span class="log-tag">[ ${categoryName} ]</span>
                    </div>
                    <h2 class="log-title" style="margin: 0.3rem 0;">${post.title}</h2>
                    <div class="log-excerpt">
                        <p style="margin-bottom: 0.8rem;">${shortExcerpt}</p>
                        <a href="article.html?id=${post._id}" class="btn-retro" style="display: inline-block;">[ LEER REGISTRO COMPLETO ]</a>
                    </div>
                `;

                logFeed.appendChild(article);
            });

        } catch (error) {
            console.error('Fallo en el enlace de datos:', error);
            logFeed.innerHTML = '<p class="meta-info alert">>> ERROR_CÓDIGO_ROJO: NO SE PUDO ESTABLECER EL ENLACE CON LA BASE DE DATOS.</p>';
        }
    };

    // --- 9. CONEXIÓN A LA API - BLOG VISTA DETALLE (POST INDIVIDUAL) ---
    const setupArticleAPI = async () => {
        const articleFeed = document.querySelector('.article-feed');
        if (!articleFeed) return; 

        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');

        if (!postId) {
            articleFeed.innerHTML = '<p class="meta-info alert">>> ERROR: DIRECCIÓN DE MEMORIA INVÁLIDA (FALTA ID).</p>';
            return;
        }

        const API_URL = 'https://mor8creator-backend.onrender.com:5000/api';

        try {
            articleFeed.innerHTML = '<p class="meta-info">>> SOLICITANDO PAQUETE DE DATOS AL NODO CENTRAL...</p>';

            const response = await fetch(`${API_URL}/posts/${postId}`);
            
            if (!response.ok) {
                throw new Error('Registro no encontrado');
            }

            const post = await response.json();
            const categoryName = post.category ? post.category.name.toUpperCase() : 'SYSTEM';

            // --- MAGIA PARA EL VIDEO DE YOUTUBE ---
            let videoHTML = '';
            if (post.videoUrl) {
                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                const match = post.videoUrl.match(regExp);
                const videoId = (match && match[2].length === 11) ? match[2] : null;

                if (videoId) {
                    videoHTML = `
                        <div class="video-container" style="margin: 2rem 0; border: 1px dashed var(--primary-color); padding: 0.5rem; background: rgba(0,0,0,0.5);">
                            <iframe width="100%" height="450" 
                                src="https://www.youtube.com/embed/${videoId}" 
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen>
                            </iframe>
                        </div>
                    `;
                } else {
                    videoHTML = `<p class="meta-info alert">>> ADVERTENCIA: FORMATO DE VIDEO NO RECONOCIDO.</p>`;
                }
            }
            // --------------------------------------

            articleFeed.innerHTML = `
                <article class="log-entry-full">
                    <div class="log-meta" style="margin-bottom: 1rem;">
                        <span class="log-date">${post.timestamp}</span> | 
                        <span class="log-tag" style="color: var(--secondary-color);">CATEGORÍA: ${categoryName}</span>
                    </div>
                    <h1 class="log-title" style="color: var(--primary-color); font-size: 1.8rem; border-bottom: 1px dashed var(--primary-color); padding-bottom: 0.5rem; margin-bottom: 1rem;">
                        ${post.title}
                    </h1>
                    
                    ${videoHTML} 

                    <div class="log-content-body" style="line-height: 1.4; margin-top: 2rem;">
                        ${post.content}
                    </div>
                    <br><br>
                    <a href="blog.html" class="btn-retro"><< VOLVER A /SYS_LOGS</a>
                </article>
            `;

        } catch (error) {
            console.error('Error de lectura en API:', error);
            articleFeed.innerHTML = '<p class="meta-info alert">>> ERROR_CRÍTICO: EL REGISTRO NO EXISTE O EL SERVIDOR RECHAZÓ LA SOLICITUD.</p>';
        }
    };

    // --- 10. CONEXIÓN A LA API - PORTAFOLIO VISTA MAESTRA (LISTA DE PROYECTOS) ---
    const setupPortfolioAPI = async () => {
        const projectsFeed = document.querySelector('.projects-feed');
        if (!projectsFeed) return; 

        const API_URL = 'https://mor8creator-backend.onrender.com:5000/api';

        try {
            projectsFeed.innerHTML = '<p class="meta-info">>> CONECTANDO AL REPOSITORIO LOCAL DE PROYECTOS...</p>';

            const response = await fetch(`${API_URL}/projects`);
            const projects = await response.json();

            projectsFeed.innerHTML = '';
            
            const ul = document.createElement('ul');
            ul.style.listStyle = 'none';
            ul.style.padding = '0';

            projects.forEach(project => {
                const techList = project.technologies.join(' | ');
                const statusColor = project.status === 'ONLINE' ? 'var(--primary-color)' : 'gray';

                const li = document.createElement('li');
                li.style.marginBottom = '2rem';
                li.style.borderLeft = '2px dashed var(--secondary-color)';
                li.style.paddingLeft = '1rem';

                li.innerHTML = `
                    <h3 style="color: var(--secondary-color); margin-bottom: 0.3rem; font-size: 1.5rem;">
                        > ${project.name} <span style="font-size: 0.7em; color: ${statusColor};">[${project.status}]</span>
                    </h3>
                    <p class="meta-info" style="font-size: 0.9em; margin-bottom: 0.8rem;">[TECH]: ${techList}</p>
                    <a href="article-portfolio.html?id=${project._id}" class="btn-retro" style="display: inline-block;">[ INSPECCIONAR ARCHIVO ]</a>
                `;
                ul.appendChild(li);
            });

            projectsFeed.appendChild(ul);

        } catch (error) {
            console.error('Fallo en la carga de proyectos:', error);
            projectsFeed.innerHTML = '<p class="meta-info alert">>> ERROR_CÓDIGO_ROJO: NO SE PUDO MONTAR EL DIRECTORIO DE PROYECTOS.</p>';
        }
    };

    // --- 11. CONEXIÓN A LA API - PORTAFOLIO VISTA DETALLE (PROYECTO INDIVIDUAL) ---
    const setupProjectDetailAPI = async () => {
        const projectDetailFeed = document.querySelector('.project-detail-feed');
        if (!projectDetailFeed) return; 

        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');

        if (!projectId) {
            projectDetailFeed.innerHTML = '<p class="meta-info alert">>> ERROR: DIRECCIÓN DE MEMORIA DEL PROYECTO NO ESPECIFICADA.</p>';
            return;
        }

        const API_URL = 'https://mor8creator-backend.onrender.com:5000/api';

        try {
            projectDetailFeed.innerHTML = '<p class="meta-info">>> EXTRACCIÓN DE ENTRADAS DE REGISTRO EN CURSO...</p>';

            const response = await fetch(`${API_URL}/projects/${projectId}`);
            if (!response.ok) throw new Error('Proyecto no indexado');

            const project = await response.json();
            const techList = project.technologies.join(' | ');
            const statusColor = project.status === 'ONLINE' ? 'var(--primary-color)' : 'gray';

            projectDetailFeed.innerHTML = `
                <article class="log-entry-full">
                    <div class="log-meta" style="margin-bottom: 1rem;">
                        <span class="log-tag" style="color: var(--secondary-color);">ESTADO DE EJECUCIÓN: <span style="color: ${statusColor};">${project.status}</span></span>
                    </div>
                    <h1 class="log-title" style="color: var(--primary-color); font-size: 2rem; border-bottom: 1px dashed var(--primary-color); padding-bottom: 0.5rem; margin-bottom: 1rem;">
                        ${project.name}
                    </h1>
                    
                    <p class="meta-info" style="margin-bottom: 1.5rem; font-size: 1.1em; background: rgba(0,0,0,0.2); padding: 0.5rem; display: inline-block;">
                        [STACK_MECATRÓNICO]: ${techList}
                    </p>

                    <div class="log-content-body" style="line-height: 1.5; margin-bottom: 2rem; white-space: pre-wrap;">
                        ${project.description}
                    </div>
                    
                    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                        ${project.repoUrl ? `<a href="${project.repoUrl}" target="_blank" rel="noopener noreferrer" class="btn-retro">[ CLONAR_REPOSITORIO ]</a>` : ''}
                        <a href="portfolio.html" class="btn-retro"><< RETURN TO /PORTFOLIO</a>
                    </div>
                </article>
            `;

        } catch (error) {
            console.error('Error de lectura en sub API de proyectos:', error);
            projectDetailFeed.innerHTML = '<p class="meta-info alert">>> ERROR_CRÍTICO: DIRECCIÓN DE REGISTRO DAÑADA O INEXISTENTE.</p>';
        }
    };

    // --- 12. CONEXIÓN A LA API - TUTORIALES (LISTA MAESTRA) ---
    const setupTutorialsAPI = async () => {
        const tutorialFeed = document.querySelector('.tutorial-feed');
        if (!tutorialFeed) return;

        const API_URL = 'https://mor8creator-backend.onrender.com:5000/api';

        try {
            tutorialFeed.innerHTML = '<p class="meta-info">>> INDEXANDO MANUALES DISPONIBLES...</p>';

            const response = await fetch(`${API_URL}/tutorials`);
            const tutorials = await response.json();

            tutorialFeed.innerHTML = '';
            
            const ol = document.createElement('ol');
            ol.style.paddingLeft = '1.5rem';

            tutorials.forEach(tutorial => {
                const techTags = tutorial.tags.join(', ');
                
                // Lógica de colores para el nivel de dificultad
                let levelColor = 'var(--primary-color)';
                if (tutorial.level === 'INTERMEDIO') levelColor = 'var(--secondary-color)';
                if (tutorial.level === 'AVANZADO') levelColor = 'var(--tertiary-color)';

                const li = document.createElement('li');
                li.style.marginBottom = '2rem';
                li.style.paddingLeft = '0.5rem';

                li.innerHTML = `
                    <h3 style="color: var(--secondary-color); margin-bottom: 0.3rem; font-size: 1.4rem;">
                        ${tutorial.title} <span style="font-size: 0.7em; color: ${levelColor};">[LVL: ${tutorial.level}]</span>
                    </h3>
                    <p class="meta-info" style="font-size: 0.9em; margin-bottom: 0.8rem;">[TAGS]: ${techTags}</p>
                    <a href="article-tutorial.html?id=${tutorial._id}" class="btn-retro" style="display: inline-block;">[ ABRIR MANUAL ]</a>
                `;
                ol.appendChild(li);
            });

            tutorialFeed.appendChild(ol);

        } catch (error) {
            console.error('Fallo en la carga de tutoriales:', error);
            tutorialFeed.innerHTML = '<p class="meta-info alert">>> ERROR_CÓDIGO_ROJO: DIRECTORIO DE MANUALES CORRUPTO.</p>';
        }
    };

    // --- 13. CONEXIÓN A LA API - TUTORIALES (VISTA DETALLE) ---
    const setupTutorialDetailAPI = async () => {
        const tutorialDetailFeed = document.querySelector('.tutorial-detail-feed');
        if (!tutorialDetailFeed) return;

        const urlParams = new URLSearchParams(window.location.search);
        const tutorialId = urlParams.get('id');

        if (!tutorialId) {
            tutorialDetailFeed.innerHTML = '<p class="meta-info alert">>> ERROR: REFERENCIA DE MANUAL NO ENCONTRADA.</p>';
            return;
        }

        const API_URL = 'https://mor8creator-backend.onrender.com:5000/api';

        try {
            tutorialDetailFeed.innerHTML = '<p class="meta-info">>> LEYENDO BLOQUES DE MEMORIA...</p>';

            const response = await fetch(`${API_URL}/tutorials/${tutorialId}`);
            if (!response.ok) throw new Error('Tutorial no indexado');

            const tutorial = await response.json();
            const techTags = tutorial.tags.join(', ');
            
            let levelColor = 'var(--primary-color)';
            if (tutorial.level === 'INTERMEDIO') levelColor = 'var(--secondary-color)';
            if (tutorial.level === 'AVANZADO') levelColor = 'var(--tertiary-color)';

            tutorialDetailFeed.innerHTML = `
                <article class="log-entry-full">
                    <div class="log-meta" style="margin-bottom: 1rem;">
                        <span class="log-tag" style="color: var(--secondary-color);">DIFICULTAD: <span style="color: ${levelColor};">${tutorial.level}</span></span>
                    </div>
                    <h1 class="log-title" style="color: var(--primary-color); font-size: 2.2rem; border-bottom: 1px solid var(--primary-color); padding-bottom: 0.5rem; margin-bottom: 1rem;">
                        ${tutorial.title}
                    </h1>
                    
                    <p class="meta-info" style="margin-bottom: 2rem; font-size: 1rem; border-left: 3px solid var(--secondary-color); padding-left: 0.8rem;">
                        [TAGS]: ${techTags}
                    </p>

                    <div class="log-content-body" style="line-height: 1.6; margin-bottom: 2rem;">
                        ${tutorial.content}
                    </div>
                    
                    <div style="margin-top: 2rem;">
                        <a href="tutorial.html" class="btn-retro"><< REGRESAR AL ÍNDICE</a>
                    </div>
                </article>
            `;

        } catch (error) {
            console.error('Error de lectura en API de tutoriales:', error);
            tutorialDetailFeed.innerHTML = '<p class="meta-info alert">>> ERROR_CRÍTICO: NO SE PUEDE LEER EL ARCHIVO.</p>';
        }
    };

    // --- 14. CONEXIÓN A LA API - CURSOS (LISTA MAESTRA) ---
    const setupCoursesAPI = async () => {
        const coursesFeed = document.querySelector('.courses-feed');
        if (!coursesFeed) return;

        const API_URL = 'https://mor8creator-backend.onrender.com:5000/api';

        try {
            coursesFeed.innerHTML = '<p class="meta-info">>> CARGANDO CATÁLOGO DE ASIGNATURAS VIGENTES...</p>';

            const response = await fetch(`${API_URL}/courses`);
            const courses = await response.json();

            coursesFeed.innerHTML = '';
            
            const ul = document.createElement('ul');
            ul.style.listStyle = 'none';
            ul.style.padding = '0';

            courses.forEach(course => {
                let statusColor = course.status === 'ACTIVO' ? 'var(--primary-color)' : 'gray';

                const li = document.createElement('li');
                li.style.marginBottom = '2rem';
                li.style.borderLeft = '2px dashed var(--primary-color)';
                li.style.paddingLeft = '1rem';

                li.innerHTML = `
                    <h3 style="color: var(--secondary-color); margin-bottom: 0.3rem; font-size: 1.5rem;">
                        > ${course.title} <span style="font-size: 0.7em; color: ${statusColor};">[${course.status}]</span>
                    </h3>
                    <p style="margin-bottom: 0.5rem;">${course.description}</p>
                    <p class="meta-info" style="font-size: 0.9em; margin-bottom: 1rem;">[DURACIÓN]: ${course.duration}</p>
                    <a href="article-courses.html?id=${course._id}" class="btn-retro" style="display: inline-block;">[ VER CONTENIDO PROGRAMÁTICO ]</a>
                `;
                ul.appendChild(li);
            });

            coursesFeed.appendChild(ul);

        } catch (error) {
            console.error('Fallo en la carga de asignaturas:', error);
            coursesFeed.innerHTML = '<p class="meta-info alert">>> ERROR_CÓDIGO_ROJO: ARCHIVO DE CONTROL ACADÉMICO INACCESIBLE.</p>';
        }
    };

    // --- 15. CONEXIÓN A LA API - CURSOS (VISTA DETALLE) ---
    const setupCourseDetailAPI = async () => {
        const courseDetailFeed = document.querySelector('.course-detail-feed');
        if (!courseDetailFeed) return;

        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('id');

        if (!courseId) {
            courseDetailFeed.innerHTML = '<p class="meta-info alert">>> ERROR: PARÁMETRO DE ASIGNATURA VACÍO.</p>';
            return;
        }

        const API_URL = 'https://mor8creator-backend.onrender.com:5000/api';

        try {
            courseDetailFeed.innerHTML = '<p class="meta-info">>> LEYENDO REQUISITOS DEL PLAN DE ESTUDIOS...</p>';

            const response = await fetch(`${API_URL}/courses/${courseId}`);
            if (!response.ok) throw new Error('Curso no indexado');

            const course = await response.json();
            let statusColor = course.status === 'ACTIVO' ? 'var(--primary-color)' : 'gray';

            courseDetailFeed.innerHTML = `
                <article class="log-entry-full">
                    <div class="log-meta" style="margin-bottom: 1rem;">
                        <span class="log-tag" style="color: var(--secondary-color);">ESTADO DE CÁTEDRA: <span style="color: ${statusColor};">${course.status}</span></span> | 
                        <span class="log-date">[DURACIÓN: ${course.duration}]</span>
                    </div>
                    <h1 class="log-title" style="color: var(--primary-color); font-size: 2rem; border-bottom: 1px dashed var(--primary-color); padding-bottom: 0.5rem; margin-bottom: 1rem;">
                        ${course.title}
                    </h1>

                    <div class="log-content-body" style="line-height: 1.5; margin-bottom: 2rem;">
                        ${course.syllabus}
                    </div>
                    
                    <div style="margin-top: 2rem;">
                        <a href="courses.html" class="btn-retro"><< RETORNAR A /COURSES</a>
                    </div>
                </article>
            `;

        } catch (error) {
            console.error('Error de lectura en API de cursos:', error);
            courseDetailFeed.innerHTML = '<p class="meta-info alert">>> ERROR_CRÍTICO: NO SE PUEDEN DESENCRIPTAR LOS REQUISITOS DE CÁTEDRA.</p>';
        }
    };

    // --- 16. LÓGICA DE AUTENTICACIÓN (LOGIN ADMINISTRADOR) ---
    const setupAdminLogin = () => {
        const loginForm = document.getElementById('admin-login-form');
        const loginStatus = document.getElementById('login-status');

        if (loginForm && loginStatus) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault(); 

                loginStatus.classList.remove('hidden');
                loginStatus.textContent = "> COMPROBANDO CREDENCIALES...";
                loginStatus.style.color = "var(--primary-color)";

                const credentials = {
                    username: document.getElementById('admin-user').value,
                    password: document.getElementById('admin-pass').value
                };

                try {
                    const response = await fetch('https://mor8creator-backend.onrender.com:5000/api/auth/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(credentials)
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.message || 'Conexión rechazada');
                    }

                    // ¡ÉXITO! Guardamos el token en la bóveda local del navegador
                    localStorage.setItem('adminToken', data.token);

                    loginStatus.textContent = "> ACCESO CONCEDIDO. REDIRIGIENDO AL PANEL DE CONTROL...";
                    loginStatus.style.color = "var(--secondary-color)";
                    
                    // Redirigimos al dashboard después de 1.5 segundos
                    setTimeout(() => {
                        window.location.href = 'admin-dashboard.html';
                    }, 1500);

                } catch (error) {
                    console.error('Fallo de autenticación:', error);
                    loginStatus.textContent = `> ACCESO DENEGADO: ${error.message}`;
                    loginStatus.style.color = "var(--tertiary-color)"; // Rojo
                    
                    // Limpiamos la contraseña por seguridad
                    document.getElementById('admin-pass').value = '';
                }
            });
        }
    };

    // --- 17. PANEL DE CONTROL (DASHBOARD ADMINISTRADOR MULTI-MÓDULO) ---
    const setupAdminDashboard = () => {
        const dashboardFeed = document.getElementById('admin-dashboard-section');
        if (!dashboardFeed) return;

        // 1. EL GUARDIÁN
        const token = localStorage.getItem('adminToken');
        if (!token) {
            alert('ERROR_CRÍTICO: ACCESO DENEGADO. Credenciales ausentes.');
            window.location.href = 'admin-login.html';
            return;
        }

        // 2. PROTOCOLO DE SALIDA
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('adminToken');
                window.location.href = 'admin-login.html';
            });
        }

        // 3. LÓGICA DE NAVEGACIÓN (TIPO WORDPRESS)
        const tabBtns = document.querySelectorAll('.admin-tab-btn');
        const panels = document.querySelectorAll('.admin-panel');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // A. Apagar todos los paneles agregando la clase 'hidden'
                panels.forEach(panel => panel.classList.add('hidden'));
                
                // B. Remover el estilo de 'activo' (opcional, por si luego le das un estilo especial CSS)
                tabBtns.forEach(b => b.classList.remove('active'));

                // C. Encender solo el panel seleccionado
                const targetId = btn.getAttribute('data-target');
                document.getElementById(targetId).classList.remove('hidden');
                btn.classList.add('active');
            });
        });

        // 4. Función genérica para manejar los envíos a la API
        const handleInyection = async (url, data, statusElement, formElement) => {
            statusElement.classList.remove('hidden');
            statusElement.textContent = "> AUTENTICANDO CON JWT Y TRANSMITIENDO...";
            statusElement.style.color = "var(--primary-color)";

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                    },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Operación rechazada');
                }

                statusElement.textContent = "> [OK] TRANSMISIÓN EXITOSA.";
                statusElement.style.color = "var(--secondary-color)";
                formElement.reset(); 

                setTimeout(() => { statusElement.classList.add('hidden'); }, 4000);

            } catch (error) {
                console.error('Fallo:', error);
                statusElement.textContent = `> ERROR: ${error.message}`;
                statusElement.style.color = "var(--tertiary-color)";
            }
        };

        // 5A. INYECCIÓN DE BLOG
        const postForm = document.getElementById('new-post-form');
        if (postForm) {
            postForm.addEventListener('submit', (e) => {
                e.preventDefault(); 
                const data = {
                    title: document.getElementById('post-title').value,
                    content: document.getElementById('post-content').value,
                    videoUrl: document.getElementById('post-video').value
                };
                handleInyection('https://mor8creator-backend.onrender.com:5000/api/posts', data, document.getElementById('post-status'), postForm);
            });
        }

        // 5B. INYECCIÓN DE TUTORIALES
        const tutorialForm = document.getElementById('new-tutorial-form');
        if (tutorialForm) {
            tutorialForm.addEventListener('submit', (e) => {
                e.preventDefault(); 
                const tagsArray = document.getElementById('tutorial-tags').value.split(',').map(tag => tag.trim());
                
                const data = {
                    title: document.getElementById('tutorial-title').value,
                    content: document.getElementById('tutorial-content').value,
                    tags: tagsArray,
                    level: document.getElementById('tutorial-level').value
                };
                handleInyection('https://mor8creator-backend.onrender.com:5000/api/tutorials', data, document.getElementById('tutorial-status'), tutorialForm);
            });
        }

        // 5C. INYECCIÓN DE CURSOS
        const courseForm = document.getElementById('new-course-form');
        if (courseForm) {
            courseForm.addEventListener('submit', (e) => {
                e.preventDefault(); 
                const data = {
                    title: document.getElementById('course-title').value,
                    description: document.getElementById('course-desc').value,
                    syllabus: document.getElementById('course-syllabus').value,
                    duration: document.getElementById('course-duration').value,
                    status: document.getElementById('course-status-select').value
                };
                handleInyection('https://mor8creator-backend.onrender.com:5000/api/courses', data, document.getElementById('course-status'), courseForm);
            });
        }
    };

    // --- INICIALIZAR TODOS LOS MÓDULOS ---
    highlightActiveNav();
    setupA11yToggle();
    setupKeyboardNav();
    setupContactForm();
    setupMobileMenu(); 
    setupThemeToggle(); 
    setupGitHubCalendar();
    setupBlogAPI();
    setupArticleAPI(); 
    setupPortfolioAPI(); 
    setupProjectDetailAPI(); 
    setupTutorialsAPI();       
    setupTutorialDetailAPI();  
    setupCoursesAPI();         
    setupCourseDetailAPI();    
    setupAdminLogin();         
    setupAdminDashboard();     
});