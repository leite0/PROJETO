<?php

session_start();

if (!isset($_SESSION['id_user'])) {
    header("Location: tela_login.php");
    exit();
}

if ($_SESSION['tipo'] != 'adm') {
    header("Location: tela_login.php");
    exit();
}

include("conexao.php");

$sql = "SELECT aprovacao_automatica FROM configuracoes LIMIT 1";
$config = $pdo->query($sql)->fetch(PDO::FETCH_ASSOC);

// Buscar equipamentos
$sqlEquipamentos = "SELECT * FROM equipamentos";
$stmtEquipamentos = $pdo->prepare($sqlEquipamentos);
$stmtEquipamentos->execute();
$resultado = $stmtEquipamentos->fetchAll(PDO::FETCH_ASSOC);

// Buscar dados do usuário logado
$sqlUsuario = "SELECT nome, tipo
               FROM usuarios
               WHERE id = ?";

$stmtUsuario = $pdo->prepare($sqlUsuario);
$stmtUsuario->execute([$_SESSION['id_user']]);

$usuario = $stmtUsuario->fetch(PDO::FETCH_ASSOC);

?>

<!DOCTYPE html> 
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portal de reservas</title>
    
    <!-- Arquivos CSS do Leaflet via CDN oficial do unpkg -->
   <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">


   <link rel="stylesheet" href="adm.css">
   <link rel="icon" type="image/png" href="Gemini_Generated_Image_dkm4t1dkm4t1dkm4__1_-removebg-preview.png">
</head>
<body>

<header>
    <form action="logout.php" method="post">
        <button type="submit" class="btnlogout" style=" background:  #ef4444;
    color: #fff;

    padding: 10px 20px;
    border-radius: 8px;
    border: none;

    text-decoration: none;
    font-weight: bold;
    font-size: 15px;
    font-family: inherit;

    cursor: pointer;
    transition: .3s; position: absolute; left: 20px;top: 30px; ">
            Logout
        </button>
    </form>
    <div class="header_elementos">
        <img src="logo_IF.png">

    <span
        class="tipoUsuario"
        style="color:white;font-size:25px;position:absolute;right: 20px;top: 30px;;">
        <?= ucfirst($usuario['tipo']) ?>
    </span>
    </div>
</header>
<article>

<div id="gerencia" class="cards-container">

    <div class="option-card" onclick="gerensala()">
        <div class="card-image">
            <img src="img/salas.jpeg" alt="Salas">
            <div class="overlay"></div>

            <div class="card-title">
                <h2>Salas</h2>
                <p>Gerenciamento de Reservas</p>
            </div>
        </div>

        <div class="card-body">
            <p>
                Faça reservas e acompanhe a disponibilidade das salas.
            </p>

            <button onclick="gerensala();">
                Acessar
            </button>
        </div>
    </div>

    <div class="option-card" onclick="gerenequi()">
        <div class="card-image">
            <img src="img/equipamentos.jpg" alt="Equipamentos">
            <div class="overlay"></div>

            <div class="card-title">
                <h2>Equipamentos</h2>
                <p>Gerenciamento de equipamentos</p>
            </div>
        </div>

        <div class="card-body">
            <p>
                Faça reservas e acompanhe a disponibilidade dos equipamentos.
            </p>

            <button onclick="gerenequi();">
                Acessar
            </button>
        </div>
    </div>

        <div class="option-card" onclick="abrirTelaReservas()">
        <div class="card-image">
            <img src="img/reservas.png" alt="requipamentos">
            <div class="overlay"></div>

            <div class="card-title">
                <h2>Reservas</h2>
                <p>Gerenciamento de reservas </p>
            </div>
        </div>

        <div class="card-body">
            <p>
                Gerencie as reservas acompanhe a disponibilidade dos equipamentos e salas.
            </p>

            <button>
                Acessar
            </button>
        </div>
    </div>
</div>

