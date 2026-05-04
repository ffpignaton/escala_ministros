alert("BEM VINDO AO PAINEL ADMINISTRATIVO");

/* =========================================
VARIÁVEIS GLOBAIS
========================================= */
let ministrosSelecionados = [];
let ministrosEdicao = [];
let escalaEditandoId = null;
let calendarAdmin = null;

/* =========================================
ABRIR TELAS
========================================= */
window.abrirTela = function(id){
    document.querySelectorAll(".tela").forEach(sec => {
        sec.classList.add("hidden");
    });

    document.getElementById(id).classList.remove("hidden");

    if(id === "ministros") {
        carregarMinistros();
    }

    if(id === "escalas") {
        carregarMinistrosEscala();
        listarEscalas();
    }

    if(id === "relatorios") {
        // Lógica do relatório
    }
};

/* =========================================
MINISTROS
========================================= */
window.salvarMinistro = function(){
    let nome = document.getElementById("nome").value.trim();
    let fone = document.getElementById("fone").value.trim();
    let endereco = document.getElementById("endereco").value.trim();

    if(!nome){
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
            <tr onclick="marcarLinha(this)" data-id="${doc.id}">
                <td style="padding: 8px; border: 1px solid #ddd;">${m.nome}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${m.fone || ""}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${m.endereco || ""}</td>
            </tr>
            `;
        });
    });
}

window.deletarMinistrosSelecionados = function() {
    const linhasSelecionadas = document.querySelectorAll('.selecionada');
    
    if (linhasSelecionadas.length === 0) {
        alert("Selecione pelo menos um ministro para deletar.");
        return;
    }

    linhasSelecionadas.forEach(linha => {
        const id = linha.getAttribute('data-id');
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
};

/* =========================================
ESCALAS
========================================= */
function listarEscalas() {
    let lista = document.getElementById("listaEscalas");
    lista.innerHTML = "";

    db.collection("escalas").orderBy("data").get()
    .then(snapshot => {
        snapshot.forEach(doc => {
            let e = doc.data();

            lista.innerHTML += `
            <tr onclick="marcarLinha(this)" data-id="${doc.id}">
                <td style="padding: 8px; border: 1px solid #ddd;">${formatarDataCompleta(e.data)}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${e.hora}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${e.ministros.join(", ")}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${e.observacoes || ""}</td>
            </tr>
            `;
        });
    });
}

window.deletarEscalasSelecionadas = function() {
    const linhasSelecionadas = document.querySelectorAll('.selecionada');
    
    if (linhasSelecionadas.length === 0) {
        alert("Selecione pelo menos uma escala para deletar.");
        return;
    }

    linhasSelecionadas.forEach(linha => {
        const id = linha.getAttribute('data-id');
        db.collection("escalas").doc(id).delete()
            .then(() => {
                listarEscalas();
                alert("Escala(s) deletada(s) com sucesso!");
            })
            .catch(err => {
                console.error("Erro ao deletar escala: ", err);
                alert("Ocorreu um erro ao tentar deletar a escala.");
            });
    });
};

/* =========================================
UTIL
========================================= */
function formatarDataCompleta(dataISO) {
    const data = new Date(dataISO + "T00:00:00");
    return data.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    }).replace(/^./, c => c.toUpperCase());
}

window.onload = function() {
    abrirTela("dashboard");
};
