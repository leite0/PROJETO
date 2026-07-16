<?php
// Cria uma reserva de equipamento.

session_start();
require "conexao.php";

if (!isset($_SESSION['id_user'])) {
    header("Location: tela_login.php");
    exit();
}

// Para onde voltar depois de reservar, de acordo com o tipo de usuário logado
$paginaVolta = 'aluno.php';
if (($_SESSION['tipo'] ?? '') === 'adm') {
    $paginaVolta = 'adm.php';
} elseif (($_SESSION['tipo'] ?? '') === 'professor') {
    $paginaVolta = 'professor.php';
}

$idUsuario = $_SESSION['id_user'];
$idEquip   = $_POST['id_equip'] ?? null;
$data      = $_POST['data_reserva'] ?? null;
$inicio    = $_POST['hora_inicio'] ?? null;
$fim       = $_POST['hora_fim'] ?? null;
$motivo    = $_POST['motivo'] ?? '';

function voltarComErro($mensagem) {
    echo "<script>alert(" . json_encode($mensagem) . "); history.back();</script>";
    exit();
}

if (!$idEquip || !$data || !$inicio || !$fim) {
    voltarComErro("Preencha todos os campos da reserva.");
}

if ($fim <= $inicio) {
    voltarComErro("O horário final deve ser depois do horário inicial.");
}

try {
    /* Verifica aprovação automática */
    $stmt = $pdo->prepare("SELECT aprovacao_automatica FROM configuracoes WHERE id = 1");
    $stmt->execute();
    $config = $stmt->fetch(PDO::FETCH_ASSOC);

    $status = ($config && $config['aprovacao_automatica']) ? "Confirmada" : "Pendente";

    /* Busca a quantidade do equipamento */
    $stmt = $pdo->prepare("SELECT quantidade FROM equipamentos WHERE id_equip = ?");
    $stmt->execute([$idEquip]);
    $equipamento = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$equipamento) {
        voltarComErro("Equipamento não encontrado.");
    }

    $quantidadeDisponivel = (int) $equipamento['quantidade'];

    /* Verifica quantas unidades já estão reservadas nesse horário */
    $stmt = $pdo->prepare("
        SELECT COUNT(*) AS total
        FROM reserva_equipamentos
        WHERE id_equip = ?
          AND data_reserva = ?
          AND hora_inicio < ?
          AND hora_fim > ?
          AND status <> 'Cancelada'
    ");
    $stmt->execute([$idEquip, $data, $fim, $inicio]);
    $reservasConflitantes = $stmt->fetch(PDO::FETCH_ASSOC);

    if ((int) $reservasConflitantes['total'] >= $quantidadeDisponivel) {
        voltarComErro("Todas as unidades deste equipamento já estão reservadas neste horário.");
    }

    /* Salva a reserva */
    $stmt = $pdo->prepare("
        INSERT INTO reserva_equipamentos
            (id_usuario, id_equip, data_reserva, hora_inicio, hora_fim, motivo, status)
        VALUES
            (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$idUsuario, $idEquip, $data, $inicio, $fim, $motivo, $status]);

    header("Location: $paginaVolta");
    exit();

} catch (Exception $e) {
    voltarComErro("Erro ao reservar equipamento: " . $e->getMessage());
}
?>