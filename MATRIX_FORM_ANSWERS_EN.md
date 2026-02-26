# Matrix Hackathon Form Answers (EN, Copy/Paste Ready)

## Demo Video URL
Paste your public YouTube/Vimeo URL here after upload.

Example:
`https://youtube.com/watch?v=YOUR_VIDEO_ID`

---

## Project Name
**Roll2Roll SocialFi Roulette**

Alternative (more brand-forward):
**Roll2Roll: SocialFi Roulette**

---

## Category
`Other`

---

## Project Description (Long Form)
Roll2Roll SocialFi Roulette is a fair, open, on-chain SocialFi roulette game on Solana that turns DeFi actions into a replayable game loop.

Players can join a jackpot round with USDC or other supported tokens. Non-USDC assets are routed through Jupiter and converted into USDC before entering the pot. As users join, the UI updates the live pot, player distribution, and winning probabilities in real time.

Winners are selected using verifiable randomness (VRF), making outcomes transparent and auditable on-chain. Winners can claim in classic USDC mode or use our degen claim mode, which uses a Jupiter-powered post-claim swap for a more gamified payout experience. Our current lite degen mode is VRF-seeded (deterministic token selection from round randomness), no-reroll, and designed to preserve fairness and openness in the UX.

What makes the project unique:
- provably fair on-chain roulette mechanics
- Jupiter-powered token entry and degen claim flows
- SocialFi gameplay loops (live feed, wheel, chat, history)
- mobile-friendly UX and batch deposit flows
- production-oriented ops and safety posture (multisig governance, runbooks, smoke checks, tests)

This is built as a real product foundation with a clear roadmap toward stricter on-chain degen claim mechanics, richer social room formats, and scalable gamified DeFi integrations.

---

## Project Description (Shorter Version, if field is limited)
A fair, open, on-chain SocialFi roulette on Solana where users join with USDC or other tokens via Jupiter swaps, compete in a shared pot, and winners are selected by VRF. Includes degen claim UX, batch deposits, and a mobile-first game loop with real on-chain state and strong ops/testing foundations.

---

## PSG1 Integration
Our project is built as a Solana-native on-chain game experience and aligns with PSG1-style infrastructure principles: transparent state, verifiable outcomes, and wallet-native interactions.

PSG1 / Solana integration includes:
- Solana on-chain game state (rounds, deposits, settlement, claims, refunds)
- Anchor-based smart contract logic
- VRF-based winner selection (provably fair randomness)
- Wallet-native gameplay transactions and signing
- Jupiter-powered asset routing for participation and degen claims
- Verifiable on-chain state and operational transparency (multisig governance, visible addresses, runbooks)

This is not a menu-only demo. The core gameplay loop itself is on-chain and tied directly to real Solana asset actions.

---

## Tech Stack
Solana, Anchor, Rust, React, TypeScript, Vite, Tailwind CSS, Jupiter API, @solana/web3.js, SPL Token, Squads Multisig, Firebase, Vitest

---

## Matrix Tracks (Recommended Selection)
### Recommended (Strong fit)
- ✅ PSG1-first Track by Play Solana
- ✅ Gamification, DeFi and Mobile Adventures by Jupiter

### Optional (Only if you want to signal roadmap fit and can explain it clearly)
- ⚠️ Solana On-chain and Real-time Gaming by MagicBlock

Suggested wording if selecting MagicBlock too:
> Current submission is intentionally L1-first for fairness, safety, and Jupiter compatibility. MagicBlock is part of our roadmap for future real-time execution and expanded game mechanics.

---

## Extra Notes (If there is any “Additional info” field)
### Product principles
We intentionally design around:
- fairness
- on-chain execution
- openness / transparency
- SocialFi loops
- degen/FOMO UX

### Security and safety posture
Security is a core product trait, not an afterthought:
- multisig governance separation (Ops vs Upgrade roles)
- upgrade timelock discipline
- tested refund/cancel/cleanup paths
- transparent and auditable on-chain state

### Roadmap highlights
- strict on-chain degen claim flow (commit/execute)
- reduced fee for degen claims
- Pinocchio migration for performance-critical paths
- empty ATA cleanup / rent recovery UX
- AI agents via Solana Actions
- Solana Blinks distribution
- clans / teams / sponsor rooms / custom user-configured rooms
- missions with token rewards (e.g. JUP)
- tokenized equities and prediction-share based formats (future)

