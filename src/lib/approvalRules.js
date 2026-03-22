import {hasMinRole} from './roles';

/**
 * Approval rules matching and enforcement.
 * Matches doc paths against approval_rules patterns and checks requirements.
 */

const patternCache = new Map();

function getPatternRegex(pattern) {
  let regex = patternCache.get(pattern);
  if (!regex) {
    const regexStr = '^' + pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      + '$';
    regex = new RegExp(regexStr);
    patternCache.set(pattern, regex);
  }
  return regex;
}

export function matchesPattern(pattern, docPath) {
  return getPatternRegex(pattern).test(docPath);
}

/**
 * Find the most specific matching approval rule for a doc path.
 * More specific patterns (longer, more segments) take priority.
 */
export function findMatchingRule(docPath, rules) {
  const matching = rules.filter((r) => matchesPattern(r.doc_path_pattern, docPath));
  if (matching.length === 0) return null;
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
 */
export function checkApprovalStatus(proposal, rules) {
  const rule = findMatchingRule(proposal.doc_path, rules);
  const required = rule?.min_approvals ?? 1;
  const current = countApprovals(proposal.approval_actions);
  return {met: current >= required, current, required, rule};
}

/**
 * Check if a specific user can approve a proposal based on rules.
 */
export function canUserApprove(userId, userRole, proposal, rule) {
  if (proposal.author_id === userId) return false;

  const alreadyApproved = (proposal.approval_actions || []).some(
    (a) => (a.reviewer_id || a.reviewer?.id) === userId && a.action === 'approve'
  );
  if (alreadyApproved) return false;

  const requiredRole = rule?.required_role || 'reviewer';

  // User must meet the required role level
  if (hasMinRole(userRole, requiredRole)) return true;

  // Manager approval (if allowed by rule)
  if (rule?.allow_manager_approval !== false) {
    if (proposal.author?.manager_id === userId) return true;
  }

  return false;
}
