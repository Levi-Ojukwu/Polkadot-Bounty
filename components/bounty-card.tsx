"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, User, DollarSign, ExternalLink } from "lucide-react"

interface BountyCardProps {
  bounty: {
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
  onViewDetails: (id: number) => void
}

const statusColors = {
  proposed: "bg-yellow-500/20 text-yellow-400",
  approved: "bg-blue-500/20 text-blue-400",
  active: "bg-green-500/20 text-green-400",
  awarded: "bg-purple-500/20 text-purple-400",
  claimed: "bg-gray-500/20 text-gray-400",
}

export function BountyCard({ bounty, onViewDetails }: BountyCardProps) {
  return (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-muted-foreground">#{bounty.id}</span>
              <Badge className={statusColors[bounty.status]}>
                {bounty.status.charAt(0).toUpperCase() + bounty.status.slice(1)}
              </Badge>
            </div>
            <h3 className="font-semibold text-lg mb-2 line-clamp-2">{bounty.title}</h3>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
              <DollarSign className="h-3 w-3" />
              <span>Value</span>
            </div>
            <p className="font-bold text-lg">{bounty.value}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{bounty.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span>
              Proposer: {bounty.proposer.slice(0, 8)}...{bounty.proposer.slice(-6)}
            </span>
          </div>

          {bounty.curator && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>
                Curator: {bounty.curator.slice(0, 8)}...{bounty.curator.slice(-6)}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Created: {new Date(bounty.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={() => onViewDetails(bounty.id)} className="w-full gap-2">
          <ExternalLink className="h-3 w-3" />
          View Details
        </Button>
      </CardContent>
    </Card>
  )
}
