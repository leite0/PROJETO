<?php

include("conexao.php");

if (!isset($_POST["valor"])) {
    http_response_code(400);
    exit("Valor não recebido.");
}

$valor = (int) $_POST["valor"];

$sql = "UPDATE configuracoes
        SET aprovacao_automatica = ?
        WHERE id = 1";

$stmt = $pdo->prepare($sql);

if ($stmt->execute([$valor])) {
    echo "OK";
} else {
    echo "ERRO";
}