import { useEffect, useState } from "react";
import "./App.css";
import { disconnectAllSessions, Session, walletKitPromise } from "./wallet-kit";
import { Pairing } from "./pairing";
import { EventEmitter } from "./emit-events";

type State =
  | { step: "init" | "pair" | "reset"; error: string }
  | { step: "sendEvents"; session: Session; error: string };

const INITIAL_STATE: State = { step: "init", error: "" };

function App() {
  const [state, setState] = useState(INITIAL_STATE);

  const handleError = (error: unknown) => {
    const message =
      typeof error === "string"
        ? error
        : error instanceof Error
          ? error.message
          : `Unknown error: ${error}`;
    setState((prev) => ({ ...prev, error: message }));
  };

  // Initialization
  useEffect(() => {
    if (state.step !== "init") return;
    (async function init() {
      const walletKit = await walletKitPromise;
      const sessions = Object.values(walletKit.getActiveSessions());
      const session = sessions[0];
      if (session) {
        setState({ step: "sendEvents", session, error: "" });
      } else {
        setState({ step: "pair", error: "" });
      }
    })().catch((error: unknown) => {
      console.error("Failed to initialize", error);
      handleError(error);
    });
  });

  const handlePaired = (session: Session) => {
    setState({ step: "sendEvents", session, error: "" });
  };

  const handleReset = () => {
    setState({ step: "reset", error: "" });
    disconnectAllSessions().finally(() => {
      setState(INITIAL_STATE);
    });
  };

  return (
    <>
      <h1 style={{ textAlign: "center" }}>
        <code>WalletConnectProvider</code> missing events
      </h1>
      <div className="card">
        {state.error && <p>Error: {state.error}</p>}
        {(state.step === "init" || state.step === "reset") && <p>Loading...</p>}
        {state.step === "pair" && (
          <Pairing onError={handleError} onPaired={handlePaired} />
        )}
        {state.step === "sendEvents" && (
          <EventEmitter session={state.session} onError={handleError} />
        )}
      </div>
      <hr />
      <div className="card">
        <button
          type="button"
          style={{ background: "#ededed", color: "#ba0021" }}
          onClick={handleReset}
        >
          Reset
        </button>
      </div>
    </>
  );
}

export default App;
