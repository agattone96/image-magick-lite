import React from "react";
import { Loader2 } from "lucide-react";

const LoadingOverlay: React.FC<{ message?: string }> = ({ message }) => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80">
    <Loader2 className="animate-spin w-10 h-10 text-primary mb-4" />
    {message && <p className="text-muted-foreground text-sm">{message}</p>}
  </div>
);

export default LoadingOverlay;
