<?php

session_start();

include "conexao.php";


$matricula = $_POST['matricula'];
$senha = $_POST['senha'];


$sql = "SELECT * FROM usuarios WHERE matricula = ?";

$stmt = $pdo->prepare($sql);

$stmt->execute([$matricula]);


$usuario = $stmt->fetch(PDO::FETCH_ASSOC);


if($usuario){


    if($senha == $usuario['senha']){


        $_SESSION['id_user'] = $usuario['id'];
        $_SESSION['nome'] = $usuario['nome'];
        $_SESSION['tipo'] = $usuario['tipo'];


        if($usuario['tipo'] == "adm"){

            header("Location: adm.php");

        }
        elseif($usuario['tipo'] == "professor"){

            header("Location: professor.php");

        }
        elseif($usuario['tipo'] == "aluno"){

            header("Location: aluno.php");

        }

        exit();


    }else{

        echo "Senha incorreta";

    }


}else{

    echo "Usuário não encontrado";

}

?>