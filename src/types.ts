export type Role = "Administrador Geral" | "Gestor / Gerente" | "Compras / Precificação" | "Consultor" | "Visualizador";
export type CommercialStatus = "Aprovado" | "Atenção" | "Requer aprovação" | "Bloqueado" | "Reconfirmar por alteração cambial";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  position: string;
  status: "Ativo" | "Desativado";
  lastAccess: string;
}

export interface Consultant {
  id: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  status: "Ativo" | "Inativo";
}

export interface Client {
  id: string;
  name: string;
  company: string;
  consultantId: string;
  region: string;
  mainCrop: string;
  profile: "Cliente comum" | "Cliente grande" | "Cliente estratégico" | "Cliente especialidade/diamante" | "Relacionamento diretoria" | "Cliente de atenção";
  brandPreference: string;
  commonTerm: string;
  priceSensitivity: "Baixa" | "Média" | "Alta";
  notes: string;
  status: "Ativo" | "Inativo";
  financialStatusFuture: "Liberado" | "Atenção" | "Bloqueado" | "Consultar administrativo";
}

export interface Product {
  id: string;
  code: string;
  group: string;
  description: string;
  reference: string;
  characteristic: string;
  packaging: string;
  supplier: string;
  producerPrice: number;
  resellerPrice: number;
  finalPrice: number;
  available: boolean;
}

export interface WeeklyTable {
  id: string;
  supplier: string;
  expiresAt: string;
  ptax: number;
  freight: number;
  icms: number;
  marginIcms: number;
  products: Product[];
  importedAt: string;
  importedBy: string;
  active: boolean;
}

export interface WeeklyTableImport {
  supplier: string;
  expiresAt?: string;
  ptax?: number;
  freight?: number;
  icms?: number;
  marginIcms?: number;
  products: Product[];
  errors: string[];
  warnings: string[];
  stats: {
    found: number;
    valid: number;
    withoutFinalPrice: number;
    duplicated: number;
    zeroPrice: number;
  };
}

export interface Proposal {
  id: string;
  clientId: string;
  consultantId: string;
  productId: string;
  quantity: number;
  unit: string;
  supplier: string;
  productCost: number;
  salePrice: number;
  freight: number;
  taxes: number;
  commission: number;
  otherExpenses: number;
  term: string;
  freightMode: "CIF" | "FOB";
  validity: string;
  notes: string;
  crop: string;
  status: string;
  createdAt: string;
  createdBy: string;
  ptaxUsed: number;
  ptaxDate: string;
}

export interface PackageItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  unitCost: number;
  unitSale: number;
  supplier: string;
  note: string;
}

export interface CommercialPackage {
  id: string;
  clientId: string;
  consultantId: string;
  crop: string;
  term: string;
  validity: string;
  notes: string;
  status: string;
  clientProfile: Client["profile"];
  createdAt: string;
  createdBy: string;
  items: PackageItem[];
}

export interface Approval {
  id: string;
  targetType: "Proposta" | "Pacote";
  targetId: string;
  clientId: string;
  consultantId: string;
  totalValue: number;
  expectedMargin: number;
  term: string;
  reason: string;
  approver: string;
  requestedBy: string;
  requestedAt: string;
  decision: "Pendente" | "Aprovado" | "Reprovado" | "Ajustar preço" | "Ajustar prazo" | "Reconfirmar fornecedor" | "Enviar para diretoria/donos";
  observation: string;
  history: { user: string; date: string; text: string }[];
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  priority: "Crítico" | "Importante" | "Oportunidade" | "Informativo" | "Risco cambial" | "Risco de margem" | "Risco de validade" | "Risco de disponibilidade";
  date: string;
  module: string;
  action: string;
}

export interface MarketIndicator {
  name: string;
  value: number;
  variation: number;
  unit: string;
  history: { label: string; value: number }[];
}