<div id="salas" class="salas">
    <div class="headercard">
        <button class="buttoncard" onclick="voltar()">Voltar</button>
        <h2>Gerenciar Salas</h2>
        <div class="config-card">
            <div class="config-info">
                <h4>Aprovação automática  </h4>
            </div>

            <label class="switch">
                <input
                    type="checkbox"
                    id="autoAprovacao"
                    <?= $config['aprovacao_automatica'] ? 'checked' : '' ?>>
                <span class="slider"></span>
            </label>
        </div>
    </div>
    <div id="tela-mapa-salas" class="card">
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
        <script src="reservas_tabela.js"></script>
        <script src="script.js"></script>
        <!--  <div>
         <button onclick="reset()">reset</button> 
        </div>-->
        
        <!-- CLASSES NOVAS APLICADAS AQUI -->
        <div id="painel-lateral" class="painel-lateral">
            <div>
                <h3>Selecione um local:</h3>
                <div id="botoes-salas-container" class="botoes-container">
                    <p id="aviso-vazio" class="texto-informativo-italico">
                        Nenhuma sala criada. Crie uma sala para começar!
                    </p>
                </div>
            </div>
            <hr class="divisor-painel">

            <div id="conteudo-sala">
                <p class="texto-informativo">Clique em um botão acima ou em um ponto no mapa para ver os detalhes da sala aqui.</p>
            </div>
        </div>

        <div>
         <div id="nova-sala" class="conteudo-flex-coluna">
               <div class="flex-sub-header">
                    <h4 class="titulo-secao">Criar nova sala</h4>
                    <button onclick="editar()" class="btn-acao btn-azul-margin">Editar sala</button>
                </div>
                
                <div class="formulario-card">
                    <h4 class="subtitulo-formulario">Local da sala</h4>
                                    
                    <label class="label-padrao-15">Nome da sala:</label>
                    <input type="text" id="nome-sala" placeholder="Digite o nome da sala" class="input-padrao mb-10">
                
                    <label class="label-padrao-15">Informações da sala:</label>    
                    <textarea id="nova-info-sala" placeholder="Digite as Informações da sala:" class="textarea-padrao"></textarea>                
                
                    <label class="label-padrao-12">Largura(M):</label>
                    <input type="number" id="novo-tamanho-x" placeholder="insira o tamanho" value="" min="5" max="200" class="input-padrao mb-10">
                                         
                    <label class="label-padrao-12">Altura(M):</label>
                    <input type="number" id="novo-tamanho-y" placeholder="insira o tamanho" value="" min="5" max="200" class="input-padrao mb-10">

                    <label class="label-funcionamento">Horário de Funcionamento:</label>
                        <div class="flex-linha-gap10 mb-10">
                            <div class="flex-1">
                                <span class="span-legenda-hora">Abertura:</span>
                                <input type="time" id="hora-reserva-ini" value="08:00" class="input-padrao">
                            </div>
                            <div class="flex-1">
                                <span class="span-legenda-hora">Fechamento:</span>
                                <input type="time" id="hora-reserva-fim" value="18:00" class="input-padrao">
                            </div>
                        </div>
                </div>
        </div>
        
         <div id="editar-sala-container" class="conteudo-flex-coluna display-none" >
                <div id="mensagem-selecione-editar" style="display: flex; flex-direction: column; align-items: flex-start;">
                    <p class="texto-informativo-italico">"Selecione uma sala para iniciar a edição"</p>
                    <button onclick="criar()" class="btn-acao btn-verde-margin">Criar sala</button>
                </div>

                <div id="formulario-edicao">
                    <div>
                        <div class="flex-sub-header">
                            <h4 class="titulo-secao">Editar sala</h4>
                            <button onclick="criar()" class="btn-acao btn-verde-margin">Criar sala</button>
                        </div>
                        
                        <div class="formulario-card">
                            <h4 class="subtitulo-formulario">local da sala</h4>
                                                        
                            <label class="label-padrao-15">Nome da sala:</label>
                            <input type="text" id="editar-nome-sala" placeholder="Digite o nome da sala" class="input-padrao mb-10">
                        
                            <label class="label-padrao-15">Informações da sala:</label>    
                            <textarea id="editar-info-sala" placeholder="Digite as Informações da sala:" class="textarea-padrao box-sizing-border"></textarea>                
                        
                            <label class="label-padrao-12">Largura(M):</label>
                            <input type="number" id="editar-tamanho-x" placeholder="insira o tamanho" min="5" max="200" class="input-padrao mb-10">
                                                            
                            <label class="label-padrao-12">Altura(M):</label>
                            <input type="number" id="editar-tamanho-y" placeholder="insira o tamanho" min="5" max="200" class="input-padrao mb-10">
                            
                            <label class="label-funcionamento">Horário de Funcionamento:</label>
                                <div class="flex-linha-gap10 mb-10">
                                    <div class="flex-1">
                                        <span class="span-legenda-hora">Abertura:</span>
                                        <input type="time" id="editar-hora-abertura" value="08:00" class="input-padrao">
                                    </div>
                                    <div class="flex-1">
                                        <span class="span-legenda-hora">Fechamento:</span>
                                        <input type="time" id="editar-hora-fechamento" value="18:00" class="input-padrao">
                                    </div>
                                </div>

                            <button onclick="salvarEdicaoSala()" class="btn-acao btn-full btn-azul-margin">
                                Salvar Alterações
                            </button>
                            <button onclick="apagarSala()" class="btn-acao btn-full btn-vermelho-margin">
                                Excluir Sala
                            </button>
                        </div>
                    </div>
                </div>
        </div> 
        </div>       
    </div>
    <div id="tela-tabela-reservas" style="display: none;" class="painel-reservas">
        <div class="filtros-reservas">
            <button data-filtro-status="Todos" onclick="filtrarPorStatus('Todos')" class="btn-filtro todos ativo">Todos os status</button>
            <button data-filtro-status="Pendente" onclick="filtrarPorStatus('Pendente')" class="btn-filtro pendente">Pendentes</button>
            <button data-filtro-status="Aprovado" onclick="filtrarPorStatus('Aprovado')" class="btn-filtro confirmada">Aprovados</button>
            <button data-filtro-status="Rejeitado" onclick="filtrarPorStatus('Rejeitado')" class="btn-filtro cancelada">Rejeitados</button>
        </div>
        <div class="filtros-reservas">
            <button data-filtro-tipo="Todos" onclick="filtrarPorTipo('Todos')" class="btn-filtro todos ativo">
                Todos os tipos
            </button>

            <button data-filtro-tipo="Salas" onclick="filtrarPorTipo('Salas')" class="btn-filtro tipo-sala">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle;margin-right:4px;">
                    <path d="M3 21h18v-2h-1V3H4v16H3v2zm3-14h2v2H6V7zm4 0h2v2h-2V7zm4 0h2v2h-2V7zM6 11h2v2H6v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 8v-4h4v4h-4z"/>
                </svg>
                Salas
            </button>

            <button data-filtro-tipo="Equipamentos" onclick="filtrarPorTipo('Equipamentos')" class="btn-filtro tipo-equipamento">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle;margin-right:4px;">
                    <path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9H4V5zm-2 11h20v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2z"/>
                </svg>
                Equipamentos
            </button>
        </div>

        <div class="tabela-reservas-wrapper">
            <table class="tabela-reservas">
                <thead>
                    <tr>
                        <th>Tipo</th>
                        <th>Item</th>
                        <th>Solicitante</th>
                        <th>Data</th>
                        <th>Horário</th>
                        <th>Status</th>
                        <th style="text-align: center;">Ações</th>
                    </tr>
                </thead>
                <tbody id="tabela-corpo-reservas">
                    <!-- Preenchido automaticamente via JavaScript (reservas_tabela.js) -->
                </tbody>
            </table>
        </div>
    </div>
