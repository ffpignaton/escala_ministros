// Função para salvar ministros
function salvarMinistro(){
    let nome = document.getElementById("nome").value.trim();
    let fone = document.getElementById("fone").value.trim();
    let endereco = document.getElementById("endereco").value.trim();

    if(!nome){
        alert("Digite o nome.");
        return;
    }

    db.collection("ministros").add({
        nome: nome,
        fone: fone,
        endereco: endereco
    }).then(() => {
        document.getElementById("nome").value = "";
        document.getElementById("fone").value = "";
        document.getElementById("endereco").value = "";
        carregarMinistros();
        alert("Ministro salvo!");
    });
}

// Função para carregar os ministros
function carregarMinistros() {
    let lista = document.getElementById("listaMinistros");
    lista.innerHTML = "";

    db.collection("ministros").get().then(snapshot => {
        snapshot.forEach(doc => {
            let m = doc.data();

            lista.innerHTML += `
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><input type="checkbox" class="checkbox" data-id="${doc.id}"></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${m.nome}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${m.fone || ""}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${m.endereco || ""}</td>
            </tr>
            `;
        });
    });
}

// Função para deletar ministros selecionados
function deletarMinistrosSelecionados() {
    const checkboxes = document.querySelectorAll('.checkbox:checked');
    
    if (checkboxes.length === 0) {
        alert("Selecione pelo menos um ministro para deletar.");
        return;
    }

    checkboxes.forEach(checkbox => {
        const id = checkbox.getAttribute('data-id');
        db.collection("ministros").doc(id).delete()
            .then(() => {
                carregarMinistros();
                alert("Ministro(s) deletado(s) com sucesso!");
            })
            .catch(err => {
                console.error("Erro ao deletar ministro: ", err);
                alert("Ocorreu um erro ao tentar deletar o ministro.");
            });
    });
}

// Função para salvar escala
function salvarEscala(){
    let data = document.getElementById("dataEscala").value.trim();
    let hora = document.getElementById("horaEscala").value.trim();

    if(!data || !hora){
        alert("Preencha todos os campos.");
        return;
    }

    let ministrosSelecionados = []; // Aqui você vai pegar os ministros selecionados

    db.collection("escalas").add({
        data: data,
        hora: hora,
        ministros: ministrosSelecionados // Aqui você vai passar os ministros selecionados
    }).then(() => {
        listarEscalas();
        alert("Escala salva!");
    });
}

// Função para listar as escalas
function listarEscalas() {
    let lista = document.getElementById("listaEscalas");
    lista.innerHTML = "";

    db.collection("escalas").get()
    .then(snapshot => {
        snapshot.forEach(doc => {
            let e = doc.data();

            lista.innerHTML += `
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><input type="checkbox" class="checkbox" data-id="${doc.id}"></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${e.data}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${e.hora}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${e.ministros.join(", ")}</td>
            </tr>
            `;
        });
    });
}

// Função para deletar escalas selecionadas
function deletarEscalasSelecionadas() {
    const checkboxes = document.querySelectorAll('.checkbox:checked');
    
    if (checkboxes.length === 0) {
        alert("Selecione pelo menos uma escala para deletar.");
        return;
    }

    checkboxes.forEach(checkbox => {
        const id = checkbox.getAttribute('data-id');
        db.collection("escalas").doc(id).delete()
            .then(() => {
                listarEscalas();
                alert("Escala(s) deletada(s) com sucesso!");
            })
            .catch(err => {
                console.error("Erro ao deletar escala: ", err);
                alert("Ocorreu um erro ao tentar deletar a escala.");
            });
    });
}

// Chama a função para abrir a tela inicial
window.onload = function() {
    abrirTela("dashboard");
};
