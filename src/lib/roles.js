// Centralized role definitions used across the app

export const ROLES = ['viewer', 'editor', 'reviewer', 'admin'];

export const ROLE_HIERARCHY = ['viewer', 'editor', 'reviewer', 'admin'];

export const ROLE_LABELS = {
  viewer: 'Viewer',
  editor: 'Editor',
  reviewer: 'Reviewer',
  admin: 'Admin',
};

export const ROLE_COLORS = {
  viewer: '#6B7280',
  editor: '#2563EB',
  reviewer: '#7C3AED',
  admin: '#DC2626',
};

export const STATUS_LABELS = {
  draft: {label: 'Draft', color: '#6B7280'},
  pending_review: {label: 'Pending Review', color: '#D97706'},
  approved: {label: 'Approved', color: '#059669'},
  rejected: {label: 'Rejected', color: '#DC2626'},
  cancelled: {label: 'Cancelled', color: '#9CA3AF'},
  published: {label: 'Published', color: '#2563EB'},
};

/**
 * Check if a role meets a minimum role requirement.
 */
export function hasMinRole(userRole, minRole) {
  return ROLE_HIERARCHY.indexOf(userRole || 'viewer') >= ROLE_HIERARCHY.indexOf(minRole);
}
