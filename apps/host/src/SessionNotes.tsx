import React, { useState, useEffect } from 'react';

export function SessionNotes() {
  const [markdown, setMarkdown] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const base = import.meta.env.BASE_URL || '/';
    fetch(`${base}interview_preparation_notes.md`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load notes');
        return res.text();
      })
      .then((text) => {
        setMarkdown(text);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load interview notes. Please ensure the file is in public folder.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '50px', color: '#fff' }}>
        <h3>Loading session notes...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', background: '#3b1c1c', border: '1px solid red', borderRadius: '8px', color: '#ff8484', textAlign: 'center' }}>
        <h3>Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  // A helper function to parse markdown block-by-block into clean JSX components
  const renderParsedContent = () => {
    const lines = markdown.split('\n');
    const elements: React.ReactNode[] = [];
    let currentBlock: 'code' | 'list' | 'text' | null = null;
    let codeContent: string[] = [];
    let keyCounter = 0;

    const pushTextOrList = () => {
      currentBlock = null;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code Block boundaries
      if (line.trim().startsWith('```')) {
        if (currentBlock === 'code') {
          // Close code block
          elements.push(
            <pre 
              key={`code-${keyCounter++}`} 
              style={{ 
                background: '#0e0d12', 
                padding: '15px', 
                borderRadius: '8px', 
                overflowX: 'auto', 
                border: '1px solid #2e2c35',
                margin: '15px 0',
                fontFamily: 'monospace',
                color: '#42b983',
                fontSize: '0.9rem'
              }}
            >
              <code>{codeContent.join('\n')}</code>
            </pre>
          );
          codeContent = [];
          currentBlock = null;
        } else {
          // Open code block
          pushTextOrList();
          currentBlock = 'code';
        }
        continue;
      }

      if (currentBlock === 'code') {
        codeContent.push(line);
        continue;
      }

      // Check for User / Bot section headers
      if (line.trim().startsWith('### 👤 User:')) {
        elements.push(
          <div 
            key={`user-hdr-${keyCounter++}`} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              marginTop: '30px', 
              marginBottom: '15px', 
              padding: '10px 15px', 
              background: '#1d2333', 
              borderLeft: '4px solid #3b82f6', 
              borderRadius: '0 8px 8px 0',
              fontWeight: 'bold',
              color: '#3b82f6'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>👤</span> User (Interview Candidate)
          </div>
        );
        continue;
      }

      if (line.trim().startsWith('### 🤖 Antigravity:')) {
        elements.push(
          <div 
            key={`bot-hdr-${keyCounter++}`} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              marginTop: '30px', 
              marginBottom: '15px', 
              padding: '10px 15px', 
              background: '#251a3a', 
              borderLeft: '4px solid #aa3bff', 
              borderRadius: '0 8px 8px 0',
              fontWeight: 'bold',
              color: '#a855f7'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>🤖</span> Antigravity (AI Coach)
          </div>
        );
        continue;
      }

      // Headings
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={`h1-${keyCounter++}`} style={{ color: '#fff', fontSize: '1.8rem', marginTop: '30px', marginBottom: '15px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
            {line.replace('# ', '')}
          </h1>
        );
        continue;
      }
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={`h2-${keyCounter++}`} style={{ color: '#aa3bff', fontSize: '1.5rem', marginTop: '25px', marginBottom: '12px' }}>
            {line.replace('## ', '')}
          </h2>
        );
        continue;
      }
      if (line.startsWith('### ')) {
        // Fallback for general headers
        elements.push(
          <h3 key={`h3-${keyCounter++}`} style={{ color: '#fff', fontSize: '1.2rem', marginTop: '20px', marginBottom: '10px' }}>
            {line.replace('### ', '')}
          </h3>
        );
        continue;
      }

      // Horizontal rule
      if (line.trim() === '---') {
        elements.push(<hr key={`hr-${keyCounter++}`} style={{ border: 'none', borderTop: '1px solid #333', margin: '20px 0' }} />);
        continue;
      }

      // Bullet lists
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const itemText = line.replace(/^[\s*-]+/, '').trim();
        elements.push(
          <li key={`li-${keyCounter++}`} style={{ color: '#e0e0e0', marginLeft: '20px', marginBottom: '6px', lineHeight: '1.6' }}>
            {itemText}
          </li>
        );
        continue;
      }

      // Blockquotes / Tips
      if (line.trim().startsWith('>')) {
        const quoteText = line.replace(/^>\s*/, '').trim();
        elements.push(
          <blockquote 
            key={`quote-${keyCounter++}`} 
            style={{ 
              margin: '15px 0', 
              padding: '10px 20px', 
              background: '#1c1b22', 
              borderLeft: '4px solid #aa3bff', 
              borderRadius: '4px',
              fontStyle: 'italic',
              color: '#bbb'
            }}
          >
            {quoteText}
          </blockquote>
        );
        continue;
      }

      // Skip empty lines (render simple spacing)
      if (!line.trim()) {
        elements.push(<div key={`space-${keyCounter++}`} style={{ height: '8px' }} />);
        continue;
      }

      // Render standard paragraph text
      elements.push(
        <p key={`p-${keyCounter++}`} style={{ lineHeight: '1.6', color: '#e0e0e0', margin: '8px 0', fontSize: '1rem' }}>
          {line}
        </p>
      );
    }

    return elements;
  };

  return (
    <div 
      className="session-notes-container"
      style={{ 
        flex: 1, 
        background: '#131217', 
        border: '1px solid #2e2c35', 
        borderRadius: '8px', 
        padding: '25px', 
        overflowY: 'auto',
        maxHeight: '80vh',
        boxSizing: 'border-box',
        textAlign: 'left'
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {renderParsedContent()}
      </div>
    </div>
  );
}
