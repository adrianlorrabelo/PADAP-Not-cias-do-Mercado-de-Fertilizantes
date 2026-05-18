import type { GeneratedMarketReport, ReportSendHistory, ReportSendTarget, WhatsAppSendStatus } from "../types";

export function normalizePhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("55")) return digits;
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
}

export function validatePhoneNumberBR(phone: string): boolean {
  return /^55\d{10,11}$/.test(normalizePhoneNumber(phone));
}

export function formatPhoneNumberBR(phone: string): string {
  const normalized = normalizePhoneNumber(phone);
  if (!normalized) return "";
  const national = normalized.startsWith("55") ? normalized.slice(2) : normalized;
  if (national.length < 10) return `+${normalized}`;
  const ddd = national.slice(0, 2);
  const first = national.length === 11 ? national.slice(2, 7) : national.slice(2, 6);
  const second = national.length === 11 ? national.slice(7, 11) : national.slice(6, 10);
  return `+55 ${ddd} ${first}-${second}`;
}

export function createWhatsAppUrl(phone: string, message: string): string {
  const normalizedPhone = normalizePhoneNumber(phone);
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}

export function openWhatsAppWeb(phone: string, message: string) {
  if (!validatePhoneNumberBR(phone)) {
    return { ok: false as const, message: "O número de WhatsApp do destinatário está inválido." };
  }

  const url = createWhatsAppUrl(phone, message);
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (!opened) {
    return { ok: false as const, message: "O navegador bloqueou a abertura do WhatsApp. Permita pop-ups ou copie o link manualmente.", url };
  }
  return { ok: true as const, url };
}

export async function copyWhatsAppMessage(message: string) {
  try {
    await navigator.clipboard.writeText(message);
    return { ok: true as const };
  } catch {
    return { ok: false as const, message: "Não foi possível copiar a mensagem." };
  }
}

export function prepareWhatsAppMessage(report: GeneratedMarketReport | null, briefing: string, targets: ReportSendTarget[]) {
  const names = targets.map((target) => target.name).join(", ") || "equipe comercial";
  const reportLine = report ? `Relatório: ${report.title} | Período: ${report.period}` : "Briefing geral de mercado PADAP";
  return `${reportLine}

Destinatários: ${names}

${briefing}

Aviso: na versão atual, o WhatsApp Web abre com a mensagem pronta. Anexe o PDF manualmente antes de enviar.`;
}

export function getWhatsAppWebUrl(phone: string | undefined, message: string) {
  return phone && validatePhoneNumberBR(phone)
    ? createWhatsAppUrl(phone, message)
    : `https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}

export function registerReportSendHistory(report: GeneratedMarketReport | null, targets: ReportSendTarget[], status: WhatsAppSendStatus, briefing: string): ReportSendHistory {
  return {
    id: `send-${Date.now()}`,
    date: new Date().toISOString(),
    report: report?.title ?? "Briefing WhatsApp",
    period: report?.period ?? "Hoje",
    generatedBy: report?.generatedBy ?? "PADAP Intelligence",
    targets: targets.map((target) => target.name),
    status,
    method: "manual",
    briefing
  };
}

export function sendReportManualMode(report: GeneratedMarketReport | null, targets: ReportSendTarget[], briefing: string) {
  const message = prepareWhatsAppMessage(report, briefing, targets);
  const result = targets[0] ? openWhatsAppWeb(targets[0].phone, message) : { ok: false as const, message: "Selecione pelo menos um destinatário." };
  if (!result.ok) throw new Error(result.message);
  return registerReportSendHistory(report, targets, "aguardando_confirmacao", briefing);
}

export async function sendReportViaWhatsAppApiPlaceholder(): Promise<never> {
  throw new Error("API futura deve ser executada no backend, nunca com token no front-end.");
}
