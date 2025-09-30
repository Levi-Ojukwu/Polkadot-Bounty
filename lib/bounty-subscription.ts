import { getBountiesSdk } from "./polkadot-client"

export interface BountyUpdate {
  type: "bounty_created" | "bounty_approved" | "bounty_awarded" | "bounty_claimed"
  bountyId: number
  data: any
  timestamp: number
}

export class BountySubscriptionService {
  private subscribers: ((update: BountyUpdate) => void)[] = []
  private isSubscribed = false
  private bountiesSdk: any = null

  async initialize() {
    if (this.isSubscribed) return

    try {
      this.bountiesSdk = await getBountiesSdk()
      this.setupSubscriptions()
      this.isSubscribed = true
      console.log("[v0] Bounty subscription service initialized")
    } catch (error) {
      console.error("Failed to initialize bounty subscription service:", error)
    }
  }

  private setupSubscriptions() {
    if (!this.bountiesSdk) return

    // Subscribe to bounty changes
    this.bountiesSdk.watch.bounties$.subscribe((bounties: Map<number, any>) => {
      console.log("[Bounties updated:", bounties.size)
      this.notifySubscribers({
        type: "bounty_created",
        bountyId: 0,
        data: { count: bounties.size },
        timestamp: Date.now(),
      })
    })

    // Subscribe to bounty IDs changes
    this.bountiesSdk.watch.bountyIds$.subscribe((bountyIds: number[]) => {
      console.log("Bounty IDs updated:", bountyIds)
      this.notifySubscribers({
        type: "bounty_created",
        bountyId: 0,
        data: { ids: bountyIds },
        timestamp: Date.now(),
      })
    })

    // Subscribe to individual bounty changes
    // Note: In a real implementation, you would subscribe to specific bounty IDs
    // this.bountiesSdk.watch.getBountyById$(bountyId).subscribe((bounty) => {
    //   this.notifySubscribers({
    //     type: 'bounty_updated',
    //     bountyId,
    //     data: bounty,
    //     timestamp: Date.now()
    //   })
    // })
  }

  subscribe(callback: (update: BountyUpdate) => void) {
    this.subscribers.push(callback)
    return () => {
      this.subscribers = this.subscribers.filter((sub) => sub !== callback)
    }
  }

  private notifySubscribers(update: BountyUpdate) {
    this.subscribers.forEach((callback) => {
      try {
        callback(update)
      } catch (error) {
        console.error("[v0] Error in bounty subscription callback:", error)
      }
    })
  }

  async getBountyById(id: number) {
    if (!this.bountiesSdk) {
      await this.initialize()
    }

    try {
      return await this.bountiesSdk.getBounty(id)
    } catch (error) {
      console.error(`[v0] Failed to get bounty ${id}:`, error)
      return null
    }
  }

  async getAllBounties() {
    if (!this.bountiesSdk) {
      await this.initialize()
    }

    try {
      return await this.bountiesSdk.getBounties()
    } catch (error) {
      console.error("[v0] Failed to get all bounties:", error)
      return new Map()
    }
  }

  destroy() {
    this.subscribers = []
    this.isSubscribed = false
    console.log("[v0] Bounty subscription service destroyed")
  }
}

// Singleton instance
export const bountySubscriptionService = new BountySubscriptionService()
