"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ScholarProfile from '@/components/features/ScholarProfile';

interface ScholarClientFallbackProps {
  id: string;
  debugUrl: string;
  initialSearchIndex: any[];
}

export default function ScholarClientFallback({ id, debugUrl, initialSearchIndex = [] }: ScholarClientFallbackProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        console.log(`[ClientFallback] Fetching scholar ${id} from client...`);
        const res = await fetch(`/data/scholars/${id}.json`);
        
        if (!res.ok) {
           throw new Error(`Failed to fetch: ${res.status}`);
        }
        
        const jsonData = await res.json();
        if (mounted) {
          setData(jsonData);
          setLoading(false);
        }
      } catch (err) {
        console.error("Client fetch failed:", err);
        if (mounted) {
          setError(true);
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-4 text-gray-500">Loading scholar data...</span>
      </div>
    );
  }

  if (data) {
    return <ScholarProfile initialData={data} searchIndex={initialSearchIndex} />;
  }

  // If both server and client failed, show the detailed troubleshooting UI
  return (
    <main className="container flex flex-col items-center justify-center min-h-[60vh] py-20 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Scholar Not Found</h1>
        <p className="text-lg text-gray-600 mb-8">We couldn't connect to the data source for Scholar ID: <span className="font-mono font-bold">{id}</span></p>
        
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg text-left max-w-2xl w-full">
            <h3 className="font-semibold text-amber-800 mb-2">Troubleshooting for Vercel:</h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                <li><strong>Invalid ID?</strong> Ensure ID `{id}` exists in your data. (Try 30003 for Imam Muslim)</li>
                <li><strong>Private Deployment?</strong> If this is a Preview URL, Vercel Authentication blocks the server from fetching its own data.
                    <ul className="pl-6 mt-1 list-circle text-xs text-gray-500">
                        <li>Fix: Make the deployment <strong>Public</strong> in Vercel Settings.</li>
                        <li>Fix: Or visit the <strong>Production</strong> domain (if public).</li>
                        <li><strong>Note:</strong> We attempted a client-side fetch as a fallback, but that also failed. Check if the file exists in <code>public/data/scholars/{id}.json</code>.</li>
                    </ul>
                </li>
            </ul>
            <div className="mt-4 pt-4 border-t border-amber-100 text-xs text-gray-400 break-all">
                Debug URL: {debugUrl}
            </div>
        </div>

        <Link href="/" className="mt-8 px-6 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors">
            Return to Search
        </Link>
    </main>
  );
}
