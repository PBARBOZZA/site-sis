// ----------------------------
// Criação dinâmica dos períodos
// ----------------------------
function createPeriodoElement(indice) {
    const html = `
        <div class="periodo" data-index="${indice}">
            <h3>Período ${indice}</h3>

            <div class="linha">
                <div class="campo">
                    <label>Data Inicial</label>
                    <input type="date" class="data-inicial">
                </div>
                <div class="campo">
                    <label>Data Final</label>
                    <input type="date" class="data-final">
                </div>
            </div>

            <div class="linha">
                <div class="campo">
                    <label>Ano</label>
                    <input type="text" class="periodo-ano" readonly>
                </div>
                <div class="campo">
                    <label>Mês</label>
                    <input type="text" class="periodo-mes" readonly>
                </div>
                <div class="campo">
                    <label>Dia</label>
                    <input type="text" class="periodo-dia" readonly>
                </div>
                <div class="campo campo-total-dias">
                    <label>Total em Dias</label>
                    <input type="text" class="periodo-total-dias" readonly>
                </div>
                <div class="acoes-periodo">
                    <button type="button" class="limpar-periodo">Limpar</button>
                </div>
            </div>
        </div>
    `;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html.trim();
    const elemento = tempDiv.firstChild;

    // Botão "Limpar" deste período
    const btnLimpar = elemento.querySelector('.limpar-periodo');
    btnLimpar.addEventListener('click', () => {
        elemento.querySelector('.data-inicial').value = '';
        elemento.querySelector('.data-final').value = '';
        elemento.querySelector('.periodo-ano').value = '';
        elemento.querySelector('.periodo-mes').value = '';
        elemento.querySelector('.periodo-dia').value = '';
        elemento.querySelector('.periodo-total-dias').value = '';
        calcularTotalGeral();
    });

    return elemento;
}

let periodoCount = 1;
const periodosContainer = document.getElementById('periodos-container');
const adicionarBotao = document.getElementById('adicionar-periodo');

// Inicializa com 3 períodos
function initialize() {
    for (let i = 1; i <= 3; i++) {
        periodosContainer.appendChild(createPeriodoElement(i));
        periodoCount++;
    }
}

// Adicionar novos períodos
adicionarBotao.addEventListener('click', () => {
    periodosContainer.appendChild(createPeriodoElement(periodoCount));
    periodoCount++;
});

// ----------------------------------------
// Cálculo de dias e conversão 360/30
// ----------------------------------------
function calcularDiferencaEmDias(dataInicio, dataFim) {
    // garante horário fixo pra evitar problema de fuso
    const start = new Date(dataInicio + 'T00:00:00');
    const end   = new Date(dataFim   + 'T00:00:00');

    // se a data final for antes da inicial, ignora
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
        return 0;
    }

    const diffTime = end - start;
    // sem +1 dia, pra bater com o sistema de referência
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}

function converterDiasParaAnosMesesDias(totalDays) {
    const DIAS_NO_ANO = 360;
    const DIAS_NO_MES = 30;

    const anos = Math.floor(totalDays / DIAS_NO_ANO);
    let diasRestantes = totalDays % DIAS_NO_ANO;

    const meses = Math.floor(diasRestantes / DIAS_NO_MES);
    const dias = diasRestantes % DIAS_NO_MES;

    return { anos, meses, dias };
}

// ----------------------------------------
// Cálculo geral e atualização da tela
// ----------------------------------------
function calcularTotalGeral() {
    let totalGeralDias = 0;
    const periodos = document.querySelectorAll('.periodo');

    periodos.forEach(periodo => {
        const dataInicial = periodo.querySelector('.data-inicial').value;
        const dataFinal   = periodo.querySelector('.data-final').value;

        if (dataInicial && dataFinal) {
            const dias = calcularDiferencaEmDias(dataInicial, dataFinal);

            // Atualiza total de dias do período
            periodo.querySelector('.periodo-total-dias').value = dias || '';

            // Converte para Ano/Mês/Dia (360/30)
            if (dias > 0) {
                const { anos, meses, dias: diasPeriodo } = converterDiasParaAnosMesesDias(dias);
                periodo.querySelector('.periodo-ano').value = anos;
                periodo.querySelector('.periodo-mes').value = meses;
                periodo.querySelector('.periodo-dia').value = diasPeriodo;
            } else {
                periodo.querySelector('.periodo-ano').value = '';
                periodo.querySelector('.periodo-mes').value = '';
                periodo.querySelector('.periodo-dia').value = '';
            }

            totalGeralDias += dias;
        } else {
            // Se faltar data, limpa os resultados do período
            periodo.querySelector('.periodo-total-dias').value = '';
            periodo.querySelector('.periodo-ano').value = '';
            periodo.querySelector('.periodo-mes').value = '';
            periodo.querySelector('.periodo-dia').value = '';
        }
    });

    // Converte total geral
    if (totalGeralDias > 0) {
        const { anos, meses, dias } = converterDiasParaAnosMesesDias(totalGeralDias);
        document.getElementById('total-geral-dias').value = totalGeralDias;
        document.getElementById('total-anos').value = anos;
        document.getElementById('total-meses').value = meses;
        document.getElementById('total-dias').value = dias;
    } else {
        document.getElementById('total-geral-dias').value = '';
        document.getElementById('total-anos').value = '';
        document.getElementById('total-meses').value = '';
        document.getElementById('total-dias').value = '';
    }
}

// Botão "Calcular"
document.getElementById('calcular-tudo').addEventListener('click', calcularTotalGeral);

// Recalcular automaticamente ao mudar datas
periodosContainer.addEventListener('change', (e) => {
    if (e.target.classList.contains('data-inicial') ||
        e.target.classList.contains('data-final')) {
        calcularTotalGeral();
    }
});

// Botão "Limpar Tudo"
document.getElementById('limpar-tudo').addEventListener('click', () => {
    const periodos = document.querySelectorAll('.periodo');
    periodos.forEach(periodo => {
        periodo.querySelector('.data-inicial').value = '';
        periodo.querySelector('.data-final').value = '';
        periodo.querySelector('.periodo-ano').value = '';
        periodo.querySelector('.periodo-mes').value = '';
        periodo.querySelector('.periodo-dia').value = '';
        periodo.querySelector('.periodo-total-dias').value = '';
    });

    document.getElementById('data-inicial').value = '';
    document.getElementById('data-final').value = '';
    document.getElementById('total-geral-dias').value = '';
    document.getElementById('total-anos').value = '';
    document.getElementById('total-meses').value = '';
    document.getElementById('total-dias').value = '';
});

// Inicializa a calculadora
initialize();

