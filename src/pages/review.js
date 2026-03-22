import React, {useState} from 'react';
import Layout from '@theme/Layout';
import {useAuth} from '../contexts/AuthContext';
import {useProposals} from '../hooks/useProposals';
import ConfirmDialog from '../components/ConfirmDialog';
import ErrorAlert from '../components/ErrorAlert';
import Pagination from '../components/Pagination';

function ReviewQueue() {
  const {isReviewer, isAuthenticated, profile, user} = useAuth();
  const [page, setPage] = useState(1);
  const {
    proposals, loading, error, totalPages,
    reviewProposal, publishProposal, canApprove, getApprovalProgress,
  } = useProposals({status: 'pending_review', page});
  const [activeId, setActiveId] = useState(null);
  const [comment, setComment] = useState('');
  const [processing, setProcessing] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  if (!isAuthenticated) {
    return <p>Please sign in to access the review queue.</p>;
  }

  const canReview = isReviewer || proposals.some((p) => p.author?.manager_id === user?.id);
  if (!canReview && !loading) {
    return <p>You don't have permission to review proposals. Reviewers, admins, and managers of editors can access this page.</p>;
  }

  if (loading) return <p>Loading proposals...</p>;
  if (error) return <div className="alert alert--danger">Error loading proposals: {error}</div>;

  const reviewableProposals = proposals.filter((p) => canApprove(p));

  async function handleAction(proposalId, action) {
    if (action === 'reject' && !confirmAction) {
      setConfirmAction({proposalId, action, label: 'Reject'});
      return;
    }
    setConfirmAction(null);
    setProcessing(true);
    setActionError(null);
    try {
      await reviewProposal(proposalId, action, comment);
      setComment('');
      setActiveId(null);
    } catch (err) {
      setActionError(err.message);
    }
    setProcessing(false);
  }

  return (
    <div>
      <h2>Pending Reviews ({reviewableProposals.length})</h2>

      <ErrorAlert error={actionError} onDismiss={() => setActionError(null)} />

      {reviewableProposals.length === 0 ? (
        <div className="alert alert--info">No proposals pending your review.</div>
      ) : (
        <table className="sc-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Page</th>
              <th>Author</th>
              <th>Approvals</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviewableProposals.map((p) => {
              const progress = getApprovalProgress(p);
              return (
                <React.Fragment key={p.id}>
                  <tr>
                    <td><strong>{p.title}</strong></td>
                    <td><code>{p.doc_path}</code></td>
                    <td>{p.author?.display_name || p.author?.email || 'Unknown'}</td>
                    <td>
                      <span className={progress.met ? 'sc-approval-met' : 'sc-approval-pending'}>
                        {progress.current}/{progress.required}
                      </span>
                    </td>
                    <td>{new Date(p.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="button button--sm button--outline"
                        onClick={() => { setActiveId(activeId === p.id ? null : p.id); setComment(''); }}
                      >
                        {activeId === p.id ? 'Close' : 'Review'}
                      </button>
                    </td>
                  </tr>
                  {activeId === p.id && (
                    <tr>
                      <td colSpan={6}>
                        <div className="sc-content-panel">
                          {p.description && <p><strong>Description:</strong> {p.description}</p>}
                          <details>
                            <summary>View Proposed Content</summary>
                            <pre className="sc-code-preview">{p.content_diff}</pre>
                          </details>

                          {p.approval_actions?.length > 0 && (
                            <div style={{marginTop: '0.5rem'}}>
                              <strong>Previous Actions:</strong>
                              <ul>
                                {p.approval_actions.map((a) => (
                                  <li key={a.id}>
                                    {a.reviewer?.display_name || 'Unknown'} — <em>{a.action}</em>
                                    {a.comment && `: ${a.comment}`}
                                    {' '}({new Date(a.created_at).toLocaleDateString()})
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div style={{marginTop: '0.75rem'}}>
                            <textarea
                              className="sc-form-textarea"
                              placeholder="Add a comment (optional for approve, required for reject/request changes)"
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              rows={3}
                              style={{marginBottom: '0.5rem'}}
                            />
                            <div className="sc-button-row">
                              <button className="button button--success button--sm" onClick={() => handleAction(p.id, 'approve')} disabled={processing}>
                                Approve
                              </button>
                              <button className="button button--secondary button--sm" onClick={() => handleAction(p.id, 'comment')} disabled={processing || !comment}>
                                Comment
                              </button>
                              <button className="button button--warning button--sm" onClick={() => handleAction(p.id, 'request_changes')} disabled={processing || !comment}>
                                Request Changes
                              </button>
                              <button className="button button--danger button--sm" onClick={() => handleAction(p.id, 'reject')} disabled={processing || !comment}>
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmDialog
        open={!!confirmAction}
        title={`${confirmAction?.label} this proposal?`}
        message="This action cannot be undone. The author will be notified."
        confirmLabel={confirmAction?.label || 'Confirm'}
        confirmStyle="danger"
        onConfirm={() => handleAction(confirmAction.proposalId, confirmAction.action)}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}

function ApprovedQueue() {
  const {isReviewer} = useAuth();
  const {proposals, loading, publishProposal} = useProposals({status: 'approved'});
  const [processing, setProcessing] = useState(false);
  const [publishError, setPublishError] = useState(null);

  if (!isReviewer || loading || proposals.length === 0) return null;

  async function handlePublish(id) {
    setProcessing(true);
    setPublishError(null);
    try {
      await publishProposal(id);
    } catch (err) {
      setPublishError(err.message);
    }
    setProcessing(false);
  }

  return (
    <div className="sc-section-mt">
      <h2>Ready to Publish ({proposals.length})</h2>
      <ErrorAlert error={publishError} onDismiss={() => setPublishError(null)} />
      <table className="sc-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Page</th>
            <th>Author</th>
            <th>Approved</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {proposals.map((p) => (
            <tr key={p.id}>
              <td><strong>{p.title}</strong></td>
              <td><code>{p.doc_path}</code></td>
              <td>{p.author?.display_name || p.author?.email || 'Unknown'}</td>
              <td>{new Date(p.updated_at).toLocaleDateString()}</td>
              <td>
                <button className="button button--primary button--sm" onClick={() => handlePublish(p.id)} disabled={processing}>
                  Publish
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Layout title="Review Queue" description="Review and approve edit proposals">
      <div className="container sc-container-pad">
        <h1>Review Queue</h1>
        <ReviewQueue />
        <ApprovedQueue />
      </div>
    </Layout>
  );
}
