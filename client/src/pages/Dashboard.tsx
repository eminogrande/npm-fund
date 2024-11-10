import { useUser } from "@/hooks/use-user";
import { usePackages } from "@/hooks/use-packages";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PackageCard } from "@/components/PackageCard";

export function Dashboard() {
  const { user } = useUser();
  const { data: packages } = usePackages();

  const myPackages = packages?.filter(
    (pkg) => pkg.maintainerId === user?.id
  );

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          Please log in to view your dashboard
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Maintainer Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Funding Received</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {myPackages?.reduce(
                (sum, pkg) => sum + Number(pkg.tokensRaised),
                0
              )} ETH
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Package Count</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {myPackages?.length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-4">Your Packages</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myPackages?.map((pkg) => (
          <PackageCard key={pkg.id} package={pkg} />
        ))}
      </div>
    </div>
  );
}
