import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button'; // Assuming Button component is here
import { Sparkles } from 'lucide-react'; // Using Sparkles as a "magic wand" icon

interface MagicWandButtonProps extends ButtonProps {
  // Additional props specific to MagicWandButton can be added here
}

const MagicWandButton: React.FC<MagicWandButtonProps> = (props) => {
  return (
    <Button {...props}>
      <Sparkles className="mr-2 h-4 w-4" />
      {props.children || 'Automate'}
    </Button>
  );
};

export default MagicWandButton;
