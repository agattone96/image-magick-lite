import Sidebar from './Sidebar'; // Corrected import
import TopBar from './TopBar';
import MetadataModal from '../modals/MetadataModal';
import { Toaster } from 'react-hot-toast'; // Corrected import
import React from 'react'; // Added React import

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="p-4 overflow-y-auto">{children}</main>
      </div>
      <Toaster />
      <MetadataModal />
    </div>
  );
}
