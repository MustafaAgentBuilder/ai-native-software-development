/**
 * Local Storage Service for Co-Learning Tutor
 * Handles persistence of student progress, preferences, and quiz results
 */

// SSR guard helper
const isBrowser = () => typeof window !== 'undefined';

const STORAGE_KEYS = {
  CURRENT_CHAPTER: 'colearn_current_chapter',
  CURRENT_SECTION: 'colearn_current_section',
  COMPLETED_CHAPTERS: 'colearn_completed_chapters',
  COMPLETED_SECTIONS: 'colearn_completed_sections',
  QUIZ_RESULTS: 'colearn_quiz_results',
  LANGUAGE: 'colearn_language',
  TONE: 'colearn_tone',
  LAST_TIMESTAMP: 'colearn_last_timestamp',
  USER_ID: 'colearn_user_id',
  WRONG_ANSWERS_STREAK: 'colearn_wrong_streak',
  CHAT_HISTORY: 'colearn_chat_history',
  CHAPTER_PROGRESS: 'colearn_chapter_progress',
};

/**
 * Generate or retrieve user ID
 */
export const getUserId = () => {
  if (!isBrowser()) {
    return 'ssr-user-temp';
  }

  let userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
  if (!userId) {
    userId = `student-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
  }
  return userId;
};

/**
 * Get current learning progress
 */
export const getProgress = () => {
  if (!isBrowser()) {
    return {
      currentChapter: 1,
      currentSection: null,
      completedChapters: [],
      completedSections: [],
      lastTimestamp: null,
    };
  }

  return {
    currentChapter: parseInt(localStorage.getItem(STORAGE_KEYS.CURRENT_CHAPTER)) || 1,
    currentSection: localStorage.getItem(STORAGE_KEYS.CURRENT_SECTION) || null,
    completedChapters: JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETED_CHAPTERS) || '[]'),
    completedSections: JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETED_SECTIONS) || '[]'),
    lastTimestamp: localStorage.getItem(STORAGE_KEYS.LAST_TIMESTAMP) || null,
  };
};

/**
 * Save current learning position
 */
export const saveProgress = (chapter, section = null) => {
  if (!isBrowser()) return;

  localStorage.setItem(STORAGE_KEYS.CURRENT_CHAPTER, chapter.toString());
  if (section) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_SECTION, section);
  }
  localStorage.setItem(STORAGE_KEYS.LAST_TIMESTAMP, new Date().toISOString());
};

/**
 * Mark chapter as completed
 */
export const markChapterComplete = (chapterNumber) => {
  if (!isBrowser()) return;

  const completed = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETED_CHAPTERS) || '[]');
  if (!completed.includes(chapterNumber)) {
    completed.push(chapterNumber);
    localStorage.setItem(STORAGE_KEYS.COMPLETED_CHAPTERS, JSON.stringify(completed));
  }
};

/**
 * Mark section as completed
 */
export const markSectionComplete = (sectionId) => {
  if (!isBrowser()) return;

  const completed = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETED_SECTIONS) || '[]');
  if (!completed.includes(sectionId)) {
    completed.push(sectionId);
    localStorage.setItem(STORAGE_KEYS.COMPLETED_SECTIONS, JSON.stringify(completed));
  }
};

/**
 * Get language preference
 */
export const getLanguage = () => {
  if (!isBrowser()) return 'en';

  return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'en';
};

/**
 * Save language preference
 */
export const saveLanguage = (language) => {
  if (!isBrowser()) return;

  localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
};

/**
 * Get tone preference
 */
export const getTone = () => {
  if (!isBrowser()) return 'professional+funny';

  return localStorage.getItem(STORAGE_KEYS.TONE) || 'professional+funny';
};

/**
 * Save tone preference
 */
export const saveTone = (tone) => {
  if (!isBrowser()) return;

  localStorage.setItem(STORAGE_KEYS.TONE, tone);
};

/**
 * Save quiz result
 */
export const saveQuizResult = (chapterNumber, result) => {
  const allResults = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUIZ_RESULTS) || '{}');
  allResults[chapterNumber] = {
    ...result,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEYS.QUIZ_RESULTS, JSON.stringify(allResults));
};

/**
 * Get quiz results for a specific chapter or all
 */
export const getQuizResults = (chapterNumber = null) => {
  const allResults = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUIZ_RESULTS) || '{}');
  if (chapterNumber !== null) {
    return allResults[chapterNumber] || null;
  }
  return allResults;
};

/**
 * Track wrong answers streak for adaptive learning
 */
export const incrementWrongStreak = () => {
  const streak = parseInt(localStorage.getItem(STORAGE_KEYS.WRONG_ANSWERS_STREAK) || '0');
  localStorage.setItem(STORAGE_KEYS.WRONG_ANSWERS_STREAK, (streak + 1).toString());
  return streak + 1;
};

/**
 * Reset wrong answers streak
 */
export const resetWrongStreak = () => {
  localStorage.setItem(STORAGE_KEYS.WRONG_ANSWERS_STREAK, '0');
};

/**
 * Get current wrong answers streak
 */
export const getWrongStreak = () => {
  return parseInt(localStorage.getItem(STORAGE_KEYS.WRONG_ANSWERS_STREAK) || '0');
};

/**
 * Save chat history (limit to last 50 messages)
 */
export const saveChatHistory = (messages) => {
  const limitedMessages = messages.slice(-50);
  localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(limitedMessages));
};

/**
 * Get chat history
 */
export const getChatHistory = () => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY) || '[]');
};

/**
 * Clear chat history
 */
export const clearChatHistory = () => {
  localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify([]));
};

/**
 * Get chapter progress (percentage)
 */
export const getChapterProgress = (chapterNumber) => {
  const allProgress = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHAPTER_PROGRESS) || '{}');
  return allProgress[chapterNumber] || 0;
};

/**
 * Save chapter progress (percentage 0-100)
 */
export const saveChapterProgress = (chapterNumber, percentage) => {
  const allProgress = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHAPTER_PROGRESS) || '{}');
  allProgress[chapterNumber] = percentage;
  localStorage.setItem(STORAGE_KEYS.CHAPTER_PROGRESS, JSON.stringify(allProgress));
};

/**
 * Calculate overall progress across all chapters
 */
export const getOverallProgress = () => {
  const completedChapters = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETED_CHAPTERS) || '[]');
  const totalChapters = 10; // Update based on actual chapter count
  return (completedChapters.length / totalChapters) * 100;
};

/**
 * Reset all progress (for testing or starting over)
 */
export const resetAllProgress = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    if (key !== STORAGE_KEYS.USER_ID) {
      localStorage.removeItem(key);
    }
  });
};

/**
 * Export all data for backup
 */
export const exportProgress = () => {
  const data = {};
  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    const value = localStorage.getItem(key);
    if (value) {
      try {
        data[name] = JSON.parse(value);
      } catch {
        data[name] = value;
      }
    }
  });
  return data;
};

/**
 * Import progress from backup
 */
export const importProgress = (data) => {
  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    if (data[name] !== undefined) {
      const value = typeof data[name] === 'object'
        ? JSON.stringify(data[name])
        : data[name];
      localStorage.setItem(key, value);
    }
  });
};
