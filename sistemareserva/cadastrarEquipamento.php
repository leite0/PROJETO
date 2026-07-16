<?php

session_start();

if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] != 'adm') {
    exit("Acesso negado");
}

include("conexao.php");


$nome = $_POST['nome'];
$descricao = $_POST['descricao_equip'];
$descricaoFormatada = $_POST['descricao_formatada_equip'];
$quantidade = $_POST['quantidade'];


$sql = "INSERT INTO equipamentos
(nome, descricao_equip, descricao_formatada_equip, quantidade, status)

VALUES
(?, ?, ?, ?, 'disponivel')";


$stmt = $pdo->prepare($sql);


$stmt->execute([
    $nome,
    $descricao,
    $descricaoFormatada,
    $quantidade
]);


header("Location: adm.php");
exit();

?>