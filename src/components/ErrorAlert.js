import React from 'react';

export default function ErrorAlert({error, onDismiss}) {
  if (!error) return null;

  return (
    <div className="alert alert--danger sc-alert-mb">
      {error}
      <button className="button button--sm button--link sc-dismiss-btn" onClick={onDismiss}>
        Dismiss
      </button>
    </div>
  );
}
