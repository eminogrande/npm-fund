const NPM_REGISTRY = "https://registry.npmjs.org";
const DOWNLOAD_API = "https://api.npmjs.org/downloads";

// Rate limiting configuration
const RATE_LIMIT = {
  windowMs: 60000, // 1 minute
  maxRequests: 100,
  waiting: new Set<string>(),
  lastRequest: 0,
};

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
  funding?: {
    type: string;
    url: string;
  }[];
  downloads: number;
}

async function waitForRateLimit() {
  const now = Date.now();
  const timeElapsed = now - RATE_LIMIT.lastRequest;
  const minWaitTime = RATE_LIMIT.windowMs / RATE_LIMIT.maxRequests;

  if (timeElapsed < minWaitTime) {
    await new Promise(resolve => setTimeout(resolve, minWaitTime - timeElapsed));
  }

  RATE_LIMIT.lastRequest = Date.now();
}

async function fetchWithRateLimit(url: string): Promise<Response> {
  await waitForRateLimit();
  const response = await fetch(url);
  
  if (response.status === 429) { // Too Many Requests
    await new Promise(resolve => setTimeout(resolve, 5000));
    return fetchWithRateLimit(url);
  }
  
  return response;
}

async function getPackageDownloads(name: string): Promise<number> {
  try {
    const response = await fetchWithRateLimit(
      `${DOWNLOAD_API}/point/last-week/${encodeURIComponent(name)}`
    );
    const data = await response.json();
    return data.downloads;
  } catch (error) {
    console.error(`Failed to fetch downloads for ${name}:`, error);
    return 0;
  }
}

export async function searchPackages(query: string): Promise<NPMPackage[]> {
  const response = await fetchWithRateLimit(
    `${NPM_REGISTRY}/-/v1/search?text=${encodeURIComponent(query)}&size=20`
  );
  
  const data = await response.json();
  const packages = await Promise.all(
    data.objects.map(async (obj: any) => {
      const pkg = obj.package;
      const downloads = await getPackageDownloads(pkg.name);
      
      return {
        name: pkg.name,
        description: pkg.description,
        version: pkg.version,
        maintainers: pkg.maintainers,
        homepage: pkg.links?.homepage,
        repository: pkg.links?.repository ? {
          type: 'git',
          url: pkg.links.repository
        } : undefined,
        funding: pkg.funding,
        downloads,
      };
    })
  );

  return packages;
}

export async function getPackageDetails(name: string): Promise<NPMPackage> {
  const response = await fetchWithRateLimit(`${NPM_REGISTRY}/${encodeURIComponent(name)}`);
  const data = await response.json();
  const downloads = await getPackageDownloads(name);
  
  return {
    name: data.name,
    description: data.description,
    version: data.version,
    maintainers: data.maintainers,
    homepage: data.homepage,
    repository: data.repository,
    funding: data.funding,
    downloads,
  };
}

export async function getPopularPackages(): Promise<NPMPackage[]> {
  // Search for popular packages that have funding info
  const queries = [
    'react', 'vue', 'angular', 'express', 'next', 
    'typescript', 'webpack', 'rollup', 'vite', 'jest'
  ];
  
  const allPackages = await Promise.all(
    queries.map(async query => {
      const packages = await searchPackages(query);
      return packages.filter(pkg => pkg.funding && pkg.funding.length > 0);
    })
  );
  
  // Flatten and deduplicate packages
  const seen = new Set<string>();
  return allPackages
    .flat()
    .filter(pkg => {
      if (seen.has(pkg.name)) return false;
      seen.add(pkg.name);
      return true;
    })
    .slice(0, 20);
}

export function getGithubRepoFromNpm(pkg: NPMPackage): string | null {
  if (!pkg.repository) return null;
  const url = pkg.repository.url;
  if (!url) return null;
  
  // Convert git+https://github.com/user/repo.git to user/repo
  const match = url.match(/github\.com[:/]([^/.]+\/[^/.]+)/);
  return match ? match[1] : null;
}
