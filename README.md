<p align="center">
  <h1 align="center">Jackpot</h1>
  <p align="center">
    <strong>Provably fair on-chain social jackpot on Solana</strong>
  </p>
  <p align="center">
    Deposit any token &nbsp;·&nbsp; One winner takes the pot &nbsp;·&nbsp; Verified by math, not trust
  </p>
  <p align="center">
    <a href="https://explorer.solana.com/address/3wi11KBqF3Qa7JPP6CH4AFrcXbvaYEXMsEr9cmWQy8Zj">
      <img src="https://img.shields.io/badge/mainnet-live-brightgreen?style=flat-square" alt="Mainnet" />
    </a>
    &nbsp;
    <a href="https://explorer.solana.com/address/4PhNzNQ7XZAPrFmwcBFMe2ZY8ZaQWos8nJjcsjv1CHyh?cluster=devnet">
      <img src="https://img.shields.io/badge/devnet-live-blue?style=flat-square" alt="Devnet" />
    </a>
    &nbsp;
    <img src="https://img.shields.io/badge/Anchor-0.31.1-blue?style=flat-square" alt="Anchor" />
    &nbsp;
    <img src="https://img.shields.io/badge/VRF-MagicBlock-purple?style=flat-square" alt="MagicBlock VRF" />
    &nbsp;
    <img src="https://img.shields.io/badge/Swaps-Jupiter-orange?style=flat-square" alt="Jupiter" />
  </p>
</p>

<br />

<!-- ![screenshot](./docs/screenshot.png) -->

## TL;DR

Players deposit **any SPL token** into a shared pot.
Tokens are **auto-swapped to USDC** via Jupiter — right inside the same transaction.
Each **$1 = 1 ticket**. More tickets = higher chance.
When the timer ends, **MagicBlock VRF** picks a random ticket.
The winner **auto-receives the entire pot**. That's it.

> No backend. No house edge on odds. Every step — on-chain, verifiable in explorer.

<br />

## How a Round Works

```
 ① START         ② DEPOSIT        ③ LOCK          ④ VRF            ⑤ PAYOUT
 ─────────       ─────────        ─────────       ─────────        ─────────

 New round       Players send     Timer hits      MagicBlock       Winner gets
 opens with      any token →      zero →          delivers a       the whole
 a countdown     Jupiter swaps    round freezes   random number    pot (−0.25%)
 timer           to USDC →                        →
                 tickets issued                   Fenwick tree
                                                  finds winner
                                                  in O(log n)
```

<br />

## Key Features

<table>
<tr>
<td width="50%">

### Provably Fair &nbsp;—&nbsp; MagicBlock VRF

No server seed, no trusted party.
Randomness from MagicBlock's on-chain VRF oracle.
Winner found via **Fenwick tree** — O(log n), fully on-chain.
Every tx visible in Solana explorer.

</td>
<td width="50%">

### Any-Token Deposits &nbsp;—&nbsp; Jupiter

Deposit SOL, BONK, JTO, WIF — anything.
Jupiter Metis swaps to USDC atomically.
Swap + deposit in **one VersionedTransaction**.
Tickets based on actual USDC received, not estimates.

</td>
</tr>
<tr>
<td>

### Auto-Claim

Winner is paid automatically — no manual step.
Fee collected and sent to treasury in the same tx.
New round starts immediately after.

</td>
<td>

### Fully On-Chain

All state lives on Solana — round, pot, tickets.
Per-round USDC vault owned by Round PDA.
~21KB Round account with zero-copy deserialization.
No backend required for correctness.

</td>
</tr>
</table>

<br />

## Architecture

```
┌─ Frontend (React + Vite) ─────────────────────┐
│                                                │
│   Wallet Adapter          Jupiter Metis API    │
│   (Phantom, Solflare)     (quote → swap)       │
│        │                       │               │
│        └───────┐  ┌────────────┘               │
│                ▼  ▼                             │
│           Anchor Client                        │
└────────────────┬───────────────────────────────┘
                 │ RPC
                 ▼
┌─ On-Chain Program (Anchor 0.31.1) ─────────────┐
│                                                 │
│   init_config     start_round     deposit_any   │
│   lock_round      request_vrf     vrf_callback  │
│   claim           auto_claim      cancel_round  │
│   claim_refund    close_round     update_config │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │  Round PDA  (~21KB, zero-copy)          │   │
│   │  participants[200]  ·  Fenwick bit[201] │   │
│   │  vault: PDA-owned USDC ATA              │   │
│   └─────────────────────────────────────────┘   │
└──────────┬──────────┬───────────┬───────────────┘
           ▼          ▼           ▼
   MagicBlock VRF  Jupiter    Crank Service
   (randomness)    (swaps)    (auto-lifecycle)
```

<br />

## Business Model

```
  Protocol fee:  0.25% of every pot (to treasury)
  VRF cost:      Fixed reimbursement from pot (currently 0.20 USDC) to the VRF payer
  House edge:    No hidden spread / no odds manipulation
  Alignment:     Bigger pots = more revenue = better for everyone

  Example:       100 players × $50 avg = $5,000 pot → $12.50 protocol fee (+ VRF reimbursement)
```

The platform takes a small, transparent protocol fee. In addition, the round reimburses the VRF request payer (currently fixed at 0.20 USDC) from the pot. No manipulation of odds or hidden spread — all payout deductions are explicit and on-chain.

