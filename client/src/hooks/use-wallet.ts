import { useState, useCallback, useEffect } from "react";
import { connectWallet } from "@/lib/web3";
import type { ethers } from "ethers";

interface WalletState {
  address: string | null;
  signer: ethers.Signer | null;
  isConnecting: boolean;
  error: string | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    signer: null,
    isConnecting: false,
    error: null,
  });

  const connect = useCallback(async () => {
    setState(s => ({ ...s, isConnecting: true, error: null }));
    try {
      const { address, signer } = await connectWallet();
      setState({
        address,
        signer,
        isConnecting: false,
        error: null,
      });
    } catch (err) {
      setState(s => ({
        ...s,
        isConnecting: false,
        error: (err as Error).message,
      }));
    }
  }, []);

  useEffect(() => {
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length === 0) {
          setState({
            address: null,
            signer: null,
            isConnecting: false,
            error: null,
          });
        } else {
          connect();
        }
      });
    }
  }, [connect]);

  return {
    ...state,
    connect,
  };
}
