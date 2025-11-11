/**
 * Lesson Controller
 * Manages lesson flow, adaptive learning, and progress tracking
 */

import { agentApi, mockCoLearningResponse, mockGenerateQuiz, useMockResponses } from './agentApi.ts';
import * as storage from './localStorageService';

// Course structure with Parts and Chapters (matching the actual book)
const COURSE_STRUCTURE = {
  parts: {
    1: {
      title: 'Part 1: Introducing AI-Driven Development',
      chapters: [1, 2, 3, 4]
    },
    2: {
      title: 'Part 2: AI Tool Landscape',
      chapters: [5, 6, 7]
    },
    3: {
      title: 'Part 3: Markdown, Prompt & Context Engineering',
      chapters: [10, 11]
    },
    4: {
      title: 'Part 4: Python - The Language of AI Agents',
      chapters: [12]
    },
    5: {
      title: 'Part 5: Spec-Driven Development',
      chapters: [30, 31, 32, 33]
    }
  }
};

// Chapter metadata structure
const CHAPTER_METADATA = {
  1: {
    title: 'The AI Development Revolution',
    part: 1,
    sections: ['Moment That Changed Everything', 'Three Trillion Developer Economy', 'Software Disrupting Itself'],
    estimatedTime: 45,
    totalLessons: 8
  },
  2: {
    title: 'The AI Turning Point',
    part: 1,
    sections: ['The Inflection Point', 'Development Patterns', 'DORA Perspective'],
    estimatedTime: 40,
    totalLessons: 6
  },
  3: {
    title: 'How to Make a Billion Dollars in the AI Era',
    part: 1,
    sections: ['Billion Dollar Question', 'Snakes and Ladders', 'Super Orchestrators'],
    estimatedTime: 50,
    totalLessons: 7
  },
  4: {
    title: 'The Nine Pillars of AI-Driven Development',
    part: 1,
    sections: ['Nine Pillars Framework', 'Implementation Strategy', 'Best Practices'],
    estimatedTime: 55,
    totalLessons: 8
  },
  5: {
    title: 'How It All Started — The Claude Code Phenomenon',
    part: 2,
    sections: ['Claude Code Features', 'Workflow Patterns', 'Best Practices'],
    estimatedTime: 45,
    totalLessons: 7
  },
  6: {
    title: 'Google Gemini CLI: Open Source and Everywhere',
    part: 2,
    sections: ['Installation and Setup', 'CLI Basics', 'Advanced Features'],
    estimatedTime: 40,
    totalLessons: 6
  },
  7: {
    title: 'Bash Essentials for AI-Driven Development',
    part: 2,
    sections: ['Bash Fundamentals', 'Scripting', 'Configuration & Secrets'],
    estimatedTime: 50,
    totalLessons: 7
  },
  10: {
    title: 'Prompt Engineering for AI-Driven Development',
    part: 3,
    sections: ['Prompt Basics', 'Advanced Techniques', 'Best Practices'],
    estimatedTime: 60,
    totalLessons: 9
  },
  11: {
    title: 'Context Engineering for AI-Driven Development',
    part: 3,
    sections: ['Context Management', 'Engineering Strategies', 'Optimization'],
    estimatedTime: 55,
    totalLessons: 8
  },
  12: {
    title: 'Python UV - The Fastest Python Package Manager',
    part: 4,
    sections: ['UV Package Manager', 'Installation', 'Usage'],
    estimatedTime: 45,
    totalLessons: 7
  },
  30: {
    title: 'Understanding Spec-Driven Development',
    part: 5,
    sections: ['Fundamentals', 'Methodology', 'Implementation'],
    estimatedTime: 50,
    totalLessons: 7
  },
  31: {
    title: 'Spec-Kit Plus Hands-On',
    part: 5,
    sections: ['Spec-Kit Introduction', 'Hands-On Practice', 'Advanced Features'],
    estimatedTime: 60,
    totalLessons: 9
  },
  32: {
    title: 'AI Orchestra - Agent Teams Manager',
    part: 5,
    sections: ['Agent Teams', 'Orchestration', 'Management'],
    estimatedTime: 55,
    totalLessons: 8
  },
  33: {
    title: 'Tessl and SpecifyPlus - The Ultimate Workflow',
    part: 5,
    sections: ['Tessl Framework', 'SpecifyPlus Integration', 'Complete Workflow'],
    estimatedTime: 65,
    totalLessons: 10
  }
};

