import type { ClientType, OpportunityStage, RiskLabel, OpportunityClient } from './types';

/* ═══════════════════════════════════════════════════════════════
   Formatting utilities
   ═══════════════════════════════════════════════════════════════ */

/**
 * Format cents to a display-ready currency string.
 * e.g. 150000 → "1 500,00 €"
 */
export function formatCurrency(
  cents: number,
  currency: string = 'EUR',
): string {
  const amount = cents / 100;
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Short currency format (no decimals for large amounts).
 * e.g. 1500000 → "15 000 €"
 */
export function formatCurrencyShort(
  cents: number,
  currency: string = 'EUR',
): string {
  const amount = cents / 100;
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a date string to a readable date.
 * e.g. "2026-07-15" → "15 juil. 2026"
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Format to ISO date for input[type=date].
 * e.g. "2026-07-15T00:00:00.000Z" → "2026-07-15"
 */
export function toInputDate(dateStr: string): string {
  return new Date(dateStr).toISOString().split('T')[0];
}

/* ─── Display name ───────────────────────────────────────────── */

export function getClientDisplayName(client: {
  type: ClientType;
  companyName: string | null;
  firstName: string | null;
  lastName: string | null;
}): string {
  if (client.type === 'COMPANY') {
    return client.companyName ?? 'Unnamed Company';
  }
  const parts = [client.firstName, client.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : 'Unnamed Client';
}

export function getClientInitials(client: {
  type: ClientType;
  companyName: string | null;
  firstName: string | null;
  lastName: string | null;
}): string {
  if (client.type === 'COMPANY') {
    return (client.companyName ?? 'C').charAt(0).toUpperCase();
  }
  const f = (client.firstName ?? '').charAt(0).toUpperCase();
  const l = (client.lastName ?? '').charAt(0).toUpperCase();
  return f + l || '?';
}

/* ─── Stage labels ───────────────────────────────────────────── */

export const STAGE_LABELS: Record<OpportunityStage, string> = {
  LEAD: 'Lead',
  QUALIFIED: 'Qualified',
  PROPOSAL: 'Proposal',
  NEGOTIATION: 'Negotiation',
  WON: 'Won',
  LOST: 'Lost',
};

export const STAGE_BADGE_CLASS: Record<OpportunityStage, string> = {
  LEAD: 'badge-lead',
  QUALIFIED: 'badge-qualified',
  PROPOSAL: 'badge-proposal',
  NEGOTIATION: 'badge-negotiation',
  WON: 'badge-won',
  LOST: 'badge-lost',
};

export const STAGE_COLORS: Record<OpportunityStage, string> = {
  LEAD: '#94a3b8',
  QUALIFIED: '#60a5fa',
  PROPOSAL: '#a78bfa',
  NEGOTIATION: '#fb923c',
  WON: '#22c55e',
  LOST: '#64748b',
};

/* ─── Risk labels ────────────────────────────────────────────── */

export function getRiskBadgeClass(risk: RiskLabel): string | null {
  if (risk === 'late') return 'badge-late';
  if (risk === 'stagnant') return 'badge-stagnant';
  return null;
}

export function getRiskLabel(risk: RiskLabel): string | null {
  if (risk === 'late') return 'Late';
  if (risk === 'stagnant') return 'Stagnant';
  return null;
}

export function getRiskDescription(risk: RiskLabel): string | null {
  if (risk === 'late') return 'Expected signature date has passed — this deal needs immediate attention.';
  if (risk === 'stagnant') return 'No stage change in over 14 days — consider following up.';
  return null;
}

/* ─── Client type labels ─────────────────────────────────────── */

export const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  COMPANY: 'Company',
  INDIVIDUAL: 'Individual',
};

export const CLIENT_TYPE_BADGE_CLASS: Record<ClientType, string> = {
  COMPANY: 'badge-company',
  INDIVIDUAL: 'badge-individual',
};

/* ─── All stages for select options ──────────────────────────── */

export const ALL_STAGES: OpportunityStage[] = [
  'LEAD',
  'QUALIFIED',
  'PROPOSAL',
  'NEGOTIATION',
  'WON',
  'LOST',
];

export const ALL_CLIENT_TYPES: ClientType[] = ['COMPANY', 'INDIVIDUAL'];
