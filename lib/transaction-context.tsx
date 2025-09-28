"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"

interface Transaction {
  id: string
  type: "create_bounty" | "approve_bounty" | "claim_bounty" | "award_bounty"
  status: "pending" | "success" | "error"
  hash?: string
  blockHash?: string
  error?: string
  timestamp: number
  metadata?: any
}

interface TransactionContextType {
  transactions: Transaction[]
  addTransaction: (tx: Omit<Transaction, "id" | "timestamp">) => string
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
  clearTransactions: () => void
  getPendingTransactions: () => Transaction[]
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const addTransaction = useCallback((tx: Omit<Transaction, "id" | "timestamp">) => {
    const id = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newTransaction: Transaction = {
      ...tx,
      id,
      timestamp: Date.now(),
    }

    setTransactions((prev) => [newTransaction, ...prev])
    return id
  }, [])

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) => prev.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx)))
  }, [])

  const clearTransactions = useCallback(() => {
    setTransactions([])
  }, [])

  const getPendingTransactions = useCallback(() => {
    return transactions.filter((tx) => tx.status === "pending")
  }, [transactions])

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransaction,
        clearTransactions,
        getPendingTransactions,
      }}
    >
      {children}
    </TransactionContext.Provider>
  )
}

export function useTransactions() {
  const context = useContext(TransactionContext)
  if (context === undefined) {
    throw new Error("useTransactions must be used within a TransactionProvider")
  }
  return context
}
