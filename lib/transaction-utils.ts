    import { getTypedApi } from "./polkadot-client"
    import { Binary } from "polkadot-api"

      export interface TransactionResult {
        hash: string
        blockHash?: string
        success: boolean
        error?: string
      }

      export async function createBountyTransaction(
        signer: any,
        title: string,
        description: string,
        value: number,
      ): Promise<TransactionResult> {
        try {
          const typedApi = await getTypedApi()
          
          // console.log("[v0] API instance:", typedApi)
          // console.log("[v0] Available tx modules:", Object.keys(typedApi.tx))
          // console.log("[v0] Bounties module:", typedApi.tx.Bounties)
          
          // Check if Bounties module exists
          if (!typedApi.tx.Bounties) {
            // console.error("[v0] Bounties module not found! Available modules:", Object.keys(typedApi.tx))
            throw new Error("Bounties module not available on this chain")
          }

          const tx = typedApi.tx.Bounties.propose_bounty({
            description: `${title}: ${description}`,
            value: BigInt(value),
          })

          // console.log("[v0] Transaction created:", tx)
          console.log("[v0] Creating bounty transaction with value:", value)

          const result = await tx.signAndSubmit(signer)

          return {
            hash: result.txHash,
            blockHash: result.blockHash,
            success: true,
          }
        } catch (error) {
          console.error("[v0] Failed to create bounty:", error)
          return {
            hash: "",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          }
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
          console.error("[v0] Failed to claim bounty:", error)
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
