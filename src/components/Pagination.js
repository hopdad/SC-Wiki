import React from 'react';

/**
 * Simple pagination controls.
 * Usage: <Pagination page={1} totalPages={5} onPageChange={setPage} />
 */
export default function Pagination({page, totalPages, onPageChange}) {
  if (totalPages <= 1) return null;

  return (
    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem'}}>
      <button
        className="button button--outline button--sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </button>
      <span style={{fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)'}}>
        Page {page} of {totalPages}
      </span>
      <button
        className="button button--outline button--sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}
