document.addEventListener("DOMContentLoaded", () => {
            // Lógica do Motor do Gerenciador Modal (CMS Dinâmico)
            const cmsToggle = document.getElementById("cms-toggle-btn");
            const cmsPanel = document.getElementById("cms-panel");
            const cmsClose = document.getElementById("cms-close-btn");
            const cmsSave = document.getElementById("cms-save-btn");
            const cmsContainer = document.getElementById("cms-fields-container");

            // Mapeamos os caminhos dos seletores via querySelector e definimos o tipo do campo
            const cmsConfig = [
                { id: "hero_super", label: "Hero: Sobretítulo", selector: ".hero-section .ds-eyebrow" },
                { id: "hero_title1", label: "Hero: Título Linha 1", selector: ".hero-section .headline-line:nth-child(1) .headline-inner" },
                { id: "hero_title2", label: "Hero: Título Linha 2", selector: ".hero-section .headline-line:nth-child(2) .headline-inner" },
                { id: "hero_desc", label: "Hero: Descrição Principal", selector: ".hero-section .subtext", type: "textarea" },
                { id: "hero_btn", label: "Hero: Botão Compra", selector: ".hero-section .btn-primary" },

                { id: "eng_super", label: "Engenharia: Sobretítulo", selector: ".engineering-section .ds-eyebrow" },
                { id: "eng_title1", label: "Engenharia: Título L1", selector: ".engineering-section .text-reveal-wrapper:nth-child(1) .text-reveal-content" },
                { id: "eng_title2", label: "Engenharia: Título L2", selector: ".engineering-section .text-reveal-wrapper:nth-child(2) .text-reveal-content" },
                { id: "eng_desc", label: "Engenharia: Descrição", selector: ".engineering-section .ds-p", type: "textarea" },

                { id: "feat1_t", label: "Card 1: Título", selector: ".eng-feature-item:nth-child(1) .feat-title" },
                { id: "feat1_d", label: "Card 1: Descrição", selector: ".eng-feature-item:nth-child(1) .feat-desc", type: "textarea" },
                { id: "feat2_t", label: "Card 2: Título", selector: ".eng-feature-item:nth-child(2) .feat-title" },
                { id: "feat2_d", label: "Card 2: Descrição", selector: ".eng-feature-item:nth-child(2) .feat-desc", type: "textarea" },
                { id: "feat3_t", label: "Card 3: Título", selector: ".eng-feature-item:nth-child(3) .feat-title" },
                { id: "feat3_d", label: "Card 3: Descrição", selector: ".eng-feature-item:nth-child(3) .feat-desc", type: "textarea" },

                { id: "exp_super", label: "Experiência: Sobretítulo", selector: ".fluid-section .ds-eyebrow" },
                { id: "exp_title1", label: "Experiência: Título 1", selector: ".fluid-section .ds-h2:nth-of-type(1)" },
                { id: "exp_title2", label: "Experiência: Título 2", selector: ".fluid-section .ds-h2:nth-of-type(2)" },

                { id: "cta_h", label: "CTA Final: Título", selector: ".final-cta-section .ds-h2" },
                { id: "cta_b", label: "CTA Final: Link", selector: ".final-cta-section .cta-ghost-link" },

                { id: "nav1", label: "Menu Lateral: Item 1", selector: ".nav-label", index: 0, multi: true },
                { id: "nav2", label: "Menu Lateral: Item 2", selector: ".nav-label", index: 1, multi: true },
                { id: "nav3", label: "Menu Lateral: Item 3", selector: ".nav-label", index: 2, multi: true }
            ];

            // 1. Carrega salvos locais se disponíveis (memória)
            const savedData = JSON.parse(localStorage.getItem('artools_cms_data') || '{}');

            // 2. Constrói formulário baseando-se nos nódulos da página
            cmsConfig.forEach((item) => {
                let els = [];
                if (item.multi) {
                    // Trata navegadores duplo onde a mesma string deve atualizar o "clear mask" e "dark mask"
                    document.querySelectorAll('.premium-side-nav-container ' + item.selector).forEach((el, idx) => {
                        // Os links são pareados (1 e 4 são o mesmo, 2 e 5 são o mesmo, etc)
                        if (idx % 3 === item.index) els.push(el);
                    });
                } else {
                    const foundObj = document.querySelector(item.selector);
                    if (foundObj) els.push(foundObj);
                }

                if (els.length === 0) return;

                // Pega do storage ou do HTML raiz
                let currentText = savedData[item.id] || els[0].textContent.trim();

                // Aplica nas visualizações caso tenha sido restaurado
                if (savedData[item.id]) {
                    els.forEach(el => el.textContent = currentText);
                }

                // Cria o campo do modal
                const group = document.createElement("div");
                group.className = "cms-group";

                const label = document.createElement("label");
                label.textContent = item.label;

                let inputField;
                if (item.type === 'textarea') {
                    inputField = document.createElement("textarea");
                    inputField.rows = 3;
                } else {
                    inputField = document.createElement("input");
                    inputField.type = "text";
                }
                inputField.value = currentText;

                // Evento real-time pra mudança ao vivo
                inputField.addEventListener("input", (e) => {
                    els.forEach(el => el.textContent = e.target.value);
                });

                group.appendChild(label);
                group.appendChild(inputField);
                cmsContainer.appendChild(group);

                item.inputRef = inputField;
            });

            // 3. Funções de painel abrir/fechar
            cmsToggle.addEventListener('click', () => cmsPanel.classList.add('active'));
            cmsClose.addEventListener('click', () => cmsPanel.classList.remove('active'));

            // 4. Salvar permanentemente e notificar UI
            cmsSave.addEventListener('click', () => {
                let dataToSave = {};
                cmsConfig.forEach(item => {
                    if (item.inputRef) {
                        dataToSave[item.id] = item.inputRef.value;
                    }
                });
                localStorage.setItem('artools_cms_data', JSON.stringify(dataToSave));
                cmsSave.textContent = "Salvo com sucesso!";
                cmsSave.style.background = "#4ade80"; // cor de sucesso
                setTimeout(() => {
                    cmsSave.textContent = "Salvar Alterações";
                    cmsSave.style.background = "white";
                }, 2000);
            });
        });