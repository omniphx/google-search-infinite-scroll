"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { GoogleSearchResult, GoogleSearchResults } from "./api/search/route";

export default function Search() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<GoogleSearchResults>();
  const [searchResults, setSearchResults] = useState<GoogleSearchResult[]>([]);

  const sentinelNextRef = useRef<HTMLDivElement>(null);

  const handleSearch = async () => {
    try {
      const response = await fetch(`/api/search?query=${query}`);
      const data: GoogleSearchResults = await response.json();
      console.log(data);
      setResult(data);
      setSearchResults(data.items)
    } catch (error) {
      console.error(error);
    }
  };

  const handlePrevious = async () => {
    try {
      if (!result?.queries.previousPage) return;
      const response = await fetch(
        `/api/search?query=${query}&start=${result?.queries.previousPage[0].startIndex}`
      );
      const data: GoogleSearchResults = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleNext = useCallback(
    async (entries: IntersectionObserverEntry[]) => {
      const sentinelEntry = entries[0];
      if (sentinelEntry.isIntersecting) {
        try {
          if (!result?.queries.nextPage) return;
          console.log('fetching next page');
          const response = await fetch(
            `/api/search?query=${query}&start=${result?.queries.nextPage[0].startIndex}`
          );
          const data: GoogleSearchResults = await response.json();
          setSearchResults([...searchResults, ...data.items]);
        } catch (error) {
          console.error(error);
        }
      }
    },
    [query, result?.queries?.nextPage, searchResults]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleNext, {
      threshold: [0]
    })

    if(sentinelNextRef.current) {
      observer.observe(sentinelNextRef.current);
    }

    return () => {
      observer.disconnect()
    }
  }, [handleNext, searchResults.length])


  return (
    <>
      <div className="flex gap-4 font-mono">
        <input
          className="p-3 rounded-lg shadow-lg"
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
        />
        <button
          className="p-3 rounded-lg shadow-lg bg-sky-500 text-white text-sm"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>
      <div className="flex flex-col gap-4 max-w-lg my-20">
        {searchResults.map((result) => (
          <div key={result.cacheId} className="flex flex-col">
            <a href={result.link} className="font-semibold fontsize-lg">
              {result.title}
            </a>
            <p>{result.snippet}</p>
          </div>
        ))}
        <div className="flex" ref={sentinelNextRef} id="intersecting-sentinel"></div>
      </div>
      {result?.searchInformation.formattedTotalResults && (
        <div>
          About {result?.searchInformation.formattedTotalResults} results
        </div>
      )}
    </>
  );
}
