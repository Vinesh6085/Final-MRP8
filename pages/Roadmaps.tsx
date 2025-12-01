
import React, { useState } from 'react';
import { Map, Share2, Code2, Database, PenTool, PieChart, Search, ArrowRight, Loader2, CheckCircle, ChevronLeft } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { GeneratedRoadmap } from '../types';

const Roadmaps = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedRoadmap, setGeneratedRoadmap] = useState<GeneratedRoadmap | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setGeneratedRoadmap(null);
    
    try {
        const roadmap = await geminiService.generateRoadmap(searchQuery);
        setGeneratedRoadmap(roadmap);
    } catch (e) {
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setGeneratedRoadmap(null);
    setSearchQuery('');
  };

  const roadmaps = [
    {
        id: '1',
        title: 'Machine Learning Engineer',
        description: 'Design and build intelligent systems and algorithms.',
        icon: <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600"><Share2 size={24} /></div>,
        steps: 6
    },
    {
        id: '2',
        title: 'Data Engineer',
        description: 'Build the infrastructure that allows data to be analyzed.',
        icon: <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600"><Database size={24} /></div>,
        steps: 6
    },
    {
        id: '3',
        title: 'Data Analyst',
        description: 'Interpret data to help companies make better decisions.',
        icon: <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600"><PieChart size={24} /></div>,
        steps: 6
    },
    {
        id: '4',
        title: 'UI/UX Engineer',
        description: 'Design intuitive and beautiful user experiences.',
        icon: <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center text-pink-600"><PenTool size={24} /></div>,
        steps: 6
    },
    {
        id: '5',
        title: 'Full Stack Developer',
        description: 'Build complete web applications from front to back.',
        icon: <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600"><Code2 size={24} /></div>,
        steps: 6
    }
  ];

  const handlePresetClick = (title: string) => {
    setSearchQuery(title);
    // Trigger search immediately for preset
    // We need to use a timeout or useEffect normally, but here we can just call logic if we separate state setting
    // Simpler: Just set text, user clicks button. Or separate fetch.
    // Let's just set the text so the user can modify if they want, or click search.
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Career Roadmaps</h1>
        <p className="text-gray-500 mb-8">Not sure where to start? Search for your dream job role, and we'll generate a step-by-step path for you.</p>
        
        <div className="relative max-w-lg mx-auto flex gap-2">
            <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="e.g., DevOps Engineer, Blockchain Developer..."
                className="flex-1 bg-white border border-gray-300 text-gray-900 rounded-xl px-5 py-3 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <button 
                onClick={handleSearch}
                disabled={isLoading || !searchQuery}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200"
            >
                {isLoading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
            </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center animate-pulse mb-4">
                <Map size={32} />
            </div>
            <p className="text-gray-500 font-medium">Designing your future path...</p>
        </div>
      ) : generatedRoadmap ? (
        <div className="max-w-4xl mx-auto">
            <button onClick={clearSearch} className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                <ChevronLeft size={16} /> Back to popular roles
            </button>
            
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
                    <h2 className="text-3xl font-bold mb-2">{generatedRoadmap.role}</h2>
                    <p className="opacity-90 text-lg leading-relaxed">{generatedRoadmap.description}</p>
                </div>
                
                <div className="p-8 relative">
                    {/* Vertical Line */}
                    <div className="absolute left-8 top-8 bottom-8 w-1 bg-gray-100 rounded-full hidden md:block"></div>

                    <div className="space-y-8">
                        {generatedRoadmap.steps.map((step, idx) => (
                            <div key={idx} className="relative flex flex-col md:flex-row gap-6 md:gap-10">
                                {/* Timeline Dot */}
                                <div className="absolute left-0 top-0 md:static md:w-16 flex-shrink-0 flex flex-col items-center">
                                    <div className="w-8 h-8 rounded-full bg-indigo-600 border-4 border-white shadow-md flex items-center justify-center text-white font-bold text-sm z-10">
                                        {idx + 1}
                                    </div>
                                    <div className="h-full w-1 bg-gray-100 my-2 md:hidden"></div>
                                </div>

                                <div className="flex-1 bg-gray-50 hover:bg-white border border-gray-100 hover:border-indigo-100 hover:shadow-lg transition-all rounded-2xl p-6 ml-6 md:ml-0">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-xl font-bold text-gray-900">{step.phaseName}</h3>
                                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full whitespace-nowrap">
                                            {step.duration}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 mb-4 leading-relaxed">{step.description}</p>
                                    
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Key Skills</p>
                                        <div className="flex flex-wrap gap-2">
                                            {step.skills.map((skill, sIdx) => (
                                                <span key={sIdx} className="bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <div className="inline-block p-4 bg-green-50 rounded-2xl border border-green-100">
                            <div className="flex items-center gap-3 text-green-800 font-bold">
                                <CheckCircle size={24} />
                                <span>Goal Achieved: {generatedRoadmap.role}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roadmaps.map((map) => (
                <div 
                    key={map.id} 
                    onClick={() => handlePresetClick(map.title)}
                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                    <div className="mb-4 group-hover:scale-110 transition-transform origin-left">
                        {map.icon}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{map.title}</h3>
                    <p className="text-sm text-gray-500 mb-6">{map.description}</p>
                    <div className="flex items-center text-xs font-medium text-gray-400 gap-1 uppercase tracking-wider group-hover:text-indigo-500 transition-colors">
                        <Share2 size={12} /> Click to Generate Path
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Roadmaps;
