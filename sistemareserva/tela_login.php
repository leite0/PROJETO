<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portal Acadêmico</title>
    <link rel="stylesheet" href="login.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
    <link rel="icon" type="image/png" href="Gemini_Generated_Image_dkm4t1dkm4t1dkm4__1_-removebg-preview.png">
</head>

<body>
<article>
<div class="container">

    <section class="left">

        <div class="logo">
            <h1>suap</h1>
            <span>IF Sertão</span>
        </div>

        <div class="line"></div>

        <h2>
            Um software desenvolvido por
            uma instituição pública para
            instituições públicas.
        </h2>

        <img src="loginimagem.svg" class="imagem">

    </section>


    <section class="right">
        <form action="login.php" method='POST'>
            <div class="login-box">

                <h1>Login</h1>
                <h3>Acesse ao Portal Acadêmico:</h3>

                <label>Matricula</label>
                <input type="text" name="matricula" required>

                <label>Senha:</label>

            <div class="senha">
                <input type="password" id="senha" name="senha" required>

                <span onclick="mostrarSenha()">
                    <i class="fa-solid fa-eye"></i>
                </span>
            </div>

                <button type="submit">
                    Acessar
                </button>

                <p class="link">
                    Esqueceu ou deseja alterar sua senha?
                </p>

                <div class="primeiro">
                    Primeira vez no Portal?
                    <br>

                    <a>
                        Confira o tutorial de Primeiro Acesso
                    </a>
                </div>

            </div>
        </form>
    </section>

</div>
</article>

<footer>
<span>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path 
            d="M6 15L12 9L18 15" 
            stroke="#00ef92" 
            stroke-width="2.5" 
            stroke-linecap="round" 
            stroke-linejoin="round"
        />
    </svg>
</span>
    <h3>Serviços de Acesso Público</h3>
</footer>
<script src="script.js"></script>
</body>
</html>