import { useEffect, useState, useCallback } from 'react';
import { Trophy, X, Loader2, Shuffle, Zap } from 'lucide-react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import Confetti from 'react-confetti';
import { pickRandomToken, pickDegenTokenFromSeed, getDegenQuote, buildDegenSwapTx, type DegenToken } from '../lib/degenClaim';
import { USDC_MINT, IS_MAINNET } from '../lib/constants';

interface WinnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaim?: () => Promise<void>;
  isWinner?: boolean;
  claiming?: boolean;
  degenSeed?: string | null;
  winner: {
    address: string;
    displayName: string;
    amount: number;
    fee: number;
    payout: number;
    color: string;
  } | null;
}

export function WinnerModal({ isOpen, onClose, onClaim, isWinner, claiming, degenSeed, winner }: WinnerModalProps) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [degenMode, setDegenMode] = useState(false);
  const [degenToken, setDegenToken] = useState<DegenToken | null>(null);
  const [degenEstimate, setDegenEstimate] = useState<string | null>(null);
  const [degenSwapping, setDegenSwapping] = useState(false);
  const [degenStatus, setDegenStatus] = useState<string | null>(null);
  const hideDegenTokenPreview = !!degenSeed;

  useEffect(() => {
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pick deterministic token when a VRF-derived seed is available; fallback to local random.
  const activateDegenMode = useCallback(() => {
    const token = degenSeed
      ? pickDegenTokenFromSeed(IS_MAINNET, degenSeed)
      : pickRandomToken(IS_MAINNET);
    setDegenToken(token);
    setDegenMode(true);
    setDegenEstimate(null);
    // Fetch quote for estimate
    if (winner) {
      getDegenQuote(winner.payout, USDC_MINT.toBase58(), token.mint).then(q => {
        if (q) {
          const outAmt = parseFloat(q.outAmount);
          // Determine decimals based on token (SOL=9, most SPL=6)
          const decimals = token.symbol === 'SOL' || token.symbol === 'mSOL' ? 9 : 6;
          setDegenEstimate((outAmt / 10 ** decimals).toFixed(decimals > 6 ? 4 : 2));
        }
      });
    }
  }, [winner, degenSeed]);

  // Handle degen claim: normal claim first, then Jupiter swap
  const handleDegenClaim = useCallback(async () => {
    if (!onClaim || !publicKey || !degenToken || !winner) return;
    try {
      // Step 1: Normal claim
      setDegenStatus('Claiming USDC...');
      await onClaim();
      // Step 2: Jupiter swap USDC → random token
      setDegenSwapping(true);
      setDegenStatus(`Swapping to ${degenToken.symbol} via Jupiter...`);
      const quote = await getDegenQuote(winner.payout, USDC_MINT.toBase58(), degenToken.mint);
      if (!quote) throw new Error('Failed to get Jupiter quote');
      const tx = await buildDegenSwapTx(connection, publicKey, quote);
      const sig = await sendTransaction(tx, connection, { skipPreflight: true });
      await connection.confirmTransaction(sig, 'confirmed');
      setDegenStatus(`Swapped to ${degenToken.symbol}! 🎉`);
      setTimeout(() => { setDegenStatus(null); setDegenSwapping(false); }, 5000);
    } catch (e: any) {
      setDegenStatus(`Error: ${e.message?.slice(0, 60)}`);
      setDegenSwapping(false);
      setTimeout(() => setDegenStatus(null), 8000);
    }
  }, [onClaim, publicKey, degenToken, winner, connection, sendTransaction]);

  // Reset degen state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setDegenMode(false);
      setDegenToken(null);
      setDegenEstimate(null);
      setDegenSwapping(false);
      setDegenStatus(null);
    }
  }, [isOpen]);

  if (!isOpen || !winner) return null;

  const shortAddr = winner.address.length > 10
    ? `${winner.address.slice(0, 4)}...${winner.address.slice(-4)}`
    : winner.address;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose} />

      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        recycle={false}
        numberOfPieces={500}
        colors={['#0d59f2', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4']}
      />

      {/* Modal Card */}
        <div className="relative z-10 w-full max-w-[520px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        {/* Confetti dot pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, #f59e0b 2px, transparent 2px), radial-gradient(circle at 80% 20%, #0d59f2 3px, transparent 3px), radial-gradient(circle at 50% 50%, #f59e0b 2px, transparent 2px), radial-gradient(circle at 10% 80%, #0d59f2 2px, transparent 2px), radial-gradient(circle at 90% 90%, #f59e0b 3px, transparent 3px)',
          }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative px-5 sm:px-8 pt-8 sm:pt-12 pb-8 sm:pb-10 flex flex-col items-center text-center">
          {/* Trophy Badge with glow */}
          <div className="mb-6 relative">
            <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full scale-150" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Trophy className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Header */}
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase italic mb-2">
            Winner!
          </h2>

          {/* Wallet Chip */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full mb-6">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-primary font-bold text-sm tracking-wide">{shortAddr}</span>
          </div>

          {/* Payout Card */}
          <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 mb-8 border border-slate-100 dark:border-slate-700/50">
            <p className="text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-[0.2em] mb-2">
              Total Payout
            </p>
            <div className="flex flex-col items-center">
              <span className="text-4xl sm:text-6xl font-black text-amber-500 drop-shadow-sm">
                ${winner.payout.toFixed(2)}
              </span>
              <span className="text-amber-600 dark:text-amber-400 font-bold text-lg mt-1">USDC</span>
            </div>
            {/* Breakdown */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-between text-xs font-medium text-slate-400 dark:text-slate-500">
              <div className="flex items-center gap-1.5">
                Pot: ${winner.amount.toFixed(2)}
              </div>
              <div className="flex items-center gap-1.5">
                Fee: ${winner.fee.toFixed(2)} (0.25%)
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-3">
            {/* Degen Mode Toggle */}
            {isWinner && onClaim && (
              <div className="flex items-center justify-center gap-2 mb-1">
                <button
                  onClick={() => { setDegenMode(false); setDegenToken(null); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    !degenMode
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  💵 USDC
                </button>
                <button
                  onClick={activateDegenMode}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                    degenMode
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/30'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Shuffle className="w-3 h-3" />
                  DEGEN MODE
                </button>
              </div>
            )}

            {/* Degen Mode Info */}
            {degenMode && degenToken && (
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl px-4 py-3 text-center space-y-1">
                <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                  Claim as {degenSeed ? 'VRF-derived' : 'random'} token via Jupiter
                </p>
                {hideDegenTokenPreview ? (
                  <>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg font-black text-slate-900 dark:text-white">Hidden until claim</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      The token is already determined from round VRF and will be revealed during degen claim.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl">{degenToken.icon}</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white">{degenToken.symbol}</span>
                    </div>
                    {degenEstimate && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        ≈ {degenEstimate} {degenToken.symbol} <span className="text-[10px]">🪐 via Jupiter</span>
                      </p>
                    )}
                  </>
                )}
                {degenSeed && (
                  <p className="text-[10px] text-purple-400/80 font-medium">
                    Deterministic pick from round VRF (no reroll)
                  </p>
                )}
                {!degenSeed && (
                  <button
                    onClick={activateDegenMode}
                    className="text-[10px] text-purple-400 hover:text-purple-300 font-bold"
                  >
                    🎲 Re-roll token
                  </button>
                )}
              </div>
            )}

            {/* Degen Status */}
            {degenStatus && (
              <div className="text-xs text-center font-mono text-purple-400 animate-pulse px-2">
                {degenStatus}
              </div>
            )}

            {/* Claim button — only for the winner */}
            {isWinner && onClaim && (
              <button
                onClick={degenMode ? handleDegenClaim : onClaim}
                disabled={claiming || degenSwapping}
                className={`group relative w-full h-16 rounded-full overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                  degenMode
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-purple-500/25'
                    : 'bg-primary shadow-primary/25'
                }`}
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-center gap-3">
                  {claiming || degenSwapping ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : degenMode && degenToken ? (
                    <>
                      <Zap className="w-5 h-5 text-white" />
                      <span className="text-white text-lg font-extrabold tracking-wider">
                        {hideDegenTokenPreview ? "CLAIM DEGEN" : `CLAIM AS ${degenToken.symbol}`}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-white text-lg font-extrabold tracking-wider">
                        CLAIM ${winner.payout.toFixed(2)}
                      </span>
                      <Trophy className="w-5 h-5 text-white" />
                    </>
                  )}
                </div>
              </button>
            )}

            {/* Next Round button */}
            <button
              onClick={onClose}
              className="w-full h-14 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <span className="text-slate-600 dark:text-slate-300 font-bold text-sm tracking-wide">
                NEXT ROUND
              </span>
            </button>
          </div>
        </div>

        {/* Bottom gradient border */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-amber-500 to-primary" />
      </div>
    </div>
  );
}
