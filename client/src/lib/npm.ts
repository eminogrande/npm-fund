const NPM_REGISTRY = "https://registry.npmjs.org";

export interface NPMPackage {
  name: string;
  description: string;
  version: string;
  maintainers: Array<{
    name: string;
    email: string;
  }>;
  homepage?: string;
  repository?: {
    type: string;
    url: string;
  };
}

export async function searchPackages(query: string): Promise<NPMPackage[]> {
  const response = await fetch(
    `${NPM_REGISTRY}/-/v1/search?text=${encodeURIComponent(query)}`
  );
  const data = await response.json();
  return data.objects.map((obj: any) => obj.package);
}

export async function getPackageDetails(name: string): Promise<NPMPackage> {
  const response = await fetch(`${NPM_REGISTRY}/${encodeURIComponent(name)}`);
  return response.json();
}

export function getGithubRepoFromNpm(pkg: NPMPackage): string | null {
  if (!pkg.repository) return null;
  const url = pkg.repository.url;
  if (!url) return null;
  
  // Convert git+https://github.com/user/repo.git to user/repo
  const match = url.match(/github\.com[:/]([^/.]+\/[^/.]+)/);
  return match ? match[1] : null;
}
