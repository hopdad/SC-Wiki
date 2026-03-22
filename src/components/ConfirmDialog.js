import React from 'react';

/**
 * Reusable confirmation dialog.
 * Usage:
 *   <ConfirmDialog
 *     open={showConfirm}
 *     title="Reject Proposal?"
 *     message="This cannot be undone."
 *     confirmLabel="Reject"
 *     confirmStyle="danger"
 *     onConfirm={() => handleReject()}
 *     onCancel={() => setShowConfirm(false)}
 *   />
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  confirmStyle = 'primary', // primary, danger, warning, success
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        style={{
          background: 'var(--ifm-background-color)',
          borderRadius: 8,
          padding: '1.5rem',
          maxWidth: 440,
          width: '90%',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{marginTop: 0}}>{title}</h3>
        <p style={{color: 'var(--ifm-color-emphasis-700)'}}>{message}</p>
        <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'flex-end'}}>
          <button className="button button--outline button--sm" onClick={onCancel}>
            Cancel
          </button>
          <button className={`button button--${confirmStyle} button--sm`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
