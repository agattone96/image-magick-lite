import React, { useState } from 'react';

interface ColorSwatchProps {
  color: string; // Expecting a hex code, e.g., "#RRGGBB"
  onClick?: () => void;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ color, onClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        className="w-10 h-10 rounded-md border border-gray-300 cursor-pointer"
        style={{ backgroundColor: color }}
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        title={color} // Basic browser tooltip as a fallback
      />
      {showTooltip && (
        <div
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md shadow-lg z-10"
        >
          {color}
        </div>
      )}
    </div>
  );
};

export default ColorSwatch;
