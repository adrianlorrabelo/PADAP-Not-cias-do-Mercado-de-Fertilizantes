import type { BroadcastHistory, BroadcastManualStatus, ProducerContact, ProducerContactStatus, ReportAudience } from "../types";
import { formatPhoneNumberBR, normalizePhoneNumber, validatePhoneNumberBR } from "./whatsappReportService";

const PRODUCERS_KEY = "padap.broadcast.producers";
const GROUPS_KEY = "padap.broadcast.groups";
const HISTORY_KEY = "padap.broadcast.history";

export const defaultBroadcastGroups = [
  "Cafe",
  "Alho",
  "Cenoura",
  "HF",
  "Soja",
  "Milho",
  "Clientes estrategicos",
  "Sao Gotardo",
  "Rio Paranaiba",
  "PADAP"
];

export type ProducerContactInput = {
  name: string;
  farm: string;
  whatsapp: string;
  city: string;
  mainCrop: string;
  groups: string[];
  notes: string;
  status: ProducerContactStatus;
};

export type BroadcastHistoryInput = {
  producer: ProducerContact;
  reportType: ReportAudience;
  reportDate: string;
  period: string;
  status: BroadcastManualStatus;
  notes: string;
  message: string;
};

export function getProducerContacts(): ProducerContact[] {
  return (readLocal<ProducerContact[]>(PRODUCERS_KEY) ?? []).map(hydrateProducer);
}

export function saveProducerContacts(producers: ProducerContact[]) {
  writeLocal(PRODUCERS_KEY, producers.map(hydrateProducer));
}

export function getBroadcastGroups(): string[] {
  const stored = readLocal<string[]>(GROUPS_KEY) ?? [];
  return uniqueClean([...defaultBroadcastGroups, ...stored]);
}

export function saveBroadcastGroups(groups: string[]) {
  writeLocal(GROUPS_KEY, uniqueClean(groups));
}

export function getBroadcastHistory(): BroadcastHistory[] {
  return readLocal<BroadcastHistory[]>(HISTORY_KEY) ?? [];
}

export function saveBroadcastHistory(history: BroadcastHistory[]) {
  writeLocal(HISTORY_KEY, history);
}

export function createProducerContact(input: ProducerContactInput, producers = getProducerContacts()) {
  const validation = validateProducerContactInput(input, producers);
  if (!validation.ok) return validation;

  const now = new Date().toISOString();
  const producer: ProducerContact = {
    id: `producer-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: input.name.trim(),
    farm: input.farm.trim(),
    whatsapp: validation.whatsapp,
    formattedWhatsapp: formatPhoneNumberBR(validation.whatsapp),
    city: input.city.trim(),
    mainCrop: input.mainCrop.trim(),
    groups: uniqueClean(input.groups),
    notes: input.notes.trim(),
    status: input.status,
    createdAt: now,
    updatedAt: now
  };

  return { ok: true as const, producer, producers: [producer, ...producers] };
}

export function updateProducerContact(id: string, input: ProducerContactInput, producers = getProducerContacts()) {
  const validation = validateProducerContactInput(input, producers, id);
  if (!validation.ok) return validation;

  const updated = producers.map((producer) => producer.id === id
    ? hydrateProducer({
      ...producer,
      name: input.name.trim(),
      farm: input.farm.trim(),
      whatsapp: validation.whatsapp,
      city: input.city.trim(),
      mainCrop: input.mainCrop.trim(),
      groups: uniqueClean(input.groups),
      notes: input.notes.trim(),
      status: input.status,
      updatedAt: new Date().toISOString()
    })
    : producer);

  return { ok: true as const, producers: updated };
}

export function deleteProducerContact(id: string, producers = getProducerContacts()) {
  return producers.filter((producer) => producer.id !== id);
}

export function duplicateProducerContact(id: string, producers = getProducerContacts()) {
  const source = producers.find((producer) => producer.id === id);
  if (!source) return { ok: false as const, message: "Produtor nao encontrado." };
  const now = new Date().toISOString();
  const copy: ProducerContact = {
    ...source,
    id: `producer-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: `${source.name} (copia)`,
    createdAt: now,
    updatedAt: now
  };
  return { ok: true as const, producers: [copy, ...producers] };
}

export function registerBroadcastHistory(input: BroadcastHistoryInput, history = getBroadcastHistory()) {
  const item: BroadcastHistory = {
    id: `broadcast-history-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    producerId: input.producer.id,
    producerName: input.producer.name,
    farm: input.producer.farm,
    whatsapp: input.producer.formattedWhatsapp,
    reportType: input.reportType,
    reportDate: input.reportDate,
    period: input.period,
    status: input.status,
    sentAt: new Date().toISOString(),
    notes: input.notes,
    message: input.message
  };
  const updated = [item, ...history];
  saveBroadcastHistory(updated);
  return { item, history: updated };
}

export function validateProducerContactInput(input: ProducerContactInput, producers: ProducerContact[], editingId?: string) {
  if (!input.name.trim()) return { ok: false as const, message: "Informe o nome do produtor." };
  if (!input.farm.trim()) return { ok: false as const, message: "Informe a fazenda." };
  const whatsapp = normalizePhoneNumber(input.whatsapp);
  if (!whatsapp) return { ok: false as const, message: "Informe o WhatsApp." };
  if (!validatePhoneNumberBR(whatsapp)) return { ok: false as const, message: "Informe um WhatsApp brasileiro valido com DDD." };
  const duplicated = producers.some((producer) => producer.id !== editingId && normalizePhoneNumber(producer.whatsapp) === whatsapp);
  if (duplicated) return { ok: false as const, message: "Este WhatsApp ja esta cadastrado." };
  return { ok: true as const, whatsapp };
}

export function buildProducerMessage(name: string, period: string) {
  return `Ola, ${name}! Tudo bem?

Segue o Relatorio de Mercado da PADAP Intelligence referente ao periodo ${period}.

O material traz uma leitura objetiva sobre fertilizantes, frete, cambio e recomendacoes praticas para apoiar sua tomada de decisao.

Atenciosamente,
PADAP Intelligence`;
}

export function createProducerWhatsAppUrl(producer: ProducerContact, message: string) {
  return `https://wa.me/${normalizePhoneNumber(producer.whatsapp)}?text=${encodeURIComponent(message)}`;
}

export function parseGroups(value: string) {
  return uniqueClean(value.split(/[;,]/));
}

export function uniqueClean(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function hydrateProducer(producer: ProducerContact): ProducerContact {
  const whatsapp = normalizePhoneNumber(producer.whatsapp);
  return {
    ...producer,
    whatsapp,
    formattedWhatsapp: formatPhoneNumberBR(whatsapp),
    groups: uniqueClean(producer.groups ?? [])
  };
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
