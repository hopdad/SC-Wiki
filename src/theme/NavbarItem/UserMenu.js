import React from 'react';
import {useAuth} from '../../contexts/AuthContext';
import {useNotifications} from '../../hooks/useNotifications';
import {ROLE_LABELS, ROLE_COLORS} from '../../lib/roles';

const badgeStyle = {
  marginLeft: 6,
  fontSize: '0.65rem',
  padding: '1px 5px',
  borderRadius: 10,
  backgroundColor: '#E31837',
  color: 'white',
  fontWeight: 700,
  verticalAlign: 'middle',
};

export default function UserMenu() {
  const {isAuthenticated, isReviewer, isAdmin, role, profile, signIn, signOut, loading} = useAuth();
  const {pendingCount} = useNotifications();

  if (loading) {
    return <span className="navbar__item" style={{opacity: 0.5, fontSize: '0.85rem'}}>...</span>;
  }

  if (!isAuthenticated) {
    return (
      <button
        className="navbar__item navbar__link"
        onClick={signIn}
        style={{cursor: 'pointer', background: 'none', border: 'none', color: 'inherit'}}
      >
        Sign In
      </button>
    );
  }

  return (
    <div className="navbar__item dropdown dropdown--hoverable dropdown--right">
      <button
        className="navbar__link"
        style={{cursor: 'pointer', background: 'none', border: 'none', color: 'inherit', position: 'relative'}}
        aria-label="User menu"
        aria-haspopup="true"
      >
        {profile?.display_name || profile?.email}
        <span
          style={{
            marginLeft: 6,
            fontSize: '0.7rem',
            padding: '2px 6px',
            borderRadius: 3,
            backgroundColor: ROLE_COLORS[role],
            color: 'white',
            verticalAlign: 'middle',
          }}
        >
          {ROLE_LABELS[role]}
        </span>
        {pendingCount > 0 && isReviewer && (
          <span style={badgeStyle} aria-label={`${pendingCount} pending reviews`}>
            {pendingCount > 99 ? '99+' : pendingCount}
          </span>
        )}
      </button>
      <ul className="dropdown__menu" role="menu">
        <li role="none">
          <a className="dropdown__link" href="/proposals" role="menuitem">
            My Proposals
          </a>
        </li>
        {isReviewer && (
          <li role="none">
            <a className="dropdown__link" href="/review" role="menuitem">
              Review Queue
              {pendingCount > 0 && (
                <span style={badgeStyle}>{pendingCount}</span>
              )}
            </a>
          </li>
        )}
        {isAdmin && (
          <li role="none">
            <a className="dropdown__link" href="/admin" role="menuitem">
              Admin Panel
            </a>
          </li>
        )}
        <li role="none">
          <hr className="dropdown__separator" />
        </li>
        <li role="none">
          <button
            className="dropdown__link"
            onClick={signOut}
            role="menuitem"
            style={{cursor: 'pointer', background: 'none', border: 'none', width: '100%', textAlign: 'left'}}
          >
            Sign Out
          </button>
        </li>
      </ul>
    </div>
  );
}
