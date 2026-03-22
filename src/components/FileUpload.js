import React, {useState, useRef, useCallback} from 'react';
import {useAuth} from '../contexts/AuthContext';
import {uploadFile, validateFile, toMarkdown} from '../lib/storage';

/**
 * Drag-and-drop + file picker upload component.
 * Uploads files to Supabase Storage and inserts markdown into the editor.
 *
 * @param {Object} props
 * @param {function} props.onInsert - Called with markdown string to insert into the textarea.
 */
export default function FileUpload({onInsert}) {
  const {user} = useAuth();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploaded, setUploaded] = useState([]);
  const fileInputRef = useRef(null);

  const handleFiles = useCallback(async (files) => {
    if (!user) return;
    setError(null);

    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    setUploading(true);
    const newUploaded = [];

    for (const file of fileList) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        continue;
      }

      try {
        const result = await uploadFile(file, user.id);
        const markdown = toMarkdown(result, file.name);
        newUploaded.push({name: file.name, url: result.publicUrl, isImage: result.isImage});
        onInsert(markdown);
      } catch (err) {
        setError(err.message);
      }
    }

    setUploaded((prev) => [...prev, ...newUploaded]);
    setUploading(false);
  }, [user, onInsert]);

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  function handleFileInput(e) {
    handleFiles(e.target.files);
    e.target.value = '';
  }

  return (
    <div className="sc-upload">
      <div
        className={`sc-upload-dropzone${dragging ? ' sc-upload-dropzone--active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
        aria-label="Upload files by clicking or dragging"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv"
          onChange={handleFileInput}
          style={{display: 'none'}}
        />
        {uploading ? (
          <span className="sc-upload-text">Uploading...</span>
        ) : (
          <span className="sc-upload-text">
            Drop files here or click to upload
            <span className="sc-upload-hint">Images, PDF, Word, Excel, CSV (max 10 MB)</span>
          </span>
        )}
      </div>

      {error && (
        <div className="sc-upload-error">
          {error}
          <button className="button button--sm button--link sc-dismiss-btn" onClick={() => setError(null)} type="button">
            Dismiss
          </button>
        </div>
      )}

      {uploaded.length > 0 && (
        <div className="sc-upload-list">
          {uploaded.map((f, i) => (
            <div key={i} className="sc-upload-item">
              {f.isImage ? (
                <img src={f.url} alt={f.name} className="sc-upload-thumb" />
              ) : (
                <span className="sc-upload-doc-icon">&#128196;</span>
              )}
              <span className="sc-upload-name">{f.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
