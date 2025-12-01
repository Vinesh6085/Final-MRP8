
import React, { useState } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { UserCircle, Lock, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface SettingsProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  
  // Profile Form
  const [firstName, setFirstName] = useState(user.firstName || user.name.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user.lastName || user.name.split(' ').slice(1).join(' ') || '');
  const [email] = useState(user.email); // Read-only typically
  
  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (!firstName.trim() || !lastName.trim()) {
        setErrorMsg('First and Last name cannot be empty.');
        setIsLoading(false);
        return;
    }

    try {
        const response = await authService.updateProfile(user.id, { firstName, lastName });
        if (response.user) {
            onUpdateUser(response.user);
            setSuccessMsg('Profile details updated successfully.');
        } else {
            setErrorMsg(response.error || 'Failed to update profile.');
        }
    } catch (error) {
        setErrorMsg('An error occurred.');
    } finally {
        setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Basic validation
    if (newPassword.length < 6) {
        setErrorMsg('New password must be at least 6 characters long.');
        setIsLoading(false);
        return;
    }

    if (newPassword !== confirmPassword) {
        setErrorMsg('New passwords do not match.');
        setIsLoading(false);
        return;
    }

    // Verify current password (simple check against local object for this mock)
    // In a real app, the backend would handle verification securely.
    if (user.password && currentPassword !== user.password) {
        setErrorMsg('Incorrect current password.');
        setIsLoading(false);
        return;
    }

    try {
        const response = await authService.updateProfile(user.id, { password: newPassword });
        if (response.user) {
            onUpdateUser(response.user);
            setSuccessMsg('Password updated successfully.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } else {
            setErrorMsg(response.error || 'Failed to update password.');
        }
    } catch (error) {
        setErrorMsg('An error occurred.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-500">Manage your profile details and security preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 space-y-2">
            <button 
                onClick={() => { setActiveTab('profile'); setSuccessMsg(''); setErrorMsg(''); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'}`}
            >
                <UserCircle size={20} /> Profile Info
            </button>
            <button 
                onClick={() => { setActiveTab('security'); setSuccessMsg(''); setErrorMsg(''); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'security' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'}`}
            >
                <Lock size={20} /> Security
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1">
            {/* Feedback Messages */}
            {successMsg && (
                <div className="mb-6 bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <CheckCircle size={18} /> {successMsg}
                </div>
            )}
            {errorMsg && (
                <div className="mb-6 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle size={18} /> {errorMsg}
                </div>
            )}

            {activeTab === 'profile' && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold border-4 border-indigo-50">
                                {firstName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">{firstName} {lastName}</h3>
                                <p className="text-gray-500 text-sm">{user.role}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                                <input 
                                    type="text" 
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                                <input 
                                    type="text" 
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                            <input 
                                type="email" 
                                value={email}
                                disabled
                                className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-lg px-4 py-3 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-400 mt-1">Email address cannot be changed.</p>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-bold transition-colors flex items-center gap-2 disabled:opacity-70"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === 'security' && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Change Password</h2>
                    <form onSubmit={handlePasswordUpdate} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                            <input 
                                type="password" 
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                placeholder="Enter current password"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                            <input 
                                type="password" 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                placeholder="Enter new password (min. 6 chars)"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                            <input 
                                type="password" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                placeholder="Re-enter new password"
                            />
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-bold transition-colors flex items-center gap-2 disabled:opacity-70"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                Update Password
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
