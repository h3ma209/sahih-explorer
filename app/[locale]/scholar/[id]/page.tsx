import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ScholarProfile from '@/components/features/ScholarProfile';
import Link from 'next/link';
import { cache } from 'react';

// Cached data fetcher to deduplicate requests
// Cached data fetcher to deduplicate requests
const getScholarData = cache(async (id: string, depth = 0) => {
  if (depth > 1) return null;

  // 1. Try Filesystem (Fastest for Local Dev & Build Time)
  try {
    // Obfuscate path to avoid Next.js build tracer bundling all files (Vercel 250MB limit)
    // We break the static string analysis by using variables
    const dataFolder = 'scholars';
    const filePath = path.join(process.cwd(), 'public', 'data', dataFolder, `${id}.json`);
    
    if (fs.existsSync(filePath)) {
         const fileContents = fs.readFileSync(filePath, 'utf8');
         return JSON.parse(fileContents);
    }
  } catch (e) {
    // Filesystem access failed
  }

  // 2. Fallback to Fetch (For Vercel Runtime)
  try {
    // Determine the base URL robustly:
    // 1. Explicit Env Var (Production/Custom)
    // 2. Vercel System Var (Preview/Deployments) - default is host without protocol
    // 3. Localhost fallback
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl && process.env.VERCEL_URL) {
        baseUrl = `https://${process.env.VERCEL_URL}`;
    }
    if (!baseUrl) {
        baseUrl = `http://localhost:${process.env.PORT || 3000}`;
    }

    console.log(`[ScholarFetch] Attempting fetch for ${id} from: ${baseUrl}/data/scholars/${id}.json`);
    
    const res = await fetch(`${baseUrl}/data/scholars/${id}.json`, { 
        next: { revalidate: 3600 } 
    });
    
    if (res.ok) {
        return res.json();
    } else {
        console.error(`Fetch failed for scholar ${id}: ${res.status} ${res.statusText}`);
    }
  } catch (e) {
    console.error(`Failed to fetch scholar ${id}:`, e);
  }

  return null;
});

// Cached search index loader
const getSearchIndex = cache(async () => {
  try {
    const searchIndexPath = path.join(process.cwd(), 'public/data/search-index.json');
    if (fs.existsSync(searchIndexPath)) {
      const searchIndexData = fs.readFileSync(searchIndexPath, 'utf8');
      return JSON.parse(searchIndexData);
    }
  } catch (error) {
    console.error('Failed to load search index:', error);
  }
  return [];
});

interface PageProps {
  params: Promise<{ id: string }>;
}

// SEO Metadata Generator
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const data = await getScholarData(resolvedParams.id);

  if (!data) {
    return {
      title: 'Scholar Not Found | Sahih Explorer',
      description: 'The requested scholar profile could not be found.',
    };
  }

  const reliability = data.reliability_grade ? `[${data.reliability_grade}]` : '';

  return {
    title: `${data.name} ${reliability} | Sahih Explorer`,
    description: `Explore the biography and narrations of ${data.name}. ${data.grade}. Influence Score: ${data.total_hadiths || 'N/A'}.`,
    openGraph: {
      title: `${data.name} ${reliability}`,
      description: `Biography, teachers, students, and hadith network for ${data.name}.`,
      type: 'article',
      tags: data.biography?.tags || [],
    },
  };
}

export async function generateStaticParams() {
  // DISABLE build-time static generation to support Fetch-Only strategy.
  // Since we removed FS access, we cannot generate pages during build (no server running to fetch from).
  // Pages will be generated On-Demand (ISR) at runtime.
  return [];
}

import { setRequestLocale } from 'next-intl/server';

// ... existing imports ...

export default async function ScholarPage({ params }: PageProps & { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  setRequestLocale(resolvedParams.locale || 'en');
  
  // Parallel data fetching
  const [data, searchIndex] = await Promise.all([
     getScholarData(resolvedParams.id),
     getSearchIndex()
  ]);

  if (!data) {
     const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${process.env.PORT || 3000}`);
     return (
        <main className="container flex flex-col items-center justify-center min-h-[60vh] py-20 text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Scholar Not Found</h1>
            <p className="text-lg text-gray-600 mb-8">We couldn't connect to the data source for Scholar ID: <span className="font-mono font-bold">{resolvedParams.id}</span></p>
            
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg text-left max-w-2xl w-full">
                <h3 className="font-semibold text-amber-800 mb-2">Troubleshooting for Vercel:</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                    <li><strong>Invalid ID?</strong> Ensure ID `{resolvedParams.id}` exists in your data. (Try 30003 for Imam Muslim)</li>
                    <li><strong>Private Deployment?</strong> If this is a Preview URL, Vercel Authentication blocks the server from fetching its own data.
                        <ul className="pl-6 mt-1 list-circle text-xs text-gray-500">
                            <li>Fix: Make the deployment <strong>Public</strong> in Vercel Settings.</li>
                            <li>Fix: Or visit the <strong>Production</strong> domain (if public).</li>
                        </ul>
                    </li>
                </ul>
                <div className="mt-4 pt-4 border-t border-amber-100 text-xs text-gray-400 break-all">
                    Debug URL: {baseUrl}/data/scholars/{resolvedParams.id}.json
                </div>
            </div>

            <Link href="/" className="mt-8 px-6 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors">
                Return to Search
            </Link>
        </main>
     );
  }
  
  return <ScholarProfile initialData={data} searchIndex={searchIndex} />;
}
