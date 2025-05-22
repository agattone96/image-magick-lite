"use client";

import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "../components/layout/PageHeader";
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
  // const [attachments, setAttachments] = useState<File[]>([]); // Removed
  const [submitting, setSubmitting] = useState(false);

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { // Removed
  //   if (e.target.files) {
  //     // setAttachments(Array.from(e.target.files)); // Removed
  //   }
  // };

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
      // setAttachments([]); // Removed
      toast({
        title: "Thank you!",
        description: "Your feedback has been submitted.",
      });
    } catch { // Removed unused 'e'
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
      <PageHeader
        title="Feedback"
        description="Send us your feedback and suggestions."
      />
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
            {/* <Input // Removed file input as attachments are removed
              type="file"
              multiple
              onChange={handleFileChange}
              disabled={submitting}
            /> */}
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
