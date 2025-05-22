"use client";

import React, { useState } from "react";
import MainLayout from "../components/layout/MainLayout"; // Changed path
import PageHeader from "../components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../components/ui/card"; // Changed path
import { Input } from "../components/ui/input"; // Changed path
import { Switch } from "../components/ui/switch"; // Changed path
import { Button } from "../components/ui/button"; // Changed path
import { useToast } from "../components/ui/use-toast"; // Changed path
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select"; // Added Select
import LoadingOverlay from "../components/ui/LoadingOverlay"; // Added import
// EmptyView might not be directly applicable but imported for completeness if a scenario arises
// import EmptyView from "../components/ui/EmptyView"; 

// TODO: Implement settings management logic in lib/settings
const useSettings = () => { return {}; }; // TODO: Implement useSettings hook

export default function Settings() {
  const { toast } = useToast();
  // TODO: These states would ideally be managed by useSettings hook
  const [displayName, setDisplayName] = useState("User"); // Added default
  const [theme, setTheme] = useState("system"); // Added theme state
  const [darkMode, setDarkMode] = useState(false); // This might be derived from theme
  const [notifications, setNotifications] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // TODO: Actual save logic using settings from useSettings hook
    setTimeout(() => {
      setSaving(false);
      toast({ title: "Settings saved!" });
    }, 800);
  };

  if (saving) { // Show LoadingOverlay for the whole page while saving
    return (
      <MainLayout>
        <PageHeader
          title="Application Settings"
          description="Configure your Image Magick Lite preferences."
        />
        <LoadingOverlay message="Saving settings..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="Application Settings"
        description="Configure your Image Magick Lite preferences."
      />
      <div className="max-w-lg mx-auto py-8">
        <form onSubmit={handleSave} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div> {/* Added div for label association */}
                <label htmlFor="displayName" className="block text-sm font-medium mb-1">
                  Display Name
                </label>
                <Input
                  id="displayName"
                  placeholder="Display Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={saving}
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6"> {/* Increased spacing for new item */}
              <div className="flex items-center justify-between">
                <label htmlFor="theme" className="text-sm font-medium">Theme</label> {/* Added label */}
                <Select value={theme} onValueChange={setTheme} disabled={saving}>
                  <SelectTrigger id="theme" className="w-[180px]">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="darkMode" className="text-sm font-medium">Dark Mode (Legacy)</label> {/* Added label */}
                <Switch
                  id="darkMode"
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                  disabled={saving || theme !== 'light'} // Example: disable if theme is dark/system
                />
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="notifications" className="text-sm font-medium">Notifications</label> {/* Added label */}
                <Switch
                  id="notifications"
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
