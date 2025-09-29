import { getTypedApi } from "./polkadot-client"

      export interface TransactionResult {
        hash: string
        blockHash?: string
        success: boolean
        error?: string
      }

      // export async function createBountyTransaction(
      //   signer: any,
      //   title: string,
      //   description: string,
      //   value: bigint,
      // ): Promise<TransactionResult> {
      //   try {
      //     if (!signer) throw new Error("No signer provided");

      //     const typedApi = await getTypedApi()
          
      //     // Check if Bounties module exists
      //     if (!typedApi || !typedApi.tx || !typedApi.tx.Bounties) {
      //       throw new Error("Bounties pallet not available on chain / typedApi")
      //     }

      //     const tx = typedApi.tx.Bounties.propose_bounty(
      //       value,                                  // Balance (Planck)
      //       `${title}: ${description}`              // Description (string/Bytes)
      //     )

      //     console.log("Creating bounty transaction with value:", value.toString())

      //     const result = await tx.signAndSubmit(signer)

      //     return {
      //       hash: result.txHash,
      //       blockHash: result.blockHash,
      //       success: true,
      //     }
      //   } catch (error) {
      //     console.error("Failed to create bounty:", error)
      //     return {
      //       hash: "",
      //       success: false,
      //       error: error instanceof Error ? error.message : "Unknown error",
      //     }
      //   }
      // }

      export async function createBountyTransaction(
        signer: any,
        title: string,
        description: string,
        value: bigint, // <- enforce bigint
      ): Promise<TransactionResult> {
        try {
          if (!signer) throw new Error("No signer provided");
      
          const typedApi = await getTypedApi();
          if (!typedApi || !typedApi.tx || !typedApi.tx.Bounties) {
            throw new Error("Bounties pallet not available on chain / typedApi");
          }
      
          // Defensive: identify the propose method (different lib styles)
          const proposeMethod =
            typedApi.tx.Bounties.propose_bounty ??
            typedApi.tx.Bounties.proposeBounty ??
            typedApi.tx.Bounties.propose; // try reasonable fallbacks
      
          if (!proposeMethod) {
            console.error("Available Bounties tx methods:", Object.keys(typedApi.tx.Bounties));
            throw new Error("propose_bounty method not found on Bounties pallet");
          }
      
          // Debug: show metadata (helps confirm expected types/arg order)
          try {
            // meta may be on the method function or on camelCase version
            // safe guard for different API wrappers:
            const meta = (proposeMethod as any).meta ?? (proposeMethod as any).meta;
            console.debug("[bounty] propose meta:", meta?.args ?? meta);
          } catch (e) {
            // ignore metadata logging failures
          }
      
          // Final defensive checks
          if (typeof value === "undefined" || value === null) {
            throw new Error("value is undefined/null before tx creation");
          }
          if (typeof value !== "bigint") {
            throw new Error("value must be a bigint. Convert using BigInt(...) before calling.");
          }
      
          // Compose description
          const desc = `${title}: ${description}`;
      
          // Create tx using positional arguments (value first, description second)
          // NOTE: call the 'propose' function that we detected above
          const tx = (proposeMethod as any)(value, desc);
      
          console.debug("[bounty] about to sign tx with value:", value.toString(), "desc:", desc);
      
          const result = await tx.signAndSubmit(signer);
      
          return {
            hash: result.txHash,
            blockHash: result.blockHash,
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

      export async function approveBountyTransaction(signer: any, bountyId: number): Promise<TransactionResult> {
        try {
          const typedApi = await getTypedApi()

          // Note: In real implementation, this would require governance/council approval
          const tx = typedApi.tx.Bounties.approve_bounty({
            bounty_id: bountyId,
          })

          const result = await tx.signAndSubmit(signer)

          return {
            hash: result.txHash,
            blockHash: result.blockHash,  
            success: true,
          }
        } catch (error) {
          console.error("[v0] Failed to approve bounty:", error)
          return {
            hash: "",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          }
        }
      }

      export async function claimBountyTransaction(signer: any, bountyId: number): Promise<TransactionResult> {
        try {
          const typedApi = await getTypedApi()

          const tx = typedApi.tx.Bounties.claim_bounty({
            bounty_id: bountyId,
          })

          const result = await tx.signAndSubmit(signer)

          return {
            hash: result.txHash,
            blockHash: result.blockHash,
            success: true,
          }
        } catch (error) {
          console.error("Failed to claim bounty:", error)
          return {
            hash: "",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          }
        }
      }

      export async function awardBountyTransaction(
        signer: any,
        bountyId: number,
        beneficiary: string,
      ): Promise<TransactionResult> {
        try {
          const typedApi = await getTypedApi()

          const tx = typedApi.tx.Bounties.award_bounty({
            bounty_id: bountyId,
            beneficiary: beneficiary,
          })

          const result = await tx.signAndSubmit(signer)

          return {
            hash: result.txHash,
            blockHash: result.blockHash,
            success: true,
          }
        } catch (error) {
          console.error("[v0] Failed to award bounty:", error)
          return {
            hash: "",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          }
        }
      }
