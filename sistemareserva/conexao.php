<?php
$host = 'localhost';
$banco = 'if_reservas';
$usuario = 'root'; // <-- ATENÇÃO AQUI: Escreva 'root' dentro das aspas!
$senha = '';       // No XAMPP o padrão é senha vazia mesmo.

try {
    // Garanta que a variável passada aqui dentro é exatamente $usuario
    $pdo = new PDO("mysql:host=$host;dbname=$banco;charset=utf8", $usuario, $senha);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    throw new Exception("Falha ao conectar com o banco: " . $e->getMessage());
}
?>