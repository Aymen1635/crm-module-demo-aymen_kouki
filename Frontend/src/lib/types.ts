/* ═══════════════════════════════════════════════════════════════
   Shared TypeScript types — mirrors backend DTOs
   ═══════════════════════════════════════════════════════════════ */

// ─── Enums ──────────────────────────────────────────────────────
export type ClientType = 'COMPANY' | 'INDIVIDUAL';
export type OpportunityStage =
  | 'LEAD'
  | 'QUALIFIED'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST';
export type RiskLabel = 'late' | 'stagnant' | null;

// ─── Client ─────────────────────────────────────────────────────
export interface Client {
  id: string;
  type: ClientType;
  companyName: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClientSummary {
  id: string;
  type: ClientType;
  companyName: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  createdAt: string;
}

// ─── Opportunity ────────────────────────────────────────────────
export interface OpportunityClient {
  id: string;
  type: ClientType;
  companyName: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
}

export interface OpportunityListItem {
  id: string;
  title: string;
  amountCents: number;
  currency: string;
  stage: OpportunityStage;
  expectedSignatureDate: string;
  lastStageChangeAt: string;
  createdAt: string;
  updatedAt: string;
  riskLabel: RiskLabel;
  client: OpportunityClient;
}

export interface OpportunityDetail extends OpportunityListItem {
  client: OpportunityClient & {
    phone: string | null;
    address: string | null;
    notes: string | null;
  };
}

// ─── Pagination ─────────────────────────────────────────────────
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

// ─── Pipeline ───────────────────────────────────────────────────
export interface PipelineStage {
  stage: OpportunityStage;
  count: number;
  totalAmountCents: number;
}

export interface PipelineSummary {
  stages: PipelineStage[];
  totalActiveCents: number;
  atRiskCents: number;
  atRiskCount: number;
}

// ─── API Payloads ───────────────────────────────────────────────
export interface CreateOpportunityPayload {
  clientId: string;
  title: string;
  amountCents: number;
  currency?: string;
  expectedSignatureDate: string;
  stage?: OpportunityStage;
}

export interface UpdateOpportunityPayload {
  clientId?: string;
  title?: string;
  amountCents?: number;
  currency?: string;
  expectedSignatureDate?: string;
  stage?: OpportunityStage;
}

export interface CreateClientPayload {
  type: ClientType;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  address?: string;
  notes?: string;
}

// ─── API Error ──────────────────────────────────────────────────
export interface ApiError {
  statusCode: number;
  message: string;
  errors?: string[];
  timestamp: string;
}
