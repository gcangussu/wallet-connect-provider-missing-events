import { useState } from "react";
import { Session, walletKitPromise } from "./wallet-kit";
import { SOLANA_CHAINS } from "./constants";

interface State {
  accounts: readonly string[];
  chains: readonly string[];
  pending: boolean;
  events: readonly {
    topic: string;
    event: { name: string; data: unknown };
    chainId: string;
  }[];
}

export function EventEmitter(props: {
  session: Session;
  onError: (error: unknown) => void;
}) {
  const { session, onError } = props;

  const [state, setState] = useState(() => getInitState(session));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (state.pending) return;

    try {
      setState((prev) => ({ ...prev, pending: true, events: [] }));

      const formData = new FormData(event.currentTarget);
      const chain = formData.get("chain");
      const account = formData.get("account");
      if (!chain || typeof chain !== "string") {
        onError("Invalid chain");
        return;
      }
      if (!account || typeof account !== "string") {
        onError("Invalid account");
        return;
      }

      const walletKit = await walletKitPromise;
      const chainChangedEvent = {
        topic: session.topic,
        event: {
          name: "chainChanged",
          data: chain.split(":")[1],
        },
        chainId: chain,
      };
      const accountsChangedEvent = {
        topic: session.topic,
        event: {
          name: "accountsChanged",
          data: [account],
        },
        chainId: chain,
      };
      await walletKit.emitSessionEvent(chainChangedEvent);
      await walletKit.emitSessionEvent(accountsChangedEvent);
      setState((prev) => ({
        ...prev,
        events: [chainChangedEvent, accountsChangedEvent],
      }));
      console.log("Events emitted", {
        chainChangedEvent,
        accountsChangedEvent,
      });
    } catch (error) {
      console.error("Failure emitting events", error);
      onError(error);
    } finally {
      setState((prev) => ({ ...prev, pending: false }));
    }
  };

  return (
    <div style={{ display: "grid", justifyItems: "center", gap: "1rem" }}>
      <p style={{ maxWidth: 560, margin: 0 }}>
        🟢 Connected to <em>{session.peer.metadata.name}</em>
      </p>
      <p style={{ maxWidth: 560 }}>
        Select a chain and an account and then press “Send”, notice that on the
        dapp we cannot change the account by sending “accountsChanged” events,
        on the other hand the “chainChanged” events work as expected.
      </p>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
        <label>
          Chain:{" "}
          <select name="chain" disabled={state.pending}>
            {state.chains.map((chain) => (
              <option key={chain} value={chain}>
                {getChainName(chain)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Account:{" "}
          <select name="account" disabled={state.pending}>
            {state.accounts.map((account) => (
              <option key={account} value={account}>
                {shortenAddress(account)}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={state.pending}>
          Send
        </button>
      </form>

      <div style={{ display: "grid", justifyItems: "center" }}>
        <h3>Sent events</h3>
        {state.pending ? (
          <p>Sending events...</p>
        ) : state.events.length === 0 ? (
          <p>No events sent</p>
        ) : (
          <ol style={{ marginTop: 0 }}>
            {state.events.map((event) => (
              <li key={event.event.name}>
                <code
                  style={{
                    fontWeight: 600,
                    background: "#f4f4f4",
                    padding: "0.25em 0.375em",
                  }}
                >
                  {event.event.name}
                </code>
                <pre style={{ background: "#f4f4f4", padding: "1em" }}>
                  {JSON.stringify(event, null, 2)}
                </pre>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

const [mainnet, devnet] = SOLANA_CHAINS;

function getInitState(session: Session): State {
  const namespace = session.namespaces["solana"];
  return {
    accounts: getAccountAddresses(namespace.accounts),
    chains: namespace.chains ?? SOLANA_CHAINS,
    pending: false,
    events: [],
  };
}

function getChainName(chain: string) {
  switch (chain) {
    case mainnet:
      return "Mainnet";
    case devnet:
      return "Devnet";
    default:
      return chain;
  }
}

function getAccountAddresses(caipAddresses: readonly string[]) {
  return [
    ...new Set(
      caipAddresses.map((address) => {
        const [, , account] = address.split(":");
        return account;
      }),
    ),
  ];
}

function shortenAddress(address: string) {
  return `${address.slice(0, 4)}…${address.slice(-6)}`;
}
