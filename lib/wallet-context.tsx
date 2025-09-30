/** @format */

"use client";

import React, { createContext, useContext, useState } from "react";

interface WalletContextType {
	account: any | null;
	accounts: any[];
	isConnected: boolean;
	isConnecting: boolean;
	connect: () => Promise<void>;
	disconnect: () => void;
	signer: any | null; // PAPI signer
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
	const [account, setAccount] = useState<any | null>(null);
	const [accounts, setAccounts] = useState<any[]>([]);
	const [isConnected, setIsConnected] = useState(false);
	const [isConnecting, setIsConnecting] = useState(false);
	const [signer, setSigner] = useState<any | null>(null);

	const connect = async () => {
		setIsConnecting(true);
		try {
			const { web3Accounts, web3Enable } = await import(
				"@polkadot/extension-dapp"
			);
			const extensions = await web3Enable("Polkadot Bounties");
			if (!extensions || extensions.length === 0)
				throw new Error("No Polkadot extension found");

			const allAccounts = await web3Accounts();
			if (!allAccounts || allAccounts.length === 0)
				throw new Error("No accounts available in extension");

			const selected = allAccounts[0];
			setAccounts(allAccounts);
			setAccount(selected);

			const cryptoTypeMap: Record<
				"sr25519" | "ed25519" | "ecdsa",
				"Sr25519" | "Ed25519" | "Ecdsa"
			> = {
				sr25519: "Sr25519",
				ed25519: "Ed25519",
				ecdsa: "Ecdsa",
			};

			const typeKey = (selected.type ?? "sr25519").toLowerCase() as | "sr25519" | "ed";
			const cryptoType = cryptoTypeMap[typeKey] ?? "Sr25519";

			const { getPolkadotSigner } = await import("polkadot-api/signer");
			const extensionSigner = extensions[0].signer as any;

			const papiSigner = getPolkadotSigner(
				extensionSigner,
				selected.address,
				cryptoType,
			);
			setSigner(papiSigner);

			setIsConnected(true);
		} catch (err) {
			console.error("Wallet connect failed:", err);
		} finally {
			setIsConnecting(false);
		}
	};

	const disconnect = () => {
		setAccount(null);
		setAccounts([]);
		setSigner(null);
		setIsConnected(false);
	};

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
			}}>
			{children}
		</WalletContext.Provider>
	);
}

export function useWallet() {
	const ctx = useContext(WalletContext);
	if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
	return ctx;
}
