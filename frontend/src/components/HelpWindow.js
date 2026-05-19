import React from 'react';

export const helpWindowStyle = {
  minHeight: 40,
  backgroundColor: '#8dc63f',
  color: '#ffffff',
};

const OCP_GREEN = '#8dc63f';
const OCP_GREEN_DARK = '#6fa52f';
const OCP_GREEN_SOFT = '#eef7e4';
const OCP_GREEN_BORDER = '#c8e5a3';

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    display: 'grid',
    placeItems: 'center',
    padding: 16,
    background: 'rgba(31, 41, 55, 0.46)',
  },
  modal: {
    width: 'min(100%, 560px)',
    boxSizing: 'border-box',
    padding: 20,
    borderRadius: 8,
    borderTop: `4px solid ${OCP_GREEN}`,
    background: '#ffffff',
    color: '#111827',
    boxShadow: '0 18px 60px rgba(15, 23, 42, 0.25)',
    fontFamily: '"Open Sans", "Helvetica Neue", Arial, sans-serif',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: '#1f2937',
  },
  closeButton: {
    width: 32,
    height: 32,
    border: 'none',
    borderRadius: 999,
    background: '#ffffff',
    color: '#334155',
    cursor: 'pointer',
    fontSize: 18,
    fontWeight: 700,
    lineHeight: 1,
  },
  body: {
    display: 'grid',
    gap: 12,
    marginTop: 18,
  },
  intro: {
    margin: '14px 0 0',
    color: '#334155',
    fontSize: 15,
    lineHeight: 1.55,
  },
  steps: {
    display: 'grid',
    gap: 10,
    margin: '18px 0 0',
    padding: 0,
    listStyle: 'none',
  },
  step: {
    display: 'grid',
    gridTemplateColumns: '32px 1fr',
    gap: 12,
    padding: 12,
    border: `1px solid ${OCP_GREEN_BORDER}`,
    borderRadius: 8,
    background: OCP_GREEN_SOFT,
  },
  stepNumber: {
    display: 'inline-grid',
    placeItems: 'center',
    width: 28,
    height: 28,
    borderRadius: 999,
    background: OCP_GREEN,
    color: '#ffffff',
    fontWeight: 800,
    fontSize: 14,
  },
  stepTitle: {
    margin: 0,
    color: '#0f172a',
    fontSize: 15,
    fontWeight: 800,
  },
  stepText: {
    margin: '4px 0 0',
    color: '#475569',
    fontSize: 14,
    lineHeight: 1.45,
  },
  label: {
    display: 'block',
    marginBottom: 6,
    color: '#334155',
    fontSize: 14,
    fontWeight: 700,
  },
  freetext: {
    display: 'block',
    marginBottom: 6,
    fontSize: 14,
    color: '#0f172a'
  },
  keyValue: {
    display: 'inline-block',
    padding: '8px 10px',
    border: '1px solid #cbd5e1',
    borderRadius: 6,
    background: '#f8fafc',
    color: '#111827',
    fontFamily: 'inherit',
  },
  buttonBase: {
    minHeight: 40,
    padding: '10px 14px',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 15,
    fontWeight: 700,
  },
  secondaryButton: {
    background: '#e2e8f0',
    color: '#111827',
  },
  primaryButton: {
    background: OCP_GREEN,
    color: '#ffffff',
  },
  primaryButtonHover: {
    background: OCP_GREEN_DARK,
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: 18,
  },
  disabledButton: {
    background: '#999',
    cursor: 'not-allowed',
  },
};

function HelpWindow({ open, onClose, title = 'Welcome to Policy Pulse' }) {
  const [isPrimaryHovered, setIsPrimaryHovered] = React.useState(false);

  if (!open) return null;

  return (
    <div style={styles.backdrop} role="presentation">
      <div style={styles.modal} role="dialog" aria-modal="true" aria-labelledby="help-title">
        <div style={styles.header}>
          <h2 id="help-title" style={styles.title}>{title}</h2>
          
          <button type="button" style={styles.closeButton} onClick={onClose} aria-label="Close help window">
            x
          </button>
        </div>
        <p style={styles.intro}>
          Policy Pulse helps you find and review policies about data center heat reuse.
          Start with the scanner for structured searches, or ask the AI agent directly in the chat.
        </p>
        <ol style={styles.steps}>
          <li style={styles.step}>
            <span style={styles.stepNumber}>1</span>
            <div>
              <p style={styles.stepTitle}>Add your API key</p>
              <p style={styles.stepText}>
                Open API key settings and save an active Anthropic API key before running scans or using the agent.
              </p>
            </div>
          </li>
          <li style={styles.step}>
            <span style={styles.stepNumber}>2</span>
            <div>
              <p style={styles.stepTitle}>Choose scan targets</p>
              <p style={styles.stepText}>
                Select countries, regions, groups, categories, or tags in the Policy Scanner.
              </p>
            </div>
          </li>
          <li style={styles.step}>
            <span style={styles.stepNumber}>3</span>
            <div>
              <p style={styles.stepTitle}>Pick a scan mode</p>
              <p style={styles.stepText}>
                Use Standard for configured sources, Discover for finding new coverage and sources, or Deep for a more expansive and thorough crawl at a higher cost.
              </p>
            </div>
          </li>
          <li style={styles.step}>
            <span style={styles.stepNumber}>4</span>
            <div>
              <p style={styles.stepTitle}>Review results</p>
              <p style={styles.stepText}>
                Found policies appear in the policy list, where you can search, filter, sort, and expand each result.
              </p>
            </div>
          </li>
        </ol>
        <div style={styles.footer}>
          <button
            type="button"
            style={{
              ...styles.buttonBase,
              ...styles.primaryButton,
              ...(isPrimaryHovered ? styles.primaryButtonHover : {}),
            }}
            onClick={onClose}
            onMouseEnter={() => setIsPrimaryHovered(true)}
            onMouseLeave={() => setIsPrimaryHovered(false)}
          >
            Get started
          </button>
        </div>
      </div>
    </div>
  );
}

export default HelpWindow;
