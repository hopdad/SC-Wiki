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
        <div className="alert alert--danger" style={{marginBottom: '1rem'}}>
          {actionError}
          <button className="button button--sm button--link" onClick={() => setActionError(null)} style={{marginLeft: 8}}>Dismiss</button>
        </div>
      )}

      <table style={{width: '100%'}}>
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
                    <span style={{
                      padding: '2px 8px', borderRadius: 4,
                      backgroundColor: badge.color, color: 'white', fontSize: '0.8rem',
                    }}>
                      {badge.label}
                    </span>
                  </td>
                  <td>{new Date(p.created_at).toLocaleDateString()}</td>
                  <td>
                    {p.approval_actions?.length > 0
                      ? p.approval_actions.map((a) => (
                          <div key={a.id} style={{fontSize: '0.85rem'}}>
                            <strong>{a.reviewer?.display_name || 'Unknown'}:</strong>{' '}
                            <em>{a.action}</em>
                            {a.comment && ` — "${a.comment}"`}
                          </div>
                        ))
                      : <span style={{color: 'var(--ifm-color-emphasis-500)'}}>None yet</span>
                    }
                  </td>
                  <td>
                    <div style={{display: 'flex', gap: '0.25rem', flexWrap: 'wrap'}}>
                      {p.status === 'draft' && (
                        <>
                          <button className="button button--sm button--primary" onClick={() => submitForReview(p.id)}>
                            Submit
                          </button>
                          <button className="button button--sm button--outline" onClick={() => startEdit(p)}>
                            Edit
                          </button>
                        </>
                      )}
                      {(p.status === 'draft' || p.status === 'pending_review') && (
                        <button
                          className="button button--sm button--outline"
                          style={{color: '#DC2626', borderColor: '#DC2626'}}
                          onClick={() => setCancelConfirm(p.id)}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                {isEditing && (
                  <tr>
                    <td colSpan={6}>
                      <div style={{padding: '1rem', background: 'var(--ifm-color-emphasis-100)', borderRadius: 8}}>
                        <div style={{marginBottom: '0.5rem'}}>
                          <label style={{fontWeight: 600}}>Title</label>
                          <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                            style={{width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid var(--ifm-color-emphasis-300)'}} />
                        </div>
                        <div style={{marginBottom: '0.5rem'}}>
                          <label style={{fontWeight: 600}}>Description</label>
                          <input type="text" value={editDesc} onChange={(e) => setEditDesc(e.target.value)}
                            style={{width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid var(--ifm-color-emphasis-300)'}} />
                        </div>
                        <div style={{marginBottom: '0.5rem'}}>
                          <label style={{fontWeight: 600}}>Content</label>
                          <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={8}
                            style={{width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid var(--ifm-color-emphasis-300)', fontFamily: 'monospace'}} />
                        </div>
                        <div style={{display: 'flex', gap: '0.5rem'}}>
                          <button className="button button--primary button--sm" onClick={() => saveEdit(p.id)} disabled={saving}>
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                          <button className="button button--outline button--sm" onClick={() => setEditingId(null)}>
                            Cancel
                          </button>
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
      <div className="container" style={{padding: '2rem 0'}}>
        <h1>My Edit Proposals</h1>
        <MyProposals />
      </div>
    </Layout>
  );
}
