import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit2, Trash2, Save, X, Settings, LogOut, Upload, Download, HelpCircle, Gift, FileSpreadsheet, Users, Wallet, CreditCard, Activity, Eye, ChevronLeft, Calculator, Trophy, Check, DollarSign, Share2 } from 'lucide-react';

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
  totalWalletBalance: number;
  totalPayments: number;
}

interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  phoneNumber: string | null;
  location: string | null;
  sex: string | null;
  isAdmin: boolean;
  bankName: string | null;
  accountNumber: string | null;
  accountName: string | null;
}

interface WalletData {
  id: string;
  userId: string;
  balance: string;
  totalFunded: string;
}

interface PaymentData {
  id: string;
  userId: string;
  reference: string;
  amount: string;
  status: string;
  accountNumber: string | null;
  bankName: string | null;
  virtualAccountNumber: string | null;
  virtualAccountName: string | null;
  virtualAccountBank: string | null;
  createdAt: string;
  completedAt: string | null;
}

interface QuizSessionData {
  id: string;
  userId: string;
  score: number | null;
  correctAnswers: number;
  totalQuestions: number;
  passed: boolean | null;
  completedAt: string | null;
  createdAt: string;
}

interface WinnerData {
  id: string;
  userId: string;
  spinId: string;
  prizeType: string;
  prizeName: string;
  prizeValue: string | null;
  userEmail: string;
  userFullName: string | null;
  userPhone: string | null;
  userBankName: string | null;
  userBankAccountName: string | null;
  userBankAccountNumber: string | null;
  status: string;
  emailSent: boolean;
  emailSentAt: string | null;
  processedAt: string | null;
  createdAt: string;
}

interface UserDetail {
  profile: UserProfile;
  wallet: WalletData | null;
  points: { points: number; totalEarned: number; totalSpent: number } | null;
  quizSessions: QuizSessionData[];
  wheelSpins: { prizeWon: string; prizeValue: string | null; createdAt: string }[];
  paymentTransactions: PaymentData[];
}

interface WalletTransactionData {
  id: string;
  walletId: string;
  type: string;
  amount: string;
  description: string | null;
  reference: string | null;
  source: string | null;
  status: string | null;
  createdAt: string;
  userEmail: string;
  userFullName: string | null;
}

interface ReferralData {
  id: string;
  referrerId: string;
  refereeId: string;
  status: string;
  rewardAmount: string | null;
  rewardTransactionId: string | null;
  qualifiedAt: string | null;
  rewardedAt: string | null;
  createdAt: string;
  referrerEmail?: string;
  referrerName?: string;
  refereeEmail?: string;
  refereeName?: string;
}

