import React from 'react';
import Layout from '@theme/Layout';
import {AuthProvider, useAuth} from '../contexts/AuthContext';
import {useProposals} from '../hooks/useProposals';

const STATUS_BADGES = {
  draft: {label: 'Draft', color: '#6B7280'},
  pending_review: {label: 'Pending Review', color: '#D97706'},
  approved: {label: 'Approved', color: '#059669'},
  rejected: {label: 'Rejected', color: '#DC2626'},
  published: {label: 'Published', color: '#2563EB'},
};

function MyProposals() {
  const {isAuthenticated, user} = useAuth();
  const {proposals, loading, submitForReview} = useProposals();

  if (!isAuthenticated) {
    return <p>Please sign in to view your proposals.</p>;
  }

  if (loading) return <p>Loading...</p>;

  const myProposals = proposals.filter((p) => p.author_id === user.id);

  if (myProposals.length === 0) {
    return (
      <div className="alert alert--info">
        You haven't created any edit proposals yet. Use the "Propose Edit" button on any doc page.
      </div>
    );
  }

  return (
    <div>
      <table style={{width: '100%'}}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Page</th>
            <th>Status</th>
            <th>Submitted</th>
            <th>Reviewer Feedback</th>
          </tr>
        </thead>
        <tbody>
          {myProposals.map((p) => {
            const badge = STATUS_BADGES[p.status] || STATUS_BADGES.draft;
            return (
              <tr key={p.id}>
                <td><strong>{p.title}</strong></td>
                <td><code>{p.doc_path}</code></td>
                <td>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 4,
                    backgroundColor: badge.color,
                    color: 'white',
                    fontSize: '0.8rem',
                  }}>
                    {badge.label}
                  </span>
                  {p.status === 'draft' && (
                    <button
                      className="button button--sm button--link"
                      onClick={() => submitForReview(p.id)}
                      style={{marginLeft: 8}}
                    >
                      Submit
                    </button>
                  )}
                </td>
                <td>{new Date(p.created_at).toLocaleDateString()}</td>
                <td>
                  {p.approval_actions?.length > 0
                    ? p.approval_actions.map((a) => (
                        <div key={a.id} style={{fontSize: '0.85rem'}}>
                          <strong>{a.reviewer?.display_name}:</strong>{' '}
                          <em>{a.action}</em>
                          {a.comment && ` — "${a.comment}"`}
                        </div>
                      ))
                    : <span style={{color: 'var(--ifm-color-emphasis-500)'}}>None yet</span>
                  }
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function ProposalsPage() {
  return (
    <AuthProvider>
      <Layout title="My Proposals" description="View and manage your edit proposals">
        <div className="container" style={{padding: '2rem 0'}}>
          <h1>My Edit Proposals</h1>
          <MyProposals />
        </div>
      </Layout>
    </AuthProvider>
  );
}
