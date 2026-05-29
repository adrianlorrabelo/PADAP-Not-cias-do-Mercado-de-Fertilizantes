export type ClimateSeverity = "Crítico" | "Atenção" | "Moderado" | "Informativo";
export type ClimateEventType =
  | "Seca"
  | "Geada"
  | "Chuva excessiva"
  | "Onda de calor"
  | "Frio intenso"
  | "Granizo"
  | "Veranico"
  | "Normal";

export interface ClimateEvent {
  id: string;
  title: string;
  description: string;
  type: ClimateEventType;
  severity: ClimateSeverity;
  region: string;
  state: string;
  period: string;
  affectedCrops: string[];
  fertilizerImpact: string;
  commercialAlert: string;
  source: string;
  date: string;
}

const now = new Date();
const iso = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();

export const mockClimateEvents: ClimateEvent[] = [
  {
    id: "clim-01",
    title: "Veranico intenso no Alto Paranaíba",
    description: "Período sem chuva superior a 18 dias com temperaturas acima de 35 °C. Solo com déficit hídrico crítico em lavouras de café e milho safrinha.",
    type: "Veranico",
    severity: "Crítico",
    region: "Alto Paranaíba",
    state: "MG",
    period: "Próximos 10 dias",
    affectedCrops: ["Café", "Milho safrinha", "Feijão"],
    fertilizerImpact: "Suspensão de adubação de cobertura. Produtor segura compra até retorno das chuvas.",
    commercialAlert: "Evitar cotar adubação de cobertura em nitrogenados. Aguardar janela hídrica.",
    source: "INMET / EPAMIG",
    date: iso(1)
  },
  {
    id: "clim-02",
    title: "Risco de geada no Sul de Minas nas próximas 72h",
    description: "Massa de ar polar avança sobre a região com mínimas previstas de -2 °C a -4 °C. Cafezais em floração e lavouras de alho e cenoura em risco.",
    type: "Geada",
    severity: "Crítico",
    region: "Sul de Minas",
    state: "MG",
    period: "Próximas 72h",
    affectedCrops: ["Café", "Alho", "Cenoura", "HF geral"],
    fertilizerImpact: "Demanda emergencial por fertilizantes foliares protetores (KNO₃, cálcio) pode surgir no pós-geada.",
    commercialAlert: "Alertar consultores da região. Oportunidade de venda reativa de foliares pós-evento.",
    source: "Climatempo / CPTEC INPE",
    date: iso(2)
  },
  {
    id: "clim-03",
    title: "Excesso de chuva no Triângulo Mineiro",
    description: "Volume acima de 180 mm em 5 dias. Encharcamento de solos em lavouras de soja e milho. Estradas vicinais com restrição de tráfego pesado.",
    type: "Chuva excessiva",
    severity: "Atenção",
    region: "Triângulo Mineiro",
    state: "MG",
    period: "Esta semana",
    affectedCrops: ["Soja", "Milho", "Cana-de-açúcar"],
    fertilizerImpact: "Lixiviação de nitrogênio em solos argilosos. Reaplicação de ureia pode ser necessária após drenagem.",
    commercialAlert: "Oportunidade de abordagem sobre reposição de N após lixiviação. Focar em ureia e sulfato de amônio.",
    source: "Inmet / Cemig GD",
    date: iso(4)
  },
  {
    id: "clim-04",
    title: "Onda de calor no Oeste da Bahia",
    description: "Temperaturas entre 38 °C e 42 °C nos próximos 7 dias. Evapotranspiração elevada e estresse hídrico em algodão e soja. Aumento da demanda por sistemas de irrigação.",
    type: "Onda de calor",
    severity: "Atenção",
    region: "Oeste da Bahia",
    state: "BA",
    period: "Próximos 7 dias",
    affectedCrops: ["Algodão", "Soja", "Milho"],
    fertilizerImpact: "Produtor com irrigação pode antecipar cobertura de K. Alta temperatura eleva eficiência de fertilizantes com enxofre.",
    commercialAlert: "Perfis irrigantes podem antecipar compra de cloreto de potássio e sulfato de potássio.",
    source: "INMET / Aprosoja-BA",
    date: iso(5)
  },
  {
    id: "clim-05",
    title: "La Niña confirmada — impacto no segundo semestre",
    description: "NOAA e CPTEC confirmam La Niña para o segundo semestre de 2025. Previsão de chuvas abaixo da média nas regiões Sul e Centro-Oeste e acima da média no Norte e Nordeste.",
    type: "Normal",
    severity: "Moderado",
    region: "Brasil",
    state: "BR",
    period: "Jun–Nov 2025",
    affectedCrops: ["Soja", "Milho", "Café", "Trigo"],
    fertilizerImpact: "Cenário exige planejamento antecipado de compras. Sul pode ter quebra de safra; Centro-Oeste com boa perspectiva.",
    commercialAlert: "Reforçar estoque para demanda do Centro-Oeste. Monitorar cancelamentos em áreas suscetíveis a seca no Sul.",
    source: "NOAA / CPTEC INPE",
    date: iso(6)
  },
  {
    id: "clim-06",
    title: "Granizo localizado no Sul de Goiás",
    description: "Tempestade com granizo de até 3 cm afetou lavouras de soja e feijão em fazendas do sul goiano. Perdas físicas estimadas em 15–30% nas áreas atingidas.",
    type: "Granizo",
    severity: "Atenção",
    region: "Sul de Goiás",
    state: "GO",
    period: "Ocorrido ontem",
    affectedCrops: ["Soja", "Feijão", "Milho"],
    fertilizerImpact: "Produtores com seguro podem replantear. Demanda por adubação de replantio pode surgir em 15–20 dias.",
    commercialAlert: "Contatar produtores afetados com portfólio de arranque para replantio. Oportunidade de MAP e formulados.",
    source: "SIPAM / Canal Rural GO",
    date: iso(10)
  },
  {
    id: "clim-07",
    title: "Frio intenso atrasa plantio de milho safrinha no Paraná",
    description: "Temperaturas abaixo de 10 °C durante a madrugada retardam germinação e desenvolvimento inicial do milho safrinha. Janela de plantio ideal sendo reduzida.",
    type: "Frio intenso",
    severity: "Moderado",
    region: "Norte do Paraná",
    state: "PR",
    period: "Próximas 2 semanas",
    affectedCrops: ["Milho safrinha", "Trigo"],
    fertilizerImpact: "Atraso no plantio comprime janela de adubação de base. Produtor pode concentrar demanda em janela mais curta.",
    commercialAlert: "Preparar disponibilidade de NPK base (MAP, KCl, ureia) para pico concentrado de demanda em 3–4 semanas.",
    source: "Simepar / Embrapa Milho",
    date: iso(14)
  },
  {
    id: "clim-08",
    title: "Previsão de chuvas regulares no Alto Paranaíba para próxima semana",
    description: "Modelo do CPTEC indica retorno de frentes frias com precipitação entre 50 e 80 mm na semana que vem, encerrando o veranico em curso.",
    type: "Normal",
    severity: "Informativo",
    region: "Alto Paranaíba",
    state: "MG",
    period: "Próxima semana",
    affectedCrops: ["Café", "Milho", "Feijão"],
    fertilizerImpact: "Com retorno das chuvas, adubação de cobertura poderá ser retomada. Antecipar logística de ureia e sulfato.",
    commercialAlert: "Janela de adubação de cobertura abrindo. Acionar consultores da região para fechar pedidos com antecedência.",
    source: "CPTEC INPE",
    date: iso(18)
  }
];

export const climateRegionSummary = [
  { region: "Alto Paranaíba · MG", severity: "Crítico" as ClimateSeverity, events: 2 },
  { region: "Sul de Minas · MG", severity: "Crítico" as ClimateSeverity, events: 1 },
  { region: "Triângulo Mineiro · MG", severity: "Atenção" as ClimateSeverity, events: 1 },
  { region: "Sul de Goiás · GO", severity: "Atenção" as ClimateSeverity, events: 1 },
  { region: "Oeste da Bahia · BA", severity: "Atenção" as ClimateSeverity, events: 1 },
  { region: "Norte do Paraná · PR", severity: "Moderado" as ClimateSeverity, events: 1 },
  { region: "Brasil (nacional)", severity: "Moderado" as ClimateSeverity, events: 1 }
];
