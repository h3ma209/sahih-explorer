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
     const data = JSON.parse(fileContents);

     // Hydrate children to get grandchildren (Descendants)
     if (data.children && data.children.length > 0) {
        data.children = data.children.map((child: any) => {
            if (!child.id) return child;
            try {
                const childPath = path.join(process.cwd(), 'public/data/scholars', `${child.id}.json`);
                if (fs.existsSync(childPath)) {
                    const childData = JSON.parse(fs.readFileSync(childPath, 'utf8'));
                    // We only need the child's children (grandchildren of root)
                    return { ...child, children: childData.children || [] };
                }
            } catch (e) {
                // Ignore missing files
            }
            return child;
        });
     }

     return data;
  } catch (e) {
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
  
  // Load search index for isnad chain resolution
  let searchIndex = [];
  try {
    const searchIndexPath = path.join(process.cwd(), 'public/data/search-index.json');
    if (fs.existsSync(searchIndexPath)) {
      const searchIndexData = fs.readFileSync(searchIndexPath, 'utf8');
      searchIndex = JSON.parse(searchIndexData);
    }
  } catch (error) {
    console.error('Failed to load search index:', error);
  }

  return <ScholarProfile initialData={data} searchIndex={searchIndex} />;
}
