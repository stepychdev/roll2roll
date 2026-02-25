use anchor_lang::prelude::*;

#[event]
pub struct RoundStarted {
    pub round_id: u64,
    pub round: Pubkey,
    pub vault_usdc_ata: Pubkey,
    pub start_ts: i64,
}

#[event]
pub struct DepositEvent {
    pub round_id: u64,
    pub user: Pubkey,
    pub delta_usdc: u64,
    pub tickets_added: u64,
    pub participant_index: u16,
    pub total_usdc_after: u64,
    pub total_tickets_after: u64,
}

#[event]
pub struct RoundLocked {
    pub round_id: u64,
    pub total_usdc: u64,
    pub total_tickets: u64,
    pub participants_count: u16,
}

#[event]
pub struct VrfRequested {
    pub round_id: u64,
}

#[event]
pub struct RoundSettled {
    pub round_id: u64,
    pub winning_ticket: u64,
    pub winner: Pubkey,
    pub total_usdc: u64,
    pub total_tickets: u64,
}

#[event]
pub struct Claimed {
    pub round_id: u64,
    pub winner: Pubkey,
    pub payout: u64,
    pub fee: u64,
}

#[event]
pub struct CancelRefund {
    pub round_id: u64,
    pub user: Pubkey,
    pub usdc_refunded: u64,
}

#[event]
pub struct ForceCancel {
    pub round_id: u64,
    pub admin: Pubkey,
    pub total_usdc: u64,
    pub participants_count: u16,
}

#[event]
pub struct AdminTransferred {
    pub old_admin: Pubkey,
    pub new_admin: Pubkey,
}

#[event]
pub struct TreasuryUpdated {
    pub old_treasury: Pubkey,
    pub new_treasury: Pubkey,
    pub owner: Pubkey,
}
