let hoje = new Date();
let mes = hoje.getMonth();
let ano = hoje.getFullYear();

/* =========================
FORMATA DATA BONITA
========================= */
function formatarDataCompleta(dataISO){

if(!dataISO) return "";

const data = new Date(dataISO + "T00:00:00");

return data.toLocaleDateString("pt-BR", {
weekday: "long",
day: "2-digit",
month: "long",
year: "numeric"
});

}

/* =========================
GERAR CALENDÁRIO
========================= */
function gerarCalendario(){

const titulo = document.getElementById("mesAno");
const calendario = document.getElementById("calendario");

titulo.innerText = new Date(ano, mes).toLocaleString(
'pt-BR',
{ month:'long', year:'numeric' }
);

calendario.innerHTML="";

let primeiroDia = new Date(ano,mes,1).getDay();
let totalDias = new Date(ano,mes+1,0).getDate();

for(let i=0;i<primeiroDia;i++){
calendario.innerHTML += `<div></div>`;
}

db.collection("escalas").get().then(snapshot=>{

let eventos=[];

snapshot.forEach(doc=>{
eventos.push(doc.data());
});

for(let dia=1; dia<=totalDias; dia++){

let data = `${ano}-${String(mes+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;

let eventosDoDia = eventos.filter(e => e.data === data);

calendario.innerHTML += `
<div class="day ${eventosDoDia.length ? 'has-event' : ''}" onclick="verDia('${data}')">
<div class="day-number">${dia}</div>
${eventosDoDia.length ? '<div class="dot"></div>' : ''}
</div>
`;

}

});

}

/* =========================
VER DIA (DETALHES)
========================= */
function verDia(data){

const box = document.getElementById("detalhesDia");

db.collection("escalas")
.where("data","==",data)
.get()
.then(snapshot=>{

box.innerHTML = `<h3>${formatarDataCompleta(data)}</h3>`;

if(snapshot.empty){
box.innerHTML += "Nenhuma escala neste dia.";
return;
}

snapshot.forEach(doc=>{

let e = doc.data();

box.innerHTML += `
<div class="itemEscala">
<strong>${e.hora}</strong><br>
${e.ministros.join(", ")}
</div>
`;

});

});

}

/* =========================
NAVEGAÇÃO
========================= */
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
gerarCalendario();
