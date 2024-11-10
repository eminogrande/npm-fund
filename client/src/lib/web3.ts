import { ethers } from "ethers";

export const FUNDING_CONTRACT_ADDRESS = "0x..."; // Contract address would go here
export const FUNDING_CONTRACT_ABI = []; // Contract ABI would go here

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask not found");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  
  return {
    address: accounts[0],
    signer
  };
}

export async function fundPackage(
  packageName: string, 
  amount: string,
  signer: ethers.Signer
) {
  const contract = new ethers.Contract(
    FUNDING_CONTRACT_ADDRESS,
    FUNDING_CONTRACT_ABI,
    signer
  );

  const tx = await contract.fund(packageName, {
    value: ethers.parseEther(amount)
  });

  return tx.wait();
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
