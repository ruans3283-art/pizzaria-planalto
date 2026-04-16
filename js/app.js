const TAXAS_ENTREGA = [
  { id: 'planalto', nome: "Planalto Contínuo", valor: 1.00 },
  { id: 'poco', nome: "Poço das Pedras", valor: 2.00 },
  { id: 'agrovila', nome: "Agrovila", valor: 4.00 },
  { id: 'serrote', nome: "Serrote", valor: 4.00 },
  { id: 'retirada', nome: "Retirada no local", valor: 0.00 }
];

const BORDAS = [
  { id: 'sem_borda', nome: 'Sem Borda', preco: 0 },
  { id: 'catupiry', nome: 'Borda de Catupiry', preco: 10 },
  { id: 'cheddar', nome: 'Borda de Cheddar', preco: 10 },
  { id: 'queijo', nome: 'Borda de Queijo', preco: 10 }
];

let state = {
  cart: [],
  isCartOpen: false,
  bairro: '',
  endereco: '',
  nomeCliente: '',
  pizzaSelecionada: null,
  batataSelecionada: null
};

window.getSubtotal = function () {
  return state.cart.reduce((acc, item) => acc + (item.preco + (item.precoBorda || 0)) * item.quantidade, 0);
};

window.getTaxaEntrega = function () {
  const t = TAXAS_ENTREGA.find(t => t.id === state.bairro);
  return t ? t.valor : 0;
};

window.getTotal = function () {
  return window.getSubtotal() + window.getTaxaEntrega();
};

window.updateState = function (newState) {
  state = { ...state, ...newState };
  render();
};

window.handleAddToCart = function (item) {
  if (item.id.startsWith('ps') || item.id.startsWith('pd')) {
    window.updateState({ pizzaSelecionada: item });
  } else if (item.id === 'ot3') {
    window.updateState({ batataSelecionada: item });
  } else {
    window.adicionarAoCarrinho(item, BORDAS[0]);
  }
};

window.adicionarAoCarrinho = function (item, borda) {
  const existing = state.cart.find(p => p.id === item.id && p.bordaId === borda.id);
  if (existing) {
    const newCart = state.cart.map(p => p === existing ? { ...p, quantidade: p.quantidade + 1 } : p);
    window.updateState({ cart: newCart, pizzaSelecionada: null });
  } else {
    const newItem = { ...item, bordaId: borda.id, nomeBorda: borda.nome, precoBorda: borda.preco, quantidade: 1 };
    window.updateState({ cart: [...state.cart, newItem], pizzaSelecionada: null });
  }
};

window.adicionarBatataAoCarrinho = function (item, recheioName) {
  const existing = state.cart.find(p => p.id === item.id && p.recheio === recheioName);
  if (existing) {
    const newCart = state.cart.map(p => p === existing ? { ...p, quantidade: p.quantidade + 1 } : p);
    window.updateState({ cart: newCart, batataSelecionada: null });
  } else {
    const newItem = { ...item, recheio: recheioName, precoBorda: 0, quantidade: 1 };
    window.updateState({ cart: [...state.cart, newItem], batataSelecionada: null });
  }
};

window.removerItem = function (index) {
  const newCart = [...state.cart];
  newCart.splice(index, 1);
  window.updateState({ cart: newCart });
};

window.updateQuantity = function (index, delta) {
  const newCart = [...state.cart];
  newCart[index].quantidade += delta;
  if (newCart[index].quantidade <= 0) {
    newCart.splice(index, 1);
  }
  window.updateState({ cart: newCart });
};

