import { Keypair } from "@solana/web3.js";

export const accounts = [
  Keypair.fromSeed(
    Uint8Array.from([
      117, 44, 198, 153, 148, 155, 41, 135, 108, 141, 72, 150, 244, 77, 137,
      193, 25, 84, 225, 56, 13, 44, 222, 225, 140, 7, 87, 27, 32, 167, 244, 190,
    ]),
  ),
  Keypair.fromSeed(
    Uint8Array.from([
      222, 191, 29, 157, 151, 120, 208, 211, 179, 231, 175, 93, 66, 50, 196,
      201, 80, 234, 69, 135, 243, 214, 231, 80, 149, 15, 26, 136, 205, 32, 19,
      247,
    ]),
  ),
  Keypair.fromSeed(
    Uint8Array.from([
      33, 151, 197, 87, 145, 179, 193, 86, 254, 193, 130, 125, 73, 14, 176, 124,
      5, 245, 194, 173, 41, 70, 118, 232, 121, 194, 48, 2, 211, 133, 114, 202,
    ]),
  ),
] as const;

export const addresses: readonly string[] = accounts.map((account) =>
  account.publicKey.toBase58(),
);
