import React from 'react';
import Footer from '@theme-original/DocItem/Footer';
import PrintButton from '@site/src/components/PrintButton';

export default function FooterWrapper(props) {
  return (
    <>
      <div className="sc-doc-footer-actions">
        <PrintButton />
      </div>
      <Footer {...props} />
    </>
  );
}
