<?php
session_start();

// Apaga todas as variáveis da sessão
$_SESSION = [];

// Destrói a sessão
session_destroy();

// Volta para a tela de login
header("Location: tela_login.php");
exit;
?>