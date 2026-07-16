<?php

session_start();

// Ajuste esta checagem de acordo com quem pode acessar esta tela
// (ex: liberar para 'adm', 'professor' e 'aluno', ou remover a checagem
// de $_SESSION['tipo'] se qualquer usuário logado puder ver).
if (!isset($_SESSION['id_user'])) {
    header("Location: tela_login.php");
    exit();
}

if ($_SESSION['tipo'] != 'aluno') {
    header("Location: tela_login.php");
    exit();
}

include("conexao.php");

// Busca dados do usuário logado apenas para exibir no cabeçalho
$sqlUsuario = "SELECT nome, tipo FROM usuarios WHERE id = ?";
$stmtUsuario = $pdo->prepare($sqlUsuario);
$stmtUsuario->execute([$_SESSION['id_user']]);
$usuario = $stmtUsuario->fetch(PDO::FETCH_ASSOC);

?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portal de reservas - Consulta de Reservas</title>

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
    <link rel="stylesheet" href="adm.css">
    <link rel="icon" type="image/png" href="Gemini_Generated_Image_dkm4t1dkm4t1dkm4__1_-removebg-preview.png">
</head>
<body>

<header>
    <form action="logout.php" method="post">
        <button type="submit" class="btnlogout" style="background:#ef4444;color:#fff;padding:10px 20px;
            border-radius:8px;border:none;text-decoration:none;font-weight:bold;font-size:15px;
            font-family:inherit;cursor:pointer;transition:.3s;position:absolute;left:20px;top:30px;">
            Logout
        </button>
    </form>
    <div class="header_elementos">
        <img src="logo_IF.png">

        <span class="tipoUsuario" style="color:white;font-size:25px;position:absolute;right:20px;top:30px;">
            <?= ucfirst($usuario['tipo']) ?>
        </span>
    </div>
</header>

<article>
    <div id="tela-tabela-reservas" class="painel-reservas" style="max-width:1200px;margin:30px auto;">

        <div class="headercard">
            <h2>Consulta de Reservas</h2>
        </div>

        <div class="filtros-reservas">
            <input
                type="text"
                id="buscaSolicitante"
                placeholder="Buscar pelo nome usado na reserva..."
                class="pesquisa"
                oninput="filtrarPorSolicitanteDigitado()">
        </div>

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
                        <!-- Sem coluna de Ações: esta tela é somente leitura -->
                    </tr>
                </thead>
                <tbody id="tabela-corpo-reservas">
                    <!-- Preenchido automaticamente via JavaScript (reservas_tabela.js) -->
                </tbody>
            </table>
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

<script src="reservas_tabela.js"></script>
<script>
    // Configura a tabela compartilhada em modo somente leitura:
    // esconde a coluna de Ações e não expõe aprovar/rejeitar/excluir.
    // Não filtramos automaticamente pelo nome do cadastro, porque o
    // "solicitante" é digitado livremente a cada reserva e pode não
    // bater com o nome oficial do usuário logado.
    configurarTabelaReservas({ somenteLeitura: true });

    // Busca manual: o próprio aluno digita o nome que usou na reserva
    // para filtrar a tabela (aceita nome parcial, ver reservas_tabela.js).
    function filtrarPorSolicitanteDigitado() {
        var termo = document.getElementById('buscaSolicitante').value;
        configurarTabelaReservas({ somenteLeitura: true, apenasUsuario: termo });
        renderizarTabelaGerenciamento();
    }

    document.addEventListener('DOMContentLoaded', function () {
        renderizarTabelaGerenciamento();
    });
</script>

</body>
</html>