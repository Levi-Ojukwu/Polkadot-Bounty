"use client"

import { WalletConnect } from "./wallet-connect"
import { RealTimeIndicator } from "./real-time-indicator" // Added real-time indicator
import { Search, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">PB</span>
            </div>
            <h1 className="text-xl font-semibold">Polkadot Bounties</h1>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Button variant="ghost" className="text-sm">
              All Bounties
            </Button>
            <Button variant="ghost" className="text-sm">
              My Bounties
            </Button>
            <Button variant="ghost" className="text-sm">
              Create
            </Button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search bounties..." className="pl-10 w-64" />
          </div>

          <RealTimeIndicator />

          <WalletConnect />

          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