class LessonController {
  constructor() {
    this.currentChapter = 1;
    this.currentLesson = 0;
    this.language = storage.getLanguage();
    this.userId = storage.getUserId();
    this.wrongStreakThreshold = 3;
    this.adaptiveMode = false;
  }

  /**
   * Initialize the tutor session
   */
  async initialize() {
    const progress = storage.getProgress();
    this.currentChapter = progress.currentChapter;
    this.language = storage.getLanguage();

    // Send greeting
    return await this.sendGreeting();
  }

  /**
   * Send initial greeting message
   */
  async sendGreeting() {
    const action = {
      action: 'greeting',
      chapter: this.currentChapter,
      language: this.language,
      userId: this.userId,
      uiHints: {
        tone: storage.getTone(),
        length: 'medium'
      }
    };

    // Try backend first, fall back to mock if it fails
    if (!useMockResponses) {
      try {
        const response = await agentApi.sendCoLearningAction(action);
        if (response.success) {
          console.log('✅ Using backend agent');
          return response;
        }
      } catch (error) {
        console.warn('⚠️ Backend failed, using mock:', error);
      }
    }

    console.log('📝 Using mock responses');
    return await mockCoLearningResponse(action);
  }

  /**
   * Start learning from a specific chapter
   */
  async startChapter(chapterNumber, language = null) {
    this.currentChapter = chapterNumber;
    this.currentLesson = 0;

    if (language) {
      this.language = language;
      storage.saveLanguage(language);
    }

    storage.saveProgress(chapterNumber);
    storage.resetWrongStreak();

    return await this.getNextLesson();
  }

  /**
   * Get the next lesson step
   */
  async getNextLesson() {
    const chapter = CHAPTER_METADATA[this.currentChapter];
    if (!chapter) {
      return {
        success: false,
        message: 'Chapter not found',
        error: 'Invalid chapter number'
      };
    }

    this.currentLesson++;

    // Check if chapter is complete
    if (this.currentLesson > chapter.totalLessons) {
      return await this.prepareQuiz();
    }

    const action = {
      action: 'lesson_step',
      chapter: this.currentChapter,
      section: chapter.sections[Math.floor(this.currentLesson / 2)] || 'Section',
      language: this.language,
      userId: this.userId,
      uiHints: {
        tone: storage.getTone(),
        length: this.adaptiveMode ? 'long' : 'short' // Longer explanations in adaptive mode
      }
    };

    // Try backend first, fall back to mock
    if (!useMockResponses) {
      try {
        const response = await agentApi.sendCoLearningAction(action);
        if (response.success) {
          return response;
        }
      } catch (error) {
        console.warn('⚠️ Backend failed for lesson step, using mock:', error);
      }
    }

    return await mockCoLearningResponse(action);
  }

  /**
   * Process student message/answer - sends directly to backend agent
   */
  async processStudentAnswer(message) {
    // Send student message directly to backend agent for natural conversation
    // The agent will handle all teaching logic autonomously
    const action = {
      action: 'message', // Direct message action - sends text as-is to agent
      chapter: this.currentChapter,
      text: message,
      language: this.language,
      userId: this.userId,
      uiHints: {
        tone: storage.getTone(),
        length: 'medium'
      }
    };

    // Try backend first
    if (!useMockResponses) {
      try {
        const response = await agentApi.sendCoLearningAction(action);
        if (response.success) {
          console.log('✅ Agent response received');
          return {
            success: true,
            message: response.message,
            phase: response.phase || 'teaching'
          };
        }
      } catch (error) {
        console.error('⚠️ Backend failed for student message:', error);
      }
    }

    // Fallback to mock
    console.log('📝 Using mock response');
    return await mockCoLearningResponse(action);
  }

