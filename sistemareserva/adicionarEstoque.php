<?php

session_start();
header('Content-Type: application/json; charset=utf-8');

if (($_SESSION['tipo'] ?? '') !== 'adm') {
    http_response_code(403);
    echo json_encode(["status" => "erro", "mensagem" => "Acesso negado."]);
    exit();
}

require "conexao.php";

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);

if (!$id) {
    echo json_encode(["status" => "erro", "mensagem" => "ID inválido."]);
    exit();
}

try {
    $stmt = $pdo->prepare("UPDATE equipamentos SET quantidade = quantidade + 1 WHERE id_equip = ?");
    $stmt->execute([$id]);
    echo json_encode(["status" => "sucesso"]);
} catch (Exception $e) {
    echo json_encode(["status" => "erro", "mensagem" => $e->getMessage()]);
}