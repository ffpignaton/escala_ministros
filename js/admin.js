alert("BEM VINDO AO PAINEL ADMINISTRATIVO");

/* =========================================
VARIÁVEIS GLOBAIS
========================================= */
let ministrosSelecionados = [];

/* =========================================
ABRIR TELAS
========================================= */
window.abrirTela = function(id) {
    // Esconde todas as telas
    document.querySelectorAll(".tela").forEach(sec => {
        sec.classList.add("hidden");
    });

    // Exibe a tela específica
    document.getElementById(id).classList.remove("hidden");

    if (id === "ministros") {
        carregarMinistros();
    }
};

/* =========================================
MINISTROS
========================================= */
window.salvarMinistro = function() {
    let nome = document.getElementById("nome").value.trim();
    let fone = document.getElementById("fone").value.trim();
    let endereco = document.getElementById("endereco").value.trim();

    if (!nome) {
        alert("Digite o nome.");
        return;
    }

    db.collection("ministros").add({
        nome: nome,
        fone: fone,
        endereco: endereco
    }).then(() => {
        document.getElementById("nome").value = "";
        document.getElementById("fone").value = "";
        document.getElementById("endereco").value = "";
        carregarMinistros();
        alert("Ministro salvo!");
    });
};

function carregarMinistros() {
    let lista = document.getElementById("listaMinistros");
    lista.innerHTML = "";

    db.collection("ministros").get().then(snapshot => {
        snapshot.forEach(doc => {
            let m = doc.data();

            lista.innerHTML += `
            <tr onclick="toggleSelecaoLinha(this)" data-id="${doc.id}">
                <td style="padding: 8px; border: 1px solid #ddd;">${m.nome}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${m.fone || ""}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${m.endereco || ""}</td>
            </tr>
            `;
        });
    });
}

function toggleSelecaoLinha(linha) {
    // Alterna a seleção da linha
    linha.classList.toggle('selecionada');
    const id = linha.getAttribute('data-id');

    // Se a linha for selecionada, adiciona ao array de ministros
    if (linha.classList.contains('selecionada')) {
        ministrosSelecionados.push(id);
    } else {
        ministrosSelecionados = ministrosSelecionados.filter(item => item !== id);
    }
}

window.deletarMinistrosSelecionados = function() {
    if (ministrosSelecionados.length === 0) {
        alert("Selecione pelo menos um ministro para deletar.");
        return;
    }

    ministrosSelecionados.forEach(id => {
        db.collection("ministros").doc(id).delete()
            .then(() => {
                carregarMinistros();
                alert("Ministro(s) deletado(s) com sucesso!");
            })
            .catch(err => {
                console.error("Erro ao deletar ministro: ", err);
                alert("Ocorreu um erro ao tentar deletar o ministro.");
            });
    });

    ministrosSelecionados = [];
};

/* =========================================
UTIL
========================================= */
function mascaraTelefone(input) {
    let valor = input.value.replace(/\D/g, "");
    if (valor.length <= 10) {
        input.value = valor.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else {
        input.value = valor.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
}
