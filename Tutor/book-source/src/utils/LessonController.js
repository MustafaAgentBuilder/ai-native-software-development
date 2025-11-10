/**
 * Lesson Controller
 * Manages lesson flow, adaptive learning, and progress tracking
 */

import { agentApi, mockCoLearningResponse, mockGenerateQuiz, useMockResponses } from './agentApi.ts';
import * as storage from './localStorageService';

// Chapter metadata structure
const CHAPTER_METADATA = {
  1: {
    title: 'Introducing AI-Driven Development',
    sections: ['AI Development Revolution', 'The Turning Point', 'Billion Dollar AI', 'Nine Pillars'],
    estimatedTime: 45, // minutes
    totalLessons: 8
  },
  2: {
    title: 'AI Tool Landscape',
    sections: ['Claude Code Features', 'Workflow Patterns', 'Best Practices'],
    estimatedTime: 40,
    totalLessons: 6
  },
  3: {
    title: 'Prompt Engineering',
    sections: ['Basics', 'Advanced Techniques', 'Best Practices'],
    estimatedTime: 50,
    totalLessons: 7
  },
  // Add more chapters as needed
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

    if (useMockResponses) {
      return await mockCoLearningResponse(action);
    }

    return await agentApi.sendCoLearningAction(action);
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

    // Get lesson content from RAG or mock
    if (useMockResponses) {
      return await mockCoLearningResponse(action);
    }

    return await agentApi.sendCoLearningAction(action);
  }

  /**
   * Process student answer to a reflection question
   */
  async processStudentAnswer(answer) {
    const isCorrect = this.evaluateAnswer(answer);

    if (!isCorrect) {
      const streak = storage.incrementWrongStreak();

      // Trigger adaptive mode if streak threshold reached
      if (streak >= this.wrongStreakThreshold) {
        this.adaptiveMode = true;
        return {
          success: true,
          message: `I notice you're having some trouble with this concept. Let me explain it in a simpler way...\n\n${await this.getSimplifiedExplanation()}`,
          adaptiveMode: true
        };
      }

      return {
        success: true,
        message: `Not quite! Let me clarify... ${await this.getClarification(answer)}`,
        needsClarification: true
      };
    } else {
      storage.resetWrongStreak();
      this.adaptiveMode = false;

      return {
        success: true,
        message: `Great answer! 🎉 You've got it! Let's continue...`,
        correct: true
      };
    }
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

    if (useMockResponses) {
      return (await mockCoLearningResponse(action)).message;
    }

    const response = await agentApi.sendCoLearningAction(action);
    return response.message;
  }

  /**
   * Get clarification based on student's wrong answer
   */
  async getClarification(wrongAnswer) {
    const action = {
      action: 'explain',
      chapter: this.currentChapter,
      text: `Student answered: "${wrongAnswer}". Provide clarification.`,
      language: this.language,
      userId: this.userId,
      uiHints: {
        tone: 'encouraging',
        length: 'medium'
      }
    };

    if (useMockResponses) {
      return (await mockCoLearningResponse(action)).message;
    }

    const response = await agentApi.sendCoLearningAction(action);
    return response.message;
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
    if (useMockResponses) {
      message = (await mockCoLearningResponse(action)).message;
    } else {
      message = (await agentApi.sendCoLearningAction(action)).message;
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
    if (useMockResponses) {
      return await mockGenerateQuiz(this.currentChapter, this.language);
    }

    return await agentApi.prepareQuiz(this.currentChapter, this.language);
  }

  /**
   * Grade quiz and provide feedback
   */
  async gradeQuiz(answers) {
    let result;

    if (useMockResponses) {
      // Simple mock grading
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
    } else {
      result = await agentApi.gradeQuiz(this.currentChapter, answers);
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

    if (useMockResponses) {
      return await mockCoLearningResponse(action);
    }

    return await agentApi.sendCoLearningAction(action);
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