export interface MarketNews {
  id: string;
  title: string;
  summary: string;
  tag: "Fertilizantes" | "Matérias-primas" | "Logística" | "Culturas" | "Mercado" | "Câmbio";
  date: string;
}

export interface MarketNews {
  source?: string;
  category?: MarketNewsCategory;
  impact?: string;
  confidence?: number;
  url?: string;
  sourceStatus?: "ativa" | "monitorando" | "atenção";
}

export type MarketStatus = "Altista" | "Baixista" | "Neutro" | "Volátil" | "Oportunidade" | "Atenção";
export type MarketUpdateState = "atualizado" | "monitorando" | "atenção" | "erro";
export type MarketNewsCategory = "Fertilizantes" | "Matérias-primas" | "Câmbio" | "Logística" | "Culturas" | "Geopolítica" | "Importações" | "Oferta e demanda";
export type Priority = "Baixa" | "Média" | "Alta" | "Crítica";

export interface MarketUpdateStatus {
  id: string;
  label: string;
  lastUpdate: string;
  nextManual: string;
  nextAutomatic: string;
  status: MarketUpdateState;
}

export interface MarketSource {
  id: string;
  name: string;
  tier: "Nível 1" | "Nível 2" | "Nível 3";
  type: string;
  category: string;
  confidence: number;
  lastUpdate: string;
  link: string;
  status: "ativa" | "monitorando" | "atenção";
  note: string;
}

export interface MarketAlert {
  id: string;
  type: "Alerta crítico" | "Oportunidade" | "Atenção" | "Informativo" | "Risco cambial" | "Risco de margem" | "Risco de disponibilidade";
  title: string;
  message: string;
  relatedTo: string;
  priority: Priority;
  resolved: boolean;
}

export interface ImpactedProposal {
  id: string;
  client: string;
  consultant: string;
  product: string;
  value: number;
  currentMargin: number;
  simulatedMargin: number;
  impactReason: string;
  priority: Priority;
  recommendedAction: string;
}

export interface ProductAttention {
  product: string;
  movement: string;
  dailyVariation: number;
  weeklyVariation: number;
  impact: "Baixo" | "Médio" | "Alto";
  reason: string;
  recommendedAction: string;
  score: number;
}

export interface ProductMarketScore {
  product: string;
  score: number;
  situation: string;
  risk: "Baixo" | "Médio" | "Alto";
  opportunity: "Baixa" | "Média" | "Alta";
  recommendedAction: string;
  tone: "green" | "amber" | "red" | "cyan";
}

export interface CustomerOpportunity {
  client: string;
  profile: string;
  relatedProduct: string;
  reason: string;
  potential: string;
  suggestedAction: string;
}

export interface ExchangeRatioItem {
  id: string;
  pair: string;
  current: number;
  previous: number;
  variation: number;
  unit: string;
  status: "Favorável" | "Desfavorável" | "Estável";
  interpretation: string;
  history: { label: string; value: number }[];
}

export interface CommercialOpportunity {
  id: string;
  opportunity: string;
  productOrCrop: string;
  justification: string;
  suggestedClients: string;
  recommendedAction: string;
  priority: Priority;
}

export interface MarketAnalystInsight {
  summary: string;
  padapImpact: string;
  affectedProducts: string[];
  affectedProposals: string;
  affectedCustomers: string;
  recommendedAction: string;
  horizon: string;
  confidence: number;
  sources: string[];
}

export interface RiskOpportunityItem {
  id: string;
  label: string;
  quadrant: "highRisk" | "highOpportunity" | "lowRisk" | "monitoring";
  summary: string;
  recommendedAction: string;
}

export interface ScenarioSimulationInput {
  ptaxVariation: number;
  ureaVariation: number;
  mapVariation: number;
  kclVariation: number;
  coffeeVariation: number;
  cornVariation: number;
  period: string;
  applyOpenProposals: boolean;
}

export interface ScenarioSimulationResult {
  affectedProposals: number;
  impactedValue: number;
  averageMarginBefore: number;
  averageMarginAfter: number;
  packagesBelowTarget: number;
  sensitiveProducts: string[];
  recommendedAction: string;
}

