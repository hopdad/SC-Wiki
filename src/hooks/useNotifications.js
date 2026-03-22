import {useState, useEffect} from 'react';
import {getSupabase} from '../lib/supabase';
import {useAuth} from '../contexts/AuthContext';

/**
 * In-app notification badge for reviewers/admins/managers.
 * Returns count of proposals pending review.
 */
export function useNotifications() {
  const {user, isReviewer} = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb || !user || !isReviewer) return;

    let mounted = true;

    async function fetchCount() {
      const {count, error} = await sb
        .from('edit_proposals')
        .select('id', {count: 'exact', head: true})
        .eq('status', 'pending_review');

      if (!error && mounted) {
        setPendingCount((prev) => (prev === (count || 0)) ? prev : (count || 0));
      }
    }

    fetchCount();

    // Subscribe only to status changes on pending_review proposals
    const channel = sb
      .channel('proposal-notifications')
      .on(
        'postgres_changes',
        {event: 'UPDATE', schema: 'public', table: 'edit_proposals'},
        () => fetchCount()
      )
      .on(
        'postgres_changes',
        {event: 'INSERT', schema: 'public', table: 'edit_proposals'},
        () => fetchCount()
      )
      .subscribe();

    return () => {
      mounted = false;
      sb.removeChannel(channel);
    };
  }, [user, isReviewer]);

  return {pendingCount};
}
