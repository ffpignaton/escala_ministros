/* ===============================
VARIÁVEIS
=============================== */
let ministrosSelecionados = [];
let ministrosEdicao = [];
let escalaEditandoId = null;
let calendarAdmin = null;

/* ===============================
ABRIR TELAS
=============================== */
function abrirTela(id){

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

}

/* DEIXAR GLOBAL */
window.abrirTela = abrirTela;

/* ===============================
MINISTROS
=============================== */
function salvarMinistro(){

let nome = document.getElementById("nome").value.trim();
let fone = document.getElementById("fone").value.trim();

if(!nome){
alert("Digite nome");
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

}

window.salvarMinistro = salvarMinistro;

function carregarMinistros(){

const lista = document.getElementById("listaMinistros");
lista.innerHTML="";

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

/* ===============================
ESCALAS
=============================== */
function carregarSeletorMinistros(){

const box = document.getElementById("seletorMinistros");
box.innerHTML="";
ministrosSelecionados=[];

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

function toggleMinistro(el,nome){

if(ministrosSelecionados.includes(nome)){
ministrosSelecionados =
ministrosSelecionados.filter(x=>x!==nome);
el.classList.remove("active");
}else{
ministrosSelecionados.push(nome);
el.classList.add("active");
}

}

window.toggleMinistro = toggleMinistro;

function salvarEscala(){

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

}

window.salvarEscala = salvarEscala;

function listarEscalas(){

const lista = document.getElementById("listaEscalasCards");
lista.innerHTML="";

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

/* ===============================
CALENDÁRIO
=============================== */
function iniciarCalendarioAdmin(){

if(calendarAdmin) return;

let el = document.getElementById("calendarAdmin");

if(!el) return;

calendarAdmin = new FullCalendar.Calendar(el,{
initialView:"dayGridMonth",
locale:"pt-br"
});

calendarAdmin.render();

}

/* ===============================
PDF
=============================== */
function gerarPDF(){
alert("PDF OK");
}

window.gerarPDF = gerarPDF;

/* ===============================
INÍCIO
=============================== */
window.onload = function(){
abrirTela("dashboard");
};
