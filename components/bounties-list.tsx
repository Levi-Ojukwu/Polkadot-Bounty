"use client"

import { useState, useEffect } from "react"
import { BountyCard } from "./bounty-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Plus, RefreshCw } from "lucide-react"
import { CreateBountyDialog } from "./create-bounty-dialog"
// import { useBountyData } from "@/hooks/use-bounty-data" // Added bounty data hook

interface BountiesListProps {
  onCreateBounty: () => void
  onViewBounty: (id: number) => void
}

export function BountiesList({ onCreateBounty, onViewBounty }: BountiesListProps) {
  // Mock data for now
  const [bounties] = useState([
    {
      id: 1,
      title: "Develop Polkadot Mobile Wallet",
      description: "Create a secure and user-friendly mobile wallet application for Polkadot ecosystem with support for staking and governance features.",
      value: "5,000 DOT",
      status: "active" as const,
      proposer: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      curator: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
      createdAt: "2024-01-15T10:00:00Z",
    },
    {
      id: 2,
      title: "Substrate Runtime Optimization",
      description: "Optimize runtime performance for better transaction throughput and reduced block times.",
      value: "3,200 DOT",
      status: "proposed" as const,
      proposer: "5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy",
      createdAt: "2024-01-20T14:30:00Z",
    },
    {
      id: 3,
      title: "Cross-chain Bridge Security Audit",
      description: "Comprehensive security audit of the cross-chain bridge implementation with detailed vulnerability assessment.",
      value: "8,500 DOT",
      status: "approved" as const,
      proposer: "5GNJqTPyNqANBkUVMN1LPPrxXnFouWXoe2wNSmmEoLctxiZY",
      curator: "5HpG9w8EBLe5XCrbczpwq5TSXvedjrBGCwqxK1iQ7qUsSWFc",
      createdAt: "2024-01-10T09:15:00Z",
    },
  ])
  const [filteredBounties, setFilteredBounties] = useState(bounties)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading] = useState(false)
  const [error] = useState<string | null>(null)
  
  const refreshBounties = () => {
    // Mock refresh - in real implementation this would reload data
    console.log("Refreshing bounties...")
  }

  useEffect(() => {
    filterBounties()
  }, [bounties, searchTerm, statusFilter])

  const filterBounties = () => {
    let filtered = bounties

    if (searchTerm) {
      filtered = filtered.filter(
        (bounty) =>
          bounty.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bounty.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((bounty) => bounty.status === statusFilter)
    }

    setFilteredBounties(filtered)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-card rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={refreshBounties} variant="outline" className="gap-2 bg-transparent">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bounties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="proposed">Proposed</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="awarded">Awarded</SelectItem>
              <SelectItem value="claimed">Claimed</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={refreshBounties} variant="outline" size="sm" className="gap-2 bg-transparent">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <CreateBountyDialog onBountyCreated={refreshBounties}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Bounty
          </Button>
        </CreateBountyDialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredBounties.map((bounty) => (
          <BountyCard key={bounty.id} bounty={bounty} onViewDetails={onViewBounty} />
        ))}
      </div>

      {filteredBounties.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== "all" ? "No bounties match your filters" : "No bounties found"}
          </p>
        </div>
      )}
    </div>
  )
}
