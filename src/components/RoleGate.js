import React from 'react';
import {useAuth} from '../contexts/AuthContext';
import {hasMinRole} from '../lib/roles';

/**
 * Only renders children if user has the required minimum role.
 * Usage: <RoleGate minRole="editor">...</RoleGate>
 */
export default function RoleGate({minRole, children, fallback = null}) {
  const {profile, loading} = useAuth();

  if (loading) return null;

  if (hasMinRole(profile?.role, minRole)) {
    return <>{children}</>;
  }

  return fallback;
}
