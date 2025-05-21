// src/pages/NotFound.tsx
// ✅ Purpose: 404 handler
// 🧩 Components used: EmptyView, Button
// 🧠 Hooks/Utilities used: useLocation, useEffect

import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">404 - Not Found Placeholder</h1>
    </div>
  );
};

export default NotFound;