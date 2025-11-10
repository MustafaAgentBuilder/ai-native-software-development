/**
 * TutorAgent Container Component
 *
 * Main container that coordinates the sidebar, selection popover, and chat
 * Manages shared state between all tutor components
 */

import React, { useState, useCallback, useEffect } from 'react';
import AgentSidebar from './AgentSidebar';
import SelectionPopover from './SelectionPopover';
import ChatWindow from './ChatWindow';
import type { ChatMessage } from '@/utils/agentApi';

const TutorAgent: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [prefillText, setPrefillText] = useState<string>('');
  const [showFloatingChat, setShowFloatingChat] = useState(false);

  // Only render on client-side to avoid SSR issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle new messages from various sources
  const handleNewMessage = useCallback((message: ChatMessage) => {
    setChatMessages((prev) => [...prev, message]);
    // Auto-show floating chat when new messages arrive
    setShowFloatingChat(true);
  }, []);

  // Handle opening chat with prefilled text from selection popover
  const handleOpenChat = useCallback((text: string) => {
    setPrefillText(text);
    setShowFloatingChat(true);
  }, []);

  // Clear chat history
  const handleClearHistory = useCallback(() => {
    setChatMessages([]);
  }, []);

  // Don't render on server-side
  if (!isMounted) {
    return null;
  }

  return (
    <>
      {/* Agent Sidebar - Minimized icon in bottom-left */}
      <AgentSidebar onChatMessage={(message) => console.log('Chat message:', message)} />

      {/* Selection Popover - Appears when text is selected */}
      <SelectionPopover onOpenChat={handleOpenChat} onNewMessage={handleNewMessage} />

      {/* Floating Chat Window - Draggable anywhere on screen */}
      {showFloatingChat && (
        <ChatWindow
          messages={chatMessages}
          onNewMessage={handleNewMessage}
          onClearHistory={handleClearHistory}
          isFloating={true}
          onClose={() => setShowFloatingChat(false)}
        />
      )}
    </>
  );
};

export default TutorAgent;
