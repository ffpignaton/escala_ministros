alert("ADMIN JS MASTER FINAL RESUMIDO");

/* =========================================
VARIÁVEIS GLOBAIS
========================================= */
let ministrosSelecionados = [];
let calendarAdmin = null;

/* =========================================
ABRIR TELAS
========================================= */
window.abrirTela = function(id){

document.querySelectorAll(".tela").forEach(sec=>{
sec.classList.add("hidden");
});

document.getElementById(id).classList.remove("hidden");

if(id==="ministros"){
carregarMinistros();
}

if(id==="escalas"){
carregarMinistrosEscala();
listarEscalas();
iniciarCalendario();
}

};

/* =========================================
MINISTROS
========================================= */
window.salvarMinistro = function(){

let nome = document.getElementById("nome").value.trim();
let fone = document.getElementById("fone").value.trim();

if(!nome) return alert("Digite o nome.");

db.collection("ministros").add({
nome:nome,
fone:fone
}).then(()=>{
document.getElementById("nome").value="";
document.getElementById("fone").value="";
carregarMinistros();
});

};

function carregarMinistros(){

let lista = document.getElementById("listaMinistros");
lista.innerHTML="";

db.collection("ministros").get().then(snapshot=>{

snapshot.forEach(doc=>{

let m = doc.data();

lista.innerHTML += `
<div class="card" style="padding:12px;margin-bottom:10px">
<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">

<div>
<strong>${m.nome}</strong> - ${m.fone || ""}
</div>

<div class="botoes-linha">

<button class="btn-edit"
onclick="editarMinistro('${doc.id}','${m.nome}','${m.fone || ""}')">
Editar
</button>

<button class="btn-delete"
onclick="deletarMinistro('${doc.id}')">
Excluir
</button>

</div>
</div>
</div>
`;

});

});

}

window.editarMinistro = function(id,n,f){

let nome = prompt("Nome:",n);
if(!nome) return;

let fone = prompt("Telefone:",f);

db.collection("ministros").doc(id).update({
nome:nome,
fone:fone
}).then(carregarMinistros);

};

window.deletarMinistro = function(id){

if(!confirm("Excluir ministro?")) return;

db.collection("ministros").doc(id).delete()
.then(carregarMinistros);

};

/* =========================================
ESCALAS
========================================= */
function carregarMinistrosEscala(){

let box = document.getElementById("seletorMinistros");
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

window.salvarEscala = function(){

let data = document.getElementById("dataEscala").value;
let hora = document.getElementById("horaEscala").value;

if(!data || !hora) return alert("Preencha data e hora.");

db.collection("escalas").add({
data:data,
hora:hora,
ministros:ministrosSelecionados
}).then(()=>{
listarEscalas();
atualizarCalendario();
});

};

function listarEscalas(){

let lista = document.getElementById("listaEscalasCards");
lista.innerHTML="";

db.collection("escalas").orderBy("data").get()
.then(snapshot=>{

snapshot.forEach(doc=>{

let e = doc.data();

lista.innerHTML += `
<div class="card" style="padding:12px;margin-bottom:10px">
<strong>${formatarDataCompleta(e.data)}</strong> - ${e.hora}<br>
${e.ministros.join(", ")}
</div>
`;

});

});

}

window.deletarEscala = function(id){

if(!confirm("Excluir escala?")) return;

db.collection("escalas").doc(id).delete()
.then(()=>{
listarEscalas();
atualizarCalendario();
});

};

/* =========================================
CALENDÁRIO
========================================= */
function iniciarCalendario(){

if(calendarAdmin){
atualizarCalendario();
return;
}

calendarAdmin = new FullCalendar.Calendar(
document.getElementById("calendarAdmin"),{

initialView:"dayGridMonth",
locale:"pt-br",
height:"auto",
contentHeight:"auto",

headerToolbar:{
left:"prev,next today",
center:"title",
right:""
},

buttonText:{
today:"Hoje"
},

eventDisplay:"list-item",

eventClick:function(info){

alert(
"Data: " + formatarDataCompleta(info.event.startStr) +
"\nHora: " + info.event.title +
"\nMinistros: " +
(info.event.extendedProps.ministros || []).join(", ")
);

},

datesSet:function(){
setTimeout(ajustarTituloCalendario,100);
}

});

calendarAdmin.render();
ajustarTituloCalendario();
atualizarCalendario();

}

function atualizarCalendario(){

if(!calendarAdmin) return;

calendarAdmin.removeAllEvents();

db.collection("escalas").get().then(snapshot=>{

snapshot.forEach(doc=>{

let e = doc.data();

calendarAdmin.addEvent({
title:e.hora,
start:e.data,
ministros:e.ministros
});

});

});

}

function ajustarTituloCalendario(){

let t = document.querySelector(".fc-toolbar-title");
if(!t) return;

t.innerText =
t.innerText.charAt(0).toUpperCase() +
t.innerText.slice(1);

}

/* =========================================
PDF RESUMIDO EM 1 FOLHA
========================================= */
window.gerarPDF = function(){

db.collection("escalas").orderBy("data").get()
.then(snapshot=>{

const { jsPDF } = window.jspdf;
const doc = new jsPDF();

let y = 15;

/* LOGO */
let img = new Image();
img.src = "logo.png";

img.onload = function(){

doc.addImage(img,"PNG",10,8,18,18);

doc.setFontSize(15);
doc.text("Paróquia Santíssima Trindade",35,16);

y = 32;

/* organizar por data */
let agrupado = {};

snapshot.forEach(item=>{

let e = item.data();

if(!agrupado[e.data]){
agrupado[e.data] = [];
}

agrupado[e.data].push(e);

});

for(let data in agrupado){

doc.setFontSize(11);
doc.setFont(undefined,"bold");
doc.text(formatarDataCompleta(data),10,y);
y += 6;

doc.setFont(undefined,"normal");

agrupado[data].forEach(item=>{

doc.text(
item.hora + "h - Ministros: " +
item.ministros.join(", "),
12,
y
);

y += 5;

});

y += 5;

if(y > 275){
doc.addPage();
y = 15;
}

}

doc.save("escala-ministros.pdf");

};

});

};

/* =========================================
UTIL
========================================= */
function formatarDataCompleta(dataISO){

const data = new Date(dataISO + "T00:00:00");

return data.toLocaleDateString("pt-BR",{
weekday:"long",
day:"numeric",
month:"long",
year:"numeric"
}).replace(/^./, c => c.toUpperCase());

}

/* =========================================
INÍCIO
========================================= */
window.onload = function(){
abrirTela("dashboard");
};
