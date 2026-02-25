use anchor_lang::prelude::*;
use crate::errors::ErrorCode;

pub fn checked_add_u64(a: u64, b: u64) -> Result<u64> {
    a.checked_add(b).ok_or(ErrorCode::MathOverflow.into())
}

pub fn checked_add_i64(a: i64, b: i64) -> Result<i64> {
    a.checked_add(b).ok_or(ErrorCode::MathOverflow.into())
}

pub fn bit_add(bit: &mut [u64], mut i: usize, delta: u64) -> Result<()> {
    let n = bit.len() - 1; // 1-indexed
    while i <= n {
        bit[i] = bit[i].checked_add(delta).ok_or(ErrorCode::MathOverflow)?;
        i += i & (!i + 1); // i += lowbit(i)
    }
    Ok(())
}

/// Subtract `delta` tickets from participant at 1-based index `i` in the Fenwick tree.
/// Used when a participant cancels to keep the tree in sync with total_tickets.
pub fn bit_sub(bit: &mut [u64], mut i: usize, delta: u64) -> Result<()> {
    let n = bit.len() - 1;
    while i <= n {
        bit[i] = bit[i].checked_sub(delta).ok_or(ErrorCode::MathOverflow)?;
        i += i & (!i + 1);
    }
    Ok(())
}

pub fn bit_find_prefix(bit: &[u64], target: u64) -> Result<usize> {
    let n = bit.len() - 1;
    let mut bit_mask = 1usize;
    while bit_mask <= n {
        bit_mask <<= 1;
    }
    let mut idx = 0usize;
    let mut cur = 0u64;
    let mut step = bit_mask;
    while step > 0 {
        let next = idx + step;
        if next <= n {
            let cand = cur.checked_add(bit[next]).ok_or(ErrorCode::MathOverflow)?;
            if cand < target {
                idx = next;
                cur = cand;
            }
        }
        step >>= 1;
    }
    Ok(idx + 1)
}
