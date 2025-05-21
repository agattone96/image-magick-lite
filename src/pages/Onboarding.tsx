"use client";

import React, { useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import PageHeader from "../components/layout/PageHeader";
import { Card, CardHeader, CardContent, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Checkbox } from "../components/ui/checkbox";
import EmptyView from "../components/ui/EmptyView";
import LoadingOverlay from "../components/ui/LoadingOverlay";

// TODO: Implement useOnboarding hook
// const useOnboarding = () => { return {}; };
// TODO: Implement onboarding logic in lib/onboarding

const steps = [
	{
		title: "Welcome",
		content: (
			<div className="space-y-4">
				<p>Welcome! This quick setup will help you get started.</p>
			</div>
		),
	},
	{
		title: "Preferences",
		content: (
			<div className="space-y-4">
				<label className="block">
					Theme
					<Input type="text" placeholder="e.g. Light, Dark" />
				</label>
				<label className="flex items-center gap-2">
					<Checkbox id="advanced" />
					<span>Enable advanced features</span>
				</label>
			</div>
		),
	},
	{
		title: "Complete",
		content: (
			<div className="space-y-4">
				<p>All set! Let’s go.</p>
			</div>
		),
	},
];

const Onboarding: React.FC = () => {
	const [currentStep, setCurrentStep] = useState(0);
	const [loading, setLoading] = useState(false); // Simulate loading state
	const [error, setError] = useState<string | null>(null);

	const nextStep = () =>
		setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
	const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));
	const finishOnboarding = () => {
		localStorage.setItem("onboardingComplete", "true");
		window.location.href = "/";
	};

	// Simulate onboarding complete/empty state
	// const onboardingComplete = false; // TODO: derive from useOnboarding
	// if (onboardingComplete) return <EmptyView ... />;

	if (loading)
		return <LoadingOverlay message="Loading onboarding..." />;
	if (error)
		return (
			<EmptyView
				icon={null}
				title="Error"
				description={error}
			/>
		);

	return (
		<MainLayout>
			<PageHeader
				title="Onboarding"
				description="Get started with Image Magick Lite."
				actions={
					currentStep > 0 ? (
						<Button variant="outline" onClick={prevStep}>
							Back
						</Button>
					) : null
				}
			/>
			<div className="max-w-md mx-auto py-12">
				<Card className="shadow-lg transition-all">
					<CardHeader>
						<div className="flex items-center gap-2 mb-4">
							{steps.map((step, idx) => (
								<div
									key={step.title}
									className={`flex-1 h-2 rounded-full transition-colors ${
										idx <= currentStep
											? "bg-primary"
											: "bg-muted"
									}`}
									aria-label={step.title}
								/>
							))}
						</div>
						<h2 className="text-xl font-semibold mb-2">
							{steps[currentStep].title}
						</h2>
					</CardHeader>
					<CardContent>
						{steps[currentStep].content}
					</CardContent>
					<CardFooter className="flex gap-2 justify-end">
						{currentStep < steps.length - 1 ? (
							<Button
								onClick={nextStep}
								className="transition-colors"
							>
								Next
							</Button>
						) : (
							<Button
								onClick={finishOnboarding}
								className="transition-colors"
							>
								Go to Dashboard
							</Button>
						)}
					</CardFooter>
				</Card>
			</div>
		</MainLayout>
	);
};

export default Onboarding;
