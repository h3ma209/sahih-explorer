"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
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

interface SearchResult {
  id: string;
  name: string;
  grade: string;
  death_year: string;
  score: number;
}

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [debouncedQuery] = useDebounce(query, 300);
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [allScholars, setAllScholars] = React.useState<SearchResult[]>([]);
  const [fuse, setFuse] = React.useState<Fuse<SearchResult> | null>(null);
  const router = useRouter();

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

  // Load search index
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
          setFuse(fuseInstance as unknown as Fuse<SearchResult>);
        })
        .catch((err) => console.error("Failed to load search index", err));
    }
  }, [open, allScholars.length]);

  // Perform search
  React.useEffect(() => {
    if (fuse && debouncedQuery) {
      const searchResults = fuse.search(debouncedQuery, { limit: 20 });
      setResults(searchResults.map((result) => result.item));
    } else if (allScholars.length > 0) {
      setResults(allScholars.slice(0, 20)); // Show top influential scholars by default
    }
  }, [debouncedQuery, fuse, allScholars]);

  const handleSelect = (id: string) => {
    setOpen(false);
    router.push(`/scholar/${id}`);
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
        <span className="sr-only">Search scholars</span>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search for a scholar (e.g. Abu Huraira)..." 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading={debouncedQuery ? "Results" : "Most Influential"}>
            {results.map((scholar) => (
              <CommandItem
                key={scholar.id}
                value={scholar.name}
                onSelect={() => handleSelect(scholar.id)}
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
        </CommandList>
      </CommandDialog>
    </>
  );
}
