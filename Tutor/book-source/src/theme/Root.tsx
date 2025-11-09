/**
 * Docusaurus Root Component
 *
 * This component wraps the entire site with:
 * - AnalyticsTracker for GA4 tracking
 * - AuthProvider for user authentication
 * - ChatWidget for AI tutor chat
 *
 * GA4 is configured via the GA4_MEASUREMENT_ID environment variable.
 * If not set, analytics will not load.
 */

import React from 'react';
import { AnalyticsTracker } from '@/components/AnalyticsTracker';
import { AuthProvider } from '@/components/contexts/AuthContext';
import { ChatWidget } from '@/components/ChatWidget/ChatWidget';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <AnalyticsTracker>
      <AuthProvider>
        {children}
        <ChatWidget />
      </AuthProvider>
    </AnalyticsTracker>
  );
}
