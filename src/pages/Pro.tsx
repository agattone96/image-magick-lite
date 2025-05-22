"use client";

import React, { useState } from "react";
import MainLayout from "../components/layout/MainLayout"; // Changed path
import PageHeader from "../components/layout/PageHeader"; // Added import
// Card components might be used by PricingCard internally or for overall page structure
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../components/ui/card"; // Changed path
import { Button } from "../components/ui/button"; // Changed path
import { Badge } from "../components/ui/badge"; // Changed path
import { useToast } from "../components/ui/use-toast"; // Changed path
import PricingCard from "../components/ui/PricingCard"; // Added import
import LoadingOverlay from "../components/ui/LoadingOverlay"; // Added import
import EmptyView from "../components/ui/EmptyView"; // Added import

// TODO: Implement Stripe subscription logic in lib/stripe
const useSubscription = () => { return {}; }; // TODO: Implement useSubscription hook

// Mock Plan Data - in a real app, this would come from a store or API
const mockPlans = [
  {
    id: "pro_monthly",
    name: "Pro Monthly",
    price: "$10/month",
    features: ["Unlimited projects", "Priority support", "Team collaboration", "Advanced analytics"],
    isCurrent: false, // This would be dynamic based on user's subscription
    onSubscribe: () => {}, // Placeholder
    onCancel: () => {}, // Placeholder
  },
  {
    id: "pro_yearly",
    name: "Pro Yearly",
    price: "$100/year",
    features: ["All Pro features", "2 months free", "Yearly billing"],
    isCurrent: false,
    onSubscribe: () => {},
    onCancel: () => {},
  }
];


export default function Pro() {
  const { toast } = useToast();
  // Simulate user plan state - this might be managed by useSubscription hook later
  const [currentUserPlanId, setCurrentUserPlanId] = useState<string | null>(null); 
  const [loadingAction, setLoadingAction] = useState<string | null>(null); // To track loading for a specific plan

  const handleSubscribe = async (planId: string) => {
    setLoadingAction(planId);
    // TODO: Integrate with actual subscription logic from useSubscription
    setTimeout(() => {
      setCurrentUserPlanId(planId);
      setLoadingAction(null);
      toast({
        title: "Subscription Updated!",
        description: `Successfully subscribed to plan: ${planId}.`,
      });
    }, 1200);
  };

  const handleCancel = async (planId: string) => {
    setLoadingAction(planId);
    // TODO: Integrate with actual subscription logic from useSubscription
    setTimeout(() => {
      setCurrentUserPlanId(null); // Assuming cancellation reverts to free/no plan
      setLoadingAction(null);
      toast({
        title: "Subscription Cancelled",
        description: "You are now on the Free plan.",
      });
    }, 1200);
  };
  
  // Example: if plans couldn't load (add a state for this if plans are fetched)
  // const [plansError, setPlansError] = useState<string | null>(null);
  // if (plansError) {
  //   return (
  //     <MainLayout>
  //       <PageHeader title="Go Pro" description="Unlock premium features with Image Magick Lite Pro." />
  //       <EmptyView title="Error Loading Plans" description={plansError} icon={null} />
  //     </MainLayout>
  //   );
  // }

  // If a specific action (subscribing/cancelling) is happening for any plan
  if (loadingAction && !currentUserPlanId) { // Show overlay when initiating a subscription
     return <LoadingOverlay message="Processing your subscription..." />;
  }


  return (
    <MainLayout>
      <PageHeader title="Go Pro" description="Unlock premium features with Image Magick Lite Pro." />
      <div className="container mx-auto py-8">
        {/* TODO: Add LoadingOverlay here if plans are being fetched initially */}
        {/* For example: if (isLoadingPlans) return <LoadingOverlay message="Loading plans..." /> */}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {mockPlans.map((plan) => (
            <PricingCard
              key={plan.id}
              planName={plan.name}
              price={plan.price}
              features={plan.features}
              isCurrent={currentUserPlanId === plan.id}
              isLoading={loadingAction === plan.id}
              onSubscribe={() => handleSubscribe(plan.id)}
              onCancel={() => handleCancel(plan.id)}
              // You might need to pass more props depending on PricingCard's definition
            />
          ))}
        </div>
        {/* Example of EmptyView if no plans were available and not error */}
        {/* {mockPlans.length === 0 && !isLoadingPlans && !plansError && (
            <EmptyView title="No Plans Available" description="Pricing plans are currently not available. Please check back later." icon={null} />
        )} */}
      </div>
    </MainLayout>
  );
}
