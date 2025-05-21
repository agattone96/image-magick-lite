import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../Logo';
import { Upload, Image, FileText, Palette, Sparkles, FileArchive } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  to: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, isActive = false, to }) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-md w-full transition-colors",
        isActive 
          ? "bg-sidebar-accent text-sidebar-primary font-medium" 
          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
      )}
    >
      <div className={cn("text-lg", isActive ? "text-sidebar-primary" : "text-sidebar-foreground/70")}>
        {icon}
      </div>
      <span className="text-sm">{label}</span>
    </Link>
  );
};

interface AppSidebarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ activeSection, onSectionChange }) => {
  const location = useLocation();
  const currentPath = location.pathname === '/' ? '/upload' : location.pathname;
  
  const navItems = [
    { id: 'upload', label: 'Upload', icon: <Upload size={18} />, path: '/upload' },
    { id: 'browse', label: 'Browse', icon: <Image size={18} />, path: '/browse' },
    { id: 'tags', label: 'Tags', icon: <FileText size={18} />, path: '/tags' },
    { id: 'colors', label: 'Colors', icon: <Palette size={18} />, path: '/colors' },
    { id: 'magic', label: 'Auto Magic', icon: <Sparkles size={18} />, path: '/magic' },
    { id: 'export', label: 'Export', icon: <FileArchive size={18} />, path: '/export' },
    { id: 'projects', label: 'Projects', icon: <FileText size={18} />, path: '/projects' },
    { id: 'feedback', label: 'Feedback', icon: <FileText size={18} />, path: '/feedback' },
    { id: 'settings', label: 'Settings', icon: <FileText size={18} />, path: '/settings' },
    { id: 'admin', label: 'Admin', icon: <FileText size={18} />, path: '/admin', adminOnly: true },
  ];

  const isAdmin = true; // TODO: Replace with real user role check
  const filteredNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <div className="w-64 border-r border-sidebar-border bg-sidebar h-screen flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <Logo size="md" />
      </div>
      
      <div className="flex-1 p-3 space-y-1">
        {filteredNavItems.map(item => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            isActive={currentPath === item.path}
            to={item.path}
          />
        ))}
      </div>

      <div className="p-3 border-t border-sidebar-border">
        <div className="rounded-md bg-sidebar-accent p-3">
          <p className="text-xs text-sidebar-foreground/80 mb-2">Unlock more features</p>
          <Link to="/pro" className="w-full block bg-sidebar-primary text-white rounded-md py-1.5 text-xs font-medium text-center">
            Upgrade to Pro
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AppSidebar;
