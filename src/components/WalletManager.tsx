import { useState, useEffect } from 'react';
import { supabase, Wallet } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Wallet as WalletIcon, Plus, ArrowUpRight, Copy, Clock, CreditCard } from 'lucide-react';

interface VirtualAccount {
  accountNumber: string;
  accountName: string;
  bankName: string;
  amount: number;
  reference: string;
  expiresAt: string;
}

export function WalletManager() {
  const { user, profile } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [fundAmount, setFundAmount] = useState('');
  const [showFundModal, setShowFundModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [virtualAccount, setVirtualAccount] = useState<VirtualAccount | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      loadWallet();
    }
  }, [user]);

  const loadWallet = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setWallet(data);
    }
    setLoading(false);
  };

  const handleFundWallet = async () => {
    if (!user || !profile) return;

    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setProcessing(true);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-virtual-account`;

      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          userId: user.id,
          userName: profile.full_name || 'User',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create virtual account');
      }

      const result = await response.json();
      setVirtualAccount(result.data);
      setFundAmount('');
    } catch (error) {
      alert('Error creating payment account: ' + (error as Error).message);
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const closePaymentModal = () => {
    setShowFundModal(false);
    setVirtualAccount(null);
    setFundAmount('');
  };

  if (loading) {
    return <div className="text-center py-8">Loading wallet...</div>;
  }

  if (!wallet) {
    return <div className="text-center py-8">Wallet not found</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <WalletIcon className="text-green-600" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Your Wallet</h2>
            <p className="text-sm text-gray-500">Manage your funds</p>
          </div>
        </div>
        <button
          onClick={() => setShowFundModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Fund Wallet
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90 mb-1">Current Balance</p>
          <p className="text-3xl font-bold">₦{wallet.balance.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90 mb-1">Total Funded</p>
          <p className="text-3xl font-bold">₦{wallet.total_funded.toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Each quiz session costs ₦100 and gives you access to 5 questions. Answer at least 3 correctly to earn 1 point.
        </p>
      </div>

      {showFundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            {!virtualAccount ? (
              <>
                <h3 className="text-xl font-bold mb-4">Fund Your Wallet</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (₦)
                  </label>
                  <input
                    type="number"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter amount"
                    min="1"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleFundWallet}
                    disabled={processing}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <ArrowUpRight size={20} />
                    {processing ? 'Generating...' : 'Generate Account'}
                  </button>
                  <button
                    onClick={closePaymentModal}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="text-green-600" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Payment Details</h3>
                  <p className="text-sm text-gray-500 mt-1">Transfer ₦{virtualAccount.amount.toLocaleString()} to the account below</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Account Number</span>
                      <button
                        onClick={() => copyToClipboard(virtualAccount.accountNumber)}
                        className="text-green-600 hover:text-green-700 transition-colors"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{virtualAccount.accountNumber}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <span className="text-sm text-gray-600 block mb-1">Account Name</span>
                    <p className="text-lg font-semibold text-gray-900">{virtualAccount.accountName}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <span className="text-sm text-gray-600 block mb-1">Bank Name</span>
                    <p className="text-lg font-semibold text-gray-900">{virtualAccount.bankName}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <span className="text-sm text-gray-600 block mb-1">Amount</span>
                    <p className="text-2xl font-bold text-green-600">₦{virtualAccount.amount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-2">
                    <Clock className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="text-sm font-semibold text-amber-900 mb-1">Account Expires In 1 Hour</p>
                      <p className="text-xs text-amber-800">
                        This virtual account will expire at {new Date(virtualAccount.expiresAt).toLocaleString()}.
                        Complete your transfer before then.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>Instructions:</strong>
                  </p>
                  <ol className="text-sm text-blue-800 mt-2 space-y-1 list-decimal list-inside">
                    <li>Open your banking app</li>
                    <li>Transfer exactly ₦{virtualAccount.amount.toLocaleString()} to the account above</li>
                    <li>Your wallet will be credited automatically within seconds</li>
                  </ol>
                </div>

                {copied && (
                  <div className="text-center text-sm text-green-600 font-medium mb-4">
                    ✓ Account number copied to clipboard
                  </div>
                )}

                <button
                  onClick={closePaymentModal}
                  className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
