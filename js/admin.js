alert("ADMIN FUNCIONANDO");

/* ABRIR TELA */
window.abrirTela = function(id){

document.querySelectorAll(".tela").forEach(t=>{
t.classList.add("hidden");
});

const tela = document.getElementById(id);

if(tela){
tela.classList.remove("hidden");
}

/* carregar conteúdos */
if(id==="ministros"){
carregarMinistros();
}

if(id==="escalas"){
carregarMinistrosEscala();
}

};

/* INICIO */
window.onload = function(){
abrirTela("dashboard");
};

/* ===================
MINISTROS
=================== */
function carregarMinistros(){

document.getElementById("listaMinistros").innerHTML = `
<div class="card">
Cadastro de ministros funcionando.
</div>
`;

}

/* ===================
ESCALAS
=================== */
function carregarMinistrosEscala(){

document.getElementById("listaEscalasCards").innerHTML = `
<div class="card">
Tela escalas funcionando.
</div>
`;

}

/* BOTÕES */
window.salvarMinistro = function(){
alert("Salvar ministro OK");
};

window.salvarEscala = function(){
alert("Salvar escala OK");
};

window.gerarPDF = function(){
alert("PDF OK");
};
