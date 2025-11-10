/**
 * Docusaurus Root Component
 *
 * This component wraps the entire site with:
 * - AnalyticsTracker: Automatic tracking of user interactions (page views, scroll depth, etc.)
 * - TutorAgent: AI tutor sidebar and text selection features
 *
 * GA4 is configured via the GA4_MEASUREMENT_ID environment variable.
 * If not set, analytics will not load.
 */

import React from 'react';
import { AnalyticsTracker } from '@/components/AnalyticsTracker';
import TutorAgent from '@/components/tutor/TutorAgent';
import TutorChat from '@/components/TutorChat';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <AnalyticsTracker>
      <TutorAgent />
      <TutorChat />
      {children}
    </AnalyticsTracker>
  );
}
