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
  signer: any | null
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
      // Check if Polkadot extension is available
      const { web3Accounts, web3Enable, web3FromAddress } = await import("@polkadot/extension-dapp")

      // Enable the extension
      const extensions = await web3Enable("Polkadot Bounties")

      if (extensions.length === 0) {
        throw new Error("No Polkadot extension found")
      }

      // Get all accounts
      const allAccounts = await web3Accounts()

      if (allAccounts.length === 0) {
        throw new Error("No accounts found")
      }

      setAccounts(allAccounts)
      setAccount(allAccounts[0])

      // Get signer for the first account
      const injector = await web3FromAddress(allAccounts[0].address)
      setSigner(injector.signer)

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
      value={{
        account,
        accounts,
        isConnected,
        isConnecting,
        connect,
        disconnect,
        signer,
      }}
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
