alert("ADMIN JS CARREGADO");

/* ===========================
FUNÇÕES GLOBAIS
=========================== */

window.abrirTela = function(id){

document.querySelectorAll(".tela").forEach(t=>{
t.style.display = "none";
});

let tela = document.getElementById(id);

if(tela){
tela.style.display = "block";
}

};

window.salvarMinistro = function(){
alert("Salvar Ministro OK");
};

window.salvarEscala = function(){
alert("Salvar Escala OK");
};

window.gerarPDF = function(){
alert("PDF OK");
};

/* ===========================
INÍCIO
=========================== */
window.onload = function(){
abrirTela("dashboard");
};
