export const Roles = {
  Admin: "Administrador Geral",
  Manager: "Gestor / Gerente",
  Purchasing: "Compras / Precificação",
  Consultant: "Consultor",
  Viewer: "Visualizador",
} as const;
export type Role = typeof Roles[keyof typeof Roles];

export const CommercialStatuses = {
  Approved: "Aprovado",
  Warning: "Atenção",
  RequiresApproval: "Requer aprovação",
  Blocked: "Bloqueado",
  ReconfirmExchangeRate: "Reconfirmar por alteração cambial",
} as const;
export type CommercialStatus = typeof CommercialStatuses[keyof typeof CommercialStatuses];

export interface User {
  id: string;
  name: string;
  email: string;
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
  discount?: number;
  desvioPrecificacao: number;
  finalPrice: number;
  calculatedFinalPrice?: number | null;
  finalPriceDifference?: number | null;
  calculationStatus?: "ok" | "incomplete" | "divergent";
  importWarnings?: ImportWarning[];
  available: boolean;
}

export interface WeeklyTable {
  id: string;
  supplier: string;
  fileName?: string;
  sourceSheetName?: string;
  listCode?: string;
  listName?: string;
  lineDeviations?: WeeklyTableLineDeviation[];
  weeklyAvailableDeviations?: WeeklyTableLineDeviation[];
  importWarnings?: ImportWarning[];
  expiresAt: string;
  ptax: number;
  freight: number;
  icms: number;
  marginIcms: number;
  products: Product[];
  importedAt: string;
  updatedAt?: string;
  importedBy: string;
  active: boolean;
}

