import useSWR from "swr";
import type { Maintainer } from "db/schema";

export function useUser() {
  const { data, error, mutate } = useSWR<Maintainer>("/api/user", {
    revalidateOnFocus: false,
  });

  return {
    user: data,
    isLoading: !error && !data,
    error,
  };
}