export interface MarketVsPadapItem {
  product: string;
  padapPrice: number;
  marketTrend: string;
  currentPtax: number;
  estimatedVariation: number;
  status: string;
  recommendedAction: string;
}

export interface MarketTimelineEvent {
  id: string;
  time: string;
  type: string;
  description: string;
  impact: string;
  relatedAction: string;
}

export interface CommercialArgument {
  id: string;
  category: string;
  argument: string;
}

export interface ClosingSummaryData {
  changedToday: string[];
  impactedProposals: string[];
  attentionProducts: string[];
  newOpportunities: string[];
  openAlerts: string[];
  tomorrowActions: string[];
}

export type ReportAudience = "client" | "consultant";

export interface MarketReportConfig {
  reportAudience: ReportAudience;
  period: "Hoje" | "Últimos 7 dias" | "Últimos 30 dias" | "Personalizado";
  type: "Resumo executivo" | "Relatório completo" | "Briefing comercial rápido";
  crops: string[];
  fertilizers: string[];
  includeExchangeRatio: boolean;
  includeNews: boolean;
  includeOpportunities: boolean;
  includeRecommendations: boolean;
  includeSources: boolean;
}

export interface GeneratedMarketReport {
  id: string;
  title: string;
  period: string;
  generatedAt: string;
  generatedBy: string;
  config: MarketReportConfig;
  fileName: string;
}

export interface ReportSendTarget {
  id: string;
  name: string;
  phone: string;
  region: string;
  status: "Ativo" | "Inativo";
}

export type WhatsAppSendStatus = "pendente" | "enviado_manual" | "enviado_api" | "falhou" | "aguardando_confirmacao";

export interface ReportSendHistory {
  id: string;
  date: string;
  report: string;
  period: string;
  generatedBy: string;
  targets: string[];
  status: WhatsAppSendStatus;
  method: "manual" | "api_futura";
  briefing: string;
}

export type WhatsAppRecipientStatus = "ativo" | "inativo";

export interface WhatsAppRecipient {
  id: string;
  name: string;
  role?: string;
  phone: string;
  formattedPhone: string;
  group?: string;
  status: WhatsAppRecipientStatus;
  receivesMarketReport: boolean;
  receivesBriefing: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppSendHistory {
  id: string;
  date: string;
  type: "Relatório PDF" | "Briefing WhatsApp";
  reportName: string;
  period: string;
  recipient: string;
  whatsapp: string;
  sentBy: string;
  status: WhatsAppSendStatus;
  method: "manual" | "api_futura";
  observation?: string;
  message: string;
  reportFileName?: string;
}

export type ProducerContactStatus = "ativo" | "inativo";
export type BroadcastManualStatus = "pendente" | "enviado" | "erro" | "nao_enviar";

export interface ProducerContact {
  id: string;
  name: string;
  farm: string;
  whatsapp: string;
  formattedWhatsapp: string;
  city: string;
  mainCrop: string;
  groups: string[];
  notes: string;
  status: ProducerContactStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BroadcastHistory {
  id: string;
  producerId: string;
  producerName: string;
  farm: string;
  whatsapp: string;
  reportType: ReportAudience;
  reportDate: string;
  period: string;
  status: BroadcastManualStatus;
  sentAt: string;
  notes: string;
  message: string;
}

export interface AnalystPrediction {
  id: string;
  predictionDate: string;
  product: string;
  prediction: string;
  horizon: string;
  observedResult: string;
  hitTrend: boolean;
  precision: number;
  note: string;
}

export interface Settings {
  minFertilizerMargin: number;
  desiredFoliarMargin: number;
  strategicClientMargin: number;
  defaultCommission: number;
  defaultTax: number;
  defaultFreight: number;
  defaultValidityHours: number;
  manualPtax: number;
  alerts: Record<string, boolean>;
}
