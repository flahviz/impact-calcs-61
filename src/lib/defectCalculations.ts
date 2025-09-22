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
    ambienteEncontrado = 'desenvolvimento',
    modulo = '',
    horasPorCargo = []
  } = defectData;

  // Calcular custo base das horas
  const custoBase = horasPorCargo.reduce((total, item) => {
    return total + (item.hours * item.custoHora);
  }, 0);

  // Custo técnico é o custo base real do defeito (sem multiplicador)
  const custoTecnico = custoBase;
  
  // Custo pago sempre é igual ao custo técnico
  const custoPago = custoTecnico;

  // Multiplicador de impacto
  const multImpacto = impactMultipliers[percepcaoImpacto];

  let custoComImpacto: number;
  let custoPorFase: Defect['custoPorFase'];
  let economias: Defect['economias'];

  // Calcular custo por fase baseado no custo base
  custoPorFase = {
    desenvolvimento: custoBase * phaseMultipliers.desenvolvimento,
    teste: custoBase * phaseMultipliers.teste,
    homologacao: custoBase * phaseMultipliers.homologacao,
    producao: custoBase * phaseMultipliers.producao
  };

  // Custo com impacto baseado no custo técnico do ambiente encontrado
  custoComImpacto = percepcaoImpacto === 'sem_impacto' ? 0 : custoTecnico * multImpacto;

  // Calcular economias baseadas no ambiente encontrado
  economias = {};
  if (ambienteEncontrado === 'teste') {
    economias.desenvolvimento = custoTecnico - custoPorFase.desenvolvimento;
  } else if (ambienteEncontrado === 'homologacao') {
    economias.desenvolvimento = custoTecnico - custoPorFase.desenvolvimento;
    economias.teste = custoTecnico - custoPorFase.teste;
  } else if (ambienteEncontrado === 'producao') {
    economias.desenvolvimento = custoTecnico - custoPorFase.desenvolvimento;
    economias.teste = custoTecnico - custoPorFase.teste;
    economias.homologacao = custoTecnico - custoPorFase.homologacao;
  }

  // Economia Potencial se identificado em desenvolvimento
  const currentCost = custoPorFase[ambienteEncontrado];
  const economiaPotencial = Math.max(0, currentCost - custoPorFase.desenvolvimento);

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