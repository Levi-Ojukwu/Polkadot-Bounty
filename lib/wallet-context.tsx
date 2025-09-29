"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface WalletContextType {
  account: any | null
  accounts: any[]
  isConnected: boolean
  isConnecting: boolean
  connect: () => Promise<void>
  disconnect: () => void
  signer: any | null // PAPI Signer
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<any | null>(null)
  const [accounts, setAccounts] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [signer, setSigner] = useState<any | null>(null)

  const connect = async () => {
    setIsConnecting(true)
    try {
      const { web3Accounts, web3Enable } = await import("@polkadot/extension-dapp")
      const { getPolkadotSigner } = await import("polkadot-api/signer")

      const extensions = await web3Enable("Polkadot Bounties")
      if (extensions.length === 0) throw new Error("No Polkadot extension found")

      const allAccounts = await web3Accounts()
      if (allAccounts.length === 0) throw new Error("No accounts found")

      const selectedAccount = allAccounts[0]
      setAccounts(allAccounts)
      setAccount(selectedAccount)

      // ✅ PAPI signer for transactions
      const papiSigner = getPolkadotSigner(
        extensions[0].signer,
        selectedAccount.address,
        (selectedAccount.type as "sr25519" | "ed25519" | "ecdsa") || "sr25519"
      )

      setSigner(papiSigner)
      setIsConnected(true)
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    setAccount(null)
    setAccounts([])
    setIsConnected(false)
    setSigner(null)
  }

  return (
    <WalletContext.Provider
      value={{ account, accounts, isConnected, isConnecting, connect, disconnect, signer }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
