import React, {useState} from 'react';
import {useAuth} from '../contexts/AuthContext';
import {useProposals} from '../hooks/useProposals';

/**
 * A button that editors can use on any doc page to propose an edit.
 * Shows an inline editor when clicked.
 */
export default function ProposeEditButton({docPath, currentContent}) {
  const {isEditor, isAuthenticated, signIn} = useAuth();
  const {createProposal, submitForReview} = useProposals();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState(currentContent || '');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isAuthenticated) {
    return (
      <button className="button button--outline button--sm" onClick={signIn}>
        Sign in to suggest edits
      </button>
    );
  }

  if (!isEditor) return null;

  if (success) {
    return (
      <div className="alert alert--success" style={{marginTop: '1rem'}}>
        Edit proposal submitted for review!
        <button
          className="button button--sm button--link"
          onClick={() => {
            setSuccess(false);
            setIsOpen(false);
          }}
        >
          Dismiss
        </button>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <button
        className="button button--primary button--sm"
        onClick={() => setIsOpen(true)}
        style={{marginTop: '1rem'}}
      >
        Propose Edit
      </button>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const proposal = await createProposal({
        docPath,
        title,
        description,
        contentDiff: content,
        originalContent: currentContent,
      });
      await submitForReview(proposal.id);
      setSuccess(true);
      setTitle('');
      setDescription('');
      setContent(currentContent || '');
    } catch (err) {
      alert('Error submitting proposal: ' + err.message);
    }
    setSubmitting(false);
  }

  return (
    <div style={{marginTop: '1rem', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: 8, padding: '1rem'}}>
      <h4 style={{marginTop: 0}}>Propose an Edit</h4>
      <form onSubmit={handleSubmit}>
        <div style={{marginBottom: '0.75rem'}}>
          <label style={{display: 'block', fontWeight: 600, marginBottom: 4}}>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief summary of your change"
            required
            style={{width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid var(--ifm-color-emphasis-300)'}}
          />
        </div>
        <div style={{marginBottom: '0.75rem'}}>
          <label style={{display: 'block', fontWeight: 600, marginBottom: 4}}>Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Why is this change needed?"
            style={{width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid var(--ifm-color-emphasis-300)'}}
          />
        </div>
        <div style={{marginBottom: '0.75rem'}}>
          <label style={{display: 'block', fontWeight: 600, marginBottom: 4}}>Proposed Content (Markdown)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            required
            style={{width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid var(--ifm-color-emphasis-300)', fontFamily: 'monospace', fontSize: '0.9rem'}}
          />
        </div>
        <div style={{display: 'flex', gap: '0.5rem'}}>
          <button type="submit" className="button button--primary button--sm" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit for Review'}
          </button>
          <button type="button" className="button button--outline button--sm" onClick={() => setIsOpen(false)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
