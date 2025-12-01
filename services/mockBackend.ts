
import { User, AuthResponse } from '../types';
import { STUDENT_CSV } from '../data/studentData';

// Simulated Database Keys
const DB_USERS_KEY = 'edugenius_db_users';
const DB_SESSION_KEY = 'edugenius_db_session';

// Simulated Network Delay (ms)
const DELAY = 800;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockBackend = {
  // --- DATABASE HELPERS ---
  getUsers: (): User[] => {
    let usersStr = localStorage.getItem(DB_USERS_KEY);
    
    // If DB is empty, seed it with the dataset
    if (!usersStr) {
        const generatedUsers = mockBackend.generateDatasetUsers();
        localStorage.setItem(DB_USERS_KEY, JSON.stringify(generatedUsers));
        usersStr = JSON.stringify(generatedUsers);
        console.log(`✅ Loaded ${generatedUsers.length} users from dataset.`);
    }
    
    return JSON.parse(usersStr);
  },

  generateDatasetUsers: (): User[] => {
    const users: User[] = [];
    
    // 1. Add Demo Accounts
    const demoAccounts: User[] = [
        { id: 'u1', firstName: 'Student', lastName: 'Demo', name: 'Student Demo', email: 'student@demo.com', password: 'password123', role: 'Student', streak: 5, avatar: '' },
        { id: 'u2', firstName: 'Dr.', lastName: 'Faculty', name: 'Dr. Faculty Demo', email: 'faculty@demo.com', password: 'password123', role: 'Instructor', streak: 12, avatar: '' },
        { id: 'u3', firstName: 'Admin', lastName: 'Demo', name: 'Admin Demo', email: 'admin@demo.com', password: 'password123', role: 'Student', streak: 0, avatar: '' }, // Admin maps to Student role for this demo
    ];
    users.push(...demoAccounts);

    // 2. Parse CSV Data
    const lines = STUDENT_CSV.trim().split('\n');
    // Skip header row (index 0)
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
            const [first, last, full, email, pass] = line.split(',');
            if (email && pass) {
                users.push({
                    id: `student-${i}`,
                    firstName: first,
                    lastName: last,
                    name: full,
                    email: email,
                    password: pass,
                    role: 'Student',
                    streak: Math.floor(Math.random() * 20), // Random streak for realism
                    avatar: ''
                });
            }
        }
    }

    // 3. Log Credentials for easy access
    console.group("🔑 Credentials Loaded");
    console.table([
        { Role: 'DEMO STUDENT', Email: 'student@demo.com', Password: 'password123' },
        { Role: 'DEMO FACULTY', Email: 'faculty@demo.com', Password: 'password123' },
        // Show first 5 dataset users
        ...users.slice(3, 8).map(u => ({ Role: 'DATASET USER', Email: u.email, Password: u.password }))
    ]);
    console.log(`... and ${users.length - 8} more users loaded from CSV.`);
    console.groupEnd();

    return users;
  },

  saveUser: (user: User) => {
    const users = mockBackend.getUsers();
    users.push(user);
    localStorage.setItem(DB_USERS_KEY, JSON.stringify(users));
  },

  // --- AUTH ENDPOINTS ---
  
  // POST /api/register
  register: async (userData: Omit<User, 'id'>): Promise<AuthResponse> => {
    await delay(DELAY); // Simulate network latency

    const users = mockBackend.getUsers();
    const existingUser = users.find(u => u.email === userData.email);

    if (existingUser) {
      return { user: null, error: 'User already exists with this email.' };
    }

    const newUser: User = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
      streak: 1, // Default streak
    };

    mockBackend.saveUser(newUser);
    
    // Auto-login (create session)
    localStorage.setItem(DB_SESSION_KEY, JSON.stringify(newUser));
    
    return { user: newUser };
  },

  // POST /api/login
  login: async (email: string, password?: string): Promise<AuthResponse> => {
    await delay(DELAY); // Simulate network latency

    const users = mockBackend.getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return { user: null, error: 'Invalid email or password.' };
    }

    // Create session
    localStorage.setItem(DB_SESSION_KEY, JSON.stringify(user));

    return { user };
  },

  // POST /api/social-login
  socialLogin: async (provider: string): Promise<AuthResponse> => {
      await delay(DELAY);
      
      // Simulate a user coming from social provider
      // For demo purposes, we'll just create or return a specific "Social User"
      const socialEmail = `user@${provider.toLowerCase()}.com`;
      
      const users = mockBackend.getUsers();
      let user = users.find(u => u.email === socialEmail);

      if (!user) {
          // Register new social user
          user = {
              id: `social-${Date.now()}`,
              name: `${provider} User`,
              firstName: provider,
              lastName: 'User',
              email: socialEmail,
              role: 'Student',
              streak: 1,
              avatar: ''
          };
          mockBackend.saveUser(user);
      }

      // Create session
      localStorage.setItem(DB_SESSION_KEY, JSON.stringify(user));
      return { user };
  },

  // POST /api/logout
  logout: async (): Promise<void> => {
    await delay(200);
    localStorage.removeItem(DB_SESSION_KEY);
  },

  // GET /api/me (Check Session)
  getCurrentUser: async (): Promise<User | null> => {
    // Simulate a quicker check for session
    await delay(200);
    const sessionStr = localStorage.getItem(DB_SESSION_KEY);
    return sessionStr ? JSON.parse(sessionStr) : null;
  },

  // PUT /api/users/:id
  updateUser: async (userId: string, updates: Partial<User>): Promise<AuthResponse> => {
    await delay(500); // Simulate network latency

    const users = mockBackend.getUsers();
    const index = users.findIndex(u => u.id === userId);

    if (index === -1) {
        return { user: null, error: 'User not found.' };
    }

    // Merge updates
    const updatedUser = { ...users[index], ...updates };
    
    // If first or last name changed, update full name
    if (updates.firstName || updates.lastName) {
        updatedUser.name = `${updatedUser.firstName || ''} ${updatedUser.lastName || ''}`.trim();
    }

    users[index] = updatedUser;

    // Save back to DB
    localStorage.setItem(DB_USERS_KEY, JSON.stringify(users));

    // Update session if it's the current user
    const sessionStr = localStorage.getItem(DB_SESSION_KEY);
    if (sessionStr) {
        const sessionUser = JSON.parse(sessionStr);
        if (sessionUser.id === userId) {
            localStorage.setItem(DB_SESSION_KEY, JSON.stringify(updatedUser));
        }
    }

    return { user: updatedUser };
  }
};
