import React from 'react';

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  confirmStyle = 'primary',
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div
      className="sc-modal-overlay"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="sc-modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="sc-button-row sc-button-row--end">
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
