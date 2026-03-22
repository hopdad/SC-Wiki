import {useState, useEffect, useCallback} from 'react';
import {getSupabase} from '../lib/supabase';
import {useAuth} from '../contexts/AuthContext';
import {checkApprovalStatus, canUserApprove} from '../lib/approvalRules';

const PAGE_SIZE = 20;

/**
 * Hook for managing edit proposals with pagination, approval rules, and full CRUD.
 */
export function useProposals({docPath, status, page = 1} = {}) {
  const {user, profile} = useAuth();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [approvalRules, setApprovalRules] = useState([]);

  // Fetch approval rules once
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    sb.from('approval_rules').select('*').then(({data}) => {
      setApprovalRules(data || []);
    });
  }, []);

  const fetchProposals = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = sb
      .from('edit_proposals')
      .select(`
        *,
        author:author_id(id, email, display_name, role, manager_id),
        approval_actions(
          id, action, comment, created_at,
          reviewer:reviewer_id(id, email, display_name)
        )
      `, {count: 'exact'})
      .order('created_at', {ascending: false})
      .range(from, to);

    if (docPath) query = query.eq('doc_path', docPath);
    if (status) query = query.eq('status', status);

    const {data, error: fetchError, count} = await query;
    if (fetchError) {
      setError(fetchError.message);
    } else {
      setProposals(data || []);
      setTotalCount(count || 0);
    }
    setLoading(false);
  }, [docPath, status, page]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  // Create a new edit proposal
  async function createProposal({docPath: path, title, description, contentDiff, originalContent}) {
    const sb = getSupabase();
    if (!sb) throw new Error('Not connected');

    const {data, error: createError} = await sb
      .from('edit_proposals')
      .insert({
        doc_path: path,
        title,
        description,
        content_diff: contentDiff,
        original_content: originalContent,
        author_id: user.id,
        status: 'draft',
      })
      .select()
      .single();

    if (createError) throw createError;
    await fetchProposals();
    return data;
  }

  // Update a draft proposal
  async function updateProposal(proposalId, {title, description, contentDiff}) {
    const sb = getSupabase();
    if (!sb) throw new Error('Not connected');

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (contentDiff !== undefined) updates.content_diff = contentDiff;

    const {error: updateError} = await sb
      .from('edit_proposals')
      .update(updates)
      .eq('id', proposalId)
      .eq('author_id', user.id)
      .eq('status', 'draft');

    if (updateError) throw updateError;
    await fetchProposals();
  }

  // Submit a draft for review
  async function submitForReview(proposalId) {
    const sb = getSupabase();
    if (!sb) throw new Error('Not connected');

    const {error: submitError} = await sb
      .from('edit_proposals')
      .update({status: 'pending_review'})
      .eq('id', proposalId);

    if (submitError) throw submitError;

    await sb.from('audit_log').insert({
      actor_id: user.id,
      action: 'submit_for_review',
      target_type: 'proposal',
      target_id: proposalId,
    });

    await fetchProposals();
  }

  // Cancel a proposal (author only)
  async function cancelProposal(proposalId) {
    const sb = getSupabase();
    if (!sb) throw new Error('Not connected');

    const {error: cancelError} = await sb
      .from('edit_proposals')
      .update({status: 'cancelled'})
      .eq('id', proposalId)
      .eq('author_id', user.id);

    if (cancelError) throw cancelError;

    await sb.from('audit_log').insert({
      actor_id: user.id,
      action: 'proposal_cancelled',
      target_type: 'proposal',
      target_id: proposalId,
    });

    await fetchProposals();
  }

  // Review: approve, reject, request_changes, or comment
  async function reviewProposal(proposalId, action, comment) {
    const sb = getSupabase();
    if (!sb) throw new Error('Not connected');

    // Insert the approval action
    const {error: actionError} = await sb
      .from('approval_actions')
      .insert({
        proposal_id: proposalId,
        reviewer_id: user.id,
        action,
        comment: comment || null,
      });

    if (actionError) throw actionError;

    // Determine new status based on action and approval rules
    let newStatus = 'pending_review';
    if (action === 'reject') {
      newStatus = 'rejected';
    } else if (action === 'approve') {
      // Re-fetch the proposal to get updated approval count
      const {data: refreshed} = await sb
        .from('edit_proposals')
        .select(`
          *,
          author:author_id(id, email, display_name, role, manager_id),
          approval_actions(id, action, reviewer_id, reviewer:reviewer_id(id, email, display_name))
        `)
        .eq('id', proposalId)
        .single();

      if (refreshed) {
        const approvalStatus = checkApprovalStatus(refreshed, approvalRules);
        newStatus = approvalStatus.met ? 'approved' : 'pending_review';
      } else {
        newStatus = 'approved';
      }
    }
    // 'request_changes' and 'comment' keep status as pending_review

    if (action !== 'comment') {
      const {error: updateError} = await sb
        .from('edit_proposals')
        .update({status: newStatus})
        .eq('id', proposalId);

      if (updateError) throw updateError;
    }

    await sb.from('audit_log').insert({
      actor_id: user.id,
      action: `proposal_${action}`,
      target_type: 'proposal',
      target_id: proposalId,
      details: {comment: comment || null, resulting_status: newStatus},
    });

    await fetchProposals();
  }

  // Publish an approved proposal
  async function publishProposal(proposalId) {
    const sb = getSupabase();
    if (!sb) throw new Error('Not connected');

    const {error: pubError} = await sb
      .from('edit_proposals')
      .update({status: 'published'})
      .eq('id', proposalId)
      .eq('status', 'approved');

    if (pubError) throw pubError;

    await sb.from('audit_log').insert({
      actor_id: user.id,
      action: 'proposal_published',
      target_type: 'proposal',
      target_id: proposalId,
    });

    await fetchProposals();
  }

  // Check if current user can approve a specific proposal
  function canApprove(proposal) {
    if (!profile || !user) return false;
    const rule = approvalRules.find((r) => {
      const regex = new RegExp('^' + r.doc_path_pattern.replace(/\*/g, '.*') + '$');
      return regex.test(proposal.doc_path);
    });
    return canUserApprove(user.id, profile.role, proposal, rule);
  }

  // Get approval progress for a proposal
  function getApprovalProgress(proposal) {
    return checkApprovalStatus(proposal, approvalRules);
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return {
    proposals,
    loading,
    error,
    totalCount,
    totalPages,
    pageSize: PAGE_SIZE,
    approvalRules,
    createProposal,
    updateProposal,
    submitForReview,
    cancelProposal,
    reviewProposal,
    publishProposal,
    canApprove,
    getApprovalProgress,
    refresh: fetchProposals,
  };
}
