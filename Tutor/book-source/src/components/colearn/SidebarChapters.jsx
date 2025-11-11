import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as storage from '../../utils/localStorageService';
import lessonController from '../../utils/LessonController';

/**
 * Sidebar showing chapter list with progress tracking
 */
const SidebarChapters = ({ onChapterSelect, currentChapter }) => {
  const [chapters, setChapters] = useState([]);
  const [completedChapters, setCompletedChapters] = useState([]);
  const [chapterProgress, setChapterProgress] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    loadProgress();
    loadChapters();
  }, []);

  const loadChapters = () => {
    const metadata = lessonController.getChapterMetadata();
    const chapterList = Object.entries(metadata).map(([num, data]) => ({
      number: parseInt(num),
      ...data
    }));
    setChapters(chapterList);
  };

  const loadProgress = () => {
    const progress = storage.getProgress();
    setCompletedChapters(progress.completedChapters);

    // Load individual chapter progress
    const progressData = {};
    chapters.forEach(ch => {
      progressData[ch.number] = storage.getChapterProgress(ch.number);
    });
    setChapterProgress(progressData);

    // Calculate overall progress
    const overall = storage.getOverallProgress();
    setOverallProgress(overall);
  };

  const handleChapterClick = (chapterNumber) => {
    if (onChapterSelect) {
      onChapterSelect(chapterNumber);
    }
  };

  const getChapterStatus = (chapterNumber) => {
    if (completedChapters.includes(chapterNumber)) {
      return 'completed';
    }
    if (chapterNumber === currentChapter) {
      return 'active';
    }
    // All chapters are now accessible - no locking
    return 'accessible';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'active':
        return '📖';
      case 'accessible':
        return '📚';
      default:
        return '📄';
    }
  };

  return (
    <div className={`colearn-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Collapse Toggle */}
      <button
        className="sidebar-collapse-btn"
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? '→' : '←'}
      </button>

      {!isCollapsed && (
        <>
          {/* Header */}
          <div className="sidebar-header">
            <h2 className="sidebar-title">📚 Co-Learning</h2>
            <p className="sidebar-subtitle">AI-Native Development</p>
          </div>

          {/* Overall Progress Bar */}
          <div className="overall-progress">
            <div className="progress-header">
              <span className="progress-label">Overall Progress</span>
              <span className="progress-percentage">{Math.round(overallProgress)}%</span>
            </div>
            <div className="progress-bar">
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Chapter List */}
          <div className="chapter-list">
            {chapters.map((chapter) => {
              const status = getChapterStatus(chapter.number);
              const progress = chapterProgress[chapter.number] || 0;
              const isActive = chapter.number === currentChapter;

              return (
                <motion.div
                  key={chapter.number}
                  className={`chapter-item ${status} ${isActive ? 'active' : ''}`}
                  onClick={() => handleChapterClick(chapter.number)}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  layout
                >
                  <div className="chapter-icon">
                    {getStatusIcon(status)}
                  </div>

                  <div className="chapter-content">
                    <div className="chapter-number">Chapter {chapter.number}</div>
                    <div className="chapter-title">{chapter.title}</div>

                    {/* Chapter Progress */}
                    {progress > 0 && (
                      <div className="chapter-progress">
                        <div
                          className="chapter-progress-fill"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}

                    {/* Estimated Time */}
                    {chapter.estimatedTime && (
                      <div className="chapter-time">
                        ⏱️ ~{chapter.estimatedTime} min
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="sidebar-footer">
            <button
              className="sidebar-btn secondary"
              onClick={() => {
                if (confirm('Reset all progress? This cannot be undone.')) {
                  lessonController.reset();
                  loadProgress();
                  window.location.reload();
                }
              }}
            >
              🔄 Reset Progress
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SidebarChapters;
