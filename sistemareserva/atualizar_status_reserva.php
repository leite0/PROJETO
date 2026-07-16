<?php
require 'conexao.php';
$dados = json_decode(file_get_contents('php://input'), true);

try {
    $tipo = $dados['tipo'] ?? 'sala';
    $status = $dados['status'];
    $idReserva = $dados['id'];

    if ($tipo === 'equipamento' && $status === 'aprovado') {
        // Primeiro: Diminui a quantidade no estoque
        // Assumindo que na tabela 'reserva_equipamentos' exista a coluna 'id_equip'
        $stmt = $pdo->prepare("UPDATE equipamentos e 
                               JOIN reserva_equipamentos re ON e.id_equip = re.id_equip 
                               SET e.quantidade = e.quantidade - 1 
                               WHERE re.id = ?");
        $stmt->execute([$idReserva]);
    }

    // Depois: Atualiza o status da reserva
    $tabelas = ['sala' => 'reservas', 'equipamento' => 'reserva_equipamentos'];
    $stmt = $pdo->prepare("UPDATE {$tabelas[$tipo]} SET status = :status WHERE id = :id");
    $stmt->execute([':status' => $status, ':id' => $idReserva]);

    echo json_encode(["status" => "sucesso"]);
} catch (Exception $e) {
    echo json_encode(["status" => "erro", "mensagem" => $e->getMessage()]);
}
?>