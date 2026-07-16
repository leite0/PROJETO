<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);
header('Content-Type: application/json; charset=utf-8');

try {
    require 'conexao.php';
    
    // Pega a ID enviada pelo JavaScript
    $dados = json_decode(file_get_contents('php://input'), true);

    if (!$dados || empty($dados['id'])) {
        throw new Exception("ID da sala não fornecido para exclusão.");
    }

    // Apaga a sala da tabela. (Como você colocou 'ON DELETE CASCADE' na tabela reservas, as reservas dela sumirão junto automaticamente!)
    $sql = "DELETE FROM salas WHERE id = :id";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id' => $dados['id']]);
    
    ob_clean();
    echo json_encode(["status" => "sucesso", "mensagem" => "Sala excluída com sucesso!"]);

} catch (Exception $e) {
    ob_clean();
    echo json_encode(["status" => "erro", "mensagem" => $e->getMessage()]);
}
?>