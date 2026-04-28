// FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyBr6qDi7cyirnC_akb134OAzjFxTOdGY4U",
  authDomain: "douro-acessorios.firebaseapp.com",
  projectId: "douro-acessorios",
  storageBucket: "douro-acessorios.firebasestorage.app",
  messagingSenderId: "281702603904",
  appId: "1:281702603904:web:0aeda1db82e9e211635a65"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let hoje = new Date();
let mes = hoje.getMonth();
let ano = hoje.getFullYear();


// LOGIN
function login(){
if(user.value==="admin" && pass.value==="saojorge"){
loginBox.style.display="none";
painel.classList.remove("hidden");
carregarMinistros();
listarEscalas();
}else{
alert("Erro login");
}
}

// MINISTROS
function salvarMinistro(){
db.collection("ministros").add({
nome:nome.value,
fone:fone.value
});
alert("Salvo!");
carregarMinistros();
}

// CHECKBOX MINISTROS
function carregarMinistros(){
let div = document.getElementById("listaCheckbox");
if(!div) return;

div.innerHTML="";

db.collection("ministros").get().then(snap=>{
snap.forEach(doc=>{
let m = doc.data();

div.innerHTML += `
<label>
<input type="checkbox" value="${m.nome}">
${m.nome}
</label><br>
`;
});
});
}

// SALVAR ESCALA
function salvarEscala(){

let selecionados = [];

document.querySelectorAll("#listaCheckbox input:checked")
.forEach(i=>selecionados.push(i.value));

db.collection("escalas").add({
data:dataEscala.value,
hora:horaEscala.value,
ministros:selecionados
});

alert("Escala salva!");
listarEscalas();
}

// LISTA TABELA
function listarEscalas(){

let tb = document.getElementById("tabelaEscalas");
if(!tb) return;

tb.innerHTML="";

db.collection("escalas").get().then(snap=>{
snap.forEach(doc=>{
let e = doc.data();

tb.innerHTML += `
<tr>
<td>${e.data}</td>
<td>${e.hora}</td>
<td>${e.ministros.join(", ")}</td>
</tr>
`;
});
});
}

// CALENDÁRIO
function gerarCalendario(){

mesAno.innerText = new Date(ano,mes).toLocaleString('pt-BR',{month:'long',year:'numeric'});

calendario.innerHTML="";

let primeiro = new Date(ano,mes,1).getDay();
let total = new Date(ano,mes+1,0).getDate();

for(let i=0;i<primeiro;i++){
calendario.innerHTML+="<div></div>";
}

db.collection("escalas").get().then(snap=>{

let dados=[];
snap.forEach(d=>dados.push(d.data()));

for(let d=1;d<=total;d++){

let data = `${ano}-${String(mes+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

let tem = dados.some(e=>e.data===data);

calendario.innerHTML += `
<div class="dia ${tem?'comEscala':''}" onclick="verDia('${data}')">
${d}
</div>`;
}
});
}

// VER DIA
function verDia(data){

db.collection("escalas").where("data","==",data).get().then(snap=>{

detalhesDia.innerHTML=`<h3>${data}</h3>`;

snap.forEach(doc=>{
let e = doc.data();

detalhesDia.innerHTML += `
<div class="itemEscala">
${e.hora} - ${e.ministros.join(", ")}
</div>`;
});

if(snap.empty){
detalhesDia.innerHTML+="Sem escala";
}
});
}

// MES
function mesAnterior(){
mes--;
if(mes<0){mes=11;ano--;}
gerarCalendario();
}

function proximoMes(){
mes++;
if(mes>11){mes=0;ano++;}
gerarCalendario();
}

gerarCalendario();
