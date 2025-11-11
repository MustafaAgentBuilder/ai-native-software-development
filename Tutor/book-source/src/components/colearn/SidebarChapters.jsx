import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as storage from '../../utils/localStorageService';
import lessonController from '../../utils/LessonController';

/**
 * Sidebar showing chapter list with progress tracking
 */
const SidebarChapters = ({ onChapterSelect, currentChapter }) => {
  const [parts, setParts] = useState({});
  const [expandedParts, setExpandedParts] = useState({ 1: true }); // Part 1 expanded by default
  const [completedChapters, setCompletedChapters] = useState([]);
  const [chapterProgress, setChapterProgress] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    loadProgress();
    loadParts();
  }, []);

  const loadParts = () => {
    const courseStructure = lessonController.getParts();
    setParts(courseStructure);
  };

  const loadProgress = () => {
    const progress = storage.getProgress();
    setCompletedChapters(progress.completedChapters);

    // Load individual chapter progress for all chapters
    const progressData = {};
    const allChapters = lessonController.getChapterMetadata();
    Object.keys(allChapters).forEach(chapterNum => {
      progressData[chapterNum] = storage.getChapterProgress(parseInt(chapterNum));
    });
    setChapterProgress(progressData);

    // Calculate overall progress
    const overall = storage.getOverallProgress();
    setOverallProgress(overall);
  };

  const togglePart = (partNumber) => {
    setExpandedParts(prev => ({
      ...prev,
      [partNumber]: !prev[partNumber]
    }));
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

          {/* Parts and Chapters List */}
          <div className="chapter-list">
            {Object.entries(parts).map(([partNumber, part]) => {
              const isExpanded = expandedParts[partNumber];
              const partChapters = lessonController.getPartChapters(parseInt(partNumber));

              return (
                <div key={partNumber} className="part-section">
                  {/* Part Header */}
                  <div
                    className="part-header"
                    onClick={() => togglePart(partNumber)}
                  >
                    <div className="part-icon">
                      {isExpanded ? '▼' : '▶'}
                    </div>
                    <div className="part-title">{part.title}</div>
                  </div>

                  {/* Chapters under this Part */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: 'hidden' }}
                      >
                        {partChapters.map((chapter) => {
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
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
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
