import { describe, expect, test } from "vitest";
import { pickDegenTokenFromSeed } from "./degenClaim";

describe("degenClaim deterministic pick", () => {
  test("returns the same token for the same seed", () => {
    const seed = "ab".repeat(32) + ":91:winner:degen-v1";
    const a = pickDegenTokenFromSeed(true, seed);
    const b = pickDegenTokenFromSeed(true, seed);
    expect(a).toEqual(b);
  });

  test("devnet deterministic pick stays within devnet-safe pool", () => {
    const token = pickDegenTokenFromSeed(false, "seed");
    expect(token.symbol).toBe("SOL");
  });
});

