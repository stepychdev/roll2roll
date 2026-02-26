<p align="center">
  <h1 align="center">Roll2Roll</h1>
  <p align="center">
    <strong>Throw in your tokens. One wallet walks away with everything.</strong>
  </p>
  <p align="center">
    <a href="https://casino-rho-lime.vercel.app">Live Demo</a> &nbsp;·&nbsp;
    <a href="https://explorer.solana.com/address/4PhNzNQ7XZAPrFmwcBFMe2ZY8ZaQWos8nJjcsjv1CHyh?cluster=devnet">On-Chain Program</a> &nbsp;·&nbsp;
    <a href="#test-wallets">Test Wallets</a>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/devnet-live-brightgreen?style=flat-square" />
    <img src="https://img.shields.io/badge/Anchor-0.31.1-blue?style=flat-square" />
    <img src="https://img.shields.io/badge/VRF-MagicBlock-purple?style=flat-square" />
    <img src="https://img.shields.io/badge/Swaps-Jupiter-orange?style=flat-square" />
  </p>
</p>

<br />

## Quick Navigation

[The Idea](#the-idea) · [How It Works](#how-it-works) · [Native Tokens, Not Stablecoins](#native-tokens-not-stablecoins) · [Degen Claim Mode](#-degen-claim-mode--jupiter) · [Key Features](#key-features) · [Architecture](#architecture) · [Business Model](#business-model) · [Growth](#growth-strategy) · [Roadmap](#roadmap) · [Tech Stack](#tech-stack) · [Try It](#try-it) · [Test Wallets](#test-wallets) · [Security](#security)

---

<br />

## The Idea

This is not a USDC roulette. This is not a slot machine with a blockchain label on it.

**Roll2Roll is a native-token social arena.**

Players throw in SOL, BONK, WIF, JTO, POPCAT — whatever they're holding — into a shared pot. The protocol normalizes everything to fair ticket values via Jupiter. One random winner takes it all. Every step is on-chain, every outcome is verifiable, every round is public.

The twist: **the winner doesn't just get boring stablecoins back.** In Degen Claim Mode, the payout is routed into a random token — turning every round into a "what did I just win?" moment that's built for clips, streams, and Twitter posts.

> Think CS:GO roulette meets Solana-native token culture.

<br />

## How It Works

```
 ① DEPOSIT          ② LOCK            ③ VRF              ④ PAYOUT
 ────────────       ────────────      ────────────       ────────────

 Throw in any       Timer hits        MagicBlock VRF     Winner takes
 SPL token:         zero — round      delivers on-chain  the entire pot
 SOL, BONK, WIF,    freezes.          randomness.
 JTO, anything.     No more           Fenwick tree       Default: USDC
                    deposits.         finds winner       Degen mode:
 Jupiter swaps                        in O(log n).       random token(s)
 to USDC. $1 = 1
 ticket.
```

**That's it.** No accounts to create, no KYC, no waiting. Connect wallet, pick tokens, deposit, watch the round.

<br />

## Native Tokens, Not Stablecoins

Most on-chain roulettes force you to convert your tokens to USDC first, play a sterile number game, and withdraw USDC. That's boring. It ignores what makes crypto culture interesting — **the tokens themselves.**

We flip this:

**Deposit side** — bring whatever you're holding. Don't sell your BONK to buy USDC to play. Just throw in your BONK directly. Jupiter handles the conversion inside the same atomic transaction.

**Claim side** — the winner doesn't have to receive USDC. In Degen Claim Mode, the payout is routed through Jupiter into a random token (or a random basket). You might win 500 USDC worth of... WIF. Or POPCAT. Or something you've never heard of.

This creates moments:
- "I threw in 2 SOL and won $3,000 in BONK"
- "Bro just won a bag of [random token] live on stream"
- Clips. Memes. Posts. Organic traffic.

**The token IS the content.** Not the number.

<br />

## Degen Claim Mode — Jupiter

<table>
<tr>
<td width="50%">

### Standard Mode

Winner receives USDC.
Simple, predictable, safe.

Good for conservative players
and high-value rounds.

</td>
<td width="50%">

### Degen Mode

Winner receives a **random token**
routed via Jupiter.

Could be SOL. Could be BONK.
Could be something wild.

Built for content, streams, clips.
**This is the main mode.**

</td>
</tr>
</table>

**Guardrails:**
- Liquidity checks before routing (no illiquid rugs)
- Slippage & price impact caps
- Curated token universe (or open with filters)
- Fallback to USDC if routing fails

**Why this matters for Jupiter:**
Every degen claim is a Jupiter swap. More rounds = more volume = more swap fees. The product becomes a **native distribution channel for Jupiter liquidity.**

<br />

## Key Features

<table>
<tr>
<td width="50%">

### Provably Fair — MagicBlock VRF

No server seed. No trusted third party.
On-chain VRF oracle delivers randomness.
Winner found via **Fenwick tree** — O(log n).
Every tx visible in Solana explorer.

</td>
<td width="50%">

### Any-Token Entry — Jupiter

Deposit SOL, BONK, JTO, WIF — anything.
Jupiter Metis swaps to USDC atomically.
Swap + deposit in **one VersionedTransaction**.
Tickets based on actual USDC received.

</td>
</tr>
<tr>
<td>

### Auto-Claim & Auto-Round

Winner paid automatically — no manual claim.
Next round starts immediately.
No downtime between rounds.

</td>
<td>

### Fully On-Chain

All state on Solana — round, pot, tickets.
Per-round vault owned by Round PDA.
~21KB Round account, zero-copy deserialization.
No backend needed for correctness.

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
│   claim           mock_settle     update_config │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │  Round PDA  (~21KB, zero-copy)          │   │
│   │  participants[256]  ·  Fenwick bit[257] │   │
│   │  vault: PDA-owned USDC ATA              │   │
│   └─────────────────────────────────────────┘   │
└──────────┬──────────────────────┬───────────────┘
           ▼                      ▼
   MagicBlock VRF           Jupiter Metis
   (randomness)             (token swaps)
```

<br />

## Business Model

```
  Protocol fee:  0.25% of every pot (to treasury)
  VRF cost:      Fixed reimbursement from pot (currently 0.20 USDC) to the VRF payer
  House edge:    No hidden spread / no odds manipulation
  Alignment:     Bigger pots → more revenue → better for everyone

  Example:       100 players × $50 avg = $5,000 pot → $12.50 protocol fee (+ VRF reimbursement)
  At scale:      1,000 rounds/day × $5,000 avg = $12,500/day in fees
```

No manipulation of odds or hidden spread. In addition to the protocol fee, each round reimburses the VRF request payer (currently fixed at 0.20 USDC) from the pot. All payout deductions are explicit and on-chain.

<br />

## Growth Strategy

This product is **designed to spread itself:**

| Channel | Why it works |
|---------|-------------|
| **Organic clips** | "I won $3K in random BONK" — that's a tweet, a clip, a TikTok |
| **Streamers** | Live rounds are watchable content. Degen claims = reaction moments |
| **Referrals** | Share link → earn % of referred deposits' fee |
| **Token communities** | BONK community? WIF community? They'll play rounds with their tokens |
| **Sponsored rounds** | Projects can sponsor pots — instant distribution to active users |

The key insight: **the token randomness IS the marketing.**
Every degen claim creates a shareable moment without spending a dollar on ads.

<br />

## Roadmap

| Now (MVP) | Next | Later |
|-----------|------|-------|
| Multi-token deposits via Jupiter | **Degen Claim Mode** (random token payout) | Prediction market (bet on winner's ticket range) |
| MagicBlock VRF winner selection | In-round live chat | Team/clan rounds |
| Auto-claim + auto-round | User profiles + round history | Mobile PWA |
| Provably fair verification | Referral system | Sponsored/branded rounds |
| Devnet deployment | Multi-round (parallel tiers) | Token-community rooms |

<br />

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | Anchor 0.31.1 · Rust · zero-copy accounts |
| Randomness | MagicBlock Ephemeral VRF (`ephemeral-vrf-sdk 0.2.3`) |
| Token Swaps | Jupiter Metis Swap API v1 |
| Frontend | React 18 · TypeScript · Vite · Tailwind CSS |
| Wallet | Solana Wallet Adapter |
| Token Metadata | Metaplex UMI |

<br />

## On-Chain Program

```
Program ID:     4PhNzNQ7XZAPrFmwcBFMe2ZY8ZaQWos8nJjcsjv1CHyh
VRF Program:    Vrf1RNUjXmQGjmQrQLvJHs9SNkvDJEsRVFPkfSQUwGz  (MagicBlock)
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

<br />

## Try It

**Live:** [casino-rho-lime.vercel.app](https://casino-rho-lime.vercel.app)

**Or run locally:**

```bash
npm install
cp .env.example .env    # pre-configured: devnet service wallet + Jupiter API key
npm run dev
```

<br />

<h2 id="test-wallets">Test Wallets</h2>

Pre-funded devnet wallets — **2 SOL + 500 USDC** each.

**How to use:** Phantom → Settings → Add Wallet → Import Seed Phrase → switch network to **Devnet**

| # | Seed Phrase | Address |
|---|-------------|---------|
| 1 | `carpet olive segment axis sister february address toward traffic tobacco betray crew` | `HeDn1R...LPFG` |
| 2 | `wet unusual trip peanut ginger amount define begin issue genius true inflict` | `CmVhfR...xBNY` |
| 3 | `false olive retire judge company fortune peasant focus side left paper video` | `DboyYQ...SDTn` |

> Devnet only. No real value.

<br />

## Hackathon Tracks

- **Graveyard Hack** — MagicBlock Gaming track
- **Matrix / Play Solana** — MagicBlock track + Jupiter track

<br />

## Security

| Invariant | How it's enforced |
|-----------|-------------------|
| **Vault isolation** | Per-round USDC vault owned by Round PDA — only program moves funds |
| **Delta-based deposits** | `deposit_any` checks actual USDC balance change, not user-supplied amounts |
| **VRF authentication** | Callback verifies MagicBlock `VRF_PROGRAM_IDENTITY` as signer |
| **Winner enforcement** | Claim requires `signer == round.winner` |
| **One-way state machine** | `Open → Locked → VrfRequested → Settled → Claimed` — no rollbacks |
| **Fee transparency** | Fee taken only at claim, sent to configured treasury ATA |

<br />

## License

MIT
