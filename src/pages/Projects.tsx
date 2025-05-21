"use client";

import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

interface Project {
  id: string;
  name: string;
  created_at: string;
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
      { id: "1", name: "Portfolio", created_at: "2025-05-01" },
      { id: "2", name: "Client Batch", created_at: "2025-05-10" },
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

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-8">
        <div className="flex items-center justify-between mb-4">
          <Input
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={() => setDialogOpen(true)}>New Project</Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-muted-foreground"
                    >
                      No projects found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.created_at}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => loadProject(p.id)}
                          className="mr-2"
                        >
                          Load
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteProject(p.id)}
                          disabled={deletingId === p.id}
                        >
                          {deletingId === p.id ? "Deleting…" : "Delete"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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
