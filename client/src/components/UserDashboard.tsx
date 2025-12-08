import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Clock, Gift, TrendingUp, LogOut, Settings, User as UserIcon, ChevronDown } from 'lucide-react';
import { WalletManager } from './WalletManager';
import { QuizSession } from './QuizSession';
import { MagicWheel } from './MagicWheel';
import { ProfileSettings } from './ProfileSettings';

interface UserPoints {
  id: string;
  userId: string;
  points: number;
  totalEarned: number;
  totalSpent: number;
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

interface WheelSpin {
  id: string;
  userId: string;
  prizeId: string;
  prizeName: string;
  prizeValue: number | null;
  status: string;
  spunAt: string;
}

type ViewMode = 'dashboard' | 'quiz' | 'wheel' | 'settings';

export function UserDashboard() {
  const { user, profile, signOut } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [recentSessions, setRecentSessions] = useState<QuizSessionType[]>([]);
  const [recentSpins, setRecentSpins] = useState<WheelSpin[]>([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    passedSessions: 0,
    totalSpins: 0,
    totalWinnings: 0,
  });

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user, viewMode]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      const pointsRes = await fetch(`/api/points/${user.id}`);
      if (pointsRes.ok) {
        const points = await pointsRes.json();
        setUserPoints(points);
      }

      const sessionsRes = await fetch(`/api/quiz/user/${user.id}`);
      if (sessionsRes.ok) {
        const sessions = await sessionsRes.json();
        setRecentSessions(sessions.slice(0, 5));
        
        const passed = sessions.filter((s: QuizSessionType) => s.pointsEarned > 0).length;
        setStats((prev) => ({
          ...prev,
          totalSessions: sessions.length,
          passedSessions: passed,
        }));
      }

