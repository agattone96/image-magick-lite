"use client";

export default function BillingDashboard() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-lg p-8 bg-card rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Billing Dashboard</h1>
        <p className="text-muted-foreground">View your current plan and invoices here.</p>
      </div>
    </div>
  );
}
