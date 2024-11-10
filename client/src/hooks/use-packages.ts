import useSWR from "swr";
import type { Package, FundingEvent } from "db/schema";

export function usePackages(search?: string) {
  return useSWR<Package[]>(
    search ? `/api/packages?search=${search}` : "/api/packages"
  );
}

export function usePackageDetails(name?: string) {
  const { data: pkg, error } = useSWR<Package>(
    name ? `/api/packages/${name}` : null
  );
  const { data: events } = useSWR<FundingEvent[]>(
    name ? `/api/packages/${name}/events` : null
  );

  return {
    package: pkg,
    events,
    isLoading: !error && !pkg,
    error,
  };
}