      const spinsRes = await fetch(`/api/wheel/spins/${user.id}`);
      if (spinsRes.ok) {
        const spins = await spinsRes.json();
        setRecentSpins(spins.slice(0, 5));
        
        const totalWinnings = spins
          .filter((s: WheelSpin) => s.prizeValue)
          .reduce((sum: number, s: WheelSpin) => sum + (s.prizeValue || 0), 0);
        setStats((prev) => ({
          ...prev,
          totalSpins: spins.length,
          totalWinnings,
        }));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (viewMode === 'quiz') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setViewMode('dashboard')}
            className="mb-6 text-gray-600 hover:text-gray-900 font-medium"
            data-testid="button-back-dashboard"
          >
            Back to Dashboard
          </button>
          <QuizSession onComplete={() => setViewMode('dashboard')} />
        </div>
      </div>
    );
  }

  if (viewMode === 'wheel') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setViewMode('dashboard')}
            className="mb-6 text-gray-600 hover:text-gray-900 font-medium"
            data-testid="button-back-dashboard"
          >
            Back to Dashboard
          </button>
          <MagicWheel onComplete={() => setViewMode('dashboard')} />
        </div>
      </div>
    );
  }

  if (viewMode === 'settings') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setViewMode('dashboard')}
            className="mb-6 text-gray-600 hover:text-gray-900 font-medium"
            data-testid="button-back-dashboard"
          >
            Back to Dashboard
          </button>
          <ProfileSettings />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <Trophy className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold">Sports Quiz Platform</h1>
                <p className="text-sm text-gray-600">
                  Welcome, {profile?.fullName ? profile.fullName.split(' ')[0] : 'Player'}
                </p>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                data-testid="button-user-menu"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="font-semibold text-sm">
                    {profile?.fullName || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <ChevronDown size={20} className={`transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-semibold text-gray-900">
                        {profile?.fullName || 'User'}
                      </p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setViewMode('settings');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                      data-testid="button-profile-settings"
                    >
                      <UserIcon size={20} />
                      <div className="text-left">
                        <p className="font-medium">Profile Settings</p>
                        <p className="text-xs text-gray-500">Update your information</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setViewMode('settings');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                      data-testid="button-account-settings"
                    >
                      <Settings size={20} />
                      <div className="text-left">
                        <p className="font-medium">Account Settings</p>
                        <p className="text-xs text-gray-500">Manage your account</p>
                      </div>
                    </button>

                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={() => {
                          handleSignOut();
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                        data-testid="button-signout"
                      >
                        <LogOut size={20} />
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between gap-4 mb-4">
              <Trophy size={32} />
              <span className="text-sm opacity-90">Total Points</span>
            </div>
            <p className="text-4xl font-bold" data-testid="text-total-points">{userPoints?.points || 0}</p>
            <p className="text-sm opacity-90 mt-2">
              {10 - (userPoints?.points || 0)} more to spin the wheel
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between gap-4 mb-4">
              <Clock size={32} />
              <span className="text-sm opacity-90">Quiz Sessions</span>
            </div>
            <p className="text-4xl font-bold" data-testid="text-total-sessions">{stats.totalSessions}</p>
            <p className="text-sm opacity-90 mt-2">
              {stats.passedSessions} passed
            </p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between gap-4 mb-4">
              <Gift size={32} />
              <span className="text-sm opacity-90">Total Winnings</span>
            </div>
            <p className="text-4xl font-bold" data-testid="text-total-winnings">₦{stats.totalWinnings.toLocaleString()}</p>
            <p className="text-sm opacity-90 mt-2">
              {stats.totalSpins} spins
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <WalletManager />

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => setViewMode('quiz')}
                className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                data-testid="button-start-quiz"
              >
                <Trophy size={24} />
                Start Quiz Session
              </button>
              <button
                onClick={() => setViewMode('wheel')}
                disabled={(userPoints?.points || 0) < 10}
                className="w-full bg-yellow-600 text-white py-4 rounded-lg font-semibold hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="button-spin-wheel"
              >
                <Gift size={24} />
                Spin Magic Wheel {(userPoints?.points || 0) < 10 && `(Need ${10 - (userPoints?.points || 0)} more points)`}
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>Fund your wallet to play quiz sessions</li>
                <li>Each session costs ₦100 for 5 questions</li>
                <li>Answer at least 3 correctly to earn 1 point</li>
                <li>Collect 10 points to spin the Magic Wheel</li>
                <li>Win cash prizes, items, or entries to weekly draws</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-green-600" size={24} />
              <h2 className="text-xl font-bold">Recent Quiz Sessions</h2>
            </div>
            {recentSessions.length > 0 ? (
              <div className="space-y-3">
                {recentSessions.map((session) => (
                  <div
                    key={session.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    data-testid={`card-session-${session.id}`}
                  >
                    <div className="flex justify-between items-start mb-2 gap-2 flex-wrap">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          session.pointsEarned > 0
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {session.status}
                      </span>
                      <span className="text-sm text-gray-600">
                        {new Date(session.startedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">
                      Score: {session.correctAnswers}/{session.totalQuestions}
                    </p>
                    <p className="text-sm text-gray-600">
                      Points earned: {session.pointsEarned}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No quiz sessions yet. Start your first quiz!
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Gift className="text-yellow-600" size={24} />
              <h2 className="text-xl font-bold">Recent Wheel Spins</h2>
            </div>
            {recentSpins.length > 0 ? (
              <div className="space-y-3">
                {recentSpins.map((spin) => (
                  <div
                    key={spin.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    data-testid={`card-spin-${spin.id}`}
                  >
                    <div className="flex justify-between items-start mb-2 gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">
                        {spin.prizeName}
                      </span>
                      <span className="text-sm text-gray-600">
                        {new Date(spin.spunAt).toLocaleDateString()}
                      </span>
                    </div>
                    {spin.prizeValue && (
                      <p className="text-green-600 font-semibold">
                        ₦{spin.prizeValue.toLocaleString()}
                      </p>
                    )}
                    <span
                      className={`inline-block mt-2 px-2 py-1 rounded text-xs font-semibold ${
                        spin.status === 'processed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {spin.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No wheel spins yet. Collect 10 points to spin!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
