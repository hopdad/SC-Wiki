export const ROLES = ['viewer', 'editor', 'reviewer', 'admin'];

// ROLES doubles as the hierarchy — index determines permission level
export const ROLE_HIERARCHY = ROLES;

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

export function hasMinRole(userRole, minRole) {
  return ROLES.indexOf(userRole || 'viewer') >= ROLES.indexOf(minRole);
}
