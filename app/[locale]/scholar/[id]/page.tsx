import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ScholarProfile from '@/components/features/ScholarProfile';
import { cache } from 'react';

// Cached data fetcher to deduplicate requests
const getScholarData = cache(async (id: string, depth = 0) => {
  if (depth > 1) return null; // Prevent deep recursion

  // 1. Try Filesystem (Fastest for Local Dev & Build Time)
  try {
    // Use string concatenation to avoid Next.js build tracer creating overly broad globs
    const filePath = `${process.cwd()}/public/data/scholars/${id}.json`;
    if (fs.existsSync(filePath)) {
         const fileContents = fs.readFileSync(filePath, 'utf8');
         const data = JSON.parse(fileContents);
         // Hydration logic removed for performance
         return data;
    }
  } catch (e) {
    // Filesystem access failed (likely on Vercel where files are excluded)
  }

  // 2. Fallback to Fetch (For Vercel Runtime where files are static assets)
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
  if (process.env.NODE_ENV === 'development') {
    return []; 
  }

  // Read from search-index.json to avoid tracing the entire scholars directory
  const indexPath = path.join(process.cwd(), 'public/data/search-index.json');
  try {
      if (fs.existsSync(indexPath)) {
          const fileContent = fs.readFileSync(indexPath, 'utf8');
          const scholars = JSON.parse(fileContent);
          
          // Limit for build performance
          return scholars
            .slice(0, 20) 
            .map((s: any) => ({
              id: s.id,
            }));
      }
      return [];
  } catch(e) {
      console.error("Error generating static params:", e);
      return [];
  }
}

export default async function ScholarPage({ params }: PageProps) {
  const resolvedParams = await params;
  
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
