alert("BEM VINDO AO PAINEL");

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
        iniciarCalendario();
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
            <tr data-id="${doc.id}" onclick="gerenciarMinistro('${doc.id}')">
                <td style="padding: 8px; border: 1px solid #ddd;">${m.nome}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${m.fone || ""}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${m.endereco || ""}</td>
            </tr>
            `;
        });
    });
}

window.gerenciarMinistro = function(id) {
    let acao = prompt("Deseja editar ou excluir este ministro? (Digite 'editar' ou 'excluir')").toLowerCase();

    if (acao === 'excluir') {
        if (confirm("Você tem certeza que deseja excluir este ministro?")) {
            db.collection("ministros").doc(id).delete()
                .then(() => {
                    carregarMinistros();
                    alert("Ministro excluído com sucesso!");
                })
                .catch(err => {
                    console.error("Erro ao deletar ministro: ", err);
                    alert("Ocorreu um erro ao tentar deletar o ministro.");
                });
        }
    } else if (acao === 'editar') {
        let novoNome = prompt("Novo Nome:");
        let novoFone = prompt("Novo Telefone:");
        let novoEndereco = prompt("Novo Endereço:");

        if (novoNome && novoFone && novoEndereco) {
            db.collection("ministros").doc(id).update({
                nome: novoNome,
                fone: novoFone,
                endereco: novoEndereco
            }).then(() => {
                carregarMinistros();
                alert("Ministro editado com sucesso!");
            }).catch(err => {
                console.error("Erro ao editar ministro: ", err);
                alert("Ocorreu um erro ao tentar editar o ministro.");
            });
        } else {
            alert("Por favor, preencha todos os campos.");
        }
    } else {
        alert("Ação inválida! Digite 'editar' ou 'excluir'.");
    }
};

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
        atualizarCalendario();
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
                </div>
                <div style="margin-top:10px;color:#555">${e.ministros.join(", ")}</div>
            </div>
            `;
        });
    });
}

/* =========================================
CALENDÁRIO
========================================= */
function iniciarCalendario() {
    if (calendarAdmin) {
        atualizarCalendario();
        return;
    }

    calendarAdmin = new FullCalendar.Calendar(
        document.getElementById("calendarAdmin"), {
        initialView: "dayGridMonth",
        locale: "pt-br",
        height: "auto",
        contentHeight: "auto",
        headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: ""
        },
        buttonText: {
            today: "Hoje"
        },
        eventDisplay: "list-item",
        eventClick: function(info) {
            alert(
                "Data: " + formatarDataCompleta(info.event.startStr) +
                "\nHora: " + info.event.title +
                "\nMinistros: " +
                (info.event.extendedProps.ministros || []).join(", ")
            );
        },
        datesSet: function() {
            setTimeout(ajustarTituloCalendario, 100);
        }
    });

    calendarAdmin.render();
    ajustarTituloCalendario();
    atualizarCalendario();
}

function atualizarCalendario() {
    if (!calendarAdmin) return;

    calendarAdmin.removeAllEvents();

    db.collection("escalas").get().then(snapshot => {
        snapshot.forEach(doc => {
            let e = doc.data();

            calendarAdmin.addEvent({
                title: e.hora,
                start: e.data,
                ministros: e.ministros
            });
        });
    });
}

function ajustarTituloCalendario() {
    let t = document.querySelector(".fc-toolbar-title");
    if (!t) return;

    t.innerText =
        t.innerText.charAt(0).toUpperCase() +
        t.innerText.slice(1);
}

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