  /**
   * Simple answer evaluation (can be enhanced with AI)
   */
  evaluateAnswer(answer) {
    // Basic validation - answer should be meaningful
    if (!answer || answer.trim().length < 10) {
      return false;
    }

    // Simple heuristic: answers with keywords are likely correct
    // In production, this would use AI to evaluate
    const keywords = ['ai', 'development', 'code', 'software', 'agent', 'automation', 'learning'];
    const hasKeyword = keywords.some(keyword =>
      answer.toLowerCase().includes(keyword)
    );

    return hasKeyword;
  }

  /**
   * Get simplified explanation for struggling students
   */
  async getSimplifiedExplanation() {
    const action = {
      action: 'explain',
      chapter: this.currentChapter,
      text: 'Simplify this concept for a beginner',
      language: this.language,
      userId: this.userId,
      uiHints: {
        tone: 'student-friendly',
        length: 'long'
      }
    };

    if (!useMockResponses) {
      try {
        const response = await agentApi.sendCoLearningAction(action);
        if (response.success) {
          return response.message;
        }
      } catch (error) {
        console.warn('⚠️ Backend failed for simplified explanation:', error);
      }
    }

    return (await mockCoLearningResponse(action)).message;
  }

  /**
   * Get clarification based on student's wrong answer
   */
  async getClarification(wrongAnswer) {
    const action = {
      action: 'explain',
      chapter: this.currentChapter,
      text: `Student answered: "${wrongAnswer}". Provide clarification.`,
      studentAnswer: wrongAnswer,
      language: this.language,
      userId: this.userId,
      uiHints: {
        tone: 'encouraging',
        length: 'medium'
      }
    };

    if (!useMockResponses) {
      try {
        const response = await agentApi.sendCoLearningAction(action);
        if (response.success) {
          return response.message;
        }
      } catch (error) {
        console.warn('⚠️ Backend failed for clarification:', error);
      }
    }

    return (await mockCoLearningResponse(action)).message;
  }

  /**
   * Prepare quiz for current chapter
   */
  async prepareQuiz() {
    const action = {
      action: 'quiz_prepare',
      chapter: this.currentChapter,
      language: this.language,
      userId: this.userId
    };

    let message;
    if (!useMockResponses) {
      try {
        const response = await agentApi.sendCoLearningAction(action);
        if (response.success) {
          message = response.message;
        }
      } catch (error) {
        console.warn('⚠️ Backend failed for quiz prep:', error);
        message = (await mockCoLearningResponse(action)).message;
      }
    } else {
      message = (await mockCoLearningResponse(action)).message;
    }

    return {
      success: true,
      message,
      showQuiz: true,
      quizReady: true
    };
  }

  /**
   * Generate quiz questions
   */
  async generateQuiz() {
    if (!useMockResponses) {
      try {
        const questions = await agentApi.prepareQuiz(this.currentChapter, this.language);
        if (questions && questions.length > 0) {
          return questions;
        }
      } catch (error) {
        console.warn('⚠️ Backend failed for quiz generation:', error);
      }
    }

    return await mockGenerateQuiz(this.currentChapter, this.language);
  }

  /**
   * Grade quiz and provide feedback
   */
  async gradeQuiz(answers) {
    let result;

    if (!useMockResponses) {
      try {
        result = await agentApi.gradeQuiz(this.currentChapter, answers);
      } catch (error) {
        console.warn('⚠️ Backend failed for quiz grading:', error);
        result = null;
      }
    }

    // Fall back to mock grading
    if (!result) {
      const questions = await mockGenerateQuiz(this.currentChapter);
      let score = 0;
      const gradedAnswers = answers.map((userAnswer, index) => {
        const question = questions[index];
        const correct = userAnswer === question.correctAnswer;
        if (correct) score++;

        return {
          questionId: question.id,
          userAnswer,
          correct,
          feedback: correct ? '✅ Correct!' : `❌ ${question.explanation}`
        };
      });

      const percentage = (score / questions.length) * 100;
      result = {
        score,
        totalQuestions: questions.length,
        percentage,
        answers: gradedAnswers,
        needsRemedial: percentage < 50
      };
    }

    // Save quiz result
    storage.saveQuizResult(this.currentChapter, result);

    // Mark chapter as complete if passed
    if (result.percentage >= 50) {
      storage.markChapterComplete(this.currentChapter);
      storage.saveChapterProgress(this.currentChapter, 100);
    }

    return this.generateQuizFeedback(result);
  }

