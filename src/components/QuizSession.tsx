import { useState, useEffect } from 'react';
import { supabase, Question, QuizSession as QuizSessionType } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, XCircle, Trophy, Clock } from 'lucide-react';

const QUIZ_COST = 100;
const QUESTIONS_PER_SESSION = 5;
const MIN_CORRECT_ANSWERS = 3;
const TIME_PER_QUESTION = 30;

interface QuizSessionProps {
  onComplete: () => void;
}

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

  const currentQuestion = questions[currentQuestionIndex];
  const language = profile?.preferred_language || 'english';

  const getTranslatedText = (question: Question, field: 'question' | 'option_a' | 'option_b' | 'option_c') => {
    if (language === 'english') {
      return field === 'question' ? question.question_text : question[field];
    }

    const langSuffix = `_${language}`;
    const fieldKey = field === 'question' ? `question_text${langSuffix}` : `${field}${langSuffix}`;
    const translatedText = question[fieldKey as keyof Question];

    if (translatedText && typeof translatedText === 'string') {
      return translatedText;
    }

    return field === 'question' ? question.question_text : question[field];
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

    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    const newCorrectCount = isCorrect ? correctCount + 1 : correctCount;

    try {
      await supabase.from('quiz_answers').insert([
        {
          session_id: currentSession.id,
          question_id: currentQuestion.id,
          user_answer: selectedAnswer || 'TIMEOUT',
          is_correct: isCorrect,
        },
      ]);

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
      const { data: wallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!wallet || wallet.balance < QUIZ_COST) {
        alert('Insufficient balance. Please fund your wallet.');
        setLoading(false);
        return;
      }

      const newBalance = wallet.balance - QUIZ_COST;
      const { error: walletError } = await supabase
        .from('wallets')
        .update({
          balance: newBalance,
          updated_at: new Date().toISOString(),
        })
        .eq('id', wallet.id);

      if (walletError) throw walletError;

      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert([
          {
            wallet_id: wallet.id,
            type: 'quiz_payment',
            amount: -QUIZ_COST,
            description: 'Quiz session payment',
          },
        ]);

      if (transactionError) throw transactionError;

      const { data: allQuestions } = await supabase
        .from('questions')
        .select('*')
        .eq('is_active', true);

      if (!allQuestions || allQuestions.length < QUESTIONS_PER_SESSION) {
        alert('Not enough questions available. Please contact admin.');
        setLoading(false);
        return;
      }

      const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
      const selectedQuestions = shuffled.slice(0, QUESTIONS_PER_SESSION);

      const { data: session, error: sessionError } = await supabase
        .from('quiz_sessions')
        .insert([
          {
            user_id: user.id,
            status: 'in_progress',
          },
        ])
        .select()
        .single();

      if (sessionError) throw sessionError;

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

    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    const newCorrectCount = isCorrect ? correctCount + 1 : correctCount;

    try {
      await supabase.from('quiz_answers').insert([
        {
          session_id: currentSession.id,
          question_id: currentQuestion.id,
          user_answer: selectedAnswer,
          is_correct: isCorrect,
        },
      ]);

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
      await supabase
        .from('quiz_sessions')
        .update({
          status: 'completed',
          correct_answers: finalCorrectCount,
          points_earned: pointsEarned,
          completed_at: new Date().toISOString(),
        })
        .eq('id', currentSession.id);

      if (pointsEarned > 0) {
        const { data: userPoints } = await supabase
          .from('user_points')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (userPoints) {
          await supabase
            .from('user_points')
            .update({
              points: userPoints.points + pointsEarned,
              total_earned: userPoints.total_earned + pointsEarned,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userPoints.id);
        }
      }

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
              Collect 5 points to spin the Magic Wheel and win prizes
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
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <Trophy className="text-green-600" size={40} />
          </div>
          <h2 className="text-3xl font-bold mb-4">Start Quiz Session</h2>
          <p className="text-gray-600 mb-6">
            Answer 5 sports questions. Get at least 3 correct to earn 1 point!
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 mb-6 text-left">
          <h3 className="font-semibold text-blue-900 mb-3">Session Details:</h3>
          <ul className="space-y-2 text-blue-800">
            <li>• Cost: ₦{QUIZ_COST}</li>
            <li>• Questions: {QUESTIONS_PER_SESSION}</li>
            <li>• Time per question: {TIME_PER_QUESTION} seconds</li>
            <li>• Minimum correct: {MIN_CORRECT_ANSWERS}</li>
            <li>• Reward: 1 point (if passed)</li>
          </ul>
        </div>

        <button
          onClick={startNewSession}
          disabled={loading}
          className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Starting...' : `Start Quiz (₦${QUIZ_COST})`}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock size={20} />
            <span>Question {currentQuestionIndex + 1} of {QUESTIONS_PER_SESSION}</span>
          </div>
          <div className="flex items-center gap-4">
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
          <h3 className="text-2xl font-bold mb-6">{getTranslatedText(currentQuestion, 'question')}</h3>

          <div className="space-y-3 mb-6">
            {['A', 'B', 'C'].map((option) => {
              const optionKey = `option_${option.toLowerCase()}` as 'option_a' | 'option_b' | 'option_c';
              const optionText = getTranslatedText(currentQuestion, optionKey);
              const isSelected = selectedAnswer === option;
              const isCorrect = option === currentQuestion.correct_answer;
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
                >
                  <div className="flex items-center justify-between">
                    <span>
                      <strong>{option}.</strong> {optionText}
                    </span>
                    {showCorrectAnswer && <CheckCircle className="text-green-600" size={24} />}
                    {showWrongAnswer && <XCircle className="text-red-600" size={24} />}
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
            >
              Submit Answer
            </button>
          )}
        </div>
      )}
    </div>
  );
}
