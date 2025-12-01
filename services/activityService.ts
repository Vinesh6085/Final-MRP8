
import { User } from '../types';

export interface ActivityLog {
  id: string;
  userId: string; // Added to associate log with specific user
  date: string; // YYYY-MM-DD
  type: 'lesson' | 'quiz' | 'assignment';
  title: string;
  category?: string; // Course Title or Quiz Topic
  timestamp: number;
}

const STORAGE_KEY = 'edugenius_activity_log';

export const activityService = {
  // Get all logs for a specific user
  getLogs: (userId: string): ActivityLog[] => {
    const allLogsStr = localStorage.getItem(STORAGE_KEY);
    const allLogs: ActivityLog[] = allLogsStr ? JSON.parse(allLogsStr) : [];
    return allLogs.filter(log => log.userId === userId);
  },

  // Log a new activity for a specific user
  logActivity: (userId: string, type: 'lesson' | 'quiz' | 'assignment', title: string, category?: string) => {
    const allLogsStr = localStorage.getItem(STORAGE_KEY);
    const allLogs: ActivityLog[] = allLogsStr ? JSON.parse(allLogsStr) : [];
    
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD

    const newLog: ActivityLog = {
      id: Date.now().toString(),
      userId,
      date: today,
      type,
      title,
      category,
      timestamp: Date.now()
    };

    allLogs.push(newLog);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allLogs));
    
    // Dispatch event for reactive UI updates
    window.dispatchEvent(new Event('activity_updated'));
  },

  // Get activities for a specific date and user
  getActivitiesForDate: (userId: string, dateStr: string): ActivityLog[] => {
    const logs = activityService.getLogs(userId);
    return logs.filter(log => log.date === dateStr);
  },

  // Calculate current streak for a user
  calculateStreak: (userId: string): number => {
    const logs = activityService.getLogs(userId);
    if (logs.length === 0) return 0;

    // Get unique dates sorted descending
    const uniqueDates = Array.from(new Set(logs.map(l => l.date))).sort().reverse();
    
    if (uniqueDates.length === 0) return 0;

    const today = new Date().toLocaleDateString('en-CA');
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-CA');

    // If no activity today OR yesterday, streak is broken (0)
    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
      return 0;
    }

    let streak = 0;
    
    // Check Today
    if (uniqueDates.includes(today)) {
        streak++;
    }

    // Loop backwards from yesterday
    let checkDate = new Date();
    checkDate.setDate(checkDate.getDate() - 1);

    while (true) {
        const dateStr = checkDate.toLocaleDateString('en-CA');
        if (uniqueDates.includes(dateStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    return streak;
  },

  // Get data for the last 7 days for the chart for a user
  getWeeklyStats: (userId: string) => {
    const logs = activityService.getLogs(userId);
    const days = [];
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('en-CA');
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        
        const dayLogs = logs.filter(l => l.date === dateStr);
        const count = dayLogs.length;
        
        // Breakdown by type
        const lessonCount = dayLogs.filter(l => l.type === 'lesson').length;
        const quizCount = dayLogs.filter(l => l.type === 'quiz').length;
        const assignmentCount = dayLogs.filter(l => l.type === 'assignment').length;

        days.push({ 
            date: dateStr, 
            day: dayName, 
            count,
            lessonCount,
            quizCount,
            assignmentCount
        });
    }
    return days;
  },

  // Get total quizzes count for a user
  getTotalQuizzes: (userId: string): number => {
      const logs = activityService.getLogs(userId);
      return logs.filter(l => l.type === 'quiz').length;
  },

  // Get distribution of activity by category dynamically for a user
  getCategoryStats: (userId: string): Record<string, number> => {
    const logs = activityService.getLogs(userId);
    const distribution: Record<string, number> = {};

    logs.forEach(log => {
        let cat = log.category;

        // Fallback for legacy logs without category field
        if (!cat) {
            if (log.type === 'quiz' && log.title.includes('Took a quiz on:')) {
                cat = log.title.replace('Took a quiz on:', '').trim();
            } else if (log.type === 'lesson' && log.title.includes('Completed:')) {
                 // Try to guess or group generally if we can't find the course title
                 cat = "General Learning";
            } else {
                 cat = "Other";
            }
        }

        if (cat) {
            distribution[cat] = (distribution[cat] || 0) + 1;
        }
    });

    return distribution;
  }
};
