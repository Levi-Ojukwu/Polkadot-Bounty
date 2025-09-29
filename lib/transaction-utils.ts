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
  value: bigint,
): Promise<TransactionResult> {
  try {
    console.log("[v0] Starting bounty creation with:", { title, description, value: value.toString() })

    if (!signer) {
      throw new Error("No signer provided")
    }

    if (typeof value !== "bigint") {
      throw new Error(`Value must be a bigint, received: ${typeof value}`)
    }

    if (value <= 0n) {
      throw new Error("Bounty value must be greater than 0")
    }

    const typedApi = await getTypedApi()

    if (!typedApi?.tx?.Bounties) {
      throw new Error("Bounties pallet not available")
    }

    const tx = typedApi.tx.Bounties.propose_bounty({
      description: Binary.fromText(`${title}: ${description}`),
      value: value,
    })

    console.log("[v0] Transaction created, signing and submitting...")

    const result = await tx.signAndSubmit(signer)

    console.log("[v0] Transaction submitted successfully:", result)

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
