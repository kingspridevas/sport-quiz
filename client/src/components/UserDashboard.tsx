import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Clock, Gift, TrendingUp, LogOut, Settings, User as UserIcon, ChevronDown, Share2, Copy, Check } from 'lucide-react';
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

interface PublicWinner {
  id: number;
  prizeName: string;
  prizeValue: number | null;
  prizeType: string;
  userFullName: string;
  photoUrl: string | null;
  createdAt: string;
}

type ViewMode = 'dashboard' | 'quiz' | 'wheel' | 'settings';

export function UserDashboard() {
  const { user, profile, signOut } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [recentSessions, setRecentSessions] = useState<QuizSessionType[]>([]);
  const [recentSpins, setRecentSpins] = useState<WheelSpin[]>([]);
  const [publicWinners, setPublicWinners] = useState<PublicWinner[]>([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    passedSessions: 0,
    totalSpins: 0,
    totalWinnings: 0,
  });
  const [referralData, setReferralData] = useState<{
    referralCode: string | null;
    stats: { totalReferrals: number; qualifiedReferrals: number; rewardedReferrals: number; totalEarned: number };
    referrals: { id: string; status: string; createdAt: string; rewardAmount: string | null }[];
  } | null>(null);
  const [copiedReferral, setCopiedReferral] = useState(false);

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
          .reduce((sum: number, s: WheelSpin) => sum + (Number(s.prizeValue) || 0), 0);
        setStats((prev) => ({
          ...prev,
          totalSpins: spins.length,
          totalWinnings,
        }));
      }

      // Fetch public winners
      const winnersRes = await fetch('/api/winners/public');
      if (winnersRes.ok) {
        const winners = await winnersRes.json();
        setPublicWinners(winners.slice(0, 5));
      }

      // Fetch referral data
      const referralRes = await fetch(`/api/referral/stats/${user.id}`);
      if (referralRes.ok) {
        const refData = await referralRes.json();
        setReferralData(refData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const copyReferralLink = () => {
    if (referralData?.referralCode) {
      const link = `${window.location.origin}/signup?ref=${referralData.referralCode}`;
      navigator.clipboard.writeText(link);
      setCopiedReferral(true);
      setTimeout(() => setCopiedReferral(false), 2000);
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
              {(userPoints?.points || 0) >= 5 
                ? "Ready to spin the wheel!" 
                : `${5 - (userPoints?.points || 0)} more to spin the wheel`}
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
                disabled={(userPoints?.points || 0) < 5}
                className="w-full bg-yellow-600 text-white py-4 rounded-lg font-semibold hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="button-spin-wheel"
              >
                <Gift size={24} />
                Spin Magic Wheel {(userPoints?.points || 0) < 5 && `(Need ${5 - (userPoints?.points || 0)} more points)`}
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>Fund your wallet to play quiz sessions</li>
                <li>Each session costs ₦100 for 5 questions</li>
                <li>Answer at least 3 correctly to earn 1 point</li>
                <li>Collect 5 points to spin the Magic Wheel</li>
                <li>Win cash prizes, items, or entries to weekly draws</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Share2 className="text-purple-600" size={24} />
            <h2 className="text-xl font-bold">Refer Friends & Earn</h2>
          </div>
          
          {referralData?.referralCode ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <p className="text-gray-600 mb-4">
                  Share your unique referral link with friends. When they sign up and fund their wallet with at least ₦500, you'll earn ₦200!
                </p>
                
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 bg-gray-100 rounded-lg px-4 py-3 font-mono text-sm overflow-hidden">
                    <span className="truncate block" data-testid="text-referral-link">
                      {`${window.location.origin}/signup?ref=${referralData.referralCode}`}
                    </span>
                  </div>
                  <button
                    onClick={copyReferralLink}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition-colors ${
                      copiedReferral 
                        ? 'bg-green-600 text-white' 
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                    data-testid="button-copy-referral"
                  >
                    {copiedReferral ? (
                      <>
                        <Check size={18} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={18} />
                        Copy Link
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-purple-800">
                    <strong>Your Referral Code:</strong> <span className="font-mono bg-purple-200 px-2 py-1 rounded" data-testid="text-referral-code">{referralData.referralCode}</span>
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                <h3 className="font-semibold mb-3">Your Referral Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="opacity-90">Total Referrals</span>
                    <span className="font-bold" data-testid="text-total-referrals">{referralData.stats?.totalReferrals || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-90">Qualified</span>
                    <span className="font-bold" data-testid="text-qualified-referrals">{referralData.stats?.qualifiedReferrals || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-90">Rewarded</span>
                    <span className="font-bold" data-testid="text-rewarded-referrals">{referralData.stats?.rewardedReferrals || 0}</span>
                  </div>
                  <div className="border-t border-purple-400 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="opacity-90">Total Earned</span>
                      <span className="font-bold text-lg" data-testid="text-referral-earnings">₦{(referralData.stats?.totalEarned || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Share2 size={48} className="mx-auto mb-4 opacity-50" />
              <p>Loading referral information...</p>
            </div>
          )}
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

        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="text-yellow-500" size={24} />
            <h2 className="text-xl font-bold" data-testid="heading-recent-winners">Recent Winners</h2>
          </div>
          {publicWinners.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {publicWinners.map((winner) => (
                <div
                  key={winner.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-yellow-50 to-white"
                  data-testid={`card-winner-${winner.id}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative">
                      {winner.photoUrl ? (
                        <img
                          src={winner.photoUrl}
                          alt={winner.userFullName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-yellow-400"
                          data-testid={`img-winner-photo-${winner.id}`}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                          {winner.userFullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <Trophy className="absolute -bottom-1 -right-1 text-yellow-500 bg-white rounded-full p-0.5" size={16} />
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 block" data-testid={`text-winner-name-${winner.id}`}>
                        {winner.userFullName}
                      </span>
                      <p className="text-xs text-gray-500">
                        {new Date(winner.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2">
                    <p className="text-sm text-gray-700 font-medium" data-testid={`text-prize-name-${winner.id}`}>
                      {winner.prizeName}
                    </p>
                    {winner.prizeValue !== null && Number(winner.prizeValue) > 0 && (
                      <p className="text-green-600 font-bold text-xl" data-testid={`text-prize-value-${winner.id}`}>
                        ₦{Number(winner.prizeValue).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No winners yet. Be the first to win a prize!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
