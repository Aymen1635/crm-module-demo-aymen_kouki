'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { OpportunityListItem, ClientSummary, OpportunityStage, ClientType } from '@/lib/types';
import {
  createOpportunity,
  updateOpportunity,
  fetchClients,
  createClient,
  ApiClientError,
} from '@/lib/api';
import {
  ALL_STAGES,
  STAGE_LABELS,
  getClientDisplayName,
  toInputDate,
} from '@/lib/utils';

interface OpportunityFormProps {
  /** When editing, pass the existing opportunity to pre-populate */
  opportunity?: OpportunityListItem & { client?: { id: string } };
}

interface FormState {
  clientId: string;
  title: string;
  amountEuros: string;
  currency: string;
  expectedSignatureDate: string;
  stage: OpportunityStage;
}

interface NewClientState {
  type: ClientType;
  companyName: string;
  legalId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

interface FormErrors {
  clientId?: string;
  title?: string;
  amountEuros?: string;
  expectedSignatureDate?: string;
  stage?: string;
  _server?: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export function OpportunityForm({ opportunity }: OpportunityFormProps) {
  const router = useRouter();
  const isEditing = Boolean(opportunity);

  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [isCreatingClient, setIsCreatingClient] = useState(false);

  const [form, setForm] = useState<FormState>({
    clientId: opportunity?.client?.id ?? '',
    title: opportunity?.title ?? '',
    amountEuros: opportunity ? String(opportunity.amountCents / 100) : '',
    currency: opportunity?.currency ?? 'EUR',
    expectedSignatureDate: opportunity
      ? toInputDate(opportunity.expectedSignatureDate)
      : '',
    stage: opportunity?.stage ?? 'LEAD',
  });

  const [newClient, setNewClient] = useState<NewClientState>({
    type: 'COMPANY',
    companyName: '',
    legalId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Persists the client id across retries so a failed opportunity creation
  // doesn't silently create a duplicate client on re-submit.
  const createdClientIdRef = useRef<string | null>(null);

  useEffect(() => {
    fetchClients()
      .then(setClients)
      .catch(() => setClients([]))
      .finally(() => setClientsLoading(false));
  }, []);

  function set(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function setNewClientVal(key: keyof NewClientState, value: string) {
    setNewClient((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function validate(): boolean {
    const next: FormErrors = {};

    if (isCreatingClient) {
      if (newClient.type === 'COMPANY' && !newClient.companyName.trim()) {
        next.companyName = 'Company name is required.';
      }
      if (newClient.type === 'INDIVIDUAL') {
        if (!newClient.firstName.trim()) next.firstName = 'First name is required.';
        if (!newClient.lastName.trim()) next.lastName = 'Last name is required.';
      }
      if (!newClient.email.trim()) {
        next.email = 'Email is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newClient.email.trim())) {
        next.email = 'Please enter a valid email address.';
      }
    } else {
      if (!form.clientId) next.clientId = 'Please select a client.';
    }

    if (!form.title.trim()) next.title = 'Title is required.';
    else if (form.title.length > 255) next.title = 'Title must be ≤ 255 characters.';

    const amount = parseFloat(form.amountEuros);
    if (!form.amountEuros) next.amountEuros = 'Amount is required.';
    else if (isNaN(amount) || amount <= 0) next.amountEuros = 'Amount must be a positive number.';

    if (!form.expectedSignatureDate) {
      next.expectedSignatureDate = 'Expected signature date is required.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});

    const amountCents = Math.round(parseFloat(form.amountEuros) * 100);

    try {
      let finalClientId = form.clientId;

      if (isCreatingClient) {
        if (!createdClientIdRef.current) {
          const createdClient = await createClient({
            type: newClient.type,
            companyName: newClient.type === 'COMPANY' ? newClient.companyName.trim() : undefined,
            legalId: newClient.type === 'COMPANY' && newClient.legalId.trim() ? newClient.legalId.trim() : undefined,
            firstName: newClient.type === 'INDIVIDUAL' ? newClient.firstName.trim() : undefined,
            lastName: newClient.type === 'INDIVIDUAL' ? newClient.lastName.trim() : undefined,
            email: newClient.email.trim(),
            phone: newClient.phone.trim() || undefined,
            address: newClient.address.trim() || undefined,
            notes: newClient.notes.trim() || undefined,
          });
          createdClientIdRef.current = createdClient.id;
        }
        finalClientId = createdClientIdRef.current;
      }

      const payload = {
        clientId: finalClientId,
        title: form.title.trim(),
        amountCents,
        currency: form.currency,
        expectedSignatureDate: form.expectedSignatureDate,
        stage: form.stage,
      };

      if (isEditing && opportunity) {
        const updated = await updateOpportunity(opportunity.id, payload);
        router.push(`/opportunities/${updated.id}`);
      } else {
        const created = await createOpportunity(payload);
        router.push(`/opportunities/${created.id}`);
      }
    } catch (err: unknown) {
      if (err instanceof ApiClientError && err.body.errors?.length) {
        setErrors({ _server: err.body.errors.join(' · ') });
      } else {
        const message =
          err instanceof Error ? err.message : 'An unexpected error occurred.';
        setErrors({ _server: message });
      }
      setSubmitting(false);
    }
  }

  return (
    <form className="form-page" onSubmit={handleSubmit} noValidate>
      <div className="form-card">
        {errors._server && (
          <div className="error-state" style={{ marginBottom: '20px' }}>
            ⚠️ {errors._server}
          </div>
        )}

        <div className="form-panels">
          {/* ─── Left panel: Client ─── */}
          <div className="form-panel">
            <div className="form-section-header">
              <span className="form-section-title">Client</span>
              {!isEditing && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setIsCreatingClient(!isCreatingClient);
                    setErrors({});
                  }}
                >
                  {isCreatingClient ? '✕ Cancel' : '+ New client'}
                </button>
              )}
            </div>

            {isCreatingClient ? (
              <>
                <div className="form-group">
                  <label className="form-label">Client Type</label>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="clientType"
                        checked={newClient.type === 'COMPANY'}
                        onChange={() => setNewClientVal('type', 'COMPANY')}
                      />
                      Company
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="clientType"
                        checked={newClient.type === 'INDIVIDUAL'}
                        onChange={() => setNewClientVal('type', 'INDIVIDUAL')}
                      />
                      Individual
                    </label>
                  </div>
                </div>

                {newClient.type === 'COMPANY' ? (
                  <>
                    <div className="form-group">
                      <label className="form-label">Company Name <span className="required">*</span></label>
                      <input
                        type="text"
                        className={`form-input ${errors.companyName ? 'error' : ''}`}
                        value={newClient.companyName}
                        onChange={(e) => setNewClientVal('companyName', e.target.value)}
                      />
                      {errors.companyName && <span className="form-error">⚠ {errors.companyName}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Legal ID (SIRET)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. 123 456 789 00012"
                        value={newClient.legalId}
                        onChange={(e) => setNewClientVal('legalId', e.target.value)}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="form-label">First Name <span className="required">*</span></label>
                      <input
                        type="text"
                        className={`form-input ${errors.firstName ? 'error' : ''}`}
                        value={newClient.firstName}
                        onChange={(e) => setNewClientVal('firstName', e.target.value)}
                      />
                      {errors.firstName && <span className="form-error">⚠ {errors.firstName}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Last Name <span className="required">*</span></label>
                      <input
                        type="text"
                        className={`form-input ${errors.lastName ? 'error' : ''}`}
                        value={newClient.lastName}
                        onChange={(e) => setNewClientVal('lastName', e.target.value)}
                      />
                      {errors.lastName && <span className="form-error">⚠ {errors.lastName}</span>}
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label className="form-label">Email <span className="required">*</span></label>
                  <input
                    type="email"
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    value={newClient.email}
                    onChange={(e) => setNewClientVal('email', e.target.value)}
                    placeholder="client@example.com"
                  />
                  {errors.email && <span className="form-error">⚠ {errors.email}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={newClient.phone}
                    onChange={(e) => setNewClientVal('phone', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newClient.address}
                    onChange={(e) => setNewClientVal('address', e.target.value)}
                  />
                </div>
              </>
            ) : (
              <div className="form-group">
                <label className="form-label" htmlFor="clientId">
                  Client <span className="required">*</span>
                </label>
                <select
                  id="clientId"
                  className={`form-select ${errors.clientId ? 'error' : ''}`}
                  value={form.clientId}
                  onChange={(e) => set('clientId', e.target.value)}
                  disabled={clientsLoading || isEditing}
                >
                  <option value="">
                    {clientsLoading ? 'Loading clients…' : 'Select a client'}
                  </option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {getClientDisplayName(c)} — {c.email}
                    </option>
                  ))}
                </select>
                {errors.clientId && (
                  <span className="form-error">⚠ {errors.clientId}</span>
                )}
              </div>
            )}
          </div>

          {/* ─── Right panel: Opportunity Details ─── */}
          <div className="form-panel">
            <div className="form-section-header">
              <span className="form-section-title">Opportunity Details</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="title">
                Title <span className="required">*</span>
              </label>
              <input
                id="title"
                type="text"
                className={`form-input ${errors.title ? 'error' : ''}`}
                placeholder="e.g. Enterprise License Renewal 2026"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                maxLength={255}
              />
              {errors.title && (
                <span className="form-error">⚠ {errors.title}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="amountEuros">
                  Amount <span className="required">*</span>
                </label>
                <div className="amount-input-group">
                  <span className="amount-prefix">{form.currency}</span>
                  <input
                    id="amountEuros"
                    type="number"
                    step="0.01"
                    min="0.01"
                    className={`form-input ${errors.amountEuros ? 'error' : ''}`}
                    placeholder="0.00"
                    value={form.amountEuros}
                    onChange={(e) => set('amountEuros', e.target.value)}
                  />
                </div>
                {errors.amountEuros && (
                  <span className="form-error">⚠ {errors.amountEuros}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="currency">Currency</label>
                <select
                  id="currency"
                  className="form-select"
                  value={form.currency}
                  onChange={(e) => set('currency', e.target.value)}
                >
                  <option value="EUR">EUR — Euro</option>
                  <option value="USD">USD — US Dollar</option>
                  <option value="GBP">GBP — British Pound</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="stage">Stage</label>
              <select
                id="stage"
                className="form-select"
                value={form.stage}
                onChange={(e) => set('stage', e.target.value as OpportunityStage)}
              >
                {ALL_STAGES.map((s) => (
                  <option key={s} value={s}>{STAGE_LABELS[s]}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="expectedSignatureDate">
                Expected signature date <span className="required">*</span>
              </label>
              <input
                id="expectedSignatureDate"
                type="date"
                className={`form-input ${errors.expectedSignatureDate ? 'error' : ''}`}
                value={form.expectedSignatureDate}
                onChange={(e) => set('expectedSignatureDate', e.target.value)}
              />
              {errors.expectedSignatureDate && (
                <span className="form-error">⚠ {errors.expectedSignatureDate}</span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => router.back()}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting || (clientsLoading && !isCreatingClient)}
          >
            {submitting
              ? 'Saving…'
              : isEditing
              ? 'Save changes'
              : 'Create opportunity'}
          </button>
        </div>
      </div>
    </form>
  );
}
