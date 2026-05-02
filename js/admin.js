alert("ADMIN JS NOVO CARREGOU");

document.addEventListener("DOMContentLoaded", function(){

/* ===================================
VARIÁVEIS
=================================== */
let ministrosSelecionados = [];
let calendarAdmin = null;

/* ===================================
FUNÇÃO ABRIR TELA
=================================== */
window.abrirTela = function(id){

document.querySelectorAll(".tela").forEach(sec=>{
sec.style.display = "none";
});

const tela = document.getElementById(id);

if(tela){
tela.style.display = "block";
}

/* carregar dados */
if(id==="ministros"){
carregarMinistros();
}

if(id==="escalas"){
carregarSeletorMinistros();
listarEscalas();
iniciarCalendarioAdmin();
}

};

/* ===================================
SALVAR MINISTRO
=================================== */
window.salvarMinistro = function(){

let nome = document.getElementById("nome").value.trim();
let fone = document.getElementById("fone").value.trim();

if(!nome){
alert("Digite o nome");
return;
}

db.collection("ministros").add({
nome:nome,
fone:fone
}).then(()=>{

document.getElementById("nome").value="";
document.getElementById("fone").value="";

carregarMinistros();

});

};

/* ===================================
CARREGAR MINISTROS
=================================== */
function carregarMinistros(){

const lista = document.getElementById("listaMinistros");
if(!lista) return;

lista.innerHTML = "";

db.collection("ministros").get().then(snapshot=>{

snapshot.forEach(doc=>{

let m = doc.data();

lista.innerHTML += `
<div class="card">
<strong>${m.nome}</strong><br>
${m.fone || ""}
</div>
`;

});

});

}

/* ===================================
SELETOR MINISTROS
=================================== */
function carregarSeletorMinistros(){

const box = document.getElementById("seletorMinistros");
if(!box) return;

box.innerHTML = "";
ministrosSelecionados = [];

db.collection("ministros").get().then(snapshot=>{

snapshot.forEach(doc=>{

let nome = doc.data().nome;

box.innerHTML += `
<div class="tag"
onclick="toggleMinistro(this,'${nome}')">
${nome}
</div>
`;

});

});

}

window.toggleMinistro = function(el,nome){

if(ministrosSelecionados.includes(nome)){

ministrosSelecionados =
ministrosSelecionados.filter(x=>x!==nome);

el.classList.remove("active");

}else{

ministrosSelecionados.push(nome);
el.classList.add("active");

}

};

/* ===================================
SALVAR ESCALA
=================================== */
window.salvarEscala = function(){

let data = document.getElementById("dataEscala").value;
let hora = document.getElementById("horaEscala").value;

if(!data || !hora){
alert("Preencha data e hora");
return;
}

db.collection("escalas").add({
data:data,
hora:hora,
ministros:ministrosSelecionados
}).then(()=>{
listarEscalas();
});

};

/* ===================================
LISTAR ESCALAS
=================================== */
function listarEscalas(){

const lista = document.getElementById("listaEscalasCards");
if(!lista) return;

lista.innerHTML = "";

db.collection("escalas").get().then(snapshot=>{

snapshot.forEach(doc=>{

let e = doc.data();

lista.innerHTML += `
<div class="card">
<strong>${e.data}</strong> - ${e.hora}<br>
${e.ministros.join(", ")}
</div>
`;

});

});

}

/* ===================================
CALENDÁRIO
=================================== */
function iniciarCalendarioAdmin(){

if(calendarAdmin) return;

const el = document.getElementById("calendarAdmin");
if(!el) return;

calendarAdmin = new FullCalendar.Calendar(el,{
initialView:"dayGridMonth",
locale:"pt-br"
});

calendarAdmin.render();

}

/* ===================================
PDF
=================================== */
window.gerarPDF = function(){
alert("PDF funcionando");
};

/* ===================================
ABRIR INICIAL
=================================== */
abrirTela("dashboard");

});
