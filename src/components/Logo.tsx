
import React from 'react';
import { Sparkles } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`relative ${sizeClasses[size]} bg-cosmic rounded-2xl flex items-center justify-center`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[40%] h-[40%] -rotate-45 bg-white rounded-md transform -translate-x-[10%] translate-y-[10%]"></div>
        </div>
        {/* Sparkles */}
        <div className="absolute top-1 right-1 text-cosmic-light animate-twinkle">
          <Sparkles size={size === 'sm' ? 10 : size === 'md' ? 12 : 14} />
        </div>
        <div className="absolute bottom-1 left-1 text-cosmic-light animate-twinkle delay-150">
          <Sparkles size={size === 'sm' ? 8 : size === 'md' ? 10 : 12} />
        </div>
        <div className="absolute top-1/2 left-0 text-cosmic-light animate-twinkle delay-300">
          <Sparkles size={size === 'sm' ? 8 : size === 'md' ? 10 : 12} />
        </div>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-semibold ${textSizes[size]} tracking-tight text-space`}>Image Magick</span>
          <span className="text-xs font-medium text-muted-foreground mt-[-2px]">Lite</span>
        </div>
      )}
    </div>
  );
};

export default Logo;
