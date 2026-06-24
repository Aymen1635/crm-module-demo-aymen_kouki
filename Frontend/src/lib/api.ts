import { cache } from 'react';
import type {
  PaginatedResult,
  OpportunityListItem,
  OpportunityDetail,
  PipelineSummary,
  ClientSummary,
  CreateOpportunityPayload,
  UpdateOpportunityPayload,
  CreateClientPayload,
  ApiError,
} from './types';

/* ═══════════════════════════════════════════════════════════════
   API Client — typed fetch wrapper
   ═══════════════════════════════════════════════════════════════ */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
const API_PREFIX = '/api';

function apiUrl(path: string): string {
  // In server components, use full URL. In client, use relative (rewrite proxy).
  if (typeof window === 'undefined') {
    return `${BASE_URL}${API_PREFIX}${path}`;
  }
  return `${API_PREFIX}${path}`;
}

class ApiClientError extends Error {
  constructor(
    public status: number,
    public body: ApiError,
  ) {
    super(body.message);
    this.name = 'ApiClientError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = apiUrl(path);

  const maxRetries = 5;
  const retryDelay = 2000;
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        cache: 'no-store', // always fresh data
      });

      // 204 No Content (e.g. DELETE)
      if (res.status === 204) {
        return undefined as T;
      }

      const body = await res.json();

      if (!res.ok) {
        throw new ApiClientError(res.status, body as ApiError);
      }

      return body as T;
    } catch (err: any) {
      lastError = err;
      // Retry on network errors (like ECONNREFUSED) in server components
      const isNetworkError = 
        err?.message === 'fetch failed' || 
        err?.cause?.code === 'ECONNREFUSED';

      if (attempt < maxRetries && isNetworkError) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}

/* ─── Opportunities ──────────────────────────────────────────── */

export function fetchOpportunities(
  params?: Record<string, string | string[]>,
): Promise<PaginatedResult<OpportunityListItem>> {
  if (!params) return request('/opportunities');
  const qs = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (Array.isArray(val)) {
      val.forEach((v) => qs.append(key, v));
    } else {
      qs.set(key, val);
    }
  }
  return request(`/opportunities?${qs.toString()}`);
}

// cache() deduplicates calls with the same id within a single server render,
// so generateMetadata and the page body share one HTTP request.
export const fetchOpportunity = cache(function fetchOpportunityImpl(
  id: string,
): Promise<OpportunityDetail> {
  return request(`/opportunities/${id}`);
});

export function createOpportunity(
  data: CreateOpportunityPayload,
): Promise<OpportunityListItem> {
  return request('/opportunities', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateOpportunity(
  id: string,
  data: UpdateOpportunityPayload,
): Promise<OpportunityListItem> {
  return request(`/opportunities/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteOpportunity(id: string): Promise<void> {
  return request(`/opportunities/${id}`, { method: 'DELETE' });
}

/* ─── Clients ────────────────────────────────────────────────── */

export function fetchClients(
  type?: string,
): Promise<ClientSummary[]> {
  const qs = type ? `?type=${type}` : '';
  return request(`/clients${qs}`);
}

export function createClient(
  data: CreateClientPayload,
): Promise<ClientSummary> {
  return request('/clients', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/* ─── Pipeline ───────────────────────────────────────────────── */

export function fetchPipelineSummary(): Promise<PipelineSummary> {
  return request('/pipeline/summary');
}

export { ApiClientError };