window.generateWhatsAppLink = function () {
  if (!state.nomeCliente) {
    alert("Por favor, informe o seu nome.");
    return;
  }
  if (!state.bairro) {
    alert("Por favor, selecione a opção de bairro/retirada.");
    return;
  }
  if (state.bairro !== 'retirada' && !state.endereco) {
    alert("Por favor, preencha o endereço completo com ponto de referência.");
    return;
  }

  let text = `*NOVO PEDIDO - Pizzaria Planalto* 🍕\n\n`;
  text += `*Cliente:* ${state.nomeCliente}\n\n`;
  
  text += `*Lista de Produtos:*\n`;
  state.cart.forEach(item => {
    let bordaText = item.precoBorda > 0 ? ` (Com ${item.nomeBorda})` : '';
    let recheioText = item.recheio ? ` - ${item.recheio}` : '';
    text += `-> ${item.quantidade}x ${item.nome}${bordaText}${recheioText} - R$ ${((item.preco + (item.precoBorda || 0)) * item.quantidade).toFixed(2)}\n`;
  });

  text += `\n*Subtotal:* R$ ${window.getSubtotal().toFixed(2)}\n`;
  
  const bairroInfo = TAXAS_ENTREGA.find(t => t.id === state.bairro);
  if (state.bairro === 'retirada') {
    text += `*Taxa de Entrega:* ${bairroInfo.nome} (Grátis)\n`;
  } else {
    text += `*Taxa de Entrega (${bairroInfo.nome}):* R$ ${window.getTaxaEntrega().toFixed(2)}\n`;
    text += `*Endereço para Entrega:* ${state.endereco}\n`;
  }
  text += `\n*Total:* R$ ${window.getTotal().toFixed(2)}\n`;

  const encodedText = encodeURIComponent(text);
  window.open(`https://wa.me/5585981015518?text=${encodedText}`, '_blank');
};

