// Variáveis importantes pro funcionamento dos polígonos
var salaSendoEditada = null;
var listaDeSalas = []; 
var poligonoPreview = null;

// 1. Configura o Leaflet uma ÚNICA VEZ para usar o modo de planta baixa (Eixos X e Y)
var map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -2,  
    maxZoom: 2,   
    attributionControl: false
});

window.addEventListener('load', function () {
    setTimeout(function () {
        map.invalidateSize();
    }, 200);
});

// 2. Define o tamanho da área de desenho do mapa [Altura (Y), Largura (X)]
var limitesMapa = [[0, 0], [1000, 1000]];

// 3. Carrega a sua imagem da escola dentro dos limites
var minhaEscola = L.imageOverlay(
    'IF.jpeg?' + Date.now(),
    limitesMapa
).addTo(map);

// 4. Trava a navegação apenas nas extremidades da sua imagem
map.fitBounds(limitesMapa);
map.setMaxBounds(limitesMapa);

var popupClique = L.popup();

        // esconder texto com o zoom
        map.on('zoomend', function() {
        var zoomAtual = map.getZoom();
        var tooltips = document.querySelectorAll('.texto-sala');
        
        tooltips.forEach(function(tooltip) {
            // Se o zoom for menor que -1 (muito longe), esconde o texto para não poluir
            if (zoomAtual < -1 ) {
                tooltip.style.display = 'none';
            } else {
                tooltip.style.display = 'block';
            }
        });
    });

        // Ativa o escutador de cliques no mapa
        map.on('click', exibirSala);
        /* 
        // Sala na parte de cima centralizada
        L.marker([800, 450]).addTo(map)
            .bindPopup("<b>Biblioteca / Setor Pedagógico</b>");
        var salaSecretaria = L.marker([420, 157]).addTo(map)
        .bindPopup("<b>Secretaria do IF</b><br>Horário: 08h às 18h.");
        */

        function reset(){
            if (typeof map !== 'undefined' && map) {
                map.setView([500, 500], -2);
            }
            
            var divConteudo = document.getElementById('conteudo-sala');
            if (divConteudo) {
                divConteudo.innerHTML = '<p style="color: #777;">Clique em um botão acima ou em um ponto no mapa para ver os detalhes da sala aqui.</p>';
            }
            
            // CORREÇÃO: Só tenta mexer na aba de edição do Admin se ela de fato existir
            var msgSelecione = document.getElementById('mensagem-selecione-editar');
            if (msgSelecione) {
                msgSelecione.style.display = 'flex';
            }
            var formEdicao = document.getElementById('formulario-edicao');
            if (formEdicao) {
                formEdicao.style.display = 'none';
            }
        }

        function irParaSala(y, x, nomedasala, infosala) {
    map.setView([y, x], 1.2);
    
    var divConteudo = document.getElementById('conteudo-sala');

    divConteudo.innerHTML = `
    <h2 style="color: #2c3e50; margin-top: 0;">${nomedasala}</h2>
    <p style="background: #fff; padding: 10px; border-radius: 5px; border: 1px solid #ddd;">
        ${infosala}
    </p>
    
    <!-- LISTA DE HORÁRIOS JÁ RESERVADOS -->
    <div style="margin-top: 15px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 8px 0; color: #2c3e50;">Horários já reservados:</h4>
        <div id="lista-agendados" style="max-height: 120px; overflow-y: auto; background: #fff; border: 1px solid #ddd; border-radius: 5px; padding: 8px; font-size: 13px;">
            <!-- Preenchido dinamicamente -->
        </div>
    </div>
    
    <!-- FORMULÁRIO DE RESERVA -->
    <div style="background: #eef2f3; padding: 15px; border-radius: 8px; border: 1px solid #d1d8e0; margin-top: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #4b6584;">Reservar este espaço:</h4>
        
        <input type="hidden" id="sala-reserva" value="${nomedasala}">
        
        <label style="display:block; font-size:12px; margin-bottom:4px;">Seu Nome:</label>
        <input type="text" id="nome-usuario" placeholder="Digite seu nome" style="width: stretch; padding:6px; margin-bottom:10px; border:1px solid #ccc; border-radius:4px;">
        
        <label style="display:block; font-size:12px; margin-bottom:4px;">Data:</label>
        <input type="date" id="data-reserva" style="width: stretch; padding:6px; margin-bottom:10px; border:1px solid #ccc; border-radius:4px;">
        
        <label style="display:block; font-size:12px; margin-bottom:4px;">Horário de início:</label>
        <input type="time" id="hora-reserva-ini" style="width: stretch; padding:6px; margin-bottom:15px; border:1px solid #ccc; border-radius:4px;">
        
        <label style="display:block; font-size:12px; margin-bottom:4px;">Horário de Término:</label>
        <input type="time" id="hora-reserva-fim" style="width: stretch; padding:6px; margin-bottom:15px; border:1px solid #ccc; border-radius:4px;">
        
        <button onclick="confirmarAgendamento()" style="width: stretch; padding:10px; background:#198754; color:white; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">
            Confirmar Reserva
        </button>
    </div>
    `;

    configurarLimitesCalendario();

    // Busca as reservas unificadas do banco de dados
    fetch('listar_reservas.php')
        .then(res => res.json())
        .then(lista => {
            const container = document.getElementById('lista-agendados');
            if (container) {
                // Filtra usando o nome do campo correto unificado do banco ('item')
                const reservasDaSala = lista.filter(r => r.item === nomedasala && r.status === 'Confirmada');
                
                // Exibe as informações mapeando para 'solicitante'
                container.innerHTML = reservasDaSala.length > 0 
                    ? reservasDaSala.map(r => `<li>📅 ${r.data_reserva}: <b>${r.hora_inicio.substring(0,5)}</b> às <b>${r.hora_fim.substring(0,5)}</b> | Por: <i>${r.solicitante}</i></li>`).join('')
                    : '<li>Nenhum horário reservado para hoje.</li>';
            }
        })
        .catch(err => {
            console.error("Erro ao listar reservas da sala lateral:", err);
            const container = document.getElementById('lista-agendados');
            if (container) {
                container.innerHTML = '<li style="color: red;">Erro ao carregar os horários.</li>';
            }
        });
}
        
        function confirmarAgendamento() {
    // 1. Coleta os dados dos campos do formulário
    var sala = document.getElementById('sala-reserva').value;
    var nome = document.getElementById('nome-usuario').value;
    var data = document.getElementById('data-reserva').value;
    var horaIni = document.getElementById('hora-reserva-ini').value;
    var horaFim = document.getElementById('hora-reserva-fim').value;

    // 2. Validação básica (Campos em branco)
    if (!sala || !nome || !data || !horaIni || !horaFim) {
        alert("Por favor, preencha todos os campos da reserva.");
        return;
    }

    // 3. TRATAMENTO DE HORÁRIO (O SEGREDO ESTÁ AQUI)
    // Pega o horário do banco. Se não existir (salas antigas), assume 00:00 às 23:59.
    // O .substring(0, 5) corta os segundos do MySQL ("08:00:00" vira "08:00").
    var horaAbertura = (salaSendoEditada.dadosSala.horaAbertura || "00:00").substring(0, 5);
    var horaFechamento = (salaSendoEditada.dadosSala.horaFechamento || "23:59").substring(0, 5);

    // Debug: Aperte F12 no navegador e olhe o Console para ver se os horários bateram
    console.log(`Reserva solicitada: ${horaIni} às ${horaFim}. Limites da sala: ${horaAbertura} às ${horaFechamento}`);

    // 4. Validação de Limites
    if (horaIni < horaAbertura || horaFim > horaFechamento) {
        alert(`⚠️ Horário fora do limite! Esta sala funciona das ${horaAbertura} às ${horaFechamento}.`);
        return; // O return interrompe a execução, impedindo que o fetch (reserva) aconteça
    }

    if (horaIni >= horaFim) {
        alert("⚠️ O horário de término da reserva deve ser posterior ao horário de início.");
        return;
    }

    // 5. Prepara o pacote (JSON) para enviar ao arquivo PHP
    var pacoteReserva = {
        sala_id: salaSendoEditada.dadosSala.idBanco,
        nome_usuario: nome,
        data_reserva: data,
        hora_inicio: horaIni,
        hora_fim: horaFim
    };

    // 6. Envia para o banco de dados
    fetch('reservar_sala.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pacoteReserva)
    })
    .then(res => res.json())
    .then(retorno => {
        if (retorno.status === "sucesso") {
            alert("✅ Reserva confirmada no banco de dados!");
            
            // Limpa o formulário
            document.getElementById('nome-usuario').value = "";
            document.getElementById('data-reserva').value = "";
            document.getElementById('hora-reserva-ini').value = "";
            document.getElementById('hora-reserva-fim').value = "";
            
            // Atualiza as tabelas na tela
            if(typeof renderizarTabelaGerenciamento === 'function') {
                renderizarTabelaGerenciamento();
            }
            // Atualiza a listagem de horários dentro do painel da sala
            irParaSala(salaSendoEditada.dadosSala.yFoco, salaSendoEditada.dadosSala.xFoco, salaSendoEditada.dadosSala.nome, salaSendoEditada.dadosSala.descricao);
        } else {
            alert("⚠️ Erro ao salvar reserva: " + retorno.mensagem);
        }
    })
    .catch(err => {
        console.error(err);
        alert("❌ Erro de conexão com o servidor ao salvar reserva.");
    });
}
        
        function configurarLimitesCalendario() {
            var inputData = document.getElementById('data-reserva'); // Usando a sua ID
            if (!inputData) return;

            var hoje = new Date();
            
            // Formata a data de hoje para o padrão do input (AAAA-MM-DD)
            var ano = hoje.getFullYear();
            var mes = String(hoje.getMonth() + 1).padStart(2, '0');
            var dia = String(hoje.getDate()).padStart(2, '0');
            var dataMinima = `${ano}-${mes}-${dia}`;

            // Calcula a data máxima (Daqui a 3 meses)
            var dataMaximaObjeto = new Date();
            dataMaximaObjeto.setMonth(dataMaximaObjeto.getMonth() + 3);
            
            var anoMax = dataMaximaObjeto.getFullYear();
            var mesMax = String(dataMaximaObjeto.getMonth() + 1).padStart(2, '0');
            var diaMax = String(dataMaximaObjeto.getDate()).padStart(2, '0');
            var dataMaxima = `${anoMax}-${mesMax}-${diaMax}`;

            // Aplica as travas no seu input
            inputData.min = dataMinima;
            inputData.max = dataMaxima;
        }

        //parte de polignos e gerenciamento
        function adicionarNovaSala(cantos, nome, descricao, yFoco, xFoco,tamanhoX, tamanhoY) {
    
            let novaSala = L.polygon(cantos, {
                color: 'black',        // Cor das linhas da parede
                weight: 1,             // Espessura da linha
                fillColor: 'grey',     // Cor interna da sala
                fillOpacity: 1.0       // O Leaflet aceita no máximo 1.0 para opacidade total
            }).addTo(map);

            novaSala.dadosSala = {
                nome: nome,
                descricao: descricao,
                yFoco: yFoco,
                xFoco: xFoco,
                tamanhoX: tamanhoX ,
                tamanhoY: tamanhoY
            };
            // 2. Adiciona o balãozinho (Popup) ao clicar na sala
            novaSala.bindPopup(`<b>${nome}</b>`);

            novaSala.bindTooltip(nome, {
            permanent: true,   // Garante que o texto fique sempre visível, sem precisar passar o mouse
            direction: 'center', // Centraliza o texto no meio do polígono
            className: 'texto-sala' // Classe CSS para podermos estilizar o texto depois
        }).openTooltip();

            // 3. Ativa o evento de clique para abrir o seu painel de reservas lateral
            novaSala.on('click', function(e) {
                L.DomEvent.stopPropagation(e);
                irParaSala(yFoco, xFoco, nome, descricao);
                setTimeout(function() {
                    carregarSalaParaEdicao(novaSala);
                }, 10);
            });

                //adiciona os botoes na lista ao lado
                var containerBotoes = document.getElementById('botoes-salas-container');
                
                // Se por acaso não achar pelo estilo, criamos uma ID para garantir 
                if (!containerBotoes) {
                    containerBotoes = document.getElementById('botoes-salas-container');
                }

                if (containerBotoes) {
                    var avisoVazio = document.getElementById('aviso-vazio');
                    if (avisoVazio) {
                        avisoVazio.remove(); // Remove o texto "Nenhuma sala criada..."
                    }
                    // 2. Cria o elemento do botão
                    var novoBotao = document.createElement('button');
                    novoBotao.innerText = nome; // Define o nome digitado como texto do botão
                    novaSala.botaoMenu = novoBotao;

                    // 3. Configura a ação de clique do botão (Botão -> Mapa/Painel)
                    novoBotao.onclick = function() {
                        // Quando clicar no botão, ele dá o zoom na sala e abre os detalhes dela
                        map.fitBounds(novaSala.getBounds());
                        irParaSala(yFoco, xFoco, nome, descricao);
                        carregarSalaParaEdicao(novaSala);
                    };

                    // 4. Adiciona o botão criado dentro da lista lateral
                    containerBotoes.appendChild(novoBotao);
                }

                novoBotao.className = 'botao-customizado';

            listaDeSalas.push(novaSala);
            // Opcional: retorna o objeto da sala caso precise interagir com ele depois
            return novaSala;
        }
        
       function exibirSala(e) {
            var latlng = e.latlng;
            var y = Math.round(latlng.lat); // Centro do clique (Y)
            var x = Math.round(latlng.lng); // Centro do clique (X)
            
            // CORREÇÃO: Pega os dados do formulário lateral de criação de salas (Modo Admin)
            var inputNome = document.getElementById('nome-sala');
            var inputDesc = document.getElementById('nova-info-sala');
            var inputX = document.getElementById('novo-tamanho-x');
            var inputY = document.getElementById('novo-tamanho-y');
            
            // Se não existirem esses inputs, significa que estamos na tela do Professor (ele apenas visualiza/reserva)
            if (!inputNome) {
                popupClique
                    .setLatLng(latlng)
                    .setContent("Coordenada selecionada: <b>[" + y + ", " + x + "]</b>")
                    .openOn(map);
                return;
            }

            var nome = inputNome.value;
            var descricao = inputDesc.value || "Sem descrição disponível.";
            var tamanhoSelecionadoX = inputX.value;
            var tamanhoSelecionadoY = inputY.value;
            
            var horaAbertura = document.getElementById('hora-reserva-ini').value || "08:00";
            var horaFechamento = document.getElementById('hora-reserva-fim').value || "18:00";
            
            // Se o usuário digitou um nome, significa que quer criar uma sala onde clicou (Apenas Admin)
            if (nome.trim() !== "") {
                let TamanhoX = parseInt(tamanhoSelecionadoX) || 20; 
                let TamanhoY = parseInt(tamanhoSelecionadoY) || 20;

                let cantosCalculados = [
                    [y + TamanhoY, x - TamanhoX], 
                    [y + TamanhoY, x + TamanhoX], 
                    [y - TamanhoY, x + TamanhoX], 
                    [y - TamanhoY, x - TamanhoX]  
                ];

                let limitesNovoPoligono = L.polygon(cantosCalculados).getBounds();
                let houveColisao = false;

                for (let i = 0; i < listaDeSalas.length; i++) {
                    let limitesSalaExistente = listaDeSalas[i].getBounds();
                    if (limitesNovoPoligono.intersects(limitesSalaExistente)) {
                        houveColisao = true;
                        break; 
                    }
                }

                if (houveColisao) {
                    alert("Erro: Você não pode criar uma sala por cima de outra já existente!");
                    return; 
                }

                if (horaFechamento <= horaAbertura) {
                    alert("Erro: O horário de fechamento da sala deve ser maior que o de abertura!");
                    return;
                }

                var descricaoFormatada = `<b>Funcionamento:</b> das ${horaAbertura} às ${horaFechamento}<br><br>${descricao}`;

                let salaCriada = adicionarNovaSala(cantosCalculados, nome, descricaoFormatada, y, x, TamanhoX, TamanhoY);
                salaCriada.dadosSala.horaAbertura = horaAbertura;
                salaCriada.dadosSala.horaFechamento = horaFechamento;
                salaCriada.dadosSala.descricaoLimpa = descricao;
                
                salaSendoEditada = salaCriada;
                removerPreview();

                var pacoteParaBanco = {
                    nome: nome,
                    descricao: descricaoFormatada, 
                    centro_y: y,                   
                    centro_x: x,                   
                    tamanho_x: TamanhoX,
                    tamanho_y: TamanhoY,
                    hora_abertura: horaAbertura,
                    hora_fechamento: horaFechamento
                };

                fetch('salvar_sala.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(pacoteParaBanco)
                })
                .then(res => res.json())
                .then(retorno => {
                    if (retorno.status === "sucesso") {
                        salaCriada.dadosSala.idBanco = retorno.id_banco || Date.now();
                        alert(`✅ Sala "${nome}" salva com sucesso no banco de dados!`);
                    } else {
                        let textoErro = retorno.mensagem || retorno.erro || JSON.stringify(retorno);
                        alert("⚠️ Erro ao salvar no MySQL:\n\n" + textoErro);
                    }
                })
                .catch(err => {
                    console.error(err);
                    alert("❌ Erro de comunicação ao tentar salvar a sala.");
                });

                inputNome.value = "";
                inputDesc.value = "";
                inputX.value = "";
                inputY.value = "";
                
            } else {
                popupClique
                    .setLatLng(latlng)
                    .setContent("Coordenada livre:<br><b>[" + y + ", " + x + "]</b><br><small>Preencha o formulário para criar uma sala aqui.</small>")
                    .openOn(map);
            }
        }
        
        // Atualiza a posição do polígono com base no movimento do mouse
        map.on('mousemove', function(e) {
    var latlng = e.latlng;
    var y = Math.round(latlng.lat);
    var x = Math.round(latlng.lng);

    // CORREÇÃO: Se o input de nome de sala não existe (tela do Professor),
    // cancela o preview para evitar erros de leitura.
    var inputNome = document.getElementById('nome-sala');
    if (!inputNome) return;

    var nome = inputNome.value;
    var tamanhoSelecionadoX = document.getElementById('novo-tamanho-x').value;
    var tamanhoSelecionadoY = document.getElementById('novo-tamanho-y').value;

    if (nome.trim() !== "") {
        let TamanhoX = parseInt(tamanhoSelecionadoX) || 20; 
        let TamanhoY = parseInt(tamanhoSelecionadoY) || 20;

        let cantosPreview = [
            [y + TamanhoY, x - TamanhoX], 
            [y + TamanhoY, x + TamanhoX], 
            [y - TamanhoY, x + TamanhoX], 
            [y - TamanhoY, x - TamanhoX]  
        ];

        if (!poligonoPreview) {
            poligonoPreview = L.polygon(cantosPreview, {
                color: '#20bf6b',      
                weight: 2,
                dashArray: '5, 5',     
                fillColor: '#20bf6b',
                fillOpacity: 0.3,      
                interactive: false     
            }).addTo(map);
        } else {
            poligonoPreview.setLatLngs(cantosPreview);
        }
    } else {
        removerPreview();
    }
});

        // Remove o preview se o mouse sair da área do mapa
        map.on('mouseout', function() {
            removerPreview();
        });

        // Função auxiliar para limpar o preview com segurança
        function removerPreview() {
            if (poligonoPreview) {
                map.removeLayer(poligonoPreview);
                poligonoPreview = null;
            }
        }
        function mostrarSenha(){

            let senha = document.getElementById("senha");
            let olho = document.querySelector(".senha i");

            if(senha.type === "password"){

                senha.type = "text";
                olho.classList.remove("fa-eye");
                olho.classList.add("fa-eye-slash");

            }else{

                senha.type = "password";
                olho.classList.remove("fa-eye-slash");
                olho.classList.add("fa-eye");

            }

        }
        
        function carregarSalaParaEdicao(poligonoSala) {
            salaSendoEditada = poligonoSala; // Salva a referência global da sala atual

            var msgSelecione = document.getElementById('mensagem-selecione-editar');
            var formEdicao = document.getElementById('formulario-edicao');

            if (!msgSelecione || !formEdicao) {
                return; 
            }

            // Mostra o formulário e esconde a mensagem de aviso (Apenas Admin)
            msgSelecione.style.display = 'none';
            formEdicao.style.display = 'block';

            // Joga os valores atuais nos inputs de edição (Apenas Admin)
            var inputNome = document.getElementById('editar-nome-sala');
            if (inputNome) inputNome.value = poligonoSala.dadosSala.nome;
            
            var inputInfo = document.getElementById('editar-info-sala');
            if (inputInfo) inputInfo.value = poligonoSala.dadosSala.descricaoLimpa || "";
            
            var inputAbertura = document.getElementById('editar-hora-abertura');
            if (inputAbertura) inputAbertura.value = poligonoSala.dadosSala.horaAbertura || "08:00";
            
            var inputFechamento = document.getElementById('editar-hora-fechamento');
            if (inputFechamento) inputFechamento.value = poligonoSala.dadosSala.horaFechamento || "18:00";
            
            var inputX = document.getElementById('editar-tamanho-x');
            if (inputX) inputX.value = poligonoSala.dadosSala.tamanhoX;
            
            var inputY = document.getElementById('editar-tamanho-y');
            if (inputY) inputY.value = poligonoSala.dadosSala.tamanhoY;
        }

        //Aplica as alterações geométricas e textuais no mapa
       function salvarEdicaoSala() {
    if (!salaSendoEditada) return;

    var novoNome = document.getElementById('editar-nome-sala').value;
    var textoInfo = document.getElementById('editar-info-sala').value;
    var novoX = parseInt(document.getElementById('editar-tamanho-x').value) || 20;
    var novoY = parseInt(document.getElementById('editar-tamanho-y').value) || 20;
    var horaAbertura = document.getElementById('editar-hora-abertura').value || "08:00";
    var horaFechamento = document.getElementById('editar-hora-fechamento').value || "18:00";

    if (novoNome.trim() === "") {
        alert("O nome da sala não pode ficar vazio!");
        return;
    }

    if (horaFechamento <= horaAbertura) {
        alert("Erro: O horário de fechamento deve ser maior que o horário de abertura!");
        return;
    }

    var novaDescExibicao = `<b>Funcionamento:</b> das ${horaAbertura} às ${horaFechamento}<br><br>${textoInfo}`;
    var y = salaSendoEditada.dadosSala.yFoco;
    var x = salaSendoEditada.dadosSala.xFoco;
    var idBanco = salaSendoEditada.dadosSala.idBanco; // Pega o ID real do MySQL

    // Prepara o pacote para enviar ao PHP
    let pacoteParaBanco = {
        id: idBanco,
        nome: novoNome,
        descricao: novaDescExibicao,
        centro_y: y,
        centro_x: x,
        tamanho_x: novoX,
        tamanho_y: novoY,
        hora_abertura: horaAbertura,
        hora_fechamento: horaFechamento
    };

    // 1. Envia a edição para o MySQL primeiro
    fetch('editar_sala.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pacoteParaBanco)
    })
    .then(res => res.json())
    .then(retorno => {
        if (retorno.status === "sucesso") {
            // 2. Se o banco salvou, atualizamos o mapa visualmente!
            let novosCantos = [
                [y + novoY, x - novoX],
                [y + novoY, x + novoX],
                [y - novoY, x + novoX],
                [y - novoY, x - novoX]
            ];

            salaSendoEditada.setLatLngs(novosCantos);
            salaSendoEditada.dadosSala.nome = novoNome;
            salaSendoEditada.dadosSala.descricao = novaDescExibicao; 
            salaSendoEditada.dadosSala.descricaoLimpa = textoInfo;  
            salaSendoEditada.dadosSala.tamanhoX = novoX;
            salaSendoEditada.dadosSala.tamanhoY = novoY;
            salaSendoEditada.dadosSala.horaAbertura = horaAbertura;
            salaSendoEditada.dadosSala.horaFechamento = horaFechamento;

            salaSendoEditada.setPopupContent(`<b>${novoNome}</b>`);
            salaSendoEditada.setTooltipContent(novoNome);

            if (salaSendoEditada.botaoMenu) {
                salaSendoEditada.botaoMenu.innerText = novoNome;
            }

            irParaSala(y, x, novoNome, novaDescExibicao);
            alert("✅ Sala atualizada com sucesso no mapa e no banco de dados!");
        } else {
            alert("⚠️ Erro ao atualizar no MySQL:\n" + retorno.mensagem);
        }
    })
    .catch(err => {
        console.error(err);
        alert("❌ Erro de comunicação com o servidor ao editar a sala.");
    });
        }
        
        function apagarSala(){
    if (!salaSendoEditada) {
        alert("Nenhuma sala selecionada para exclusão.");
        return;
    }

    var nomeSala = salaSendoEditada.dadosSala.nome;
    var idBanco = salaSendoEditada.dadosSala.idBanco; // ID real da tabela

    var confirmar = confirm(`Tem certeza que deseja apagar a sala "${nomeSala}" permanentemente do banco de dados?`);
    
    if (confirmar) {
        // 1. Pede ao MySQL para apagar a sala primeiro
        fetch('excluir_sala.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: idBanco })
        })
        .then(res => res.json())
        .then(retorno => {
            if (retorno.status === "sucesso") {
                // 2. Se apagou no banco, removemos do mapa do Leaflet
                map.removeLayer(salaSendoEditada);

                if (salaSendoEditada.botaoMenu) {
                    salaSendoEditada.botaoMenu.remove();
                }

                var index = listaDeSalas.indexOf(salaSendoEditada);
                if (index > -1) {
                    listaDeSalas.splice(index, 1);
                }

                salaSendoEditada = null; 
                document.getElementById('formulario-edicao').style.display = 'none';
                document.getElementById('mensagem-selecione-editar').style.display = 'flex';

                var containerBotoes = document.getElementById('botoes-salas-container');
                if (containerBotoes && containerBotoes.getElementsByTagName('button').length === 0) {
                    if (!document.getElementById('aviso-vazio')) {
                        var pAviso = document.createElement('p');
                        pAviso.id = 'aviso-vazio';
                        pAviso.innerText = 'Nenhuma sala criada. Clique no mapa para começar!';
                        pAviso.style.cssText = 'color: #777; font-style: italic; font-size: 14px; margin: 5px 0; text-align: center;';
                        containerBotoes.appendChild(pAviso);
                    }
                }
                reset();
                alert(`✅ Sala "${nomeSala}" removida com sucesso!`);
            } else {
                alert("⚠️ Erro ao excluir no MySQL:\n" + retorno.mensagem);
            }
        })
        .catch(err => {
            console.error(err);
            alert("❌ Erro de comunicação com o servidor ao excluir a sala.");
        });
    }
        }
        
         function editar(){
            var conteinerEditar = document.getElementById('editar-sala-container');
            
            if (conteinerEditar.style.display === "none" || conteinerEditar.style.display === "") {
                conteinerEditar.style.display = "flex";
                document.getElementById('formulario-edicao').style.display = "none";
                document.getElementById('nova-sala').style.display = "none";
            } else {
                conteinerEditar.style.display = "none";
                document.getElementById('nova-sala').style.display = "flex";
            }
            reset();
        }

        function criar(){
            var estadodenova =  document.getElementById('nova-sala').style.display;
             if (estadodenova == "none"){ 
                
                document.getElementById('formulario-edicao').style.display = "flex";
                document.getElementById('editar-sala-container').style.display = "none";
                document.getElementById('nova-sala').style.display = "flex";
             }
             reset();
        }


      function gerensala() {
    // 1. Garante que a tela de gerenciamento de cards (Salas / Equipamentos) seja escondida
    var divGerencia = document.getElementById('gerencia');
    if (divGerencia) {
        divGerencia.style.display = "none";
    }

    // 2. Garante que a tela de Equipamentos seja escondida
    var divEquipamentos = document.getElementById('equipamentos');
    if (divEquipamentos) {
        divEquipamentos.style.display = "none";
    }
    
    // 3. Mostra a seção de salas
    var divSalas = document.getElementById('salas');
    if (divSalas) {
        divSalas.style.display = "block";
    }

    // 4. Garante que o mapa seja exibido e a tabela de histórico (se houver) fique escondida por padrão
    var mapaSalas = document.getElementById('tela-mapa-salas');
    if (mapaSalas) {
        mapaSalas.style.display = "grid"; 
    }
    
    var tabelaReservas = document.getElementById('tela-tabela-reservas');
    if (tabelaReservas) {
        tabelaReservas.style.display = "none";
    }
    
    // 5. Atualiza o botão de alternar visualização se ele existir
    var btnAlternar = document.getElementById('btn-alternar-reservas');
    if (btnAlternar) {
        btnAlternar.innerHTML = "📜 Histórico de Reservas";
        btnAlternar.style.background = "#2980b9";
    }

    // 6. Força o Leaflet a recalcular o tamanho do mapa para evitar bugs visuais de cinza
    setTimeout(() => {
        if (typeof map !== 'undefined' && map) {
            map.invalidateSize();
            if (typeof limitesMapa !== 'undefined') {
                map.fitBounds(limitesMapa);
            }
        }
    }, 200);
}
        function gerenequi(){
            document.getElementById('gerencia').style.display = "none";
            document.getElementById('equipamentos').style.display = "flex";

        }
         
        function abrirTelaReservas() {
    document.getElementById('gerencia').style.display = "none";
    document.getElementById('equipamentos').style.display = "none";
    document.getElementById('salas').style.display = "block";

    // Reseta o estado interno: ESCONDE O MAPA, MOSTRA A TABELA
    document.getElementById('tela-mapa-salas').style.display = "none";
    document.getElementById('tela-tabela-reservas').style.display = "block";
    
    // Troca o botão para o modo "Voltar ao Mapa"
    var btnAlternar = document.getElementById('btn-alternar-reservas');
    if (btnAlternar) {
        btnAlternar.innerHTML = "🗺️ Voltar ao Mapa";
        btnAlternar.style.background = "#27ae60";
    }

    renderizarTabelaGerenciamento();
}

        function gerenReservas() {

            document.getElementById("gerencia").style.display = "none";
            document.getElementById("salas").style.display = "none";
            document.getElementById("equipamentos").style.display = "none";

            document.getElementById("tela-tabela-reservas").style.display = "flex";

            renderizarTabelaGerenciamento("Todos");
        }

        function voltar(){
            document.getElementById('gerencia').style.display = "flex"; 
            document.getElementById('salas').style.display = "none";
            document.getElementById('equipamentos').style.display = "none";
            reset();
        }

        function abrirCadastro(){
            document.getElementById("modalCadastro").style.display="flex";
        }

        window.onclick=function(event){

            let modal=document.getElementById("modalCadastro");

            if(event.target==modal){
                modal.style.display="none";
            }

        }
            const autoAprovacao = document.getElementById("autoAprovacao");

            if(autoAprovacao){

                autoAprovacao.addEventListener("change", function(){

                    fetch("alterarConfiguracao.php",{

                        method:"POST",

                        headers:{
                            "Content-Type":"application/x-www-form-urlencoded"
                        },

                        body:"valor=" + (this.checked ? 1 : 0)

                    });

                });

            }
       

        function excluirEquipamento(id){

            if(confirm("Deseja realmente excluir este equipamento?")){

                window.location.href = "excluirEquipamento.php?id=" + id;

            }

        }
        function abrirReserva(id, nome){

            document.getElementById("modalReserva").style.display="flex";

            document.getElementById("idEquip").value=id;

            document.getElementById("nomeEquip").value=nome;

        }

        function fecharReserva(){

            document.getElementById("modalReserva").style.display="none";

        }

        window.onclick=function(e){

            let modal=document.getElementById("modalReserva");

            if(e.target==modal){

                fecharReserva();

            }

        }
        function fecharReserva(){
            document.getElementById("modalReserva").style.display = "none";
        }

        function fecharCadastro(){
            document.getElementById("modalCadastro").style.display = "none";
        }
    /* exemplo de criação de poligno manual  
        let cantosDaSala = [
            [700, 200], // Canto Superior Esquerdo
            [700, 300], // Canto Superior Direito
            [600, 300], // Canto Inferior Direito
            [600, 200]  // Canto Inferior Esquerdo
        ];

        let novaSala = L.polygon(cantosDaSala, {
            color: 'black',         // Cor das linhas da parede
            weight: 1,            // Espessura da linha
            fillColor: 'grey', // Cor interna da sala
            fillOpacity: 1      // Opacidade do fundo
        }).addTo(map);

        novaSala.bindPopup("<b>Nova Sala de Reuniões</b>");

        novaSala.on('click', function(e) {
                L.DomEvent.stopPropagation(e);
        
                irParaSala(650, 250, "Sala de Reuniões", "descricao");
            });

        novaSala.bindTooltip("nova sala de reunioes", {
                permanent: true,   // Garante que o texto fique sempre visível, sem precisar passar o mouse
                direction: 'center', // Centraliza o texto no meio do polígono
                className: 'texto-sala' // Classe CSS para podermos estilizar o texto depois
            }).openTooltip();
       */

