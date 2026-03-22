import React, {useState, useCallback} from 'react';
import {useAuth} from '../contexts/AuthContext';
import {useProposalMutations} from '../hooks/useProposals';
import ErrorAlert from './ErrorAlert';
import FileUpload from './FileUpload';

export default function ProposeEditButton({docPath, currentContent}) {
  const {isEditor, isAuthenticated, signIn} = useAuth();
  const {createProposal, submitForReview} = useProposalMutations();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState(currentContent || '');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleFileInsert = useCallback((markdown) => {
    setContent((prev) => prev + '\n' + markdown + '\n');
  }, []);

  if (!isAuthenticated) {
    return (
      <button className="button button--outline button--sm" onClick={signIn}>
        Sign in to suggest edits
      </button>
    );
  }

  if (!isEditor) {
    return (
      <p className="sc-text-sm sc-text-muted sc-section-mt">
        Want to suggest edits? Ask your manager for Editor access.
      </p>
    );
  }

  if (success) {
    return (
      <div className="alert alert--success sc-section-mt">
        Edit proposal submitted for review!
        <button className="button button--sm button--link sc-dismiss-btn" onClick={() => { setSuccess(false); setIsOpen(false); }}>
          Dismiss
        </button>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <button className="button button--primary button--sm sc-section-mt" onClick={() => setIsOpen(true)}>
        Propose Edit
      </button>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg(null);

    if (content.trim() === (currentContent || '').trim()) {
      setErrorMsg('Your proposed content is identical to the current content.');
      return;
    }

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
      setErrorMsg(err.message);
    }
    setSubmitting(false);
  }

  return (
    <div className="sc-form-panel">
      <h4 style={{marginTop: 0}}>Propose an Edit</h4>

      <ErrorAlert error={errorMsg} onDismiss={() => setErrorMsg(null)} />

      <form onSubmit={handleSubmit}>
        <div className="sc-form-group">
          <label className="sc-form-label" htmlFor="propose-title">Title</label>
          <input id="propose-title" type="text" className="sc-form-input" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief summary of your change" required />
        </div>
        <div className="sc-form-group">
          <label className="sc-form-label" htmlFor="propose-desc">Description</label>
          <input id="propose-desc" type="text" className="sc-form-input" value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Why is this change needed?" />
        </div>
        <div className="sc-form-group">
          <label className="sc-form-label" htmlFor="propose-content">Proposed Content (Markdown)</label>
          <textarea id="propose-content" className="sc-form-textarea" value={content} onChange={(e) => setContent(e.target.value)}
            rows={12} required />
          <FileUpload onInsert={handleFileInsert} />
        </div>
        <div className="sc-button-row">
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
