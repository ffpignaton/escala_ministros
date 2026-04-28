// CONFIG FIREBASE (SEU PROJETO)
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

// LOGIN
function login(){
let u = user.value;
let s = pass.value;

if(u==="admin" && s==="saojorge"){
loginBox.style.display="none";
painel.classList.remove("hidden");
carregarMinistros();
}else{
alert("Erro login");
}
}

// SALVAR MINISTRO
function salvarMinistro(){
db.collection("ministros").add({
nome:nome.value,
fone:fone.value
});
alert("Salvo!");
carregarMinistros();
}

// CARREGAR MINISTROS
function carregarMinistros(){
let sel = document.getElementById("ministroEscala");
if(!sel) return;

sel.innerHTML="";

db.collection("ministros").get().then(snapshot=>{
snapshot.forEach(doc=>{
sel.innerHTML += `<option>${doc.data().nome}</option>`;
});
});
}

// SALVAR ESCALA
function salvarEscala(){
db.collection("escalas").add({
data:dataEscala.value,
hora:horaEscala.value,
ministro:ministroEscala.value
});
alert("Escala salva!");
}

// CALENDÁRIO
let hoje = new Date();
let mes = hoje.getMonth();
let ano = hoje.getFullYear();

function gerarCalendario(){

mesAno.innerText = new Date(ano,mes).toLocaleString('pt-BR',{month:'long',year:'numeric'});

calendario.innerHTML="";

let primeiro = new Date(ano,mes,1).getDay();
let total = new Date(ano,mes+1,0).getDate();

for(let i=0;i<primeiro;i++){
calendario.innerHTML+="<div></div>";
}

db.collection("escalas").get().then(snapshot=>{

let dados = [];

snapshot.forEach(doc=>{
dados.push(doc.data());
});

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

db.collection("escalas").where("data","==",data).get().then(snapshot=>{

detalhesDia.innerHTML=`<h3>${data}</h3>`;

snapshot.forEach(doc=>{
let e = doc.data();

detalhesDia.innerHTML += `
<div class="itemEscala">
${e.hora} - ${e.ministro}
</div>`;
});

if(snapshot.empty){
detalhesDia.innerHTML+="Sem escala";
}
});
}

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