<br />

## Growth Strategy

| Channel | How |
|---------|-----|
| **Referrals** | Share links, earn % of referred deposits' fee |
| **Streamers** | Twitch / YouTube / Twitter creators streaming live rounds |
| **Organic virality** | Big wins → clips → screenshots → traffic |
| **Community** | Themed rounds, tournaments, events |

<br />

## Roadmap

| Feature | Description |
|---------|-------------|
| **Jupiter Claim Mode** | Winner claims in random token(s) — degen mode that pumps random coins |
| **On-site chat** | Real-time chat during rounds |
| **Prediction market** | Side bets on winner's ticket range (0–10, 10–20, 20–50, 50–100, 100+) |
| **Mobile PWA** | Mobile-optimized progressive web app |
| **Multi-round** | Parallel rounds with different buy-in tiers |

<br />

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | Anchor 0.31.1 · Rust · zero-copy accounts |
| Randomness | MagicBlock Ephemeral VRF (`ephemeral-vrf-sdk 0.2.3`) |
| Token Swaps | Jupiter Metis Swap API (v1) |
| Frontend | React 18 · TypeScript · Vite · Tailwind CSS |
| Wallet | Solana Wallet Adapter (Phantom, Solflare, etc.) |
| Token Metadata | Metaplex Token Metadata (UMI) |

<br />

## Security & Governance

This codebase has undergone **internal security review and hardening**, including:

- Cancel/refund flow safety improvements
- `claim_refund` self-service flow
- `close_participant` safeguards to prevent premature closure in cancelled rounds
- Admin/upgrade authority migration to **Squads V4 multisig** (2-of-3, validated on devnet and mainnet)
- Dedicated **crank service** — no private keys in the browser bundle
- Crank reliability: cleanup retries, backfill on restart, stuck-round observability
- Smoke tests for governance paths (`Ops` and `Upgrade` multisig execution)
- e2e coverage for the `force_cancel -> refund -> cleanup` flow

<br />

## On-Chain Program

```
Mainnet Program:  3wi11KBqF3Qa7JPP6CH4AFrcXbvaYEXMsEr9cmWQy8Zj
Devnet Program:   4PhNzNQ7XZAPrFmwcBFMe2ZY8ZaQWos8nJjcsjv1CHyh
VRF Program:      Vrf1RNUjXmQGjmQrQLvJHs9SNkvDJEsRVFPkfSQUwGz  (MagicBlock)
```

| Instruction | What it does |
|-------------|-------------|
| `init_config` | Set fee, ticket unit, round duration |
| `start_round` | Create round + USDC vault (owner = Round PDA) |
| `deposit_any` | Deposit USDC (direct or post-swap), update Fenwick tree |
| `lock_round` | Lock round when timer expires |
| `request_vrf` | CPI to MagicBlock VRF |
| `vrf_callback` | Receive randomness, pick winner |
| `claim` | Pay winner, reimburse VRF payer (if applicable), send fee to treasury |
| `mock_settle` | Devnet fallback (pseudo-random) |
| `update_config` | Admin parameter updates |

<br />

## Quick Start

**Prerequisites:** Node.js 18+ · Solana CLI · Anchor 0.31.1

```bash
# 1. Frontend
npm install
cp .env.example .env    # fill in your API keys and RPC URL
npm run dev             # devnet by default

# 2. Crank service (automated round lifecycle)
cd crank
npm install
cp .env.example .env    # fill in RPC and keypair path
npm run start

# 3. Smart contract (optional — already deployed on devnet & mainnet)
cd jackpot_anchor_v4
anchor build -- --features devnet
anchor deploy --provider.cluster devnet

# 4. Mint test USDC (devnet only)
npx tsx scripts/mint_test_usdc.ts <WALLET_ADDRESS>
```

> Copy `.env.example` files and fill in your keys before running.

<br />

## Test Wallets for Judges

Pre-funded devnet wallets. Each has **2 SOL + 500 USDC**.

Import seed phrase into Phantom:
**Settings → Add Wallet → Import → Seed Phrase → switch to Devnet**

| # | Seed Phrase | Address |
|---|-------------|---------|
| 1 | `carpet olive segment axis sister february address toward traffic tobacco betray crew` | `HeDn1R...LPFG` |
| 2 | `wet unusual trip peanut ginger amount define begin issue genius true inflict` | `CmVhfR...xBNY` |
| 3 | `false olive retire judge company fortune peasant focus side left paper video` | `DboyYQ...SDTn` |

> Devnet only — no real value. Do not send mainnet funds.

<br />

## Hackathon Tracks

- **Graveyard Hack** — MagicBlock Gaming track
- **Matrix / Play Solana** — MagicBlock track + Jupiter track

<br />

## Security

| Invariant | How |
|-----------|-----|
| **Vault isolation** | Per-round USDC vault owned by Round PDA; only program can move funds |
| **Delta-based deposits** | `deposit_any` checks actual USDC balance change, not user input |
| **VRF authentication** | Callback verifies MagicBlock `VRF_PROGRAM_IDENTITY` as signer |
| **Winner enforcement** | Claim requires `signer == round.winner` |
| **One-way state machine** | `Open → Locked → VrfRequested → Settled → Claimed` — no rollbacks |
| **Fee transparency** | Fee taken only at claim, sent to configured treasury ATA |

<br />

## License

MIT
