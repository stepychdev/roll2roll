# README for Matrix Hackathon Judges

## Project Summary
**Jackpot SocialFi Roulette** is a fair, open, on-chain SocialFi jackpot game on Solana that combines:
- provably fair randomness (VRF)
- Jupiter-powered token swaps for deposits and degen claims
- social gameplay loops (live feed, wheel, chat, history)

Users can join a shared jackpot round with USDC or other tokens (swapped to USDC), watch their probability update in real time, and claim winnings in classic USDC mode or a degen claim flow.

## Why This Is Interesting
- **On-chain game logic** with transparent and open state
- **Real DeFi activity** integrated into gameplay via Jupiter
- **SocialFi + FOMO** mechanics (live participation, visible pot, wheel, chat)
- **Mobile-friendly UX** and degen claim flows
- **Open, auditable product behavior** (verifiable settlement, visible on-chain state)

## What Is Live / Working
### Core game
- Start rounds / deposits / lock / winner settlement / claims / refunds
- VRF-based winner selection
- Refund and admin force-cancel paths
- Crank automation for round progression and cleanup

### Jupiter integrations
- Any-token deposits (swap to USDC before deposit)
- Degen claim mode (claim in USDC, then swap via Jupiter)
- Multi-token batch deposit MVP (with oversized transaction auto-splitting)

### UX / Product
- Probability wheel
- Live participant feed
- Round history
- Chat
- Missions / gamification hooks (roadmap includes `JUP` mission rewards)

### Safety / Ops
- Squads multisig for admin and upgrades
- Separated governance roles (Ops vs Upgrade authority paths)
- Upgrade discipline with timelock process on mainnet
- Mainnet runbooks and smoke checks
- Test coverage across on-chain, crank, frontend, scripts

We intentionally position the protocol as **safe, fair, open, and auditable first**, with degen UX layered on top.

## Current Degen Mode (Important / Honest Note)
Current `lite` degen mode is:
- **VRF-seeded** (token selection derived from round VRF)
- **No reroll** in VRF-seeded mode
- **Token hidden in UI before claim** (UX concealment)

But:
- The actual payout still uses current claim flow (`claim` -> USDC), then Jupiter swap on the client
- So this is **not yet on-chain-enforced degen commitment**

## Planned Upgrades (Designed, not fully implemented yet)
### 1) Dedicated Degen Claim Contract Flow
- Separate on-chain `degen commit` / `degen execute`
- No path back to USDC once degen mode is chosen

### 2) Reduced fee for degen claims
- Separate fee config for:
  - classic claim
  - degen claim

### 3) Additional Jupiter-native gamified assets
- Tokenized stock assets (future Jupiter-routable deposits)
- Prediction market share deposits (Jupiter PM ecosystem integrations)

### 4) Referral program
- Organic user growth and social compounding loops
- Planned MVP path includes low-cost reward distribution using light/compressed token-style payouts to reduce payout costs and network load

### 5) Pinocchio migration for performance-critical paths
- Reduce compute overhead on hot on-chain paths
- Improve low-level control, performance, and execution efficiency

### 6) Empty ATA cleanup / rent recovery UX
- User-safe token account cleanup flows
- Better post-swap UX and rent recovery

### 7) AI agent interactions via Solana Actions
- Agent-assisted game interactions, missions, and notifications
- Action-first integrations for distribution and automation

### 8) Solana Blinks distribution UX
- Play/interact with rounds from other websites and social surfaces
- Lower friction and stronger mobile-native sharing loops

### 9) Clans / teams
- Community competition formats and team identity
- Team leaderboards and recurring social loops

### 10) Private sponsored single-coin rooms
- Branded rooms with one accepted coin only
- Winnings paid in the same coin
- Strong sponsor activations and token-community campaigns

### 11) Custom user-configured rooms
- User-created rooms with configurable rules (entry coin, payout coin policy, timers, limits, access)
- Opens up community-led formats and experimentation

### 12) Prediction-share based formats
- Gamified room formats around prediction market shares / themed rounds

### 13) Creator / streamer mode
- Branded creator/community rooms
- Affiliate/referral links and shareable Blink-based entry flows

### 14) Sponsor analytics / campaign dashboard
- Sponsor-facing analytics for token campaigns and private rooms
- Performance metrics for activations, engagement, and retention

### 15) Risk policy transparency page
- Public display of price impact / fallback / route policy decisions
- Product-level openness around risk controls

### 16) Protocol transparency page
- Live stats, treasury flow, fee behavior, multisig roles/addresses, recent upgrades
- Makes the protocol easier to audit and trust

## Strengths (What we believe we did well)
- Strong blend of **on-chain fairness** + **DeFi usability**
- Jupiter integrated into actual game loop, not just a demo swap button
- Clear social loop and replayability (`fair + onchain + degen + fomo + socialfi + openness`)
- Operational readiness mindset (multisig, tests, smoke checks)
- Security-first protocol posture (governance separation, upgrade discipline, auditable ops)
- Mobile-first fit with short session cycles and wallet-native interactions

## Limitations / Tradeoffs (What we know)
- Some degen flows are still client-orchestrated (not fully on-chain enforced)
- Heavy multi-token Jupiter routes can exceed Solana tx size limits (we added auto-splitting)
- Full degen-commit+VRF+executor flow requires a contract upgrade and more state-machine complexity
- Some roadmap integrations (Blinks, Solana Actions agents, sponsor rooms, clans) are planned but not yet shipped
- Some reward/distribution ideas (e.g. compressed/light token payout rails) are roadmap items, not current production payout infrastructure
- Some transparency/partner tooling (dashboard pages) is roadmap UX, not current core gameplay functionality

## Monetization Flexibility (Core Product Advantage)
We intentionally designed the game format to support many monetization models without changing the core fair/on-chain jackpot logic:
- public rounds
- degen claim fee modes
- sponsored/private rooms
- custom user-configured rooms
- creator / streamer rooms
- token-specific campaigns
- prediction-share themed formats
- sponsor analytics / campaign tooling
- referral loops
- missions with token rewards (e.g. JUP)
- clan/team competitions
- future prediction/stock-themed rooms

This gives the product a large surface area for experimentation while preserving the same fair and open settlement core.

## What to Test (Fast Demo Checklist)
1. Join a round with USDC
2. Join with a non-USDC token (Jupiter swap path)
3. Observe live wheel and participant list updates
4. Let a round settle and claim the prize
5. Try `Degen Mode` claim (VRF-seeded lite version)

## Architecture at a Glance
- **On-chain**: Anchor jackpot program (round state, deposits, settlement, claims/refunds)
- **Randomness**: VRF-backed winner selection
- **DeFi routing**: Jupiter APIs + swap instructions
- **Automation**: Crank service
- **Governance/Ops**: Squads multisig

## Repository Pointers
- Product overview: `README.md`
- Architecture: `ARCHITECTURE.md`
- Ops: `OPS_RUNBOOK.md`
- Mainnet rollout/audit notes: `MAINNET_ROLLOUT.md`, `MAINNET_AUDIT.md`
- On-chain program: `jackpot_anchor_v4/`
- Frontend: `src/`
- Crank: `crank/`

## Final Note for Judges
This submission is intentionally positioned as a real, extensible product foundation rather than a one-off hackathon mockup.  
We prioritized fairness, on-chain transparency, openness, operability, and a credible path to deeper degen/social mechanics over flashy but fragile architecture.
