import React from 'react';
import { Header } from '../../shared/components/layout/Header';
import { Footer } from '../../shared/components/layout/Footer';

const ProfilePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container px-4 mx-auto py-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="mt-4 text-gray-600">Manage your profile settings</p>
        <div className="mt-8 bg-white rounded-lg shadow-sm p-8">
          <div className="max-w-md">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input type="text" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Your name" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="your@email.com" />
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Save Changes</button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
