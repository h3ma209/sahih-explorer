import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Outfit, Amiri, Noto_Naskh_Arabic } from "next/font/google";
import "./globals.css";
import NextTopLoader from 'nextjs-toploader';
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

const notoNaskh = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-noto-naskh",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#f59e0b",
};

export const metadata: Metadata = {
  title: "Sahih Explorer - Islamic Scholar & Hadith Database",
  description: "Explore the lives, family trees, and authentic narrations of Islamic scholars and companions through an interactive visualization platform.",
  manifest: "/manifest.json",
  icons: {
    apple: "/icons/icon-512x512.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sahih Explorer",
  },
};

import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '../../i18n/routing';
import { ScholarLoaderProvider } from '@/components/providers/ScholarLoaderProvider';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  // Ensure that the incoming `locale` is valid
  const {locale} = await params;
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
  
  // Enable static rendering
  setRequestLocale(locale);
 
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
 
  // Determine direction
  const dir = locale === 'ar' || locale === 'ckb' ? 'rtl' : 'ltr';

  // Select font based on locale
  let fontClass = outfit.className;
  let fontVar = outfit.variable;
  if (locale === 'ar') {
    fontClass = amiri.className;
    fontVar = amiri.variable;
  } else if (locale === 'ckb') {
    fontClass = notoNaskh.className;
    fontVar = notoNaskh.variable;
  }

  return (
    <html lang={locale} dir={dir}>
      <body
        className={`${fontClass} ${fontVar} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextTopLoader 
          color="#D4AF37"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={true}
          easing="ease"
          speed={200}
          shadow="0 0 10px #D4AF37,0 0 5px #D4AF37"
        />
        <NextIntlClientProvider messages={messages}>
          <ScholarLoaderProvider>
            {children}
            <Analytics />
          </ScholarLoaderProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