function carregarReservasGlobais() {
        fetch('listar_reservas.php')
            .then(res => res.json())
            .then(lista => {
                // Aqui você seleciona onde quer que a lista apareça
                // Exemplo: um container geral ou um painel de "Reservas do Dia"
                const containerGeral = document.getElementById('painel-reservas-geral');
                
                if (!containerGeral) return;

                let html = '<h3>Agenda Atualizada</h3><ul>';
                
                // Filtra apenas o que está confirmado
                const confirmadas = lista.filter(r => r.status === 'Confirmada');
                
                confirmadas.forEach(r => {
                    html += `<li><b>${r.nome_sala}</b>: ${r.data_reserva} às ${r.hora_inicio.substring(0,5)}</li>`;
                });
                
                html += '</ul>';
                containerGeral.innerHTML = html;
            });
        }
    
        function alternarTelaReservas() {
            var telaMapa = document.getElementById('tela-mapa-salas');
            var telaTabela = document.getElementById('tela-tabela-reservas');
            var btnAlternar = document.getElementById('btn-alternar-reservas');

            if (telaTabela.style.display === "none" || telaTabela.style.display === "") {
                // Esconde o mapa e mostra a tabela
                telaMapa.style.display = "none";
                telaTabela.style.display = "block";
                btnAlternar.innerHTML = "🗺️ Voltar ao Mapa";
                btnAlternar.style.background = "#27ae60";
                
                // Carrega os dados na tabela unificada de histórico de reservas
                if (typeof renderizarTabelaGerenciamento === 'function') {
                    renderizarTabelaGerenciamento();
                }
            
            } else {
                // Esconde a tabela e volta pro mapa
                telaTabela.style.display = "none";
                telaMapa.style.display = "grid"; 
                btnAlternar.innerHTML = "📜 Histórico de Reservas";
                btnAlternar.style.background = "#2980b9";
                
                // Força o Leaflet a recalcular as dimensões geométricas do mapa
                setTimeout(function() {
                    if (typeof map !== 'undefined' && map) {
                        map.invalidateSize();
                    }
                }, 50);
            }

            // Recarrega de forma segura a listagem dinâmica da barra lateral da sala atualmente aberta
            if (salaSendoEditada && salaSendoEditada.dadosSala) {
                fetch('listar_reservas.php')
                    .then(res => res.json())
                    .then(lista => {
                        const reservasDaSala = lista.filter(r => 
                            r.item === salaSendoEditada.dadosSala.nome && 
                            r.status === 'Confirmada'
                        );
                        
                        const container = document.getElementById('lista-agendados');
                        if (container) {
                            container.innerHTML = reservasDaSala.length > 0 
                                ? reservasDaSala.map(r => `<li>📅 ${r.data_reserva}: <b>${r.hora_inicio.substring(0,5)}</b> às <b>${r.hora_fim.substring(0,5)}</b> (Por: <i>${r.solicitante}</i>)</li>`).join('')
                                : '<li>Nenhum horário reservado para hoje.</li>';
                        }
                    })
                    .catch(err => console.error("Erro ao atualizar lista lateral de reservas agendadas:", err));
            }
        }

