import React from "react";

interface EmptyViewProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

const EmptyView: React.FC<EmptyViewProps> = ({ icon, title, description, action, className }) => (
  <div className={`flex flex-col items-center justify-center p-8 text-center ${className || ""}`}>
    <div className="mb-6 w-16 h-16 bg-muted rounded-full flex items-center justify-center text-3xl">
      {icon}
    </div>
    <h2 className="text-xl font-medium mb-2">{title}</h2>
    <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
    {action}
  </div>
);

export default EmptyView;
