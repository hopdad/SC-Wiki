import React, {useState, useEffect} from 'react';

const STORAGE_KEY = 'meijer-dyslexic-font';

export default function DyslexicToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'true') {
      setEnabled(true);
      document.documentElement.setAttribute('data-dyslexic-font', 'true');
    }
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    if (next) {
      document.documentElement.setAttribute('data-dyslexic-font', 'true');
      localStorage.setItem(STORAGE_KEY, 'true');
    } else {
      document.documentElement.removeAttribute('data-dyslexic-font');
      localStorage.setItem(STORAGE_KEY, 'false');
    }
  };

  return (
    <button
      className={`dyslexic-toggle ${enabled ? 'dyslexic-toggle--active' : ''}`}
      onClick={toggle}
      title="Toggle dyslexic-friendly font"
      aria-label="Toggle dyslexic-friendly font"
      aria-pressed={enabled}
    >
      Aa
    </button>
  );
}
