use anchor_lang::prelude::*;

pub const MAX_PARTICIPANTS: usize = 200;
pub const BPS_DENOMINATOR: u64 = 10_000;

pub const SEED_CFG: &[u8] = b"cfg";
pub const SEED_ROUND: &[u8] = b"round";
pub const SEED_PARTICIPANT: &[u8] = b"p";

/// Fixed USDC reimbursement for VRF payer (0.20 USDC = 200_000 raw, 6 decimals).
/// Deducted from pot during claim, sent to whoever paid for VRF.
pub const VRF_REIMBURSEMENT_USDC: u64 = 200_000;
