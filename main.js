/**
 * AgroSmart - Core Dashboard Engine (2026)
 * Gerenciamento dinâmico de dados, acessibilidade nativa e responsividade.
 */

// Banco de dados em memória inicial (Datas e escopos atualizados para 2026)
let plantacoes = [
    { id: 1, cultura: 'Soja', area: 10, dataPlantio: '2026-01-15', irrigacao: 'gotejamento', progresso: 75, status: 'crescimento' },
    { id: 2, cultura: 'Milho', area: 8, dataPlantio: '2026-02-01', irrigacao: 'aspersao', progresso: 90, status: 'colheita' },
    { id: 3, cultura: 'Trigo', area: 15, dataPlantio: '2026-01-20', irrigacao: 'pivo', progresso: 50, status: 'irrigacao' }
];

let proximoId = 4;
let escalaTextoAtual = 100;
let sinteseVoz = window.speechSynthesis;
let utteranceAtual = null;

// Captura de Elementos do DOM
const gridPlantacoes = document.getElementById('gridPlantacoes');
const modalPlantacao = document.getElementById('modalPlantacao');
const btnNovaPlantacao = document.getElementById('btnNovaPlantacao');
const btnFecharModal = document.getElementById('btnFecharModal');
const formPlantacao = document.getElementById('formPlantacao');
const areaPlantadaCard = document.getElementById('areaPlantada');

// Elementos da Caixa de Acessibilidade
const btnToggleAcessibilidade = document.getElementById('btnToggleAcessibilidade');
const menuAcessibilidade = document.getElementById('menuAcessibilidade');
const btnAumentarTexto = document.getElementById('btnAumentarTexto');
const btnDiminuirTexto = document.getElementById('btnDiminuirTexto');
const btnAlternarTema = document.getElementById('btnAlternarTema');
const btnIniciarLeitura = document.getElementById('btnIniciarLeitura');
const btnPararLeitura = document.getElementById('btnPararLeitura');

/* ==========================================================================
   SISTEMA DE ACESSIBILIDADE FLUTUANTE & VOZ (SPEECH SYNTHESIS API)
   ========================================================================== */

// Alternar visibilidade da caixinha flutuante
btnToggleAcessibilidade.addEventListener('click', () => {
    const ativo = menuAcessibilidade.classList.toggle('active');
    btnToggleAcessibilidade.setAttribute('aria-expanded', ativo);
    menuAcessibilidade.setAttribute('aria-hidden', !ativo);
});

// Controle de Escala Dinâmica de Fontes (rem/clamp compatível)
btnAumentarTexto.addEventListener('click', () => {
    if (escalaTextoAtual < 140) {
        escalaTextoAtual += 10;
        document.documentElement.style.setProperty('--font-scale', `${escalaTextoAtual}%`);
    }
});

btnDiminuirTexto.addEventListener('click', () => {
    if (escalaTextoAtual > 80) {
        escalaTextoAtual -= 10;
        document.documentElement.style.setProperty('--font-scale', `${escalaTextoAtual}%`);
    }
});

// Alternador de Temas Inteligente (Claro/Escuro)
btnAlternarTema.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

// Leitor de Tela Nativo - Lê estritamente o conteúdo principal (#conteudo-principal)
btnIniciarLeitura.addEventListener('click', () => {
    // Cancela leituras anteriores ativas
    sinteseVoz.cancel();

    const containerPrincipal = document.getElementById('conteudo-principal');
    // Filtra o conteúdo textual limpando emaranhados de espaços em branco e emojis decorativos complexos
    const textoParaLer = containerPrincipal.innerText;

    if (!textoParaLer.trim()) return;

    utteranceAtual = new SpeechSynthesisUtterance(textoParaLer);
    utteranceAtual.lang = 'pt-BR';
    utteranceAtual.rate = 1.1; // Velocidade de leitura levemente otimizada

    // Gerenciador de Estado dos Botões do Menu
    utteranceAtual.onstart = () => {
        btnIniciarLeitura.disabled = true;
        btnPararLeitura.disabled = false;
    };

    utteranceAtual.onend = () => {
        btnIniciarLeitura.disabled = false;
        btnPararLeitura.disabled = true;
    };

    utteranceAtual.onerror = () => {
        btnIniciarLeitura.disabled = false;
        btnPararLeitura.disabled = true;
    };

    sinteseVoz.speak(utteranceAtual);
});

// Botão para Interromper a leitura nativa imediatamente
btnPararLeitura.addEventListener('click', () => {
    sinteseVoz.cancel();
    btnIniciarLeitura.disabled = false;
    btnPararLeitura.disabled = true;
});

/* ==========================================================================
   LÓGICA OPERACIONAL DO DASHBOARD (BOAS PRÁTICAS: REGRAS REUTILIZÁVEIS)
   ========================================================================== */

