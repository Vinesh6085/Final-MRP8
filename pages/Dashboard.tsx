import React, { useState, useEffect } from 'react';
import { MessageSquare, BrainCircuit, Lightbulb, BookOpen, PlayCircle, Calendar, ChevronRight, Globe, Database, Palette, Code, Cpu, Info, Award, CheckCircle, Play } from 'lucide-react';
import { User, Course } from '../types';
import { courseService } from '../services/courseService';
import { activityService, ActivityLog } from '../services/activityService';

interface DashboardProps {
  onNavigate: (page: string, params?: any) => void;
  user: User;
}

interface DeadlineItem {
    courseId: string;
    courseTitle: string;
    moduleTitle: string;
    deadline: string;
    colorClass: string;
}

interface WeeklyStat {
    date: string;
    day: string;
    count: number;
    lessonCount: number;
    quizCount: number;
    assignmentCount: number;
}

interface DashboardCourse extends Course {
    nextModuleId?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, user }) => {
  const [activeCourses, setActiveCourses] = useState<DashboardCourse[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<DeadlineItem[]>([]);
  
  const [streak, setStreak] = useState(0);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [completedCoursesCount, setCompletedCoursesCount] = useState(0);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStat[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toLocaleDateString('en-CA'));
  const [dailyLogs, setDailyLogs] = useState<ActivityLog[]>([]);
  
  const [focusStats, setFocusStats] = useState<Record<string, number>>({});
  const [focusTotal, setFocusTotal] = useState(0);

  const loadDashboardData = () => {
    // 1. Fetch REAL enrolled courses instead of static default
    const userCourses = courseService.getEnrolledCourses(user.id);
    let coursesFullyCompleted = 0;

    const updatedCourses = userCourses.map(course => {
        const savedProgress = localStorage.getItem(`course_progress_${user.id}_${course.id}`);
        let completedModulesCount = 0;
        let nextTask = course.nextTask;
        let nextModuleId = course.modules?.[0]?.id;

        let completedIds: string[] = [];
        if (savedProgress) {
            completedIds = JSON.parse(savedProgress) as string[];
            completedModulesCount = completedIds.length;
            
            const firstUnfinishedModule = course.modules?.find(m => !completedIds.includes(m.id));
            if (firstUnfinishedModule) {
                nextTask = firstUnfinishedModule.title;
                nextModuleId = firstUnfinishedModule.id;
            } else if (completedModulesCount === (course.modules?.length || 0) && completedModulesCount > 0) {
                nextTask = "Course Completed";
                nextModuleId = course.modules?.[course.modules.length - 1]?.id;
            }
        }

        const progressPercent = Math.round((completedModulesCount / (course.modules?.length || 1)) * 100);
        
        if (progressPercent === 100) {
            coursesFullyCompleted++;
        }

        return {
            ...course,
            progress: progressPercent,
            completedModules: completedModulesCount,
            nextTask: nextTask,
            nextModuleId: nextModuleId,
            _completedIds: completedIds
        };
    });

    setCompletedCoursesCount(coursesFullyCompleted);

    // Sort active courses: Top 3 by progress (Highest % first)
    const sortedCourses = [...updatedCourses].sort((a, b) => b.progress - a.progress);

    // 2. Aggregate Deadlines
    const deadlines: DeadlineItem[] = [];
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-green-500', 'bg-orange-500'];

    updatedCourses.forEach((course, idx) => {
        // @ts-ignore
        const completedIds = course._completedIds || [];
        
        course.modules?.forEach(module => {
            if (!completedIds.includes(module.id) && module.deadline) {
                deadlines.push({
                    courseId: course.id,
                    courseTitle: course.title,
                    moduleTitle: module.title,
                    deadline: module.deadline,
                    colorClass: colors[idx % colors.length]
                });
            }
        });
    });

    const sortedDeadlines = deadlines.sort((a, b) => {
        const priority: Record<string, number> = { 'Today': 0, 'Tomorrow': 1 };
        const pA = priority[a.deadline] !== undefined ? priority[a.deadline] : 99;
        const pB = priority[b.deadline] !== undefined ? priority[b.deadline] : 99;
        return pA - pB;
    });

    setActiveCourses(sortedCourses.slice(0, 3));
    setUpcomingDeadlines(sortedDeadlines.slice(0, 4));
    
    // 3. Activity & Streak
    setStreak(activityService.calculateStreak(user.id));
    setWeeklyStats(activityService.getWeeklyStats(user.id));
    setDailyLogs(activityService.getActivitiesForDate(user.id, selectedDate));
    setTotalQuizzes(activityService.getTotalQuizzes(user.id));

    // 4. Focus Areas
    const stats = activityService.getCategoryStats(user.id);
    setFocusStats(stats);
    const total = Object.values(stats).reduce((a, b) => a + b, 0);
    setFocusTotal(total);
  };

  useEffect(() => {
    loadDashboardData();

    const handleActivityUpdate = () => loadDashboardData();
    window.addEventListener('activity_updated', handleActivityUpdate);
    window.addEventListener('storage', handleActivityUpdate);

    return () => {
        window.removeEventListener('activity_updated', handleActivityUpdate);
        window.removeEventListener('storage', handleActivityUpdate);
    };
  }, [user.id]);

  useEffect(() => {
      setDailyLogs(activityService.getActivitiesForDate(user.id, selectedDate));
  }, [selectedDate, user.id]);

  const getCourseIcon = (title: string) => {
    if (title.includes('Web')) return <Globe size={20} />;
    if (title.includes('Data')) return <Database size={20} />;
    if (title.includes('UI/UX') || title.includes('Design')) return <Palette size={20} />;
    if (title.includes('Python') || title.includes('Code')) return <Code size={20} />;
    if (title.includes('Machine') || title.includes('AI')) return <Cpu size={20} />;
    return <PlayCircle size={20} />;
  };

  const CHART_PALETTE = ['text-blue-500', 'text-purple-500', 'text-pink-500', 'text-orange-500', 'text-green-500', 'text-indigo-500', 'text-yellow-500'];
  const BG_PALETTE = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-green-500', 'bg-indigo-500', 'bg-yellow-500'];

  const renderDonutSegments = () => {
    if (focusTotal === 0) {
         return <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />;
    }
    let cumulativePercent = 0;
    return Object.entries(focusStats).map(([category, count], idx) => {
        if (count === 0) return null;
        const percent = (count / focusTotal) * 100;
        const offset = cumulativePercent;
        cumulativePercent += percent;
        const colorClass = CHART_PALETTE[idx % CHART_PALETTE.length];
        return (
             <path key={category} className={colorClass} strokeDasharray={`${percent}, 100`} strokeDashoffset={-offset} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
        );
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hello, {user.firstName || user.name.split(' ')[0]} 👋</h1>
          <p className="text-gray-600">Here's your learning analytics and progress overview.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-full border border-gray-200 text-sm font-medium flex items-center gap-2 shadow-sm">
          <span className="text-black font-semibold">Current Streak:</span>
          <span className="text-orange-500 flex items-center gap-1 font-bold">🔥 {streak} Days</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={() => onNavigate('tutor')} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform"><MessageSquare size={20} /></div>
          <h3 className="font-semibold text-gray-900 mb-1">AI Tutor</h3>
          <p className="text-xs text-gray-600">Get instant help with your coursework.</p>
        </div>
        <div onClick={() => onNavigate('quiz')} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform"><BrainCircuit size={20} /></div>
          <h3 className="font-semibold text-gray-900 mb-1">Take a Quiz</h3>
          <p className="text-xs text-gray-600">Test your knowledge and earn badges.</p>
        </div>
        <div onClick={() => onNavigate('recommendations')} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
          <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center text-pink-600 mb-4 group-hover:scale-110 transition-transform"><Lightbulb size={20} /></div>
          <h3 className="font-semibold text-gray-900 mb-1">Certifications</h3>
          <p className="text-xs text-gray-600">Find job-ready certs & courses.</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition-transform"><BookOpen size={20} /></div>
          <h3 className="font-semibold text-gray-900 mb-1">Assignments</h3>
          <p className="text-xs text-gray-600">2 assignments due this week.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-gray-900">Active Courses & Progress</h2>
            <button onClick={() => onNavigate('courses')} className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">View All Courses <ChevronRight size={14} /></button>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            {activeCourses.length > 0 ? activeCourses.map((course) => {
                const colors = ['bg-blue-600', 'bg-purple-600', 'bg-pink-500', 'bg-green-500'];
                const bgColors = ['bg-blue-100', 'bg-purple-100', 'bg-pink-100', 'bg-green-100'];
                const textColors = ['text-blue-600', 'text-purple-600', 'text-pink-600', 'text-green-600'];
                const colorIndex = parseInt(course.id.replace(/\D/g, '') || '0') % colors.length;
                const progressColor = colors[colorIndex] || 'bg-blue-600';
                const iconBg = bgColors[colorIndex] || 'bg-blue-100';
                const iconColor = textColors[colorIndex] || 'text-blue-600';
                
                return (
                    <div key={course.id} className="flex items-center gap-4 pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                        <div className={`w-12 h-12 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                            {getCourseIcon(course.title)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-semibold text-gray-900 text-sm truncate" title={course.title}>{course.title}</h4>
                                    <p className="text-xs text-gray-600 truncate">{course.completedModules}/{course.totalModules} Modules • Next: {course.nextTask}</p>
                                </div>
                                {course.deadline && <span className="hidden sm:block text-xs font-medium bg-orange-100 text-orange-700 px-2 py-1 rounded whitespace-nowrap">{course.deadline}</span>}
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                                <div className={`${progressColor} h-2 rounded-full transition-all duration-700`} style={{ width: `${course.progress}%` }}></div>
                            </div>
                            <p className="text-right text-xs font-bold text-gray-700">{course.progress}%</p>
                        </div>
                        <button onClick={() => onNavigate('courses', { courseId: course.id, moduleId: course.nextModuleId })} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 text-gray-600 text-xs font-semibold rounded-lg border border-gray-200 transition-colors whitespace-nowrap">
                            <Play size={12} className="fill-current" /> Resume
                        </button>
                    </div>
                );
            }) : (
                 <div className="text-center py-8 text-gray-400 text-sm">No active courses. Go to "My Courses" to enroll!</div>
            )}
          </div>
        
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                 <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-bold text-gray-900">Weekly Activity</h3>
                        <p className="text-xs text-gray-600">Select a day to see activity details</p>
                    </div>
                 </div>
                 <div className="flex justify-between gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                    {weeklyStats.map((stat) => {
                        const isSelected = stat.date === selectedDate;
                        const hasActivity = stat.count > 0;
                        return (
                            <button key={stat.date} onClick={() => setSelectedDate(stat.date)} className={`flex flex-col items-center justify-center min-w-[3rem] py-3 rounded-xl transition-all border ${isSelected ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105 border-indigo-600' : 'bg-white text-gray-500 hover:bg-gray-50 border-gray-100'}`}>
                                <span className="text-[10px] font-medium uppercase">{stat.day}</span>
                                <span className={`text-sm font-bold mt-1 ${isSelected ? 'text-white' : 'text-gray-900'}`}>{new Date(stat.date).getDate()}</span>
                                {hasActivity && <div className={`mt-1.5 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-500'}`}></div>}
                            </button>
                        )
                    })}
                 </div>
                 <div className="mt-2 min-h-[60px]">
                    <h4 className="text-xs font-bold text-gray-800 mb-3 flex items-center gap-2"><Calendar size={14} className="text-indigo-500" />{new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h4>
                    {dailyLogs.length > 0 ? (
                        <div className="space-y-3">
                             {dailyLogs.map((log, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-sm transition-all animate-fade-in group">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${log.type === 'quiz' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>{log.type === 'quiz' ? <Award size={18} /> : <BookOpen size={18} />}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{log.title}</p>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">{log.type === 'quiz' ? 'Completed Quiz' : 'Completed Lesson'}</p>
                                    </div>
                                    <div className="text-xs text-gray-400"><CheckCircle size={16} className="text-green-500" /></div>
                                </div>
                             ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200"><Info size={24} className="mb-2 opacity-50" /><p className="text-xs">No activity recorded for this day.</p></div>
                    )}
                 </div>
            </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
             <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Calendar size={18} className="text-blue-500" /> Upcoming Deadlines</h3>
             <div className="space-y-4">
                {upcomingDeadlines.length > 0 ? (
                    upcomingDeadlines.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100">
                            <div className={`w-1 ${item.colorClass} h-8 rounded-full`}></div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-gray-900 truncate" title={item.moduleTitle}>{item.moduleTitle}</h4>
                                <p className="text-[10px] text-gray-600 truncate" title={item.courseTitle}>{item.courseTitle}</p>
                            </div>
                            <span className={`text-[10px] font-bold ${item.deadline === 'Today' ? 'text-red-600' : 'text-gray-500'}`}>{item.deadline}</span>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-4 text-gray-500 text-xs"><p>No upcoming deadlines! 🎉</p></div>
                )}
             </div>
          </div>

          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-5 rounded-2xl shadow-lg text-white">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold flex items-center gap-2">Milestones</h3>
                <span className="text-[10px] bg-white/20 px-2 py-1 rounded">Level {Math.floor(totalQuizzes / 5) + 1}</span>
            </div>
            <div className="flex justify-between gap-2">
                <div className="bg-white/10 p-2 rounded-lg text-center flex-1"><div className="text-lg">🔥</div><p className="text-[10px] mt-1 font-medium">{streak} Day Streak</p></div>
                 <div className="bg-white/10 p-2 rounded-lg text-center flex-1 border border-white/30"><div className="text-lg">🏆</div><p className="text-[10px] mt-1 font-medium">{totalQuizzes} Quizzes</p></div>
                 <div className="bg-white/10 p-2 rounded-lg text-center flex-1"><div className="text-lg">🎓</div><p className="text-[10px] mt-1 font-medium">{completedCoursesCount} Completed</p></div>
            </div>
          </div>

           <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
             <h3 className="font-bold text-gray-900 mb-2">Focus Areas</h3>
             <p className="text-xs text-gray-600 mb-6">Time distribution by subject (Lessons & Quizzes)</p>
             <div className="relative w-32 h-32 mx-auto">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                    {renderDonutSegments()}
                </svg>
             </div>
             <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] text-gray-600">
                {Object.entries(focusStats).length > 0 ? (
                    Object.entries(focusStats).map(([cat, count], idx) => (
                        <div key={cat} className="flex items-center gap-1 truncate" title={cat}>
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${BG_PALETTE[idx % BG_PALETTE.length]}`}></span>{cat}
                        </div>
                    ))
                ) : (
                    <p className="col-span-2 text-center text-gray-400 italic">No focus areas yet.</p>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;