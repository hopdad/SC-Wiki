import React from 'react';

/**
 * Floating print button for documentation pages.
 * Triggers browser print dialog which uses @media print CSS to hide
 * nav/sidebar/footer and format content for physical printing.
 */
export default function PrintButton() {
  return (
    <button
      className="button button--outline button--sm sc-print-btn"
      onClick={() => window.print()}
      title="Print this page"
      aria-label="Print this page"
    >
      <PrintIcon /> Print
    </button>
  );
}

function PrintIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{marginRight: '0.35rem', verticalAlign: 'text-bottom'}}>
      <path d="M4 1h8v3H4V1zm-1 3h10a2 2 0 0 1 2 2v4a1 1 0 0 1-1 1h-2v3H4v-3H2a1 1 0 0 1-1-1V6a2 2 0 0 1 2-2zm2 6v4h6v-4H5zm6-3a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
    </svg>
  );
}
