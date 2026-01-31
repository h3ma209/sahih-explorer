import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ScholarProfile from '@/components/features/ScholarProfile';
import { cache } from 'react';

// Cached data fetcher to deduplicate requests
const getScholarData = cache(async (id: string, depth = 0) => {
  if (depth > 1) return null; // Prevent deep recursion

  // Use string concatenation to avoid Next.js build tracer creating overly broad globs
  const filePath = `${process.cwd()}/public/data/scholars/${id}.json`;
  
  try {
     // Check existence first to avoid throw/catch overhead for missing files
     if (!fs.existsSync(filePath)) return null;

     const fileContents = fs.readFileSync(filePath, 'utf8');
     const data = JSON.parse(fileContents);

     // Hydration of children removed to prevent build warnings and performance bottlenecks.
     // Relationships should be handled by client-side or search-index lookups.

     return data;
  } catch (e) {
     return null;
  }
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

  // Use string concatenation to avoid overly broad glob warning
  const scholarsDir = `${process.cwd()}/public/data/scholars`;
  try {
      const filenames = fs.readdirSync(scholarsDir);
      // Limit for build performance - map top 1000 or strategic subset
      return filenames
        .filter((file) => file.endsWith('.json'))
        .slice(0, 1000) 
        .map((file) => ({
          id: file.replace('.json', ''),
        }));
  } catch(e) {
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
