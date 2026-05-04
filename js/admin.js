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
window.abrirTela = function(id) {
    // Esconde todas as telas
    document.querySelectorAll(".tela").forEach(sec => {
        sec.classList.add("hidden");
    });

    // Exibe a tela específica
    let targetScreen = document.getElementById(id);
    if (targetScreen) {
        targetScreen.classList.remove("hidden");
    }

    if(id === "ministros") {
        carregarMinistros();
    }

    if(id === "escalas") {
        carregarEscalas();
        carregarMinistrosEscala();
        listarEscalas();
        iniciarCalendario();
    }

    if(id === "relatorios") {
        // Lógica do relatório
    }
};

/* =========================================
ESCALAS
========================================= */

function carregarEscalas() {
    let lista = document.getElementById("listaEscalas");
    lista.innerHTML = "";

    db.collection("escalas").get().then(snapshot => {
        snapshot.forEach(doc => {
            let e = doc.data();

            lista.innerHTML += `
            <tr data-id="${doc.id}" onclick="gerenciarEscala('${doc.id}')">
                <td style="padding: 8px; border: 1px solid #ddd;">${formatarDataCompleta(e.data)}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${e.hora}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${e.ministros.join(", ")}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">
                    <button onclick="gerenciarEscala('${doc.id}')">Editar/Excluir</button>
                </td>
            </tr>
            `;
        });
    });
}

window.gerenciarEscala = function(id) {
    let acao = prompt("Deseja editar ou excluir esta escala? (Digite 'editar' ou 'excluir')").toLowerCase();

    if (acao === 'excluir') {
        if (confirm("Você tem certeza que deseja excluir esta escala?")) {
            db.collection("escalas").doc(id).delete()
                .then(() => {
                    carregarEscalas();
                    alert("Escala excluída com sucesso!");
                })
                .catch(err => {
                    console.error("Erro ao deletar escala: ", err);
                    alert("Ocorreu um erro ao tentar excluir a escala.");
                });
        }
    } else if (acao === 'editar') {
        let data = prompt("Digite a nova data da escala:");
        let hora = prompt("Digite a nova hora da escala:");
        let ministros = prompt("Digite os ministros (separados por vírgula):");

        if (data && hora && ministros) {
            db.collection("escalas").doc(id).update({
                data: data,
                hora: hora,
                ministros: ministros.split(',').map(nome => nome.trim())
            }).then(() => {
                carregarEscalas();
                alert("Escala editada com sucesso!");
            }).catch(err => {
                console.error("Erro ao editar escala: ", err);
                alert("Ocorreu um erro ao tentar editar a escala.");
            });
        } else {
            alert("Por favor, preencha todos os campos.");
        }
    } else {
        alert("Ação inválida! Digite 'editar' ou 'excluir'.");
    }
}

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
                <button onclick="gerenciarEscala('${doc.id}')">Editar/Excluir</button>
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
