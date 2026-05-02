alert("ADMIN JS MASTER FINAL COM RELATÓRIO PDF");

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

    db.collection("ministros").doc(id).update({
        nome: novoNome,
        fone: novoFone
    }).then(() => {
        carregarMinistros();
    });
};

window.deletarMinistro = function(id) {
    if (!confirm("Excluir ministro?")) return;

    db.collection("ministros").doc(id).delete()
    .then(carregarMinistros);
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
                    <div class="botoes-linha">
                        <button class="btn-edit" onclick="editarEscala('${doc.id}','${e.data}','${e.hora}')">Editar</button>
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
        atualizarCalendario();
    });
};

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
PDF COM LOGO
========================================= */
window.gerarPDF = function() {
    db.collection("escalas").orderBy("data").get()
    .then(snapshot => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        let y = 40;

        /* Carregar logo */
        let img = new Image();
        img.src = "logo.png";

        img.onload = function() {
            doc.addImage(img, "PNG", 10, 10, 18, 18);
            doc.setFontSize(18);
            doc.text("Paróquia Santíssima Trindade", 35, 16); // Alinha título à direita do logo
            y = 60;

            let agrupado = {};

            snapshot.forEach(item => {
                let e = item.data();
                if (!agrupado[e.data]) {
                    agrupado[e.data] = [];
                }

                agrupado[e.data].push(e);
            });

            // Exibe cada data e suas escalas
            for (let data in agrupado) {
                doc.setFontSize(12);
                doc.setFont(undefined, "bold");
                doc.text(formatarDataCompleta(data), 10, y);
                y += 8;

                doc.setFont(undefined, "normal");

                agrupado[data].forEach(item => {
                    doc.text(
                        item.hora + "h - Ministros: " + item.ministros.join(", "),
                        10,
                        y
                    );
                    y += 10;
                });

                y += 10;

                if (y > 275) {
                    doc.addPage();
                    y = 20;
                }
            }

            doc.save("escala-ministros.pdf");
        };
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

/* =========================================
INÍCIO
========================================= */
window.onload = function() {
    abrirTela("dashboard");
};
