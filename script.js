// FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyBr6qDi7cyirnC_akb134OAzjFxTOdGY4U",
  authDomain: "douro-acessorios.firebaseapp.com",
  projectId: "douro-acessorios",
  storageBucket: "douro-acessorios.firebasestorage.app",
  messagingSenderId: "281702603904",
  appId: "1:281702603904:web:0aeda1db82e9e211635a65"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

/* =========================
   ADMIN
========================= */

// SALVAR MINISTRO
function salvarMinistro(){

let nome = document.getElementById("nome").value.trim();
let fone = document.getElementById("fone").value.trim();

if(nome === ""){
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

}

// CARREGAR MINISTROS
function carregarMinistros(){

const lista = document.getElementById("listaMinistros");
const box = document.getElementById("checkboxes");

if(lista) lista.innerHTML="";
if(box) box.innerHTML="";

db.collection("ministros").get().then(snapshot=>{

snapshot.forEach(doc=>{

let m = doc.data();
let id = doc.id;

if(lista){
lista.innerHTML += `
<div style="padding:8px;border-bottom:1px solid #eee;">
<strong>${m.nome}</strong><br>
<small>${m.fone || ""}</small>
<button class="small-btn" onclick="deletarMinistro('${id}')">Excluir</button>
</div>
`;
}

if(box){
box.innerHTML += `
<label style="display:block;padding:4px 0;">
<input type="checkbox" value="${m.nome}">
${m.nome}
</label>
`;
}

});

});

}

// EXCLUIR MINISTRO
function deletarMinistro(id){

if(!confirm("Excluir ministro?")) return;

db.collection("ministros").doc(id).delete()
.then(()=>{
carregarMinistros();
});

}

// SALVAR ESCALA
function salvarEscala(){

let data = document.getElementById("dataEscala").value;
let hora = document.getElementById("horaEscala").value;

if(data==="" || hora===""){
alert("Escolha data e hora.");
return;
}

let selecionados = [];

document.querySelectorAll("#checkboxes input:checked")
.forEach(el=>{
selecionados.push(el.value);
});

if(selecionados.length===0){
alert("Selecione ao menos um ministro.");
return;
}

db.collection("escalas").add({
data:data,
hora:hora,
ministros:selecionados
}).then(()=>{

listarEscalas();

alert("Escala salva!");

});

}

// LISTAR ESCALAS
function listarEscalas(){

const tabela = document.getElementById("tabela");

if(!tabela) return;

tabela.innerHTML="";

db.collection("escalas").orderBy("data").get()
.then(snapshot=>{

snapshot.forEach(doc=>{

let e = doc.data();
let id = doc.id;

tabela.innerHTML += `
<tr>
<td>${e.data}</td>
<td>${e.hora}</td>
<td>${(e.ministros || []).join(", ")}</td>
<td>
<button class="small-btn" onclick="deletarEscala('${id}')">Excluir</button>
</td>
</tr>
`;

});

});

}

// EXCLUIR ESCALA
function deletarEscala(id){

if(!confirm("Excluir escala?")) return;

db.collection("escalas").doc(id).delete()
.then(()=>{
listarEscalas();
});

}

/* =========================
   CALENDÁRIO PÚBLICO
========================= */

let hoje = new Date();
let mes = hoje.getMonth();
let ano = hoje.getFullYear();

function gerarCalendario(){

const titulo = document.getElementById("mesAno");
const calendario = document.getElementById("calendario");

if(!titulo || !calendario) return;

titulo.innerText = new Date(
ano,
mes
).toLocaleString(
'pt-BR',
{month:'long',year:'numeric'}
);

calendario.innerHTML="";

let primeiroDia = new Date(ano, mes, 1).getDay();
let totalDias = new Date(ano, mes+1, 0).getDate();

for(let i=0;i<primeiroDia;i++){
calendario.innerHTML += `<div></div>`;
}

db.collection("escalas").get().then(snapshot=>{

let eventos = [];

snapshot.forEach(doc=>{
eventos.push(doc.data());
});

for(let dia=1; dia<=totalDias; dia++){

let data = `${ano}-${String(mes+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;

let tem = eventos.some(e=>e.data===data);

calendario.innerHTML += `
<div class="day ${tem?'has-event':''}" onclick="verDia('${data}')">
<div class="day-number">${dia}</div>
${tem ? '<div class="dot"></div>' : ''}
</div>
`;

}

});

}

// VER DIA
function verDia(data){

const box = document.getElementById("detalhesDia");

if(!box) return;

db.collection("escalas")
.where("data","==",data)
.get()
.then(snapshot=>{

box.innerHTML = `<h3>${data}</h3>`;

if(snapshot.empty){
box.innerHTML += "Nenhuma escala.";
return;
}

snapshot.forEach(doc=>{

let e = doc.data();

box.innerHTML += `
<div class="itemEscala">
<strong>${e.hora}</strong><br>
${(e.ministros || []).join(", ")}
</div>
`;

});

});

}

function mesAnterior(){
mes--;
if(mes<0){
mes=11;
ano--;
}
gerarCalendario();
}

function proximoMes(){
mes++;
if(mes>11){
mes=0;
ano++;
}
gerarCalendario();
}

/* =========================
   INICIAR
========================= */

window.onload = function(){

carregarMinistros();
listarEscalas();
gerarCalendario();

};
