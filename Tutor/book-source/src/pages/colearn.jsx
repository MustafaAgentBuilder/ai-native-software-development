import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import '../css/colearn.css';

/**
 * Co-Learning Page
 * Full-screen AI tutor for step-by-step learning
 */
export default function CoLearnPage() {
  return (
    <Layout
      title="Co-Learning AI Tutor"
      description="Interactive AI tutor that guides you through the AI-Native Development course step-by-step"
      noFooter={true}
    >
      <BrowserOnly fallback={<div className="colearn-loading"><div className="loader-spinner"></div><p>Loading Co-Learning Tutor...</p></div>}>
        {() => {
          const AgentCoLearnUI = require('../components/colearn/AgentCoLearnUI').default;
          return <AgentCoLearnUI />;
        }}
      </BrowserOnly>
    </Layout>
  );
}
