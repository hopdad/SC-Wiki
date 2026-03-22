import {useState, useEffect} from 'react';
import {getSupabase} from '../lib/supabase';
import {useAuth} from '../contexts/AuthContext';

/**
 * Hook for in-app notification badge.
 * Returns count of proposals needing the current user's attention.
 */
export function useNotifications() {
  const {user, profile, isReviewer} = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb || !user) return;

    fetchCount();

    // Subscribe to real-time changes on edit_proposals
    const channel = sb
      .channel('proposal-notifications')
      .on(
        'postgres_changes',
        {event: '*', schema: 'public', table: 'edit_proposals'},
        () => fetchCount()
      )
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  }, [user, profile]);

  async function fetchCount() {
    const sb = getSupabase();
    if (!sb || !user) return;

    // For reviewers/admins: count proposals pending review
    // For managers: count proposals from their direct reports
    const {count, error} = await sb
      .from('edit_proposals')
      .select('id', {count: 'exact', head: true})
      .eq('status', 'pending_review');

    if (!error) {
      setPendingCount(count || 0);
    }
  }

  return {pendingCount, refresh: fetchCount};
}
