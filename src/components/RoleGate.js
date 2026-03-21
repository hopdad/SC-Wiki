import React from 'react';
import {useAuth} from '../contexts/AuthContext';

const ROLE_HIERARCHY = ['viewer', 'editor', 'reviewer', 'admin'];

/**
 * Only renders children if user has the required minimum role.
 * Usage: <RoleGate minRole="editor">...</RoleGate>
 */
export default function RoleGate({minRole, children, fallback = null}) {
  const {profile, loading} = useAuth();

  if (loading) return null;

  const userLevel = ROLE_HIERARCHY.indexOf(profile?.role || 'viewer');
  const requiredLevel = ROLE_HIERARCHY.indexOf(minRole);

  if (userLevel >= requiredLevel) {
    return <>{children}</>;
  }

  return fallback;
}
