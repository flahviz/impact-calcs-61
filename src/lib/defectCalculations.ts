import { Defect, DefectHours, PhaseMultipliers, ImpactMultipliers } from "@/types/defect";

export function calculateDefectCosts(
  defectData: Partial<Defect>,
  phaseMultipliers: PhaseMultipliers,
  impactMultipliers: ImpactMultipliers
): Omit<Defect, 'id' | 'createdAt'> {
  const { 
    titulo = '', 
    horasTotais = 0, 
    severidade = 'media', 
    percepcaoImpacto = 'sem_impacto',
    ambienteEncontrado = 'producao',
    modulo = '',
    horasPorCargo = []
  } = defectData;

  // Calcular custo base das horas
  const custoBase = horasPorCargo.reduce((total, item) => {
    return total + (item.hours * item.custoHora);
  }, 0);

  // O custo técnico é sempre o custo base SEM multiplicadores
  const custoTecnico = custoBase;
  
  // Custo pago sempre é igual ao custo técnico
  const custoPago = custoTecnico;

  // Multiplicador de impacto
  const multImpacto = impactMultipliers[percepcaoImpacto];

  let custoComImpacto: number;
  let custoPorFase: Defect['custoPorFase'];
  let economias: Defect['economias'];

  // Todos os defeitos são encontrados em produção
  // O custo técnico já é o valor em produção
  // Calcular quanto custaria nos outros ambientes (economias)
  custoPorFase = {
    desenvolvimento: custoTecnico / 30, // 30x menos
    teste: custoTecnico / 5,           // 5x menos  
    homologacao: custoTecnico / 10,    // 10x menos
    producao: custoTecnico             // Valor atual (produção)
  };

  // Custo com impacto baseado no custo técnico do ambiente encontrado
  custoComImpacto = percepcaoImpacto === 'sem_impacto' ? 0 : custoTecnico * multImpacto;

  // Calcular economias - quanto custaria em cada ambiente vs. produção
  economias = {
    desenvolvimento: custoTecnico - custoPorFase.desenvolvimento, // Economia se fosse encontrado em dev
    teste: custoTecnico - custoPorFase.teste,                   // Economia se fosse encontrado em teste  
    homologacao: custoTecnico - custoPorFase.homologacao        // Economia se fosse encontrado em homolog
  };

  // Economia Potencial se fosse identificado em desenvolvimento
  const economiaPotencial = custoTecnico - custoPorFase.desenvolvimento;

  return {
    titulo,
    horasTotais,
    severidade,
    percepcaoImpacto,
    ambienteEncontrado,
    modulo,
    horasPorCargo,
    custoTecnico,
    custoPago,
    custoComImpacto,
    custoPorFase,
    economias,
    economiaPotencial
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100);
}