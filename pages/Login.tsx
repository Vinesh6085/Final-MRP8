
import React, { useState } from 'react';
import { authService } from '../services/authService';
import { BrainCircuit, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  // UI State
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const response = await authService.login(email, password);
        if (response.user) {
          onLoginSuccess(response.user);
        } else {
          setError(response.error || 'Invalid email or password.');
        }
      } else {
        if (!firstName.trim() || !lastName.trim()) {
          setError('First and Last name are required.');
          setIsLoading(false);
          return;
        }
        
        const response = await authService.register({
          email,
          password,
          firstName,
          lastName,
          name: `${firstName} ${lastName}`,
          role: 'Student'
        });

        if (response.user) {
          onLoginSuccess(response.user);
        } else {
          setError(response.error || 'Account already exists.');
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
      setIsLoading(true);
      try {
          const response = await authService.socialLogin(provider);
          if (response.user) {
              onLoginSuccess(response.user);
          } else {
              setError("Social login failed. Please try again.");
          }
      } catch (e) {
          setError("Connection error.");
      } finally {
          setIsLoading(false);
      }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fade-in">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-4 shadow-sm">
            <BrainCircuit size={28} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isLogin ? 'Learn with AI' : 'Create Account'}
          </h2>
          <p className="text-gray-500 text-sm mt-1 text-center">
            {isLogin ? 'Enter your details to access your account' : 'Start your AI learning adventure today'}
          </p>
        </div>

        {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="flex gap-3">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                        type="text"
                        required={!isLogin}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 text-white border border-transparent rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-gray-500"
                        placeholder="John"
                        disabled={isLoading}
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                        type="text"
                        required={!isLogin}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 text-white border border-transparent rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-gray-500"
                        placeholder="Doe"
                        disabled={isLoading}
                    />
                </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 text-white border border-transparent rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-gray-500"
              placeholder="you@example.com"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
                <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 text-white border border-transparent rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all pr-10 placeholder-gray-500"
                placeholder="••••••••"
                disabled={isLoading}
                />
                <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    disabled={isLoading}
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
          </div>

          {isLogin && (
            <div className="flex justify-end">
                <button type="button" className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
                    Forgot password?
                </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading && <Loader2 size={20} className="animate-spin" />}
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 mb-6 relative">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
        </div>

        <div className="space-y-3">
            <button 
                type="button" 
                onClick={() => handleSocialLogin('Google')}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors bg-white font-medium text-gray-700 text-sm"
            >
                <span className="font-bold">G</span> Continue with Google
            </button>
             <button 
                type="button" 
                onClick={() => handleSocialLogin('Apple')}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors bg-white font-medium text-gray-700 text-sm"
            >
                 <span className="font-bold text-black"></span> Continue with iCloud
            </button>
             <button 
                type="button" 
                onClick={() => handleSocialLogin('Microsoft')}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors bg-white font-medium text-gray-700 text-sm"
            >
                 <span className="font-bold text-gray-800">M</span> Continue with Microsoft
            </button>
        </div>

        <div className="mt-8 text-center text-sm">
          <span className="text-gray-500">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </span>
          <button
            type="button"
            onClick={toggleMode}
            disabled={isLoading}
            className="ml-1 font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
