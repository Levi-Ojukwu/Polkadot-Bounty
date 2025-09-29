"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useWallet } from "@/lib/wallet-context"
import { useTransactions } from "@/lib/transaction-context"
import { createBountyTransaction } from "@/lib/transaction-utils"
import { Plus, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DialogDescription } from "@radix-ui/react-dialog"

interface CreateBountyDialogProps {
  children: React.ReactNode
  onBountyCreated?: () => void
}

export function CreateBountyDialog({ children, onBountyCreated }: CreateBountyDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    value: "",
  })

  const { isConnected, signer } = useWallet()
  const { addTransaction, updateTransaction } = useTransactions()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected || !signer) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a bounty",
        variant: "destructive",
      })
      return
    }

    if (!formData.title || !formData.description || !formData.value) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // ✅ Convert DOT → Planck safely before sending to chain
    const humanDot = parseFloat(formData.value)
    if (Number.isNaN(humanDot) || humanDot <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid bounty value greater than 0",
        variant: "destructive",
      })
      return
    }

    // Polkadot: 1 DOT = 10^10 Planck
    const PLANCKS_PER_DOT = 10 ** 10
    // Round to avoid floating-point errors
    const valueInPlanckNumber = Math.round(humanDot * PLANCKS_PER_DOT)
    const valueInPlanck = BigInt(valueInPlanckNumber)

    setIsSubmitting(true)

    const txId = addTransaction({
      type: "create_bounty",
      status: "pending",
      metadata: {
        title: formData.title,
        value: formData.value,
      },
    })

    try {
      const result = await createBountyTransaction(
        signer,
        formData.title,
        formData.description,
        valueInPlanck // ✅ now safely a BigInt
      )

      if (result.success) {
        updateTransaction(txId, {
          status: "success",
          hash: result.hash,
          blockHash: result.blockHash,
        })

        toast({
          title: "Bounty created successfully!",
          description: `Your bounty "${formData.title}" has been proposed.`,
        })

        // Reset form and close dialog
        setFormData({ title: "", description: "", value: "" })
        setOpen(false)
        onBountyCreated?.()
      } else {
        updateTransaction(txId, { status: "error", error: result.error })
        toast({
          title: "Failed to create bounty",
          description: result.error || "An unexpected error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Failed to create bounty:", error)
      updateTransaction(txId, {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      })
      toast({
        title: "Failed to create bounty",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Bounty
          </DialogTitle>

          <DialogDescription>
            Fill out the details below to propose a new bounty.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Bounty Title *</Label>
            <Input
              id="title"
              placeholder="Enter a clear, descriptive title for your bounty"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Provide detailed requirements, deliverables, and acceptance criteria..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              disabled={isSubmitting}
              rows={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Bounty Value (DOT) *</Label>
            <Input
              id="value"
              type="number"
              step="0.1"
              min="0"
              placeholder="Enter bounty value in DOT"
              value={formData.value}
              onChange={(e) => handleInputChange("value", e.target.value)}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Minimum value varies by network. Consider the complexity and time required.
            </p>
          </div>

          {!isConnected && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">
                Please connect your wallet to create a bounty
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isConnected || isSubmitting}
              className="flex-1 gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Bounty
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


// "use client"

// import type React from "react"

// import { useState } from "react"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea"
// import { Label } from "@/components/ui/label"
// import { useWallet } from "@/lib/wallet-context"
// import { useTransactions } from "@/lib/transaction-context"
// import { createBountyTransaction } from "@/lib/transaction-utils"
// import { Plus, Loader2 } from "lucide-react"
// import { useToast } from "@/hooks/use-toast"
// import { DialogDescription } from "@radix-ui/react-dialog"

// interface CreateBountyDialogProps {
//   children: React.ReactNode
//   onBountyCreated?: () => void
// }

// export function CreateBountyDialog({ children, onBountyCreated }: CreateBountyDialogProps) {
//   const [open, setOpen] = useState(false)
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     value: "",
//   })

//   const { isConnected, signer } = useWallet()
//   const { addTransaction, updateTransaction } = useTransactions()
//   const { toast } = useToast()

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()

//     if (!isConnected || !signer) {
//       toast({
//         title: "Wallet not connected",
//         description: "Please connect your wallet to create a bounty",
//         variant: "destructive",
//       })
//       return
//     }

//     if (!formData.title || !formData.description || !formData.value) {
//       toast({
//         title: "Missing information",
//         description: "Please fill in all required fields",
//         variant: "destructive",
//       })
//       return
//     }

//     setIsSubmitting(true)

//     const txId = addTransaction({
//       type: "create_bounty",
//       status: "pending",
//       metadata: {
//         title: formData.title,
//         value: formData.value,
//       },
//     })

//     try {
//       // Convert DOT to Planck (1 DOT = 10^10 Planck)
//       const valueInPlanck = Math.floor(Number.parseFloat(formData.value) * Math.pow(10, 10))

//       const result = await createBountyTransaction(signer, formData.title, formData.description, valueInPlanck)

//       if (result.success) {
//         updateTransaction(txId, {
//           status: "success",
//           hash: result.hash,
//           blockHash: result.blockHash,
//         })

//         toast({
//           title: "Bounty created successfully!",
//           description: `Your bounty "${formData.title}" has been proposed`,
//         })

//         // Reset form and close dialog
//         setFormData({ title: "", description: "", value: "" })
//         setOpen(false)

//         // Notify parent component
//         onBountyCreated?.()
//       } else {
//         updateTransaction(txId, {
//           status: "error",
//           error: result.error,
//         })

//         toast({
//           title: "Failed to create bounty",
//           description: result.error || "An unexpected error occurred",
//           variant: "destructive",
//         })
//       }
//     } catch (error) {
//       console.error("[v0] Failed to create bounty:", error)

//       updateTransaction(txId, {
//         status: "error",
//         error: error instanceof Error ? error.message : "Unknown error",
//       })

//       toast({
//         title: "Failed to create bounty",
//         description: error instanceof Error ? error.message : "An unexpected error occurred",
//         variant: "destructive",
//       })
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   const handleInputChange = (field: string, value: string) => {
//     setFormData((prev) => ({ ...prev, [field]: value }))
//   }

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>{children}</DialogTrigger>
//       <DialogContent className="sm:max-w-[600px]">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2">
//             <Plus className="h-5 w-5" />
//             Create New Bounty
//           </DialogTitle>

//           <DialogDescription >
//       Fill out the details below to propose a new bounty.
//     </DialogDescription>
//         </DialogHeader>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="space-y-2">
//             <Label htmlFor="title">Bounty Title *</Label>
//             <Input
//               id="title"
//               placeholder="Enter a clear, descriptive title for your bounty"
//               value={formData.title}
//               onChange={(e) => handleInputChange("title", e.target.value)}
//               disabled={isSubmitting}
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="description">Description *</Label>
//             <Textarea
//               id="description"
//               placeholder="Provide detailed requirements, deliverables, and acceptance criteria..."
//               value={formData.description}
//               onChange={(e) => handleInputChange("description", e.target.value)}
//               disabled={isSubmitting}
//               rows={6}
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="value">Bounty Value (DOT) *</Label>
//             <Input
//               id="value"
//               type="number"
//               step="0.1"
//               min="0"
//               placeholder="Enter bounty value in DOT"
//               value={formData.value}
//               onChange={(e) => handleInputChange("value", e.target.value)}
//               disabled={isSubmitting}
//             />
//             <p className="text-xs text-muted-foreground">
//               Minimum value varies by network. Consider the complexity and time required.
//             </p>
//           </div>

//           {!isConnected && (
//             <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
//               <p className="text-sm text-destructive">Please connect your wallet to create a bounty</p>
//             </div>
//           )}

//           <div className="flex gap-3 pt-4">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => setOpen(false)}
//               disabled={isSubmitting}
//               className="flex-1"
//             >
//               Cancel
//             </Button>
//             <Button type="submit" disabled={!isConnected || isSubmitting} className="flex-1 gap-2">
//               {isSubmitting ? (
//                 <>
//                   <Loader2 className="h-4 w-4 animate-spin" />
//                   Creating...
//                 </>
//               ) : (
//                 <>
//                   <Plus className="h-4 w-4" />
//                   Create Bounty
//                 </>
//               )}
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   )
// }