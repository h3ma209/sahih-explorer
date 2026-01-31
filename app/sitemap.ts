import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://sahih-explorer.com';

export async function generateSitemaps() {
  // Split sitemaps into chunks
  // 0: Scholars (24k)
  // 1: Hadiths (34k)
  return [{ id: 0 }, { id: 1 }];
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [];

  // Add static routes to the first sitemap
  if (id === 0) {
    routes.push(
      {
        url: `${BASE_URL}/en`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${BASE_URL}/ar`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      }
    );

    // Scholars
    try {
        const filePath = path.join(process.cwd(), 'public/data/search-index.json');
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const scholars = JSON.parse(fileContent);
            
            // Map scholars to sitemap entries
            const scholarRoutes = scholars.map((scholar: any) => ({
                url: `${BASE_URL}/en/scholar/${scholar.id}`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: (scholar.score || 0) > 50 ? 0.9 : 0.6,
            }));
            
            routes.push(...scholarRoutes);
        }
    } catch (e) {
        console.error('Error generating scholar sitemap:', e);
    }
  } else if (id === 1) {
    // Hadiths
    try {
        const filePath = path.join(process.cwd(), 'public/data/hadith-index.json');
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const hadiths = JSON.parse(fileContent);

            // Limited hadith routes to avoid memory overuse if needed, but 34k is fine.
            const hadithRoutes = hadiths.map((hadith: any) => ({
                url: `${BASE_URL}/en/hadith/${hadith.id}`,
                lastModified: new Date(),
                changeFrequency: 'never',
                priority: 0.8,
            }));
            
            routes.push(...hadithRoutes);
        }
    } catch (e) {
        console.error('Error generating hadith sitemap:', e);
    }
  }

  return routes;
}
