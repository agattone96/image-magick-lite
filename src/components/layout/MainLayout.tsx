import React, { useState } from 'react';
import AppSidebar from './AppSidebar';
import TopBar from './TopBar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [activeSection, setActiveSection] = useState('upload');

  const sectionTitles: Record<string, string> = {
    'upload': 'Upload Images',
    'browse': 'Browse Images',
    'tags': 'Image Tags',
    'colors': 'Color Analysis',
    'magic': 'Auto Magic',
    'export': 'Export'
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar
        activeSection={activeSection}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          title={sectionTitles[activeSection] || 'Image Magick Lite'}
        />
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
