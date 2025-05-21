// src/pages/NotFound.tsx
// ✅ Purpose: 404 handler
// 🧩 Components used: EmptyView, Button, MainLayout, PageHeader
// 🧠 Hooks/Utilities used: useLocation, useEffect, useNavigate

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import MainLayout from "../components/layout/MainLayout";
import PageHeader from "../components/layout/PageHeader";
import EmptyView from "../components/ui/EmptyView";
import { Button } from "../components/ui/button";
import { FileText } from "lucide-react";

const NotFound: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <MainLayout>
      <PageHeader
        title="404: Not Found"
        description="The page you’re looking for does not exist."
        actions={<Button onClick={() => navigate("/")}>Go Home</Button>}
      />
      <div className="flex items-center justify-center min-h-[60vh]">
        <EmptyView
          icon={<FileText size={32} />}
          title="Page Not Found"
          description="Sorry, we couldn’t find that page."
          action={
            <Button onClick={() => navigate("/")} variant="outline">
              Back to Home
            </Button>
          }
        />
      </div>
    </MainLayout>
  );
};

export default NotFound;