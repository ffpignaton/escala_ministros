let ministrosSelecionados = [];
let calendarAdmin = null;

/* =========================
TELAS
========================= */
function abrirTela(id){

document.querySelectorAll(".tela").forEach(t=>{
t.classList.add("hidden");
});

document.getElementById(id).classList.remove("hidden");

if(id==="ministros"){
carregarMinistros();
}

if(id==="escalas"){
carregarSeletorMinistros();
listarEscalas();
iniciarCalendarioAdmin();
}

}

/* =========================
TELEFONE
========================= */
function mascaraTelefone(campo){

let v = campo.value.replace(/\D/g,'');

if(v.length > 11){
v = v.slice(0,11);
}

if(v.length > 0){
v = "(" + v;
}

if(v.length > 3){
v = v.slice(0,3) + ")" + v.slice(3);
}

if(v.length > 9){
v = v.slice(0,9) + "-" + v.slice(9);
}

campo.value = v;

}

/* =========================
MINISTROS
========================= */
function salvarMinistro(){

let nome = document.getElementById("nome").value.trim();
let fone = document.getElementById("fone").value.trim();

if(nome===""){
alert("Digite o nome.");
return;
}

db.collection("ministros").add({
nome,
fone
}).then(()=>{

document.getElementById("nome").value="";
document.getElementById("fone").value="";

carregarMinistros();

alert("Ministro salvo!");

});

}

function carregarMinistros(){

const lista = document.getElementById("listaMinistros");
lista.innerHTML="";

db.collection("ministros").get().then(snapshot=>{

snapshot.forEach(doc=>{

let m = doc.data();

lista.innerHTML += `
<div class="ministro-item">
<div>
<strong>${m.nome}</strong><br>
<small>${m.fone || ""}</small>
</div>

<div class="actions">
<button class="small-btn"
onclick="editarMinistro('${doc.id}','${m.nome}','${m.fone || ""}')">
Editar
</button>

<button class="small-btn"
onclick="deletarMinistro('${doc.id}')">
Excluir
</button>
</div>
</div>
`;

});

});

}

function editarMinistro(id,nomeAtual,foneAtual){

let novoNome = prompt("Nome:", nomeAtual);
if(novoNome===null) return;

let novoFone = prompt("Telefone:", foneAtual);

db.collection("ministros").doc(id).update({
nome:novoNome,
fone:novoFone
}).then(()=>{
carregarMinistros();
});

}

function deletarMinistro(id){

if(!confirm("Excluir ministro?")) return;

db.collection("ministros").doc(id).delete()
.then(()=>{
carregarMinistros();
});

}

/* =========================
ESCALAS
========================= */
function carregarSeletorMinistros(){

const box = document.getElementById("seletorMinistros");
box.innerHTML="";
ministrosSelecionados=[];

db.collection("ministros").get().then(snapshot=>{

snapshot.forEach(doc=>{

let m = doc.data();

box.innerHTML += `
<div class="tag"
onclick="toggleMinistro(this,'${m.nome}')">
${m.nome}
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

function salvarEscala(){

let data = document.getElementById("dataEscala").value;
let hora = document.getElementById("horaEscala").value;

if(data==="" || hora===""){
alert("Preencha data e hora.");
return;
}

if(ministrosSelecionados.length===0){
alert("Selecione ministros.");
return;
}

db.collection("escalas").add({
data,
hora,
ministros:ministrosSelecionados
}).then(()=>{

listarEscalas();
carregarSeletorMinistros();
atualizarCalendarioAdmin();

alert("Escala salva!");

});

}

function listarEscalas(){

const tabela = document.getElementById("tabela");
tabela.innerHTML="";

db.collection("escalas").orderBy("data").get()
.then(snapshot=>{

snapshot.forEach(doc=>{

let e = doc.data();

tabela.innerHTML += `
<tr>
<td>${e.data}</td>
<td>${e.hora}</td>
<td>${e.ministros.join(", ")}</td>
<td>

<button class="small-btn"
onclick="editarEscala('${doc.id}','${e.data}','${e.hora}')">
Editar
</button>

<button class="small-btn"
onclick="deletarEscala('${doc.id}')">
Excluir
</button>

</td>
</tr>
`;

});

});

}

function editarEscala(id,dataAtual,horaAtual){

let novaData = prompt("Nova data:", dataAtual);
if(novaData===null) return;

let novaHora = prompt("Nova hora:", horaAtual);

db.collection("escalas").doc(id).update({
data:novaData,
hora:novaHora
}).then(()=>{
listarEscalas();
atualizarCalendarioAdmin();
});

}

function deletarEscala(id){

if(!confirm("Excluir escala?")) return;

db.collection("escalas").doc(id).delete()
.then(()=>{
listarEscalas();
atualizarCalendarioAdmin();
});

}

/* =========================
CALENDÁRIO ADMIN
========================= */
function iniciarCalendarioAdmin(){

if(calendarAdmin){
calendarAdmin.render();
atualizarCalendarioAdmin();
return;
}

let el = document.getElementById("calendarAdmin");

calendarAdmin = new FullCalendar.Calendar(el,{

initialView:'dayGridMonth',
locale:'pt-br',
editable:true,
height:'auto',

headerToolbar:{
left:'prev,next today',
center:'title',
right:'dayGridMonth,timeGridWeek'
},

eventDrop:function(info){

let id = info.event.id;
let novaData = info.event.startStr.slice(0,10);

db.collection("escalas").doc(id).update({
data:novaData
}).then(()=>{
listarEscalas();
});

}

});

calendarAdmin.render();

atualizarCalendarioAdmin();

}

function atualizarCalendarioAdmin(){

if(!calendarAdmin) return;

calendarAdmin.removeAllEvents();

db.collection("escalas").get().then(snapshot=>{

snapshot.forEach(doc=>{

let e = doc.data();

calendarAdmin.addEvent({
id:doc.id,
title:e.hora + " - " + e.ministros.join(", "),
start:e.data
});

});

});

}

/* =========================
PDF REAL COM ESCALAS
========================= */
function gerarPDF(){

db.collection("escalas").orderBy("data").get().then(snapshot=>{

const { jsPDF } = window.jspdf;
const doc = new jsPDF();

let y = 20;

doc.setFontSize(18);
doc.text("Paróquia Santíssima Trindade",20,y);

y += 10;

doc.setFontSize(14);
doc.text("Escala dos Ministros",20,y);

y += 15;

doc.setFontSize(11);

if(snapshot.empty){
doc.text("Nenhuma escala cadastrada.",20,y);
}else{

snapshot.forEach(item=>{

let e = item.data();

doc.text(
`${e.data} - ${e.hora} - ${e.ministros.join(", ")}`,
20,
y
);

y += 8;

if(y > 270){
doc.addPage();
y = 20;
}

});

}

doc.save("escala-ministros.pdf");

});

}

/* =========================
INICIAR
========================= */
window.onload = function(){
abrirTela("dashboard");
};
