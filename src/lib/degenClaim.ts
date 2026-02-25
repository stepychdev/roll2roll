/**
 * "Degen Mode" — claim winnings as a random token via Jupiter swap.
 *
 * Flow:
 *  1. Normal on-chain claim() → receives USDC
 *  2. Jupiter swap: USDC → random popular token
 *
 * The random token is revealed before claim to build anticipation.
 */
import { Connection, PublicKey, VersionedTransaction, TransactionMessage } from '@solana/web3.js';
import {
  getJupiterQuote,
  getJupiterSwapInstructions,
  buildJupiterInstructions,
  resolveAddressLookupTables,
  type JupiterQuote,
} from './jupiterClient';

/** Popular mainnet tokens for random claim. On devnet we use SOL only. */
const POPULAR_TOKENS = [
  { mint: 'So11111111111111111111111111111111111111112', symbol: 'SOL', icon: '◎' },
  { mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', symbol: 'JUP', icon: '🪐' },
  { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', symbol: 'USDC', icon: '💵' },
  { mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', symbol: 'BONK', icon: '🐕' },
  { mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', symbol: 'WIF', icon: '🐶' },
  { mint: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',  symbol: 'mSOL', icon: '🌊' },
  { mint: 'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL',  symbol: 'JTO', icon: '🏗️' },
  { mint: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3', symbol: 'PYTH', icon: '🔮' },
  { mint: 'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof',  symbol: 'RNDR', icon: '🎨' },
  { mint: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs', symbol: 'RAY', icon: '☀️' },
];

/** Devnet-safe list (SOL wraps always work) */
const DEVNET_TOKENS = [
  { mint: 'So11111111111111111111111111111111111111112', symbol: 'SOL', icon: '◎' },
];

export interface DegenToken {
  mint: string;
  symbol: string;
  icon: string;
}

function fnv1a32(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function xorshift32(seed: number): number {
  let x = seed || 0x9e3779b9;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return x >>> 0;
}

/** Pick a random token for degen claim. Excludes USDC to make it exciting. */
export function pickRandomToken(isMainnet: boolean): DegenToken {
  const pool = isMainnet
    ? POPULAR_TOKENS.filter(t => t.symbol !== 'USDC')
    : DEVNET_TOKENS;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Deterministic token pick derived from an external seed (e.g. round VRF). */
export function pickDegenTokenFromSeed(isMainnet: boolean, seed: string): DegenToken {
  const pool = isMainnet
    ? POPULAR_TOKENS.filter(t => t.symbol !== 'USDC')
    : DEVNET_TOKENS;
  const hashed = xorshift32(fnv1a32(seed));
  return pool[hashed % pool.length];
}

/** Get a Jupiter quote for USDC → random token */
export async function getDegenQuote(
  usdcAmount: number,
  usdcMint: string,
  targetMint: string,
): Promise<JupiterQuote | null> {
  try {
    const rawAmount = Math.floor(usdcAmount * 1e6).toString();
    return await getJupiterQuote(usdcMint, targetMint, rawAmount, 100);
  } catch {
    return null;
  }
}

/** Build a Jupiter swap transaction: USDC → target token */
export async function buildDegenSwapTx(
  connection: Connection,
  userPubkey: PublicKey,
  quote: JupiterQuote,
): Promise<VersionedTransaction> {
  const swapIxs = await getJupiterSwapInstructions(userPubkey.toBase58(), quote);
  const jupIxs = buildJupiterInstructions(swapIxs);

  const alts = await resolveAddressLookupTables(
    connection,
    swapIxs.addressLookupTableAddresses,
  );

  const { blockhash } = await connection.getLatestBlockhash('confirmed');

  const messageV0 = new TransactionMessage({
    payerKey: userPubkey,
    recentBlockhash: blockhash,
    instructions: jupIxs,
  }).compileToV0Message(alts);

  return new VersionedTransaction(messageV0);
}
