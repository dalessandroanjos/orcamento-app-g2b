// --- ESTADO GLOBAL ---
let carrinhoGlobal = [];

// --- SELETORES DE DOM GLOBAIS ---
const listaItensUl = document.getElementById('global_listaItens');
const itensSection = document.getElementById('global_itens-lista-section');
const subtotalCarrinhoDiv = document.getElementById('global_subtotal-carrinho');
const finalizeBtn = document.getElementById('global_finalizeBtn');
const resultadoDiv = document.getElementById('global_resultado');
const copySection = document.getElementById('global_copy-section');
const mensagemTextarea = document.getElementById('global_mensagemOrcamento');
const descontoValorInput = document.getElementById('global_descontoValor');

// --- FUNÇÕES GLOBAIS ---
function formatarMoeda(valor) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor); }

function renderCarrinhoGlobal() {
    listaItensUl.innerHTML = '';
    if (carrinhoGlobal.length === 0) {
        itensSection.style.display = 'none';
        resultadoDiv.innerHTML = '';
        copySection.style.display = 'none';
        return;
    }
    let subtotal = 0;
    carrinhoGlobal.forEach(item => {
        subtotal += item.subtotal;
        const li = document.createElement('li');
        let descricaoHTML = `<strong>${item.quantidade}x ${item.nome}</strong>`;
        if (item.detalhes) {
            descricaoHTML += `<div>${item.detalhes}</div>`;
        }
        li.innerHTML = `
            <div class="item-details">
                ${descricaoHTML}
                <div><strong>Subtotal: ${formatarMoeda(item.subtotal)}</strong></div>
            </div>
            <button type="button" class="remover-item-btn" data-id="${item.id}">Remover</button>
        `;
        listaItensUl.appendChild(li);
    });
    subtotalCarrinhoDiv.textContent = `Subtotal Parcial: ${formatarMoeda(subtotal)}`;
    itensSection.style.display = 'block';
}

function removerItemGlobal(id) {
    carrinhoGlobal = carrinhoGlobal.filter(item => item.id !== id);
    renderCarrinhoGlobal();
}

function gerarOrcamentoFinalGlobal() {
    if (carrinhoGlobal.length === 0) { alert("Adicione pelo menos um item ao orçamento."); return; }
    const subtotal = carrinhoGlobal.reduce((acc, item) => acc + item.subtotal, 0);
    const descontoValor = parseFloat(descontoValorInput.value) || 0;
    const tipoDesconto = document.querySelector('input[name="global_tipoDesconto"]:checked').value;
    let valorDoDesconto = 0;
    if (descontoValor > 0) { if (tipoDesconto === 'percent') { valorDoDesconto = (subtotal * descontoValor) / 100; } else { valorDoDesconto = descontoValor; } }
    const totalFinal = Math.max(0, subtotal - valorDoDesconto);
    let resultadoHTML = `<div>Subtotal dos Itens: ${formatarMoeda(subtotal)}</div>`;
    if (valorDoDesconto > 0) { resultadoHTML += `<div>Desconto: <span style="color: #ff5252;">- ${formatarMoeda(valorDoDesconto)}</span></div>`; }
    resultadoHTML += `<div class="resultado-final"><strong>Total a Pagar: ${formatarMoeda(totalFinal)}</strong></div>`;
    resultadoDiv.innerHTML = resultadoHTML;
    resultadoDiv.className = 'resultado sucesso';
    const itensLista = carrinhoGlobal.map(item => { let desc = `${item.quantidade}x ${item.nome}`; if (item.detalhes) { desc += ` ${item.detalhes}`; } return `${desc} - ${formatarMoeda(item.subtotal)}`; }).join('\n');
    mensagemTextarea.value = `${itensLista}\n\nTotal: ${formatarMoeda(totalFinal)}`;
    copySection.style.display = 'block';
}

// --- LÓGICA DAS ABAS ---
(function() {
    const navTabs = document.querySelectorAll('.nav-tab');
    const calculatorPanes = document.querySelectorAll('.calculator-pane');
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            navTabs.forEach(t => t.classList.remove('active'));
            calculatorPanes.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.target).classList.add('active');
        });
    });
})();

