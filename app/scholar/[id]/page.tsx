import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ScholarProfile from '@/components/features/ScholarProfile';

// Helper to fetch data on the server
async function getScholarData(id: string) {
  const filePath = path.join(process.cwd(), 'public/data/scholars', `${id}.json`);
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    return null;
  }
}

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

  return {
    title: `${data.name} | Sahih Explorer`,
    description: `Explore the biography, teachers, students, and narrations of ${data.name} (${data.grade}). View their authentic hadith chains and academic network.`,
    openGraph: {
      title: `${data.name} - Islamic Scholar Profile`,
      description: `Detailed biography, family tree, and network graph for ${data.name}. Influence Score: ${data.total_hadiths || 'N/A'}.`,
      type: 'article',
      tags: data.biography?.tags || [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.name}`,
      description: `Explore the scholarly network of ${data.name}.`,
    },
  };
}

// Generate Static Params for SSG (Zero-Cost)
export async function generateStaticParams() {
  // Read all available JSON files to generate paths
  const scholarsDir = path.join(process.cwd(), 'public/data/scholars');
  const filenames = fs.readdirSync(scholarsDir);

  // Filter for .json files and map to IDs
  // Limiting to top 200 for now to prevent build timeouts in demo environment
  // In full production, this would map all 24,000 files
  return filenames
    .filter((file) => file.endsWith('.json'))
    .slice(0, 200) 
    .map((file) => ({
      id: file.replace('.json', ''),
    }));
}

export default async function ScholarPage({ params }: PageProps) {
  const resolvedParams = await params;
  const data = await getScholarData(resolvedParams.id);

  if (!data) {
    notFound();
  }

  return <ScholarProfile initialData={data} />;
}
