import { Course } from '../types';

export const COURSES: Course[] = [
    {
        id: '1',
        title: 'Full Stack Web Development',
        instructor: 'Dr. Sarah Smith',
        progress: 0,
        totalModules: 5,
        completedModules: 0,
        nextTask: 'Introduction to Web Development',
        thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600',
        description: 'Master the MERN stack with hands-on projects. Learn React, Node.js, Express, and MongoDB from scratch.',
        deadline: 'Oct 30',
        modules: [
            {
                id: 'm1',
                title: 'Introduction to Web Development',
                duration: '15 mins',
                deadline: 'Today',
                content: `
                    <h3 class="text-xl font-bold mb-4">What is Web Development?</h3>
                    <p class="mb-4">Web development is the work involved in developing a website for the Internet (World Wide Web) or an intranet (a private network). Web development can range from developing a simple single static page of plain text to complex web applications, electronic businesses, and social network services.</p>
                    <h3 class="text-xl font-bold mb-4">The Three Pillars</h3>
                    <ul class="list-disc pl-6 mb-4 space-y-2">
                        <li><strong>HTML (HyperText Markup Language):</strong> The structure of the web pages.</li>
                        <li><strong>CSS (Cascading Style Sheets):</strong> The visual styling and layout.</li>
                        <li><strong>JavaScript:</strong> The interactive behavior and logic.</li>
                    </ul>
                    <p>In this course, we will start by mastering these three core technologies before moving on to modern frameworks like React and Node.js.</p>
                `,
                youtubeId: 'zJSY8tbf_ys' // Frontend Web Dev crash course
            },
            {
                id: 'm2',
                title: 'Setting Up Your Environment',
                duration: '20 mins',
                deadline: 'Tomorrow',
                content: `
                    <h3 class="text-xl font-bold mb-4">Tools of the Trade</h3>
                    <p class="mb-4">Before we write any code, we need to set up our development environment. A proper setup will make you more productive and help avoid common errors.</p>
                    <h4 class="font-bold mb-2">1. VS Code</h4>
                    <p class="mb-4">Visual Studio Code is the industry standard code editor. It's free, open-source, and has a rich ecosystem of extensions.</p>
                    <h4 class="font-bold mb-2">2. Node.js & NPM</h4>
                    <p class="mb-4">Node.js allows us to run JavaScript outside the browser. NPM (Node Package Manager) lets us install libraries and tools built by others.</p>
                    <h4 class="font-bold mb-2">3. Git & GitHub</h4>
                    <p class="mb-4">Version control is essential. Git tracks changes in your code, and GitHub hosts your repositories in the cloud.</p>
                `,
                youtubeId: 'bCDt7s0S82k' // VS Code Setup
            },
            {
                id: 'm3',
                title: 'HTML5 Semantic Structure',
                duration: '25 mins',
                deadline: 'Sep 28',
                content: `
                    <h3 class="text-xl font-bold mb-4">Why Semantics Matter</h3>
                    <p class="mb-4">Semantic HTML means using the correct tags for the content. Instead of using <code>&lt;div&gt;</code> for everything, we use tags that describe the meaning of the content.</p>
                    <div class="bg-gray-100 p-4 rounded-lg mb-4 font-mono text-sm">
                        &lt;header&gt;...&lt;/header&gt;<br>
                        &lt;nav&gt;...&lt;/nav&gt;<br>
                        &lt;main&gt;<br>
                        &nbsp;&nbsp;&lt;article&gt;...&lt;/article&gt;<br>
                        &lt;/main&gt;<br>
                        &lt;footer&gt;...&lt;/footer&gt;
                    </div>
                    <p>This improves <strong>Accessibility</strong> for screen readers and <strong>SEO</strong> for search engines.</p>
                `,
                youtubeId: 'kUMe1FH4CHE' // HTML Semantics
            },
            {
                id: 'm4',
                title: 'CSS Grid & Flexbox',
                duration: '45 mins',
                deadline: 'Sep 30',
                content: `
                    <h3 class="text-xl font-bold mb-4">Modern Layouts</h3>
                    <p class="mb-4">Gone are the days of using floats for layout. Flexbox and Grid are powerful layout systems built directly into CSS.</p>
                    <h4 class="font-bold mb-2">Flexbox</h4>
                    <p class="mb-4">Best for one-dimensional layouts (a row or a column). It excels at distributing space between items and aligning them.</p>
                    <h4 class="font-bold mb-2">CSS Grid</h4>
                    <p class="mb-4">Best for two-dimensional layouts (rows and columns). It allows you to create complex page structures with ease.</p>
                `,
                youtubeId: 'rg7Fvvl3taU' // CSS Flexbox
            },
            {
                id: 'm5',
                title: 'Introduction to React',
                duration: '60 mins',
                deadline: 'Oct 05',
                content: `
                    <h3 class="text-xl font-bold mb-4">Thinking in React</h3>
                    <p class="mb-4">React is a JavaScript library for building user interfaces. It is component-based, meaning you build small, reusable pieces of UI and compose them together.</p>
                    <h4 class="font-bold mb-2">JSX</h4>
                    <p class="mb-4">JSX looks like HTML, but it's actually JavaScript syntax extension. It allows you to write markup directly within your JS logic.</p>
                    <h4 class="font-bold mb-2">Components & Props</h4>
                    <p>Components are like JavaScript functions. They accept arbitrary inputs (called "props") and return React elements describing what should appear on the screen.</p>
                `,
                youtubeId: 'SqcY0GlETPk' // React Tutorial
            }
        ]
    },
    {
        id: '2',
        title: 'Data Science Fundamentals',
        instructor: 'Prof. Alan Turing',
        progress: 0,
        totalModules: 4,
        completedModules: 0,
        nextTask: 'Intro to Data Science',
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600',
        description: 'Learn how to analyze data using Python, Pandas, and NumPy. Visualize trends and make data-driven decisions.',
        deadline: 'Nov 15',
        modules: [
            { id: 'm1', title: 'Intro to Data Science', duration: '10 mins', deadline: 'Today', content: '<p>Data science combines math and statistics, specialized programming, advanced analytics, artificial intelligence (AI), and machine learning with specific subject matter expertise to uncover actionable insights hidden in an organization’s data.</p>', youtubeId: 'ua-CiDNNj30' },
            { id: 'm2', title: 'Python Basics', duration: '40 mins', deadline: 'Oct 01', content: '<p>Python is an interpreted, object-oriented, high-level programming language with dynamic semantics.</p>', youtubeId: '_uQrJ0TkZlc' },
            { id: 'm3', title: 'NumPy Arrays', duration: '30 mins', deadline: 'Oct 03', content: '<p>NumPy is the fundamental package for scientific computing in Python.</p>', youtubeId: 'QUT1VHiLmmI' },
            { id: 'm4', title: 'Pandas DataFrames', duration: '45 mins', deadline: 'Oct 08', content: '<p>Pandas is a fast, powerful, flexible and easy to use open source data analysis and manipulation tool.</p>', youtubeId: 'vmEHCJofslg' }
        ]
    },
    {
        id: '3',
        title: 'UI/UX Design Mastery',
        instructor: 'Jane Doe',
        progress: 0,
        totalModules: 3,
        completedModules: 0,
        nextTask: 'Design Thinking',
        thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=600',
        description: 'Design beautiful interfaces and user experiences. Learn Figma, wireframing, and prototyping.',
        deadline: 'Oct 20',
        modules: [
            { id: 'm1', title: 'Design Thinking', duration: '20 mins', deadline: 'Tomorrow', content: '<p>Design thinking is a non-linear, iterative process that teams use to understand users, challenge assumptions, redefine problems and create innovative solutions to prototype and test.</p>', youtubeId: 'gHGN6hs2gZY' },
            { id: 'm2', title: 'Figma Basics', duration: '50 mins', deadline: 'Sep 29', content: '<p>Figma is a collaborative web application for interface design.</p>', youtubeId: '4W4LvnKlCWg' },
            { id: 'm3', title: 'Prototyping', duration: '30 mins', deadline: 'Oct 02', content: '<p>A prototype is an early sample, model, or release of a product built to test a concept or process.</p>', youtubeId: 'B7rGkL1g9W4' }
        ]
    }
];