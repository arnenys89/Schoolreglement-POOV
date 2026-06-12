import React, { useState } from "react";
import { RegulationSection, School } from "../types";
import { Search, Sparkles, X, ChevronRight, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

interface SearchEngineProps {
  sections: RegulationSection[];
  activeSchoolId: string;
  onSelectSection: (sectionId: string) => void;
}

export default function SearchEngine({
  sections,
  activeSchoolId,
  onSelectSection,
}: SearchEngineProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RegulationSection[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Common quick-search terms for parents as recommended
  const parentsCommonSearches = [
    { label: "💻 Laptops & ICT", term: "laptop" },
    { label: "🤒 Medisch attest", term: "attest" },
    { label: "🛑 Pesten", term: "pesten" },
    { label: "💶 Maximumfactuur & Kosten", term: "maximumfactuur" },
    { label: "🔇 Te laat komen", term: "te laat" },
    { label: "🚭 Rookverbod", term: "rookverbod" },
  ];

  const handleSearch = (text: string) => {
    setQuery(text);
    if (!text.trim()) {
      setResults([]);
      return;
    }

    const filtered = sections.filter((sec) => {
      // 1. Text is either global text, or active school's specifically overridden text.
      const textToSearch = (sec.isSchoolSpecificText && sec.schoolSpecificText[activeSchoolId])
        ? sec.schoolSpecificText[activeSchoolId]
        : sec.globalText;

      const searchableString = `${sec.title} ${sec.sectionNumber} ${textToSearch}`.toLowerCase();
      return searchableString.includes(text.toLowerCase());
    });

    setResults(filtered);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
  };

  return (
    <div className="bg-white lg:bg-transparent border border-gray-200 lg:border-none rounded-xl lg:rounded-none p-4 md:p-5 lg:p-0 mb-6 shadow-xs lg:shadow-none no-print transition-all duration-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left focus:outline-none cursor-pointer group"
        id="toggle-search-engine-btn"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="text-[#D6AD00] group-hover:scale-110 transition-transform duration-150" size={18} />
          <h2 className="text-[#2E2E2E] font-display font-semibold text-sm tracking-wide">
            Snelzoeker Hulp voor Ouders
          </h2>
        </div>
        <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {isExpanded && (
        <div className="mt-4 border-t border-gray-100 pt-4 animate-fade-in space-y-4">
          <p className="text-xs text-gray-500 leading-relaxed">
            Typ een onderwerp of trefwoord in (zoals &lsquo;laptop&rsquo;, &lsquo;attest&rsquo; of &lsquo;kosten&rsquo;) om direct te zien wat de regelgeving is. Klik op een veelgesteld onderwerp hieronder om meteen te zoeken.
          </p>

          {/* Input Group */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder="Waar bent u naar op zoek? (bijv. 'laptop' of 'afwezigheid')..."
              className="w-full pl-11 pr-10 py-3 rounded-lg border border-gray-300 focus:border-[#D6AD00] focus:ring-1 focus:ring-[#D6AD00] text-sm text-gray-800 placeholder-gray-400 transition-all font-sans bg-gray-50/50"
              id="search-input-field"
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Parental Quick Query Buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            {parentsCommonSearches.map((qs, i) => (
              <button
                key={i}
                onClick={() => handleSearch(qs.term)}
                className={`text-xs px-2.5 py-1.5 rounded-full border transition-all cursor-pointer ${
                  query === qs.term
                    ? "bg-amber-100 text-[#B59300] border-[#D6AD00] font-medium"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-100"
                }`}
              >
                {qs.label}
              </button>
            ))}
          </div>

          {/* Results Panel */}
          {query && (
            <div className="mt-5 border-t border-gray-100 pt-4 animate-fade-in">
              <div className="flex justify-between items-center mb-2 px-1 text-xs">
                <span className="font-mono text-gray-400">
                  Gevonden resultaten: <strong className="text-gray-700">{results.length}</strong>
                </span>
                {results.length > 0 && (
                  <span className="text-gray-400">Klik om direct naar onderdeel te scrollen</span>
                )}
              </div>

              {results.length === 0 ? (
                <div className="bg-amber-50/50 border border-dashed border-amber-200 rounded-lg p-6 py-8 text-center">
                  <HelpCircle className="mx-auto text-amber-400 mb-2" size={24} />
                  <p className="text-sm font-medium text-gray-700">Geen exact evenbeeld gevonden</p>
                  <p className="text-xs text-gray-500 mt-1">
                    We vonden geen specifieke paragrafen voor &ldquo;{query}&rdquo;. Probeer een andere term of blader door de inhoudsopgave.
                  </p>
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {results.map((result) => {
                    const textPreview = (result.isSchoolSpecificText && result.schoolSpecificText[activeSchoolId])
                      ? result.schoolSpecificText[activeSchoolId]
                      : result.globalText;

                    // Simple text extraction and snippet match
                    const matchIndex = textPreview.toLowerCase().indexOf(query.toLowerCase());
                    const previewStart = Math.max(0, matchIndex - 40);
                    const previewEnd = Math.min(textPreview.length, matchIndex + 70);
                    let snippet = textPreview.slice(previewStart, previewEnd);
                    if (previewStart > 0) snippet = "..." + snippet;
                    if (previewEnd < textPreview.length) snippet = snippet + "...";

                    return (
                      <button
                        key={result.id}
                        onClick={() => {
                          onSelectSection(result.id);
                        }}
                        className="w-full text-left p-3 rounded-lg border border-gray-100 hover:border-amber-200 bg-white hover:bg-amber-50/20 transition-all flex items-center justify-between gap-3 shadow-3xs cursor-pointer group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono font-semibold bg-amber-50 text-[#D6AD00] px-1.5 py-0.5 rounded">
                              Art. {result.sectionNumber}
                            </span>
                            <h4 className="text-xs font-semibold text-gray-900 truncate">
                              {result.title}
                            </h4>
                          </div>
                          <p className="text-[11px] text-gray-500 line-clamp-1 italic italic-clamp font-sans leading-relaxed">
                            {snippet}
                          </p>
                        </div>
                        <ChevronRight size={14} className="text-gray-400 group-hover:text-[#D6AD00] transition-colors" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