window.scrollToSection = function (id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

function renderMenuSection(id, title, items) {
  const itemsHtml = items.map(item => `
    <div class="card-hover bg-surface rounded-2xl overflow-hidden flex shadow-lg group">
      <div class="w-1/3 relative overflow-hidden">
        <img src="${item.image}" alt="${item.nome}" class="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
        <div class="absolute inset-0 bg-gradient-to-r from-transparent to-surface opacity-90"></div>
      </div>
      <div class="w-2/3 p-4 flex flex-col justify-between relative z-10">
        <div>
          <h3 class="font-bold text-lg text-white mb-1 leading-tight">${item.nome}</h3>
          <p class="text-gray-400 text-xs line-clamp-2 leading-relaxed mb-3">${item.desc}</p>
        </div>
        <div class="flex justify-between items-center mt-2">
          <span class="font-bold text-lg text-textLight">R$ ${item.preco.toFixed(2)}</span>
          <button onclick="window.handleAddToCart(window.menuData['${id}'].find(i => i.id === '${item.id}'))" class="bg-primary hover:bg-[#b1131a] text-white p-2 rounded-full transition shadow-md">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  return `
    <section id="${id}" class="scroll-mt-32">
      <h2 class="text-2xl font-bold text-white mb-6 pl-2 border-l-4 border-primary">${title}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${itemsHtml}
      </div>
    </section>
  `;
}

function render() {
  const root = document.getElementById('root');
  if (!root) return;
  
  let cartBadge = '';
  const totalItems = state.cart.reduce((a, c) => a + c.quantidade, 0);
  if (totalItems > 0) {
    cartBadge = `<span class="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">${totalItems}</span>`;
  }

  const menuHtml = `
    <div class="min-h-screen pb-20">
      <header class="bg-background pt-8 pb-4 px-4 sticky top-0 z-40">
        <div class="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-extrabold text-white tracking-tight">Planalto<span class="text-primary">.</span></h1>
            <p class="text-sm text-gray-400 mt-1">A melhor pizza da região</p>
          </div>
          <button onclick="window.updateState({ isCartOpen: true })" class="relative bg-surface p-3 rounded-full hover:bg-surfaceHighlight transition">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E31B23" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
            ${cartBadge}
          </button>
        </div>
      </header>

      <nav class="sticky-nav sticky top-24 z-30 px-4 py-3 border-b border-gray-800">
        <div class="max-w-4xl mx-auto flex gap-4 overflow-x-auto hide-scrollbar whitespace-nowrap text-sm font-semibold text-textLight">
          <button onclick="window.scrollToSection('pizzasSalgadas')" class="px-4 py-2 rounded-full bg-surfaceHighlight hover:bg-primary transition">Pizzas Salgadas</button>
          <button onclick="window.scrollToSection('pizzasDoces')" class="px-4 py-2 rounded-full bg-surfaceHighlight hover:bg-primary transition">Pizzas Doces</button>
          <button onclick="window.scrollToSection('pasteis')" class="px-4 py-2 rounded-full bg-surfaceHighlight hover:bg-primary transition">Pastéis</button>
          <button onclick="window.scrollToSection('outros')" class="px-4 py-2 rounded-full bg-surfaceHighlight hover:bg-primary transition">Batatas</button>
          <button onclick="window.scrollToSection('bebidas')" class="px-4 py-2 rounded-full bg-surfaceHighlight hover:bg-primary transition">Bebidas</button>
        </div>
      </nav>

      <main class="max-w-4xl mx-auto px-4 py-8 space-y-12">
        ${renderMenuSection("pizzasSalgadas", "Pizzas Salgadas", window.menuData.pizzasSalgadas)}
        ${renderMenuSection("pizzasDoces", "Pizzas Doces", window.menuData.pizzasDoces)}
        ${renderMenuSection("pasteis", "Pastéis", window.menuData.pasteis)}
        ${renderMenuSection("outros", "Batatas", window.menuData.outros)}
        ${renderMenuSection("bebidas", "Bebidas", window.menuData.bebidas)}
      </main>
    </div>
  `;

  let modalsHtml = '';

  if (state.pizzaSelecionada) {
    const bordasHtml = BORDAS.map((borda, index) => `
      <button onclick="window.adicionarAoCarrinho(state.pizzaSelecionada, BORDAS[${index}])"
        class="w-full flex justify-between items-center bg-surfaceHighlight hover:bg-primary p-4 rounded-xl transition text-left">
        <span class="font-semibold text-white">${borda.nome}</span>
        <span class="text-sm">${borda.preco > 0 ? '+ R$ ' + borda.preco.toFixed(2) : 'Grátis'}</span>
      </button>
    `).join('');

    modalsHtml += `
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4">
        <div class="bg-surface rounded-2xl w-full max-w-sm p-6 shadow-2xl">
          <h3 class="text-xl font-bold text-white mb-2">Deseja adicionar borda?</h3>
          <p class="text-gray-400 text-sm mb-6">Personalize sua ${state.pizzaSelecionada.nome}</p>
          <div class="space-y-3">
            ${bordasHtml}
          </div>
          <button onclick="window.updateState({ pizzaSelecionada: null })" class="w-full mt-4 p-4 text-gray-400 font-semibold hover:text-white transition">Cancelar</button>
        </div>
      </div>
    `;
  }

  if (state.batataSelecionada) {
    const RECHEIOS = ["Carne do Sol", "Calabresa", "Cheddar"];
    const recheiosHtml = RECHEIOS.map(recheio => `
      <button onclick="window.adicionarBatataAoCarrinho(state.batataSelecionada, '${recheio}')"
        class="w-full flex justify-between items-center bg-surfaceHighlight hover:bg-primary p-4 rounded-xl transition text-left">
        <span class="font-semibold text-white">${recheio}</span>
      </button>
    `).join('');

    modalsHtml += `
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4">
        <div class="bg-surface rounded-2xl w-full max-w-sm p-6 shadow-2xl">
          <h3 class="text-xl font-bold text-white mb-2">Escolha o Recheio</h3>
          <p class="text-gray-400 text-sm mb-6">Personalize sua ${state.batataSelecionada.nome}</p>
          <div class="space-y-3">
            ${recheiosHtml}
          </div>
          <button onclick="window.updateState({ batataSelecionada: null })" class="w-full mt-4 p-4 text-gray-400 font-semibold hover:text-white transition">Cancelar</button>
        </div>
      </div>
    `;
  }

  if (state.isCartOpen) {
    let cartItemsHtml = '';
    if (state.cart.length === 0) {
      cartItemsHtml = `<p class="text-gray-400 text-center mt-10">Seu carrinho está vazio.</p>`;
    } else {
      let itemsListHtml = state.cart.map((item, index) => `
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h4 class="font-semibold text-white">${item.nome}${item.recheio ? ' - ' + item.recheio : ''}</h4>
            ${item.precoBorda > 0 ? `<p class="text-xs text-primary">${item.nomeBorda} (+R$ 10,00)</p>` : ''}
            <span class="text-sm text-gray-400">R$ ${((item.preco + (item.precoBorda || 0)) * item.quantidade).toFixed(2)}</span>
          </div>
          <div class="flex flex-col items-end gap-2">
            <button onclick="window.removerItem(${index})" class="text-gray-400 hover:text-primary transition focus:outline-none" title="Remover item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div class="flex items-center gap-3 bg-surface rounded-full px-3 py-1 mt-1">
              <button onclick="window.updateQuantity(${index}, -1)" class="text-gray-400 hover:text-white">-</button>
              <span class="text-white text-sm font-medium">${item.quantidade}</span>
              <button onclick="window.updateQuantity(${index}, 1)" class="text-primary hover:text-white">+</button>
            </div>
          </div>
        </div>
      `).join('');

      const selectOptions = TAXAS_ENTREGA.map(t => 
        `<option value="${t.id}" ${state.bairro === t.id ? 'selected' : ''}>${t.nome} ${t.valor > 0 ? '(Taxa: + R$ ' + t.valor.toFixed(2) + ')' : '(Grátis)'}</option>`
      ).join('');

      cartItemsHtml = `
        <div class="space-y-6">
          ${itemsListHtml}
          <div class="pt-6 border-t border-gray-800 space-y-4">
            <div class="flex justify-between text-gray-300">
              <span>Subtotal</span>
              <span>R$ ${window.getSubtotal().toFixed(2)}</span>
            </div>

            <div>
              <label class="block text-sm font-semibold text-white mb-2">Nome do Cliente *</label>
              <input type="text" id="nomeClienteInput" value="${state.nomeCliente}" onchange="state.nomeCliente = this.value" placeholder="Seu nome" class="w-full bg-surface border border-gray-700 rounded-xl p-3 text-white focus:border-primary outline-none" />
            </div>

            <div>
              <label class="block text-sm font-semibold text-white mb-2">Bairro de Entrega / Retirada *</label>
              <select id="bairroSelect" onchange="window.updateState({ bairro: this.value })" class="w-full bg-surface border border-gray-700 rounded-xl p-3 text-white focus:border-primary outline-none">
                <option value="" disabled ${!state.bairro ? 'selected' : ''}>Selecione a opção</option>
                ${selectOptions}
              </select>
            </div>

            ${state.bairro !== 'retirada' ? `
              <div>
                <label class="block text-sm font-semibold text-white mb-2">Endereço Completo + Referência *</label>
                <textarea id="enderecoInput" onchange="state.endereco = this.value" placeholder="Ex: Rua A, 123. Portão preto." class="w-full bg-surface border border-gray-700 rounded-xl p-3 text-white focus:border-primary outline-none resize-none h-24">${state.endereco}</textarea>
              </div>
            ` : ''}

            <div class="flex justify-between text-xl font-bold text-white pt-4 border-t border-gray-800">
              <span>Total Geral</span>
              <span class="text-primary">R$ ${window.getTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
      `;
    }

    let checkoutBtn = '';
    if (state.cart.length > 0) {
      checkoutBtn = `
        <div class="p-6 border-t border-gray-800">
          <button onclick="window.generateWhatsAppLink()" class="w-full bg-primary hover:bg-[#b1131a] text-white font-bold py-4 rounded-xl shadow-lg transition transform hover:scale-[1.02]">
            Finalizar no WhatsApp
          </button>
        </div>
      `;
    }

    modalsHtml += `
      <div id="cartModalOverlay" class="fixed inset-0 z-50 bg-black bg-opacity-80 flex justify-end" onclick="if(event.target.id === 'cartModalOverlay') window.updateState({ isCartOpen: false });">
        <div class="bg-background w-full max-w-md h-full flex flex-col shadow-2xl border-l border-gray-800">
          <div class="p-6 border-b border-gray-800 flex justify-between items-center">
            <h2 class="text-2xl font-bold text-white">Seu Pedido</h2>
            <button onclick="window.updateState({ isCartOpen: false })" class="text-gray-400 hover:text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div class="flex-1 overflow-y-auto p-6">
            ${cartItemsHtml}
          </div>
          ${checkoutBtn}
        </div>
      </div>
    `;
  }

  root.innerHTML = menuHtml + modalsHtml;

  // re-attach input handlers to preserve state on keystrokes immediately without full re-render
  const inputNome = document.getElementById('nomeClienteInput');
  if (inputNome) {
    inputNome.oninput = (e) => { state.nomeCliente = e.target.value; };
  }
  const inputEnder = document.getElementById('enderecoInput');
  if (inputEnder) {
    inputEnder.oninput = (e) => { state.endereco = e.target.value; };
  }
}

// Initial render
try {
  render();
} catch(e) {
  document.getElementById('root').innerHTML = '<div style="color:red; background:white; padding:20px; font-family:sans-serif; z-index:99999; position:relative">' + e.stack + '</div>';
  console.error(e);
}