  /**
   * Generate personalized quiz feedback
   */
  async generateQuizFeedback(result) {
    const { percentage, needsRemedial, weakTopics } = result;

    let message = `🎉 **Quiz Complete!**\n\n`;
    message += `Your Score: **${result.score}/${result.totalQuestions}** (${percentage.toFixed(0)}%)\n\n`;

    if (percentage >= 90) {
      message += `**Outstanding!** 🌟 You've mastered this chapter!\n\nWould you like to:\n- Move to the next chapter\n- Try advanced optional readings`;
    } else if (percentage >= 70) {
      message += `**Good job!** You have a solid understanding.\n\nWould you like to:\n- Move to the next chapter\n- Review a few concepts`;
    } else if (percentage >= 50) {
      message += `**Not bad!** You're getting there.\n\nI recommend:\n- Quick review of key concepts\n- Then move to next chapter`;
    } else {
      message += `**Let's review!** Don't worry, learning takes time.\n\nI'll help you with:\n- Remedial mini-lesson on weak topics\n- Then retake the quiz`;
    }

    return {
      success: true,
      message,
      result,
      showRemedial: needsRemedial,
      canAdvance: percentage >= 50
    };
  }

  /**
   * Generate a practice task
   */
  async generateTask() {
    const action = {
      action: 'task',
      chapter: this.currentChapter,
      language: this.language,
      userId: this.userId,
      uiHints: {
        tone: storage.getTone(),
        length: 'medium'
      }
    };

    if (!useMockResponses) {
      try {
        const response = await agentApi.sendCoLearningAction(action);
        if (response.success) {
          return response;
        }
      } catch (error) {
        console.warn('⚠️ Backend failed for task generation:', error);
      }
    }

    return await mockCoLearningResponse(action);
  }

  /**
   * Get chapter metadata
   */
  getChapterMetadata(chapterNumber = null) {
    if (chapterNumber) {
      return CHAPTER_METADATA[chapterNumber];
    }
    return CHAPTER_METADATA;
  }

  /**
   * Get course structure (Parts and Chapters)
   */
  getCourseStructure() {
    return COURSE_STRUCTURE;
  }

  /**
   * Get all parts
   */
  getParts() {
    return COURSE_STRUCTURE.parts;
  }

  /**
   * Get chapters for a specific part
   */
  getPartChapters(partNumber) {
    const part = COURSE_STRUCTURE.parts[partNumber];
    if (!part) return [];

    return part.chapters.map(chapterNum => ({
      number: chapterNum,
      ...CHAPTER_METADATA[chapterNum]
    }));
  }

  /**
   * Calculate progress for current chapter
   */
  getChapterProgressPercentage() {
    const chapter = CHAPTER_METADATA[this.currentChapter];
    if (!chapter) return 0;

    return Math.floor((this.currentLesson / chapter.totalLessons) * 100);
  }

  /**
   * Get summary of student's overall progress
   */
  getProgressSummary() {
    const completedChapters = storage.getProgress().completedChapters;
    const quizResults = storage.getQuizResults();
    const totalChapters = Object.keys(CHAPTER_METADATA).length;

    const averageScore = Object.values(quizResults).reduce((sum, result) => {
      return sum + (result.percentage || 0);
    }, 0) / Math.max(completedChapters.length, 1);

    return {
      completedChapters: completedChapters.length,
      totalChapters,
      overallProgress: (completedChapters.length / totalChapters) * 100,
      averageScore,
      currentChapter: this.currentChapter,
      language: this.language
    };
  }

  /**
   * Reset and start over
   */
  reset() {
    storage.resetAllProgress();
    this.currentChapter = 1;
    this.currentLesson = 0;
    this.adaptiveMode = false;
  }
}

// Export singleton instance
export const lessonController = new LessonController();
export default lessonController;
