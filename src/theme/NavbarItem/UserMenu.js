import React from 'react';
import {useAuth} from '../../contexts/AuthContext';
import {useNotifications} from '../../hooks/useNotifications';
import {ROLE_LABELS, ROLE_COLORS} from '../../lib/roles';

export default function UserMenu() {
  const {isAuthenticated, isReviewer, isAdmin, role, profile, signIn, signOut, loading, error, clearError} = useAuth();
  const {pendingCount} = useNotifications();

  if (loading) {
    return <span className="navbar__item sc-text-sm sc-text-muted">...</span>;
  }

  if (!isAuthenticated) {
    return (
      <>
        {error && (
          <span className="navbar__item sc-text-sm" style={{color: '#FF4D6A'}} title={error}>
            Sign-in failed
            <button className="sc-unstyled-btn sc-dismiss-btn sc-text-sm" onClick={clearError} style={{color: '#FF4D6A'}}>x</button>
          </span>
        )}
        <button className="navbar__item navbar__link sc-unstyled-btn" onClick={signIn}>
          Sign In
        </button>
      </>
    );
  }

  return (
    <div className="navbar__item dropdown dropdown--hoverable dropdown--right">
      <button
        className="navbar__link sc-unstyled-btn"
        style={{position: 'relative'}}
        aria-label="User menu"
        aria-haspopup="true"
      >
        {profile?.display_name || profile?.email}
        <span className="sc-role-badge" style={{backgroundColor: ROLE_COLORS[role]}}>
          {ROLE_LABELS[role]}
        </span>
        {pendingCount > 0 && isReviewer && (
          <span className="sc-notification-badge" aria-label={`${pendingCount} pending reviews`}>
            {pendingCount > 99 ? '99+' : pendingCount}
          </span>
        )}
      </button>
      <ul className="dropdown__menu" role="menu">
        <li role="none">
          <a className="dropdown__link" href="/proposals" role="menuitem">My Proposals</a>
        </li>
        {isReviewer && (
          <li role="none">
            <a className="dropdown__link" href="/review" role="menuitem">
              Review Queue
              {pendingCount > 0 && <span className="sc-notification-badge">{pendingCount}</span>}
            </a>
          </li>
        )}
        {isAdmin && (
          <li role="none">
            <a className="dropdown__link" href="/admin" role="menuitem">Admin Panel</a>
          </li>
        )}
        <li role="none"><hr className="dropdown__separator" /></li>
        <li role="none">
          <button className="dropdown__link sc-unstyled-btn sc-unstyled-btn--full" onClick={signOut} role="menuitem">
            Sign Out
          </button>
        </li>
      </ul>
    </div>
  );
}
