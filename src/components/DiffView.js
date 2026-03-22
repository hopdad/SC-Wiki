import React, {useMemo, useState} from 'react';
import {diffLines} from 'diff';

/**
 * Side-by-side or unified diff view comparing original vs proposed content.
 * Uses the `diff` library for line-level comparison.
 */
export default function DiffView({original, proposed}) {
  const [mode, setMode] = useState('unified');

  const changes = useMemo(
    () => diffLines(original || '', proposed || ''),
    [original, proposed],
  );

  const hasChanges = changes.some((c) => c.added || c.removed);

  if (!hasChanges) {
    return <div className="alert alert--info sc-diff-empty">No changes detected — content is identical.</div>;
  }

  return (
    <div className="sc-diff">
      <div className="sc-diff-toolbar">
        <button
          className={`button button--sm ${mode === 'unified' ? 'button--primary' : 'button--outline'}`}
          onClick={() => setMode('unified')}
        >
          Unified
        </button>
        <button
          className={`button button--sm ${mode === 'side-by-side' ? 'button--primary' : 'button--outline'}`}
          onClick={() => setMode('side-by-side')}
        >
          Side by Side
        </button>
      </div>

      {mode === 'unified' ? (
        <UnifiedView changes={changes} />
      ) : (
        <SideBySideView changes={changes} />
      )}
    </div>
  );
}

function UnifiedView({changes}) {
  let oldLine = 1;
  let newLine = 1;

  return (
    <div className="sc-diff-unified" role="table" aria-label="Unified diff view">
      {changes.map((part, i) => {
        const lines = part.value.replace(/\n$/, '').split('\n');
        return lines.map((line, j) => {
          let cls = 'sc-diff-line';
          let prefix = ' ';
          let leftNum = '';
          let rightNum = '';

          if (part.removed) {
            cls += ' sc-diff-line--removed';
            prefix = '−';
            leftNum = oldLine++;
          } else if (part.added) {
            cls += ' sc-diff-line--added';
            prefix = '+';
            rightNum = newLine++;
          } else {
            leftNum = oldLine++;
            rightNum = newLine++;
          }

          return (
            <div key={`${i}-${j}`} className={cls} role="row">
              <span className="sc-diff-gutter" role="cell">{leftNum}</span>
              <span className="sc-diff-gutter" role="cell">{rightNum}</span>
              <span className="sc-diff-prefix" role="cell">{prefix}</span>
              <span className="sc-diff-text" role="cell">{line}</span>
            </div>
          );
        });
      })}
    </div>
  );
}

function SideBySideView({changes}) {
  const leftLines = [];
  const rightLines = [];

  let leftNum = 1;
  let rightNum = 1;

  // Build paired lines for side-by-side display
  for (let i = 0; i < changes.length; i++) {
    const part = changes[i];
    const lines = part.value.replace(/\n$/, '').split('\n');

    if (part.removed) {
      // Check if next part is added (a replacement)
      const next = changes[i + 1];
      if (next && next.added) {
        const addedLines = next.value.replace(/\n$/, '').split('\n');
        const maxLen = Math.max(lines.length, addedLines.length);
        for (let j = 0; j < maxLen; j++) {
          leftLines.push({
            num: j < lines.length ? leftNum++ : '',
            text: j < lines.length ? lines[j] : '',
            type: j < lines.length ? 'removed' : 'empty',
          });
          rightLines.push({
            num: j < addedLines.length ? rightNum++ : '',
            text: j < addedLines.length ? addedLines[j] : '',
            type: j < addedLines.length ? 'added' : 'empty',
          });
        }
        i++; // Skip the added part
      } else {
        for (const line of lines) {
          leftLines.push({num: leftNum++, text: line, type: 'removed'});
          rightLines.push({num: '', text: '', type: 'empty'});
        }
      }
    } else if (part.added) {
      for (const line of lines) {
        leftLines.push({num: '', text: '', type: 'empty'});
        rightLines.push({num: rightNum++, text: line, type: 'added'});
      }
    } else {
      for (const line of lines) {
        leftLines.push({num: leftNum++, text: line, type: 'context'});
        rightLines.push({num: rightNum++, text: line, type: 'context'});
      }
    }
  }

  return (
    <div className="sc-diff-sbs" role="table" aria-label="Side-by-side diff view">
      <div className="sc-diff-sbs-header" role="row">
        <span className="sc-diff-sbs-half sc-diff-sbs-half--left" role="columnheader">Original</span>
        <span className="sc-diff-sbs-half sc-diff-sbs-half--right" role="columnheader">Proposed</span>
      </div>
      {leftLines.map((left, i) => {
        const right = rightLines[i];
        return (
          <div key={i} className="sc-diff-sbs-row" role="row">
            <span className={`sc-diff-sbs-half sc-diff-sbs-half--left sc-diff-sbs--${left.type}`} role="cell">
              <span className="sc-diff-gutter">{left.num}</span>
              <span className="sc-diff-text">{left.text}</span>
            </span>
            <span className={`sc-diff-sbs-half sc-diff-sbs-half--right sc-diff-sbs--${right.type}`} role="cell">
              <span className="sc-diff-gutter">{right.num}</span>
              <span className="sc-diff-text">{right.text}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
