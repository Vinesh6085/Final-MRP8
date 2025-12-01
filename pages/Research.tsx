
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { Search, Loader2, Book, FileText, GraduationCap, ScrollText, ExternalLink, Library } from 'lucide-react';
import { ResearchResult } from '../types';

const Research = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ResearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'All' | 'Paper' | 'Book' | 'Article'>('All');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setResults([]);
    
    try {
      const data = await geminiService.findResearch(query);
      setResults(data);
    } catch (error) {
      console.error("Failed to fetch research", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredResults = filter === 'All' 
    ? results 
    : results.filter(r => r.type === filter);

  const getIcon = (type: string) => {
    switch (type) {
      case 'Paper': return <FileText size={20} />;
      case 'Book': return <Book size={20} />;
      case 'Thesis': return <GraduationCap size={20} />;
      default: return <ScrollText size={20} />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'Paper': return 'bg-blue-100 text-blue-600';
      case 'Book': return 'bg-amber-100 text-amber-700';
      case 'Thesis': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10">
            <Library size={200} />
        </div>
        <div className="relative z-10 max-w-3xl">
            <h1 className="text-3xl font-bold mb-4 flex items-center gap-3">
                <GraduationCap className="text-blue-400" size={36} /> AI Research Assistant
            </h1>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                Access a curated collection of research papers, journals, thesis work, and academic books. 
                Enter a topic to explore scholarly resources related to your courses.
            </p>

            <div className="flex gap-3 bg-white/10 p-2 rounded-2xl backdrop-blur-sm border border-white/20">
                <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search for 'Deep Learning Architectures', 'Modern History'..."
                    className="flex-1 bg-transparent border-none text-white placeholder-slate-400 px-4 py-2 outline-none text-lg"
                />
                <button 
                    onClick={handleSearch}
                    disabled={isLoading || !query}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : <Search size={20} />} 
                    Search
                </button>
            </div>
        </div>
      </div>

      {/* Results Area */}
      {results.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Search Results</h2>
                <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200">
                    {['All', 'Paper', 'Book', 'Article'].map(f => (
                        <button 
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === f ? 'bg-slate-800 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            {f}s
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredResults.map((item) => (
                    <div key={item.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${getColor(item.type)}`}>
                                        {getIcon(item.type)} {item.type}
                                    </span>
                                    <span className="text-gray-500 text-sm">{item.year} • {item.publication}</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-gray-500 text-sm italic mb-4">By {item.authors.join(', ')}</p>
                                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    "{item.summary}"
                                </p>
                            </div>
                            <a 
                                href={item.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="p-3 bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg border border-gray-200 transition-all"
                                title="View Source"
                            >
                                <ExternalLink size={20} />
                            </a>
                        </div>
                    </div>
                ))}

                {filteredResults.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500">No {filter.toLowerCase()}s found for this topic.</p>
                    </div>
                )}
            </div>
          </div>
      )}

      {!isLoading && results.length === 0 && (
          <div className="text-center py-20">
              <div className="inline-block p-6 bg-slate-100 rounded-full mb-4">
                  <Library size={48} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Your Academic Library</h3>
              <p className="text-gray-500 max-w-sm mx-auto mt-2">
                  Search for millions of research papers, books, and articles to support your learning journey.
              </p>
          </div>
      )}
    </div>
  );
};

export default Research;
