import { Course, Module } from '../types';
import { CATALOG_CSV } from '../data/courseCatalog';
import { COURSES as DEFAULT_COURSES } from '../data/courses';

const ENROLLED_KEY_PREFIX = 'edugenius_enrolled_courses_';

// Helper to generate a deterministic random image from a list
const getThumbnail = (index: number) => {
    const images = [
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600', // Code screen
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600', // Analytics
        'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=600', // Design
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600', // Security
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600', // Matrix code
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600', // Chip
        'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=600', // Web dev
        'https://images.unsplash.com/photo-1610563166150-b34df4f3bcd6?auto=format&fit=crop&q=80&w=600', // Server
    ];
    return images[index % images.length];
};

export const courseService = {
  // Parse CSV and return all available courses
  getCatalog: (): Course[] => {
    const lines = CATALOG_CSV.trim().split('\n');
    const courses: Course[] = [];
    
    // Skip header row (index 0)
    for(let i = 1; i < lines.length; i++) {
        const title = lines[i].trim();
        if(title) {
            courses.push({
                id: `cat-${i}`,
                title: title,
                instructor: 'EduGenius AI',
                progress: 0,
                totalModules: 5,
                completedModules: 0,
                nextTask: 'Start Course',
                thumbnail: getThumbnail(i),
                description: `Comprehensive mastery course on ${title}. Learn the fundamentals, advanced concepts, and real-world applications.`,
                modules: [] // Modules are generated upon enrollment
            });
        }
    }
    return courses;
  },

  // Get enrolled courses for a user (merging defaults with user selections)
  getEnrolledCourses: (userId: string): Course[] => {
    const key = `${ENROLLED_KEY_PREFIX}${userId}`;
    const stored = localStorage.getItem(key);
    
    if (stored) {
        return JSON.parse(stored);
    }
    
    // First time? Seed with default courses
    localStorage.setItem(key, JSON.stringify(DEFAULT_COURSES));
    return DEFAULT_COURSES;
  },

  // Enroll a user in a course and generate its content
  enroll: (userId: string, course: Course): Course[] => {
    const currentCourses = courseService.getEnrolledCourses(userId);
    
    // Check if already enrolled to prevent duplicates
    if (currentCourses.some(c => c.title === course.title)) {
        return currentCourses;
    }

    // Generate Modules for the new course
    const generatedModules: Module[] = [
        {
            id: `m-${Date.now()}-1`,
            title: `Introduction to ${course.title}`,
            duration: '15 mins',
            content: `
                <h3 class="text-xl font-bold mb-4">Welcome to ${course.title}</h3>
                <p class="mb-4">This module provides a high-level overview of <strong>${course.title}</strong>. We will explore why this topic is critical in today's technology landscape and what you can expect to achieve by the end of this course.</p>
                <h4 class="font-bold mb-2">Key Learning Objectives:</h4>
                <ul class="list-disc pl-6 mb-4 space-y-2">
                    <li>Understanding the history and evolution of ${course.title}.</li>
                    <li>Setting up your development environment and tools.</li>
                    <li>Core terminology and concepts.</li>
                </ul>
                <p>Let's get started on this exciting journey!</p>
            `,
            deadline: 'Today'
        },
        {
            id: `m-${Date.now()}-2`,
            title: `Core Fundamentals`,
            duration: '30 mins',
            content: `
                <h3 class="text-xl font-bold mb-4">Mastering the Basics</h3>
                <p class="mb-4">In this section, we dive deep into the fundamental building blocks. A strong foundation is essential for mastering ${course.title}.</p>
                <div class="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 mb-4">
                    <strong>Tip:</strong> Don't rush through these concepts. They will reappear in every advanced topic we cover later.
                </div>
                <p>We will cover syntax, basic structures, and common patterns used by professionals in the field.</p>
            `,
            deadline: 'Tomorrow'
        },
        {
            id: `m-${Date.now()}-3`,
            title: `Advanced Concepts`,
            duration: '45 mins',
            content: `
                <h3 class="text-xl font-bold mb-4">Leveling Up</h3>
                <p class="mb-4">Now that you understand the basics, it's time to tackle complex scenarios. We will explore advanced techniques in ${course.title} that separate beginners from experts.</p>
                <p>Topics include performance optimization, scalability, and best practices for maintainable code.</p>
            `,
            deadline: 'Next Week'
        },
        {
            id: `m-${Date.now()}-4`,
            title: `Real-world Application`,
            duration: '60 mins',
            content: `
                <h3 class="text-xl font-bold mb-4">Putting it into Practice</h3>
                <p class="mb-4">Theory is useful, but practice is better. In this module, we will apply ${course.title} to real-world use cases.</p>
                <p>We will analyze case studies of top tech companies and how they utilize these concepts to solve business problems.</p>
            `,
            deadline: 'Next Week'
        },
        {
            id: `m-${Date.now()}-5`,
            title: `Final Project & Assessment`,
            duration: '90 mins',
            content: `
                <h3 class="text-xl font-bold mb-4">The Final Challenge</h3>
                <p class="mb-4">Congratulations on making it this far! Your final task is to build a comprehensive project that demonstrates everything you've learned about ${course.title}.</p>
                <p>Submit your project for peer review and receive your certificate of completion.</p>
            `,
            deadline: 'In 2 Weeks'
        }
    ];

    const newCourse: Course = {
        ...course,
        id: `enrolled-${Date.now()}`, // Give it a unique ID for the user's list
        modules: generatedModules,
        progress: 0,
        completedModules: 0,
        nextTask: generatedModules[0].title
    };

    const updatedCourses = [...currentCourses, newCourse];
    localStorage.setItem(`${ENROLLED_KEY_PREFIX}${userId}`, JSON.stringify(updatedCourses));
    
    return updatedCourses;
  }
};