// --- LÓGICA CALCULADORA GRÁFICA ---
(function() {
    const form = document.getElementById("orcamentoForm");
    if (!form) return;
    const addItemBtn = document.getElementById('orcamento_addItemBtn');
    const pesquisaInput = document.getElementById("pesquisaProduto");
    const produtos = [ { nome: "Adesivo Brilho com Recorte", preco: 140.00 }, { nome: "Adesivo Brilho sem Acabamento", preco: 110.00 }, { nome: "Adesivo Perfurado", preco: 170.00 }, { nome: "Adesivo Transparente com Recorte", preco: 170.00 }, { nome: "Adesivo Transparente sem Acabamento", preco: 130.00 }, { nome: "Banner Brilho", preco: 105.00 }, { nome: "Banner Fosco", preco: 120.00 }, { nome: "Lona Brilho Madeira", preco: 95.00 }, { nome: "Lona Brilho Revistida em Ilhós", preco: 110.00 } ];
    produtos.sort((a, b) => a.nome.localeCompare(b.nome));
    function popularProdutos(lista) { const sel = document.getElementById('produto'); sel.innerHTML = ''; lista.forEach(p => { const opt = document.createElement("option"); opt.value = p.preco; opt.setAttribute('data-nome-produto', p.nome); opt.textContent = `${p.nome} (${formatarMoeda(p.preco)}/m²)`; sel.appendChild(opt); }); }
    function filtrarProdutos() { const termo = pesquisaInput.value.toLowerCase(); popularProdutos(produtos.filter(p => p.nome.toLowerCase().includes(termo))); }
    function adicionarItem() {
        const l = parseFloat(document.getElementById("largura").value);
        const a = parseFloat(document.getElementById("altura").value);
        const q = parseInt(document.getElementById("quantidade").value);
        const sel = document.getElementById('produto');
        if (isNaN(l) || isNaN(a) || isNaN(q) || l <= 0 || a <= 0 || q < 1) { alert("Preencha as dimensões e a quantidade corretamente."); return; }
        const nomeProduto = sel.options[sel.selectedIndex].getAttribute('data-nome-produto');
        const precoM2 = parseFloat(sel.value);
        carrinhoGlobal.push({ id: Date.now(), nome: nomeProduto, quantidade: q, detalhes: `(${l.toFixed(2)}m x ${a.toFixed(2)}m)`, subtotal: l * a * q * precoM2 });
        renderCarrinhoGlobal();
        document.getElementById("largura").value = ''; document.getElementById("altura").value = ''; document.getElementById("quantidade").value = '1';
    }
    document.addEventListener('DOMContentLoaded', () => popularProdutos(produtos));
    addItemBtn.addEventListener('click', adicionarItem);
    pesquisaInput.addEventListener('input', filtrarProdutos);
})();

// --- LÓGICA CALCULADORA DE IMPRESSÃO ---
(function() {
    const form = document.getElementById("impressaoForm");
    if (!form) return;
    const addItemBtn = document.getElementById('impressao_addItemBtn');
    const pesquisaInput = document.getElementById("impressao_pesquisaPapel");
    const qtdFolhasInput = document.getElementById('impressao_qtdFolhas');
    const encadernacaoObs = document.getElementById('encadernacao_obs');
    const papeis = [ { id: 'sulfite_color', nome: 'Papel Sulfite Colorido', tiers: [{ ate: 9, preco: 1.00 }, { ate: 49, preco: 0.90 }, { ate: 99, preco: 0.80 }, { ate: Infinity, preco: 0.60 }] }, { id: 'sulfite_pb', nome: 'Papel Sulfite PB', tiers: [{ ate: 9, preco: 0.50 }, { ate: 49, preco: 0.45 }, { ate: 99, preco: 0.40 }, { ate: Infinity, preco: 0.35 }] }, { id: 'fotografico', nome: 'Papel Fotográfico', tiers: [{ ate: 9, preco: 7.00 }, { ate: 49, preco: 6.70 }, { ate: 99, preco: 6.50 }, { ate: Infinity, preco: 6.00 }] } ];
    const precosEncadernacao = [ { ate: 25, preco: 5.00 }, { ate: 50, preco: 7.00 }, { ate: 100, preco: 9.00 }, { ate: 200, preco: 12.00 } ];
    function getPrecoPorFolha(id, qtd) { const p = papeis.find(p => p.id === id); if (!p) return 0; const t = p.tiers.find(t => qtd <= t.ate); return t ? t.preco : 0; }
    function getPrecoEncadernacao(qtd) { if (qtd <= 25) return 5.00; if (qtd <= 50) return 7.00; if (qtd <= 100) return 9.00; if (qtd > 100) return 12.00; return 0; }
    function popularPapeis(lista) { const sel = document.getElementById('impressao_tipoPapel'); sel.innerHTML = ''; lista.forEach(p => { const opt = document.createElement("option"); opt.value = p.id; opt.textContent = p.nome; sel.appendChild(opt); }); }
    function adicionarItem() {
        const qtd = parseInt(qtdFolhasInput.value);
        const sel = document.getElementById('impressao_tipoPapel');
        const encadernacao = document.getElementById('impressao_encadernacao');
        const capaDura = document.getElementById('impressao_capaDura');
        if (isNaN(qtd) || qtd < 1) { alert("Insira uma quantidade válida."); return; }
        if (encadernacao.checked && getPrecoEncadernacao(qtd) === 0) { alert("Encadernação não disponível para mais de 200 folhas.\nPor favor, divida o trabalho ou desmarque a opção."); return; }
        const papelId = sel.value;
        const nomePapel = sel.options[sel.selectedIndex].text;
        let custo = qtd * getPrecoPorFolha(papelId, qtd);
        let opcionais = [];
        if (encadernacao.checked) { const preco = getPrecoEncadernacao(qtd); custo += preco; opcionais.push(`Encadernação (${formatarMoeda(preco)})`); }
        if (capaDura.checked) { custo += parseFloat(capaDura.value); opcionais.push('Capa Dura'); }
        carrinhoGlobal.push({ id: Date.now(), nome: nomePapel, quantidade: qtd, detalhes: opcionais.length > 0 ? `+ ${opcionais.join(' + ')}` : '', subtotal: custo });
        renderCarrinhoGlobal();
        qtdFolhasInput.value = '1'; encadernacao.checked = false; capaDura.checked = false; encadernacaoObs.style.display = 'none';
    }
    qtdFolhasInput.addEventListener('input', () => { encadernacaoObs.style.display = parseInt(qtdFolhasInput.value) > 200 ? 'block' : 'none'; });
    document.addEventListener('DOMContentLoaded', () => popularPapeis(papeis));
    addItemBtn.addEventListener('click', adicionarItem);
    pesquisaInput.addEventListener('input', () => popularPapeis(papeis.filter(p => p.nome.toLowerCase().includes(pesquisaInput.value.toLowerCase()))));
})();

