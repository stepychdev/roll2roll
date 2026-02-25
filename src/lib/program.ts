import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import _IDL from "../idl/jackpot.json";
import {
  PROGRAM_ID,
  SEED_CFG,
  SEED_ROUND,
  SEED_PARTICIPANT,
} from "./constants";
import type { Idl } from "@coral-xyz/anchor";

// ─── Types ──────────────────────────────────────────────────

const IDL = _IDL as unknown as Idl;
export type Jackpot = typeof IDL;

export interface RoundData {
  roundId: bigint;
  status: number;
  bump: number;
  startTs: bigint;
  endTs: bigint;
  firstDepositTs: bigint;
  vaultUsdcAta: PublicKey;
  totalUsdc: bigint;
  totalTickets: bigint;
  participantsCount: number;
  randomness: Uint8Array;
  winningTicket: bigint;
  winner: PublicKey;
  participants: PublicKey[]; // only first participantsCount entries
  vrfPayer: PublicKey;
}

export interface ConfigData {
  admin: PublicKey;
  usdcMint: PublicKey;
  treasuryUsdcAta: PublicKey;
  feeBps: number;
  ticketUnit: bigint;
  roundDurationSec: number;
  minParticipants: number;
  minTotalTickets: bigint;
  paused: boolean;
  bump: number;
}

export interface ParticipantData {
  round: PublicKey;
  user: PublicKey;
  index: number;
  bump: number;
  ticketsTotal: bigint;
  usdcTotal: bigint;
  depositsCount: number;
}

// ─── PDA helpers ────────────────────────────────────────────

export function getConfigPda(): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync([SEED_CFG], PROGRAM_ID);
  return pda;
}

export function getRoundPda(roundId: number | BN): PublicKey {
  const id = BN.isBN(roundId) ? roundId : new BN(roundId);
  const [pda] = PublicKey.findProgramAddressSync(
    [SEED_ROUND, id.toArrayLike(Buffer, "le", 8)],
    PROGRAM_ID
  );
  return pda;
}

export function getParticipantPda(
  round: PublicKey,
  user: PublicKey
): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [SEED_PARTICIPANT, round.toBuffer(), user.toBuffer()],
    PROGRAM_ID
  );
  return pda;
}

// ─── Program instance ───────────────────────────────────────

export function getProgram(provider: AnchorProvider): Program<Jackpot> {
  const idlWithAddress = {
    ...IDL,
    address: PROGRAM_ID.toBase58(),
  };
  return new Program(idlWithAddress as unknown as Jackpot, provider);
}

// ─── Manual Round deserialization (zero-copy) ───────────────
// Round is #[account(zero_copy)] #[repr(C)], so Anchor adds 8-byte discriminator
// then the struct fields in order. We parse the raw buffer.

// Offset table (after 8-byte discriminator):
// round_id:           u64     offset 0
// status:             u8      offset 8
// bump:               u8      offset 9
// _padding:           [u8;6]  offset 10
// start_ts:           i64     offset 16
// end_ts:             i64     offset 24
// first_deposit_ts:   i64     offset 32
// vault_usdc_ata:     [u8;32] offset 40
// total_usdc:         u64     offset 72
// total_tickets:      u64     offset 80
// participants_count: u16     offset 88
// _padding2:          [u8;6]  offset 90
// randomness:         [u8;32] offset 96
// winning_ticket:     u64     offset 128
// winner:             [u8;32] offset 136
// participants:       [[u8;32];200] offset 168  (200*32 = 6400)
// bit:                [u64;201]     offset 6568 (201*8 = 1608)
// vrf_payer:          [u8;32]      offset 8176
// vrf_reimbursed:     u8           offset 8208
// reserved:           [u8;31]      offset 8209

const DISC = 8;

