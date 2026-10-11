
const produtos = [...document.querySelectorAll(".produto")];
const categorias = [...document.querySelectorAll(".categoria")];

const busca = document.querySelector("#busca");
const grade = document.querySelector("#grade-produtos");
const listaCarrinho = document.querySelector("#itens-carrinho");

const formatar = valor =>
    valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

const carrinho = new Map();

let categoriaAtual = "Todos";

function filtrarProdutos() {
    const termo = busca.value.trim().toLocaleLowerCase("pt-BR");
    let encontrados = 0;

    produtos.forEach(produto => {
        const nome = produto.dataset.nome.toLocaleLowerCase("pt-BR");
        const categoria = produto.dataset.categoria;

        const combinaNome = nome.includes(termo);
        const combinaCategoria =
            categoriaAtual === "Todos" ||
            categoria === categoriaAtual;

        const mostrar = combinaNome && combinaCategoria;

        produto.hidden = !mostrar;

        if (mostrar) encontrados++;
    });

    document.querySelector("#resultado").textContent =
        `${encontrados} ${encontrados === 1 ? "produto" : "produtos"}`;

    document.querySelector("#sem-resultados").hidden =
        encontrados !== 0;
}

function atualizarContagens() {
    document.querySelectorAll("[data-contagem]").forEach(elemento => {
        const categoria = elemento.dataset.contagem;

        const quantidade = produtos.filter(produto => {
            return categoria === "Todos" ||
                produto.dataset.categoria === categoria;
        }).length;

        elemento.textContent = quantidade;
    });
}

function adicionarProduto(produto) {
    const nome = produto.dataset.nome;
    const preco = Number(produto.dataset.preco);

    if (!Number.isFinite(preco) || preco < 0) return;

    const item = carrinho.get(nome);

    if (item) {
        item.quantidade++;
    } else {
        carrinho.set(nome, {
            nome,
            preco,
            quantidade: 1
        });
    }

    document.querySelector("#aviso-carrinho").textContent =
        `${nome} adicionado ao carrinho.`;

    atualizarCarrinho();
}

function alterarQuantidade(nome, variacao) {
    const item = carrinho.get(nome);

    if (!item) return;

    item.quantidade += variacao;

    if (item.quantidade <= 0) {
        carrinho.delete(nome);
    }

    atualizarCarrinho();
}

function criarBotao(texto, classe, rotulo, acao) {
    const botao = document.createElement("button");

    botao.type = "button";
    botao.textContent = texto;
    botao.className = classe;
    botao.setAttribute("aria-label", rotulo);
    botao.addEventListener("click", acao);

    return botao;
}

function atualizarCarrinho() {
    listaCarrinho.replaceChildren();

    let total = 0;
    let quantidadeTotal = 0;

    if (carrinho.size === 0) {
        const vazio = document.createElement("p");
        vazio.className = "carrinho-vazio";
        vazio.textContent =
            "Seu carrinho está vazio. Que tal escolher algo fresquinho?";

        listaCarrinho.append(vazio);
    }

    carrinho.forEach(item => {
        const subtotal = item.preco * item.quantidade;

        total += subtotal;
        quantidadeTotal += item.quantidade;

        const artigo = document.createElement("article");
        artigo.className = "item-carrinho";

        const titulo = document.createElement("h3");
        titulo.textContent = item.nome;

        const preco = document.createElement("p");
        preco.className = "preco-unitario";
        preco.textContent = `${formatar(item.preco)} por unidade`;

        const controles = document.createElement("div");
        controles.className = "controles-item";

        const diminuir = criarBotao(
            "−",
            "",
            `Diminuir quantidade de ${item.nome}`,
            () => alterarQuantidade(item.nome, -1)
        );

        const quantidade = document.createElement("span");
        quantidade.textContent = item.quantidade;
        quantidade.setAttribute("aria-label", "Quantidade");

        const aumentar = criarBotao(
            "+",
            "",
            `Aumentar quantidade de ${item.nome}`,
            () => alterarQuantidade(item.nome, 1)
        );

        const remover = criarBotao(
            "×",
            "remover",
            `Remover ${item.nome}`,
            () => {
                carrinho.delete(item.nome);
                atualizarCarrinho();
            }
        );

        const subtotalElemento = document.createElement("p");
        subtotalElemento.className = "subtotal-item";
        subtotalElemento.textContent = formatar(subtotal);

        controles.append(diminuir, quantidade, aumentar, remover);
        artigo.append(titulo, preco, controles, subtotalElemento);
        listaCarrinho.append(artigo);
    });

    document.querySelector("#subtotal").textContent = formatar(total);
    document.querySelector("#total").textContent = formatar(total);

    document.querySelector("#quantidade-total").textContent =
        quantidadeTotal;

    document.querySelector("#contador-carrinho").textContent =
        quantidadeTotal;

    document.querySelector("#finalizar").disabled =
        carrinho.size === 0;
}

categorias.forEach(botao => {
    botao.addEventListener("click", () => {
        categoriaAtual = botao.dataset.categoria;

        categorias.forEach(categoria => {
            const selecionada = categoria === botao;

            categoria.classList.toggle("ativa", selecionada);
            categoria.setAttribute("aria-pressed", String(selecionada));
        });

        filtrarProdutos();
    });
});

document.querySelector("#form-busca").addEventListener("submit", evento => {
    evento.preventDefault();
    filtrarProdutos();
});

busca.addEventListener("input", filtrarProdutos);

grade.addEventListener("click", evento => {
    const botao = evento.target.closest(".adicionar");

    if (!botao) return;

    const produto = botao.closest(".produto");

    if (produto) adicionarProduto(produto);
});

document.querySelectorAll("[data-link-categoria]").forEach(link => {
    link.addEventListener("click", () => {
        const categoria = link.dataset.linkCategoria;

        const botao = categorias.find(item =>
            item.dataset.categoria === categoria
        );

        if (botao) botao.click();
    });
});

document.querySelector("#finalizar").addEventListener("click", () => {
    if (carrinho.size === 0) return;

    const pedido = [...carrinho.values()]
        .map(item =>
            `${item.quantidade}x ${item.nome} — ${
                formatar(item.preco * item.quantidade)
            }`
        )
        .join("\n");

    const total = [...carrinho.values()].reduce(
        (soma, item) => soma + item.preco * item.quantidade,
        0
    );

    alert(
        `RESUMO DO PEDIDO\n\n${pedido}\n\nTotal: ${formatar(total)}\n\n` +
        "Este é um pedido demonstrativo. Nenhum pagamento foi realizado."
    );
});

atualizarContagens();
filtrarProdutos();
atualizarCarrinho();
