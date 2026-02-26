document.addEventListener("DOMContentLoaded", () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Logica da Floating Nav Dinâmica com Interseção Pixel a Pixel usando clip-path
    const nav = document.getElementById("main-nav");
    const navDarkMask = document.getElementById("nav-dark-mask");
    const cmsBtnEl = document.getElementById("cms-toggle-btn");
    const darkSections = document.querySelectorAll('.engineering-section, .fluid-section, .final-cta-section, .footer-premium');

    const watchScrollForNav = () => {
        const navRect = nav.getBoundingClientRect();
        const cmsBtnRect = cmsBtnEl.getBoundingClientRect();
        const navHeight = navRect.height;
        const navTop = navRect.top;
        const navBottom = navRect.bottom;

        let minDarkTop = navHeight;
        let maxDarkBottom = 0;
        let isCmsDark = false;

        darkSections.forEach(sec => {
            const rect = sec.getBoundingClientRect();

            // Verifica intersecção com o centro exato do Botão CMS
            if (rect.top <= cmsBtnRect.top + (cmsBtnRect.height / 2) && rect.bottom >= cmsBtnRect.top + (cmsBtnRect.height / 2)) {
                isCmsDark = true;
            }

            // Se a seção preta cruza a Nav...
            if (rect.top < navBottom && rect.bottom > navTop) {
                // Calcula qual fatia (de qual pixel até qual pixel y local da Nav) está coberta pela seção
                const localStart = Math.max(0, rect.top - navTop);
                const localEnd = Math.min(navHeight, rect.bottom - navTop);

                // Atualiza os extremos de cobertura escura contínua no menu
                if (localStart < minDarkTop) minDarkTop = localStart;
                if (localEnd > maxDarkBottom) maxDarkBottom = localEnd;
            }
        });

        // Calcula o % de recorte do clip-path baseado no bloco contínuo de escuridão
        // inset(top right bottom left) com margens negativas nas laterais para NÃO cortar o label de hover
        if (minDarkTop < maxDarkBottom) {
            const topCut = (minDarkTop / navHeight) * 100;
            const bottomCut = 100 - ((maxDarkBottom / navHeight) * 100);
            navDarkMask.style.clipPath = `inset(${topCut}% -200px ${bottomCut}% -200px)`;
        } else {
            // Nenhuma sobreposição - totalmente clara
            navDarkMask.style.clipPath = `inset(100% -200px 0 -200px)`;
        }

        // Aplica classe ao Botão CMS
        if (isCmsDark) {
            cmsBtnEl.classList.add('dark-mode');
        } else {
            cmsBtnEl.classList.remove('dark-mode');
        }
    };

    // Listen to scroll to update nav style smoothly
    window.addEventListener('scroll', watchScrollForNav, { passive: true });
    // Chamada inicial
    watchScrollForNav();

    // Simple Reveal Observer para entradas suaves (- IntersectionObserver)
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1
    });

    document.querySelectorAll('.reveal-up').forEach(el => {
        if (prefersReducedMotion) {
            el.classList.add('active');
        } else {
            revealObserver.observe(el);
        }
    });

    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: !prefersReducedMotion,
        mouseMultiplier: 1,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    gsap.registerPlugin(ScrollTrigger);

    if (!prefersReducedMotion) {
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => { lenis.raf(time * 1000); });
        gsap.ticker.lagSmoothing(0);
    }

    // Animações Iniciais
    if (!prefersReducedMotion) {
        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

        tl.to(".video-container", {
            opacity: 1,
            duration: 1.8,
            ease: "power2.inOut"
        })
            .to(".headline-inner", {
                y: "0%",
                opacity: 1,
                duration: 1.2,
                stagger: 0.15,
            }, "-=1.0")
            .to(".subtext", { y: 0, opacity: 1, duration: 1 }, "-=0.9")
            .to(".btn-group", { y: 0, opacity: 1, duration: 1 }, "-=0.9")
            .to(".scroll-indicator", { opacity: 1, duration: 1 }, "-=0.5");
    }

    // GSAP Scrub Scroll do Video Fullscreen
    const video = document.getElementById('hero-video');
    const loader = document.querySelector('.video-loader');
    let isVideoReady = false;

    function initScrollScrub() {
        if (!isVideoReady || prefersReducedMotion) return;

        ScrollTrigger.create({
            trigger: ".hero-section",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5, // 0.5s de suavidade e inércia pós-scroll
            onUpdate: (self) => {
                if (video.duration) {
                    try {
                        video.currentTime = self.progress * video.duration;
                    } catch (e) { }
                }
            }
        });

        // Parallax/Desaparecimento do bloco de texto conforme avança o Scroll
        gsap.to(".copy-column", {
            y: -150,
            opacity: 0,
            scale: 0.95,
            ease: "none",
            scrollTrigger: {
                trigger: ".hero-section",
                start: "top top",
                end: "40% top",
                scrub: true
            }
        });

        // Fade-out do overlay para o vídeo assumir o protagonismo com 100% de brilho/opacidade
        gsap.to(".video-overlay", {
            opacity: 0,
            ease: "none",
            scrollTrigger: {
                trigger: ".hero-section",
                start: "top top",
                end: "30% top",
                scrub: true
            }
        });

        gsap.to(".scroll-indicator", {
            opacity: 0,
            y: 50,
            ease: "none",
            scrollTrigger: {
                trigger: ".hero-section",
                start: "top top",
                end: "20% top",
                scrub: true
            }
        });
    }

    video.addEventListener('loadedmetadata', () => {
        loader.classList.add('loaded');
        isVideoReady = true;
        initScrollScrub();
    });

    if (video.readyState >= 1) {
        loader.classList.add('loaded');
        isVideoReady = true;
        initScrollScrub();
    }

    video.load();

    // ── LÓGICA DO CURSOR DE BOLINHAS (RASTRO) ──
    if (!prefersReducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        document.body.appendChild(cursor);

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let cursorX = mouseX;
        let cursorY = mouseY;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        let lastEmittedX = mouseX;
        let lastEmittedY = mouseY;

        function renderCursor() {
            // Suavização do movimento principal (LERP)
            cursorX += (mouseX - cursorX) * 0.3;
            cursorY += (mouseY - cursorY) * 0.3;

            cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;

            // Cálculo da distância para soltar as partículas no caminho exato onde o mouse passou
            const dx = cursorX - lastEmittedX;
            const dy = cursorY - lastEmittedY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Gera poeira constante com base na distância (denso = asteroide)
            if (dist > 1) {
                // Calcula quantidades proporcionais a velocidade da "viagem"
                const numParticles = Math.max(1, Math.floor(dist / 3));

                for (let i = 0; i < numParticles; i++) {
                    const t = i / numParticles;

                    // Adiciona um "jitter" (espalhamento) da poeira em torno do núcleo central
                    // para que o rastro tenha volume orgânico e não pareça um traço de lápis
                    const spread = 8; // Raio de espalhamento
                    const jitterX = (Math.random() - 0.5) * spread;
                    const jitterY = (Math.random() - 0.5) * spread;

                    const spawnX = (lastEmittedX + dx * t) + jitterX;
                    const spawnY = (lastEmittedY + dy * t) + jitterY;

                    createTrail(spawnX, spawnY);
                }
                lastEmittedX = cursorX;
                lastEmittedY = cursorY;
            }

            requestAnimationFrame(renderCursor);
        }

        function createTrail(x, y) {
            const trailWrapper = document.createElement('div');
            trailWrapper.style.position = 'fixed';
            trailWrapper.style.pointerEvents = 'none';
            trailWrapper.style.zIndex = '9998'; // Logo abaixo do cursor principal
            trailWrapper.style.left = '0';
            trailWrapper.style.top = '0';
            trailWrapper.style.transform = `translate3d(${x}px, ${y}px, 0)`;

            const trail = document.createElement('div');
            trail.className = 'cursor-trail';

            // Partícula constante de 1px preta (sem variação de escala)
            const size = 1;
            trail.style.width = `${size}px`;
            trail.style.height = `${size}px`;

            // Centraliza a micro-partícula exatamente no offset matemático do Wrapper
            trail.style.marginTop = `-${size / 2}px`;
            trail.style.marginLeft = `-${size / 2}px`;

            trailWrapper.appendChild(trail);
            document.body.appendChild(trailWrapper);

            setTimeout(() => trailWrapper.remove(), 750);
        }

        requestAnimationFrame(renderCursor);
    }

    // ── GSAP DOBRA 2: ENGENHARIA PROGRESSIVA ──
    if (!prefersReducedMotion) {
        // Efeito Parallax/Zoom ultra-suave na imagem estática ao rolar a página
        gsap.to(".eng-pen-img", {
            scale: 1.15,
            ease: "none",
            scrollTrigger: {
                trigger: ".engineering-section",
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });

        // Atualização GSAP para englobar as novas classes text-reveal e efeitos dos tech-cards

        // Anima o Trigger Reveal Wrapper Headings
        const revealTriggers = document.querySelectorAll('.text-reveal-trigger');
        revealTriggers.forEach((trigger) => {
            gsap.to(trigger, {
                scrollTrigger: {
                    trigger: trigger,
                    start: "top 80%",
                    toggleClass: "reveal-active"
                }
            });
        });

        // Entrada da Intro (demais textos)
        gsap.to(".eng-intro .eng-anim:not(.text-reveal-trigger)", {
            y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: "power3.out",
            scrollTrigger: {
                trigger: ".eng-intro",
                start: "top 75%"
            }
        });

        // Entrada dos Cards Estilo Tech Hover
        gsap.to(".tech-card.eng-anim", {
            y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power3.out",
            scrollTrigger: {
                trigger: ".eng-feature-list",
                start: "top 75%"
            }
        });

        // ── DOBRA 3: SEQUÊNCIA FLUIDA / EXPANSÃO DE PORTAL ──
        let tlFluid = gsap.timeline({
            scrollTrigger: {
                trigger: ".fluid-section",
                start: "top top",
                end: "bottom bottom",
                scrub: 1 // Inércia para um "feel" Apple Premium (Scrub de 1 seg)
            }
        });

        // 1. O círculo expande do meio da tela abrindo o portal pro vídeo (150% cobre a tela)
        tlFluid.to(".fluid-video-wrapper", {
            clipPath: "circle(150% at 50% 50%)",
            duration: 4,
            ease: "power2.inOut"
        }, 0);

        // 2. Zoom-out cinematográfico do vídeo junto com a abertura
        tlFluid.to(".fluid-video-wrapper video", {
            scale: 1,
            duration: 4,
            ease: "power2.inOut"
        }, 0);

        // 3. O texto inicial de "continue rolando" esmaece em desfoque
        tlFluid.to(".fluid-intro-text", {
            opacity: 0,
            scale: 1.5,
            filter: "blur(10px)",
            duration: 1.5,
            ease: "power1.in"
        }, 0);

        // 4. Overlay gradiente escurece o vídeo (inicia um terço à frente)
        tlFluid.to(".fluid-video-overlay", {
            opacity: 1,
            duration: 2,
            ease: "power2.inOut"
        }, 1.5);

        // 5. As linhas do título imponente emergem agressivamente 
        tlFluid.to(".fluid-line", {
            y: 0,
            duration: 2.5,
            stagger: 0.3,
            ease: "power4.out"
        }, 2.5);

        // 6. Os cards informacionais Glassmorphism sobem finalizando
        tlFluid.to(".fluid-cards-container", {
            y: 0,
            opacity: 1,
            duration: 2,
            ease: "power3.out"
        }, 3);

    }

    // Função Flashlight extraída do Design System
    window.updateFlashlight = function (e, card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mx", `${x}px`);
        card.style.setProperty("--my", `${y}px`);
    }

    // ── LÓGICA DO CANVAS MAGNÉTICO MULTIPLOS (PONTOS) ──
    const magneticCanvases = document.querySelectorAll('.magnetic-canvas');

    magneticCanvases.forEach(magCanvas => {
        const ctx = magCanvas.getContext('2d');
        let width, height;
        let dots = [];
        const spacing = 40; // Espaçamento entre os pontos
        const maxPullDistance = 250; // Área de atração do mouse
        let mouse = { x: -1000, y: -1000 };
        let isHovering = false;

        // Container pai do canvas (Section ou Footer) determina o escopo do mouse
        const parentSection = magCanvas.closest('section, footer') || magCanvas.parentElement;

        function initCanvas() {
            // Recalcula tamanho usando ScrollHeight para seções absurdamente longas (tipo 400vh)
            const rect = parentSection.getBoundingClientRect();
            // A altura física real da div parent engloba todo o scroll necessário
            const realHeight = parentSection.offsetHeight;

            const dpr = window.devicePixelRatio || 1;

            magCanvas.width = rect.width * dpr;
            magCanvas.height = realHeight * dpr;
            ctx.scale(dpr, dpr);

            magCanvas.style.width = rect.width + 'px';
            magCanvas.style.height = realHeight + 'px';

            width = rect.width;
            height = realHeight;

            dots = [];
            // Adicionando uma margem para os pontos preencherem as bordas limpos
            for (let x = spacing / 2; x < width; x += spacing) {
                for (let y = spacing / 2; y < height; y += spacing) {
                    dots.push({
                        baseX: x,
                        baseY: y,
                        x: x,
                        y: y,
                    });
                }
            }
        }

        initCanvas();
        window.addEventListener('resize', initCanvas);

        parentSection.addEventListener('mousemove', (e) => {
            const rect = magCanvas.getBoundingClientRect();
            // Calculo para bater sempre na escala relativa do mouse no Canvas
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
            isHovering = true;
        });

        parentSection.addEventListener('mouseleave', () => {
            isHovering = false;
        });

        function animateMagneticDots() {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
            ctx.beginPath();

            for (let i = 0; i < dots.length; i++) {
                let dot = dots[i];

                if (isHovering) {
                    let dx = mouse.x - dot.baseX;
                    let dy = mouse.y - dot.baseY;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < maxPullDistance) {
                        // Puxa em direção ao mouse - Efeito elástico sutil
                        let force = (maxPullDistance - distance) / maxPullDistance;
                        // Deslocamento máximo é controlado pelo fator 0.4
                        let tx = dot.baseX + (dx * force * 0.4);
                        let ty = dot.baseY + (dy * force * 0.4);

                        dot.x += (tx - dot.x) * 0.1; // Ease de aproximação
                        dot.y += (ty - dot.y) * 0.1;
                    } else {
                        // Fora do raio, retorna lentamente
                        dot.x += (dot.baseX - dot.x) * 0.08;
                        dot.y += (dot.baseY - dot.y) * 0.08;
                    }
                } else {
                    // Se mouse não está por cima da seção, reseta posições
                    if (Math.abs(dot.x - dot.baseX) > 0.1 || Math.abs(dot.y - dot.baseY) > 0.1) {
                        dot.x += (dot.baseX - dot.x) * 0.08;
                        dot.y += (dot.baseY - dot.y) * 0.08;
                    } else {
                        dot.x = dot.baseX;
                        dot.y = dot.baseY;
                    }
                }

                ctx.moveTo(dot.x, dot.y);
                // Desenha cada ponto (círculos bem sutis)
                ctx.arc(dot.x, dot.y, 1.2, 0, Math.PI * 2);
            }
            ctx.fill();

            requestAnimationFrame(animateMagneticDots);
        }

        // Pausar renderização com IntersectionObserver para otimizar a performance agressiva de múltiplos canvas
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    magCanvas.style.display = 'block';
                    requestAnimationFrame(animateMagneticDots);
                } else {
                    magCanvas.style.display = 'none';
                }
            });
        }, { threshold: 0.01 });

        observer.observe(parentSection);
    });

});