import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ScholarProfile from '@/components/features/ScholarProfile';
import { cache } from 'react';

// Cached data fetcher to deduplicate requests
// Cached data fetcher to deduplicate requests
const getScholarData = cache(async (id: string, depth = 0) => {
  if (depth > 1) return null;

  // FETCH ONLY STRATEGY (STRICT)
  // We explicitly removed the filesystem fallback here. 
  // This ensures Vercel's bundler does NOT see a dependency on the 'scholars' directory.
  // We rely fully on runtime fetching from the public assets.
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const res = await fetch(`${baseUrl}/data/scholars/${id}.json`, { 
        next: { revalidate: 3600 } 
    });
    if (res.ok) {
        return res.json();
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
    notFound();
  }
  
  return <ScholarProfile initialData={data} searchIndex={searchIndex} />;
}
