/* =========================================
VARIÁVEIS GLOBAIS
========================================= */
let ministrosSelecionados = [];
let ministrosEdicao = [];
let escalaEditandoId = null;

/* =========================================
ABRIR TELAS
========================================= */
window.abrirTela = function(id) {
  document.querySelectorAll(".tela").forEach(sec => {
    sec.classList.add("hidden");
  });

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
    document.getElementById("nome").value = "";
    document.getElementById("fone").value = "";
    document.getElementById("endereco").value = "";
    carregarMinistros();
    alert("Ministro salvo!");
  }).catch(err => {
    console.error("Erro ao salvar ministro: ", err);
    alert("Erro ao salvar ministro.");
  });
};

function carregarMinistros() {
  let lista = document.getElementById("listaMinistros");
  lista.innerHTML = ""; 

  db.collection("ministros").get().then(snapshot => {
    snapshot.forEach(doc => {
      let m = doc.data();
      lista.innerHTML += `
        <tr data-id="${doc.id}">
          <td>${m.nome}</td>
          <td>${m.fone || ""}</td>
          <td>${m.endereco || ""}</td>
          <td>
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
  box.innerHTML = ""; 

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
  }).catch(err => {
    console.error("Erro ao salvar escala: ", err);
    alert("Erro ao salvar escala.");
  });
};

function listarEscalas() {
  let lista = document.getElementById("listaEscalas");
  lista.innerHTML = "";

  db.collection("escalas").get().then(snapshot => {
    snapshot.forEach(doc => {
      let e = doc.data();
      lista.innerHTML += `
        <tr>
          <td>${formatarDataCompleta(e.data)}</td>
          <td>${e.hora}</td>
          <td>${e.ministros.join(", ")}</td>
          <td>
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

window.onload = function() {
  abrirTela("ministros");
};