</div>

<div id="equipamentos" class="equipamentos">

        <div class="headercard">
                <button class="buttoncard" onclick="voltar()">
                    Voltar
                </button>
            <h2>Gerenciar Equipamentos</h2>

            <div class="acoesHeader">
                <button class="buttoncard" onclick="abrirCadastro()">
                    + Adicionar Equipamento
                </button>

                <div id="modalCadastro" class="modal" style="flex-direction: column-reverse">
                <div class="botoesModal">


                </div>
                    <div class="modal-content">
                <span class="fechar" onclick="fecharCadastro()">&times;</span>

                        <h2>Novo Equipamento</h2>

                        <form action="cadastrarEquipamento.php" method="POST">

                            <label>Nome</label>
                            <input type="text" name="nome" required>

                            <label>Descrição</label>
                            <textarea name="descricao_equip" required></textarea>

                            <label>Quantidade</label>
                            <input type="number" name="quantidade" min="1" value="1" required>

                            <button type="submit" class="reservar">
                                Cadastrar
                            </button>

                        </form>

                    </div>

                </div>
            </div>
        </div>
    <div class="filtros">

        <input
            type="text"
            id="buscaEquipamento"
            placeholder="Pesquisar equipamento..."
            class="pesquisa"
            oninput="filtrarEquipamentos()">

        <select id="filtroStatusEquipamento" class="filtroStatus" onchange="filtrarEquipamentos()">
            <option>Todos</option>
            <option>Disponíveis</option>
            <option>Indisponíveis</option>
        </select>

    </div>

    <div class="cardsEquipamentos">
