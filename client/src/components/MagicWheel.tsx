import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Gift, AlertCircle, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import type { PrizeConfig, UserPoints } from '@shared/schema';

const POINTS_REQUIRED = 10;

interface MagicWheelProps {
  onComplete: () => void;
}

export function MagicWheel({ onComplete }: MagicWheelProps) {
  const { user } = useAuth();
  const [prizes, setPrizes] = useState<PrizeConfig[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<PrizeConfig | null>(null);
  const [rotation, setRotation] = useState(0);
  const [canSpin, setCanSpin] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    
    try {
      const [prizesRes, pointsRes] = await Promise.all([
        fetch('/api/prizes'),
        fetch(`/api/points/${user.id}`)
      ]);
      
      if (prizesRes.ok) {
        const prizesData = await prizesRes.json();
        setPrizes(prizesData);
      }
      
      if (pointsRes.ok) {
        const pointsData: UserPoints = await pointsRes.json();
        setUserPoints(pointsData.points);
        setCanSpin(pointsData.points >= POINTS_REQUIRED);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load wheel data');
    } finally {
      setLoading(false);
    }
  };

  const handleSpin = async () => {
    if (!user || !canSpin || spinning) return;

    setSpinning(true);
    setError(null);

    try {
      const result = await apiRequest('/api/wheel/spin', {
        method: 'POST',
        body: JSON.stringify({ userId: user.id }),
      });
      
      if (!result.prize) {
        setError('Error selecting prize');
        setSpinning(false);
        return;
      }

      const selectedPrize = result.prize;
      
      // Calculate wheel rotation
      // The pointer is at the top (0 degrees), pointing down
      // Segment i covers angles from (i * segmentAngle) to ((i+1) * segmentAngle)
      // The center of segment i is at (i * segmentAngle + segmentAngle/2)
      // To bring segment center to top (0), we rotate wheel backward by that amount
      const prizeIndex = prizes.findIndex((p) => p.id === selectedPrize.id);
      const segmentAngle = 360 / prizes.length;
      const prizeAngle = prizeIndex * segmentAngle + segmentAngle / 2;
      
      // We want the prize at the TOP. CSS rotates clockwise for positive values.
      // To bring a segment at angle X to angle 0, we rotate by -X (or 360-X for positive)
      // Add multiple full spins for the spinning effect
      const fullSpins = Math.floor(5 + Math.random() * 5) * 360;
      const targetRotation = fullSpins + (360 - prizeAngle);
      
      console.log('Spin debug:', { prizeIndex, segmentAngle, prizeAngle, targetRotation, prizeName: selectedPrize.prizeName });

      setRotation(targetRotation);

      // Wait for spin animation
      setTimeout(() => {
        setWonPrize(selectedPrize);
        setSpinning(false);
        loadData(); // Refresh points
      }, 5000);
    } catch (err) {
      console.error('Error spinning wheel:', err);
      setError('Error spinning wheel. Please try again.');
      setSpinning(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-xl shadow-lg p-8 text-center">
        <Loader2 className="animate-spin mx-auto text-primary" size={48} />
        <p className="mt-4 text-muted-foreground">Loading wheel...</p>
      </div>
    );
  }

  if (wonPrize) {
    return (
      <div className="bg-card rounded-xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-4">
            <Gift className="text-yellow-600 dark:text-yellow-400" size={48} />
          </div>
          <h2 className="text-3xl font-bold mb-4">Congratulations!</h2>
          <p className="text-xl text-muted-foreground mb-6">You won:</p>
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-lg p-6 mb-6">
            <p className="text-4xl font-bold">{wonPrize.prizeName}</p>
            {wonPrize.prizeValue && (
              <p className="text-xl mt-2">{Number(wonPrize.prizeValue).toLocaleString()}</p>
            )}
          </div>

          {wonPrize.prizeType === 'cash' && (
            <p className="text-green-600 dark:text-green-400 font-semibold mb-4">
              Prize has been added to your wallet!
            </p>
          )}

          {wonPrize.prizeType === 'item' && (
            <p className="text-blue-600 dark:text-blue-400 font-semibold mb-4">
              An admin will contact you to claim your prize!
            </p>
          )}

          {wonPrize.prizeType === 'draw' && (
            <p className="text-blue-600 dark:text-blue-400 font-semibold mb-4">
              You've been entered into the weekly draw!
            </p>
          )}

          {wonPrize.prizeType === 'retry' && (
            <p className="text-muted-foreground font-semibold mb-4">
              Better luck next time!
            </p>
          )}

          {wonPrize.prizeType === 'thank_you' && (
            <p className="text-muted-foreground font-semibold mb-4">
              Thank you for playing!
            </p>
          )}
        </div>

        <button
          onClick={onComplete}
          className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          data-testid="button-back-to-dashboard"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-lg p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-4">
          <Sparkles className="text-yellow-600 dark:text-yellow-400" size={32} />
        </div>
        <h2 className="text-3xl font-bold mb-2">Magic Wheel</h2>
        <p className="text-muted-foreground">Spin the wheel and win amazing prizes!</p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-6 text-center">
          <p className="text-destructive">{error}</p>
        </div>
      )}

      {!canSpin && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-semibold mb-1">You need {POINTS_REQUIRED} points to spin!</p>
            <p>Current points: {userPoints}</p>
            <p className="mt-2">Complete quiz sessions to earn more points.</p>
          </div>
        </div>
      )}

      {prizes.length === 0 ? (
        <div className="text-center py-8">
          <AlertCircle className="mx-auto text-muted-foreground mb-4" size={48} />
          <p className="text-muted-foreground">No prizes available at the moment.</p>
        </div>
      ) : (
        <>
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
                      {prize.prizeName}
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
                className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full shadow-lg font-bold text-foreground hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-20 border-4 border-yellow-400"
                data-testid="button-spin-wheel"
              >
                {spinning ? '...' : 'SPIN'}
              </button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Cost: {POINTS_REQUIRED} points | Your points: {userPoints}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
