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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function Feedback() {
  const { toast } = useToast();
  const [feedbackText, setFeedbackText] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const handleSubmit = async () => {
    if (!feedbackText.trim()) {
      toast({
        title: "Feedback required",
        description: "Please enter your feedback before submitting.",
      });
      return;
    }
    setSubmitting(true);
    try {
      // Simulate API call
      await new Promise((res) => setTimeout(res, 1000));
      setFeedbackText("");
      setContactEmail("");
      setAttachments([]);
      toast({
        title: "Thank you!",
        description: "Your feedback has been submitted.",
      });
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to submit feedback.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-lg mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Send Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="What’s on your mind?"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              maxLength={500}
              disabled={submitting}
            />
            <div className="text-right text-xs text-muted-foreground">
              {feedbackText.length}/500
            </div>
            <Input
              type="email"
              placeholder="Your email (optional)"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              disabled={submitting}
            />
            <Input
              type="file"
              multiple
              onChange={handleFileChange}
              disabled={submitting}
            />
          </CardContent>
          <CardFooter>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}
