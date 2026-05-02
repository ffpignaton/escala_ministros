alert("ADMIN MASTER CALENDÁRIO");

/* ================================= */
let ministrosSelecionados = [];
let calendarAdmin = null;

/* ================================= */
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

/* ===================================
MÁSCARA TELEFONE
=================================== */
window.mascaraTelefone = function(campo){

let v = campo.value.replace(/\D/g,'');

if(v.length > 11) v = v.slice(0,11);

if(v.length > 0) v = "(" + v;
if(v.length > 3) v = v.slice(0,3)+")"+v.slice(3);
if(v.length > 9) v = v.slice(0,9)+"-"+v.slice(9);

campo.value = v;

};

/* ===================================
MINISTROS
=================================== */
window.salvarMinistro = function(){

let nome = document.getElementById("nome").value.trim();
let fone = document.getElementById("fone").value.trim();

if(!nome) return alert("Digite o nome");

db.collection("ministros").add({
nome,fone
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
onclick="editarMinistro('${doc.id}','${m.nome}','${m.fone}')">
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
nome,fone
}).then(carregarMinistros);

};

window.deletarMinistro = function(id){

if(!confirm("Excluir ministro?")) return;

db.collection("ministros").doc(id).delete()
.then(carregarMinistros);

};

/* ===================================
ESCALAS
=================================== */
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

if(!data || !hora) return alert("Preencha data e hora");

db.collection("escalas").add({
data,
hora,
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
<div class="card" style="padding:14px;margin-bottom:10px">

<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">

<div>
<strong>${e.data}</strong> - ${e.hora}
</div>

<div class="botoes-linha">

<button class="btn-edit">
Editar
</button>

<button class="btn-delete"
onclick="deletarEscala('${doc.id}')">
Excluir
</button>

</div>

</div>

<div style="margin-top:10px;color:#555">
${e.ministros.join(", ")}
</div>

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

/* ===================================
CALENDÁRIO NOVO
=================================== */
function iniciarCalendario(){

if(calendarAdmin){
atualizarCalendario();
return;
}

let el = document.getElementById("calendarAdmin");

calendarAdmin = new FullCalendar.Calendar(el,{

initialView:"dayGridMonth",
locale:"pt-br",
height:420,

headerToolbar:{
left:"prev,next today",
center:"title",
right:""
},

buttonText:{
today:"Hoje"
},

dayMaxEvents:false,

eventDisplay:"list-item",

eventClick:function(info){

alert(
"Data: " + info.event.startStr +
"\nHora: " + info.event.title
);

},

datesSet:function(){

setTimeout(()=>{
ajustarTituloCalendario();
},100);

}

});

calendarAdmin.render();

ajustarTituloCalendario();

atualizarCalendario();

}

/* ===================================
MAIÚSCULA NO MÊS
=================================== */
function ajustarTituloCalendario(){

let titulo = document.querySelector(".fc-toolbar-title");

if(!titulo) return;

let txt = titulo.innerText;

titulo.innerText =
txt.charAt(0).toUpperCase() + txt.slice(1);

}

/* ===================================
ATUALIZAR EVENTOS
=================================== */
function atualizarCalendario(){

if(!calendarAdmin) return;

calendarAdmin.removeAllEvents();

db.collection("escalas").get().then(snapshot=>{

snapshot.forEach(doc=>{

let e = doc.data();

calendarAdmin.addEvent({

title:e.hora,
start:e.data

});

});

});

}

/* ===================================
PDF
=================================== */
window.gerarPDF=function(){
alert("PDF em breve");
};

window.salvarEdicao=function(){};
window.fecharModal=function(){};

/* ================================= */
window.onload = function(){
abrirTela("dashboard");
};