// --- LÓGICA CALCULADORA DE CATÁLOGO ---
(function() {
    const form = document.getElementById("catalogoForm");
    if (!form) return;
    const addItemBtn = document.getElementById('catalogo_addItemBtn');
    const pesquisaInput = document.getElementById("catalogo_pesquisa");
    const produtoSelect = document.getElementById("catalogo_produto");
    const qtdInput = document.getElementById("catalogo_qtd");
    const produtosCatalogo = [ { id: 'cartao-visita', nome: 'Cartão de Visita (Milheiro)', preco: 90.00 }, { id: 'folder-a4', nome: 'Folder A4 (100 un.)', preco: 150.00 }, { id: 'banner-roll-up', nome: 'Banner Roll-Up (80x200cm)', preco: 250.00 }, { id: 'caneca-personalizada', nome: 'Caneca de Cerâmica Personalizada', preco: 35.00 }, { id: 'agenda-2025', nome: 'Agenda 2025 Personalizada', preco: 55.00 }, { id: 'imã-geladeira', nome: 'Imã de Geladeira (500 un.)', preco: 120.00 } ];
    produtosCatalogo.sort((a,b) => a.nome.localeCompare(b.nome));
    function popularCatalogo(lista) { produtoSelect.innerHTML = ''; lista.forEach(p => { const opt = document.createElement("option"); opt.value = p.id; opt.textContent = `${p.nome} - ${formatarMoeda(p.preco)}`; produtoSelect.appendChild(opt); }); }
    function adicionarItem() {
        const qtd = parseInt(qtdInput.value);
        const prodId = produtoSelect.value;
        const p = produtosCatalogo.find(p => p.id === prodId);
        if (!p || isNaN(qtd) || qtd < 1) { alert("Selecione um produto e quantidade válida."); return; }
        carrinhoGlobal.push({ id: Date.now(), nome: p.nome, quantidade: qtd, detalhes: '', subtotal: qtd * p.preco });
        renderCarrinhoGlobal();
        qtdInput.value = '1';
    }
    document.addEventListener('DOMContentLoaded', () => popularCatalogo(produtosCatalogo));
    addItemBtn.addEventListener('click', adicionarItem);
    pesquisaInput.addEventListener('input', () => popularCatalogo(produtosCatalogo.filter(p => p.nome.toLowerCase().includes(pesquisaInput.value.toLowerCase()))));
})();

// --- GERENCIADOR DE CLIQUES GLOBAL ---
document.addEventListener('click', function(event) {
    if (event.target.matches('.remover-item-btn')) { removerItemGlobal(parseInt(event.target.dataset.id)); }
    if (event.target.matches('.quick-btn')) {
        const targetInput = document.getElementById(event.target.dataset.target);
        if (targetInput) {
            const valueToAdd = parseFloat(event.target.dataset.value);
            const isDecimal = targetInput.id.includes('largura') || targetInput.id.includes('altura');
            const currentValue = parseFloat(targetInput.value) || 0;
            let newValue = currentValue + valueToAdd;
            targetInput.value = isDecimal ? newValue.toFixed(2) : parseInt(newValue);
            targetInput.dispatchEvent(new Event('input'));
        }
    }
});
finalizeBtn.addEventListener('click', gerarOrcamentoFinalGlobal);
</script>
</body>
</html>