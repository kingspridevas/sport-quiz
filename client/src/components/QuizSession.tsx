import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authFetch } from '../lib/authFetch';
import { CheckCircle, XCircle, Trophy, Clock, Globe } from 'lucide-react';

const QUIZ_COST = 100;
const QUESTIONS_PER_SESSION = 5;
const MIN_CORRECT_ANSWERS = 3;
const TIME_PER_QUESTION = 30;

const LANGUAGES = [
  { value: 'english', label: 'English', flag: 'EN' },
  { value: 'yoruba', label: 'Yoruba', flag: 'YO' },
  { value: 'hausa', label: 'Hausa', flag: 'HA' },
  { value: 'igbo', label: 'Igbo', flag: 'IG' },
];

interface Question {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  questionTextYoruba?: string;
  questionTextHausa?: string;
  questionTextIgbo?: string;
  optionAYoruba?: string;
  optionAHausa?: string;
  optionAIgbo?: string;
  optionBYoruba?: string;
  optionBHausa?: string;
  optionBIgbo?: string;
  optionCYoruba?: string;
  optionCHausa?: string;
  optionCIgbo?: string;
  correctAnswer: string;
  difficulty: string;
  isActive: boolean;
}

interface QuizSessionType {
  id: string;
  userId: string;
  status: string;
  correctAnswers: number;
  totalQuestions: number;
  pointsEarned: number;
  startedAt: string;
  completedAt: string | null;
}

interface QuizSessionProps {
  onComplete: () => void;
}

const LANGUAGE_LABELS: Record<string, string> = {
  english: 'English',
  yoruba: 'Yoruba',
  hausa: 'Hausa',
  igbo: 'Igbo',
};

