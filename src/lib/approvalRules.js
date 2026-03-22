/**
 * Approval rules matching and enforcement.
 * Matches doc paths against approval_rules patterns and checks requirements.
 */

/**
 * Match a glob-like pattern against a doc path.
 * Supports: 'systems/*' matches 'systems/wms/overview'
 *           'systems/wms/*' matches 'systems/wms/config' but not 'systems/tms/config'
 */
export function matchesPattern(pattern, docPath) {
  // Convert glob pattern to regex
  const regexStr = '^' + pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape special regex chars
    .replace(/\*/g, '.*')                   // * becomes .*
    + '$';
  return new RegExp(regexStr).test(docPath);
}

/**
 * Find the most specific matching approval rule for a doc path.
 * More specific patterns (longer, more segments) take priority.
 */
export function findMatchingRule(docPath, rules) {
  const matching = rules.filter((r) => matchesPattern(r.doc_path_pattern, docPath));
  if (matching.length === 0) return null;
  // Sort by specificity — longest pattern wins
  matching.sort((a, b) => b.doc_path_pattern.length - a.doc_path_pattern.length);
  return matching[0];
}

/**
 * Count valid approvals for a proposal (only 'approve' actions, deduplicated by reviewer).
 */
export function countApprovals(approvalActions) {
  const approvers = new Set();
  for (const action of (approvalActions || [])) {
    if (action.action === 'approve') {
      approvers.add(action.reviewer_id || action.reviewer?.id);
    }
  }
  return approvers.size;
}

/**
 * Check whether a proposal has met its approval requirements.
 * Returns { met: boolean, current: number, required: number, rule: object|null }
 */
export function checkApprovalStatus(proposal, rules) {
  const rule = findMatchingRule(proposal.doc_path, rules);
  const required = rule?.min_approvals ?? 1;
  const current = countApprovals(proposal.approval_actions);
  return {
    met: current >= required,
    current,
    required,
    rule,
  };
}

/**
 * Check if a specific user can approve a proposal based on rules.
 */
export function canUserApprove(userId, userRole, proposal, rule) {
  // Can't approve your own proposals
  if (proposal.author_id === userId) return false;

  // Check if user already approved this proposal
  const alreadyApproved = (proposal.approval_actions || []).some(
    (a) => (a.reviewer_id || a.reviewer?.id) === userId && a.action === 'approve'
  );
  if (alreadyApproved) return false;

  const requiredRole = rule?.required_role || 'reviewer';

  // Admins can always approve
  if (userRole === 'admin') return true;

  // Check if user meets required role
  if (userRole === requiredRole || userRole === 'reviewer') return true;

  // Check manager approval (if allowed by rule)
  if (rule?.allow_manager_approval !== false) {
    if (proposal.author?.manager_id === userId) return true;
  }

  return false;
}
