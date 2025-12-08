import { useState, useEffect } from 'react';
import { supabase, Question, PrizeConfig } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit2, Trash2, Save, X, Settings, LogOut } from 'lucide-react';

export function AdminDashboard() {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'questions' | 'prizes'>('questions');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [prizes, setPrizes] = useState<PrizeConfig[]>([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showPrizeForm, setShowPrizeForm] = useState(false);
  const [editingPrize, setEditingPrize] = useState<PrizeConfig | null>(null);

  const [questionForm, setQuestionForm] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    correct_answer: 'A' as 'A' | 'B' | 'C',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
  });

  const [prizeForm, setPrizeForm] = useState({
    prize_name: '',
    prize_type: 'cash' as 'cash' | 'item' | 'retry' | 'draw' | 'thank_you',
    prize_value: '',
    daily_limit: '',
    probability_weight: '1',
  });

  useEffect(() => {
    loadQuestions();
    loadPrizes();
  }, []);

  const loadQuestions = async () => {
    const { data } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setQuestions(data);
  };

  const loadPrizes = async () => {
    const { data } = await supabase
      .from('prize_config')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setPrizes(data);
  };

  const handleSaveQuestion = async () => {
    try {
      if (editingQuestion) {
        await supabase
          .from('questions')
          .update(questionForm)
          .eq('id', editingQuestion.id);
      } else {
        const { data: user } = await supabase.auth.getUser();
        await supabase.from('questions').insert([
          {
            ...questionForm,
            created_by: user.user?.id,
          },
        ]);
      }

      resetQuestionForm();
      loadQuestions();
      alert('Question saved successfully');
    } catch (error) {
      alert('Error saving question');
      console.error(error);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      await supabase.from('questions').delete().eq('id', id);
      loadQuestions();
      alert('Question deleted successfully');
    } catch (error) {
      alert('Error deleting question');
      console.error(error);
    }
  };

  const handleToggleQuestionActive = async (question: Question) => {
    try {
      await supabase
        .from('questions')
        .update({ is_active: !question.is_active })
        .eq('id', question.id);
      loadQuestions();
    } catch (error) {
      alert('Error updating question');
      console.error(error);
    }
  };

  const handleSavePrize = async () => {
    try {
      const prizeData = {
        prize_name: prizeForm.prize_name,
        prize_type: prizeForm.prize_type,
        prize_value: prizeForm.prize_value ? parseFloat(prizeForm.prize_value) : null,
        daily_limit: prizeForm.daily_limit ? parseInt(prizeForm.daily_limit) : null,
        probability_weight: parseInt(prizeForm.probability_weight),
      };

      if (editingPrize) {
        await supabase
          .from('prize_config')
          .update(prizeData)
          .eq('id', editingPrize.id);
      } else {
        await supabase.from('prize_config').insert([prizeData]);
      }

      resetPrizeForm();
      loadPrizes();
      alert('Prize saved successfully');
    } catch (error) {
      alert('Error saving prize');
      console.error(error);
    }
  };

  const handleDeletePrize = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prize?')) return;

    try {
      await supabase.from('prize_config').delete().eq('id', id);
      loadPrizes();
      alert('Prize deleted successfully');
    } catch (error) {
      alert('Error deleting prize');
      console.error(error);
    }
  };

  const handleTogglePrizeActive = async (prize: PrizeConfig) => {
    try {
      await supabase
        .from('prize_config')
        .update({ is_active: !prize.is_active })
        .eq('id', prize.id);
      loadPrizes();
    } catch (error) {
      alert('Error updating prize');
      console.error(error);
    }
  };

  const resetQuestionForm = () => {
    setQuestionForm({
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      correct_answer: 'A',
      difficulty: 'medium',
    });
    setEditingQuestion(null);
    setShowQuestionForm(false);
  };

  const resetPrizeForm = () => {
    setPrizeForm({
      prize_name: '',
      prize_type: 'cash',
      prize_value: '',
      daily_limit: '',
      probability_weight: '1',
    });
    setEditingPrize(null);
    setShowPrizeForm(false);
  };

  const editQuestion = (question: Question) => {
    setQuestionForm({
      question_text: question.question_text,
      option_a: question.option_a,
      option_b: question.option_b,
      option_c: question.option_c,
      correct_answer: question.correct_answer,
      difficulty: question.difficulty,
    });
    setEditingQuestion(question);
    setShowQuestionForm(true);
  };

  const editPrize = (prize: PrizeConfig) => {
    setPrizeForm({
      prize_name: prize.prize_name,
      prize_type: prize.prize_type,
      prize_value: prize.prize_value?.toString() || '',
      daily_limit: prize.daily_limit?.toString() || '',
      probability_weight: prize.probability_weight.toString(),
    });
    setEditingPrize(prize);
    setShowPrizeForm(true);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <Settings className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-600">
                Welcome, {profile?.full_name ? profile.full_name.split(' ')[0] : 'Admin'} • Manage questions and prizes
              </p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-semibold"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>

        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'questions'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Questions
          </button>
          <button
            onClick={() => setActiveTab('prizes')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'prizes'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Prize Configuration
          </button>
        </div>
      </div>

      {activeTab === 'questions' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Quiz Questions</h2>
            <button
              onClick={() => setShowQuestionForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Add Question
            </button>
          </div>

          {showQuestionForm && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  {editingQuestion ? 'Edit Question' : 'New Question'}
                </h3>
                <button onClick={resetQuestionForm}>
                  <X size={24} className="text-gray-500 hover:text-gray-700" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Question Text</label>
                  <textarea
                    value={questionForm.question_text}
                    onChange={(e) =>
                      setQuestionForm({ ...questionForm, question_text: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Option A</label>
                    <input
                      type="text"
                      value={questionForm.option_a}
                      onChange={(e) =>
                        setQuestionForm({ ...questionForm, option_a: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Option B</label>
                    <input
                      type="text"
                      value={questionForm.option_b}
                      onChange={(e) =>
                        setQuestionForm({ ...questionForm, option_b: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Option C</label>
                    <input
                      type="text"
                      value={questionForm.option_c}
                      onChange={(e) =>
                        setQuestionForm({ ...questionForm, option_c: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Correct Answer</label>
                    <select
                      value={questionForm.correct_answer}
                      onChange={(e) =>
                        setQuestionForm({
                          ...questionForm,
                          correct_answer: e.target.value as 'A' | 'B' | 'C',
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Difficulty</label>
                    <select
                      value={questionForm.difficulty}
                      onChange={(e) =>
                        setQuestionForm({
                          ...questionForm,
                          difficulty: e.target.value as 'easy' | 'medium' | 'hard',
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleSaveQuestion}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Save size={20} />
                  Save Question
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {questions.map((question) => (
              <div
                key={question.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2">{question.question_text}</h3>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <p>A: {question.option_a}</p>
                      <p>B: {question.option_b}</p>
                      <p>C: {question.option_c}</p>
                    </div>
                    <div className="mt-2 flex gap-4 text-sm">
                      <span className="text-green-600 font-semibold">
                        Correct: {question.correct_answer}
                      </span>
                      <span className="text-gray-600">
                        Difficulty: {question.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleQuestionActive(question)}
                      className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                        question.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {question.is_active ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      onClick={() => editQuestion(question)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit2 size={18} className="text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Trash2 size={18} className="text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'prizes' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Prize Configuration</h2>
            <button
              onClick={() => setShowPrizeForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Add Prize
            </button>
          </div>

          {showPrizeForm && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  {editingPrize ? 'Edit Prize' : 'New Prize'}
                </h3>
                <button onClick={resetPrizeForm}>
                  <X size={24} className="text-gray-500 hover:text-gray-700" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Prize Name</label>
                  <input
                    type="text"
                    value={prizeForm.prize_name}
                    onChange={(e) =>
                      setPrizeForm({ ...prizeForm, prize_name: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Prize Type</label>
                    <select
                      value={prizeForm.prize_type}
                      onChange={(e) =>
                        setPrizeForm({
                          ...prizeForm,
                          prize_type: e.target.value as 'cash' | 'item' | 'retry' | 'draw' | 'thank_you',
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="cash">Cash</option>
                      <option value="item">Item</option>
                      <option value="retry">Retry</option>
                      <option value="draw">Weekly Draw</option>
                      <option value="thank_you">Thank You</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Prize Value (for cash)
                    </label>
                    <input
                      type="number"
                      value={prizeForm.prize_value}
                      onChange={(e) =>
                        setPrizeForm({ ...prizeForm, prize_value: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Daily Limit (optional)
                    </label>
                    <input
                      type="number"
                      value={prizeForm.daily_limit}
                      onChange={(e) =>
                        setPrizeForm({ ...prizeForm, daily_limit: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Probability Weight
                    </label>
                    <input
                      type="number"
                      value={prizeForm.probability_weight}
                      onChange={(e) =>
                        setPrizeForm({ ...prizeForm, probability_weight: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                      min="1"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSavePrize}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Save size={20} />
                  Save Prize
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prizes.map((prize) => (
              <div
                key={prize.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2">{prize.prize_name}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Type: {prize.prize_type}</p>
                      {prize.prize_value && <p>Value: ₦{prize.prize_value.toLocaleString()}</p>}
                      {prize.daily_limit && <p>Daily Limit: {prize.daily_limit}</p>}
                      <p>Weight: {prize.probability_weight}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTogglePrizeActive(prize)}
                    className={`flex-1 px-3 py-1 rounded-lg text-sm font-semibold ${
                      prize.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {prize.is_active ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => editPrize(prize)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Edit2 size={18} className="text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleDeletePrize(prize.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Trash2 size={18} className="text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
