alert("ADMIN OK");

/* ===========================
VARIÁVEIS
=========================== */
let ministrosSelecionados = [];

/* ===========================
ABRIR TELAS
=========================== */
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

/* ===========================
SALVAR MINISTRO
=========================== */
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

alert("Ministro salvo!");

});

};

/* ===========================
LISTAR MINISTROS
=========================== */
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
</div>
`;

});

});

}

/* ===========================
MINISTROS ESCALA
=========================== */
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

/* ===========================
SALVAR ESCALA
=========================== */
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
alert("Escala salva!");

});

};

/* ===========================
LISTAR ESCALAS
=========================== */
function listarEscalas(){

let lista = document.getElementById("listaEscalasCards");
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

/* ===========================
OUTROS
=========================== */
window.gerarPDF = function(){
alert("PDF em breve");
};

window.salvarEdicao = function(){};
window.fecharModal = function(){
document.getElementById("modalEditar").style.display="none";
};

window.mascaraTelefone = function(campo){

let v = campo.value.replace(/\D/g,'');

if(v.length > 11) v = v.slice(0,11);

if(v.length > 0) v = "(" + v;
if(v.length > 3) v = v.slice(0,3)+")"+v.slice(3);
if(v.length > 9) v = v.slice(0,9)+"-"+v.slice(9);

campo.value = v;

};

/* ===========================
INÍCIO
=========================== */
window.onload = function(){
abrirTela("dashboard");
};
