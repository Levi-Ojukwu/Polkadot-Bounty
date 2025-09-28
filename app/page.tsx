"use client"

import { Header } from "@/components/header"
import { StatsCards } from "@/components/stats-cards"
import { BountiesList } from "@/components/bounties-list"
import { BountyDetailsDialog } from "@/components/bounty-details-dialog"
import { useEffect, useState } from "react"

export default function HomePage() {
  const [stats, setStats] = useState({
    totalBounties: 0,
    activeBounties: 0,
    totalValue: "0 DOT",
    myBounties: 0,
  })

  const [selectedBountyId, setSelectedBountyId] = useState<number | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

  useEffect(() => {
    // Mock data for now - will be replaced with real API calls
    setStats({
      totalBounties: 1247,
      activeBounties: 89,
      totalValue: "12,450 DOT",
      myBounties: 3,
    })
  }, [])

  const handleCreateBounty = () => {
    // This will be handled by the CreateBountyDialog
  }

  const handleViewBounty = (id: number) => {
    setSelectedBountyId(id)
    setDetailsDialogOpen(true)
  }

  const handleBountyCreated = () => {
    // Refresh the bounties list
    console.log("Bounty created, refreshing list...")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Bounty Dashboard</h2>
          <p className="text-muted-foreground">Manage and track Polkadot bounties on Paseo testnet</p>
        </div>

        <StatsCards stats={stats} />

        <div className="mt-8">
          <BountiesList onCreateBounty={handleCreateBounty} onViewBounty={handleViewBounty} />
        </div>
      </main>

      <BountyDetailsDialog bountyId={selectedBountyId} open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen} />
    </div>
  )
}
