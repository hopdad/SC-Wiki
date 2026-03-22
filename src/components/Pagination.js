import React from 'react';

export default function Pagination({page, totalPages, onPageChange}) {
  if (totalPages <= 1) return null;

  return (
    <div className="sc-pagination">
      <button
        className="button button--outline button--sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </button>
      <span className="sc-text-sm sc-text-muted">
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
