export type CampaignStatus = "Rascunho" | "Ativa" | "Encerrada";
export type CampaignTheme = "PADAP Verde" | "Cafe" | "HF" | "Cereais" | "Neutro";
export type CampaignPreviewMode = "Normal" | "Compacto" | "Ultra compacto";

export type CampaignRow = {
  id: string;
  type: "product" | "section";
  productName?: string;
  sectionTitle?: string;
  prices?: Record<string, number | string>;
  observation?: string;
  highlighted?: boolean;
};

export type Campaign = {
  id: string;
  title: string;
  typeLabel: string;
  subtitle: string;
  description?: string;
  crop?: string;
  status: CampaignStatus;
  paymentDates: string[];
  rows: CampaignRow[];
  footerNote: string;
  visualTheme?: CampaignTheme;
  previewMode?: CampaignPreviewMode;
  showLogo?: boolean;
  showInstitutionalSubtitle?: boolean;
  showFooterNote?: boolean;
  createdAt: string;
  updatedAt: string;
};

const storageKey = "padap.purchases.campaigns";

export const campaignStatuses: CampaignStatus[] = ["Rascunho", "Ativa", "Encerrada"];
export const campaignThemes: CampaignTheme[] = ["PADAP Verde", "Cafe", "HF", "Cereais", "Neutro"];
export const campaignPreviewModes: CampaignPreviewMode[] = ["Normal", "Compacto", "Ultra compacto"];

function nowIso() {
  return new Date().toISOString();
}

function rowId() {
  return crypto.randomUUID();
}

function readStorage() {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) as Campaign[] : null;
  } catch {
    return null;
  }
}

function writeStorage(campaigns: Campaign[]) {
  localStorage.setItem(storageKey, JSON.stringify(campaigns));
}

export function createCampaignSeed(): Campaign {
  const now = nowIso();
  const paymentDates = ["30/06/2026", "30/08/2026", "30/09/2026"];
  return {
    id: crypto.randomUUID(),
    title: "Campanha Cafe",
    typeLabel: "Condicao Comercial",
    subtitle: "Precos por data de pagamento",
    description: "Valores em R$ conforme campanha enviada",
    crop: "Cafe",
    status: "Rascunho",
    paymentDates,
    rows: [
      {
        id: rowId(),
        type: "product",
        productName: "YaraLiva Nitrabor 15,4 00 00",
        prices: { "30/06/2026": 3430, "30/08/2026": 3565, "30/09/2026": 3635 },
        observation: ""
      },
      {
        id: rowId(),
        type: "product",
        productName: "Black Bio",
        prices: { "30/06/2026": 388, "30/08/2026": 388, "30/09/2026": 388 },
        observation: ""
      },
      { id: rowId(), type: "section", sectionTitle: "POS-COLHEITA" },
      {
        id: rowId(),
        type: "product",
        productName: "Salut",
        prices: { "30/06/2026": 59, "30/08/2026": 61, "30/09/2026": 61 },
        observation: ""
      }
    ],
    footerNote: "Valores em R$ conforme campanha enviada • Consulte disponibilidade e condicoes comerciais",
    visualTheme: "PADAP Verde",
    previewMode: "Normal",
    showLogo: true,
    showInstitutionalSubtitle: true,
    showFooterNote: true,
    createdAt: now,
    updatedAt: now
  };
}

export function createBlankCampaign(): Campaign {
  const seed = createCampaignSeed();
  const now = nowIso();
  return {
    ...seed,
    id: crypto.randomUUID(),
    rows: [],
    createdAt: now,
    updatedAt: now
  };
}

export function loadCampaigns() {
  const stored = readStorage();
  if (stored && stored.length > 0) {
    const normalized = stored.map(normalizeCampaign);
    writeStorage(normalized);
    return normalized;
  }
  const seeded = [createCampaignSeed()];
  writeStorage(seeded);
  return seeded;
}

export function saveCampaigns(campaigns: Campaign[]) {
  writeStorage(campaigns);
}

export function touchCampaign(campaign: Campaign): Campaign {
  return { ...campaign, updatedAt: nowIso() };
}

export function normalizeCampaign(campaign: Campaign): Campaign {
  return {
    ...campaign,
    description: campaign.description ?? "Valores em R$ conforme campanha enviada",
    visualTheme: campaign.visualTheme ?? "PADAP Verde",
    previewMode: campaign.previewMode ?? "Normal",
    showLogo: campaign.showLogo ?? true,
    showInstitutionalSubtitle: campaign.showInstitutionalSubtitle ?? true,
    showFooterNote: campaign.showFooterNote ?? true,
    rows: campaign.rows.map((row) => ({
      ...row,
      highlighted: row.highlighted ?? false,
      prices: row.prices ? { ...row.prices } : row.type === "product" ? {} : undefined
    }))
  };
}

export function duplicateCampaign(campaign: Campaign): Campaign {
  const now = nowIso();
  return {
    ...campaign,
    id: crypto.randomUUID(),
    title: `${campaign.title} (copia)`,
    rows: campaign.rows.map((row) => ({ ...row, id: rowId(), prices: row.prices ? { ...row.prices } : undefined })),
    status: "Rascunho",
    createdAt: now,
    updatedAt: now
  };
}

export function newProductRow(paymentDates: string[]): CampaignRow {
  return {
    id: rowId(),
    type: "product",
    productName: "Novo produto",
    prices: Object.fromEntries(paymentDates.map((date) => [date, ""])),
    observation: "",
    highlighted: false
  };
}

export function newSectionRow(): CampaignRow {
  return { id: rowId(), type: "section", sectionTitle: "NOVA SECAO" };
}
