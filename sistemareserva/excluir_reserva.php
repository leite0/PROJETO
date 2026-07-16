<?php
require 'conexao.php';
$dados = json_decode(file_get_contents('php://input'), true);

try {
    $tipo = $dados['tipo'] ?? 'sala'; // 'sala' ou 'equipamento'
    $id = $dados['id'];

    $tabela = ($tipo === 'equipamento') ? 'reserva_equipamentos' : 'reservas';

    $stmt = $pdo->prepare("DELETE FROM $tabela WHERE id = :id");
    $stmt->execute([':id' => $id]);
    
    echo json_encode(["status" => "sucesso"]);
} catch (Exception $e) {
    echo json_encode(["status" => "erro", "mensagem" => $e->getMessage()]);
}
?>