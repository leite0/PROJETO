<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);
header('Content-Type: application/json; charset=utf-8');

try {
    require 'conexao.php';
    
    // Pega o pacote enviado pelo JavaScript
    $dados = json_decode(file_get_contents('php://input'), true);

    if (!$dados || empty($dados['id'])) {
        throw new Exception("Dados inválidos ou ID da sala não informado.");
    }

    // Atualiza a tabela 'salas' onde o id for igual ao enviado
    $sql = "UPDATE salas SET 
            nome = :nome, 
            descricao = :descricao, 
            centro_y = :centro_y, 
            centro_x = :centro_x, 
            tamanho_x = :tamanho_x, 
            tamanho_y = :tamanho_y, 
            hora_abertura = :inicio, 
            hora_fechamento = :fim 
            WHERE id = :id";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':id' => $dados['id'],
        ':nome' => $dados['nome'],
        ':descricao' => $dados['descricao'],
        ':centro_y' => $dados['centro_y'],
        ':centro_x' => $dados['centro_x'],
        ':tamanho_x' => $dados['tamanho_x'],
        ':tamanho_y' => $dados['tamanho_y'],
        ':inicio' => $dados['hora_abertura'],
        ':fim' => $dados['hora_fechamento']
    ]);
    
    ob_clean();
    echo json_encode(["status" => "sucesso", "mensagem" => "Sala atualizada com sucesso no banco!"]);

} catch (Exception $e) {
    ob_clean();
    echo json_encode(["status" => "erro", "mensagem" => $e->getMessage()]);
}
?>