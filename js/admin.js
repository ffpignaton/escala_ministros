alert("ADMIN JS ESTÁ RODANDO");

let ministrosSelecionados = [];
let calendarAdmin = null;
let escalaEditandoId = null;
let ministrosEdicao = [];

/* =========================
DATA BONITA
========================= */
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

/* =========================
TELAS
========================= */
function abrirTela(id){

document.querySelectorAll(".tela").forEach(t=>{
t.classList.add("hidden");
});

const tela = document.getElementById(id);

if(!tela){
alert("Tela não encontrada: " + id);
return;
}

tela.classList.remove("hidden");

if(id==="ministros") carregarMinistros();

if(id==="escalas"){
carregarSeletorMinistros();
listarEscalas();
iniciarCalendarioAdmin();
}

}

window.abrirTela = abrirTela;

/* =========================
TELEFONE
========================= */
function mascaraTelefone(campo){
let v = campo.value.replace(/\D/g,'');
if(v.length>11) v=v.slice(0,11);
if(v.length>0) v="("+v;
if(v.length>3) v=v.slice(0,3)+")"+v.slice(3);
if(v.length>9) v=v.slice(0,9)+"-"+v.slice(9);
campo.value=v;
}

/* =========================
MINISTROS
========================= */
function salvarMinistro(){

let nome = document.getElementById("nome").value.trim();
let fone = document.getElementById("fone").value.trim();

if(!nome){
alert("Digite o nome.");
return;
}

db.collection("ministros").add({ nome, fone }).then(()=>{
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
if(!novoNome) return;
let novoFone = prompt("Telefone:", foneAtual);

db.collection("ministros").doc(id).update({
nome:novoNome,
fone:novoFone
}).then(carregarMinistros);
}

function deletarMinistro(id){
if(!confirm("Excluir ministro?")) return;
db.collection("ministros").doc(id).delete()
.then(carregarMinistros);
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
ministrosSelecionados = ministrosSelecionados.filter(x=>x!==nome);
el.classList.remove("active");
}else{
ministrosSelecionados.push(nome);
el.classList.add("active");
}

}

function salvarEscala(){

let data = document.getElementById("dataEscala").value;
let hora = document.getElementById("horaEscala").value;

if(!data || !hora){
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

/* =========================
LISTA BONITA (CORRIGIDA)
========================= */
function listarEscalas(){

const lista = document.getElementById("listaEscalasCards");
lista.innerHTML="";

db.collection("escalas").orderBy("data").get().then(snapshot=>{

snapshot.forEach(doc=>{

let e = doc.data();

lista.innerHTML += `
<div class="escala-card">

<div class="escala-header">
<div class="escala-data">${formatarDataCompleta(e.data)}</div>
<div class="escala-hora">${e.hora}</div>
</div>

<div class="escala-ministros">
${e.ministros.map(m=>`<span class="tag active">${m}</span>`).join("")}
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

/* =========================
EDITAR (MODAL)
========================= */
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

if(ativo) ministrosEdicao.push(nome);

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
ministrosEdicao = ministrosEdicao.filter(n=>n!==nome);
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
alert("Preencha data e hora");
return;
}

if(ministrosEdicao.length === 0){
alert("Selecione ministros");
return;
}

db.collection("escalas").doc(escalaEditandoId).update({
data,
hora,
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

/* =========================
EXCLUIR ESCALA
========================= */
function deletarEscala(id){

if(!confirm("Excluir escala?")) return;

db.collection("escalas").doc(id).delete()
.then(()=>{
listarEscalas();
atualizarCalendarioAdmin();
});

}

/* =========================
CALENDÁRIO
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
locale:'pt-br'
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
title:e.hora + " - " + e.ministros.join(", "),
start:e.data
});

});

});

}

/* =========================
PDF
========================= */
function gerarPDF(){
alert("PDF funcionando 👍");
}

/* =========================
INICIO
========================= */
window.onload = function(){
abrirTela("dashboard");
};
