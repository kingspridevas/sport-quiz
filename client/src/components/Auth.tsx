import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { LogIn, UserPlus, Camera, Upload, Trophy, User, Mail, ArrowLeft } from 'lucide-react';

interface Winner {
  id: string;
  prize_name: string;
  prize_value: number | null;
  spun_at: string;
  user_id: string;
  full_name: string | null;
  photo_url: string | null;
}

export function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [sex, setSex] = useState<'Male' | 'Female' | ''>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [referralCode, setReferralCode] = useState('');
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [winners, setWinners] = useState<Winner[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { signIn, signUp } = useAuth();

  useEffect(() => {
    loadTodaysWinners();
    checkPasswordRecovery();
    checkReferralCode();
  }, []);

  const checkReferralCode = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      setReferralCode(refCode.toUpperCase());
      setShowReferralInput(true);
      setIsSignUp(true);
    }
  };

  const checkPasswordRecovery = () => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    if (type === 'recovery') {
      setIsUpdatingPassword(true);
    }
  };

  const loadTodaysWinners = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const { data } = await supabase
      .from('wheel_spins')
      .select(`
        id,
        prize_name,
        prize_value,
        spun_at,
        user_id,
        profiles!inner(full_name, photo_url)
      `)
      .gte('spun_at', todayISO)
      .not('prize_value', 'is', null)
      .order('spun_at', { ascending: false })
      .limit(10);

    if (data) {
      const formattedWinners = data.map((win: any) => ({
        id: win.id,
        prize_name: win.prize_name,
        prize_value: win.prize_value,
        spun_at: win.spun_at,
        user_id: win.user_id,
        full_name: win.profiles.full_name,
        photo_url: win.profiles.photo_url,
      }));
      setWinners(formattedWinners);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Photo size must be less than 5MB');
        return;
      }
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  const handleGalleryClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isUpdatingPassword) {
        await handleUpdatePassword();
      } else if (isForgotPassword) {
        await handlePasswordReset();
      } else if (isSignUp) {
        if (!sex) {
          throw new Error('Please select your gender');
        }
        await signUp(email, password, fullName, sex, phoneNumber, location, photo, referralCode || undefined);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}`,
    });

    if (error) {
      throw error;
    }

    setSuccess('Password reset link sent! Check your email.');
    setEmail('');
  };

  const handleUpdatePassword = async () => {
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      throw error;
    }

    setSuccess('Password updated successfully! Redirecting...');
    setPassword('');
    setConfirmPassword('');

    setTimeout(() => {
      window.location.hash = '';
      setIsUpdatingPassword(false);
      window.location.reload();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4">
      <div className="max-w-6xl mx-auto py-8">
        {winners.length > 0 && (
          <div className="mb-8 bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                <Trophy className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Today's Winners</h2>
                <p className="text-sm text-gray-600">Fresh winners of the day</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {winners.map((winner) => (
                <div
                  key={winner.id}
                  className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 text-center border-2 border-yellow-200 hover:border-yellow-400 transition-all hover:shadow-lg"
                >
                  <div className="relative w-20 h-20 mx-auto mb-3">
                    {winner.photo_url ? (
                      <img
                        src={winner.photo_url}
                        alt={winner.full_name || 'Winner'}
                        className="w-full h-full object-cover rounded-full border-4 border-yellow-400 shadow-md"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 rounded-full border-4 border-yellow-400 flex items-center justify-center shadow-md">
                        <User className="text-white" size={32} />
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                      <Trophy className="text-white" size={16} />
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm mb-1 truncate">
                    {winner.full_name || 'Anonymous'}
                  </p>
                  <p className="text-xs text-gray-600 mb-2 truncate">{winner.prize_name}</p>
                  {winner.prize_value && (
                    <p className="text-green-600 font-bold text-sm">
                      ₦{winner.prize_value.toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
              <span className="text-3xl">⚽</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isUpdatingPassword
                ? 'Update Password'
                : isForgotPassword
                ? 'Reset Password'
                : 'Sports Quiz Platform'}
            </h1>
            <p className="text-gray-600">
              {isUpdatingPassword
                ? 'Enter your new password'
                : isForgotPassword
                ? 'Enter your email to receive a password reset link'
                : 'Test your sports knowledge and win prizes'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isUpdatingPassword ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                    minLength={6}
                    placeholder="Min. 6 characters"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                    minLength={6}
                    placeholder="Re-enter your password"
                  />
                </div>
              </>
            ) : isForgotPassword ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                  placeholder="your@email.com"
                />
              </div>
            ) : (
              <>
            {isSignUp && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required={isSignUp}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value as 'Male' | 'Female')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required={isSignUp}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required={isSignUp}
                    placeholder="+234 800 000 0000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required={isSignUp}
                    placeholder="City, State"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Photo
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  {photoPreview ? (
                    <div className="space-y-3">
                      <div className="relative w-32 h-32 mx-auto">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-full border-4 border-green-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPhoto(null);
                          setPhotoPreview('');
                        }}
                        className="w-full text-sm text-red-600 hover:text-red-700"
                      >
                        Remove Photo
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={handleCameraClick}
                        className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                      >
                        <Camera size={32} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Take Photo</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleGalleryClick}
                        className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                      >
                        <Upload size={32} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Choose File</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
                placeholder="your@email.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setError('');
                      setSuccess('');
                    }}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
                minLength={6}
                placeholder="Min. 6 characters"
              />
            </div>

            {isSignUp && (
              <div>
                {!showReferralInput ? (
                  <button
                    type="button"
                    onClick={() => setShowReferralInput(true)}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                    data-testid="button-show-referral"
                  >
                    Have a referral code?
                  </button>
                ) : (
                  <>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Referral Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent uppercase"
                      placeholder="Enter referral code"
                      maxLength={6}
                      data-testid="input-referral-code"
                    />
                    {referralCode && (
                      <p className="text-xs text-green-600 mt-1">
                        Referral code applied: {referralCode}
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
            </>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                'Please wait...'
              ) : isUpdatingPassword ? (
                'Update Password'
              ) : isForgotPassword ? (
                <>
                  <Mail size={20} />
                  Send Reset Link
                </>
              ) : isSignUp ? (
                <>
                  <UserPlus size={20} />
                  Sign Up
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            {!isUpdatingPassword && (
              <>
                {isForgotPassword ? (
                  <button
                    onClick={() => {
                      setIsForgotPassword(false);
                      setError('');
                      setSuccess('');
                    }}
                    className="text-green-600 hover:text-green-700 font-medium flex items-center justify-center gap-2 mx-auto"
                  >
                    <ArrowLeft size={16} />
                    Back to Sign In
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError('');
                      setSuccess('');
                    }}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    {isSignUp
                      ? 'Already have an account? Sign In'
                      : "Don't have an account? Sign Up"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