interface ReferralSettings {
  id: string;
  rewardAmount: string;
  minimumFunding: string;
  autoRewardEnabled: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function AdminDashboard() {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'questions' | 'prizes' | 'users' | 'wallets' | 'payments' | 'activity' | 'bulk' | 'winners' | 'transactions' | 'referrals'>('questions');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [stats, setStats] = useState<UserStats>({ totalUsers: 0, totalQuizzes: 0, totalWalletBalance: 0, totalPayments: 0 });
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showPrizeForm, setShowPrizeForm] = useState(false);
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);
  const [bulkUploadText, setBulkUploadText] = useState('');
  const [bulkUploadStatus, setBulkUploadStatus] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [quizSessions, setQuizSessions] = useState<QuizSessionData[]>([]);
  const [winners, setWinners] = useState<WinnerData[]>([]);
  const [processingWinner, setProcessingWinner] = useState<string | null>(null);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransactionData[]>([]);
  const [transactionFilters, setTransactionFilters] = useState({
    source: 'all',
    startDate: '',
    endDate: '',
    search: ''
  });
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [editingUser, setEditingUser] = useState(false);
  const [processingAccount, setProcessingAccount] = useState<string | null>(null);
  const [userEditForm, setUserEditForm] = useState({
    fullName: '',
    phoneNumber: '',
    location: '',
    isAdmin: false,
    walletBalance: '',
    points: '',
  });

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

  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [referralSettings, setReferralSettings] = useState<ReferralSettings | null>(null);
  const [loadingReferrals, setLoadingReferrals] = useState(false);
  const [processingReferral, setProcessingReferral] = useState<string | null>(null);
  const [referralFilter, setReferralFilter] = useState<'all' | 'pending' | 'qualified' | 'rewarded'>('all');
  const [editingReferralSettings, setEditingReferralSettings] = useState(false);
  const [referralSettingsForm, setReferralSettingsForm] = useState({
    rewardAmount: '200',
    minimumFunding: '500',
    autoRewardEnabled: true,
    isActive: true,
  });

  useEffect(() => {
    loadQuestions();
    loadPrizes();
    loadStats();
    loadUsers();
    loadWallets();
    loadPayments();
    loadQuizSessions();
    loadWinners();
    loadWalletTransactions();
    loadReferrals();
    loadReferralSettings();
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

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadWallets = async () => {
    try {
      const response = await fetch('/api/admin/wallets');
      if (response.ok) {
        const data = await response.json();
        setWallets(data);
      }
    } catch (error) {
      console.error('Error loading wallets:', error);
    }
  };

  const loadPayments = async () => {
    try {
      const response = await fetch('/api/admin/payments');
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    }
  };

  const handleDeactivateAccount = async (payment: PaymentData) => {
    if (!payment.virtualAccountNumber) {
      alert('No virtual account number available');
      return;
    }
    
    if (!confirm(`Are you sure you want to deactivate virtual account ${payment.virtualAccountNumber}?`)) {
      return;
    }
    
    setProcessingAccount(payment.id);
    try {
      const response = await fetch('/api/admin/virtual-accounts/deactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountNumber: payment.virtualAccountNumber,
          transactionId: payment.id
        })
      });
      
      if (response.ok) {
        alert('Virtual account deactivated successfully');
        loadPayments();
      } else {
        const error = await response.json();
        alert(`Failed to deactivate: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deactivating account:', error);
      alert('Failed to deactivate virtual account');
    } finally {
      setProcessingAccount(null);
    }
  };

  const handleReactivateAccount = async (payment: PaymentData) => {
    if (!payment.virtualAccountNumber) {
      alert('No virtual account number available');
      return;
    }
    
    if (!confirm(`Are you sure you want to reactivate virtual account ${payment.virtualAccountNumber}?`)) {
      return;
    }
    
    setProcessingAccount(payment.id);
    try {
      const response = await fetch('/api/admin/virtual-accounts/reactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountNumber: payment.virtualAccountNumber,
          transactionId: payment.id
        })
      });
      
      if (response.ok) {
        alert('Virtual account reactivated successfully');
        loadPayments();
      } else {
        const error = await response.json();
        alert(`Failed to reactivate: ${error.error}`);
      }
    } catch (error) {
      console.error('Error reactivating account:', error);
      alert('Failed to reactivate virtual account');
    } finally {
      setProcessingAccount(null);
    }
  };

  const loadQuizSessions = async () => {
    try {
      const response = await fetch('/api/admin/quiz-sessions');
      if (response.ok) {
        const data = await response.json();
        setQuizSessions(data);
      }
    } catch (error) {
      console.error('Error loading quiz sessions:', error);
    }
  };

  const loadWinners = async () => {
    try {
      const response = await fetch('/api/admin/winners');
      if (response.ok) {
        const data = await response.json();
        setWinners(data);
      }
    } catch (error) {
      console.error('Error loading winners:', error);
    }
  };

  const loadWalletTransactions = async (filters?: typeof transactionFilters) => {
    setLoadingTransactions(true);
    try {
      const params = new URLSearchParams();
      const f = filters || transactionFilters;
      
      if (f.source && f.source !== 'all') params.append('source', f.source);
      if (f.startDate) params.append('startDate', f.startDate);
      if (f.endDate) params.append('endDate', f.endDate);
      if (f.search) params.append('search', f.search);
      
      const response = await fetch(`/api/admin/wallet-transactions?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setWalletTransactions(data);
      }
    } catch (error) {
      console.error('Error loading wallet transactions:', error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleTransactionFilterChange = (key: keyof typeof transactionFilters, value: string) => {
    const newFilters = { ...transactionFilters, [key]: value };
    setTransactionFilters(newFilters);
    loadWalletTransactions(newFilters);
  };

  const handleProcessWinner = async (winnerId: string) => {
    setProcessingWinner(winnerId);
    try {
      const response = await fetch(`/api/admin/winners/${winnerId}/process`, {
        method: 'POST'
      });
      if (response.ok) {
        await loadWinners();
      }
    } catch (error) {
      console.error('Error processing winner:', error);
    } finally {
      setProcessingWinner(null);
    }
  };

  const handlePayWinner = async (winnerId: string) => {
    setProcessingWinner(winnerId);
    try {
      const response = await fetch(`/api/admin/winners/${winnerId}/pay`, {
        method: 'POST'
      });
      if (response.ok) {
        await loadWinners();
      }
    } catch (error) {
      console.error('Error marking winner as paid:', error);
    } finally {
      setProcessingWinner(null);
    }
  };

  const loadReferrals = async (status?: string) => {
    setLoadingReferrals(true);
    try {
      const url = status && status !== 'all' 
        ? `/api/admin/referrals?status=${status}` 
        : '/api/admin/referrals';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setReferrals(data);
      }
    } catch (error) {
      console.error('Error loading referrals:', error);
    } finally {
      setLoadingReferrals(false);
    }
  };

  const loadReferralSettings = async () => {
    try {
      const response = await fetch('/api/admin/referral/settings');
      if (response.ok) {
        const data = await response.json();
        setReferralSettings(data);
        setReferralSettingsForm({
          rewardAmount: data.rewardAmount,
          minimumFunding: data.minimumFunding,
          autoRewardEnabled: data.autoRewardEnabled,
          isActive: data.isActive,
        });
      }
    } catch (error) {
      console.error('Error loading referral settings:', error);
    }
  };

  const handleSaveReferralSettings = async () => {
    if (!referralSettings) return;
    
    try {
      const response = await fetch(`/api/admin/referral/settings/${referralSettings.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(referralSettingsForm),
      });
      
      if (response.ok) {
        const data = await response.json();
        setReferralSettings(data);
        setEditingReferralSettings(false);
        alert('Referral settings updated successfully');
      } else {
        alert('Failed to update referral settings');
      }
    } catch (error) {
      console.error('Error saving referral settings:', error);
      alert('Error saving referral settings');
    }
  };

  const handleRewardReferral = async (referralId: string) => {
    setProcessingReferral(referralId);
    try {
      const response = await fetch(`/api/admin/referral/${referralId}/reward`, {
        method: 'POST'
      });
      if (response.ok) {
        await loadReferrals(referralFilter);
        alert('Referral reward processed successfully');
      } else {
        const error = await response.json();
        alert(`Failed to process reward: ${error.error}`);
      }
    } catch (error) {
      console.error('Error rewarding referral:', error);
      alert('Error processing referral reward');
    } finally {
      setProcessingReferral(null);
    }
  };

  const handleRejectReferral = async (referralId: string) => {
    if (!confirm('Are you sure you want to reject this referral? This cannot be undone.')) return;
    
    setProcessingReferral(referralId);
    try {
      const response = await fetch(`/api/admin/referral/${referralId}/reject`, {
        method: 'POST'
      });
      if (response.ok) {
        await loadReferrals(referralFilter);
        alert('Referral rejected');
      } else {
        const error = await response.json();
        alert(`Failed to reject referral: ${error.error}`);
      }
    } catch (error) {
      console.error('Error rejecting referral:', error);
      alert('Error rejecting referral');
    } finally {
      setProcessingReferral(null);
    }
  };

  const loadUserDetails = async (userId: string) => {
    setLoadingUser(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedUser(data);
      }
    } catch (error) {
      console.error('Error loading user details:', error);
    }
    setLoadingUser(false);
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.fullName || user?.email || userId;
  };

  const startEditingUser = () => {
    if (!selectedUser) return;
    setUserEditForm({
      fullName: selectedUser.profile.fullName || '',
      phoneNumber: selectedUser.profile.phoneNumber || '',
      location: selectedUser.profile.location || '',
      isAdmin: selectedUser.profile.isAdmin,
      walletBalance: selectedUser.wallet?.balance || '0',
      points: String(selectedUser.points?.points || 0),
    });
    setEditingUser(true);
  };

  const cancelEditingUser = () => {
    setEditingUser(false);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    try {
      const profileResponse = await fetch(`/api/admin/users/${selectedUser.profile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: userEditForm.fullName || null,
          phoneNumber: userEditForm.phoneNumber || null,
          location: userEditForm.location || null,
          isAdmin: userEditForm.isAdmin,
        }),
      });
      
      if (!profileResponse.ok) {
        throw new Error('Failed to update profile');
      }

      if (selectedUser.wallet && userEditForm.walletBalance !== selectedUser.wallet.balance) {
        await fetch(`/api/admin/wallets/${selectedUser.wallet.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            balance: userEditForm.walletBalance,
          }),
        });
      }

      if (selectedUser.points && String(selectedUser.points.points) !== userEditForm.points) {
        await fetch(`/api/admin/points/${selectedUser.profile.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            points: parseInt(userEditForm.points) || 0,
          }),
        });
      }

      setEditingUser(false);
      loadUserDetails(selectedUser.profile.id);
      loadUsers();
      loadWallets();
      loadStats();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Failed to save user changes');
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
      'questiontextyoruba': 'questionTextYoruba',
      'question_hausa': 'questionTextHausa',
      'question_text_hausa': 'questionTextHausa',
      'questiontexthausa': 'questionTextHausa',
      'question_igbo': 'questionTextIgbo',
      'question_text_igbo': 'questionTextIgbo',
      'questiontextigbo': 'questionTextIgbo',
      'option_a_yoruba': 'optionAYoruba',
      'optionayoruba': 'optionAYoruba',
      'option_a_hausa': 'optionAHausa',
      'optionahausa': 'optionAHausa',
      'option_a_igbo': 'optionAIgbo',
      'optionaigbo': 'optionAIgbo',
      'option_b_yoruba': 'optionBYoruba',
      'optionbyoruba': 'optionBYoruba',
      'option_b_hausa': 'optionBHausa',
      'optionbhausa': 'optionBHausa',
      'option_b_igbo': 'optionBIgbo',
      'optionbigbo': 'optionBIgbo',
      'option_c_yoruba': 'optionCYoruba',
      'optioncyoruba': 'optionCYoruba',
      'option_c_hausa': 'optionCHausa',
      'optionchausa': 'optionCHausa',
      'option_c_igbo': 'optionCIgbo',
      'optioncigbo': 'optionCIgbo',
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
            <button
              onClick={() => setActiveTab('winners')}
              className={`px-6 py-3 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'winners'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              data-testid="tab-winners"
            >
              <Trophy size={18} />
              Winners
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'users'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              data-testid="tab-users"
            >
              <Users size={18} />
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('wallets')}
              className={`px-6 py-3 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'wallets'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              data-testid="tab-wallets"
            >
              <Wallet size={18} />
              Wallets
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-6 py-3 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'payments'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              data-testid="tab-payments"
            >
              <CreditCard size={18} />
              Payments
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-6 py-3 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'transactions'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              data-testid="tab-transactions"
            >
              <DollarSign size={18} />
              Transactions
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-6 py-3 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'activity'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              data-testid="tab-activity"
            >
              <Activity size={18} />
              Quiz Activity
            </button>
            <button
              onClick={() => {
                setActiveTab('referrals');
                loadReferrals(referralFilter);
              }}
              className={`px-6 py-3 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'referrals'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              data-testid="tab-referrals"
            >
              <Share2 size={18} />
              Referrals
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-sm text-gray-500">Total Users</div>
            <div className="text-2xl font-bold text-blue-600" data-testid="text-total-users">{stats.totalUsers}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-sm text-gray-500">Total Quizzes</div>
            <div className="text-2xl font-bold text-green-600" data-testid="text-total-quizzes">{stats.totalQuizzes}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-sm text-gray-500">Total Wallet Balance</div>
            <div className="text-2xl font-bold text-purple-600" data-testid="text-total-balance">N{stats.totalWalletBalance.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-sm text-gray-500">Total Payments</div>
            <div className="text-2xl font-bold text-orange-600" data-testid="text-total-payments">N{stats.totalPayments.toLocaleString()}</div>
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

            {/* Probability Calculator */}
            {prizes.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Calculator size={20} className="text-blue-600" />
                  Winning Probability Calculator
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3">Prize</th>
                        <th className="text-left py-2 px-3">Type</th>
                        <th className="text-right py-2 px-3">Weight</th>
                        <th className="text-right py-2 px-3">Win Chance</th>
                        <th className="text-center py-2 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const activePrizes = prizes.filter(p => p.isActive);
                        const totalWeight = activePrizes.reduce((sum, p) => sum + p.probabilityWeight, 0);
                        
                        return prizes.map((prize) => {
                          const percentage = prize.isActive && totalWeight > 0
                            ? ((prize.probabilityWeight / totalWeight) * 100).toFixed(1)
                            : '0.0';
                          const isWinningPrize = prize.prizeType === 'cash' || prize.prizeType === 'item' || prize.prizeType === 'draw';
                          
                          return (
                            <tr key={prize.id} className={`border-b ${!prize.isActive ? 'opacity-50' : ''}`}>
                              <td className="py-2 px-3 font-medium">{prize.prizeName}</td>
                              <td className="py-2 px-3">
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                  prize.prizeType === 'cash' ? 'bg-green-100 text-green-700' :
                                  prize.prizeType === 'item' ? 'bg-blue-100 text-blue-700' :
                                  prize.prizeType === 'draw' ? 'bg-purple-100 text-purple-700' :
                                  prize.prizeType === 'retry' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {prize.prizeType}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-right">{prize.probabilityWeight}</td>
                              <td className="py-2 px-3 text-right">
                                <span className={`font-bold ${isWinningPrize ? 'text-green-600' : 'text-gray-600'}`}>
                                  {percentage}%
                                </span>
                              </td>
                              <td className="py-2 px-3 text-center">
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                  prize.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {prize.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 font-bold">
                        <td className="py-2 px-3">Total (Active Only)</td>
                        <td className="py-2 px-3"></td>
                        <td className="py-2 px-3 text-right">
                          {prizes.filter(p => p.isActive).reduce((sum, p) => sum + p.probabilityWeight, 0)}
                        </td>
                        <td className="py-2 px-3 text-right">100%</td>
                        <td className="py-2 px-3"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                  <p className="font-semibold mb-1">How it works:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Higher weight = higher chance of landing on that prize</li>
                    <li>Win Chance = (Prize Weight / Total Weight) x 100</li>
                    <li>To decrease overall wins: increase "Thank You" and "Try Again" weights</li>
                    <li>To increase overall wins: decrease "Thank You" and "Try Again" weights</li>
                    <li>First-time spinners always get "Thank You" or "Try Again"</li>
                  </ul>
                </div>
              </div>
            )}

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

        {activeTab === 'users' && (
          <div>
            {loadingUser && (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
              </div>
            )}
            {!loadingUser && selectedUser ? (
              <div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
                  data-testid="button-back-to-users"
                >
                  <ChevronLeft size={20} />
                  Back to Users
                </button>
                
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                  <div className="flex justify-between items-center gap-4 mb-4 flex-wrap">
                    <h2 className="text-2xl font-bold">User Details</h2>
                    {!editingUser ? (
                      <button
                        onClick={startEditingUser}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                        data-testid="button-edit-user"
                      >
                        <Edit2 size={18} />
                        Edit User
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveUser}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                          data-testid="button-save-user"
                        >
                          <Save size={18} />
                          Save
                        </button>
                        <button
                          onClick={cancelEditingUser}
                          className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors flex items-center gap-2"
                          data-testid="button-cancel-edit-user"
                        >
                          <X size={18} />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {editingUser ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Full Name</label>
                          <input
                            type="text"
                            value={userEditForm.fullName}
                            onChange={(e) => setUserEditForm({ ...userEditForm, fullName: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            data-testid="input-user-fullname"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Email (read-only)</label>
                          <input
                            type="email"
                            value={selectedUser.profile.email}
                            className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                            disabled
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Phone Number</label>
                          <input
                            type="text"
                            value={userEditForm.phoneNumber}
                            onChange={(e) => setUserEditForm({ ...userEditForm, phoneNumber: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            data-testid="input-user-phone"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Location</label>
                          <input
                            type="text"
                            value={userEditForm.location}
                            onChange={(e) => setUserEditForm({ ...userEditForm, location: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            data-testid="input-user-location"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Wallet Balance (N)</label>
                          <input
                            type="number"
                            value={userEditForm.walletBalance}
                            onChange={(e) => setUserEditForm({ ...userEditForm, walletBalance: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            data-testid="input-user-wallet"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Points</label>
                          <input
                            type="number"
                            value={userEditForm.points}
                            onChange={(e) => setUserEditForm({ ...userEditForm, points: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            data-testid="input-user-points"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="isAdmin"
                          checked={userEditForm.isAdmin}
                          onChange={(e) => setUserEditForm({ ...userEditForm, isAdmin: e.target.checked })}
                          className="w-4 h-4"
                          data-testid="checkbox-user-admin"
                        />
                        <label htmlFor="isAdmin" className="font-medium">Admin Access</label>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold text-gray-700 mb-2">Profile</h3>
                          <div className="space-y-2 text-sm">
                            <p><span className="text-gray-500">Name:</span> {selectedUser.profile.fullName || 'Not set'}</p>
                            <p><span className="text-gray-500">Email:</span> {selectedUser.profile.email}</p>
                            <p><span className="text-gray-500">Phone:</span> {selectedUser.profile.phoneNumber || 'Not set'}</p>
                            <p><span className="text-gray-500">Location:</span> {selectedUser.profile.location || 'Not set'}</p>
                            <p><span className="text-gray-500">Admin:</span> {selectedUser.profile.isAdmin ? 'Yes' : 'No'}</p>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-700 mb-2">Wallet & Points</h3>
                          <div className="space-y-2 text-sm">
                            <p><span className="text-gray-500">Balance:</span> N{parseFloat(selectedUser.wallet?.balance || '0').toLocaleString()}</p>
                            <p><span className="text-gray-500">Total Funded:</span> N{parseFloat(selectedUser.wallet?.totalFunded || '0').toLocaleString()}</p>
                            <p><span className="text-gray-500">Points:</span> {selectedUser.points?.points || 0}</p>
                            <p><span className="text-gray-500">Total Earned:</span> {selectedUser.points?.totalEarned || 0}</p>
                            <p><span className="text-gray-500">Total Spent:</span> {selectedUser.points?.totalSpent || 0}</p>
                          </div>
                        </div>
                      </div>
                      {selectedUser.profile.bankName && (
                        <div className="mt-4">
                          <h3 className="font-semibold text-gray-700 mb-2">Bank Details</h3>
                          <div className="space-y-1 text-sm">
                            <p><span className="text-gray-500">Bank:</span> {selectedUser.profile.bankName}</p>
                            <p><span className="text-gray-500">Account:</span> {selectedUser.profile.accountNumber}</p>
                            <p><span className="text-gray-500">Name:</span> {selectedUser.profile.accountName}</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                  <h3 className="text-xl font-bold mb-4">Quiz History ({selectedUser.quizSessions.length})</h3>
                  {selectedUser.quizSessions.length === 0 ? (
                    <p className="text-gray-500">No quiz sessions yet</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Date</th>
                            <th className="text-left py-2">Score</th>
                            <th className="text-left py-2">Result</th>
                            <th className="text-left py-2">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedUser.quizSessions.map((session) => (
                            <tr key={session.id} className="border-b">
                              <td className="py-2">{new Date(session.createdAt).toLocaleDateString()}</td>
                              <td className="py-2">{session.correctAnswers}/{session.totalQuestions}</td>
                              <td className="py-2">
                                <span className={`px-2 py-1 rounded text-xs ${session.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {session.passed ? 'Passed' : 'Failed'}
                                </span>
                              </td>
                              <td className="py-2">{session.completedAt ? 'Completed' : 'In Progress'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold mb-4">Wheel Spins ({selectedUser.wheelSpins.length})</h3>
                    {selectedUser.wheelSpins.length === 0 ? (
                      <p className="text-gray-500">No wheel spins yet</p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {selectedUser.wheelSpins.map((spin, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm border-b pb-2">
                            <span>{spin.prizeWon}</span>
                            <span className="text-gray-500">{new Date(spin.createdAt).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold mb-4">Payments ({selectedUser.paymentTransactions.length})</h3>
                    {selectedUser.paymentTransactions.length === 0 ? (
                      <p className="text-gray-500">No payments yet</p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {selectedUser.paymentTransactions.map((payment) => (
                          <div key={payment.id} className="flex justify-between items-center text-sm border-b pb-2">
                            <span>N{parseFloat(payment.amount).toLocaleString()}</span>
                            <span className={`px-2 py-1 rounded text-xs ${payment.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {payment.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold mb-6">User Management</h2>
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-3 px-4">Name</th>
                          <th className="text-left py-3 px-4">Email</th>
                          <th className="text-left py-3 px-4">Phone</th>
                          <th className="text-left py-3 px-4">Role</th>
                          <th className="text-left py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">{user.fullName || 'Not set'}</td>
                            <td className="py-3 px-4">{user.email}</td>
                            <td className="py-3 px-4">{user.phoneNumber || '-'}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs ${user.isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                                {user.isAdmin ? 'Admin' : 'User'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => loadUserDetails(user.id)}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                                data-testid={`button-view-user-${user.id}`}
                              >
                                <Eye size={16} />
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'wallets' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Wallet Management</h2>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Balance</th>
                      <th className="text-left py-3 px-4">Total Funded</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wallets.map((wallet) => (
                      <tr key={wallet.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{getUserName(wallet.userId)}</td>
                        <td className="py-3 px-4 font-semibold">N{parseFloat(wallet.balance).toLocaleString()}</td>
                        <td className="py-3 px-4">N{parseFloat(wallet.totalFunded).toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => {
                              loadUserDetails(wallet.userId);
                              setActiveTab('users');
                            }}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                            data-testid={`button-view-wallet-user-${wallet.id}`}
                          >
                            <Eye size={16} />
                            View User
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Payment Transactions</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Virtual Account</th>
                      <th className="text-left py-3 px-4">Reference</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-500">No payments recorded yet</td>
                      </tr>
                    ) : (
                      payments.map((payment) => (
                        <tr key={payment.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="py-3 px-4">{new Date(payment.createdAt).toLocaleDateString()}</td>
                          <td className="py-3 px-4">{getUserName(payment.userId)}</td>
                          <td className="py-3 px-4 font-semibold">N{parseFloat(payment.amount).toLocaleString()}</td>
                          <td className="py-3 px-4">
                            {payment.virtualAccountNumber ? (
                              <div className="text-sm">
                                <div className="font-medium">{payment.virtualAccountNumber}</div>
                                <div className="text-gray-500 text-xs">{payment.virtualAccountBank}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">N/A</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500">{payment.reference}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              payment.status === 'completed' ? 'bg-green-100 text-green-700' : 
                              payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                              payment.status === 'deactivated' ? 'bg-gray-100 text-gray-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {payment.virtualAccountNumber && (
                              <div className="flex items-center gap-2">
                                {payment.status === 'deactivated' ? (
                                  <button
                                    onClick={() => handleReactivateAccount(payment)}
                                    disabled={processingAccount === payment.id}
                                    className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                                    data-testid={`button-reactivate-${payment.id}`}
                                  >
                                    {processingAccount === payment.id ? 'Processing...' : 'Reactivate'}
                                  </button>
                                ) : payment.status !== 'completed' && (
                                  <button
                                    onClick={() => handleDeactivateAccount(payment)}
                                    disabled={processingAccount === payment.id}
                                    className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                                    data-testid={`button-deactivate-${payment.id}`}
                                  >
                                    {processingAccount === payment.id ? 'Processing...' : 'Deactivate'}
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Wallet Transactions</h2>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source</label>
                  <select
                    value={transactionFilters.source}
                    onChange={(e) => handleTransactionFilterChange('source', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                    data-testid="select-transaction-source"
                  >
                    <option value="all">All Sources</option>
                    <option value="paystack">Paystack</option>
                    <option value="9psb">9PSB (Bank Transfer)</option>
                    <option value="system">System</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={transactionFilters.startDate}
                    onChange={(e) => handleTransactionFilterChange('startDate', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                    data-testid="input-transaction-start-date"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                  <input
                    type="date"
                    value={transactionFilters.endDate}
                    onChange={(e) => handleTransactionFilterChange('endDate', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                    data-testid="input-transaction-end-date"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search (Email/Name)</label>
                  <input
                    type="text"
                    value={transactionFilters.search}
                    onChange={(e) => handleTransactionFilterChange('search', e.target.value)}
                    placeholder="Search by email or name..."
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                    data-testid="input-transaction-search"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                {loadingTransactions ? (
                  <div className="py-8 text-center text-gray-500">Loading transactions...</div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">User</th>
                        <th className="text-left py-3 px-4">Type</th>
                        <th className="text-left py-3 px-4">Amount</th>
                        <th className="text-left py-3 px-4">Source</th>
                        <th className="text-left py-3 px-4">Description</th>
                        <th className="text-left py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {walletTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-500">No transactions found</td>
                        </tr>
                      ) : (
                        walletTransactions.map((tx) => (
                          <tr key={tx.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="py-3 px-4">{new Date(tx.createdAt).toLocaleDateString()}</td>
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium">{tx.userFullName || 'N/A'}</div>
                                <div className="text-xs text-gray-500">{tx.userEmail}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs ${
                                tx.type === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {tx.type}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-semibold">₦{parseFloat(tx.amount).toLocaleString()}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs ${
                                tx.source === 'paystack' ? 'bg-purple-100 text-purple-700' :
                                tx.source === '9psb' ? 'bg-blue-100 text-blue-700' :
                                tx.source === 'system' ? 'bg-gray-100 text-gray-700' :
                                tx.source === 'admin' ? 'bg-orange-100 text-orange-700' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {tx.source || 'unknown'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-500 max-w-xs truncate">{tx.description || '-'}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs ${
                                tx.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {tx.status || 'pending'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-300">
                Total: {walletTransactions.length} transactions
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Quiz Activity</h2>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Score</th>
                      <th className="text-left py-3 px-4">Result</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizSessions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">No quiz sessions yet</td>
                      </tr>
                    ) : (
                      quizSessions.map((session) => (
                        <tr key={session.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{new Date(session.createdAt).toLocaleDateString()}</td>
                          <td className="py-3 px-4">{getUserName(session.userId)}</td>
                          <td className="py-3 px-4">{session.correctAnswers}/{session.totalQuestions}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${session.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {session.passed ? 'Passed' : 'Failed'}
                            </span>
                          </td>
                          <td className="py-3 px-4">{session.completedAt ? 'Completed' : 'In Progress'}</td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => {
                                loadUserDetails(session.userId);
                                setActiveTab('users');
                              }}
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                              data-testid={`button-view-session-user-${session.id}`}
                            >
                              <Eye size={16} />
                              View User
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'winners' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Trophy size={24} className="text-yellow-500" />
                  Prize Winners
                </h2>
                <span className="text-sm text-gray-500">{winners.length} total winners</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Winner</th>
                      <th className="text-left py-3 px-4">Prize</th>
                      <th className="text-left py-3 px-4">Value</th>
                      <th className="text-left py-3 px-4">Bank Details</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {winners.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-500">No winners yet</td>
                      </tr>
                    ) : (
                      winners.map((winner) => (
                        <tr key={winner.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{new Date(winner.createdAt).toLocaleDateString()}</td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span className="font-medium">{winner.userFullName || 'Unknown'}</span>
                              <span className="text-sm text-gray-500">{winner.userEmail}</span>
                              <span className="text-xs text-gray-400">{winner.userPhone || 'No phone'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span className="font-medium">{winner.prizeName}</span>
                              <span className={`text-xs px-2 py-0.5 rounded inline-block w-fit ${
                                winner.prizeType === 'cash' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {winner.prizeType}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium">
                            {winner.prizeValue ? `₦${parseFloat(winner.prizeValue).toLocaleString()}` : '-'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col text-sm">
                              <span>{winner.userBankName || 'No bank'}</span>
                              <span className="text-gray-500">{winner.userBankAccountName || '-'}</span>
                              <span className="font-mono text-xs">{winner.userBankAccountNumber || '-'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              winner.status === 'paid' ? 'bg-green-100 text-green-700' :
                              winner.status === 'processed' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {winner.status}
                            </span>
                            {winner.emailSent && (
                              <span className="ml-2 text-xs text-gray-500" title="Email sent">
                                <Check size={12} className="inline" />
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              {winner.status === 'pending' && (
                                <button
                                  onClick={() => handleProcessWinner(winner.id)}
                                  disabled={processingWinner === winner.id}
                                  className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                                  data-testid={`button-process-winner-${winner.id}`}
                                >
                                  <Check size={12} />
                                  Process
                                </button>
                              )}
                              {winner.status === 'processed' && (
                                <button
                                  onClick={() => handlePayWinner(winner.id)}
                                  disabled={processingWinner === winner.id}
                                  className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                                  data-testid={`button-pay-winner-${winner.id}`}
                                >
                                  <DollarSign size={12} />
                                  Mark Paid
                                </button>
                              )}
                              {winner.status === 'paid' && (
                                <span className="text-green-600 text-xs flex items-center gap-1">
                                  <Check size={12} />
                                  Completed
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'referrals' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Settings size={24} className="text-blue-500" />
                  Referral Settings
                </h2>
                {!editingReferralSettings ? (
                  <button
                    onClick={() => setEditingReferralSettings(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    data-testid="button-edit-referral-settings"
                  >
                    <Edit2 size={16} />
                    Edit Settings
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveReferralSettings}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      data-testid="button-save-referral-settings"
                    >
                      <Save size={16} />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingReferralSettings(false);
                        if (referralSettings) {
                          setReferralSettingsForm({
                            rewardAmount: referralSettings.rewardAmount,
                            minimumFunding: referralSettings.minimumFunding,
                            autoRewardEnabled: referralSettings.autoRewardEnabled,
                            isActive: referralSettings.isActive,
                          });
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                      data-testid="button-cancel-referral-settings"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {referralSettings && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm text-gray-500 mb-1">Reward Amount</label>
                    {editingReferralSettings ? (
                      <input
                        type="number"
                        value={referralSettingsForm.rewardAmount}
                        onChange={(e) => setReferralSettingsForm({ ...referralSettingsForm, rewardAmount: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                        data-testid="input-reward-amount"
                      />
                    ) : (
                      <p className="text-xl font-bold text-green-600">₦{parseFloat(referralSettings.rewardAmount).toLocaleString()}</p>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm text-gray-500 mb-1">Minimum Funding</label>
                    {editingReferralSettings ? (
                      <input
                        type="number"
                        value={referralSettingsForm.minimumFunding}
                        onChange={(e) => setReferralSettingsForm({ ...referralSettingsForm, minimumFunding: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                        data-testid="input-minimum-funding"
                      />
                    ) : (
                      <p className="text-xl font-bold text-blue-600">₦{parseFloat(referralSettings.minimumFunding).toLocaleString()}</p>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm text-gray-500 mb-1">Auto-Reward</label>
                    {editingReferralSettings ? (
                      <select
                        value={referralSettingsForm.autoRewardEnabled ? 'true' : 'false'}
                        onChange={(e) => setReferralSettingsForm({ ...referralSettingsForm, autoRewardEnabled: e.target.value === 'true' })}
                        className="w-full px-3 py-2 border rounded-lg"
                        data-testid="select-auto-reward"
                      >
                        <option value="true">Enabled</option>
                        <option value="false">Disabled (Manual)</option>
                      </select>
                    ) : (
                      <p className={`text-xl font-bold ${referralSettings.autoRewardEnabled ? 'text-green-600' : 'text-yellow-600'}`}>
                        {referralSettings.autoRewardEnabled ? 'Enabled' : 'Manual'}
                      </p>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm text-gray-500 mb-1">Program Status</label>
                    {editingReferralSettings ? (
                      <select
                        value={referralSettingsForm.isActive ? 'true' : 'false'}
                        onChange={(e) => setReferralSettingsForm({ ...referralSettingsForm, isActive: e.target.value === 'true' })}
                        className="w-full px-3 py-2 border rounded-lg"
                        data-testid="select-program-status"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    ) : (
                      <p className={`text-xl font-bold ${referralSettings.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {referralSettings.isActive ? 'Active' : 'Inactive'}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Share2 size={24} className="text-purple-500" />
                    Referral Management
                  </h2>
                  <div className="flex gap-2">
                    <select
                      value={referralFilter}
                      onChange={(e) => {
                        const newFilter = e.target.value as typeof referralFilter;
                        setReferralFilter(newFilter);
                        loadReferrals(newFilter);
                      }}
                      className="px-3 py-2 border rounded-lg"
                      data-testid="select-referral-filter"
                    >
                      <option value="all">All Referrals</option>
                      <option value="pending">Pending</option>
                      <option value="qualified">Qualified</option>
                      <option value="rewarded">Rewarded</option>
                    </select>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Referrer</th>
                        <th className="text-left py-3 px-4">Referee</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Reward</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingReferrals ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-500">Loading...</td>
                        </tr>
                      ) : referrals.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-500">No referrals found</td>
                        </tr>
                      ) : (
                        referrals.map((referral) => (
                          <tr key={referral.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">{new Date(referral.createdAt).toLocaleDateString()}</td>
                            <td className="py-3 px-4">
                              <div className="flex flex-col">
                                <span className="font-medium">{referral.referrerName || 'Unknown'}</span>
                                <span className="text-sm text-gray-500">{referral.referrerEmail || referral.referrerId}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-col">
                                <span className="font-medium">{referral.refereeName || 'Unknown'}</span>
                                <span className="text-sm text-gray-500">{referral.refereeEmail || referral.refereeId}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs ${
                                referral.status === 'rewarded' ? 'bg-green-100 text-green-700' :
                                referral.status === 'qualified' ? 'bg-blue-100 text-blue-700' :
                                referral.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {referral.status}
                              </span>
                              {referral.qualifiedAt && (
                                <span className="block text-xs text-gray-500 mt-1">
                                  Qualified: {new Date(referral.qualifiedAt).toLocaleDateString()}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {referral.rewardAmount ? (
                                <span className="font-medium text-green-600">₦{parseFloat(referral.rewardAmount).toLocaleString()}</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                              {referral.rewardedAt && (
                                <span className="block text-xs text-gray-500">
                                  {new Date(referral.rewardedAt).toLocaleDateString()}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                {referral.status === 'qualified' && (
                                  <>
                                    <button
                                      onClick={() => handleRewardReferral(referral.id)}
                                      disabled={processingReferral === referral.id}
                                      className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                                      data-testid={`button-reward-referral-${referral.id}`}
                                    >
                                      <DollarSign size={12} />
                                      Reward
                                    </button>
                                    <button
                                      onClick={() => handleRejectReferral(referral.id)}
                                      disabled={processingReferral === referral.id}
                                      className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
                                      data-testid={`button-reject-referral-${referral.id}`}
                                    >
                                      <X size={12} />
                                      Reject
                                    </button>
                                  </>
                                )}
                                {referral.status === 'rewarded' && (
                                  <span className="text-green-600 text-xs flex items-center gap-1">
                                    <Check size={12} />
                                    Rewarded
                                  </span>
                                )}
                                {referral.status === 'rejected' && (
                                  <span className="text-red-600 text-xs flex items-center gap-1">
                                    <X size={12} />
                                    Rejected
                                  </span>
                                )}
                                {referral.status === 'pending' && (
                                  <span className="text-yellow-600 text-xs">
                                    Waiting for qualification
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