export interface WeeklyTableImport {
  supplier: string;
  fileName?: string;
  sourceSheetName?: string;
  listCode?: string;
  listName?: string;
  lineDeviations?: WeeklyTableLineDeviation[];
  weeklyAvailableDeviations?: WeeklyTableLineDeviation[];
  importWarnings?: ImportWarning[];
  deviationStats?: {
    found: number;
    missing: number;
  };
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

export interface WeeklyTableLineDeviation {
  line: string;
  deviation: number;
  foundInSpreadsheet?: boolean;
}

export interface ImportWarning {
  type: string;
  message: string;
  row?: number;
  productCode?: string;
  severity: "info" | "warning" | "error";
}

export interface YaraPriceHistoryEntry {
  id: string;
  tableId: string;
  fileName?: string;
  importedAt: string;
  updatedAt?: string;
  importedBy?: string;
  status?: string;
  productCount?: number;
  expiresAt: string;
  productCode: string;
  productDescription: string;
  group: string;
  packaging: string;
  ptax: number;
  freight: number;
  icms: number;
  marginIcms: number;
  resellerPrice: number;
  discount: number;
  desvioPrecificacao: number;
  calculatedFinalPrice?: number | null;
  finalPriceDifference?: number | null;
  finalPrice: number;
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
  assistantProductName?: string;
  assistantClientName?: string;
  assistantConsultantName?: string;
  assistantDeliveryCity?: string;
  assistantPriceOrigin?: string;
  assistantProductType?: ProductClassification;
  assistantPricingStrategy?: string;
  assistantSuggestedSupplier?: string;
  assistantSuggestedMinimumMargin?: number;
  assistantAvailability?: ProductAvailability;
}

export type ProductAvailability = "Confirmada" | "Aguardando fornecedor" | "Indisponível" | "Não verificada" | "";
export type ProductClassification = "Adubo especialidade" | "Adubo commodity" | "Foliar" | "Produto em estoque" | "Pacote comercial" | "Cotação manual" | "Não identificado";
export type QuotationStatus = "Pode negociar" | "Em análise" | "Requer aprovação" | "Bloqueada" | "Vencida/Inativa";
export type QuotationItemStatus = "Pode enviar" | "Atenção" | "Requer aprovação" | "Bloqueado";

export interface QuotationAssistantInput {
  client: string;
  consultant: string;
  product: string;
  quantity: string;
  unit: string;
  term: string;
  freightMode: "CIF" | "FOB" | "";
  deliveryCity: string;
  supplierOrPriceOrigin: string;
  basePrice: string;
  validity: string;
  availability: ProductAvailability;
  productType?: ProductClassification;
  pricingStrategy?: string;
  suggestedSupplier?: string;
  suggestedMinimumMargin?: string;
}

export interface PricingStrategySuggestion {
  productType: ProductClassification;
  suggestedSupplier: string;
  strategy: string;
  minimumMargin: number;
  needsSupplierQuote: boolean;
  suggestedSuppliers?: string[];
  nextAction: string;
}

export interface QuotationDiagnosis extends PricingStrategySuggestion {
  availability: ProductAvailability;
}

export interface QuotationSecurityScore {
  percentage: number;
  classification: "Alta" | "Boa" | "Média" | "Baixa";
  positives: string[];
  pending: string[];
  recommendation: string;
}

export interface QuotationItem {
  id: string;
  product: string;
  supplier: string;
  quantity: number;
  unit: string;
  baseCost: number;
  freight: number;
  taxes: number;
  commission: number;
  interest: number;
  desiredMargin: number;
  minimumMargin: number;
  finalPrice: number;
}

export interface QuotationChecklist {
  priceChecked: boolean;
  freightChecked: boolean;
  termChecked: boolean;
  validityChecked: boolean;
  availabilityChecked: boolean;
  marginChecked: boolean;
  supplierChecked: boolean;
}

export interface QuotationTrafficLight {
  status: QuotationStatus;
  reason: string;
  nextAction: string;
  owner: string;
  expectedReturn: string;
  updatedAt: string;
}

export interface QuotationHistoryEntry {
  id: string;
  quotationId?: string;
  date: string;
  client: string;
  consultant: string;
  products?: string[];
  itemCount: number;
  totalValue: number;
  averageMargin: number;
  status: QuotationStatus;
  action: string;
  quotation?: Quotation;
}

export interface Quotation {
  id: string;
  client: string;
  consultant: string;
  farm: string;
  term: string;
  freightMode: "CIF" | "FOB" | "";
  deliveryCity: string;
  validity: string;
  availability: ProductAvailability;
  priceOrigin: string;
  productType: ProductClassification;
  strategy: string;
  suggestedSupplier: string;
  suggestedMinimumMargin: number;
  packageMode: boolean;
  packageTargetMargin: number;
  items: QuotationItem[];
  trafficLight: QuotationTrafficLight;
  checklist: QuotationChecklist;
  createdAt: string;
  updatedAt: string;
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
  fullContent?: string;
  author?: string;
}

export type MarketStatus = "Altista" | "Baixista" | "Neutro" | "Volátil" | "Oportunidade" | "Atenção";
export type MarketUpdateState = "atualizado" | "monitorando" | "atenção" | "erro" | "parcial" | "com falhas" | "pendente";
export type MarketNewsCategory = "Fertilizantes" | "Matérias-primas" | "Câmbio" | "Logística" | "Culturas" | "Geopolítica" | "Importações" | "Oferta e demanda" | "Mercado";
export type Priority = "Baixa" | "Média" | "Alta" | "Crítica";

export interface MarketUpdateStatus {
  id: string;
  label: string;
  lastUpdate: string;
  nextManual: string;
  nextAutomatic: string;
  status: MarketUpdateState;
}

export interface MarketConfidenceSource {
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

export type MarketSourceCategory = "Câmbio" | "Fertilizantes" | "Oferta e demanda" | "Café" | "Grãos" | "Institucional" | "Interna" | "Outra";
export type MarketSourceType = "API" | "Link monitorado" | "Entrada manual" | "Fonte interna";
export type MarketSourceConfidence = "Alta" | "Média" | "Baixa";
export type MarketSourceStatus = "Pendente" | "Ativa" | "Inativa" | "Erro" | "Manual" | "Atualizada" | "Indisponível";

export interface MarketUpdateResult {
  id: string;
  updatedAt: string;
  status: "Completa" | "Parcial" | "Com falhas";
  sourcesChecked: number;
  sourcesSucceeded: number;
  sourcesFailed: number;
  internalSourcesUsed: number;
  externalSourcesAvailable: number;
  confidence: string;
  message: string;
}

export type MarketUpdateTrigger = "Manual" | "Automática";

export interface MarketSourceResult {
  sourceId: string;
  sourceName: string;
  category: string;
  status: "Atualizada" | "Indisponível" | "Erro" | "Manual" | "Pendente";
  message?: string;
  checkedAt: string;
}

export interface MarketUpdateHistory {
  id: string;
  updatedAt: string;
  trigger?: MarketUpdateTrigger;
  status: "Completa" | "Parcial" | "Com falhas";
  sourcesChecked: number;
  sourcesSucceeded: number;
  sourcesFailed: number;
  internalSourcesUsed: number;
  externalSourcesAvailable: number;
  confidence: string;
  summary: string;
  sourceResults: MarketSourceResult[];
  analysisId?: string;
  analysisSummary?: string;
  analysisScore?: number;
}

export interface MarketAutoUpdateSettings {
  enabled: boolean;
  times: string[];
  lastAutoUpdateAt?: string;
  nextAutoUpdateAt?: string;
  runOnlyWhenPageOpen: boolean;
  updatedAt: string;
}

export interface MarketIntelligenceIndicator {
  id: string;
  name: string;
  value: string;
  unit?: string;
  dailyChange?: string;
  weeklyChange?: string;
  trend: string;
  source: string;
  sourceType: "Interna" | "Externa" | "Manual";
  impactPadap: string;
  lastUpdatedAt: string;
}

export interface MarketSource {
  id: string;
  name: string;
  category: MarketSourceCategory;
  url?: string;
  sourceType: MarketSourceType;
  confidence: MarketSourceConfidence;
  isActive: boolean;
  useInBriefing: boolean;
  observation?: string;
  lastCheckedAt?: string;
  lastStatus?: MarketSourceStatus;
  createdAt: string;
  updatedAt: string;
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
  id?: string;
  product: string;
  movement: string;
  dailyVariation: number;
  weeklyVariation: number;
  impact: "Baixo" | "Médio" | "Alto" | "Oportunidade";
  reason: string;
  recommendedAction: string;
  source?: string;
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
  title?: string;
  reason?: string;
  opportunity: string;
  productOrCrop: string;
  justification: string;
  suggestedClients?: string;
  recommendedAction: string;
  priority: Priority;
}

export interface MarketThermometer {
  score: number;
  risk: "Baixo" | "Médio" | "Alto";
  opportunity: "Baixa" | "Média" | "Alta";
  trend: string;
  horizon: string;
  confidence: string;
}

export interface MarketBriefing {
  summary: string;
  impactPadap: string;
  affectedProducts: string[];
  recommendedAction: string;
  sourcesUsed: string[];
  confidence: string;
  whatsappText: string;
}

export interface MarketAnalysis {
  id: string;
  generatedAt: string;
  summaryTitle: string;
  whatChanged: string;
  impactPadap: string;
  whatToWatch: string;
  horizon: string;
  confidence: string;
  thermometer: MarketThermometer;
  productsInAttention: ProductAttention[];
  opportunities: CommercialOpportunity[];
  briefing: MarketBriefing;
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

export type MarketCommercialProductFamily = "nitrogenado" | "fosfatado" | "potássico" | "NPK" | "foliar";
export type MarketCommercialStatus = "liberado" | "revisar" | "vencido" | "aprovação necessária";

export interface MarketCommercialIndicator {
  id: string;
  ptaxCurrent: number;
  dollarVariationSinceLastUpdate: number;
  product: string;
  productFamily: MarketCommercialProductFamily;
  baseCost: number;
  padapFinalPrice: number;
  minimumMargin: number;
  currentMargin: number;
  proposalValidity: string;
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

export type StockUnit = "São Gotardo" | "Santa Juliana" | "Campos Altos";
export type StockItemType = "group" | "product";
export type StockStatus = "Disponível" | "Baixo estoque" | "Zerado" | "Crítico / Negativo" | "Sem regra mínima";

export interface StockImportWarning {
  id: string;
  line: string;
  message: string;
  severity: "info" | "warning" | "error";
}

export interface StockItem {
  id: string;
  unit: StockUnit;
  group: string;
  productName: string;
  physicalStock: number;
  pvRetiraLoja: number;
  purchaseOrder: number;
  consignedBalance: number;
  availableStock: number;
  type: StockItemType;
  sourceFileName: string;
  importedAt: string;
}

export interface StockImportDraft {
  id: string;
  unit: StockUnit;
  fileName: string;
  readAt: string;
  items: StockItem[];
  warnings: StockImportWarning[];
  mode: "import" | "replace";
}

export interface MinimumStockRule {
  id: string;
  productName: string;
  group?: string;
  unitOfMeasure?: string;
  minimumStock: number;
  observation?: string;
}

export interface StockImportHistory {
  id: string;
  unit: StockUnit;
  fileName: string;
  importedAt: string;
  productCount: number;
  warningCount: number;
}

export interface ConsolidatedStockItem {
  productName: string;
  group: string;
  byUnit: Record<StockUnit, number>;
  totalAvailable: number;
  minimumRule?: MinimumStockRule;
  status: StockStatus;
  purchaseSuggestion: number | null;
  reason: string;
}

export type StockPricingProductStatus = "completo" | "incompleto" | "sem_estoque" | "sem_preco" | "pronto_para_cotacao" | "vencido" | "revisar_margem";

export interface StockPricingImportWarning {
  type: string;
  message: string;
  row?: number;
  productName?: string;
  severity: "info" | "warning" | "error";
}

export interface StockPricingProduct {
  id: string;
  produto: string;
  linha: string;
  fornecedor: string;
  embalagem: string;
  codigo?: string;
  precoCusto: number | null;
  custo?: number | null;
  vencimento: string | null;
  antecipacao: number | null;
  juros: number | null;
  margem: number | null;
  margemFator?: number | null;
  divisorAjuste?: number | null;
  precoVenda: number | null;
  monthlyPrices: Record<string, number | null>;
  prazoPrices?: StockPricingTermPrice[];
  extraValues?: Record<string, string | number | null>;
  pricingFormulas?: Record<string, string>;
  observation?: string;
  observacao?: string;
  sourceFileName?: string;
  importedAt?: string;
  status: StockPricingProductStatus;
  updatedAt: string;
}

export interface StockPricingTermPrice {
  key: string;
  label: string;
  dateSerial?: number;
  date?: string;
  price: number | null;
  formula?: string;
  formulaType?: "calculated" | "manual" | "extraPercent";
  manuallyEdited?: boolean;
}

export interface StockPricingImportedColumn {
  key: string;
  label: string;
  index: number;
  role: "input" | "calculated" | "term" | "extra";
  formula?: string;
}

export interface StockPricingTable {
  id: string;
  fileName: string;
  importedAt: string;
  monthReference?: string;
  termColumns?: StockPricingTermPrice[];
  importedColumns?: StockPricingImportedColumn[];
  extraColumns?: StockPricingImportedColumn[];
  active: boolean;
  products: StockPricingProduct[];
  importWarnings: StockPricingImportWarning[];
}

export interface StockPricingHistory {
  id: string;
  fileName: string;
  importedAt: string;
  productCount: number;
  warningCount: number;
  changedCount?: number;
  lastEditedAt?: string;
  user?: string;
}

export interface StockPricingImportDraft {
  id: string;
  fileName: string;
  sourceSheetName: string;
  readAt: string;
  monthReference?: string;
  termColumns?: StockPricingTermPrice[];
  importedColumns?: StockPricingImportedColumn[];
  extraColumns?: StockPricingImportedColumn[];
  products: StockPricingProduct[];
  importWarnings: StockPricingImportWarning[];
}

export type PlannerPriority = "Baixa" | "Média" | "Alta" | "Urgente";
export type PlannerTaskStatus = "Não iniciada" | "Em andamento" | "Concluída";
export type PlannerRecurrence = "Nenhuma" | "Diária" | "Semanal" | "Quinzenal" | "Mensal";

export interface PlannerTask {
  id: string;
  title: string;
  description?: string;
  category: string;
  responsible?: string;
  dueDate: string;
  priority: PlannerPriority;
  status: PlannerTaskStatus;
  recurrence: PlannerRecurrence;
  recurrenceAnchor?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  isRecurring?: boolean;
  originTemplateId?: string;
}

export interface PlannerTaskTemplate {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: PlannerPriority;
  recurrence: PlannerRecurrence;
  suggestedResponsible?: string;
  createdAt: string;
  updatedAt: string;
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
