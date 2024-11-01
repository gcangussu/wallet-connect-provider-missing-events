import { Core } from "@walletconnect/core";
import WalletKitClient, { WalletKit } from "@reown/walletkit";
import { getSdkError } from "@walletconnect/utils";

export type Session = ReturnType<WalletKitClient["getActiveSessions"]>[string];

const core = new Core({
  projectId: "bfd1f46736a52cc8f1c97198f4e22885",
});

const metadata = {
  name: "accountsChanged Bug Repro",
  description: "Missing accountsChanged events bug repro",
  url: "http://localhost:5173",
  icons: ["https://assets.reown.com/reown-profile-pic.png"],
};

export const walletKitPromise = WalletKit.init({ core, metadata });

export async function disconnectAllSessions() {
  const walletKit = await walletKitPromise;
  for (const session of Object.values(walletKit.getActiveSessions())) {
    try {
      await walletKit.disconnectSession({
        topic: session.topic,
        reason: getSdkError("USER_DISCONNECTED"),
      });
    } catch (error) {
      console.error("Failed to disconnect session", session, error);
    }
  }
}
