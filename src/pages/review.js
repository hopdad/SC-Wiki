import React, {useState} from 'react';
import Layout from '@theme/Layout';
import {AuthProvider, useAuth} from '../contexts/AuthContext';
import {useProposals} from '../hooks/useProposals';

function ReviewQueue() {
  const {isReviewer, isAuthenticated, profile, user} = useAuth();
  const {proposals, loading, reviewProposal, canApprove} = useProposals({status: 'pending_review'});
  const [activeId, setActiveId] = useState(null);
  const [comment, setComment] = useState('');
  const [processing, setProcessing] = useState(false);

  if (!isAuthenticated) {
    return <p>Please sign in to access the review queue.</p>;
  }

  // Reviewers, admins, AND managers of editors can see this page
  const canReview = isReviewer || proposals.some((p) => p.author?.manager_id === user?.id);
  if (!canReview) {
    return <p>You don't have permission to review proposals. Reviewers, admins, and managers of editors can access this page.</p>;
  }

  if (loading) return <p>Loading proposals...</p>;

  const reviewableProposals = proposals.filter((p) => canApprove(p));

  if (reviewableProposals.length === 0) {
    return (
      <div className="alert alert--info">
        No proposals pending your review.
      </div>
    );
  }

  async function handleAction(proposalId, action) {
    setProcessing(true);
    try {
      await reviewProposal(proposalId, action, comment);
      setComment('');
      setActiveId(null);
    } catch (err) {
      alert('Error: ' + err.message);
    }
    setProcessing(false);
  }

  return (
    <div>
      <h2>Pending Reviews ({reviewableProposals.length})</h2>
      <table style={{width: '100%'}}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Page</th>
            <th>Author</th>
            <th>Submitted</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reviewableProposals.map((p) => (
            <React.Fragment key={p.id}>
              <tr>
                <td><strong>{p.title}</strong></td>
                <td><code>{p.doc_path}</code></td>
                <td>{p.author?.display_name || p.author?.email}</td>
                <td>{new Date(p.created_at).toLocaleDateString()}</td>
                <td>
                  <button
                    className="button button--sm button--outline"
                    onClick={() => setActiveId(activeId === p.id ? null : p.id)}
                  >
                    {activeId === p.id ? 'Close' : 'Review'}
                  </button>
                </td>
              </tr>
              {activeId === p.id && (
                <tr>
                  <td colSpan={5}>
                    <div style={{padding: '1rem', background: 'var(--ifm-color-emphasis-100)', borderRadius: 8}}>
                      {p.description && <p><strong>Description:</strong> {p.description}</p>}
                      <details>
                        <summary>View Proposed Content</summary>
                        <pre style={{maxHeight: 400, overflow: 'auto', padding: '1rem', fontSize: '0.85rem'}}>
                          {p.content_diff}
                        </pre>
                      </details>

                      {p.approval_actions?.length > 0 && (
                        <div style={{marginTop: '0.5rem'}}>
                          <strong>Previous Actions:</strong>
                          <ul>
                            {p.approval_actions.map((a) => (
                              <li key={a.id}>
                                {a.reviewer?.display_name} — <em>{a.action}</em>
                                {a.comment && `: ${a.comment}`}
                                {' '}({new Date(a.created_at).toLocaleDateString()})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div style={{marginTop: '0.75rem'}}>
                        <textarea
                          placeholder="Add a comment (optional for approve, required for reject)"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          rows={3}
                          style={{width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid var(--ifm-color-emphasis-300)', marginBottom: '0.5rem'}}
                        />
                        <div style={{display: 'flex', gap: '0.5rem'}}>
                          <button
                            className="button button--success button--sm"
                            onClick={() => handleAction(p.id, 'approve')}
                            disabled={processing}
                          >
                            Approve
                          </button>
                          <button
                            className="button button--warning button--sm"
                            onClick={() => handleAction(p.id, 'request_changes')}
                            disabled={processing || !comment}
                          >
                            Request Changes
                          </button>
                          <button
                            className="button button--danger button--sm"
                            onClick={() => handleAction(p.id, 'reject')}
                            disabled={processing || !comment}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <AuthProvider>
      <Layout title="Review Queue" description="Review and approve edit proposals">
        <div className="container" style={{padding: '2rem 0'}}>
          <h1>Review Queue</h1>
          <ReviewQueue />
        </div>
      </Layout>
    </AuthProvider>
  );
}
