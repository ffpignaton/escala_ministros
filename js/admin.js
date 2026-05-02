alert("ADMIN JS ESTÁ RODANDO");

/* ===================================
VARIÁVEIS GLOBAIS
=================================== */
let ministrosSelecionados = [];
let ministrosEdicao = [];
let escalaEditandoId = null;
let calendarAdmin = null;

/* ===================================
ABRIR TELAS (CORRIGIDO)
=================================== */
function abrirTela(id){

document.querySelectorAll(".tela").forEach(tela=>{
tela.style.display = "none";
});

document.getElementById(id).style.display = "block";

/* carregar dados da tela */
if(id === "ministros"){
carregarMinistros();
}

if(id === "escalas"){
carregarSeletorMinistros();
listarEscalas();
iniciarCalendarioAdmin();
}

}

window.abrirTela = abrirTela;

/* ===================================
FORMATAR DATA
=================================== */
function formatarDataCompleta(dataISO){

if(!dataISO) return "";

const data = new Date(dataISO + "T00:00:00");

return data.toLocaleDateString("pt-BR",{
weekday:"long",
day:"2-digit",
month:"long",
year:"numeric"
});

}

/* ===================================
MÁSCARA TELEFONE
=================================== */
function mascaraTelefone(campo){

let v = campo.value.replace(/\D/g,'');

if(v.length > 11) v = v.slice(0,11);

if(v.length > 0) v = "(" + v;
if(v.length > 3) v = v.slice(0,3) + ")" + v.slice(3);
if(v.length > 9) v = v.slice(0,9) + "-" + v.slice(9);

campo.value = v;

}

/* ===================================
MINISTROS
=================================== */
function salvarMinistro(){

let nome = document.getElementById("nome").value.trim();
let fone = document.getElementById("fone").value.trim();

if(!nome){
alert("Digite o nome.");
return;
}

db.collection("ministros").add({
nome:nome,
fone:fone
}).then(()=>{

document.getElementById("nome").value = "";
document.getElementById("fone").value = "";

carregarMinistros();

alert("Ministro salvo com sucesso!");

});

}

function carregarMinistros(){

const lista = document.getElementById("listaMinistros");
lista.innerHTML = "";

db.collection("ministros").get().then(snapshot=>{

snapshot.forEach(doc=>{

let m = doc.data();

lista.innerHTML += `
<div class="ministro-item">

<div>
<strong>${m.nome}</strong><br>
<small>${m.fone || ""}</small>
</div>

<div class="escala-actions">

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
`;

});

});

}

function editarMinistro(id,nomeAtual,foneAtual){

let novoNome = prompt("Nome:", nomeAtual);
if(!novoNome) return;

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

db.collection("ministros").doc(id).delete().then(()=>{
carregarMinistros();
});

}

