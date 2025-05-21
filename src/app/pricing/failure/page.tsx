"use client";

export default function PricingFailure() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-lg p-8 bg-card rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Payment Failed</h1>
        <p className="text-muted-foreground">Please try again or use a different payment method.</p>
      </div>
    </div>
  );
}
