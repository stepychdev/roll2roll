# Demo Video Voiceover (~2 minutes, EN)

## Version 1 — Product demo pitch (~2:00)

**0:00 - 0:15**  
Hi, this is our Matrix Hackathon project: a fair, open, on-chain SocialFi roulette on Solana.  
We combine provably fair game mechanics, real DeFi assets, and degen-first UX.
On screen:
- `Home` page (`/`) overview: pot, wheel, deposit panel
- Wide UI sweep, no clicks yet

**0:15 - 0:35**  
Players can join a round not only with USDC, but with other supported tokens as well.  
We use Jupiter to route and swap those assets into USDC before entering the pot.  
So DeFi actions are part of the game loop itself, not just a side integration.
On screen:
- `DepositPanel` on `Home`
- Token selector (e.g. `SOL` or another token), amount input
- Jupiter quote preview (`X -> USDC via Jupiter`)
- Click `DEPOSIT ...` or `DEPOSIT BATCH (...)`
- Optional: Phantom signature popup(s)

**0:35 - 0:55**  
Once players join, they see the live pot, real-time odds, the probability wheel, and social activity.  
Winner selection is powered by VRF, so outcomes are provably fair and verifiable on-chain.  
Fairness, on-chain transparency, and openness are core product principles for us.
On screen:
- `Home` after deposit: pot updates, `Your Chance`, `ParticipantsList`, `JackpotWheel`
- Briefly show chat / live activity
- Switch to `Round Detail` / history entry and show `Provably Fair` / `VRF randomness`
- Alternatively show Solscan/round details with round-related proof fields

**0:55 - 1:15**  
Winners can claim in classic USDC mode, or use Degen Mode.  
In our current lite degen mode, the token is deterministically derived from the round VRF, with no reroll, and then swapped via Jupiter after claim.  
This makes the degen UX much fairer than simple frontend randomness.
On screen:
- `WinnerModal`
- Toggle `USDC` / `DEGEN MODE`
- Show hidden token preview behavior (`Hidden until claim`) in VRF-seeded mode
- Click `CLAIM DEGEN`
- Show Phantom windows for two signatures (claim + swap)

**1:15 - 1:35**  
We also built a multi-token batch deposit MVP.  
If a user wants to enter with multiple tokens, the app can batch the flow.  
And if the transaction becomes too large for Solana packet limits, we automatically split it into multiple transactions and show progress to the user.
On screen:
- Batch UI in `DepositPanel` (`Add to Batch`, `Batch (N/N)`, `DEPOSIT BATCH`)
- If available, show progress text: `Preparing batch deposit...`, `Sending batch part ...`
- Optional: show oversized batch example and explain auto-split behavior

**1:35 - 1:50**  
This is not just a UI prototype.  
We have Anchor tests for on-chain logic, frontend and crank tests, mainnet smoke checks, and Squads multisig governance for admin and upgrade safety.  
We want degen UX on top of a safe and auditable protocol core.
On screen:
- Terminal with passing tests (`npm test`)
- `MAINNET_AUDIT.md` / `OPS_RUNBOOK.md`
- `addresses.mainnet.json` snippet (Ops/Upgrade multisig + timelock)
- Optional: Squads tx screenshots/logs

**1:50 - 2:10**  
Our roadmap includes a strict on-chain degen claim flow, reduced degen fees, Pinocchio migration for hot paths, ATA cleanup UX, missions with JUP rewards, referral rewards with low-cost payout rails, Solana Actions for AI agents, Solana Blinks, clans, custom rooms, and sponsored single-coin rooms.  
Our focus is fair, on-chain, open, SocialFi-native gameplay with degen energy and nearly unlimited monetization formats.
On screen:
- Roadmap slide (large readable bullets)
- Optional backing visuals: `README_JUDGES_MATRIX.md` / product UI
- Final shot: `Home` page + project name/logo

---

## Version 2 — Faster hackathon pitch (~2:00)

Suggested edit timeline for Version 2:
- 0:00–0:20 `Home` overview (pot / wheel / deposit)
- 0:20–0:40 Jupiter deposit flow
- 0:40–1:00 social UI (participants, chat, history)
- 1:00–1:20 VRF / provably fair round details (RoundDetail or Solscan)
- 1:20–1:40 WinnerModal + degen mode + two-signature flow
- 1:40–2:00 batch deposit + tests/smoke/multisig snippets + roadmap slide

We built a fair, open, on-chain SocialFi roulette on Solana.  
Users can enter with USDC or other tokens through Jupiter routing, compete in a shared pot, and win through VRF-based settlement.

The key idea is turning DeFi into a game loop:
deposit, live social participation, verifiable randomness, claim, and optional degen post-claim behavior.

This is not a mockup.  
The round state, settlement, and payouts are on-chain, and we operate with multisig governance, tests, and smoke checks.

We also added a degen mode claim flow.  
Today it is a lite version: the token is selected deterministically from round VRF, with no reroll, and then swapped via Jupiter after claim.  
That already improves fairness and openness in the UX while keeping the product shippable.

For better mobile and user experience, we built multi-token batch deposits and automatic splitting when transactions exceed Solana size limits.  
The product is naturally mobile-first because sessions are short, social, and high-frequency.

In the roadmap, we expand into stricter on-chain degen claims, reduced degen fees, Pinocchio for performance-critical paths, JUP-reward missions, AI-agent actions, Solana Blinks, clans, custom user-configured rooms, sponsored single-coin rooms, and prediction-share based formats.

Our thesis is simple: a fair and open on-chain core can support a huge range of SocialFi and degen monetization formats.
