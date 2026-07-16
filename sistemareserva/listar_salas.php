<?php
// Impede que o XAMPP jogue avisos em HTML na tela e quebre o JSON do JS
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Garante que o navegador saiba que a resposta É um JSON
header('Content-Type: application/json; charset=utf-8');

try {
    // Tenta puxar a conexão
    require 'conexao.php';
    
    // Verifica se a variável $pdo realmente existe no conexao.php
    if (!isset($pdo)) {
        throw new Exception("A variável de conexão ($pdo) não foi encontrada no arquivo conexao.php.");
    }

    // Busca todas as salas no banco de dados
    $sql = "SELECT * FROM salas";
    $stmt = $pdo->query($sql);
    $salas = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Limpa qualquer espaço em branco ou "echo" acidental anterior
    ob_clean();
    
    // Devolve o array de salas em formato JSON
    echo json_encode($salas);

} catch (Exception $e) {
    // Limpa a saída e devolve O ERRO formatado como JSON!
    ob_clean();
    echo json_encode([
        "erro" => true,
        "mensagem" => "Erro no PHP: " . $e->getMessage()
    ]);
}
?>