// A renderização da tabela de reservas (salas + equipamentos), os filtros de
// status/tipo e as ações de aprovar/rejeitar/excluir agora vivem em
// reservas_tabela.js (compartilhado também com professor.php e aluno.php).
// Esse arquivo precisa ser incluído ANTES deste script.js no HTML.


function carregarSalasDoBanco() {
    fetch('listar_salas.php')
        .then(resposta => resposta.json())
        .then(dados => {
            if (dados.erro) {
                console.error("❌ Erro retornado pelo servidor ao listar:", dados.mensagem);
                return;
            }

            console.log("✅ Salas carregadas do banco:", dados);
            listaDeSalas = []; // Limpa a lista local antes de popular

            dados.forEach(s => {
                // Desenha cada sala usando os nomes que vêm da tabela do MySQL
                let salaDesenhada = adicionarNovaSala(
                    [[s.centro_y + s.tamanho_y, s.centro_x - s.tamanho_x],
                     [s.centro_y + s.tamanho_y, s.centro_x + s.tamanho_x],
                     [s.centro_y - s.tamanho_y, s.centro_x + s.tamanho_x],
                     [s.centro_y - s.tamanho_y, s.centro_x - s.tamanho_x]], 
                    s.nome, 
                    s.descricao, 
                    Number(s.centro_y), 
                    Number(s.centro_x), 
                    Number(s.tamanho_x), 
                    Number(s.tamanho_y)
                );
                
                // Anexa os metadados
                salaDesenhada.dadosSala.idBanco = s.id;
                salaDesenhada.dadosSala.horaAbertura = s.hora_abertura;
                salaDesenhada.dadosSala.horaFechamento = s.hora_fechamento;
            });
        })
        .catch(erro => {
            console.error("❌ Erro fatal ao carregar salas:", erro);
        });
}

