/** @format */

"use client";

import type React from "react";
import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/lib/wallet-context";
import { useTransactions } from "@/lib/transaction-context";
import { createBountyTransaction } from "@/lib/transaction-utils";
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreateBountyDialogProps {
	children: React.ReactNode;
	onBountyCreated?: () => void;
}

export function CreateBountyDialog({
	children,
	onBountyCreated,
}: CreateBountyDialogProps) {
	const [open, setOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		value: "",
	});

	const { isConnected, signer, account } = useWallet();
	const { addTransaction, updateTransaction } = useTransactions();
	const { toast } = useToast();

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!isConnected || !signer || !account) {
			toast({
				title: "Wallet not connected",
				description: "Please connect your wallet to create a bounty",
				variant: "destructive",
			});
			return;
		}

		if (!formData.title || !formData.description || !formData.value) {
			toast({
				title: "Missing information",
				description: "Please fill in all required fields",
				variant: "destructive",
			});
			return;
		}

		const valueNumber = Number.parseFloat(formData.value);
		if (isNaN(valueNumber) || valueNumber <= 0) {
			toast({
				title: "Invalid value",
				description: "Enter a positive number for the bounty value",
				variant: "destructive",
			});
			return;
		}

		setIsSubmitting(true);

		const txId = addTransaction({
			type: "create_bounty",
			status: "pending",
			metadata: {
				title: formData.title,
				value: formData.value,
			},
		});

		try {
			// Convert DOT to Planck (1 DOT = 10^10 Planck)
			function dotToPlanck(dotStr: string): bigint {
				const [intPart, fracPart = ""] = dotStr.split(".");
				const padded = (fracPart + "0000000000").slice(0, 10); // exactly 10 decimals
				return BigInt(intPart + padded);
			}

			const valueInPlanck = dotToPlanck(formData.value);
			console.log(
				"[CreateBountyDialog] Value in Planck:",
				valueInPlanck.toString(),
			);

			// ⚡ remove account.address here – it was shifting arguments
			const result = await createBountyTransaction(
				signer,
				formData.title.trim(),
				formData.description.trim(),
				valueInPlanck,
			);

			if (result.success) {
				updateTransaction(txId, {
					status: "success",
					hash: result.hash,
					blockHash: result.blockHash,
				});

				toast({
					title: "Bounty created successfully!",
					description: `Your bounty "${formData.title}" has been proposed.`,
				});

				setFormData({ title: "", description: "", value: "" });
				setOpen(false);
				onBountyCreated?.();
			} else {
				updateTransaction(txId, {
					status: "error",
					error: result.error,
				});
				toast({
					title: "Failed to create bounty",
					description: result.error || "An unexpected error occurred",
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error("[CreateBountyDialog] Error:", error);
			updateTransaction(txId, {
				status: "error",
				error: error instanceof Error ? error.message : "Unknown error",
			});
			toast({
				title: "Failed to create bounty",
				description:
					error instanceof Error
						? error.message
						: "An unexpected error occurred",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className='sm:max-w-[600px]'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2'>
						<Plus className='h-5 w-5' />
						Create New Bounty
					</DialogTitle>
				</DialogHeader>

				<form
					onSubmit={handleSubmit}
					className='space-y-6'>
					<div className='space-y-2'>
						<Label htmlFor='title'>Bounty Title *</Label>
						<Input
							id='title'
							placeholder='Enter a descriptive title'
							value={formData.title}
							onChange={(e) => handleInputChange("title", e.target.value)}
							disabled={isSubmitting}
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='description'>Description *</Label>
						<Textarea
							id='description'
							placeholder='Provide details, deliverables, and acceptance criteria...'
							value={formData.description}
							onChange={(e) => handleInputChange("description", e.target.value)}
							disabled={isSubmitting}
							rows={6}
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='value'>Bounty Value (DOT) *</Label>
						<Input
							id='value'
							type='number'
							step='0.1'
							min='0'
							placeholder='Enter bounty value in DOT'
							value={formData.value}
							onChange={(e) => handleInputChange("value", e.target.value)}
							disabled={isSubmitting}
						/>
						<p className='text-xs text-muted-foreground'>
							Minimum value varies by network. Consider complexity and required
							effort.
						</p>
					</div>

					{!isConnected && (
						<div className='p-4 bg-destructive/10 border border-destructive/20 rounded-lg'>
							<p className='text-sm text-destructive'>
								Please connect your wallet to create a bounty.
							</p>
						</div>
					)}

					<div className='flex gap-3 pt-4'>
						<Button
							type='button'
							variant='outline'
							onClick={() => setOpen(false)}
							disabled={isSubmitting}
							className='flex-1'>
							Cancel
						</Button>
						<Button
							type='submit'
							disabled={!isConnected || isSubmitting}
							className='flex-1 gap-2'>
							{isSubmitting ? (
								<>
									<Loader2 className='h-4 w-4 animate-spin' />
									Creating...
								</>
							) : (
								<>
									<Plus className='h-4 w-4' />
									Create Bounty
								</>
							)}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
