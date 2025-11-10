import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import lessonController from '../../utils/LessonController';

/**
 * Quiz Component - Interactive 10-question quiz
 */
const QuizComponent = ({ chapterNumber, onComplete, onClose }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, [chapterNumber]);

  const loadQuiz = async () => {
    setIsLoading(true);
    try {
      const quizQuestions = await lessonController.generateQuiz();
      setQuestions(quizQuestions);
    } catch (error) {
      console.error('Error loading quiz:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setShowExplanation(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setShowExplanation(false);
    }
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    const unanswered = questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      alert(`Please answer all questions. ${unanswered.length} remaining.`);
      return;
    }

    setIsLoading(true);
    try {
      // Convert answers object to array
      const answerArray = questions.map(q => answers[q.id]);

      // Grade quiz
      const gradeResult = await lessonController.gradeQuiz(answerArray);
      setResult(gradeResult);
      setIsSubmitted(true);

      // Notify parent
      if (onComplete) {
        onComplete(gradeResult.result);
      }
    } catch (error) {
      console.error('Error grading quiz:', error);
      alert('Error grading quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderQuestionType = (question) => {
    const userAnswer = answers[question.id];

    switch (question.type) {
      case 'multiple_choice':
        return (
          <div className="quiz-options">
            {question.options?.map((option, index) => {
              const isSelected = userAnswer === index;
              const isCorrect = isSubmitted && index === question.correctAnswer;
              const isWrong = isSubmitted && isSelected && index !== question.correctAnswer;

              return (
                <motion.button
                  key={index}
                  className={`quiz-option ${isSelected ? 'selected' : ''} ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
                  onClick={() => !isSubmitted && handleAnswerSelect(question.id, index)}
                  disabled={isSubmitted}
                  whileHover={!isSubmitted ? { scale: 1.02 } : {}}
                  whileTap={!isSubmitted ? { scale: 0.98 } : {}}
                >
                  <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                  <span className="option-text">{option}</span>
                  {isCorrect && <span className="option-icon">✅</span>}
                  {isWrong && <span className="option-icon">❌</span>}
                </motion.button>
              );
            })}
          </div>
        );

      case 'true_false':
        return (
          <div className="quiz-options quiz-tf">
            {['True', 'False'].map((option, index) => {
              const isSelected = userAnswer === index;
              const isCorrect = isSubmitted && index === question.correctAnswer;
              const isWrong = isSubmitted && isSelected && index !== question.correctAnswer;

              return (
                <motion.button
                  key={index}
                  className={`quiz-option ${isSelected ? 'selected' : ''} ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
                  onClick={() => !isSubmitted && handleAnswerSelect(question.id, index)}
                  disabled={isSubmitted}
                  whileHover={!isSubmitted ? { scale: 1.05 } : {}}
                  whileTap={!isSubmitted ? { scale: 0.95 } : {}}
                >
                  {option === 'True' ? '✓ True' : '✗ False'}
                  {isCorrect && <span className="option-icon">✅</span>}
                  {isWrong && <span className="option-icon">❌</span>}
                </motion.button>
              );
            })}
          </div>
        );

      case 'short_answer':
        return (
          <div className="quiz-short-answer">
            <textarea
              className="quiz-textarea"
              value={userAnswer || ''}
              onChange={(e) => handleAnswerSelect(question.id, e.target.value)}
              placeholder="Type your answer here..."
              rows={3}
              disabled={isSubmitted}
            />
            {isSubmitted && question.correctAnswer && (
              <div className="correct-answer-hint">
                <strong>Sample correct answer:</strong> {question.correctAnswer}
              </div>
            )}
          </div>
        );

      default:
        return <p>Unknown question type</p>;
    }
  };

  if (isLoading && questions.length === 0) {
    return (
      <div className="quiz-container loading">
        <div className="quiz-loader">
          <div className="loader-spinner"></div>
          <p>Preparing your quiz...</p>
        </div>
      </div>
    );
  }

  if (isSubmitted && result) {
    return (
      <div className="quiz-container results">
        <motion.div
          className="quiz-results"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Results Header */}
          <div className="results-header">
            <h2>🎉 Quiz Complete!</h2>
            <div className="results-score">
              <div className="score-circle">
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  <motion.circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke={result.result.percentage >= 70 ? '#10b981' : result.result.percentage >= 50 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 54}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 54 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 54 * (1 - result.result.percentage / 100) }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    transform="rotate(-90 60 60)"
                  />
                  <text
                    x="60"
                    y="60"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="score-text"
                  >
                    {result.result.percentage.toFixed(0)}%
                  </text>
                </svg>
              </div>
              <p className="score-label">
                {result.result.score} / {result.result.totalQuestions} Correct
              </p>
            </div>
          </div>

          {/* Feedback Message */}
          <div className="results-feedback">
            <ReactMarkdown>{result.message}</ReactMarkdown>
          </div>

          {/* Detailed Answers */}
          <div className="results-details">
            <h3>📝 Review Your Answers</h3>
            {result.result.answers.map((answer, index) => (
              <div key={index} className={`answer-review ${answer.correct ? 'correct' : 'incorrect'}`}>
                <div className="answer-review-header">
                  <span className="answer-number">Q{index + 1}</span>
                  <span className="answer-status">
                    {answer.correct ? '✅ Correct' : '❌ Incorrect'}
                  </span>
                </div>
                <div className="answer-feedback">
                  <ReactMarkdown>{answer.feedback}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="results-actions">
            {result.showRemedial && (
              <button className="quiz-btn secondary">
                📚 Review Weak Topics
              </button>
            )}
            {result.canAdvance && (
              <button className="quiz-btn primary" onClick={onComplete}>
                ➡️ Continue to Next Chapter
              </button>
            )}
            <button className="quiz-btn" onClick={() => {
              setIsSubmitted(false);
              setAnswers({});
              setCurrentQuestion(0);
              loadQuiz();
            }}>
              🔄 Retake Quiz
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="quiz-container">
      <motion.div
        className="quiz-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="quiz-header">
          <h2>📝 Chapter {chapterNumber} Quiz</h2>
          {onClose && (
            <button className="quiz-close-btn" onClick={onClose}>✕</button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="quiz-progress">
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="progress-text">
            Question {currentQuestion + 1} of {questions.length}
          </span>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          {question && (
            <motion.div
              key={currentQuestion}
              className="quiz-question"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="question-text">
                <ReactMarkdown>{question.question}</ReactMarkdown>
              </h3>

              {renderQuestionType(question)}

              {/* Explanation (shown after submission or on demand) */}
              {(isSubmitted || showExplanation) && question.explanation && (
                <motion.div
                  className="question-explanation"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <strong>💡 Explanation:</strong>
                  <p>{question.explanation}</p>
                </motion.div>
              )}

              {!isSubmitted && question.explanation && !showExplanation && (
                <button
                  className="show-explanation-btn"
                  onClick={() => setShowExplanation(true)}
                >
                  💡 Show Explanation
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="quiz-navigation">
          <button
            className="quiz-btn secondary"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            ← Previous
          </button>

          <div className="quiz-dots">
            {questions.map((_, index) => (
              <button
                key={index}
                className={`quiz-dot ${index === currentQuestion ? 'active' : ''} ${answers[questions[index].id] !== undefined ? 'answered' : ''}`}
                onClick={() => setCurrentQuestion(index)}
                title={`Question ${index + 1}`}
              />
            ))}
          </div>

          {currentQuestion < questions.length - 1 ? (
            <button
              className="quiz-btn primary"
              onClick={handleNext}
            >
              Next →
            </button>
          ) : (
            <button
              className="quiz-btn success"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? 'Grading...' : '✓ Submit Quiz'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default QuizComponent;
