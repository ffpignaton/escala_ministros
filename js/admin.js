alert("BEM VINDO AO PAINEL ADMINISTRATIVO");

/* =========================================
VARIÁVEIS GLOBAIS
========================================= */
let ministrosSelecionados = [];
let escalaEditandoId = null;

/* =========================================
ABRIR TELAS
========================================= */
window.abrirTela = function(id){
    // Esconde todas as telas
    document.querySelectorAll(".tela").forEach(sec => {
        sec.classList.add("hidden");
    });

    // Exibe a tela específica
    document.getElementById(id).classList.remove("hidden");

    if(id === "ministros") {
        carregarMinistros();
    }

    if(id === "escalas") {
        carregarMinistrosEscala();
        listarEscalas();
    }
};

/* =========================================
MINISTROS
========================================= */
window.salvarMinistro = function(){
    let nome = document.getElementById("nome").value.trim();
    let fone = document.getElementById("fone").value.trim();

    if(!nome){
        alert("Digite o nome.");
        return;
    }

    db.collection("ministros").add({
        nome: nome,
        fone: fone
    }).then(() => {
        document.getElementById("nome").value = "";
        document.getElementById("fone").value = "";
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
            <div class="card" style="padding:12px;margin-bottom:10px">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
                    <div>
                        <strong>${m.nome}</strong> - ${m.fone || ""}
                    </div>
                    <div class="botoes-linha">
                        <button class="btn-edit" onclick="editarMinistro('${doc.id}','${m.nome}','${m.fone || ""}')">Editar</button>
                        <button class="btn-delete" onclick="deletarMinistro('${doc.id}')">Excluir</button>
                    </div>
                </div>
            </div>
            `;
        });
    });
}

window.editarMinistro = function(id, nomeAtual, foneAtual) {
    let novoNome = prompt("Nome:", nomeAtual);
    if (!novoNome) return;

    let novoFone = prompt("Telefone:", foneAtual);
    if (novoFone) {
        novoFone = formatarTelefone(novoFone);
    }

    db.collection("ministros").doc(id).update({
        nome: novoNome,
        fone: novoFone
    }).then(() => {
        carregarMinistros();
    });
};

function formatarTelefone(telefone) {
    telefone = telefone.replace(/\D/g, "");
    if (telefone.length <= 10) {
        telefone = telefone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (telefone.length <= 11) {
        telefone = telefone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    return telefone;
}

/* =========================================
ESCALAS
========================================= */
function carregarMinistrosEscala() {
    let box = document.getElementById("seletorMinistros");
    box.innerHTML = "";
    ministrosSelecionados = [];

    db.collection("ministros").get().then(snapshot => {
        snapshot.forEach(doc => {
            let nome = doc.data().nome;
            box.innerHTML += `
            <div class="tag" onclick="toggleMinistro(this,'${nome}')">${nome}</div>
            `;
        });
    });
}

window.toggleMinistro = function(el, nome) {
    if (ministrosSelecionados.includes(nome)) {
        ministrosSelecionados = ministrosSelecionados.filter(x => x !== nome);
        el.classList.remove("active");
    } else {
        ministrosSelecionados.push(nome);
        el.classList.add("active");
    }
};

window.salvarEscala = function() {
    let data = document.getElementById("dataEscala").value;
    let hora = document.getElementById("horaEscala").value;

    if (!data || !hora) {
        alert("Preencha data e hora.");
        return;
    }

    if (ministrosSelecionados.length === 0) {
        alert("Selecione ministros.");
        return;
    }

    db.collection("escalas").add({
        data: data,
        hora: hora,
        ministros: ministrosSelecionados
    }).then(() => {
        listarEscalas();
        alert("Escala salva!");
    });
};

function listarEscalas() {
    let lista = document.getElementById("listaEscalasCards");
    lista.innerHTML = "";

    db.collection("escalas").orderBy("data").get()
    .then(snapshot => {
        snapshot.forEach(doc => {
            let e = doc.data();

            lista.innerHTML += `
            <div class="card" style="padding:14px;margin-bottom:10px">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
                    <div>
                        <strong>${formatarDataCompleta(e.data)}</strong> - ${e.hora}
                    </div>
                    <div class="botoes-linha">
                        <button class="btn-edit" onclick="editarEscala('${doc.id}','${e.data}','${e.hora}',${JSON.stringify(e.ministros)})">Editar</button>
                        <button class="btn-delete" onclick="deletarEscala('${doc.id}')">Excluir</button>
                    </div>
                </div>
                <div style="margin-top:10px;color:#555">${e.ministros.join(", ")}</div>
            </div>
            `;
        });
    });
}

window.deletarEscala = function(id) {
    if (!confirm("Excluir escala?")) return;

    db.collection("escalas").doc(id).delete().then(() => {
        listarEscalas();
    });
};

/* =========================================
EDITAR ESCALA
========================================= */
window.editarEscala = function(id, dataAtual, horaAtual, ministrosSelecionados) {
    document.getElementById("modalEditar").style.display = "flex";
    document.getElementById("editData").value = dataAtual;
    document.getElementById("editHora").value = horaAtual;

    carregarMinistrosParaEditar(ministrosSelecionados);
    escalaEditandoId = id;
};

function carregarMinistrosParaEditar(ministrosSelecionados) {
    let box = document.getElementById("editMinistros");
    box.innerHTML = "";

    db.collection("ministros").get().then(snapshot => {
        snapshot.forEach(doc => {
            let nome = doc.data().nome;
            let isSelected = ministrosSelecionados.includes(nome) ? "active" : "";

            box.innerHTML += `
                <div class="tag ${isSelected}" onclick="toggleMinistroEditar(this, '${nome}')">${nome}</div>
            `;
        });
    });
}

window.toggleMinistroEditar = function(el, nome) {
    el.classList.toggle("active");
};

window.salvarEdicao = function() {
    let data = document.getElementById("editData").value;
    let hora = document.getElementById("editHora").value;

    if (!data || !hora) {
        alert("Preencha data e hora.");
        return;
    }

    let ministros = [];
    document.querySelectorAll("#editMinistros .active").forEach(tag => {
        ministros.push(tag.textContent);
    });

    if (ministros.length === 0) {
        alert("Selecione ministros.");
        return;
    }

    db.collection("escalas").doc(escalaEditandoId).update({
        data: data,
        hora: hora,
        ministros: ministros
    }).then(() => {
        listarEscalas();
        fecharModal();
    });
};

window.fecharModal = function() {
    document.getElementById("modalEditar").style.display = "none";
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

/* =========================================
INÍCIO
========================================= */
window.onload = function() {
    abrirTela("dashboard");
};
