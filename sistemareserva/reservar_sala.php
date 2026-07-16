<?php
header('Content-Type: application/json');
require 'conexao.php'; // Usa o seu require original

$dados = json_decode(file_get_contents('php://input'), true);

if (!$dados) {
    echo json_encode(["status" => "erro", "mensagem" => "Dados de reserva não recebidos."]);
    exit();
}

try {
    // 1. REGRA EXTRA: Verifica se há choque com alguma reserva já CONFIRMADA
    // Uma reserva choca se: (Nova_Inicio < Existente_Fim) E (Nova_Fim > Existente_Inicio)
    $sqlConflito = "SELECT COUNT(*) FROM reservas 
                    WHERE sala_id = :sala_id 
                      AND data_reserva = :data_reserva 
                      AND status = 'Confirmada' 
                      AND (:inicio < hora_fim AND :fim > hora_inicio)";
    
    $stmtConflito = $pdo->prepare($sqlConflito);
    $stmtConflito->execute([
        ':sala_id' => $dados['sala_id'],
        ':data_reserva' => $dados['data_reserva'],
        ':inicio'  => $dados['hora_inicio'],
        ':fim'     => $dados['hora_fim']
    ]);
    
    $existeConflito = $stmtConflito->fetchColumn() > 0;

    if ($existeConflito) {
        // Se houver conflito com reserva confirmada, bloqueia imediatamente!
        echo json_encode([
            "status" => "erro", 
            "mensagem" => "Não é possível solicitar. Já existe uma reserva CONFIRMADA para esta sala neste dia e horário!"
        ]);
        exit();
    }

    // 2. Buscar a configuração da aprovação automática (Sua lógica original intacta!)
    $sqlConfig = "SELECT aprovacao_automatica
                  FROM configuracoes
                  WHERE id = 1";

    $stmtConfig = $pdo->prepare($sqlConfig);
    $stmtConfig->execute();

    $config = $stmtConfig->fetch(PDO::FETCH_ASSOC);

    // Define se a reserva entra direto como Confirmada ou Pendente
    if ($config && $config['aprovacao_automatica']) {
        $status = "Confirmada";
    } else {
        $status = "Pendente";
    }

    // 3. Inserir a nova reserva usando as suas colunas exatas
    $sql = "INSERT INTO reservas (
                sala_id,
                nome_usuario,
                data_reserva,
                hora_inicio,
                hora_fim,
                status
            )
            VALUES (
                :sala_id,
                :nome,
                :data,
                :inicio,
                :fim,
                :status
            )";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ':sala_id' => $dados['sala_id'],
        ':nome'    => $dados['nome_usuario'],
        ':data'    => $dados['data_reserva'],
        ':inicio'  => $dados['hora_inicio'],
        ':fim'     => $dados['hora_fim'],
        ':status'  => $status
    ]);

    echo json_encode([
        "status" => "sucesso"
    ]);

} catch (Exception $e) {
    echo json_encode([
        "status" => "erro",
        "mensagem" => $e->getMessage()
    ]);
}
?>