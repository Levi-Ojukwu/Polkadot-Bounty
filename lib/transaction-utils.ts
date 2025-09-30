// lib/transaction-utils.ts
import { getTypedApi } from "./polkadot-client"; // your existing helper that returns the PAPI client
// Binary is optional; many wrappers accept plain strings. If you have Binary available, you can use it.
let Binary: any = undefined;
try {
  // some sdk variants export Binary
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Binary = require("polkadot-api").Binary;
} catch (e) {
  // ignore if not present
}

/** TransactionResult shape */
export interface TransactionResult {
  hash: string;
  blockHash?: string;
  success: boolean;
  error?: string;
}

/**
 * Create a bounty (safe, tries multiple ways to create the tx depending on wrapper)
 * - signer should be the PAPI signer or extension signer (we type as any to avoid TS overload issues)
 * - value must be a bigint (plancks)
 */
export async function createBountyTransaction(
  signer: any,
  title: string,
  description: string,
  value: bigint
): Promise<TransactionResult> {
  try {
    if (!signer) throw new Error("No signer provided");
    if (typeof value !== "bigint") throw new Error("value must be a bigint (plancks)");

    const typedApi = await getTypedApi();
    if (!typedApi || !typedApi.tx || !typedApi.tx.Bounties) {
      throw new Error("Bounties pallet not available on this chain / API");
    }

    const propose =
      (typedApi.tx.Bounties as any).propose_bounty ??
      (typedApi.tx.Bounties as any).proposeBounty ??
      (typedApi.tx.Bounties as any).propose;

    if (!propose) {
      throw new Error("propose_bounty (or equivalent) not found on Bounties pallet");
    }

    const desc = `${title}: ${description}`;

    // Try building tx with common variants
    let tx: any = null;
    const tries: { kind: string; fn: () => any }[] = [
      {
        kind: "positional(value, description)",
        fn: () => (propose as any)(value, desc),
      },
      {
        kind: "named({ value, description })",
        fn: () =>
          (propose as any)({
            value,
            description: Binary ? Binary.fromText(desc) : desc,
          }),
      },
      {
        kind: "named({ description, value }) (string desc)",
        fn: () =>
          (propose as any)({
            description: desc,
            value,
          }),
      },
    ];

    let lastError: any = null;
    for (const attempt of tries) {
      try {
        tx = attempt.fn();
        // if tx is created successfully break
        if (tx) break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!tx) {
      throw new Error(
        "Failed to compose propose_bounty transaction (tried multiple signatures). Last error: " +
          (lastError && lastError.message ? lastError.message : String(lastError))
      );
    }

    // sign & submit: prefer signAndSubmit, fallback signAndSend
    let result: any;
    if (typeof (tx as any).signAndSubmit === "function") {
      result = await (tx as any).signAndSubmit(signer);
    } else if (typeof (tx as any).signAndSend === "function") {
      result = await (tx as any).signAndSend(signer);
    } else {
      throw new Error("Transaction object has neither signAndSubmit nor signAndSend");
    }

    // result shape differs by wrappers. Attempt to return useful fields:
    return {
      hash: result?.txHash ?? result?.hash ?? "",
      blockHash: result?.blockHash ?? result?.block ?? undefined,
      success: true,
    };
  } catch (err: any) {
    console.error("Failed to create bounty:", err);
    return {
      hash: "",
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
