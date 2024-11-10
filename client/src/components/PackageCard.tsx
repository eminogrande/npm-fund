import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package } from "db/schema";
import { formatAddress } from "@/lib/web3";

interface PackageCardProps {
  package: Package;
  onFund?: () => void;
}

export function PackageCard({ package: pkg, onFund }: PackageCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{pkg.name}</h3>
          <span className="text-sm text-muted-foreground">v{pkg.version}</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{pkg.description}</p>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium">Downloads</p>
            <p className="text-2xl font-bold">{pkg.downloads.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Tokens Raised</p>
            <p className="text-2xl font-bold">{pkg.tokensRaised} ETH</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Maintainer: {formatAddress(pkg.maintainerId)}
          </div>
          <Button onClick={onFund}>Fund Package</Button>
        </div>
      </CardFooter>
    </Card>
  );
}
