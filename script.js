// Este é o bloco que o JavaScript irá gerar
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
                    <button class="limpar-periodo">Limpar</button>
                </div>
            </div>
        </div>
    `;
    // resto igual...

    

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html.trim();
    const elemento = tempDiv.firstChild;

    // Evento do botão "Limpar" deste período
    const btnLimpar = elemento.querySelector('.limpar-periodo');
    btnLimpar.addEventListener('click', () => {
        elemento.querySelector('.data-inicial').value = '';
        elemento.querySelector('.data-final').value = '';
        elemento.querySelector('.periodo-ano').value = '';
        elemento.querySelector('.periodo-mes').value = '';
        elemento.querySelector('.periodo-dia').value = '';
        elemento.querySelector('.periodo-total-dias').value = '';
    });

    return elemento;
}

let periodoCount = 1;
const periodosContainer = document.getElementById('periodos-container');
const adicionarBotao = document.getElementById('adicionar-periodo');

// Recalcular sempre que mudar uma data
periodosContainer.addEventListener('change', (e) => {
    if (e.target.classList.contains('data-inicial') ||
        e.target.classList.contains('data-final')) {
        calcularTotalGeral();
    }
});


function initialize() {
    for (let i = 1; i <= 3; i++) {
        periodosContainer.appendChild(createPeriodoElement(i));
        periodoCount++;
    }
}

// Adicionar novas linhas ao clicar em "Adicionar Novo Período"
adicionarBotao.addEventListener('click', () => {
    periodosContainer.appendChild(createPeriodoElement(periodoCount));
    periodoCount++;
});

// Cálculo

function calcularDiferencaEmDias(dataInicio, dataFim) {
    const start = new Date(dataInicio);
    const end = new Date(dataFim);

    // Inclui o último dia (regra tipo INSS)
    const endAjustado = new Date(end.getTime() + (1000 * 60 * 60 * 24));

    const diffTime = Math.abs(endAjustado - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

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

function calcularTotalGeral() {
    let totalGeralDias = 0;
    const periodos = document.querySelectorAll('.periodo');

    periodos.forEach(periodo => {
        const dataInicial = periodo.querySelector('.data-inicial').value;
        const dataFinal = periodo.querySelector('.data-final').value;

        if (dataInicial && dataFinal) {
            const dias = calcularDiferencaEmDias(dataInicial, dataFinal);

            // Atualiza total em dias do período
            periodo.querySelector('.periodo-total-dias').value = dias;

            // Converte e preenche Ano/Mês/Dia do período
            const { anos, meses, dias: diasPeriodo } = converterDiasParaAnosMesesDias(dias);
            periodo.querySelector('.periodo-ano').value = anos;
            periodo.querySelector('.periodo-mes').value = meses;
            periodo.querySelector('.periodo-dia').value = diasPeriodo;

            totalGeralDias += dias;
        } else {
            // Se faltar data, limpa os resultados desse período
            periodo.querySelector('.periodo-total-dias').value = '';
            periodo.querySelector('.periodo-ano').value = '';
            periodo.querySelector('.periodo-mes').value = '';
            periodo.querySelector('.periodo-dia').value = '';
        }
    });

    // Converte total geral
    const { anos, meses, dias } = converterDiasParaAnosMesesDias(totalGeralDias);

    document.getElementById('total-geral-dias').value = totalGeralDias || '';
    document.getElementById('total-anos').value = totalGeralDias ? anos : '';
    document.getElementById('total-meses').value = totalGeralDias ? meses : '';
    document.getElementById('total-dias').value = totalGeralDias ? dias : '';
}

document.getElementById('calcular-tudo').addEventListener('click', calcularTotalGeral);

// Opcional: limpar tudo
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

// Inicializa a calculadora com 3 períodos
initialize();
