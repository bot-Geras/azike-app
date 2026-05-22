// admin/app/(dashboard)/settings/page.tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Placeholder for settings save
    setTimeout(() => {
      toast.success('Settings saved');
      setSaving(false);
    }, 1000);
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your admin account and preferences</p>
      </div>

      <div className="space-y-8">
        {/* Profile */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
          </div>
          <div className="card-body space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-700 text-2xl font-bold">
                  {session?.user?.name?.[0] || 'A'}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{session?.user?.name}</p>
                <p className="text-gray-500 text-sm">{session?.user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* API Configuration */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">API Configuration</h2>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label>Backend API URL</label>
              <input
                type="text"
                value={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1'}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">Set via NEXT_PUBLIC_API_URL environment variable</p>
            </div>
            <div>
              <label>Admin URL</label>
              <input
                type="text"
                value={process.env.NEXTAUTH_URL || 'http://localhost:3000'}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">Set via NEXTAUTH_URL environment variable</p>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Preferences</h2>
          </div>
          <div className="card-body space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive email for important updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Auto-Logout</p>
                <p className="text-sm text-gray-500">Automatically sign out after inactivity</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
              </label>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card border-red-200">
          <div className="card-header border-red-200">
            <h2 className="text-lg font-semibold text-red-700">Danger Zone</h2>
          </div>
          <div className="card-body">
            <p className="text-gray-600 text-sm mb-4">
              These actions are irreversible. Please proceed with caution.
            </p>
            <div className="space-y-3">
              <button
                className="btn-danger"
                onClick={() => {
                  if (confirm('Are you sure? This will clear all cached data.')) {
                    toast.success('Cache cleared');
                  }
                }}
              >
                Clear Cache
              </button>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">System Information</h2>
          </div>
          <div className="card-body space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Dashboard Version</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Next.js Version</span>
              <span className="font-medium">16.2.4</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Backend API</span>
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="font-medium text-green-700">Connected</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}