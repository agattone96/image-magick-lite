"use client";

import React, { useEffect, useState } from "react";
// import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

// Types
interface User { id: string; email: string; role: string; }
interface LogEntry { id: string; timestamp: string; message: string; }
interface ModelVersion { id: string; name: string; version: string; }

export default function Admin() {
  // const supabase = useSupabaseClient();
  // const session = useSession();

  // Auth guard (placeholder for demo)
  // if (!session || session.user.role !== "admin") {
  //   return <p className="text-center mt-10">Access denied.</p>;
  // }

  // State
  const [users, setUsers] = useState<User[]>([
    { id: "1", email: "admin@example.com", role: "admin" },
    { id: "2", email: "user@example.com", role: "user" },
  ]);
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: "1", timestamp: "2025-05-20 10:00", message: "User login: admin@example.com" },
    { id: "2", timestamp: "2025-05-20 10:05", message: "Model v1.2 activated" },
  ]);
  const [models, setModels] = useState<ModelVersion[]>([
    { id: "1", name: "VisionNet", version: "1.2" },
    { id: "2", name: "VisionNet", version: "1.1" },
  ]);
  const [userSearch, setUserSearch] = useState("");

  // Handlers
  const handleUserSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserSearch(e.target.value);
  };

  const changeRole = async (userId: string) => {
    setUsers(users => users.map(u => u.id === userId ? { ...u, role: u.role === "admin" ? "user" : "admin" } : u));
    toast({ title: "Role updated" });
  };

  const activateModel = async (modelId: string) => {
    setModels(models => models.map(m => ({ ...m, active: m.id === modelId })));
    toast({ title: "Model activated" });
  };

  const deleteModel = async (modelId: string) => {
    setModels(models => models.filter(m => m.id !== modelId));
    toast({ title: "Model deleted" });
  };

  const uploadNewModel = () => {
    toast({ title: "Upload not implemented in demo." });
  };

  // Filtered users
  const filteredUsers = users.filter(u => u.email.toLowerCase().includes(userSearch.toLowerCase()));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* User Management Card */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Input placeholder="Search by email..." onChange={handleUserSearch} />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(u => (
                <TableRow key={u.id}>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell>
                    <Button size="sm" onClick={() => changeRole(u.id)}>Change Role</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Activity Logs Card */}
      <Card>
        <CardHeader>
          <CardTitle>Logs</CardTitle>
        </CardHeader>
        <CardContent className="h-64 overflow-auto">
          {logs.map(l => (
            <div key={l.id} className="mb-2">
              <p className="text-sm"><strong>{l.timestamp}</strong> – {l.message}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Model Versions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Model Versions</CardTitle>
        </CardHeader>
        <CardContent>
          {models.map(m => (
            <div key={m.id} className="flex justify-between items-center mb-2">
              <span>{m.name} (v{m.version})</span>
              <div>
                <Button size="sm" onClick={() => activateModel(m.id)}>Activate</Button>
                <Button size="sm" variant="destructive" onClick={() => deleteModel(m.id)}>Delete</Button>
              </div>
            </div>
          ))}
          <Button onClick={uploadNewModel}>Upload New Version</Button>
        </CardContent>
      </Card>
    </div>
  );
}
