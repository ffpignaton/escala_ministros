let ministrosSelecionados = [];
let calendarAdmin = null;
let escalaEditandoId = null;
let ministrosEdicao = [];

/* TELAS */
function abrirTela(id){
document.querySelectorAll(".tela").forEach(t=>t.classList.add("hidden"));
document.getElementById(id).classList.remove("hidden");

if(id==="ministros") carregarMinistros();
if(id==="escalas"){
carregarSeletorMinistros();
listarEscalas();
iniciarCalendarioAdmin();
}
}

/* TELEFONE */
function mascaraTelefone(campo){
let v = campo.value.replace(/\D/g,'');
if(v.length>11) v=v.slice(0,11);
if(v.length>0) v="("+v;
if(v.length>3) v=v.slice(0,3)+")"+v.slice(3);
if(v.length>9) v=v.slice(0,9)+"-"+v.slice(9);
campo.value=v;
}

/* MINISTROS */
function salvarMinistro(){
let nome=document.getElementById("nome").value.trim();
let fone=document.getElementById("fone").value.trim();
if(!nome) return alert("Digite nome");

db.collection("ministros").add({nome,fone}).then(()=>{
document.getElementById("nome").value="";
document.getElementById("fone").value="";
carregarMinistros();
});
}

function carregarMinistros(){
const lista=document.getElementById("listaMinistros");
lista.innerHTML="";
db.collection("ministros").get().then(s=>{
s.forEach(doc=>{
let m=doc.data();
lista.innerHTML+=`
<div class="ministro-item">
<div><strong>${m.nome}</strong><br><small>${m.fone||""}</small></div>
<div>
<button onclick="editarMinistro('${doc.id}','${m.nome}','${m.fone||""}')">Editar</button>
<button onclick="deletarMinistro('${doc.id}')">Excluir</button>
</div>
</div>`;
});
});
}

function editarMinistro(id,n,f){
let nome=prompt("Nome:",n);
if(nome===null)return;
let fone=prompt("Telefone:",f);
db.collection("ministros").doc(id).update({nome,fone}).then(carregarMinistros);
}

function deletarMinistro(id){
if(!confirm("Excluir?"))return;
db.collection("ministros").doc(id).delete().then(carregarMinistros);
}

/* ESCALAS */
function carregarSeletorMinistros(){
const box=document.getElementById("seletorMinistros");
box.innerHTML="";
ministrosSelecionados=[];
db.collection("ministros").get().then(s=>{
s.forEach(doc=>{
let nome=doc.data().nome;
box.innerHTML+=`<div class="tag" onclick="toggleMinistro(this,'${nome}')">${nome}</div>`;
});
});
}

function toggleMinistro(el,nome){
if(ministrosSelecionados.includes(nome)){
ministrosSelecionados=ministrosSelecionados.filter(n=>n!==nome);
el.classList.remove("active");
}else{
ministrosSelecionados.push(nome);
el.classList.add("active");
}
}

function salvarEscala(){
let data=document.getElementById("dataEscala").value;
let hora=document.getElementById("horaEscala").value;
if(!data||!hora) return alert("Preencha");
if(ministrosSelecionados.length===0) return alert("Selecione ministros");

db.collection("escalas").add({data,hora,ministros:ministrosSelecionados})
.then(()=>{
listarEscalas();
carregarSeletorMinistros();
atualizarCalendarioAdmin();
});
}

function listarEscalas(){
const tabela=document.getElementById("tabela");
tabela.innerHTML="";
db.collection("escalas").orderBy("data").get().then(s=>{
s.forEach(doc=>{
let e=doc.data();
tabela.innerHTML+=`
<tr>
<td>${e.data}</td>
<td>${e.hora}</td>
<td>${e.ministros.join(", ")}</td>
<td>
<button onclick="editarEscala('${doc.id}','${e.data}','${e.hora}')">Editar</button>
<button onclick="deletarEscala('${doc.id}')">Excluir</button>
</td>
</tr>`;
});
});
}

function deletarEscala(id){
if(!confirm("Excluir?"))return;
db.collection("escalas").doc(id).delete().then(()=>{
listarEscalas();
atualizarCalendarioAdmin();
});
}

/* EDITAR COM MODAL */
function editarEscala(id,data,hora){
escalaEditandoId=id;
document.getElementById("editData").value=data;
document.getElementById("editHora").value=hora;

const box=document.getElementById("editMinistros");
box.innerHTML="";
ministrosEdicao=[];

db.collection("escalas").doc(id).get().then(docEscala=>{
let escala=docEscala.data();

db.collection("ministros").get().then(snapshot=>{
snapshot.forEach(doc=>{
let nome=doc.data().nome;
let ativo=escala.ministros.includes(nome);

if(ativo) ministrosEdicao.push(nome);

box.innerHTML+=`
<div class="tag ${ativo?'active':''}" onclick="toggleEditMinistro(this,'${nome}')">
${nome}
</div>`;
});
});
});

document.getElementById("modalEditar").classList.remove("hidden");
}

function toggleEditMinistro(el,nome){
if(ministrosEdicao.includes(nome)){
ministrosEdicao=ministrosEdicao.filter(n=>n!==nome);
el.classList.remove("active");
}else{
ministrosEdicao.push(nome);
el.classList.add("active");
}
}

function salvarEdicao(){
let data=document.getElementById("editData").value;
let hora=document.getElementById("editHora").value;

db.collection("escalas").doc(escalaEditandoId).update({
data,
hora,
ministros:ministrosEdicao
}).then(()=>{
fecharModal();
listarEscalas();
atualizarCalendarioAdmin();
});
}

function fecharModal(){
document.getElementById("modalEditar").classList.add("hidden");
}

/* CALENDÁRIO */
function iniciarCalendarioAdmin(){
if(calendarAdmin){calendarAdmin.render();atualizarCalendarioAdmin();return;}
let el=document.getElementById("calendarAdmin");
calendarAdmin=new FullCalendar.Calendar(el,{
initialView:'dayGridMonth',
editable:true,
eventDrop:function(info){
db.collection("escalas").doc(info.event.id).update({
data:info.event.startStr.slice(0,10)
}).then(listarEscalas);
}
});
calendarAdmin.render();
atualizarCalendarioAdmin();
}

function atualizarCalendarioAdmin(){
if(!calendarAdmin)return;
calendarAdmin.removeAllEvents();

db.collection("escalas").get().then(s=>{
s.forEach(doc=>{
let e=doc.data();
calendarAdmin.addEvent({
id:doc.id,
title:e.hora+" - "+e.ministros.join(", "),
start:e.data
});
});
});
}

/* PDF */
function gerarPDF(){
db.collection("escalas").orderBy("data").get().then(snapshot=>{
const { jsPDF } = window.jspdf;
const doc = new jsPDF();

let y = 20;

doc.setFontSize(18);
doc.text("Paróquia Santíssima Trindade",20,y);
y+=10;

doc.setFontSize(14);
doc.text("Escala dos Ministros",20,y);
y+=15;

snapshot.forEach(item=>{
let e=item.data();
doc.text(`${e.data} - ${e.hora} - ${e.ministros.join(", ")}`,20,y);
y+=8;
if(y>270){doc.addPage();y=20;}
});

doc.save("escala-ministros.pdf");
});
}

/* INIT */
window.onload=()=>abrirTela("dashboard");
