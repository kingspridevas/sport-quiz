import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit2, Trash2, Save, X, Settings, LogOut, Upload, Download, HelpCircle, Gift, FileSpreadsheet } from 'lucide-react';

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
  createdAt: string;
}

interface Prize {
  id: string;
  prizeName: string;
  prizeType: string;
  prizeValue: number | null;
  dailyLimit: number | null;
  probabilityWeight: number;
  isActive: boolean;
}

interface UserStats {
  totalUsers: number;
  totalQuizzes: number;
  totalSpins: number;
}

export function AdminDashboard() {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'questions' | 'prizes' | 'users' | 'bulk'>('questions');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [_stats, _setStats] = useState<UserStats>({ totalUsers: 0, totalQuizzes: 0, totalSpins: 0 });
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showPrizeForm, setShowPrizeForm] = useState(false);
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);
  const [bulkUploadText, setBulkUploadText] = useState('');
  const [bulkUploadStatus, setBulkUploadStatus] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [questionForm, setQuestionForm] = useState({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    questionTextYoruba: '',
    questionTextHausa: '',
    questionTextIgbo: '',
    optionAYoruba: '',
    optionAHausa: '',
    optionAIgbo: '',
    optionBYoruba: '',
    optionBHausa: '',
    optionBIgbo: '',
    optionCYoruba: '',
    optionCHausa: '',
    optionCIgbo: '',
    correctAnswer: 'A' as 'A' | 'B' | 'C',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
  });

  const [prizeForm, setPrizeForm] = useState({
    prizeName: '',
    prizeType: 'cash' as 'cash' | 'item' | 'retry' | 'draw' | 'thank_you',
    prizeValue: '',
    dailyLimit: '',
    probabilityWeight: '1',
  });

  useEffect(() => {
    loadQuestions();
    loadPrizes();
  }, []);

  const loadQuestions = async () => {
    try {
      const response = await fetch('/api/questions/all');
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const loadPrizes = async () => {
    try {
      const response = await fetch('/api/prizes/all');
      if (response.ok) {
        const data = await response.json();
        setPrizes(data);
      }
    } catch (error) {
      console.error('Error loading prizes:', error);
    }
  };

  const handleSaveQuestion = async () => {
    try {
      const url = editingQuestion 
        ? `/api/questions/${editingQuestion.id}`
        : '/api/questions';
      
      const response = await fetch(url, {
        method: editingQuestion ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionForm),
      });

      if (!response.ok) {
        throw new Error('Failed to save question');
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
      const response = await fetch(`/api/questions/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete question');
      }
      
      loadQuestions();
      alert('Question deleted successfully');
    } catch (error) {
      alert('Error deleting question');
      console.error(error);
    }
  };

  const handleToggleQuestionActive = async (question: Question) => {
    try {
      await fetch(`/api/questions/${question.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !question.isActive }),
      });
      loadQuestions();
    } catch (error) {
      alert('Error updating question');
      console.error(error);
    }
  };

  const handleSavePrize = async () => {
    try {
      const prizeData = {
        prizeName: prizeForm.prizeName,
        prizeType: prizeForm.prizeType,
        prizeValue: prizeForm.prizeValue ? parseFloat(prizeForm.prizeValue) : null,
        dailyLimit: prizeForm.dailyLimit ? parseInt(prizeForm.dailyLimit) : null,
        probabilityWeight: parseInt(prizeForm.probabilityWeight),
      };

      const url = editingPrize 
        ? `/api/prizes/${editingPrize.id}`
        : '/api/prizes';

      const response = await fetch(url, {
        method: editingPrize ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prizeData),
      });

      if (!response.ok) {
        throw new Error('Failed to save prize');
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
      const response = await fetch(`/api/prizes/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete prize');
      }
      
      loadPrizes();
      alert('Prize deleted successfully');
    } catch (error) {
      alert('Error deleting prize');
      console.error(error);
    }
  };

  const handleTogglePrizeActive = async (prize: Prize) => {
    try {
      await fetch(`/api/prizes/${prize.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !prize.isActive }),
      });
      loadPrizes();
    } catch (error) {
      alert('Error updating prize');
      console.error(error);
    }
  };

  const resetQuestionForm = () => {
    setQuestionForm({
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      questionTextYoruba: '',
      questionTextHausa: '',
      questionTextIgbo: '',
      optionAYoruba: '',
      optionAHausa: '',
      optionAIgbo: '',
      optionBYoruba: '',
      optionBHausa: '',
      optionBIgbo: '',
      optionCYoruba: '',
      optionCHausa: '',
      optionCIgbo: '',
      correctAnswer: 'A',
      difficulty: 'medium',
    });
    setEditingQuestion(null);
    setShowQuestionForm(false);
  };

  const resetPrizeForm = () => {
    setPrizeForm({
      prizeName: '',
      prizeType: 'cash',
      prizeValue: '',
      dailyLimit: '',
      probabilityWeight: '1',
    });
    setEditingPrize(null);
    setShowPrizeForm(false);
  };

  const editQuestion = (question: Question) => {
    setQuestionForm({
      questionText: question.questionText,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      questionTextYoruba: question.questionTextYoruba || '',
      questionTextHausa: question.questionTextHausa || '',
      questionTextIgbo: question.questionTextIgbo || '',
      optionAYoruba: question.optionAYoruba || '',
      optionAHausa: question.optionAHausa || '',
      optionAIgbo: question.optionAIgbo || '',
      optionBYoruba: question.optionBYoruba || '',
      optionBHausa: question.optionBHausa || '',
      optionBIgbo: question.optionBIgbo || '',
      optionCYoruba: question.optionCYoruba || '',
      optionCHausa: question.optionCHausa || '',
      optionCIgbo: question.optionCIgbo || '',
      correctAnswer: question.correctAnswer as 'A' | 'B' | 'C',
      difficulty: question.difficulty as 'easy' | 'medium' | 'hard',
    });
    setEditingQuestion(question);
    setShowQuestionForm(true);
  };

  const editPrize = (prize: Prize) => {
    setPrizeForm({
      prizeName: prize.prizeName,
      prizeType: prize.prizeType as 'cash' | 'item' | 'retry' | 'draw' | 'thank_you',
      prizeValue: prize.prizeValue?.toString() || '',
      dailyLimit: prize.dailyLimit?.toString() || '',
      probabilityWeight: prize.probabilityWeight.toString(),
    });
    setEditingPrize(prize);
    setShowPrizeForm(true);
  };

  const handleBulkUpload = async () => {
    if (!bulkUploadText.trim()) {
      alert('Please paste question data in CSV or JSON format');
      return;
    }

    setIsUploading(true);
    setBulkUploadStatus(null);

    try {
      let questionsToUpload: any[] = [];
      
      // Try parsing as JSON first
      try {
        const parsed = JSON.parse(bulkUploadText);
        questionsToUpload = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        // Parse as CSV
        const lines = bulkUploadText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          if (values.length < 5) continue;
          
          const question: any = {};
          headers.forEach((header, idx) => {
            const value = values[idx]?.trim() || '';
            // Map common header names to our schema
            const mappedHeader = mapHeaderToField(header);
            if (mappedHeader) {
              question[mappedHeader] = value;
            }
          });
          
          if (question.questionText && question.optionA && question.optionB && question.optionC) {
            questionsToUpload.push(question);
          }
        }
      }

      let success = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const q of questionsToUpload) {
        try {
          const response = await fetch('/api/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              questionText: q.questionText || q.question_text || q.question,
              optionA: q.optionA || q.option_a || q.a,
              optionB: q.optionB || q.option_b || q.b,
              optionC: q.optionC || q.option_c || q.c,
              correctAnswer: (q.correctAnswer || q.correct_answer || q.answer || 'A').toUpperCase(),
              difficulty: q.difficulty || 'medium',
              questionTextYoruba: q.questionTextYoruba || q.question_text_yoruba || '',
              questionTextHausa: q.questionTextHausa || q.question_text_hausa || '',
              questionTextIgbo: q.questionTextIgbo || q.question_text_igbo || '',
              optionAYoruba: q.optionAYoruba || q.option_a_yoruba || '',
              optionAHausa: q.optionAHausa || q.option_a_hausa || '',
              optionAIgbo: q.optionAIgbo || q.option_a_igbo || '',
              optionBYoruba: q.optionBYoruba || q.option_b_yoruba || '',
              optionBHausa: q.optionBHausa || q.option_b_hausa || '',
              optionBIgbo: q.optionBIgbo || q.option_b_igbo || '',
              optionCYoruba: q.optionCYoruba || q.option_c_yoruba || '',
              optionCHausa: q.optionCHausa || q.option_c_hausa || '',
              optionCIgbo: q.optionCIgbo || q.option_c_igbo || '',
            }),
          });

          if (response.ok) {
            success++;
          } else {
            failed++;
            const err = await response.json();
            errors.push(`Row ${success + failed}: ${err.error || 'Unknown error'}`);
          }
        } catch (error: any) {
          failed++;
          errors.push(`Row ${success + failed}: ${error.message}`);
        }
      }

      setBulkUploadStatus({ success, failed, errors });
      if (success > 0) {
        loadQuestions();
      }
    } catch (error: any) {
      alert('Error processing bulk upload: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    
    return result;
  };

  const mapHeaderToField = (header: string): string | null => {
    const mappings: Record<string, string> = {
      'question': 'questionText',
      'question_text': 'questionText',
      'questiontext': 'questionText',
      'option_a': 'optionA',
      'optiona': 'optionA',
      'a': 'optionA',
      'option_b': 'optionB',
      'optionb': 'optionB',
      'b': 'optionB',
      'option_c': 'optionC',
      'optionc': 'optionC',
      'c': 'optionC',
      'correct_answer': 'correctAnswer',
      'correctanswer': 'correctAnswer',
      'answer': 'correctAnswer',
      'difficulty': 'difficulty',
      'question_yoruba': 'questionTextYoruba',
      'question_text_yoruba': 'questionTextYoruba',
      'question_hausa': 'questionTextHausa',
      'question_text_hausa': 'questionTextHausa',
      'question_igbo': 'questionTextIgbo',
      'question_text_igbo': 'questionTextIgbo',
      'option_a_yoruba': 'optionAYoruba',
      'option_a_hausa': 'optionAHausa',
      'option_a_igbo': 'optionAIgbo',
      'option_b_yoruba': 'optionBYoruba',
      'option_b_hausa': 'optionBHausa',
      'option_b_igbo': 'optionBIgbo',
      'option_c_yoruba': 'optionCYoruba',
      'option_c_hausa': 'optionCHausa',
      'option_c_igbo': 'optionCIgbo',
    };
    return mappings[header.toLowerCase()] || null;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setBulkUploadText(content);
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const template = `question,option_a,option_b,option_c,correct_answer,difficulty,question_yoruba,question_hausa,question_igbo,option_a_yoruba,option_a_hausa,option_a_igbo,option_b_yoruba,option_b_hausa,option_b_igbo,option_c_yoruba,option_c_hausa,option_c_igbo
"Who won the 2022 FIFA World Cup?","Brazil","Argentina","France",B,medium,"","","","","","","","","","","",""
"In which year did Nigeria first participate in the FIFA World Cup?","1990","1994","1998",B,easy,"","","","","","","","","","","",""`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'questions_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <Settings className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-gray-600">
                  Welcome, {profile?.fullName?.split(' ')[0] || 'Admin'}
                </p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-semibold"
              data-testid="button-admin-logout"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>

          <div className="flex gap-2 border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-6 py-3 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'questions'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              data-testid="tab-questions"
            >
              <HelpCircle size={18} />
              Questions ({questions.length})
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`px-6 py-3 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'bulk'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              data-testid="tab-bulk-upload"
            >
              <Upload size={18} />
              Bulk Upload
            </button>
            <button
              onClick={() => setActiveTab('prizes')}
              className={`px-6 py-3 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'prizes'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              data-testid="tab-prizes"
            >
              <Gift size={18} />
              Prizes ({prizes.length})
            </button>
          </div>
        </div>

        {activeTab === 'questions' && (
          <div>
            <div className="flex justify-between items-center gap-4 mb-6 flex-wrap">
              <h2 className="text-2xl font-bold">Quiz Questions</h2>
              <button
                onClick={() => setShowQuestionForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                data-testid="button-add-question"
              >
                <Plus size={20} />
                Add Question
              </button>
            </div>

            {showQuestionForm && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex justify-between items-center gap-2 mb-4">
                  <h3 className="text-xl font-bold">
                    {editingQuestion ? 'Edit Question' : 'New Question'}
                  </h3>
                  <button onClick={resetQuestionForm} data-testid="button-close-question-form">
                    <X size={24} className="text-gray-500 hover:text-gray-700" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold text-blue-800 mb-2">English (Required)</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Question Text</label>
                        <textarea
                          value={questionForm.questionText}
                          onChange={(e) =>
                            setQuestionForm({ ...questionForm, questionText: e.target.value })
                          }
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          rows={2}
                          required
                          data-testid="input-question-text"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Option A</label>
                          <input
                            type="text"
                            value={questionForm.optionA}
                            onChange={(e) =>
                              setQuestionForm({ ...questionForm, optionA: e.target.value })
                            }
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                            data-testid="input-option-a"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Option B</label>
                          <input
                            type="text"
                            value={questionForm.optionB}
                            onChange={(e) =>
                              setQuestionForm({ ...questionForm, optionB: e.target.value })
                            }
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                            data-testid="input-option-b"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Option C</label>
                          <input
                            type="text"
                            value={questionForm.optionC}
                            onChange={(e) =>
                              setQuestionForm({ ...questionForm, optionC: e.target.value })
                            }
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                            data-testid="input-option-c"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <details className="bg-green-50 p-4 rounded-lg">
                    <summary className="font-semibold text-green-800 cursor-pointer">
                      Yoruba Translation (Optional)
                    </summary>
                    <div className="space-y-3 mt-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Question (Yoruba)</label>
                        <textarea
                          value={questionForm.questionTextYoruba}
                          onChange={(e) =>
                            setQuestionForm({ ...questionForm, questionTextYoruba: e.target.value })
                          }
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                          type="text"
                          value={questionForm.optionAYoruba}
                          onChange={(e) =>
                            setQuestionForm({ ...questionForm, optionAYoruba: e.target.value })
                          }
                          placeholder="Option A (Yoruba)"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                        <input
                          type="text"
                          value={questionForm.optionBYoruba}
                          onChange={(e) =>
                            setQuestionForm({ ...questionForm, optionBYoruba: e.target.value })
                          }
                          placeholder="Option B (Yoruba)"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                        <input
                          type="text"
                          value={questionForm.optionCYoruba}
                          onChange={(e) =>
                            setQuestionForm({ ...questionForm, optionCYoruba: e.target.value })
                          }
                          placeholder="Option C (Yoruba)"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                  </details>

                  <details className="bg-orange-50 p-4 rounded-lg">
                    <summary className="font-semibold text-orange-800 cursor-pointer">
                      Hausa Translation (Optional)
                    </summary>
                    <div className="space-y-3 mt-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Question (Hausa)</label>
                        <textarea
                          value={questionForm.questionTextHausa}
                          onChange={(e) =>
                            setQuestionForm({ ...questionForm, questionTextHausa: e.target.value })
                          }
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                          type="text"
                          value={questionForm.optionAHausa}
                          onChange={(e) =>
                            setQuestionForm({ ...questionForm, optionAHausa: e.target.value })
                          }
                          placeholder="Option A (Hausa)"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                        <input
                          type="text"
                          value={questionForm.optionBHausa}
                          onChange={(e) =>
                            setQuestionForm({ ...questionForm, optionBHausa: e.target.value })
                          }
                          placeholder="Option B (Hausa)"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                        <input
                          type="text"
                          value={questionForm.optionCHausa}
                          onChange={(e) =>
                            setQuestionForm({ ...questionForm, optionCHausa: e.target.value })
                          }
                          placeholder="Option C (Hausa)"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                  </details>

                  <details className="bg-purple-50 p-4 rounded-lg">
                    <summary className="font-semibold text-purple-800 cursor-pointer">
                      Igbo Translation (Optional)
                    </summary>
                    <div className="space-y-3 mt-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Question (Igbo)</label>
                        <textarea
                          value={questionForm.questionTextIgbo}
                          onChange={(e) =>
                            setQuestionForm({ ...questionForm, questionTextIgbo: e.target.value })
                          }
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                          type="text"
                          value={questionForm.optionAIgbo}
                          onChange={(e) =>
                            setQuestionForm({ ...questionForm, optionAIgbo: e.target.value })
                          }
                          placeholder="Option A (Igbo)"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                        <input
                          type="text"
                          value={questionForm.optionBIgbo}
                          onChange={(e) =>
                            setQuestionForm({ ...questionForm, optionBIgbo: e.target.value })
                          }
                          placeholder="Option B (Igbo)"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                        <input
                          type="text"
                          value={questionForm.optionCIgbo}
                          onChange={(e) =>
                            setQuestionForm({ ...questionForm, optionCIgbo: e.target.value })
                          }
                          placeholder="Option C (Igbo)"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </details>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Correct Answer</label>
                      <select
                        value={questionForm.correctAnswer}
                        onChange={(e) =>
                          setQuestionForm({
                            ...questionForm,
                            correctAnswer: e.target.value as 'A' | 'B' | 'C',
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        data-testid="select-correct-answer"
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
                        data-testid="select-difficulty"
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
                    data-testid="button-save-question"
                  >
                    <Save size={20} />
                    Save Question
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {questions.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-500">
                  No questions yet. Add your first question or use bulk upload.
                </div>
              ) : (
                questions.map((question) => (
                  <div
                    key={question.id}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-2">{question.questionText}</h3>
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          <p className={question.correctAnswer === 'A' ? 'text-green-600 font-semibold' : ''}>
                            A: {question.optionA}
                          </p>
                          <p className={question.correctAnswer === 'B' ? 'text-green-600 font-semibold' : ''}>
                            B: {question.optionB}
                          </p>
                          <p className={question.correctAnswer === 'C' ? 'text-green-600 font-semibold' : ''}>
                            C: {question.optionC}
                          </p>
                        </div>
                        <div className="mt-2 flex gap-4 text-sm flex-wrap">
                          <span className="text-green-600 font-semibold">
                            Answer: {question.correctAnswer}
                          </span>
                          <span className="text-gray-600">
                            Difficulty: {question.difficulty}
                          </span>
                          {(question.questionTextYoruba || question.questionTextHausa || question.questionTextIgbo) && (
                            <span className="text-blue-600">
                              Has translations
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleToggleQuestionActive(question)}
                          className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                            question.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                          data-testid={`button-toggle-question-${question.id}`}
                        >
                          {question.isActive ? 'Active' : 'Inactive'}
                        </button>
                        <button
                          onClick={() => editQuestion(question)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          data-testid={`button-edit-question-${question.id}`}
                        >
                          <Edit2 size={18} className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          data-testid={`button-delete-question-${question.id}`}
                        >
                          <Trash2 size={18} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'bulk' && (
          <div>
            <div className="flex justify-between items-center gap-4 mb-6 flex-wrap">
              <h2 className="text-2xl font-bold">Bulk Question Upload</h2>
              <button
                onClick={downloadTemplate}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center gap-2"
                data-testid="button-download-template"
              >
                <Download size={20} />
                Download Template
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-2">Upload Instructions</h3>
                <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
                  <p className="mb-2">You can upload questions in two formats:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>CSV:</strong> Download the template and fill in your questions</li>
                    <li><strong>JSON:</strong> Array of objects with fields: questionText, optionA, optionB, optionC, correctAnswer, difficulty</li>
                  </ul>
                  <p className="mt-2">Optional translation fields: questionTextYoruba, questionTextHausa, questionTextIgbo, and corresponding option translations</p>
                </div>
              </div>

              <div className="mb-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                  data-testid="button-upload-file"
                >
                  <FileSpreadsheet size={20} />
                  Choose File
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Or paste data directly:</label>
                <textarea
                  value={bulkUploadText}
                  onChange={(e) => setBulkUploadText(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  rows={12}
                  placeholder={`CSV format:
question,option_a,option_b,option_c,correct_answer,difficulty
"Who won 2022 World Cup?","Brazil","Argentina","France",B,medium

OR JSON format:
[
  {
    "questionText": "Who won 2022 World Cup?",
    "optionA": "Brazil",
    "optionB": "Argentina",
    "optionC": "France",
    "correctAnswer": "B",
    "difficulty": "medium"
  }
]`}
                  data-testid="textarea-bulk-data"
                />
              </div>

              <button
                onClick={handleBulkUpload}
                disabled={isUploading || !bulkUploadText.trim()}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="button-process-upload"
              >
                <Upload size={20} />
                {isUploading ? 'Processing...' : 'Upload Questions'}
              </button>

              {bulkUploadStatus && (
                <div className={`mt-4 p-4 rounded-lg ${
                  bulkUploadStatus.failed === 0 ? 'bg-green-50' : 'bg-yellow-50'
                }`}>
                  <div className="font-semibold mb-2">
                    Upload Complete: {bulkUploadStatus.success} successful, {bulkUploadStatus.failed} failed
                  </div>
                  {bulkUploadStatus.errors.length > 0 && (
                    <div className="text-sm text-red-600 mt-2">
                      <p className="font-semibold">Errors:</p>
                      <ul className="list-disc pl-5">
                        {bulkUploadStatus.errors.slice(0, 5).map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                        {bulkUploadStatus.errors.length > 5 && (
                          <li>...and {bulkUploadStatus.errors.length - 5} more errors</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'prizes' && (
          <div>
            <div className="flex justify-between items-center gap-4 mb-6 flex-wrap">
              <h2 className="text-2xl font-bold">Prize Configuration</h2>
              <button
                onClick={() => setShowPrizeForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                data-testid="button-add-prize"
              >
                <Plus size={20} />
                Add Prize
              </button>
            </div>

            {showPrizeForm && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex justify-between items-center gap-2 mb-4">
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
                      value={prizeForm.prizeName}
                      onChange={(e) =>
                        setPrizeForm({ ...prizeForm, prizeName: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                      data-testid="input-prize-name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Prize Type</label>
                      <select
                        value={prizeForm.prizeType}
                        onChange={(e) =>
                          setPrizeForm({
                            ...prizeForm,
                            prizeType: e.target.value as 'cash' | 'item' | 'retry' | 'draw' | 'thank_you',
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        data-testid="select-prize-type"
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
                        value={prizeForm.prizeValue}
                        onChange={(e) =>
                          setPrizeForm({ ...prizeForm, prizeValue: e.target.value })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        data-testid="input-prize-value"
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
                        value={prizeForm.dailyLimit}
                        onChange={(e) =>
                          setPrizeForm({ ...prizeForm, dailyLimit: e.target.value })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        data-testid="input-daily-limit"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Probability Weight
                      </label>
                      <input
                        type="number"
                        value={prizeForm.probabilityWeight}
                        onChange={(e) =>
                          setPrizeForm({ ...prizeForm, probabilityWeight: e.target.value })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                        min="1"
                        data-testid="input-probability-weight"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSavePrize}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                    data-testid="button-save-prize"
                  >
                    <Save size={20} />
                    Save Prize
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prizes.length === 0 ? (
                <div className="col-span-full bg-white rounded-xl shadow-lg p-8 text-center text-gray-500">
                  No prizes configured yet. Add your first prize.
                </div>
              ) : (
                prizes.map((prize) => (
                  <div
                    key={prize.id}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex justify-between items-start gap-2 mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-2">{prize.prizeName}</h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>Type: {prize.prizeType}</p>
                          {prize.prizeValue && <p>Value: ₦{prize.prizeValue.toLocaleString()}</p>}
                          {prize.dailyLimit && <p>Daily Limit: {prize.dailyLimit}</p>}
                          <p>Weight: {prize.probabilityWeight}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTogglePrizeActive(prize)}
                        className={`flex-1 px-3 py-1 rounded-lg text-sm font-semibold ${
                          prize.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                        data-testid={`button-toggle-prize-${prize.id}`}
                      >
                        {prize.isActive ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        onClick={() => editPrize(prize)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        data-testid={`button-edit-prize-${prize.id}`}
                      >
                        <Edit2 size={18} className="text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDeletePrize(prize.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        data-testid={`button-delete-prize-${prize.id}`}
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
