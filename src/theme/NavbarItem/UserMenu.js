import React from 'react';
import {useAuth} from '../../contexts/AuthContext';

const ROLE_LABELS = {
  viewer: 'Viewer',
  editor: 'Editor',
  reviewer: 'Reviewer',
  admin: 'Admin',
};

const ROLE_COLORS = {
  viewer: '#6B7280',
  editor: '#2563EB',
  reviewer: '#7C3AED',
  admin: '#DC2626',
};

export default function UserMenu() {
  const {isAuthenticated, profile, signIn, signOut, loading} = useAuth();

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

  const role = profile?.role || 'viewer';

  return (
    <div className="navbar__item dropdown dropdown--hoverable dropdown--right">
      <button
        className="navbar__link"
        style={{cursor: 'pointer', background: 'none', border: 'none', color: 'inherit'}}
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
      </button>
      <ul className="dropdown__menu">
        <li>
          <a className="dropdown__link" href="/proposals">
            My Proposals
          </a>
        </li>
        {(role === 'reviewer' || role === 'admin') && (
          <li>
            <a className="dropdown__link" href="/review">
              Review Queue
            </a>
          </li>
        )}
        {role === 'admin' && (
          <li>
            <a className="dropdown__link" href="/admin">
              Admin Panel
            </a>
          </li>
        )}
        <li>
          <hr className="dropdown__separator" />
        </li>
        <li>
          <button
            className="dropdown__link"
            onClick={signOut}
            style={{cursor: 'pointer', background: 'none', border: 'none', width: '100%', textAlign: 'left'}}
          >
            Sign Out
          </button>
        </li>
      </ul>
    </div>
  );
}
