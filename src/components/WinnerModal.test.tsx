import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { WinnerModal } from "./WinnerModal";

let walletMock = {
  publicKey: { toBase58: () => "winner-wallet-address-1234567890" },
  sendTransaction: vi.fn(),
};

let connectionMock = {
  confirmTransaction: vi.fn(),
};

vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: () => walletMock,
  useConnection: () => ({ connection: connectionMock }),
}));

vi.mock("react-confetti", () => ({
  default: () => <div data-testid="Confetti" />,
}));

vi.mock("lucide-react", () => {
  const Icon = () => <span aria-hidden="true" />;
  return {
    Trophy: Icon,
    X: Icon,
    Loader2: Icon,
    Shuffle: Icon,
    Zap: Icon,
  };
});

vi.mock("../lib/degenClaim", () => ({
  pickRandomToken: () => ({ mint: "mint", symbol: "BONK", icon: "🐕" }),
  pickDegenTokenFromSeed: () => ({ mint: "mint", symbol: "BONK", icon: "🐕" }),
  getDegenQuote: vi.fn(async () => null),
  buildDegenSwapTx: vi.fn(),
}));

function makeWinner(overrides: Partial<any> = {}) {
  return {
    address: "winner-wallet-address-1234567890",
    displayName: "Winner",
    amount: 2.2,
    fee: 0.0055,
    payout: 2.1945,
    color: "#00bcd4",
    ...overrides,
  };
}

describe("WinnerModal", () => {
  test("renders nothing when closed or when winner is missing", () => {
    const { rerender, container } = render(
      <WinnerModal isOpen={false} onClose={vi.fn()} winner={makeWinner()} />
    );
    expect(container).toBeEmptyDOMElement();

    rerender(<WinnerModal isOpen={true} onClose={vi.fn()} winner={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  test("renders payout breakdown and next round action", () => {
    render(
      <WinnerModal
        isOpen={true}
        onClose={vi.fn()}
        winner={makeWinner({ amount: 2.2, fee: 0.01, payout: 2.19 })}
      />
    );

    expect(screen.getByText("Winner!")).toBeInTheDocument();
    expect(screen.getByText("Total Payout")).toBeInTheDocument();
    expect(screen.getByText("$2.19")).toBeInTheDocument();
    expect(screen.getByText("USDC")).toBeInTheDocument();
    expect(screen.getByText("Pot: $2.20")).toBeInTheDocument();
    expect(screen.getByText("Fee: $0.01 (0.25%)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next round/i })).toBeInTheDocument();
    expect(screen.getByTestId("Confetti")).toBeInTheDocument();
  });

  test("winner sees claim button and clicking it calls onClaim", () => {
    const onClaim = vi.fn(async () => {});

    render(
      <WinnerModal
        isOpen={true}
        onClose={vi.fn()}
        onClaim={onClaim}
        isWinner={true}
        winner={makeWinner({ payout: 2.19 })}
      />
    );

    const claimBtn = screen.getByRole("button", { name: /claim \$2\.19/i });
    expect(claimBtn).toBeInTheDocument();
    fireEvent.click(claimBtn);
    expect(onClaim).toHaveBeenCalledTimes(1);
  });

  test("non-winner does not see claim button, but next round closes modal", () => {
    const onClose = vi.fn();

    render(
      <WinnerModal
        isOpen={true}
        onClose={onClose}
        onClaim={vi.fn(async () => {})}
        isWinner={false}
        winner={makeWinner({ payout: 2.19 })}
      />
    );

    expect(screen.queryByRole("button", { name: /claim \$/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /next round/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
