alert("ADMIN MASTER OK");

/* ==================================================
VARIÁVEIS GLOBAIS
================================================== */
let ministrosSelecionados = [];
let ministrosEdicao = [];
let escalaEditandoId = null;

/* ==================================================
ABRIR TELAS
================================================== */
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
}

};

/* ==================================================
MÁSCARA TELEFONE
================================================== */
window.mascaraTelefone = function(campo){

let v = campo.value.replace(/\D/g,'');

if(v.length > 11) v = v.slice(0,11);

if(v.length > 0) v = "(" + v;
if(v.length > 3) v = v.slice(0,3)+")"+v.slice(3);
if(v.length > 9) v = v.slice(0,9)+"-"+v.slice(9);

campo.value = v;

};

/* ==================================================
MINISTROS
================================================== */
window.salvarMinistro = function(){

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

document.getElementById("nome").value="";
document.getElementById("fone").value="";

carregarMinistros();

alert("Ministro salvo!");

});

};

function carregarMinistros(){

let lista = document.getElementById("listaMinistros");
lista.innerHTML = "";

db.collection("ministros").get().then(snapshot=>{

snapshot.forEach(doc=>{

let m = doc.data();

lista.innerHTML += `
<div class="card">

<strong>${m.nome}</strong><br>
${m.fone || ""}

<div style="margin-top:10px">

<button onclick="editarMinistro('${doc.id}','${m.nome}','${m.fone || ""}')">
Editar
</button>

<button onclick="deletarMinistro('${doc.id}')"
style="background:#d9534f">
Excluir
</button>

</div>

</div>
`;

});

});

}

window.editarMinistro = function(id,nomeAtual,foneAtual){

let novoNome = prompt("Nome:", nomeAtual);
if(!novoNome) return;

let novoFone = prompt("Telefone:", foneAtual);

db.collection("ministros").doc(id).update({
nome:novoNome,
fone:novoFone
}).then(()=>{
carregarMinistros();
alert("Ministro atualizado!");
});

};

window.deletarMinistro = function(id){

if(!confirm("Excluir ministro?")) return;

db.collection("ministros").doc(id).delete().then(()=>{
carregarMinistros();
});

};

/* ==================================================
ESCALAS
================================================== */
function carregarMinistrosEscala(){

let box = document.getElementById("seletorMinistros");
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

window.salvarEscala = function(){

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
data:data,
hora:hora,
ministros:ministrosSelecionados
}).then(()=>{

listarEscalas();

alert("Escala salva!");

});

};

function listarEscalas(){

let lista = document.getElementById("listaEscalasCards");
lista.innerHTML = "";

db.collection("escalas").orderBy("data").get()
.then(snapshot=>{

snapshot.forEach(doc=>{

let e = doc.data();

lista.innerHTML += `
<div class="card">

<strong>${e.data}</strong> - ${e.hora}<br><br>

${e.ministros.join(", ")}

<div style="margin-top:10px">

<button onclick="editarEscala('${doc.id}','${e.data}','${e.hora}')">
Editar
</button>

<button onclick="deletarEscala('${doc.id}')"
style="background:#d9534f">
Excluir
</button>

</div>

</div>
`;

});

});

}

/* ==================================================
EDITAR ESCALA
================================================== */
window.editarEscala = function(id,dataAtual,horaAtual){

escalaEditandoId = id;

document.getElementById("editData").value = dataAtual;
document.getElementById("editHora").value = horaAtual;

let box = document.getElementById("editMinistros");
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

document.getElementById("modalEditar").style.display="flex";

};

window.toggleEditMinistro = function(el,nome){

if(ministrosEdicao.includes(nome)){

ministrosEdicao =
ministrosEdicao.filter(x=>x!==nome);

el.classList.remove("active");

}else{

ministrosEdicao.push(nome);
el.classList.add("active");

}

};

window.salvarEdicao = function(){

let data = document.getElementById("editData").value;
let hora = document.getElementById("editHora").value;

db.collection("escalas").doc(escalaEditandoId).update({
data:data,
hora:hora,
ministros:ministrosEdicao
}).then(()=>{

fecharModal();
listarEscalas();

alert("Escala atualizada!");

});

};

window.fecharModal = function(){
document.getElementById("modalEditar").style.display="none";
};

window.deletarEscala = function(id){

if(!confirm("Excluir escala?")) return;

db.collection("escalas").doc(id).delete().then(()=>{
listarEscalas();
});

};

/* ==================================================
PDF
================================================== */
window.gerarPDF = function(){
alert("PDF MASTER em breve");
};

/* ==================================================
INÍCIO
================================================== */
window.onload = function(){
abrirTela("dashboard");
};
