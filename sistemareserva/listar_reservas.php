<?php
header('Content-Type: application/json');
require 'conexao.php';

try {
    $sql = "
        SELECT
            r.id,
            'sala' AS tipo,
            s.nome AS item,
            r.nome_usuario AS solicitante,
            r.data_reserva,
            r.hora_inicio,
            r.hora_fim,
            r.status
        FROM reservas r
        LEFT JOIN salas s ON r.sala_id = s.id

        UNION ALL

        SELECT
            re.id,
            'equipamento' AS tipo,
            e.nome AS item,
            u.nome AS solicitante,
            re.data_reserva,
            re.hora_inicio,
            re.hora_fim,
            re.status
        FROM reserva_equipamentos re
        LEFT JOIN equipamentos e ON re.id_equip = e.id_equip
        LEFT JOIN usuarios u ON re.id_usuario = u.id

        ORDER BY data_reserva DESC
    ";

    $stmt = $pdo->query($sql);
    $reservas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($reservas);
} catch (Exception $e) {
    echo json_encode(["erro" => true, "mensagem" => $e->getMessage()]);
}
?>