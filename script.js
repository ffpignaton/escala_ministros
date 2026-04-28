let ministros = JSON.parse(localStorage.getItem("ministros")) || [];
let escalas = JSON.parse(localStorage.getItem("escalas")) || [];

let hoje = new Date();
let mesAtual = hoje.getMonth();
let anoAtual = hoje.getFullYear();

function login(){
let u = document.getElementById("user").value;
let s = document.getElementById("pass").value;

if(u === "admin" && s === "saojorge"){
document.getElementById("loginBox").style.display = "none";
document.getElementById("painel").classList.remove("hidden");
carregarSelect();
}else{
alert("Usuário ou senha inválidos");
}
}

function salvarMinistro(){
let nome = document.getElementById("nome").value;
let fone = document.getElementById("fone").value;

if(nome=="") return alert("Digite o nome");

ministros.push({nome,fone});
localStorage.setItem("ministros", JSON.stringify(ministros));

document.getElementById("nome").value="";
document.getElementById("fone").value="";

carregarSelect();
alert("Ministro cadastrado!");
}

function carregarSelect(){
let select = document.getElementById("ministroEscala");
if(!select) return;

select.innerHTML="";

ministros.forEach(m=>{
select.innerHTML += `<option>${m.nome}</option>`;
});
}

function salvarEscala(){
let data = document.getElementById("dataEscala").value;
let hora = document.getElementById("horaEscala").value;
let ministro = document.getElementById("ministroEscala").value;

if(data=="" || hora=="") return alert("Preencha tudo");

escalas.push({data,hora,ministro});
localStorage.setItem("escalas", JSON.stringify(escalas));

alert("Escala salva!");
gerarCalendario();
}

function gerarCalendario(){

let nomesMeses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

let titulo = document.getElementById("mesAno");
let calendario = document.getElementById("calendario");

if(!titulo || !calendario) return;

titulo.innerText = nomesMeses[mesAtual] + " " + anoAtual;
calendario.innerHTML="";

let primeiroDia = new Date(anoAtual, mesAtual, 1).getDay();
let totalDias = new Date(anoAtual, mesAtual + 1, 0).getDate();

for(let i=0;i<primeiroDia;i++){
calendario.innerHTML += `<div></div>`;
}

for(let dia=1; dia<=totalDias; dia++){

let data = `${anoAtual}-${String(mesAtual+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;

let temEscala = escalas.some(e => e.data === data);

let classe = "dia";

if(temEscala) classe += " comEscala";

if(
dia===hoje.getDate() &&
mesAtual===hoje.getMonth() &&
anoAtual===hoje.getFullYear()
){
classe += " hoje";
}

calendario.innerHTML += `
<div class="${classe}" onclick="verDia('${data}')">
${dia}
</div>
`;
}
}

function verDia(data){

let box = document.getElementById("detalhesDia");
if(!box) return;

let lista = escalas.filter(e => e.data === data);

if(lista.length===0){
box.innerHTML = `<h3>${data}</h3>Nenhuma escala neste dia.`;
return;
}

lista.sort((a,b)=>a.hora.localeCompare(b.hora));

box.innerHTML = `<h3>${data}</h3>`;

lista.forEach(e=>{
box.innerHTML += `
<div class="itemEscala">
<strong>${e.hora}</strong> - ${e.ministro}
</div>
`;
});
}

function mesAnterior(){
mesAtual--;
if(mesAtual<0){
mesAtual=11;
anoAtual--;
}
gerarCalendario();
}

function proximoMes(){
mesAtual++;
if(mesAtual>11){
mesAtual=0;
anoAtual++;
}
gerarCalendario();
}

gerarCalendario();
