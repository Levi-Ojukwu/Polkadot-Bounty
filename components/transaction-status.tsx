"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTransactions } from "@/lib/transaction-context"
import { Loader2, CheckCircle, XCircle, Clock, ExternalLink, X } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export function TransactionStatus() {
  const { transactions, clearTransactions } = useTransactions()
  const [isOpen, setIsOpen] = useState(false)

  const pendingTransactions = transactions.filter((tx) => tx.status === "pending")
  const recentTransactions = transactions.slice(0, 5)

  if (transactions.length === 0) {
    return null
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Loader2 className="h-4 w-4 animate-spin text-yellow-400" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-400" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400"
      case "success":
        return "bg-green-500/20 text-green-400"
      case "error":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "create_bounty":
        return "Create Bounty"
      case "approve_bounty":
        return "Approve Bounty"
      case "claim_bounty":
        return "Claim Bounty"
      case "award_bounty":
        return "Award Bounty"
      default:
        return type
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Transactions
                  {pendingTransactions.length > 0 && (
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
                      {pendingTransactions.length} pending
                    </Badge>
                  )}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    clearTransactions()
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="pt-0 max-h-64 overflow-y-auto">
              <div className="space-y-3">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3 p-2 rounded-lg bg-accent/30">
                    {getStatusIcon(tx.status)}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">{getTypeLabel(tx.type)}</span>
                        <Badge className={getStatusColor(tx.status)} variant="secondary">
                          {tx.status}
                        </Badge>
                      </div>

                      {tx.hash && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span className="font-mono">
                            {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                          </span>
                          <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                            <ExternalLink className="h-2 w-2" />
                          </Button>
                        </div>
                      )}

                      {tx.error && <p className="text-xs text-red-400 mt-1">{tx.error}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  )
}
