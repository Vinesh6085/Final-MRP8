
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { Search, ExternalLink, Award, BookOpen } from 'lucide-react';
import { Recommendation } from '../types';

const Recommendations = () => {
  const [jobGoal, setJobGoal] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [resourceType, setResourceType] = useState('All Resources');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetRecommendations = async () => {
    if (!jobGoal.trim()) return;
    setIsLoading(true);
    setRecommendations([]);

    const results = await geminiService.getRecommendations(jobGoal, level, resourceType);
    setRecommendations(results);
    setIsLoading(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
       {/* Header Banner */}
       <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-8 text-white shadow-lg">
            <h1 className="text-3xl font-bold mb-2">Certifications & Courses</h1>
            <p className="opacity-90 max-w-2xl font-medium">Advance your career with AI-curated recommendations. Tell us your interests, and we'll find the best professional certifications and courses for your job goals.</p>
       </div>

       {/* Search Bar Area */}
       <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">My Interests / Job Goal</label>
                    <input 
                        type="text" 
                        value={jobGoal}
                        onChange={(e) => setJobGoal(e.target.value)}
                        placeholder="e.g., Cloud Architect, Data Analyst, Project Manager"
                        className="w-full bg-gray-800 text-white placeholder-gray-400 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="md:col-span-2">
                     <label className="block text-sm font-semibold text-gray-700 mb-2">Current Level</label>
                     <select 
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none bg-white text-gray-700"
                     >
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                     </select>
                </div>
                 <div className="md:col-span-2">
                     <label className="block text-sm font-semibold text-gray-700 mb-2">Resource Type</label>
                     <select 
                        value={resourceType}
                        onChange={(e) => setResourceType(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none bg-white text-gray-700"
                     >
                        <option>All Resources</option>
                        <option>Courses</option>
                        <option>Certifications</option>
                     </select>
                </div>
                <div className="md:col-span-3">
                    <button 
                        onClick={handleGetRecommendations}
                        disabled={isLoading || !jobGoal}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-indigo-200"
                    >
                        <Search size={20} /> {isLoading ? 'Searching...' : 'Find Recommendations'}
                    </button>
                </div>
            </div>
       </div>

       {/* Results Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((rec, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-6 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-lg ${rec.type === 'Certification' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                            {rec.type === 'Certification' ? <Award size={24} /> : <BookOpen size={24} />}
                        </div>
                        <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {rec.difficulty}
                        </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{rec.title}</h3>
                    <p className="text-sm text-indigo-600 font-medium mb-3">{rec.platform}</p>
                    <p className="text-sm text-gray-600 mb-6 flex-1">{rec.description}</p>
                    
                    <a 
                        href={rec.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full border border-gray-200 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-50 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
                    >
                        View Details <ExternalLink size={16} />
                    </a>
                </div>
            ))}
            
            {!isLoading && recommendations.length === 0 && (
                 <div className="col-span-full text-center py-12 text-gray-400">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search size={24} />
                    </div>
                    <p>Enter your goals above to see AI-curated recommendations.</p>
                 </div>
            )}
       </div>
    </div>
  );
};

export default Recommendations;