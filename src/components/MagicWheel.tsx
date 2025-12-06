import { useState, useEffect } from 'react';
import { supabase, PrizeConfig } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Gift, AlertCircle } from 'lucide-react';

const POINTS_REQUIRED = 10;

interface MagicWheelProps {
  onComplete: () => void;
}

export function MagicWheel({ onComplete }: MagicWheelProps) {
  const { user, profile } = useAuth();
  const [prizes, setPrizes] = useState<PrizeConfig[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<PrizeConfig | null>(null);
  const [rotation, setRotation] = useState(0);
  const [canSpin, setCanSpin] = useState(false);
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    loadPrizes();
    loadUserPoints();
  }, []);

  const loadPrizes = async () => {
    const { data } = await supabase
      .from('prize_config')
      .select('*')
      .eq('is_active', true)
      .order('probability_weight', { ascending: false });

    if (data) {
      setPrizes(data);
    }
  };

  const loadUserPoints = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setUserPoints(data.points);
      setCanSpin(data.points >= POINTS_REQUIRED);
    }
  };

  const checkDailyLimit = async (prizeId: string, prizeLimit: number | null) => {
    if (!prizeLimit) return true;

    const today = new Date().toISOString().split('T')[0];

    const { data } = await supabase
      .from('daily_winner_limits')
      .select('*')
      .eq('prize_id', prizeId)
      .eq('date', today)
      .maybeSingle();

    if (!data) {
      await supabase.from('daily_winner_limits').insert([
        {
          prize_id: prizeId,
          date: today,
          current_winners: 0,
          max_winners: prizeLimit,
        },
      ]);
      return true;
    }

    return data.current_winners < data.max_winners;
  };

  const selectPrize = async (): Promise<PrizeConfig | null> => {
    const availablePrizes: PrizeConfig[] = [];

    for (const prize of prizes) {
      const canWin = await checkDailyLimit(prize.id, prize.daily_limit);
      if (canWin) {
        for (let i = 0; i < prize.probability_weight; i++) {
          availablePrizes.push(prize);
        }
      }
    }

    if (availablePrizes.length === 0) {
      return prizes.find((p) => p.prize_type === 'thank_you') || prizes[0];
    }

    const randomIndex = Math.floor(Math.random() * availablePrizes.length);
    return availablePrizes[randomIndex];
  };

  const sendPrizeNotification = async (prize: PrizeConfig) => {
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/prize-notification`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: user?.email || 'N/A',
          userName: profile?.full_name || 'Unknown User',
          userPhone: profile?.phone_number,
          userId: user?.id || 'N/A',
          prizeName: prize.prize_name,
          prizeValue: prize.prize_value,
          prizeType: prize.prize_type,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        console.error('Failed to send notification:', await response.text());
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const handleSpin = async () => {
    if (!user || !canSpin || spinning) return;

    setSpinning(true);

    try {
      const { data: pointsData } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!pointsData || pointsData.points < POINTS_REQUIRED) {
        alert('Insufficient points');
        setSpinning(false);
        return;
      }

      await supabase
        .from('user_points')
        .update({
          points: pointsData.points - POINTS_REQUIRED,
          total_spent: pointsData.total_spent + POINTS_REQUIRED,
          updated_at: new Date().toISOString(),
        })
        .eq('id', pointsData.id);

      const selectedPrize = await selectPrize();
      if (!selectedPrize) {
        alert('Error selecting prize');
        setSpinning(false);
        return;
      }

      const spins = 5 + Math.random() * 5;
      const prizeIndex = prizes.findIndex((p) => p.id === selectedPrize.id);
      const segmentAngle = 360 / prizes.length;
      const targetRotation = 360 * spins + prizeIndex * segmentAngle + segmentAngle / 2;

      setRotation(targetRotation);

      setTimeout(async () => {
        let spinStatus = 'pending';

        const { data: spinRecord } = await supabase.from('wheel_spins').insert([
          {
            user_id: user.id,
            prize_id: selectedPrize.id,
            prize_name: selectedPrize.prize_name,
            prize_value: selectedPrize.prize_value,
            status: 'pending',
          },
        ]).select().single();

        if (selectedPrize.daily_limit) {
          const today = new Date().toISOString().split('T')[0];
          const { data } = await supabase
            .from('daily_winner_limits')
            .select('*')
            .eq('prize_id', selectedPrize.id)
            .eq('date', today)
            .maybeSingle();

          if (data) {
            await supabase
              .from('daily_winner_limits')
              .update({
                current_winners: data.current_winners + 1,
              })
              .eq('id', data.id);
          }
        }

        if (selectedPrize.prize_type === 'cash' && selectedPrize.prize_value) {
          const { data: wallet } = await supabase
            .from('wallets')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          if (wallet) {
            const { error: walletError } = await supabase
              .from('wallets')
              .update({
                balance: wallet.balance + selectedPrize.prize_value,
                updated_at: new Date().toISOString(),
              })
              .eq('id', wallet.id);

            if (!walletError) {
              await supabase.from('wallet_transactions').insert([
                {
                  wallet_id: wallet.id,
                  type: 'prize_winning',
                  amount: selectedPrize.prize_value,
                  description: `Prize: ${selectedPrize.prize_name}`,
                },
              ]);
              spinStatus = 'processed';
            }
          }
        } else if (selectedPrize.prize_type === 'item' || selectedPrize.prize_type === 'draw') {
          spinStatus = 'pending';
        } else {
          spinStatus = 'processed';
        }

        if (spinRecord) {
          await supabase
            .from('wheel_spins')
            .update({ status: spinStatus })
            .eq('id', spinRecord.id);
        }

        await sendPrizeNotification(selectedPrize);

        setWonPrize(selectedPrize);
        setSpinning(false);
        await loadUserPoints();
      }, 5000);
    } catch (error) {
      console.error('Error spinning wheel:', error);
      alert('Error spinning wheel');
      setSpinning(false);
    }
  };

  if (wonPrize) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-yellow-100 rounded-full mb-4">
            <Gift className="text-yellow-600" size={48} />
          </div>
          <h2 className="text-3xl font-bold mb-4">Congratulations!</h2>
          <p className="text-xl text-gray-700 mb-6">You won:</p>
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-lg p-6 mb-6">
            <p className="text-4xl font-bold">{wonPrize.prize_name}</p>
            {wonPrize.prize_value && (
              <p className="text-xl mt-2">₦{wonPrize.prize_value.toLocaleString()}</p>
            )}
          </div>

          {wonPrize.prize_type === 'cash' && (
            <p className="text-green-600 font-semibold mb-4">
              Prize has been added to your wallet!
            </p>
          )}

          {wonPrize.prize_type === 'item' && (
            <p className="text-blue-600 font-semibold mb-4">
              An admin will contact you to claim your prize!
            </p>
          )}

          {wonPrize.prize_type === 'draw' && (
            <p className="text-blue-600 font-semibold mb-4">
              You've been entered into the weekly draw!
            </p>
          )}

          {wonPrize.prize_type === 'retry' && (
            <p className="text-gray-600 font-semibold mb-4">
              Better luck next time!
            </p>
          )}
        </div>

        <button
          onClick={onComplete}
          className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
          <Sparkles className="text-yellow-600" size={32} />
        </div>
        <h2 className="text-3xl font-bold mb-2">Magic Wheel</h2>
        <p className="text-gray-600">Spin the wheel and win amazing prizes!</p>
      </div>

      {!canSpin && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">You need {POINTS_REQUIRED} points to spin!</p>
            <p>Current points: {userPoints}</p>
            <p className="mt-2">Complete quiz sessions to earn more points.</p>
          </div>
        </div>
      )}

      <div className="relative w-80 h-80 mx-auto mb-8">
        <div
          className="absolute inset-0 rounded-full border-8 border-yellow-400 shadow-xl overflow-hidden"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
          }}
        >
          {prizes.map((prize, index) => {
            const segmentAngle = 360 / prizes.length;
            const rotation = index * segmentAngle;
            const colors = [
              'bg-red-500',
              'bg-blue-500',
              'bg-green-500',
              'bg-yellow-500',
              'bg-pink-500',
              'bg-purple-500',
              'bg-orange-500',
              'bg-teal-500',
            ];

            return (
              <div
                key={prize.id}
                className={`absolute w-full h-full ${colors[index % colors.length]}`}
                style={{
                  clipPath: `polygon(50% 50%, 50% 0%, ${
                    50 + 50 * Math.sin((segmentAngle * Math.PI) / 180)
                  }% ${50 - 50 * Math.cos((segmentAngle * Math.PI) / 180)}%)`,
                  transform: `rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                }}
              >
                <div
                  className="absolute left-1/2 top-8 -translate-x-1/2 text-white text-xs font-bold text-center"
                  style={{
                    transform: `rotate(${segmentAngle / 2}deg)`,
                    width: '60px',
                  }}
                >
                  {prize.prize_name}
                </div>
              </div>
            );
          })}
        </div>

        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[30px] border-t-red-600 z-10" />

        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={handleSpin}
            disabled={!canSpin || spinning}
            className="w-20 h-20 bg-white rounded-full shadow-lg font-bold text-gray-800 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-20 border-4 border-yellow-400"
          >
            {spinning ? '...' : 'SPIN'}
          </button>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">
          Cost: {POINTS_REQUIRED} points | Your points: {userPoints}
        </p>
      </div>
    </div>
  );
}