/* ===================================
SELETOR DE MINISTROS
=================================== */
function carregarSeletorMinistros(){

const box = document.getElementById("seletorMinistros");
box.innerHTML = "";

ministrosSelecionados = [];

db.collection("ministros").get().then(snapshot=>{

snapshot.forEach(doc=>{

let nome = doc.data().nome;

box.innerHTML += `
<div class="tag" onclick="toggleMinistro(this,'${nome}')">
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

/* ===================================
SALVAR ESCALA
=================================== */
function salvarEscala(){

let data = document.getElementById("dataEscala").value;
let hora = document.getElementById("horaEscala").value;

if(!data || !hora){
alert("Preencha data e hora.");
return;
}

if(ministrosSelecionados.length === 0){
alert("Selecione ministros.");
return;
}

db.collection("escalas").add({
data:data,
hora:hora,
ministros:ministrosSelecionados
}).then(()=>{

listarEscalas();
carregarSeletorMinistros();
atualizarCalendarioAdmin();

alert("Escala salva com sucesso!");

});

}

/* ===================================
LISTAR ESCALAS
=================================== */
function listarEscalas(){

const lista = document.getElementById("listaEscalasCards");
lista.innerHTML = "";

db.collection("escalas").orderBy("data").get()
.then(snapshot=>{

snapshot.forEach(doc=>{

let e = doc.data();

lista.innerHTML += `
<div class="escala-card">

<div class="escala-header">

<div class="escala-data">
${formatarDataCompleta(e.data)}
</div>

<div class="escala-hora">
${e.hora}
</div>

</div>

<div class="escala-ministros">
${e.ministros.map(m =>
`<span class="tag active">${m}</span>`
).join("")}
</div>

<div class="escala-actions">

<button class="btn-edit"
onclick="editarEscala('${doc.id}','${e.data}','${e.hora}')">
Editar
</button>

<button class="btn-delete"
onclick="deletarEscala('${doc.id}')">
Excluir
</button>

</div>

</div>
`;

});

});

}

/* ===================================
EDITAR ESCALA
=================================== */
function editarEscala(id,dataAtual,horaAtual){

escalaEditandoId = id;

document.getElementById("editData").value = dataAtual;
document.getElementById("editHora").value = horaAtual;

const box = document.getElementById("editMinistros");
box.innerHTML = "";

ministrosEdicao = [];

db.collection("escalas").doc(id).get().then(docEscala=>{

let escala = docEscala.data();

db.collection("ministros").get().then(snapshot=>{

snapshot.forEach(doc=>{

let nome = doc.data().nome;
let ativo = escala.ministros.includes(nome);

if(ativo){
ministrosEdicao.push(nome);
}

box.innerHTML += `
<div class="tag ${ativo ? 'active' : ''}"
onclick="toggleEditMinistro(this,'${nome}')">
${nome}
</div>
`;

});

});

});

document.getElementById("modalEditar").style.display = "flex";

}

function toggleEditMinistro(el,nome){

if(ministrosEdicao.includes(nome)){

ministrosEdicao =
ministrosEdicao.filter(n=>n!==nome);

el.classList.remove("active");

}else{

ministrosEdicao.push(nome);
el.classList.add("active");

}

}

function salvarEdicao(){

let data = document.getElementById("editData").value;
let hora = document.getElementById("editHora").value;

if(!data || !hora){
alert("Preencha data e hora.");
return;
}

if(ministrosEdicao.length === 0){
alert("Selecione ministros.");
return;
}

db.collection("escalas").doc(escalaEditandoId).update({
data:data,
hora:hora,
ministros:ministrosEdicao
}).then(()=>{

fecharModal();
listarEscalas();
atualizarCalendarioAdmin();

alert("Escala atualizada!");

});

}

function fecharModal(){
document.getElementById("modalEditar").style.display = "none";
}

/* ===================================
EXCLUIR ESCALA
=================================== */
function deletarEscala(id){

if(!confirm("Excluir escala?")) return;

db.collection("escalas").doc(id).delete().then(()=>{

listarEscalas();
atualizarCalendarioAdmin();

});

}

/* ===================================
CALENDÁRIO
=================================== */
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
height:'auto',

headerToolbar:{
left:'prev,next today',
center:'title',
right:'dayGridMonth,timeGridWeek'
},

buttonText:{
today:'Hoje',
month:'Mês',
week:'Semana'
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

/* ===================================
PDF
=================================== */
function gerarPDF(){

db.collection("escalas").orderBy("data").get().then(snapshot=>{

const { jsPDF } = window.jspdf;
const doc = new jsPDF();

let y = 20;

doc.text("Paróquia Santíssima Trindade",20,y);
y += 10;

doc.text("Escala dos Ministros",20,y);
y += 10;

snapshot.forEach(item=>{

let e = item.data();

doc.text(
`${formatarDataCompleta(e.data)} - ${e.hora} - ${e.ministros.join(", ")}`,
20,
y
);

y += 8;

if(y > 270){
doc.addPage();
y = 20;
}

});

doc.save("escala.pdf");

});

}

/* ===================================
INÍCIO
=================================== */
window.onload = function(){
abrirTela("dashboard");
};
