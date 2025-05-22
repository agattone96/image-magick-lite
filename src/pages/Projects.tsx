"use client";

import React, { useState, useEffect } from "react";
import MainLayout from "../components/layout/MainLayout"; // Changed path
import PageHeader from "../components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card"; // Changed path (CardFooter not used directly in new layout)
// Table components removed
import { Input } from "../components/ui/input"; // Changed path
import { Button } from "../components/ui/button"; // Changed path
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog"; // Changed path
import { useToast } from "../components/ui/use-toast"; // Changed path
import EmptyView from "../components/ui/EmptyView";
import { Folder } from "lucide-react";
import LoadingOverlay from "../components/ui/LoadingOverlay";
import ProjectCard from "../components/projects/ProjectCard"; // Added import

// TODO: Implement project store logic in lib/projectStore
const useProjectStore = () => { return {}; }; // TODO: Implement useProjectStore hook

interface Project {
  id: string;
  name: string;
  created_at: string;
  // Add other relevant fields if ProjectCard needs them, e.g., imageCount, description
  imageCount?: number; 
  description?: string; 
}

export default function Projects() {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Simulate fetch on mount
  useEffect(() => {
    setProjects([
      { id: "1", name: "Portfolio", created_at: "2025-05-01", imageCount: 12, description: "My personal portfolio images." },
      { id: "2", name: "Client Batch", created_at: "2025-05-10", imageCount: 150, description: "Batch processing for client X." },
    ]);
  }, []);

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const loadProject = (id: string) => {
    toast({ title: "Project loaded", description: `Project ID: ${id}` });
  };

  const deleteProject = (id: string) => {
    setDeletingId(id);
    setTimeout(() => {
      setProjects((projects) => projects.filter((p) => p.id !== id));
      setDeletingId(null);
      toast({ title: "Project deleted" });
    }, 800);
  };

  const createProject = () => {
    if (!newProjectName.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setProjects((projects) => [
        {
          id: Date.now().toString(),
          name: newProjectName,
          created_at: new Date().toISOString().slice(0, 10),
        },
        ...projects,
      ]);
      setNewProjectName("");
      setDialogOpen(false);
      setLoading(false);
      toast({ title: "Project created" });
    }, 800);
  };

  if (loading && projects.length === 0) { // Show full page loading only if projects aren't loaded yet
    return <LoadingOverlay message="Loading projects..." />;
  }

  return (
    <MainLayout>
      <PageHeader title="Your Projects" description="Manage your image projects." />
      <div className="container mx-auto py-8"> {/* Changed max-w-2xl to container for wider layout */}
        <div className="flex items-center justify-between mb-6"> {/* Increased mb */}
          <Input
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm" // Slightly wider search
          />
          <Button onClick={() => setDialogOpen(true)}>New Project</Button>
        </div>

        {projects.length === 0 && !loading ? (
          <EmptyView
            icon={<Folder size={48} />} // Larger icon
            title="No projects yet"
            description="Create your first project to organize your images."
            action={<Button onClick={() => setDialogOpen(true)}>Create Project</Button>}
          />
        ) : filtered.length === 0 && !loading ? (
           <EmptyView 
            icon={<Folder size={48} />}
            title="No projects found"
            description="No projects match your search criteria."
            action={null}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                onLoad={() => loadProject(p.id)}
                onDelete={() => deleteProject(p.id)}
                isDeleting={deletingId === p.id}
              />
            ))}
          </div>
        )}
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Project</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              disabled={loading}
            />
            <DialogFooter>
              <Button
                onClick={createProject}
                disabled={loading || !newProjectName.trim()}
              >
                {loading ? "Creating…" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