document.addEventListener("DOMContentLoaded", () => {
    if (typeof carregarSalasDoBanco === 'function') {
        carregarSalasDoBanco();
    }
    
    // CORREÇÃO: Só executa a renderização se o arquivo "reservas_tabela.js" tiver sido carregado
    if (typeof renderizarTabelaGerenciamento === 'function') {
        renderizarTabelaGerenciamento(); 
    }
});


// Filtra os cards de equipamento por nome (busca) e por status (Disponíveis/Indisponíveis).
// CORRIGIDO: os campos de busca/status existiam no HTML mas não tinham nenhum JS ligado a eles.
function filtrarEquipamentos() {
    var campoBusca = document.getElementById('buscaEquipamento');
    var campoStatus = document.getElementById('filtroStatusEquipamento');
    if (!campoBusca || !campoStatus) return;

    var termo = campoBusca.value.trim().toLowerCase();
    var statusEscolhido = campoStatus.value;

    document.querySelectorAll('.equipCard').forEach(function (card) {
        var nome = (card.dataset.nome || '').toLowerCase();
        var status = card.dataset.status || '';

        var passaNome = nome.includes(termo);
        var passaStatus =
            statusEscolhido === 'Todos' ||
            (statusEscolhido === 'Disponíveis' && status === 'disponivel') ||
            (statusEscolhido === 'Indisponíveis' && status !== 'disponivel');

        card.style.display = (passaNome && passaStatus) ? '' : 'none';
    });
}

function adicionarEstoque(id){

    fetch("adicionarEstoque.php?id=" + id)
        .then(res => res.json())
        .then(dados => {

            if(dados.status == "sucesso"){
                location.reload();
            } else {
                alert(dados.mensagem);
            }

        });

}