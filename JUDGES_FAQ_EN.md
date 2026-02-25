# Judges FAQ (Hard Questions) — Matrix Hackathon

## 1) Is the winner selection actually fair and on-chain?
Yes.
- Winner selection is based on VRF-backed randomness.
- Round state, settlement, claims, and refunds are on-chain.
- The protocol state is verifiable and auditable on Solana.

## 2) Is your current Degen Mode fully on-chain-enforced?
Not yet.
- Current submission uses a **lite degen mode**:
  - token selection is deterministic (VRF-seeded) and no-reroll in seeded mode
  - payout path is still `claim USDC -> Jupiter swap` on the client
- This improves fairness and UX immediately without blocking shipping.
- A strict on-chain `degen commit / degen execute` flow is in roadmap.

## 3) Why not fully enforce degen mode on-chain now?
We prioritized:
- a shippable, testable MVP
- a fair on-chain core (winner settlement)
- production safety and operability

Fully enforcing degen mode requires a more complex state machine:
- degen commit state
- claim path restrictions
- async execution/retry lifecycle
- stronger coupling between payout and degen execution

This is planned, but we chose to ship a transparent intermediate version first.

## 4) Why does Degen Mode currently use two signatures / two transactions?
Because the current lite flow is:
1. On-chain `claim` (USDC payout)
2. Jupiter swap transaction (USDC -> selected token)

This is a deliberate tradeoff for speed of iteration and compatibility with current architecture.  
We clearly communicate this in the UX and roadmap toward stricter degen claim mechanics.

## 5) You mention fairness and openness a lot. What does “openness” mean here?
For us, openness means:
- visible and verifiable on-chain state
- transparent payout and settlement mechanics
- public governance addresses and multisig-based control
- clear fallback/risk behavior (rather than hidden UX magic)

We also plan to extend this with:
- risk policy transparency page
- protocol transparency page (stats, treasury flow, fees, multisig roles, recent upgrades)

## 6) Is this just a Jupiter swap UI with game cosmetics?
No.
Jupiter is a core part of the game loop, but the gameplay itself is on-chain:
- rounds
- deposits
- pot accounting
- winner settlement via VRF
- claims/refunds

Jupiter enables the asset entry and degen claim experience, but the game state and fairness are not offloaded to Jupiter.

## 7) Why did you not build on MagicBlock ER for this submission?
This submission is intentionally **L1-first**.
Reasons:
- fairness and settlement clarity
- Jupiter compatibility and simpler execution assumptions
- lower operational complexity for a production-oriented MVP

MagicBlock is a roadmap fit for:
- richer real-time game loops
- lower-latency social mechanics
- future execution-layer experimentation

## 8) Why mention Pinocchio migration if you are using Anchor now?
Anchor gives us fast development and a strong testing/debugging workflow today.

Pinocchio is a planned optimization path for performance-critical on-chain paths:
- lower compute overhead
- more low-level control
- better execution efficiency as usage scales

We are treating it as a performance roadmap item, not a hackathon overclaim.

## 9) What are the main technical risks you already identified?
- Heavy Jupiter routes can exceed Solana transaction size limits (bytes), even when compute is sufficient
- Client-orchestrated degen flows are not fully enforceable yet
- Strict degen claim with separate VRF introduces significant async state-machine complexity

Mitigations already implemented:
- batch auto-splitting for oversized deposit flows
- clear UX feedback/progress
- refund/cancel/admin cleanup paths
- tests + smoke checks + multisig ops discipline

## 10) How do you think about security?
Security is a core product feature, not an afterthought:
- multisig governance separation (Ops vs Upgrade roles)
- upgrade timelock discipline
- tested on-chain flows including refunds/cancels/edge cases
- runbooks and mainnet smoke validation

Our thesis is: degen UX should exist **on top of** a safe, auditable, fair on-chain core.

## 11) Why are you emphasizing mobile-first so much?
Because the product naturally fits mobile behavior:
- short session loops
- fast social/FOMO interactions
- simple wallet-native actions (enter / watch / claim)
- high shareability potential via future Solana Blinks and Actions

We are designing distribution and gameplay together, not separately.

## 12) What is your long-term monetization thesis?
The fair/on-chain jackpot core is reusable across many formats:
- public rounds
- sponsored rooms
- custom user-configured rooms
- creator/community rooms
- clan competitions
- degen fee modes
- mission rewards
- prediction-share themed formats

This gives the product a broad monetization design space without constantly rewriting the protocol core.

