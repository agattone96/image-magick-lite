"use client";

import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

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

export default function Onboarding() {
	const [currentStep, setCurrentStep] = useState(0);

	const nextStep = () =>
		setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
	const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));
	const finishOnboarding = () => {
		localStorage.setItem("onboardingComplete", "true");
		window.location.href = "/";
	};

	return (
		<MainLayout>
			<div className="max-w-md mx-auto py-12">
				<div className="mb-8">
					<div className="flex items-center gap-2 mb-4">
						{steps.map((step, idx) => (
							<div
								key={step.title}
								className={`flex-1 h-2 rounded-full ${
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
				</div>
				<div className="mb-8">{steps[currentStep].content}</div>
				<div className="flex gap-2">
					{currentStep > 0 && (
						<Button variant="outline" onClick={prevStep}>
							Back
						</Button>
					)}
					{currentStep < steps.length - 1 ? (
						<Button onClick={nextStep}>Next</Button>
					) : (
						<Button onClick={finishOnboarding}>
							Go to Dashboard
						</Button>
					)}
				</div>
			</div>
		</MainLayout>
	);
}