function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function calcularAreaTotal() {
    const total = plantacoes.reduce((acc, obj) => acc + parseFloat(obj.area), 0);
    areaPlantadaCard.textContent = `${total.toFixed(1)} hectares`;
}

function renderizarPlantacoes(filtro = 'todas') {
    gridPlantacoes.innerHTML = '';
    let filtradas = plantacoes;

    if (filtro !== 'todas') {
        filtradas = plantacoes.filter(p => p.status === filtro);
    }

    if (filtradas.length === 0) {
        gridPlantacoes.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding: 2rem; color: var(--text-muted);">Nenhuma plantação ativa encontrada para esta categoria.</p>`;
        calcularAreaTotal();
        return;
    }

    filtradas.forEach(p => {
        const card = document.createElement('div');
        card.className = `plantacao-card ${p.status}`;
        
        const labelStatus = {
            crescimento: 'Em Crescimento',
            colheita: 'Pronta para Colheita',
            irrigacao: 'Precisa de Irrigação'
        };

        card.innerHTML = `
            <div class="card-header">
                <h3>${p.cultura}</h3>
                <span class="status-badge status-${p.status}">${labelStatus[p.status]}</span>
            </div>
            <div class="card-body">
                <p><strong>Tamanho:</strong> ${p.area} ha</p>
                <p><strong>Plantio:</strong> ${formatarData(p.dataPlantio)}</p>
                <p><strong>Sistema:</strong> ${p.irrigacao}</p>
                <p><strong>Desenvolvimento:</strong> ${p.progresso}%</p>
                <div class="progress-bar" aria-label="Progresso da cultura">
                    <div class="progress-fill" style="width: ${p.progresso}%"></div>
                </div>
            </div>
            <div class="card-actions">
                ${p.status === 'irrigacao' ? `<button class="btn-small btn-irrigar" data-id="${p.id}" data-action="irrigar">💧 Ativar Irrigação</button>` : ''}
                ${p.status === 'colheita' ? `<button class="btn-small btn-colher" data-id="${p.id}" data-action="colher">🚜 Iniciar Colheita</button>` : ''}
                <button class="btn-small btn-remover" data-id="${p.id}" data-action="remover">🗑️ Deletar</button>
            </div>
        `;
        gridPlantacoes.appendChild(card);
    });

    calcularAreaTotal();
}

/* ==========================================================================
   DELEGAÇÃO DE EVENTOS EFICIENTE (SEM EVENTOS INLINE NO HTML)
   ========================================================================== */

gridPlantacoes.addEventListener('click', (e) => {
    const target = e.target;
    if (!target.classList.contains('btn-small')) return;

    const id = parseInt(target.getAttribute('data-id'));
    const acao = target.getAttribute('data-action');
    const culturaAlvo = plantacoes.find(p => p.id === id);

    if (!culturaAlvo) return;

    if (acao === 'irrigar') {
        alert(`Automação Inteligente disparada para a plantação de ${culturaAlvo.cultura}.`);
        culturaAlvo.status = 'crescimento';
        culturaAlvo.progresso = Math.min(culturaAlvo.progresso + 15, 85);
        renderizarPlantacoes();
    } else if (acao === 'colher') {
        alert(`Ordem de colheita enviada para os maquinários da área de ${culturaAlvo.cultura}.`);
        plantacoes = plantacoes.filter(p => p.id !== id);
        renderizarPlantacoes();
    } else if (acao === 'remover') {
        if (confirm(`Deseja mesmo remover os registros de ${culturaAlvo.cultura}?`)) {
            plantacoes = plantacoes.filter(p => p.id !== id);
            renderizarPlantacoes();
        }
    }
});

// Captura de Filtros Superiores
document.querySelectorAll('.filtro-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        renderizarPlantacoes(e.target.getAttribute('data-filter') || e.target.dataset.filtro);
    });
});

/* ==========================================================================
   GERENCIADOR DOS MODAIS E FORMULÁRIOS
   ========================================================================== */
btnNovaPlantacao.addEventListener('click', () => modalPlantacao.classList.add('active'));
btnFecharModal.addEventListener('click', () => modalPlantacao.classList.remove('active'));

formPlantacao.addEventListener('submit', (e) => {
    e.preventDefault();

    const nova = {
        id: proximoId++,
        cultura: document.getElementById('cultura').value,
        area: parseFloat(document.getElementById('area').value),
        dataPlantio: document.getElementById('dataPlantio').value,
        irrigacao: document.getElementById('irrigacao').value,
        progresso: 15, // Ponto de partida padrão de novas culturas
        status: 'irrigacao'
    };

    plantacoes.push(nova);
    renderizarPlantacoes();
    formPlantacao.reset();
    modalPlantacao.classList.remove('active');
});

// Inicialização Assíncrona do Painel
document.addEventListener('DOMContentLoaded', () => {
    renderizarPlantacoes();
});