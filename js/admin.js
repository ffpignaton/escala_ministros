alert("ADMIN OK");

/* ===========================
ABRIR TELAS
=========================== */
window.abrirTela = function(id){

document.querySelectorAll(".tela").forEach(sec=>{
sec.classList.add("hidden");
});

const tela = document.getElementById(id);

if(tela){
tela.classList.remove("hidden");
}

/* carregar extras */
if(id==="ministros"){
document.getElementById("listaMinistros").innerHTML =
"<div class='card'>Tela Ministros funcionando</div>";
}

if(id==="escalas"){
document.getElementById("listaEscalasCards").innerHTML =
"<div class='card'>Tela Escalas funcionando</div>";
}

};

/* ===========================
BOTÕES
=========================== */
window.salvarMinistro = function(){
alert("Salvar Ministro");
};

window.salvarEscala = function(){
alert("Salvar Escala");
};

window.gerarPDF = function(){
alert("PDF funcionando");
};

window.salvarEdicao = function(){
alert("Salvar edição");
};

window.fecharModal = function(){
document.getElementById("modalEditar").style.display="none";
};

window.toggleMinistro = function(el){
el.classList.toggle("active");
};

window.mascaraTelefone = function(){};

/* ===========================
INÍCIO
=========================== */
window.onload = function(){
abrirTela("dashboard");
};
