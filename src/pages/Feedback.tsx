"use client";

import React, { useState } from "react";
import MainLayout from "../components/layout/MainLayout"; // Changed path
import PageHeader from "../components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../components/ui/card"; // Changed path
import { Textarea } from "../components/ui/textarea"; // Changed path
import { Input } from "../components/ui/input"; // Changed path
import { Button } from "../components/ui/button"; // Changed path
import { useToast } from "../components/ui/use-toast"; // Changed path
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "../components/ui/form"; // Added Form components
import LoadingOverlay from "../components/ui/LoadingOverlay"; // Added import
// EmptyView might not be directly used, but imported if a specific scenario arises.
// import EmptyView from "../components/ui/EmptyView"; 

// TODO: Implement feedback submission logic in lib/feedback

// For shadcn/ui Form, you'd typically use react-hook-form.
// This is a simplified setup for structure. A real implementation would need `useForm` from `react-hook-form`.
// const form = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema), defaultValues: {} })
// function onSubmit(values: z.infer<typeof formSchema>) { /* ... */ }

export default function Feedback() {
  const { toast } = useToast();
  // States for direct input values, would be managed by react-hook-form in a full setup
  const [feedbackText, setFeedbackText] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]); // File handling remains custom for this example
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  // This would be the onSubmit for react-hook-form
  const processForm = async () => { 
    if (!feedbackText.trim()) {
      toast({
        title: "Feedback required",
        description: "Please enter your feedback before submitting.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    // Actual submission logic would go here, using values from react-hook-form
    // console.log({ feedbackText, contactEmail, attachments }); 
    try {
      await new Promise((res) => setTimeout(res, 1000)); // Simulate API call
      setFeedbackText("");
      setContactEmail("");
      setAttachments([]);
      // TODO: Clear file input if react-hook-form doesn't handle it.
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
  
  if (submitting) {
    return <LoadingOverlay message="Submitting your feedback..." />;
  }

  return (
    <MainLayout>
      <PageHeader
        title="Submit Feedback"
        description="Let us know how we can improve Image Magick Lite."
      />
      <div className="max-w-lg mx-auto py-8">
        {/* Simplified Form structure without react-hook-form for brevity */}
        {/* In a real app: <Form {...form}> <form onSubmit={form.handleSubmit(processForm)} > ... </Form> </Form> */}
        <form onSubmit={(e) => { e.preventDefault(); processForm(); }}>
          <Card>
            <CardHeader>
              <CardTitle>Send Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6"> {/* Increased spacing */}
              {/* Feedback Textarea */}
              <div className="space-y-2"> {/* Mimicking FormItem structure */}
                <FormLabel htmlFor="feedbackText">What’s on your mind?</FormLabel>
                <Textarea
                  id="feedbackText"
                  placeholder="Detailed feedback helps us improve!"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  maxLength={1000} // Increased maxLength
                  rows={6} // Increased rows
                  disabled={submitting}
                />
                <FormDescription className="text-right text-xs"> {/* Mimicking FormDescription */}
                  {feedbackText.length}/1000
                </FormDescription>
              </div>

              {/* Contact Email Input */}
              <div className="space-y-2">
                <FormLabel htmlFor="contactEmail">Your email (optional)</FormLabel>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="email@example.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  disabled={submitting}
                />
                <FormDescription className="text-xs">
                  We might contact you for more details.
                </FormDescription>
              </div>

              {/* File Attachments Input */}
              <div className="space-y-2">
                <FormLabel htmlFor="attachments">Attach files (optional)</FormLabel>
                <Input
                  id="attachments"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  disabled={submitting}
                />
                <FormDescription className="text-xs">
                  Screenshots or other relevant files. Max 3 files, 5MB each. (Example constraint)
                </FormDescription>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={submitting || !feedbackText.trim()}>
                {submitting ? "Submitting..." : "Submit Feedback"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </MainLayout>
  );
}
