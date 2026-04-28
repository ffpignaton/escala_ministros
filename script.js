// Firebase
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBr6qDi7cyirnC_akb134OAzjFxTOdGY4U",
  authDomain: "douro-acessorios.firebaseapp.com",
  projectId: "douro-acessorios",
  storageBucket: "douro-acessorios.firebasestorage.app",
  messagingSenderId: "281702603904",
  appId: "1:281702603904:web:0aeda1db82e9e211635a65"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// LOGIN SIMPLES
function login(){
let u = document.getElementById("user").value;
let s = document.getElementById("pass").value;

if(u==="admin" && s==="saojorge"){
document.getElementById("loginBox").style.display="none";
document.getElementById("painel").classList.remove("hidden");
}else{
alert("Login inválido");
}
}

// SALVAR MINISTRO
async function salvarMinistro(){

let nome = document.getElementById("nome").value;
let fone = document.getElementById("fone").value;

await addDoc(collection(db,"ministros"),{
nome,
fone
});

alert("Ministro salvo no Firebase!");
}

// CARREGAR MINISTROS
async function carregarSelect(){

let select = document.getElementById("ministroEscala");
if(!select) return;

select.innerHTML="";

const snapshot = await getDocs(collection(db,"ministros"));

snapshot.forEach(doc=>{
let m = doc.data();
select.innerHTML += `<option>${m.nome}</option>`;
});
}

// SALVAR ESCALA
async function salvarEscala(){

let data = document.getElementById("dataEscala").value;
let hora = document.getElementById("horaEscala").value;
let ministro = document.getElementById("ministroEscala").value;

await addDoc(collection(db,"escalas"),{
data,
hora,
ministro
});

alert("Escala salva no Firebase!");
}

// VER ESCALA POR DIA
async function verDiaFirebase(data){

const q = query(collection(db,"escalas"), where("data","==",data));

const snapshot = await getDocs(q);

let box = document.getElementById("detalhesDia");
box.innerHTML = `<h3>${data}</h3>`;

if(snapshot.empty){
box.innerHTML += "Nenhuma escala.";
return;
}

snapshot.forEach(doc=>{
let e = doc.data();

box.innerHTML += `
<div class="itemEscala">
<strong>${e.hora}</strong> - ${e.ministro}
</div>
`;
});
}
