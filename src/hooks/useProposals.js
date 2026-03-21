import {useState, useEffect, useCallback} from 'react';
import {getSupabase} from '../lib/supabase';
import {useAuth} from '../contexts/AuthContext';

/**
 * Hook for managing edit proposals.
 * @param {object} options
 * @param {string} options.docPath - Filter by doc path
 * @param {string} options.status - Filter by status
 */
export function useProposals({docPath, status} = {}) {
  const {user, profile} = useAuth();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProposals = useCallback(async () => {
    setLoading(true);
    let query = getSupabase()
      .from('edit_proposals')
      .select(`
        *,
        author:author_id(id, email, display_name, role, manager_id),
        approval_actions(
          id, action, comment, created_at,
          reviewer:reviewer_id(id, email, display_name)
        )
      `)
      .order('created_at', {ascending: false});

    if (docPath) query = query.eq('doc_path', docPath);
    if (status) query = query.eq('status', status);

    const {data, error} = await query;
    if (!error) setProposals(data || []);
    setLoading(false);
  }, [docPath, status]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  // Create a new edit proposal
  async function createProposal({docPath: path, title, description, contentDiff, originalContent}) {
    const {data, error} = await getSupabase()
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

    if (error) throw error;
    await fetchProposals();
    return data;
  }

  // Submit a draft for review
  async function submitForReview(proposalId) {
    const {error} = await getSupabase()
      .from('edit_proposals')
      .update({status: 'pending_review'})
      .eq('id', proposalId);

    if (error) throw error;

    await getSupabase().from('audit_log').insert({
      actor_id: user.id,
      action: 'submit_for_review',
      target_type: 'proposal',
      target_id: proposalId,
    });

    await fetchProposals();
  }

  // Approve, reject, or request changes
  async function reviewProposal(proposalId, action, comment) {
    // Insert the approval action
    const {error: actionError} = await getSupabase()
      .from('approval_actions')
      .insert({
        proposal_id: proposalId,
        reviewer_id: user.id,
        action,
        comment,
      });

    if (actionError) throw actionError;

    // Update proposal status based on action
    const newStatus = action === 'approve' ? 'approved'
      : action === 'reject' ? 'rejected'
      : 'pending_review'; // request_changes keeps it pending

    const {error: updateError} = await getSupabase()
      .from('edit_proposals')
      .update({status: newStatus})
      .eq('id', proposalId);

    if (updateError) throw updateError;

    await getSupabase().from('audit_log').insert({
      actor_id: user.id,
      action: `proposal_${action}`,
      target_type: 'proposal',
      target_id: proposalId,
      details: {comment},
    });

    await fetchProposals();
  }

  // Check if current user can approve a specific proposal
  function canApprove(proposal) {
    if (!profile) return false;
    // Can't approve your own proposals
    if (proposal.author_id === user.id) return false;
    // Admins and reviewers can approve
    if (profile.role === 'admin' || profile.role === 'reviewer') return true;
    // Manager can approve their direct report's edits
    if (proposal.author?.manager_id === user.id) return true;
    return false;
  }

  return {
    proposals,
    loading,
    createProposal,
    submitForReview,
    reviewProposal,
    canApprove,
    refresh: fetchProposals,
  };
}
