import React, {useState} from 'react';
import Layout from '@theme/Layout';
import {useAuth} from '../contexts/AuthContext';
import {useProposals} from '../hooks/useProposals';
import {STATUS_LABELS} from '../lib/roles';
import ConfirmDialog from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';

function MyProposals() {
  const {isAuthenticated, user} = useAuth();
  const [page, setPage] = useState(1);
  const {
    proposals, loading, error, totalPages,
    submitForReview, cancelProposal, updateProposal,
  } = useProposals({authorId: user?.id, page});
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [cancelConfirm, setCancelConfirm] = useState(null);

  if (!isAuthenticated) {
    return <p>Please sign in to view your proposals.</p>;
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <div className="alert alert--danger">Error: {error}</div>;

  if (proposals.length === 0) {
    return (
      <div className="alert alert--info">
        You haven't created any edit proposals yet. Use the "Propose Edit" button on any doc page.
      </div>
    );
  }

  function startEdit(p) {
    setEditingId(p.id);
    setEditTitle(p.title);
    setEditDesc(p.description || '');
    setEditContent(p.content_diff);
  }

  async function saveEdit(id) {
    setSaving(true);
    setActionError(null);
    try {
      await updateProposal(id, {title: editTitle, description: editDesc, contentDiff: editContent});
      setEditingId(null);
    } catch (err) {
      setActionError(err.message);
    }
    setSaving(false);
  }

  async function handleCancel(id) {
    setCancelConfirm(null);
    setActionError(null);
    try {
      await cancelProposal(id);
    } catch (err) {
      setActionError(err.message);
    }
  }

  return (
    <div>
      {actionError && (
        <div className="alert alert--danger sc-alert-mb">
          {actionError}
          <button className="button button--sm button--link sc-dismiss-btn" onClick={() => setActionError(null)}>Dismiss</button>
        </div>
      )}

      <table className="sc-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Page</th>
            <th>Status</th>
            <th>Submitted</th>
            <th>Feedback</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {proposals.map((p) => {
            const badge = STATUS_LABELS[p.status] || STATUS_LABELS.draft;
            const isEditing = editingId === p.id;

            return (
              <React.Fragment key={p.id}>
                <tr>
                  <td><strong>{p.title}</strong></td>
                  <td><code>{p.doc_path}</code></td>
                  <td>
                    <span className="sc-status-badge" style={{backgroundColor: badge.color}}>
                      {badge.label}
                    </span>
                  </td>
                  <td>{new Date(p.created_at).toLocaleDateString()}</td>
                  <td>
                    {p.approval_actions?.length > 0
                      ? p.approval_actions.map((a) => (
                          <div key={a.id} className="sc-text-sm">
                            <strong>{a.reviewer?.display_name || 'Unknown'}:</strong>{' '}
                            <em>{a.action}</em>
                            {a.comment && ` — "${a.comment}"`}
                          </div>
                        ))
                      : <span className="sc-text-muted">None yet</span>
                    }
                  </td>
                  <td>
                    <div className="sc-button-row sc-button-row--tight">
                      {p.status === 'draft' && (
                        <>
                          <button className="button button--sm button--primary" onClick={() => submitForReview(p.id)}>Submit</button>
                          <button className="button button--sm button--outline" onClick={() => startEdit(p)}>Edit</button>
                        </>
                      )}
                      {(p.status === 'draft' || p.status === 'pending_review') && (
                        <button className="button button--sm button--outline sc-btn-cancel" onClick={() => setCancelConfirm(p.id)}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                {isEditing && (
                  <tr>
                    <td colSpan={6}>
                      <div className="sc-content-panel">
                        <div className="sc-form-group">
                          <label className="sc-form-label">Title</label>
                          <input type="text" className="sc-form-input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                        </div>
                        <div className="sc-form-group">
                          <label className="sc-form-label">Description</label>
                          <input type="text" className="sc-form-input" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
                        </div>
                        <div className="sc-form-group">
                          <label className="sc-form-label">Content</label>
                          <textarea className="sc-form-textarea" value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={8} />
                        </div>
                        <div className="sc-button-row">
                          <button className="button button--primary button--sm" onClick={() => saveEdit(p.id)} disabled={saving}>
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                          <button className="button button--outline button--sm" onClick={() => setEditingId(null)}>Cancel</button>
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

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmDialog
        open={!!cancelConfirm}
        title="Cancel this proposal?"
        message="The proposal will be marked as cancelled and can't be resubmitted."
        confirmLabel="Cancel Proposal"
        confirmStyle="danger"
        onConfirm={() => handleCancel(cancelConfirm)}
        onCancel={() => setCancelConfirm(null)}
      />
    </div>
  );
}

export default function ProposalsPage() {
  return (
    <Layout title="My Proposals" description="View and manage your edit proposals">
      <div className="container sc-container-pad">
        <h1>My Edit Proposals</h1>
        <MyProposals />
      </div>
    </Layout>
  );
}
