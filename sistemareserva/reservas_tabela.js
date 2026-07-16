/* =====================================================================
   reservas_tabela.js
   ---------------------------------------------------------------------
   Módulo compartilhado responsável por listar/filtrar/gerenciar a tabela
   de reservas (SALAS + EQUIPAMENTOS) unificada.
   Usado por: adm.php (gerenciamento completo), professor.php (somente
   leitura) e aluno.php (somente leitura).

   Requer que a página tenha uma tabela com:
     <tbody id="tabela-corpo-reservas"></tbody>
   ===================================================================== */

// Estado atual dos filtros (fica guardado aqui para poder ser reaplicado
// depois de qualquer ação, ex: aprovar/rejeitar/excluir)
var _filtroStatusAtual = 'Todos';
var _filtroTipoAtual = 'Todos';

// Configuração da tabela na página atual
var _tabelaConfig = {
    somenteLeitura: false, // se true, não mostra a coluna de ações (aprovar/rejeitar/excluir)
    apenasUsuario: null    // se preenchido, mostra só as reservas feitas por esse nome de usuário
};

// Chame essa função uma vez, antes de renderizar, para configurar o comportamento da tabela
function configurarTabelaReservas(opcoes) {
    opcoes = opcoes || {};
    _tabelaConfig.somenteLeitura = !!opcoes.somenteLeitura;
    _tabelaConfig.apenasUsuario = opcoes.apenasUsuario || null;
}

// Chamado pelos botões de filtro de STATUS (Todos / Pendente / Aprovado / Rejeitado)
function filtrarPorStatus(status) {
    _filtroStatusAtual = status;
    atualizarBotoesFiltro();
    renderizarTabelaGerenciamento();
}

// Chamado pelos botões de filtro de TIPO (Todos / Salas / Equipamentos)
function filtrarPorTipo(tipo) {
    _filtroTipoAtual = tipo;
    atualizarBotoesFiltro();
    renderizarTabelaGerenciamento();
}

// Marca visualmente qual botão de filtro está ativo no momento
function atualizarBotoesFiltro() {
    document.querySelectorAll('[data-filtro-status]').forEach(function (btn) {
        btn.classList.toggle('ativo', btn.getAttribute('data-filtro-status') === _filtroStatusAtual);
    });
    document.querySelectorAll('[data-filtro-tipo]').forEach(function (btn) {
        btn.classList.toggle('ativo', btn.getAttribute('data-filtro-tipo') === _filtroTipoAtual);
    });
}

