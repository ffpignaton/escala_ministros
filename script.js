let ministros = JSON.parse(localStorage.getItem("ministros")) || [];
let escalas = JSON.parse(localStorage.getItem("escalas")) || [];

function login(){
    let user = document.getElementById("user").value;
    let pass = document.getElementById("pass").value;

    if(user === "admin" && pass === "saojorge"){
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("painel").classList.remove("hidden");
        atualizarMinistros();
        carregarSelect();
    }else{
        alert("Usuário ou senha inválidos!");
    }
}

function salvarMinistro(){
    let nome = document.getElementById("nome").value;
    let fone = document.getElementById("fone").value;

    if(nome === "") return alert("Digite o nome.");

    ministros.push({nome, fone});
    localStorage.setItem("ministros", JSON.stringify(ministros));

    document.getElementById("nome").value = "";
    document.getElementById("fone").value = "";

    atualizarMinistros();
    carregarSelect();
}

function atualizarMinistros(){
    let lista = document.getElementById("listaMinistros");
    lista.innerHTML = "";

    ministros.forEach((m,i)=>{
        lista.innerHTML += `<li>${m.nome} - ${m.fone}</li>`;
    });
}

function carregarSelect(){
    let select = document.getElementById("ministroEscala");
    select.innerHTML = "";

    ministros.forEach((m)=>{
        select.innerHTML += `<option value="${m.nome}">${m.nome}</option>`;
    });
}

function salvarEscala(){
    let data = document.getElementById("dataEscala").value;
    let hora = document.getElementById("horaEscala").value;
    let ministro = document.getElementById("ministroEscala").value;

    if(data==="" || hora==="") return alert("Preencha data e hora.");

    escalas.push({data,hora,ministro});
    localStorage.setItem("escalas", JSON.stringify(escalas));

    alert("Escala salva com sucesso!");
}

function verEscala(){
    let data = document.getElementById("verData").value;
    let resultado = document.getElementById("resultado");

    let lista = escalas.filter(e => e.data === data);

    if(lista.length === 0){
        resultado.innerHTML = "Nenhuma escala neste dia.";
        return;
    }

    resultado.innerHTML = "";

    lista.sort((a,b)=> a.hora.localeCompare(b.hora));

    lista.forEach(e=>{
        resultado.innerHTML += `
        <div class="itemEscala">
            <strong>${e.hora}</strong> - ${e.ministro}
        </div>`;
    });
}
