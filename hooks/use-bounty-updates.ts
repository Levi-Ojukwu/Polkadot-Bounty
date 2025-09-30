"use client"

import { useEffect, useState, useCallback } from "react"
import { bountySubscriptionService, type BountyUpdate } from "@/lib/bounty-subscription"

export function useBountyUpdates() {
  const [updates, setUpdates] = useState<BountyUpdate[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    let unsubscribe: (() => void) | null = null

    const initializeSubscription = async () => {
      try {
        await bountySubscriptionService.initialize()
        setIsConnected(true)

        unsubscribe = bountySubscriptionService.subscribe((update) => {
          console.log("Received bounty update:", update)
          setUpdates((prev) => [update, ...prev.slice(0, 49)]) // Keep last 50 updates
        })
      } catch (error) {
        console.error("Failed to initialize bounty subscription:", error)
        setIsConnected(false)
      }
    }

    initializeSubscription()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  const clearUpdates = useCallback(() => {
    setUpdates([])
  }, [])

  return {
    updates,
    isConnected,
    clearUpdates,
  }
}