// Renderiza a tabela aplicando os filtros de status E tipo simultaneamente.
// Aceita os parâmetros antigos (filtroStatus, filtroTipo) para manter compatibilidade
// com quem já chamava renderizarTabelaGerenciamento('Pendente'), por exemplo.
function renderizarTabelaGerenciamento(filtroStatus, filtroTipo) {
    if (filtroStatus !== undefined) _filtroStatusAtual = filtroStatus;
    if (filtroTipo !== undefined) _filtroTipoAtual = filtroTipo;

    let corpoTabela = document.getElementById('tabela-corpo-reservas');
    if (!corpoTabela) return;

    const totalColunas = _tabelaConfig.somenteLeitura ? 6 : 7;

    fetch('listar_reservas.php')
        .then(res => res.json())
        .then(lista => {
            if (lista && lista.erro) {
                corpoTabela.innerHTML = `<tr><td colspan="${totalColunas}" style="text-align:center;color:red;">Erro ao carregar: ${lista.mensagem}</td></tr>`;
                return;
            }

            corpoTabela.innerHTML = "";

            // Filtro combinado: status + tipo + (opcionalmente) usuário
            let listaFiltrada = lista.filter(reserva => {
                let statusAtual = reserva.status || 'Pendente';
                let tipoAtual = reserva.tipo || 'sala';

                let passaStatus = true;
                if (_filtroStatusAtual === 'Pendente') passaStatus = statusAtual === 'Pendente';
                else if (_filtroStatusAtual === 'Aprovado') passaStatus = statusAtual === 'Confirmada';
                else if (_filtroStatusAtual === 'Rejeitado') passaStatus = statusAtual === 'Cancelada';
                // 'Todos' -> passaStatus continua true

                let passaTipo = true;
                if (_filtroTipoAtual === 'Salas') passaTipo = tipoAtual === 'sala';
                else if (_filtroTipoAtual === 'Equipamentos') passaTipo = tipoAtual === 'equipamento';
                // 'Todos' -> passaTipo continua true

                let passaUsuario = true;
                if (_tabelaConfig.apenasUsuario) {
                    // "Contém" em vez de "igual exatamente": o nome do solicitante é
                    // digitado livremente a cada reserva, então pode variar em relação
                    // ao nome cadastrado (abreviações, acentos, maiúsculas, etc.).
                    passaUsuario = (reserva.solicitante || '').trim().toLowerCase()
                        .includes(_tabelaConfig.apenasUsuario.trim().toLowerCase());
                }

                return passaStatus && passaTipo && passaUsuario;
            });

            if (listaFiltrada.length === 0) {
                corpoTabela.innerHTML = `<tr class="sem-resultados"><td colspan="${totalColunas}">Nenhuma reserva encontrada para os filtros selecionados.</td></tr>`;
                return;
            }

            listaFiltrada.forEach(reserva => {
                let statusAtual = reserva.status || 'Pendente';
                let ehEquipamento = reserva.tipo === 'equipamento';
                let rotuloTipo = ehEquipamento ? 'Equipamento' : 'Sala';
                let iconeTipo = ehEquipamento
                    ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle;margin-right:4px;"><path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9H4V5zm-2 11h20v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2z"/></svg>`
                    : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle;margin-right:4px;"><path d="M3 21h18v-2h-1V3H4v16H3v2zm3-14h2v2H6V7zm4 0h2v2h-2V7zm4 0h2v2h-2V7zM6 11h2v2H6v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 8v-4h4v4h-4z"/></svg>`;
                let horaIni = (reserva.hora_inicio || '').substring(0, 5);
                let horaFim = (reserva.hora_fim || '').substring(0, 5);

                let tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><span class="badge-tipo ${reserva.tipo}">${iconeTipo} ${rotuloTipo}</span></td>
                    <td>${reserva.item || 'N/A'}</td>
                    <td>${reserva.solicitante || 'N/A'}</td>
                    <td>${reserva.data_reserva}</td>
                    <td>${horaIni} - ${horaFim}</td>
                    <td><span class="badge-status ${statusAtual.toLowerCase()}">${statusAtual}</span></td>
                    ${_tabelaConfig.somenteLeitura ? '' : `
                    <td class="acoes">
                        <button onclick="mudarStatusReserva(${reserva.id}, 'Confirmada', '${reserva.tipo}')" class="btn-icone aprovar" title="Aprovar">✅</button>
                        <button onclick="mudarStatusReserva(${reserva.id}, 'Cancelada', '${reserva.tipo}')" class="btn-icone rejeitar" title="Rejeitar">❌</button>
                        <button onclick="excluirReserva(${reserva.id}, '${reserva.tipo}')" class="btn-icone excluir" title="Excluir">🗑️</button>
                    </td>`}
                `;
                corpoTabela.appendChild(tr);
            });
        })
        .catch(err => {
            console.error("Erro ao buscar reservas: ", err);
            corpoTabela.innerHTML = `<tr><td colspan="${totalColunas}" style="text-align: center; color: red;">Erro ao carregar o histórico de reservas.</td></tr>`;
        });
}

// Aprovar / Rejeitar (somente disponível quando somenteLeitura = false)
function mudarStatusReserva(id, novoStatus, tipo) {
    fetch('atualizar_status_reserva.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id, status: novoStatus, tipo: tipo })
    })
    .then(res => res.json())
    .then(retorno => {
        if (retorno.status === "sucesso") {
            renderizarTabelaGerenciamento();
        } else {
            alert("Erro ao atualizar: " + retorno.mensagem);
        }
    })
    .catch(err => {
        console.error(err);
        alert("Erro de conexão ao atualizar a reserva.");
    });
}

function excluirReserva(id, tipo) {
    if (!confirm("Tem certeza que deseja excluir esta reserva?")) return;

    fetch('excluir_reserva.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id, tipo: tipo })
    })
    .then(res => res.json())
    .then(retorno => {
        if (retorno.status === "sucesso") {
            renderizarTabelaGerenciamento();
        } else {
            alert("Erro ao excluir: " + retorno.mensagem);
        }
    })
    .catch(err => {
        console.error(err);
        alert("Erro de conexão ao excluir a reserva.");
    });
}