"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Search, Book, User } from "lucide-react";
import { useDebounce } from "use-debounce";
import Fuse from "fuse.js";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SearchResult {
  id: string;
  name: string;
  grade: string;
  death_year: string;
  score: number;
}

interface HadithResult {
  id: string;
  book: string;
  hadith_no: string;
  matn: string;
  sanad: string;
}

type SearchMode = "scholar" | "Sahih Bukhari" | "Sahih Muslim" | "Sunan an-Nasa'i" | "Sunan Abi Da'ud" | "Sunan Ibn Majah" | "Jami' al-Tirmidhi";

const HADITH_BOOKS = [
  "Sahih Bukhari",
  "Sahih Muslim", 
  "Sunan an-Nasa'i",
  "Sunan Abi Da'ud",
  "Sunan Ibn Majah",
  "Jami' al-Tirmidhi"
] as const;

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [debouncedQuery] = useDebounce(query, 300);
  const [searchMode, setSearchMode] = React.useState<SearchMode>("scholar");
  
  // Data States
  const [scholarResults, setScholarResults] = React.useState<SearchResult[]>([]);
  const [allScholars, setAllScholars] = React.useState<SearchResult[]>([]);
  const [scholarFuse, setScholarFuse] = React.useState<Fuse<SearchResult> | null>(null);

  const [hadithResults, setHadithResults] = React.useState<HadithResult[]>([]);
  const [allHadiths, setAllHadiths] = React.useState<HadithResult[]>([]);
  const [hadithFuse, setHadithFuse] = React.useState<Fuse<HadithResult> | null>(null);

  const router = useRouter();
  const locale = useLocale();

  // Keyboard shortcut
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Load Scholar Index
  React.useEffect(() => {
    if (open && allScholars.length === 0) {
      fetch("/data/search-index.json")
        .then((res) => res.json())
        .then((data) => {
          setAllScholars(data);
          const fuseInstance = new Fuse(data, {
            keys: ["name", "id"],
            threshold: 0.3,
          });
          setScholarFuse(fuseInstance as unknown as Fuse<SearchResult>);
        })
        .catch((err) => console.error("Failed to load scholar index", err));
    }
  }, [open, allScholars.length]);

  // Load Hadith Index (only if mode is a book collection)
  React.useEffect(() => {
    if (open && searchMode !== "scholar" && allHadiths.length === 0) {
      fetch("/data/hadith-index.json")
        .then((res) => res.json())
        .then((data) => {
          setAllHadiths(data);
          const fuseInstance = new Fuse(data, {
            keys: [
              { name: "book", weight: 0.2 },
              { name: "hadith_no", weight: 0.3 },
              { name: "matn", weight: 0.5 },
            ],
            threshold: 0.4,
            ignoreLocation: true,
          });
          setHadithFuse(fuseInstance as unknown as Fuse<HadithResult>);
        })
        .catch((err) => console.error("Failed to load hadith index", err));
    }
  }, [open, searchMode, allHadiths.length]);

  // Perform search
  React.useEffect(() => {
    if (searchMode === "scholar") {
      if (scholarFuse && debouncedQuery) {
        const results = scholarFuse.search(debouncedQuery, { limit: 20 });
        setScholarResults(results.map((result) => result.item));
      } else if (allScholars.length > 0) {
        setScholarResults(allScholars.slice(0, 20));
      }
    } else {
      // Filter by selected book
      const bookFilter = searchMode as string;
      if (hadithFuse && debouncedQuery) {
        const results = hadithFuse.search(debouncedQuery, { limit: 50 });
        const filtered = results.map((result) => result.item).filter(h => h.book === bookFilter);
        setHadithResults(filtered);
      } else if (allHadiths.length > 0) {
        const filtered = allHadiths.filter(h => h.book === bookFilter).slice(0, 20);
        setHadithResults(filtered);
      }
    }
  }, [debouncedQuery, searchMode, scholarFuse, hadithFuse, allScholars, allHadiths]);

  const handleSelectScholar = (id: string) => {
    setOpen(false);
    router.push(`/${locale}/scholar/${id}`);
  };

  const handleSelectHadith = (hadith: HadithResult) => {
    setOpen(false);
    router.push(`/${locale}/hadith/${hadith.id}`);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        onClick={() => setOpen(true)}
      >
        <Search className="w-5 h-5" />
        <span className="sr-only">Search</span>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={
              searchMode === "scholar"
                ? "Search scholars (e.g. Bukhari)..."
                : "Search hadiths (e.g. 'Actions by intentions' or 'Bukhari 1')..."
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        
        <div className="relative w-full">
          {/* Scroll fade indicators */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-muted/30 to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-muted/30 to-transparent pointer-events-none z-10" />
          
          <div 
            className="w-full overflow-x-auto overflow-y-hidden pb-2 force-scrollbar" 
            style={{ 
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'thin',
              scrollbarColor: '#d4af37 transparent'
            }}
          >
            <Tabs 
              value={searchMode} 
              onValueChange={(val) => setSearchMode(val as SearchMode)}
              className="min-w-full border-b bg-muted/30 px-2"
            >
              <TabsList className="inline-flex flex-nowrap justify-start bg-transparent p-0 h-10 min-w-max gap-1">
                <TabsTrigger 
                  value="scholar" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-2 pt-2 whitespace-nowrap flex-shrink-0"
                >
                  <User className="mr-2 h-4 w-4" />
                  Scholars
                </TabsTrigger>
                {HADITH_BOOKS.map((book) => (
                  <TabsTrigger 
                    key={book}
                    value={book} 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-2 pt-2 whitespace-nowrap text-xs flex-shrink-0"
                  >
                    <Book className="mr-2 h-4 w-4" />
                    {book}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>

        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          {searchMode === "scholar" && (
            <CommandGroup heading={debouncedQuery ? "Scholars" : "Most Influential"}>
              {scholarResults.map((scholar) => (
                <CommandItem
                  key={scholar.id}
                  value={scholar.name} // Used by internal command filtering fallback
                  onSelect={() => handleSelectScholar(scholar.id)}
                  className="flex items-center justify-between p-2 cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{scholar.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {scholar.grade || "Scholar"}
                    </span>
                  </div>
                  {scholar.death_year && (
                    <span className="text-xs text-muted-foreground bg-accent/50 px-2 py-1 rounded">
                      d. {scholar.death_year} AH
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {searchMode !== "scholar" && (
            <CommandGroup heading={debouncedQuery ? `${searchMode} Results` : `Sample from ${searchMode}`}>
              {hadithResults.map((hadith, index) => (
                <CommandItem
                  key={`${hadith.book}-${hadith.hadith_no}-${index}`}
                  value={`${hadith.book} ${hadith.hadith_no} ${hadith.matn}`}
                  onSelect={() => handleSelectHadith(hadith)}
                  className="flex flex-col items-start gap-1 p-3 cursor-default"
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="font-semibold text-sm text-primary">
                      {hadith.book} #{hadith.hadith_no}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 w-full font-arabic leading-relaxed">
                    {hadith.matn}
                  </p>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}

