const firebaseConfig = {
  apiKey: "AIzaSyBr6qDi7cyirnC_akb134OAzjFxTOdGY4U",
  authDomain: "douro-acessorios.firebaseapp.com",
  projectId: "douro-acessorios",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// MINISTROS
function salvarMinistro(){
db.collection("ministros").add({
nome:nome.value,
fone:fone.value
});
carregarMinistros();
}

function carregarMinistros(){

listaMinistros.innerHTML="";
checkboxes.innerHTML="";

db.collection("ministros").get().then(snap=>{
snap.forEach(doc=>{
let m = doc.data();
let id = doc.id;

listaMinistros.innerHTML += `
<div class="ministro-item">
${m.nome}
<div class="ministro-actions">
<button onclick="deletarMinistro('${id}')">🗑</button>
</div>
</div>
`;

checkboxes.innerHTML += `
<label>
<input type="checkbox" value="${m.nome}">
${m.nome}
</label><br>
`;
});
});
}

function deletarMinistro(id){
db.collection("ministros").doc(id).delete();
carregarMinistros();
}

// ESCALA
function salvarEscala(){

let selecionados=[];

document.querySelectorAll("#checkboxes input:checked")
.forEach(i=>selecionados.push(i.value));

db.collection("escalas").add({
data:dataEscala.value,
hora:horaEscala.value,
ministros:selecionados
});

listarEscalas();
}

// LISTAR ESCALAS
function listarEscalas(){

tabela.innerHTML="";

db.collection("escalas").get().then(snap=>{
snap.forEach(doc=>{
let e=doc.data();
let id=doc.id;

tabela.innerHTML += `
<tr>
<td>${e.data}</td>
<td>${e.hora}</td>
<td>${e.ministros.join(", ")}</td>
<td>
<button onclick="deletarEscala('${id}')">🗑</button>
</td>
</tr>
`;
});
});
}

function deletarEscala(id){
db.collection("escalas").doc(id).delete();
listarEscalas();
}

// INIT
carregarMinistros();
listarEscalas();
