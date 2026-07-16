<?php
session_start();
require "conexao.php";

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);

if ($id) {
    $stmt = $pdo->prepare("DELETE FROM equipamentos WHERE id_equip = ?");
    $stmt->execute([$id]);
}

header("Location: adm.php");
exit();