"use client";

import React, { useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import PageHeader from "../components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Skeleton } from "../components/ui/skeleton";
import LoadingOverlay from "../components/ui/LoadingOverlay";
import EmptyView from "../components/ui/EmptyView";

// TODO: Implement useAdminPanel hook
const useAdminPanel = () => { return {}; };
// TODO: Implement admin logic in lib/admin

// Types
interface User { id: string; email: string; role: string; }
interface LogEntry { id: string; timestamp: string; message: string; }
interface ModelVersion { id: string; name: string; version: string; }

const Admin: React.FC = () => {
  // State
  const [users, setUsers] = useState<User[]>([
    { id: "1", email: "admin@example.com", role: "admin" },
    { id: "2", email: "user@example.com", role: "user" },
  ]);
  const [logs] = useState<LogEntry[]>([
    { id: "1", timestamp: "2025-05-20 10:00", message: "User login: admin@example.com" },
    { id: "2", timestamp: "2025-05-20 10:05", message: "Model v1.2 activated" },
  ]);
  const [models, setModels] = useState<ModelVersion[]>([
    { id: "1", name: "VisionNet", version: "1.2" },
    { id: "2", name: "VisionNet", version: "1.1" },
  ]);
  const [userSearch, setUserSearch] = useState("");
  const [tab, setTab] = useState("users");
  const [loading, setLoading] = useState(false);

  // Handlers
  const handleUserSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserSearch(e.target.value);
  };

  const changeRole = (userId: string) => {
    setUsers(users => users.map(u => u.id === userId ? { ...u, role: u.role === "admin" ? "user" : "admin" } : u));
  };

  const activateModel = (modelId: string) => {
    setModels(models => models.map(m => ({ ...m, active: m.id === modelId })));
  };

  const deleteModel = (modelId: string) => {
    setModels(models => models.filter(m => m.id !== modelId));
  };

  const uploadNewModel = () => {
    // TODO: Implement model upload logic
  };

  // Filtered users
  const filteredUsers = users.filter(u => u.email.toLowerCase().includes(userSearch.toLowerCase()));

  if (loading) return <LoadingOverlay message="Loading admin panel..." />;

  return (
    <MainLayout>
      <PageHeader title="Admin" description="Admin dashboard and logs." />
      <div className="max-w-5xl mx-auto py-8">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="models">Model Versions</TabsTrigger>
          </TabsList>
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Input placeholder="Search by email..." value={userSearch} onChange={handleUserSearch} className="mb-4 max-w-xs" />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">No users found.</TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map(u => (
                        <TableRow key={u.id}>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>{u.role}</TableCell>
                          <TableCell>
                            <Button size="sm" onClick={() => changeRole(u.id)} className="mr-2">Change Role</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Activity Logs</CardTitle>
              </CardHeader>
              <CardContent className="h-64 overflow-auto">
                {logs.length === 0 ? (
                  <EmptyView icon={null} title="No logs" description="No activity logs found." />
                ) : (
                  logs.map(l => (
                    <div key={l.id} className="mb-2">
                      <p className="text-sm"><strong>{l.timestamp}</strong> – {l.message}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="models">
            <Card>
              <CardHeader>
                <CardTitle>Model Versions</CardTitle>
              </CardHeader>
              <CardContent>
                {models.length === 0 ? (
                  <EmptyView icon={null} title="No models" description="No model versions found." />
                ) : (
                  models.map(m => (
                    <div key={m.id} className="flex justify-between items-center mb-2">
                      <span>{m.name} (v{m.version})</span>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => activateModel(m.id)}>Activate</Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteModel(m.id)}>Delete</Button>
                      </div>
                    </div>
                  ))
                )}
                <Button onClick={uploadNewModel} className="mt-4">Upload New Version</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Admin;