<?php foreach($resultado as $equip){ ?>
        <div class="equipCard" data-nome="<?= htmlspecialchars(strtolower($equip['nome'])) ?>" data-status="<?= htmlspecialchars($equip['status']) ?>">
                <button class="btnExcluir" onclick="excluirEquipamento(<?= $equip['id_equip'] ?>)">
                    <i class="fa-solid fa-trash"></i>
                </button>
        <h3><?= htmlspecialchars($equip['nome']) ?></h3>

        <p><?= htmlspecialchars($equip['descricao_equip']) ?></p>
        <p class="estoque">
            Estoque:
            <strong><?= $equip['quantidade'] ?></strong>
        </p>

        <span class="status <?= $equip['status'] ?>">
            <?= ucfirst($equip['status']) ?>
        </span>
            <div class="acoesCard">
            <button class="reservar" onclick="adicionarEstoque(<?= $equip['id_equip'] ?>)">
                Add +1 no estoque
            </button>
            <button
            class="reservar"
            onclick="abrirReserva(
            <?= $equip['id_equip'] ?>,
            '<?= addslashes($equip['nome']) ?>'
            )">
            Reservar
            </button>
            </div>
        </div>
<?php } ?>
        <div id="modalReserva" class="modal">

            <div class="modal-content">

                <span class="fechar" onclick="fecharReserva()">&times;</span>

                <h2>Reservar Equipamento</h2>

                <form action="reservarEquipamento.php" method="POST">

                    <input type="hidden" id="idEquip" name="id_equip">

                    <div class="campo">
                        <label>Equipamento</label>
                        <input type="text" id="nomeEquip" readonly>
                    </div>

                    <div class="campo">
                        <label>Data</label>
                        <input type="date" name="data_reserva" required>
                    </div>

                    <div class="campo">
                        <label>Hora Inicial</label>
                        <input type="time" name="hora_inicio" required>
                    </div>

                    <div class="campo">
                        <label>Hora Final</label>
                        <input type="time" name="hora_fim" required>
                    </div>

                    <div class="campo">
                        <label>Motivo (opcional)</label>
                        <input type="text" name="motivo" placeholder="Ex: Aula prática, evento...">
                    </div>

                    <button class="reservar">
                        Confirmar Reserva
                    </button>

                </form>

            </div>

        </div>
    </div>

</div>
</article>
<footer>
<span>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path 
            d="M6 15L12 9L18 15" 
            stroke="#00ef92" 
            stroke-width="2.5" 
            stroke-linecap="round" 
            stroke-linejoin="round"
        />
    </svg>
</span>
    <h3>Serviços de Acesso Público</h3>
</footer>
</body>
</html>