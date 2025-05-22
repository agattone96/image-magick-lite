"use client";

import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "../components/layout/PageHeader";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  // CardFooter, // Removed unused import
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast({ title: "Settings saved!" });
    }, 800);
  };

  return (
    <MainLayout>
      <PageHeader
        title="Settings"
        description="Manage your user preferences and app settings."
      />
      <div className="max-w-lg mx-auto py-8">
        <form onSubmit={handleSave} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="block text-sm font-medium mb-1">
                Display Name
              </label>
              <Input
                placeholder="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={saving}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Dark Mode</span>
                <Switch
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                  disabled={saving}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Notifications</span>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                  disabled={saving}
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                type="button"
                disabled={saving}
                onClick={() =>
                  toast({
                    title: "Account deletion not implemented in demo.",
                  })
                }
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
          <Button type="submit" disabled={saving} className="w-full">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>
    </MainLayout>
  );
}
