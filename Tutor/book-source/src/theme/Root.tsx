import React from 'react';
import TutorChat from '@site/src/components/TutorChat';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <TutorChat />
    </>
  );
}