export function parseRound(data: Buffer): RoundData {
  const d = data;
  const view = new DataView(d.buffer, d.byteOffset, d.byteLength);

  const roundId = view.getBigUint64(DISC + 0, true);
  const status = d[DISC + 8];
  const bump = d[DISC + 9];
  const startTs = view.getBigInt64(DISC + 16, true);
  const endTs = view.getBigInt64(DISC + 24, true);
  const firstDepositTs = view.getBigInt64(DISC + 32, true);
  const vaultUsdcAta = new PublicKey(d.subarray(DISC + 40, DISC + 72));
  const totalUsdc = view.getBigUint64(DISC + 72, true);
  const totalTickets = view.getBigUint64(DISC + 80, true);
  const participantsCount = view.getUint16(DISC + 88, true);
  const randomness = new Uint8Array(d.subarray(DISC + 96, DISC + 128));
  const winningTicket = view.getBigUint64(DISC + 128, true);
  const winner = new PublicKey(d.subarray(DISC + 136, DISC + 168));

  const participants: PublicKey[] = [];
  const pOff = DISC + 168;
  for (let i = 0; i < participantsCount; i++) {
    const s = pOff + i * 32;
    participants.push(new PublicKey(d.subarray(s, s + 32)));
  }

  // vrf_payer at offset 8176
  const vrfPayer = new PublicKey(d.subarray(DISC + 8176, DISC + 8208));

  return {
    roundId,
    status,
    bump,
    startTs,
    endTs,
    firstDepositTs,
    vaultUsdcAta,
    totalUsdc,
    totalTickets,
    participantsCount,
    randomness,
    winningTicket,
    winner,
    participants,
    vrfPayer,
  };
}

// ─── Participant deserialization (Borsh — 8-byte disc + fields) ──────────────
// Participant is a normal Anchor account (Borsh-serialized, not zero-copy).
// Layout after 8-byte discriminator:
//   round:          Pubkey  (32)
//   user:           Pubkey  (32)
//   index:          u16     (2)
//   bump:           u8      (1)
//   tickets_total:  u64     (8)
//   usdc_total:     u64     (8)
//   deposits_count: u32     (4)
//   reserved:       [u8;16] (16)
// Total: 8 + 32 + 32 + 2 + 1 + 8 + 8 + 4 + 16 = 111 bytes

export function parseParticipant(data: Buffer): ParticipantData {
  const d = data;
  const view = new DataView(d.buffer, d.byteOffset, d.byteLength);
  let off = DISC; // skip 8-byte discriminator

  const round = new PublicKey(d.subarray(off, off + 32)); off += 32;
  const user = new PublicKey(d.subarray(off, off + 32)); off += 32;
  const index = view.getUint16(off, true); off += 2;
  const bump = d[off]; off += 1;
  const ticketsTotal = view.getBigUint64(off, true); off += 8;
  const usdcTotal = view.getBigUint64(off, true); off += 8;
  const depositsCount = view.getUint32(off, true);

  return { round, user, index, bump, ticketsTotal, usdcTotal, depositsCount };
}

// ─── Config deserialization (normal Anchor account — 8-byte disc + borsh) ────

export async function fetchConfig(
  program: Program<Jackpot>
): Promise<ConfigData> {
  const raw = await (program.account as any).config.fetch(getConfigPda());
  return {
    admin: raw.admin,
    usdcMint: raw.usdcMint,
    treasuryUsdcAta: raw.treasuryUsdcAta,
    feeBps: raw.feeBps,
    ticketUnit: BigInt(raw.ticketUnit.toString()),
    roundDurationSec: raw.roundDurationSec,
    minParticipants: raw.minParticipants,
    minTotalTickets: BigInt(raw.minTotalTickets.toString()),
    paused: raw.paused,
    bump: raw.bump,
  };
}

// ─── Fetch Round (raw accountInfo → parseRound) ─────────────

export async function fetchRound(
  connection: Connection,
  roundId: number
): Promise<RoundData | null> {
  const pda = getRoundPda(roundId);
  const info = await connection.getAccountInfo(pda);
  if (!info) return null;
  return parseRound(info.data as Buffer);
}

// ─── Participant deserialization (normal Anchor) ─────────────

export async function fetchParticipant(
  program: Program<Jackpot>,
  roundPda: PublicKey,
  user: PublicKey
): Promise<ParticipantData | null> {
  const pda = getParticipantPda(roundPda, user);
  try {
    const raw = await (program.account as any).participant.fetch(pda);
    return {
      round: raw.round,
      user: raw.user,
      index: raw.index,
      bump: raw.bump,
      ticketsTotal: BigInt(raw.ticketsTotal.toString()),
      usdcTotal: BigInt(raw.usdcTotal.toString()),
      depositsCount: raw.depositsCount,
    };
  } catch {
    return null;
  }
}

