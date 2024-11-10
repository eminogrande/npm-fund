import { useState } from "react";
import { usePackages } from "@/hooks/use-packages";
import { PackageCard } from "@/components/PackageCard";
import { SearchBar } from "@/components/SearchBar";
import { WalletConnect } from "@/components/WalletConnect";

export function Home() {
  const [search, setSearch] = useState("");
  const { data: packages, error } = usePackages(search);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">NPM Package Funding</h1>
        <WalletConnect />
      </div>

      <div className="max-w-xl mx-auto mb-8">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search NPM packages..."
        />
      </div>

      {error ? (
        <div className="text-center text-destructive">
          Failed to load packages
        </div>
      ) : !packages ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              package={pkg}
              onFund={() => {
                // Implement funding flow
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
