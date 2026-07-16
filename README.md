# Sistema de Reserva de Salas e Equipamentos - IF

## Sobre o Projeto

O **Sistema de Reserva de Salas e Equipamentos** foi desenvolvido com o objetivo de informatizar o processo de solicitação e gerenciamento de reservas de salas de aula e equipamentos pertencentes ao Instituto Federal.

O sistema substitui o processo manual de reservas por uma plataforma web, permitindo maior organização, controle e rastreabilidade das solicitações realizadas por alunos, professores e administradores.

---

## Objetivos

* Automatizar o processo de reserva de salas.
* Automatizar o processo de reserva de equipamentos.
* Evitar conflitos de horários.
* Facilitar o gerenciamento das reservas.
* Centralizar todas as informações em um banco de dados.
* Oferecer uma interface simples para usuários e administradores.

---

## Tecnologias Utilizadas

### Front-end

* HTML5
* CSS3
* JavaScript

### Back-end

* PHP

### Banco de Dados

* MySQL

### Ambiente de Desenvolvimento

* XAMPP
* Apache
* phpMyAdmin

---

## Funcionalidades

### Usuário

* Login
* Consulta de salas
* Consulta de equipamentos
* Solicitação de reservas
* Acompanhamento das reservas

### Administrador

* Cadastro de salas
* Edição de salas
* Exclusão de salas
* Cadastro de equipamentos
* Controle de estoque
* Aprovação de reservas
* Cancelamento de reservas
* Gerenciamento geral do sistema

---

## Estrutura do Projeto

```text
sistemareserva/

├── conexao.php
├── aluno.php
├── adm.php
├── backup.php
├── cadastrarEquipamento.php
├── adicionarEstoque.php
├── editar_sala.php
├── excluir_sala.php
├── excluirEquipamento.php
├── excluir_reserva.php
├── atualizar_status_reserva.php
├── alterarConfiguracao.php
├── if_reservas.sql
├── img/
└── arquivos auxiliares
```

---

## Arquitetura

O sistema utiliza uma arquitetura simples baseada em PHP.

```text
Usuário
      │
      ▼
 Navegador
      │
      ▼
Arquivos PHP
      │
      ▼
Conexão PDO
      │
      ▼
Banco MySQL
```

---

## Banco de Dados

O projeto utiliza um banco chamado:

```
if_reservas
```

A estrutura completa encontra-se no arquivo:

```
if_reservas.sql
```

---

## Como executar

### 1. Instalar o XAMPP

Inicie:

* Apache
* MySQL

### 2. Copiar o projeto

Mover a pasta para:

```
xampp/htdocs/
```

### 3. Criar o banco

Abra o phpMyAdmin.

Crie o banco:

```
if_reservas
```

Importe:

```
if_reservas.sql
```

### 4. Configurar conexão

Arquivo:

```
conexao.php
```

Configure:

* Host
* Usuário
* Senha
* Nome do banco

### 5. Abrir no navegador

```
http://localhost/sistemareserva
```

---

## Segurança

O sistema utiliza:

* PDO
* Conexão com MySQL
* Separação entre usuários e administradores

---

## Melhorias Futuras

* Responsividade completa
* Sistema de notificações
* Recuperação de senha
* Dashboard administrativo
* Histórico completo de reservas
* Upload de documentos
* API REST
* Integração com autenticação institucional

---

## Autor

Projeto desenvolvido como atividade acadêmica para o Instituto Federal.

---

## Licença

Projeto desenvolvido exclusivamente para fins educacionais.
