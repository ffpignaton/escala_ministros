// FIREBASE
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

// DATA
let hoje = new Date();
let mes = hoje.getMonth();
let ano = hoje.getFullYear();

// GERAR CALENDÁRIO
function gerarCalendario(){

const titulo = document.getElementById("mesAno");
const calendario = document.getElementById("calendario");

if(!titulo || !calendario) return;

titulo.innerText = new Date(ano, mes).toLocaleString(
'pt-BR',
{month:'long', year:'numeric'}
);

calendario.innerHTML = "";

let primeiroDia = new Date(ano, mes, 1).getDay();
let totalDias = new Date(ano, mes + 1, 0).getDate();

// espaços vazios
for(let i=0;i<primeiroDia;i++){
calendario.innerHTML += `<div></div>`;
}

// busca escalas
db.collection("escalas").get().then(snapshot=>{

let eventos = [];

snapshot.forEach(doc=>{
eventos.push(doc.data());
});

// monta dias
for(let dia=1; dia<=totalDias; dia++){

let data = `${ano}-${String(mes+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;

let temEvento = eventos.some(e=>e.data===data);

let classe = "day";

if(temEvento) classe += " has-event";

if(
dia === hoje.getDate() &&
mes === hoje.getMonth() &&
ano === hoje.getFullYear()
){
classe += " today";
}

calendario.innerHTML += `
<div class="${classe}" onclick="verDia('${data}')">
<div class="day-number">${dia}</div>
${temEvento ? '<div class="dot"></div>' : ''}
</div>
`;
}

});
}

// VER DIA
function verDia(data){

const box = document.getElementById("detalhesDia");

db.collection("escalas")
.where("data","==",data)
.get()
.then(snapshot=>{

box.innerHTML = `<h3>${data}</h3>`;

if(snapshot.empty){
box.innerHTML += "Nenhuma escala neste dia.";
return;
}

snapshot.forEach(doc=>{

let e = doc.data();

let ministros = e.ministros
? e.ministros.join(", ")
: e.ministro;

box.innerHTML += `
<div class="itemEscala">
<strong>${e.hora}</strong><br>
${ministros}
</div>
`;
});

});
}

// NAVEGAÇÃO
function mesAnterior(){
mes--;
if(mes < 0){
mes = 11;
ano--;
}
gerarCalendario();
}

function proximoMes(){
mes++;
if(mes > 11){
mes = 0;
ano++;
}
gerarCalendario();
}

// INICIAR
gerarCalendario();