// ─── Instruction builders ───────────────────────────────────

export async function buildStartRound(
  program: Program<Jackpot>,
  payer: PublicKey,
  roundId: number,
  usdcMint: PublicKey
): Promise<TransactionInstruction> {
  const roundPda = getRoundPda(roundId);
  const vaultAta = await getAssociatedTokenAddress(
    usdcMint,
    roundPda,
    true // allowOwnerOffCurve — round PDA is off-curve
  );

  return await program.methods
    .startRound(new BN(roundId))
    .accounts({
      payer,
      config: getConfigPda(),
      round: roundPda,
      vaultUsdcAta: vaultAta,
      usdcMint,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
}

export async function buildDepositAny(
  program: Program<Jackpot>,
  user: PublicKey,
  roundId: number,
  usdcBalanceBefore: BN,
  minOut: BN,
  usdcMint: PublicKey
): Promise<TransactionInstruction> {
  const roundPda = getRoundPda(roundId);
  const userUsdcAta = await getAssociatedTokenAddress(usdcMint, user);
  const vaultAta = await getAssociatedTokenAddress(usdcMint, roundPda, true);

  return await program.methods
    .depositAny(new BN(roundId), usdcBalanceBefore, minOut)
    .accounts({
      user,
      config: getConfigPda(),
      round: roundPda,
      participant: getParticipantPda(roundPda, user),
      userUsdcAta,
      vaultUsdcAta: vaultAta,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
}

export async function buildLockRound(
  program: Program<Jackpot>,
  caller: PublicKey,
  roundId: number
): Promise<TransactionInstruction> {
  return await program.methods
    .lockRound(new BN(roundId))
    .accounts({
      caller,
      config: getConfigPda(),
      round: getRoundPda(roundId),
    })
    .instruction();
}

export async function buildMockSettle(
  program: Program<Jackpot>,
  admin: PublicKey,
  roundId: number,
  randomness: number[] // 32 bytes
): Promise<TransactionInstruction> {
  return await program.methods
    .mockSettle(new BN(roundId), randomness)
    .accounts({
      admin,
      config: getConfigPda(),
      round: getRoundPda(roundId),
    })
    .instruction();
}

// ─── VRF constants ─────────────────────────────────────────
const VRF_PROGRAM_ID = new PublicKey("Vrf1RNUjXmQGjmQrQLvJHs9SNkvDJEsRVFPkfSQUwGz");
const DEFAULT_QUEUE = new PublicKey("Cuj97ggrhhidhbu39TijNVqE74xvKJ69gDervRUXAxGh");
const SLOT_HASHES = new PublicKey("SysvarS1otHashes111111111111111111111111111");

export function getIdentityPda(): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("identity")],
    PROGRAM_ID
  );
  return pda;
}

export async function buildRequestVrf(
  program: Program<Jackpot>,
  payer: PublicKey,
  roundId: number
): Promise<TransactionInstruction> {
  return await program.methods
    .requestVrf(new BN(roundId))
    .accounts({
      payer,
      config: getConfigPda(),
      round: getRoundPda(roundId),
      programIdentity: getIdentityPda(),
      oracleQueue: DEFAULT_QUEUE,
      vrfProgram: VRF_PROGRAM_ID,
      slotHashes: SLOT_HASHES,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
}

export async function buildClaim(
  program: Program<Jackpot>,
  winner: PublicKey,
  roundId: number,
  usdcMint: PublicKey,
  treasuryUsdcAta: PublicKey,
  vrfPayer?: PublicKey
): Promise<TransactionInstruction> {
  const roundPda = getRoundPda(roundId);
  const vaultAta = await getAssociatedTokenAddress(usdcMint, roundPda, true);
  const winnerAta = await getAssociatedTokenAddress(usdcMint, winner);

  // VRF payer ATA: pass real ATA if vrfPayer is set, otherwise null (Anchor optional → None)
  let vrfPayerUsdcAta: PublicKey | null = null;
  if (vrfPayer && !vrfPayer.equals(PublicKey.default)) {
    vrfPayerUsdcAta = await getAssociatedTokenAddress(usdcMint, vrfPayer);
  }

  return await program.methods
    .claim(new BN(roundId))
    .accounts({
      winner,
      config: getConfigPda(),
      round: roundPda,
      vaultUsdcAta: vaultAta,
      winnerUsdcAta: winnerAta,
      treasuryUsdcAta,
      vrfPayerUsdcAta: vrfPayerUsdcAta as any,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();
}

export async function buildAutoClaim(
  program: Program<Jackpot>,
  payer: PublicKey,
  winner: PublicKey,
  roundId: number,
  usdcMint: PublicKey,
  treasuryUsdcAta: PublicKey,
  vrfPayer?: PublicKey
): Promise<TransactionInstruction> {
  const roundPda = getRoundPda(roundId);
  const vaultAta = await getAssociatedTokenAddress(usdcMint, roundPda, true);
  const winnerAta = await getAssociatedTokenAddress(usdcMint, winner);

  let vrfPayerUsdcAta: PublicKey | null = null;
  if (vrfPayer && !vrfPayer.equals(PublicKey.default)) {
    vrfPayerUsdcAta = await getAssociatedTokenAddress(usdcMint, vrfPayer);
  }

  return await program.methods
    .autoClaim(new BN(roundId))
    .accounts({
      payer,
      config: getConfigPda(),
      round: roundPda,
      vaultUsdcAta: vaultAta,
      winnerUsdcAta: winnerAta,
      treasuryUsdcAta,
      vrfPayerUsdcAta: vrfPayerUsdcAta as any,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();
}

export async function buildCancelRound(
  program: Program<Jackpot>,
  user: PublicKey,
  roundId: number,
  usdcMint: PublicKey
): Promise<TransactionInstruction> {
  const roundPda = getRoundPda(roundId);
  const vaultAta = await getAssociatedTokenAddress(usdcMint, roundPda, true);
  const userUsdcAta = await getAssociatedTokenAddress(usdcMint, user);

  return await program.methods
    .cancelRound(new BN(roundId))
    .accounts({
      user,
      config: getConfigPda(),
      round: roundPda,
      participant: getParticipantPda(roundPda, user),
      vaultUsdcAta: vaultAta,
      userUsdcAta,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();
}

export async function buildClaimRefund(
  program: Program<Jackpot>,
  user: PublicKey,
  roundId: number,
  usdcMint: PublicKey
): Promise<TransactionInstruction> {
  const roundPda = getRoundPda(roundId);
  const vaultAta = await getAssociatedTokenAddress(usdcMint, roundPda, true);
  const userUsdcAta = await getAssociatedTokenAddress(usdcMint, user);

  return await (program.methods as any)
    .claimRefund(new BN(roundId))
    .accounts({
      config: getConfigPda(),
      round: roundPda,
      user,
      participant: getParticipantPda(roundPda, user),
      vaultUsdcAta: vaultAta,
      userUsdcAta,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();
}

export async function buildTransferAdmin(
  program: Program<Jackpot>,
  admin: PublicKey,
  newAdmin: PublicKey
): Promise<TransactionInstruction> {
  return await (program.methods as any)
    .transferAdmin(newAdmin)
    .accounts({
      admin,
      config: getConfigPda(),
    })
    .instruction();
}

export async function buildSetTreasuryUsdcAta(
  program: Program<Jackpot>,
  admin: PublicKey,
  newTreasuryUsdcAta: PublicKey,
  expectedOwner: PublicKey
): Promise<TransactionInstruction> {
  return await (program.methods as any)
    .setTreasuryUsdcAta()
    .accounts({
      admin,
      config: getConfigPda(),
      newTreasuryUsdcAta,
      expectedOwner,
    })
    .instruction();
}

export async function buildCloseRound(
  program: Program<Jackpot>,
  payer: PublicKey,
  recipient: PublicKey,
  roundId: number,
  usdcMint: PublicKey
): Promise<TransactionInstruction> {
  const roundPda = getRoundPda(roundId);
  const vaultAta = await getAssociatedTokenAddress(usdcMint, roundPda, true);

  return await program.methods
    .closeRound(new BN(roundId))
    .accounts({
      payer,
      recipient,
      round: roundPda,
      vaultUsdcAta: vaultAta,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
}
