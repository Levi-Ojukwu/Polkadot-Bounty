"use client"

import { Badge } from "@/components/ui/badge"
import { useBountyUpdates } from "@/hooks/use-bounty-updates"
import { Wifi, WifiOff, Activity } from "lucide-react"

export function RealTimeIndicator() {
  const { isConnected, updates } = useBountyUpdates()

  const recentUpdates = updates.slice(0, 3)

  return (
    <div className="flex items-center gap-2">
      <Badge variant={isConnected ? "default" : "secondary"} className="gap-1">
        {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
        {isConnected ? "Live" : "Offline"}
      </Badge>

      {recentUpdates.length > 0 && (
        <Badge variant="outline" className="gap-1">
          <Activity className="h-3 w-3" />
          {recentUpdates.length} updates
        </Badge>
      )}
    </div>
  )
}
