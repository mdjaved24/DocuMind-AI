import React from 'react';
import { Header } from '../../shared/components/layout/Header';
import { Footer } from '../../shared/components/layout/Footer';

const SettingsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container px-4 mx-auto py-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-4 text-gray-600">Configure application settings</p>
        <div className="mt-8 bg-white rounded-lg shadow-sm p-8">
          <div className="max-w-md">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Theme</label>
              <select className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md">
                <option>Light</option>
                <option>Dark</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Language</label>
              <select className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Save Settings</button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SettingsPage;
