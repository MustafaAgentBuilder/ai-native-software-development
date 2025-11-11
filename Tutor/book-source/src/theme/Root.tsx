/**
 * Docusaurus Root Component
 *
 * This component wraps the entire site with:
 * - AnalyticsTracker: Automatic tracking of user interactions (page views, scroll depth, etc.)
 * - TutorAgent: AI tutor sidebar and text selection features (ONLY on /docs/* pages)
 *
 * GA4 is configured via the GA4_MEASUREMENT_ID environment variable.
 * If not set, analytics will not load.
 */

import React from 'react';
import { useLocation } from '@docusaurus/router';
import { AnalyticsTracker } from '@/components/AnalyticsTracker';
import TutorAgent from '@/components/tutor/TutorAgent';
import TutorChat from '@/components/TutorChat';

export default function Root({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  // Show sidebar agent ONLY on book pages (/docs/*)
  // Hide on: home page, /colearn, and all other non-book pages
  const isBookPage = location.pathname.startsWith('/docs/');

  return (
    <AnalyticsTracker>
      {isBookPage && (
        <>
          <TutorAgent />
          <TutorChat />
        </>
      )}
      {children}
    </AnalyticsTracker>
  );
}
