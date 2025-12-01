import React, { useState, useEffect, useRef } from 'react';
import { PlayCircle, Clock, Search, ChevronLeft, CheckCircle, Circle, ArrowRight, BookOpen, Video, Calendar, PlusCircle, ChevronRight } from 'lucide-react';
import { Course, User } from '../types';
import { activityService } from '../services/activityService';
import { courseService } from '../services/courseService';
import { authService } from '../services/authService';

interface CoursesProps {
    user: User;
    initialParams?: { courseId: string; moduleId: string } | null;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const Courses: React.FC<CoursesProps> = ({ user, initialParams }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [catalogCourses, setCatalogCourses] = useState<Course[]>([]);
  
  // UI States
  const [viewMode, setViewMode] = useState<'my-courses' | 'catalog'>('my-courses');
  const [searchQuery, setSearchQuery] = useState('');

  // Navigation State
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<string>('');
  const [completedModuleIds, setCompletedModuleIds] = useState<string[]>([]);
  
  const playerRef = useRef<any>(null);

  // Load User's Courses
  useEffect(() => {
    const enrolled = courseService.getEnrolledCourses(user.id);
    // Merge progress data
    const updatedCourses = enrolled.map(course => {
        const savedProgress = localStorage.getItem(`course_progress_${user.id}_${course.id}`);
        if (savedProgress) {
            const completedIds = JSON.parse(savedProgress);
            const progressPercent = Math.round((completedIds.length / (course.modules?.length || 1)) * 100);
            return { ...course, progress: progressPercent, completedModules: completedIds.length };
        }
        return course;
    });
    setCourses(updatedCourses);

    // Load Catalog
    setCatalogCourses(courseService.getCatalog());
  }, [user.id, viewMode]); // Reload when switching views to ensure freshness

  // Handle Deep Linking
  useEffect(() => {
    if (initialParams && initialParams.courseId && courses.length > 0) {
        const courseToOpen = courses.find(c => c.id === initialParams.courseId);
        if (courseToOpen) {
            const savedProgress = localStorage.getItem(`course_progress_${user.id}_${courseToOpen.id}`);
            const completedIds = savedProgress ? JSON.parse(savedProgress) : [];
            setCompletedModuleIds(completedIds);
            
            setSelectedCourse(courseToOpen);
            setViewMode('my-courses');
            
            if (initialParams.moduleId) {
                setActiveModuleId(initialParams.moduleId);
            } else {
                const firstUncompleted = courseToOpen.modules?.find(m => !completedIds.includes(m.id));
                setActiveModuleId(firstUncompleted ? firstUncompleted.id : (courseToOpen.modules?.[0]?.id || ''));
            }
        }
    }
  }, [initialParams, courses.length]); // Wait for courses to load

  // YouTube API Init
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Video Player Init
  useEffect(() => {
    const module = selectedCourse?.modules?.find(m => m.id === activeModuleId);
    
    if (module?.youtubeId) {
         if (playerRef.current) {
             try { playerRef.current.destroy(); } catch(e) {}
             playerRef.current = null;
         }

        const initPlayer = () => {
            if (window.YT && window.YT.Player) {
                const playerElement = document.getElementById(`yt-player-${module.id}`);
                if (playerElement) {
                     playerRef.current = new window.YT.Player(`yt-player-${module.id}`, {
                        height: '100%',
                        width: '100%',
                        videoId: module.youtubeId,
                        playerVars: { 'autoplay': 0, 'modestbranding': 1, 'rel': 0 },
                    });
                }
            } else {
                setTimeout(initPlayer, 100);
            }
        };
        initPlayer();
    }
  }, [activeModuleId, selectedCourse]);

  const handleStartCourse = (course: Course) => {
    const savedProgress = localStorage.getItem(`course_progress_${user.id}_${course.id}`);
    const completedIds = savedProgress ? JSON.parse(savedProgress) : [];
    
    setCompletedModuleIds(completedIds);
    setSelectedCourse(course);
    
    if (course.modules && course.modules.length > 0) {
        const firstUncompleted = course.modules.find(m => !completedIds.includes(m.id));
        setActiveModuleId(firstUncompleted ? firstUncompleted.id : course.modules[0].id);
    }
  };

  const handleEnroll = (course: Course) => {
      courseService.enroll(user.id, course);
      // Reload courses and switch view
      const updated = courseService.getEnrolledCourses(user.id);
      setCourses(updated);
      setViewMode('my-courses');
      setSearchQuery('');
  };

  const handleBackToList = () => {
    setSelectedCourse(null);
    setActiveModuleId('');
  };

  const toggleModuleCompletion = (moduleId: string) => {
    if (!selectedCourse) return;

    let newCompletedIds = [...completedModuleIds];
    if (newCompletedIds.includes(moduleId)) {
        newCompletedIds = newCompletedIds.filter(id => id !== moduleId);
    } else {
        newCompletedIds.push(moduleId);
        const moduleTitle = selectedCourse.modules?.find(m => m.id === moduleId)?.title || 'Unknown Module';
        activityService.logActivity(user.id, 'lesson', `Completed: ${moduleTitle}`, selectedCourse.title);
    }

    setCompletedModuleIds(newCompletedIds);
    localStorage.setItem(`course_progress_${user.id}_${selectedCourse.id}`, JSON.stringify(newCompletedIds));

    if (!completedModuleIds.includes(moduleId)) {
        const currentIndex = selectedCourse.modules?.findIndex(m => m.id === moduleId) || 0;
        const nextModule = selectedCourse.modules?.[currentIndex + 1];
        if (nextModule) {
            setActiveModuleId(nextModule.id);
        }
    }
  };

  // --- RENDER: COURSE DETAIL VIEW ---
  if (selectedCourse) {
      const activeModule = selectedCourse.modules?.find(m => m.id === activeModuleId);
      const progressPercent = Math.round((completedModuleIds.length / (selectedCourse.modules?.length || 1)) * 100);

      return (
        <div className="h-[calc(100vh-100px)] flex flex-col animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={handleBackToList} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronLeft size={24} className="text-gray-600" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">{selectedCourse.title}</h1>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><BookOpen size={14} /> {completedModuleIds.length}/{selectedCourse.modules?.length} Modules</span>
                        <div className="w-32 bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                        <span className="font-medium text-green-600">{progressPercent}% Completed</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                <div className="w-80 bg-white border border-gray-200 rounded-2xl overflow-y-auto hidden md:block shadow-sm">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 font-semibold text-gray-700">Course Content</div>
                    <div>
                        {selectedCourse.modules?.map((module, index) => {
                            const isCompleted = completedModuleIds.includes(module.id);
                            const isActive = activeModuleId === module.id;
                            return (
                                <div 
                                    key={module.id}
                                    onClick={() => setActiveModuleId(module.id)}
                                    className={`p-4 border-b border-gray-100 cursor-pointer transition-colors flex gap-3 hover:bg-gray-50 ${isActive ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}`}
                                >
                                    <div className="mt-1">
                                        {isCompleted ? <CheckCircle size={18} className="text-green-500" /> : <Circle size={18} className="text-gray-300" />}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className={`text-sm font-medium ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>
                                            {index + 1}. {module.title}
                                        </h4>
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center gap-3">
                                                 <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12} /> {module.duration}</span>
                                                 {module.youtubeId && <span className="text-xs text-red-400 flex items-center gap-1"><Video size={12} /> Video</span>}
                                            </div>
                                            {module.deadline && <span className="text-[10px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100 font-medium">Due {module.deadline}</span>}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-y-auto relative">
                    {activeModule ? (
                        <div className="p-8 max-w-4xl mx-auto">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900">{activeModule.title}</h2>
                                    {activeModule.deadline && (
                                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                            <Calendar size={16} className="text-orange-500" /> Due by <span className="font-semibold text-orange-600">{activeModule.deadline}</span>
                                        </div>
                                    )}
                                </div>
                                <button 
                                    onClick={() => toggleModuleCompletion(activeModule.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${completedModuleIds.includes(activeModule.id) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    {completedModuleIds.includes(activeModule.id) ? <><CheckCircle size={18} /> Completed</> : <><Circle size={18} /> Mark as Complete</>}
                                </button>
                            </div>

                            {activeModule.youtubeId && (
                                <div className="aspect-video w-full bg-black rounded-xl overflow-hidden mb-8 shadow-lg">
                                    <div id={`yt-player-${activeModule.id}`} className="w-full h-full"></div>
                                </div>
                            )}

                            <div className="prose max-w-none text-gray-700 leading-relaxed space-y-4">
                                <div dangerouslySetInnerHTML={{ __html: activeModule.content }} />
                            </div>

                            <div className="mt-12 pt-8 border-t border-gray-100 flex justify-end">
                                <button 
                                    onClick={() => toggleModuleCompletion(activeModule.id)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-lg shadow-indigo-200"
                                >
                                    {completedModuleIds.includes(activeModule.id) ? 'Next Lesson' : 'Mark Complete & Continue'} <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <BookOpen size={48} className="mb-4 opacity-50" />
                            <p>Select a module to start learning</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      );
  }

  // --- CATALOG VIEW ---
  if (viewMode === 'catalog') {
      const filteredCatalog = catalogCourses.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return (
        <div className="space-y-6 animate-fade-in">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => setViewMode('my-courses')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ChevronLeft size={24} className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Course Catalog</h1>
                        <p className="text-gray-500">Explore and enroll in new courses.</p>
                    </div>
                </div>
                <div className="relative w-full md:w-80">
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search catalog..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCatalog.length > 0 ? filteredCatalog.map((course) => {
                    const isEnrolled = courses.some(c => c.title === course.title);
                    return (
                        <div key={course.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full">
                             <div className="h-40 bg-gray-200 relative">
                                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                             </div>
                             <div className="p-4 flex flex-col flex-1">
                                <h3 className="font-bold text-gray-900 mb-1 line-clamp-1" title={course.title}>{course.title}</h3>
                                <p className="text-xs text-gray-500 mb-3">{course.totalModules} Modules • AI Generated</p>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">{course.description}</p>
                                
                                {isEnrolled ? (
                                    <button disabled className="w-full py-2 bg-gray-100 text-green-600 font-semibold rounded-lg flex items-center justify-center gap-2 cursor-default">
                                        <CheckCircle size={16} /> Enrolled
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => handleEnroll(course)}
                                        className="w-full py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <PlusCircle size={16} /> Enroll Now
                                    </button>
                                )}
                             </div>
                        </div>
                    )
                }) : (
                    <div className="col-span-full text-center py-20 text-gray-500">
                        <p>No courses found matching "{searchQuery}"</p>
                    </div>
                )}
             </div>
        </div>
      );
  }

  // --- MY COURSES VIEW ---
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-500">Pick up where you left off or start learning something new.</p>
        </div>
        <button 
            onClick={() => setViewMode('catalog')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
            <Search size={18} /> Browse Catalog
        </button>
      </div>

      {courses.length === 0 ? (
           <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
               <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
               <h3 className="text-lg font-bold text-gray-900 mb-2">No active courses</h3>
               <p className="text-gray-500 mb-6">Browse the catalog to find your first course.</p>
               <button 
                    onClick={() => setViewMode('catalog')}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700"
                >
                    Browse Catalog
               </button>
           </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
                <div key={course.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full">
                    <div 
                        className="h-48 bg-gray-200 relative group cursor-pointer"
                        onClick={() => handleStartCourse(course)}
                    >
                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                        
                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                            {course.completedModules}/{course.totalModules} Modules
                        </div>
                        <div className="absolute bottom-2 right-2 text-white text-xs font-bold px-2 py-1 drop-shadow-md">
                            {course.progress}% Completed
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                            <PlayCircle size={48} className="text-white drop-shadow-lg transform group-hover:scale-110 transition-transform" />
                        </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 h-1.5">
                        <div 
                            className="bg-green-500 h-1.5 transition-all duration-1000 ease-out" 
                            style={{ width: `${course.progress}%` }}
                        ></div>
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{course.title}</h3>
                        <p className="text-xs text-gray-500 mb-3">By {course.instructor}</p>
                        <p className="text-sm text-gray-600 mb-6 flex-1 line-clamp-2">{course.description}</p>
                        
                        <button 
                            onClick={() => handleStartCourse(course)}
                            className="w-full py-2.5 border border-gray-200 rounded-lg text-indigo-600 font-semibold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                        >
                            {course.progress > 0 ? 'Continue Learning' : 'Start Course'} 
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Courses;