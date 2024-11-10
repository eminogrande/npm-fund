import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/use-wallet";
import { formatAddress } from "@/lib/web3";
import { Wallet } from "lucide-react";

export function WalletConnect() {
  const { address, isConnecting, error, connect } = useWallet();

  return (
    <div>
      {address ? (
        <Button variant="outline">
          <Wallet className="mr-2 h-4 w-4" />
          {formatAddress(address)}
        </Button>
      ) : (
        <Button
          onClick={connect}
          disabled={isConnecting}
          variant="default"
        >
          <Wallet className="mr-2 h-4 w-4" />
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      )}
      {error && (
        <p className="text-sm text-destructive mt-2">{error}</p>
      )}
    </div>
  );
}
