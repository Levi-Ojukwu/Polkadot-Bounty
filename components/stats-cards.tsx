"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface StatsCardsProps {
  stats: {
    totalBounties: number
    activeBounties: number
    totalValue: string
    myBounties: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Bounties</p>
              <p className="text-2xl font-bold">{stats.totalBounties.toLocaleString()}</p>
            </div>
            <Badge variant="secondary" className="bg-chart-1/20 text-chart-1">
              All
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Bounties</p>
              <p className="text-2xl font-bold">{stats.activeBounties.toLocaleString()}</p>
            </div>
            <Badge variant="secondary" className="bg-chart-3/20 text-chart-3">
              Active
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold">{stats.totalValue}</p>
            </div>
            <Badge variant="secondary" className="bg-chart-2/20 text-chart-2">
              DOT
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">My Bounties</p>
              <p className="text-2xl font-bold">{stats.myBounties}</p>
            </div>
            <Badge variant="secondary" className="bg-chart-4/20 text-chart-4">
              Mine
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