export function QuizSession({ onComplete }: QuizSessionProps) {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<QuizSessionType | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(TIME_PER_QUESTION);
  const [selectedLanguage, setSelectedLanguage] = useState(profile?.preferredLanguage || 'english');

  const currentQuestion = questions[currentQuestionIndex];
  const language = selectedLanguage;

  useEffect(() => {
    if (profile?.preferredLanguage) {
      setSelectedLanguage(profile.preferredLanguage);
    }
  }, [profile?.preferredLanguage]);

  const handleLanguageChange = async (lang: string) => {
    setSelectedLanguage(lang);
    if (user) {
      try {
        await authFetch(`/api/profile/${user.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ preferredLanguage: lang }),
        });
      } catch (error) {
        console.error('Error updating language preference:', error);
      }
    }
  };

  const getTranslatedText = (question: Question, field: 'question' | 'optionA' | 'optionB' | 'optionC') => {
    if (language === 'english') {
      if (field === 'question') return question.questionText;
      if (field === 'optionA') return question.optionA;
      if (field === 'optionB') return question.optionB;
      if (field === 'optionC') return question.optionC;
    }

    const langSuffix = language.charAt(0).toUpperCase() + language.slice(1);
    
    if (field === 'question') {
      const translatedKey = `questionText${langSuffix}` as keyof Question;
      return (question[translatedKey] as string) || question.questionText;
    }
    
    const translatedKey = `${field}${langSuffix}` as keyof Question;
    const fallbackKey = field as keyof Question;
    return (question[translatedKey] as string) || (question[fallbackKey] as string);
  };

  useEffect(() => {
    if (!currentSession || showResult || sessionComplete) return;

    setTimeRemaining(TIME_PER_QUESTION);

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, currentSession, showResult, sessionComplete]);

  const handleTimeUp = async () => {
    if (showResult || !currentSession || !currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const newCorrectCount = isCorrect ? correctCount + 1 : correctCount;

    try {
      await authFetch('/api/quiz/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSession.id,
          questionId: currentQuestion.id,
          selectedAnswer: selectedAnswer || 'TIMEOUT',
          isCorrect,
        }),
      });

      setCorrectCount(newCorrectCount);
      setShowResult(true);

      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setSelectedAnswer(null);
          setShowResult(false);
        } else {
          completeSession(newCorrectCount);
        }
      }, 2000);
    } catch (error) {
      alert('Error submitting answer');
      console.error(error);
    }
  };

  const startNewSession = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const walletRes = await authFetch(`/api/wallet/${user.id}`);
      if (!walletRes.ok) {
        alert('Could not load wallet. Please try again.');
        setLoading(false);
        return;
      }
      const wallet = await walletRes.json();

      if (!wallet || parseFloat(wallet.balance) < QUIZ_COST) {
        alert('Insufficient balance. Please fund your wallet.');
        setLoading(false);
        return;
      }

      const questionsRes = await authFetch(`/api/questions?limit=20`);
      if (!questionsRes.ok) {
        alert('Could not load questions. Please try again.');
        setLoading(false);
        return;
      }
      const allQuestions = await questionsRes.json();

      if (!allQuestions || allQuestions.length < QUESTIONS_PER_SESSION) {
        alert('Not enough questions available. Please contact admin.');
        setLoading(false);
        return;
      }

      const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
      const selectedQuestions = shuffled.slice(0, QUESTIONS_PER_SESSION);

      const sessionRes = await authFetch('/api/quiz/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          status: 'in_progress',
          correctAnswers: 0,
          totalQuestions: QUESTIONS_PER_SESSION,
          pointsEarned: 0,
        }),
      });

      if (!sessionRes.ok) {
        throw new Error('Failed to start quiz session');
      }

      const session = await sessionRes.json();

      setCurrentSession(session);
      setQuestions(selectedQuestions);
      setCurrentQuestionIndex(0);
      setCorrectCount(0);
      setSessionComplete(false);
    } catch (error) {
      alert('Error starting quiz session');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer || !currentSession || !currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const newCorrectCount = isCorrect ? correctCount + 1 : correctCount;

    try {
      await authFetch('/api/quiz/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSession.id,
          questionId: currentQuestion.id,
          selectedAnswer,
          isCorrect,
        }),
      });

      setCorrectCount(newCorrectCount);
      setShowResult(true);

      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setSelectedAnswer(null);
          setShowResult(false);
        } else {
          completeSession(newCorrectCount);
        }
      }, 2000);
    } catch (error) {
      alert('Error submitting answer');
      console.error(error);
    }
  };

  const completeSession = async (finalCorrectCount: number) => {
    if (!currentSession || !user) return;

    const pointsEarned = finalCorrectCount >= MIN_CORRECT_ANSWERS ? 1 : 0;

    try {
      await authFetch(`/api/quiz/session/${currentSession.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          correctAnswers: finalCorrectCount,
          totalQuestions: QUESTIONS_PER_SESSION,
          pointsEarned,
          completedAt: new Date().toISOString(),
        }),
      });

      setSessionComplete(true);
    } catch (error) {
      console.error('Error completing session:', error);
    }
  };

  if (sessionComplete) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="mb-6">
          {correctCount >= MIN_CORRECT_ANSWERS ? (
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <Trophy className="text-green-600" size={40} />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <XCircle className="text-gray-600" size={40} />
            </div>
          )}
        </div>

        <h2 className="text-3xl font-bold mb-4">
          {correctCount >= MIN_CORRECT_ANSWERS
            ? 'Congratulations!'
            : 'Session Complete'}
        </h2>

        <p className="text-xl text-gray-700 mb-6">
          You got {correctCount} out of {QUESTIONS_PER_SESSION} questions correct
        </p>

        {correctCount >= MIN_CORRECT_ANSWERS ? (
          <div className="bg-green-50 rounded-lg p-6 mb-6">
            <p className="text-green-800 font-semibold text-lg">
              You earned 1 point!
            </p>
            <p className="text-green-700 text-sm mt-2">
              Collect 10 points to spin the Magic Wheel and win prizes
            </p>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <p className="text-gray-700">
              You need at least {MIN_CORRECT_ANSWERS} correct answers to earn a point.
            </p>
            <p className="text-gray-600 text-sm mt-2">Try again!</p>
          </div>
        )}

        <button
          onClick={onComplete}
          className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          data-testid="button-back-dashboard"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <Trophy className="text-green-600" size={40} />
          </div>
          <h2 className="text-3xl font-bold mb-4">Start Quiz Session</h2>
          <p className="text-gray-600 mb-6">
            Answer 5 sports questions. Get at least 3 correct to earn 1 point!
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="text-green-600" size={24} />
            <h3 className="font-bold text-lg text-gray-900">Choose Your Language</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Select the language you want to answer questions in
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.value}
                onClick={() => handleLanguageChange(lang.value)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedLanguage === lang.value
                    ? 'border-green-600 bg-green-100 shadow-md'
                    : 'border-gray-200 bg-white hover:border-green-400'
                }`}
                data-testid={`button-language-${lang.value}`}
              >
                <div className={`text-2xl font-bold mb-1 ${
                  selectedLanguage === lang.value ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {lang.flag}
                </div>
                <div className={`font-semibold ${
                  selectedLanguage === lang.value ? 'text-green-700' : 'text-gray-700'
                }`}>
                  {lang.label}
                </div>
                {selectedLanguage === lang.value && (
                  <CheckCircle className="text-green-600 mx-auto mt-2" size={20} />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 mb-6 text-left">
          <h3 className="font-semibold text-blue-900 mb-3">Session Details:</h3>
          <ul className="space-y-2 text-blue-800">
            <li>Cost: ₦{QUIZ_COST}</li>
            <li>Questions: {QUESTIONS_PER_SESSION}</li>
            <li>Time per question: {TIME_PER_QUESTION} seconds</li>
            <li>Minimum correct: {MIN_CORRECT_ANSWERS}</li>
            <li>Reward: 1 point (if passed)</li>
          </ul>
        </div>

        <div className="text-center">
          <button
            onClick={startNewSession}
            disabled={loading}
            className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 text-lg"
            data-testid="button-start-quiz-session"
          >
            {loading ? 'Starting...' : `Start Quiz in ${LANGUAGE_LABELS[selectedLanguage]} (₦${QUIZ_COST})`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock size={20} />
            <span>Question {currentQuestionIndex + 1} of {QUESTIONS_PER_SESSION}</span>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {LANGUAGE_LABELS[language]}
            </span>
            <div className={`flex items-center gap-2 font-bold text-xl ${
              timeRemaining <= 10 ? 'text-red-600 animate-pulse' : 'text-blue-600'
            }`}>
              <Clock size={24} />
              <span>{timeRemaining}s</span>
            </div>
            <div className="text-green-600 font-semibold">
              Score: {correctCount}/{currentQuestionIndex}
            </div>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentQuestionIndex + 1) / QUESTIONS_PER_SESSION) * 100}%`,
            }}
          />
        </div>
      </div>

      {currentQuestion && (
        <div>
          <h3 className="text-2xl font-bold mb-6" data-testid="text-question">
            {getTranslatedText(currentQuestion, 'question')}
          </h3>

          <div className="space-y-3 mb-6">
            {['A', 'B', 'C'].map((option) => {
              const optionKey = `option${option}` as 'optionA' | 'optionB' | 'optionC';
              const optionText = getTranslatedText(currentQuestion, optionKey);
              const isSelected = selectedAnswer === option;
              const isCorrect = option === currentQuestion.correctAnswer;
              const showCorrectAnswer = showResult && isCorrect;
              const showWrongAnswer = showResult && isSelected && !isCorrect;

              return (
                <button
                  key={option}
                  onClick={() => !showResult && setSelectedAnswer(option)}
                  disabled={showResult}
                  className={`w-full p-4 rounded-lg text-left font-medium transition-all ${
                    showCorrectAnswer
                      ? 'bg-green-100 border-2 border-green-600'
                      : showWrongAnswer
                      ? 'bg-red-100 border-2 border-red-600'
                      : isSelected
                      ? 'bg-green-50 border-2 border-green-600'
                      : 'bg-gray-50 border-2 border-gray-200 hover:border-green-400'
                  } disabled:cursor-not-allowed`}
                  data-testid={`button-option-${option}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>
                      <strong>{option}.</strong> {optionText}
                    </span>
                    {showCorrectAnswer && <CheckCircle className="text-green-600 flex-shrink-0" size={24} />}
                    {showWrongAnswer && <XCircle className="text-red-600 flex-shrink-0" size={24} />}
                  </div>
                </button>
              );
            })}
          </div>

          {!showResult && (
            <button
              onClick={handleAnswerSubmit}
              disabled={!selectedAnswer}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-submit-answer"
            >
              Submit Answer
            </button>
          )}
        </div>
      )}
    </div>
  );
}
