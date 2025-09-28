"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useWallet } from "@/lib/wallet-context"
import { getTypedApi, getBountiesSdk } from "@/lib/polkadot-client"
import { Clock, User, DollarSign, ExternalLink, Award, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BountyDetailsDialogProps {
  bountyId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface BountyDetails {
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
  account?: string
  balance?: string
}

const statusColors = {
  proposed: "bg-yellow-500/20 text-yellow-400",
  approved: "bg-blue-500/20 text-blue-400",
  active: "bg-green-500/20 text-green-400",
  awarded: "bg-purple-500/20 text-purple-400",
  claimed: "bg-gray-500/20 text-gray-400",
}

export function BountyDetailsDialog({ bountyId, open, onOpenChange }: BountyDetailsDialogProps) {
  const [bounty, setBounty] = useState<BountyDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const { isConnected, signer, account } = useWallet()
  const { toast } = useToast()

  useEffect(() => {
    if (open && bountyId) {
      loadBountyDetails()
    }
  }, [open, bountyId])

  const loadBountyDetails = async () => {
    if (!bountyId) return

    setLoading(true)
    try {
      // Mock data for now - will be replaced with real API calls
      const mockBounty: BountyDetails = {
        id: bountyId,
        title: "Develop Polkadot Mobile Wallet",
        description:
          "Create a secure and user-friendly mobile wallet application for Polkadot ecosystem with support for staking and governance features. The wallet should include: 1) Multi-account support, 2) Staking interface, 3) Governance voting, 4) Transaction history, 5) Security features like biometric authentication.",
        value: "5,000 DOT",
        status: "active",
        proposer: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        curator: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
        createdAt: "2024-01-15T10:00:00Z",
        account: "5F3sa2TJAWMqDhXG6jhV4N8ko9SxwGy8TpaNS1repo5EYjQX",
        balance: "5,000 DOT",
      }

      setBounty(mockBounty)
    } catch (error) {
      console.error("Failed to load bounty details:", error)
      toast({
        title: "Failed to load bounty",
        description: "Could not fetch bounty details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApproveBounty = async () => {
    if (!bounty || !signer) return

    setActionLoading(true)
    try {
      const typedApi = await getTypedApi()
      const bountiesSdk = await getBountiesSdk()

      // This would typically require council/governance approval
      toast({
        title: "Approval initiated",
        description: "Bounty approval requires governance vote",
      })
    } catch (error) {
      console.error("Failed to approve bounty:", error)
      toast({
        title: "Failed to approve bounty",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleClaimBounty = async () => {
    if (!bounty || !signer) return

    setActionLoading(true)
    try {
      const typedApi = await getTypedApi()

      // Claim bounty transaction
      const tx = typedApi.tx.Bounties.claim_bounty({
        bounty_id: bounty.id,
      })

      await tx.signAndSubmit(signer)

      toast({
        title: "Bounty claimed!",
        description: "You have successfully claimed this bounty",
      })

      // Refresh bounty details
      loadBountyDetails()
    } catch (error) {
      console.error("Failed to claim bounty:", error)
      toast({
        title: "Failed to claim bounty",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  if (!bounty && !loading) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading bounty details...</p>
          </div>
        ) : bounty ? (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-muted-foreground">#{bounty.id}</span>
                    <Badge className={statusColors[bounty.status]}>
                      {bounty.status.charAt(0).toUpperCase() + bounty.status.slice(1)}
                    </Badge>
                  </div>
                  <DialogTitle className="text-xl mb-2">{bounty.title}</DialogTitle>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                    <DollarSign className="h-3 w-3" />
                    <span>Value</span>
                  </div>
                  <p className="font-bold text-xl">{bounty.value}</p>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{bounty.description}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Proposer:</span>
                    <span className="font-mono text-xs">
                      {bounty.proposer.slice(0, 8)}...{bounty.proposer.slice(-6)}
                    </span>
                  </div>

                  {bounty.curator && (
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Curator:</span>
                      <span className="font-mono text-xs">
                        {bounty.curator.slice(0, 8)}...{bounty.curator.slice(-6)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Created:</span>
                    <span>{new Date(bounty.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {bounty.account && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Bounty Account:</span>
                      <span className="font-mono text-xs">
                        {bounty.account.slice(0, 8)}...{bounty.account.slice(-6)}
                      </span>
                    </div>

                    {bounty.balance && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Balance:</span>
                        <span className="font-semibold">{bounty.balance}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex gap-3">
                {bounty.status === "proposed" && isConnected && (
                  <Button onClick={handleApproveBounty} disabled={actionLoading} className="gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Approve Bounty
                  </Button>
                )}

                {bounty.status === "awarded" && isConnected && (
                  <Button onClick={handleClaimBounty} disabled={actionLoading} className="gap-2">
                    <Award className="h-4 w-4" />
                    Claim Bounty
                  </Button>
                )}

                <Button variant="outline" className="gap-2 bg-transparent">
                  <ExternalLink className="h-4 w-4" />
                  View on Subscan
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
