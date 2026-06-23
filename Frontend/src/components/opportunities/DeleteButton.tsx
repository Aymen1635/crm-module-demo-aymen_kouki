'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteOpportunity } from '@/lib/api';

export function DeleteButton({ opportunityId }: { opportunityId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (
      !confirm(
        'Are you sure you want to delete this opportunity? This cannot be undone.',
      )
    ) {
      return;
    }
    setLoading(true);
    try {
      await deleteOpportunity(opportunityId);
      router.push('/opportunities');
      router.refresh();
    } catch {
      alert('Failed to delete. Please try again.');
      setLoading(false);
    }
  }

  return (
    <button
      className="btn btn-danger btn-sm"
      onClick={handleDelete}
      disabled={loading}
    >
      {loading ? '…' : '🗑 Delete'}
    </button>
  );
}
