import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TopBarProps {
  title: string;
  onSearch?: (query: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({ title, onSearch }) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  return (
    <div className="flex items-center justify-between border-b border-border h-16 px-6">
      <h1 className="text-xl font-medium">{title}</h1>

      <div className="flex items-center gap-4">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Search images..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-9 h-9"
          />
        </div>

        <Button variant="outline" size="sm">
          Filters
        </Button>
      </div>
    </div>
  );
};

export default TopBar;
