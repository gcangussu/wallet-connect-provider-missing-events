import { useState } from "react";
import WalletKitClient, { WalletKitTypes } from "@reown/walletkit";
import { buildApprovedNamespaces, getSdkError } from "@walletconnect/utils";
import { Session, walletKitPromise } from "./wallet-kit";
import { SOLANA_CHAINS } from "./constants";
import { addresses } from "./solana";

export function Pairing(props: {
  onError: (error: unknown) => void;
  onPaired: (session: Session) => void;
}) {
  const { onError, onPaired } = props;
  const [state, setState] = useState({ pending: false });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (state.pending) return;

    let session: Session;
    try {
      setState({ pending: true });

      const formData = new FormData(event.currentTarget);
      const uri = formData.get("uri");
      if (!uri || typeof uri !== "string") {
        onError("Invalid URI");
        return;
      }

      const walletKit = await walletKitPromise;
      const {
        promise: proposalPromise,
        resolve,
        reject,
      } = Promise.withResolvers<WalletKitTypes.SessionProposal>();

      let timeout, proposal;
      try {
        walletKit.on("session_proposal", resolve);
        await walletKit.pair({ uri });
        timeout = setTimeout(() => {
          reject(new Error("Timeout waiting for session proposal"));
        }, 10000);
        proposal = await proposalPromise;
      } finally {
        clearTimeout(timeout);
        walletKit.removeListener("session_proposal", resolve);
      }

      session = await handleSessionProposalAcceptance(walletKit, proposal);
    } catch (error) {
      console.error("Failed to pair with dapp", error);
      onError(error);
      return;
    } finally {
      setState({ pending: false });
    }

    onPaired(session);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "grid", justifyItems: "center", gap: "1rem" }}
    >
      <h2>Pair with dapp</h2>
      <ol style={{ marginTop: 0 }}>
        <li>
          Go to{" "}
          <a
            href="https://appkit-lab.reown.com/library/solana/"
            target="_blank"
            rel="noreferrer"
          >
            https://appkit-lab.reown.com/library/solana/
          </a>
        </li>
        <li>Choose “Connect Wallet”</li>
        <li>Choose “WalletConnect”</li>
        <li>Wait for the QRCode to load and then press “Copy link”</li>
        <li>Paste the copied link in the field below and then press “Pair”</li>
      </ol>
      <label>
        Pairing link:{" "}
        <input type="text" name="uri" required disabled={state.pending} />
      </label>
      <button type="submit" disabled={state.pending} style={{ width: 120 }}>
        {state.pending ? "Waiting..." : "Pair"}
      </button>
    </form>
  );
}

async function handleSessionProposalAcceptance(
  walletKit: WalletKitClient,
  proposal: WalletKitTypes.SessionProposal,
): Promise<Session> {
  console.log("Accepting session proposal", proposal);
  try {
    const approvedNamespaces = buildApprovedNamespaces({
      proposal: proposal.params,
      supportedNamespaces: {
        solana: {
          chains: [...SOLANA_CHAINS],
          methods: ["solana_signTransaction", "solana_signMessage"],
          events: ["accountsChanged", "chainChanged"],
          accounts: SOLANA_CHAINS.flatMap((chain) =>
            addresses.map((addr) => `${chain}:${addr}`),
          ),
        },
      },
    });

    return await walletKit.approveSession({
      id: proposal.id,
      namespaces: approvedNamespaces,
    });
  } catch (error) {
    console.error("Failed to approve session proposal", error);
    await walletKit.rejectSession({
      id: proposal.id,
      reason: getSdkError("USER_REJECTED"),
    });
    throw error;
  }
}
