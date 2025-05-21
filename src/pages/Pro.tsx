"use client";

import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

export default function Pro() {
  const { toast } = useToast();
  // Simulate user plan state
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    setTimeout(() => {
      setIsPro(true);
      setLoading(false);
      toast({
        title: "Upgraded to Pro!",
        description: "Enjoy your new features.",
      });
    }, 1200);
  };

  const handleCancel = async () => {
    setLoading(true);
    setTimeout(() => {
      setIsPro(false);
      setLoading(false);
      toast({
        title: "Subscription cancelled",
        description: "You are now on the Free plan.",
      });
    }, 1200);
  };

  return (
    <MainLayout>
      <div className="max-w-lg mx-auto p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pro Plan</CardTitle>
            <Badge variant={isPro ? "default" : "outline"} className="ml-2">
              {isPro ? "Pro" : "Free"}
            </Badge>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Unlock advanced features:</p>
            <ul className="list-disc ml-6 mb-4 space-y-1">
              <li>Unlimited projects</li>
              <li>Priority support</li>
              <li>Team collaboration</li>
            </ul>
          </CardContent>
          <CardFooter>
            {isPro ? (
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={loading}
              >
                {loading ? "Cancelling..." : "Cancel Subscription"}
              </Button>
            ) : (
              <Button onClick={handleSubscribe} disabled={loading}>
                {loading ? "Upgrading..." : "Upgrade to Pro"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}
