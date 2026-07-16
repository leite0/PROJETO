<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);
header('Content-Type: application/json; charset=utf-8');

try {
    require 'conexao.php';
    
    $dados = json_decode(file_get_contents('php://input'), true);

    if (!$dados) {
        throw new Exception("Nenhum dado foi recebido pelo PHP.");
    }

    // Inserção usando exatamente os nomes das colunas da sua tabela SQL
    $sql = "INSERT INTO salas (nome, descricao, centro_y, centro_x, tamanho_x, tamanho_y, hora_abertura, hora_fechamento) 
            VALUES (:nome, :descricao, :centro_y, :centro_x, :tamanho_x, :tamanho_y, :inicio, :fim)";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':nome' => $dados['nome'],
        ':descricao' => $dados['descricao'],
        ':centro_y' => $dados['centro_y'],
        ':centro_x' => $dados['centro_x'],
        ':tamanho_x' => $dados['tamanho_x'],
        ':tamanho_y' => $dados['tamanho_y'],
        ':inicio' => $dados['hora_abertura'] ?? '08:00',
        ':fim' => $dados['hora_fechamento'] ?? '18:00'
    ]);
    
    $idGerado = $pdo->lastInsertId();
    
    ob_clean();
    echo json_encode([
        "status" => "sucesso", 
        "mensagem" => "Sala salva no banco com sucesso!",
        "id_banco" => $idGerado
    ]);

} catch (Exception $e) {
    ob_clean();
    echo json_encode([
        "status" => "erro", 
        "mensagem" => $e->getMessage()
    ]);
}
?>