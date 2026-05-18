import type { WhatsAppRecipient, WhatsAppSendHistory, WhatsAppSendStatus } from "../types";
import { createWhatsAppUrl, formatPhoneNumberBR, normalizePhoneNumber, validatePhoneNumberBR } from "./whatsappReportService";

const RECIPIENTS_KEY = "padap.market.whatsappRecipients";
const HISTORY_KEY = "padap.market.whatsappSendHistory";

const defaultRecipients: WhatsAppRecipient[] = [
  buildRecipient("João Silva", "Consultor comercial", "5534999999999", "Consultores PADAP", true, true),
  buildRecipient("Pedro Santos", "Consultor comercial", "5534988888888", "Consultores PADAP", true, true),
  buildRecipient("Mariana Costa", "Gerente comercial", "5534977777777", "Gestão Comercial", true, true),
  buildRecipient("Equipe Compras", "Compras / Precificação", "5534966666666", "Compras PADAP", true, false)
];

export function getRecipients(): WhatsAppRecipient[] {
  const parsed = readLocal<WhatsAppRecipient[]>(RECIPIENTS_KEY);
  if (parsed?.length) return parsed.map(hydrateRecipientPhone);
  saveRecipients(defaultRecipients);
  return defaultRecipients;
}

export function saveRecipients(recipients: WhatsAppRecipient[]) {
  writeLocal(RECIPIENTS_KEY, recipients.map(hydrateRecipientPhone));
}

export function createRecipient(input: RecipientInput, recipients = getRecipients()) {
  const validation = validateRecipientInput(input, recipients);
  if (!validation.ok) return validation;

  const now = new Date().toISOString();
  const recipient: WhatsAppRecipient = {
    id: `recipient-${Date.now()}`,
    name: input.name.trim(),
    role: input.role?.trim() || undefined,
    phone: validation.phone,
    formattedPhone: formatPhoneNumberBR(validation.phone),
    group: input.group?.trim() || undefined,
    status: input.status,
    receivesMarketReport: input.receivesMarketReport,
    receivesBriefing: input.receivesBriefing,
    notes: input.notes?.trim() || undefined,
    createdAt: now,
    updatedAt: now
  };
  return { ok: true as const, recipient, recipients: [...recipients, recipient] };
}

export function updateRecipient(id: string, input: RecipientInput, recipients = getRecipients()) {
  const validation = validateRecipientInput(input, recipients, id);
  if (!validation.ok) return validation;

  const updated = recipients.map((recipient) => recipient.id === id
    ? {
      ...recipient,
      name: input.name.trim(),
      role: input.role?.trim() || undefined,
      phone: validation.phone,
      formattedPhone: formatPhoneNumberBR(validation.phone),
      group: input.group?.trim() || undefined,
      status: input.status,
      receivesMarketReport: input.receivesMarketReport,
      receivesBriefing: input.receivesBriefing,
      notes: input.notes?.trim() || undefined,
      updatedAt: new Date().toISOString()
    }
    : recipient);
  return { ok: true as const, recipients: updated };
}

export function deactivateRecipient(id: string, recipients = getRecipients()) {
  return changeRecipientStatus(id, "inativo", recipients);
}

export function activateRecipient(id: string, recipients = getRecipients()) {
  return changeRecipientStatus(id, "ativo", recipients);
}

export function deleteRecipient(id: string, recipients = getRecipients()) {
  return recipients.filter((recipient) => recipient.id !== id);
}

export function getActiveReportRecipients(recipients = getRecipients()) {
  return recipients.filter((recipient) => recipient.status === "ativo" && recipient.receivesMarketReport);
}

export function getActiveBriefingRecipients(recipients = getRecipients()) {
  return recipients.filter((recipient) => recipient.status === "ativo" && recipient.receivesBriefing);
}

export function validatePhoneNumber(value: string) {
  const normalized = normalizePhoneNumber(value);
  if (!normalized) return { ok: false as const, message: "Informe o telefone/WhatsApp." };
  if (!validatePhoneNumberBR(normalized)) return { ok: false as const, message: "Informe um WhatsApp brasileiro válido com DDD." };
  return { ok: true as const, phone: normalized };
}

export function getWhatsAppSendHistory(): WhatsAppSendHistory[] {
  return readLocal<WhatsAppSendHistory[]>(HISTORY_KEY) ?? [];
}

export function registerWhatsAppSendHistory(item: Omit<WhatsAppSendHistory, "id" | "date" | "method"> & { method?: "manual" | "api_futura"; status?: WhatsAppSendStatus }) {
  const history = getWhatsAppSendHistory();
  const next: WhatsAppSendHistory = {
    ...item,
    id: `whatsapp-history-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    date: new Date().toISOString(),
    method: item.method ?? "manual",
    status: item.status ?? "enviado_manual"
  };
  const updated = [next, ...history];
  writeLocal(HISTORY_KEY, updated);
  return { item: next, history: updated };
}

export function openWhatsAppWebMessage(phone: string | undefined, message: string) {
  const normalized = phone ? normalizePhoneNumber(phone) : "";
  const url = normalized && validatePhoneNumberBR(normalized)
    ? createWhatsAppUrl(normalized, message)
    : `https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  return window.open(url, "_blank", "noopener,noreferrer");
}

export async function sendViaWhatsAppApiPlaceholder(): Promise<never> {
  throw new Error("Envio real exige Meta Business, WABA, número oficial, backend seguro, token protegido no servidor, upload do PDF como documento, templates aprovados quando necessário e opt-in dos destinatários.");
}

export type RecipientInput = {
  name: string;
  role?: string;
  phone: string;
  group?: string;
  status: "ativo" | "inativo";
  receivesMarketReport: boolean;
  receivesBriefing: boolean;
  notes?: string;
};

function validateRecipientInput(input: RecipientInput, recipients: WhatsAppRecipient[], editingId?: string) {
  if (!input.name.trim()) return { ok: false as const, message: "Informe o nome do destinatário." };
  const phoneValidation = validatePhoneNumber(input.phone);
  if (!phoneValidation.ok) return phoneValidation;
  const duplicated = recipients.some((recipient) => recipient.id !== editingId && normalizePhoneNumber(recipient.phone) === phoneValidation.phone);
  if (duplicated) return { ok: false as const, message: "Este WhatsApp já está cadastrado." };
  return { ok: true as const, phone: phoneValidation.phone };
}

function changeRecipientStatus(id: string, status: "ativo" | "inativo", recipients: WhatsAppRecipient[]) {
  return recipients.map((recipient) => recipient.id === id ? { ...recipient, status, updatedAt: new Date().toISOString() } : recipient);
}

function buildRecipient(name: string, role: string, phone: string, group: string, receivesMarketReport: boolean, receivesBriefing: boolean): WhatsAppRecipient {
  const now = new Date().toISOString();
  const normalized = normalizePhoneNumber(phone);
  return {
    id: `recipient-${normalized}`,
    name,
    role,
    phone: normalized,
    formattedPhone: formatPhoneNumberBR(normalized),
    group,
    status: "ativo",
    receivesMarketReport,
    receivesBriefing,
    notes: "",
    createdAt: now,
    updatedAt: now
  };
}

function hydrateRecipientPhone(recipient: WhatsAppRecipient): WhatsAppRecipient {
  const phone = normalizePhoneNumber(recipient.phone);
  return { ...recipient, phone, formattedPhone: formatPhoneNumberBR(phone) };
}

function readLocal<T>(key: string): T | null {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : null;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

function writeLocal<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export { formatPhoneNumberBR, normalizePhoneNumber, validatePhoneNumberBR };
