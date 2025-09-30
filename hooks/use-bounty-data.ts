"use client"

import { useState, useEffect, useCallback } from "react"
import { bountySubscriptionService } from "@/lib/bounty-subscription"

interface Bounty {
  id: number
  title: string
  description: string
  value: string
  status: "proposed" | "approved" | "active" | "awarded" | "claimed"
  proposer: string
  curator?: string
  beneficiary?: string
  createdAt: string
  deadline?: string
}

export function useBountyData() {
  const [bounties, setBounties] = useState<Bounty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadBounties = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // For now, using mock data - in real implementation, this would fetch from the API
      const mockBounties: Bounty[] = [
        {
          id: 1,
          title: "Develop Polkadot Mobile Wallet",
          description:
            "Create a secure and user-friendly mobile wallet application for Polkadot ecosystem with support for staking and governance features.",
          value: "5,000 DOT",
          status: "active",
          proposer: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
          curator: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
          createdAt: "2024-01-15T10:00:00Z",
        },
        {
          id: 2,
          title: "Substrate Runtime Optimization",
          description: "Optimize runtime performance for better transaction throughput and reduced block times.",
          value: "3,200 DOT",
          status: "proposed",
          proposer: "5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy",
          createdAt: "2024-01-20T14:30:00Z",
        },
        {
          id: 3,
          title: "Cross-chain Bridge Security Audit",
          description:
            "Comprehensive security audit of the cross-chain bridge implementation with detailed vulnerability assessment.",
          value: "8,500 DOT",
          status: "approved",
          proposer: "5GNJqTPyNqANBkUVMN1LPPrxXnFouWXoe2wNSmmEoLctxiZY",
          curator: "5HpG9w8EBLe5XCrbczpwq5TSXvedjrBGCwqxK1iQ7qUsSWFc",
          createdAt: "2024-01-10T09:15:00Z",
        },
      ]

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setBounties(mockBounties)
    } catch (err) {
      console.error("Failed to load bounties:", err)
      setError(err instanceof Error ? err.message : "Failed to load bounties")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBounties()

    // Set up real-time subscription
    const initializeSubscription = async () => {
      try {
        await bountySubscriptionService.initialize()

        const unsubscribe = bountySubscriptionService.subscribe((update) => {
          console.log("Bounty update received, refreshing data:", update)
          // In a real implementation, you might update specific bounties
          // or refresh the entire list based on the update type
          loadBounties()
        })

        return unsubscribe
      } catch (error) {
        console.error("Failed to set up bounty subscription:", error)
      }
    }

    let unsubscribe: (() => void) | null = null
    initializeSubscription().then((unsub) => {
      if (unsub) unsubscribe = unsub
    })

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [loadBounties])

  const refreshBounties = useCallback(() => {
    loadBounties()
  }, [loadBounties])

  const getBountyById = useCallback(
    (id: number) => {
      return bounties.find((bounty) => bounty.id === id)
    },
    [bounties],
  )

  return {
    bounties,
    loading,
    error,
    refreshBounties,
    getBountyById,
  }
}


