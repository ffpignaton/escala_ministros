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

    // Salvar o ministro no Firestore
    db.collection("ministros").add({
        nome: nome,
        fone: fone,
        endereco: endereco
    }).then(() => {
        // Limpar os campos após salvar
        document.getElementById("nome").value = "";
        document.getElementById("fone").value = "";
        document.getElementById("endereco").value = "";
        
        // Carregar os ministros atualizados
        carregarMinistros();
        alert("Ministro salvo!");
    }).catch(err => {
        console.error("Erro ao salvar ministro: ", err);
        alert("Erro ao salvar ministro.");
    });
};

function carregarMinistros() {
    let lista = document.getElementById("listaMinistros");
    lista.innerHTML = ""; // Limpar lista antes de adicionar os novos ministros

    // Carregar ministros do Firestore
    db.collection("ministros").get().then(snapshot => {
        snapshot.forEach(doc => {
            let m = doc.data();
            lista.innerHTML += `
            <tr data-id="${doc.id}">
                <td style="padding: 8px; border: 1px solid #ddd;">${m.nome}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${m.fone || ""}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${m.endereco || ""}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">
                    <button onclick="gerenciarMinistro('${doc.id}')">Editar/Excluir</button>
                </td>
            </tr>
            `;
        });
    }).catch(err => {
        console.error("Erro ao carregar ministros: ", err);
    });
}

/* =========================================
ESCALAS
========================================= */
function carregarMinistrosEscala() {
    let box = document.getElementById("seletorMinistros");
    box.innerHTML = ""; // Limpar os ministros da escala
    ministrosSelecionados = []; // Limpar ministros selecionados

    // Carregar ministros do Firestore
    db.collection("ministros").get().then(snapshot => {
        snapshot.forEach(doc => {
            let nome = doc.data().nome;
            box.innerHTML += `
            <div class="tag" onclick="toggleMinistro(this,'${nome}')">${nome}</div>
            `;
        });
    }).catch(err => {
        console.error("Erro ao carregar ministros para a escala: ", err);
    });
}

window.toggleMinistro = function(el, nome) {
    if (ministrosSelecionados.includes(nome)) {
        ministrosSelecionados = ministrosSelecionados.filter(x => x !== nome); // Remover ministro da seleção
        el.classList.remove("active"); // Remover estilo de ativo
    } else {
        ministrosSelecionados.push(nome); // Adicionar ministro à seleção
        el.classList.add("active"); // Adicionar estilo de ativo
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

    // Salvar a escala no Firestore
    db.collection("escalas").add({
        data: data,
        hora: hora,
        ministros: ministrosSelecionados
    }).then(() => {
        listarEscalas();
        atualizarCalendario();
        alert("Escala salva!");
    }).catch(err => {
        console.error("Erro ao salvar escala: ", err);
        alert("Erro ao salvar escala.");
    });
};

function listarEscalas() {
    let lista = document.getElementById("listaEscalas");
    lista.innerHTML = ""; // Limpar antes de adicionar novas escalas

    // Carregar as escalas do Firestore
    db.collection("escalas").orderBy("data").get().then(snapshot => {
        snapshot.forEach(doc => {
            let e = doc.data();
            lista.innerHTML += `
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">${formatarDataCompleta(e.data)}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${e.hora}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${e.ministros.join(", ")}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">
                    <button onclick="gerenciarEscala('${doc.id}')">Editar/Excluir</button>
                </td>
            </tr>
            `;
        });
    }).catch(err => {
        console.error("Erro ao listar escalas: ", err);
    });
}

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

window.onload = function() {
    abrirTela("dashboard");
};
