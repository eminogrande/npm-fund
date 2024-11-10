import { useParams } from "wouter";
import { usePackageDetails } from "@/hooks/use-packages";
import { WalletConnect } from "@/components/WalletConnect";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function Package() {
  const { name } = useParams();
  const { package: pkg, events, isLoading, error } = usePackageDetails(name);
  const [fundAmount, setFundAmount] = useState("");

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading package</div>;
  if (!pkg) return <div>Package not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">{pkg.name}</h1>
            <p className="text-lg text-muted-foreground">
              {pkg.description}
            </p>
          </div>
          <WalletConnect />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Package Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Version</p>
                  <p className="text-2xl font-bold">{pkg.version}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Downloads</p>
                  <p className="text-2xl font-bold">
                    {pkg.downloads.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Total Funding</p>
                  <p className="text-2xl font-bold">{pkg.tokensRaised} ETH</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fund This Package</CardTitle>
              <CardDescription>
                Support the maintainers by sending ETH
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    placeholder="Amount in ETH"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                  />
                  <Button className="whitespace-nowrap">
                    Send Funding
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Funding History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events?.map((event) => (
                <div
                  key={event.id}
                  className="flex justify-between items-center"
                >
                  <div className="flex space-x-4">
                    <span className="font-medium">
                      {event.amount} ETH
                    </span>
                    <span className="text-muted-foreground">
                      from {event.fromAddress}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(event.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
