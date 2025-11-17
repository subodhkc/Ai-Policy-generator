"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { IntakeFormSchema, type IntakeFormData, INDUSTRY_OPTIONS, AI_USE_CASES, USER_ROLE_OPTIONS } from "@/types";
import { Loader2 } from "lucide-react";

export default function GeneratePage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<IntakeFormData>({
    resolver: zodResolver(IntakeFormSchema),
    defaultValues: {
      primaryAiUses: [],
      consent: false,
    },
  });

  const primaryAiUses = watch("primaryAiUses");

  const toggleAiUse = (useCase: string) => {
    const current = primaryAiUses || [];
    const updated = current.includes(useCase)
      ? current.filter((u) => u !== useCase)
      : [...current, useCase];
    setValue("primaryAiUses", updated, { shouldValidate: true });
  };

  const onSubmit = async (data: IntakeFormData) => {
    setIsGenerating(true);

    try {
      const response = await fetch("/api/policy/generate-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error?.message || "Failed to generate policies");
        return;
      }

      toast.success("Your AI policy pack has been generated!");

      // Redirect to workspace
      router.push(`/policy-packs/${result.data.policyPackId}/workspace`);
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">Generate Your AI Policy Pack</h1>
            <p className="mt-2 text-muted-foreground">
              Answer a few questions to get customized AI governance policies for your organization
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Tell us about your organization to create tailored policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="companyName">
                    Company Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="companyName"
                    placeholder="Acme Corporation"
                    {...register("companyName")}
                    disabled={isGenerating}
                  />
                  {errors.companyName && (
                    <p className="text-sm text-destructive">{errors.companyName.message}</p>
                  )}
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="website">Company Website (optional)</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://example.com"
                    {...register("website")}
                    disabled={isGenerating}
                  />
                  {errors.website && (
                    <p className="text-sm text-destructive">{errors.website.message}</p>
                  )}
                </div>

                {/* Industry */}
                <div className="space-y-2">
                  <Label htmlFor="industry">
                    Industry <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="industry"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...register("industry")}
                    disabled={isGenerating}
                  >
                    <option value="">Select industry...</option>
                    {INDUSTRY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.industry && (
                    <p className="text-sm text-destructive">{errors.industry.message}</p>
                  )}
                </div>

                {/* Company Size */}
                <div className="space-y-2">
                  <Label>
                    Company Size <span className="text-destructive">*</span>
                  </Label>
                  <RadioGroup
                    onValueChange={(value) => setValue("companySize", value as any, { shouldValidate: true })}
                    disabled={isGenerating}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="MICRO" id="size-micro" />
                      <Label htmlFor="size-micro" className="font-normal">
                        1-10 employees
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="SMALL" id="size-small" />
                      <Label htmlFor="size-small" className="font-normal">
                        11-50 employees
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="MEDIUM" id="size-medium" />
                      <Label htmlFor="size-medium" className="font-normal">
                        51-200 employees
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="LARGE" id="size-large" />
                      <Label htmlFor="size-large" className="font-normal">
                        201-1000 employees
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ENTERPRISE" id="size-enterprise" />
                      <Label htmlFor="size-enterprise" className="font-normal">
                        1000+ employees
                      </Label>
                    </div>
                  </RadioGroup>
                  {errors.companySize && (
                    <p className="text-sm text-destructive">{errors.companySize.message}</p>
                  )}
                </div>

                {/* Geography */}
                <div className="space-y-2">
                  <Label htmlFor="geography">
                    Primary Geography <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="geography"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...register("geography")}
                    disabled={isGenerating}
                  >
                    <option value="">Select geography...</option>
                    <option value="US">United States</option>
                    <option value="EU">European Union</option>
                    <option value="UK">United Kingdom</option>
                    <option value="CANADA">Canada</option>
                    <option value="AUSTRALIA">Australia</option>
                    <option value="GLOBAL">Global</option>
                    <option value="OTHER">Other</option>
                  </select>
                  {errors.geography && (
                    <p className="text-sm text-destructive">{errors.geography.message}</p>
                  )}
                </div>

                {/* Primary AI Uses */}
                <div className="space-y-2">
                  <Label>
                    Primary AI Uses <span className="text-destructive">*</span> (Select all that apply)
                  </Label>
                  <div className="space-y-2">
                    {AI_USE_CASES.map((useCase) => (
                      <div key={useCase.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={useCase.id}
                          checked={primaryAiUses?.includes(useCase.id)}
                          onCheckedChange={() => toggleAiUse(useCase.id)}
                          disabled={isGenerating}
                        />
                        <Label htmlFor={useCase.id} className="font-normal">
                          {useCase.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.primaryAiUses && (
                    <p className="text-sm text-destructive">{errors.primaryAiUses.message}</p>
                  )}
                </div>

                {/* Risk Posture */}
                <div className="space-y-2">
                  <Label>
                    Risk Posture <span className="text-destructive">*</span>
                  </Label>
                  <RadioGroup
                    onValueChange={(value) => setValue("riskPosture", value as any, { shouldValidate: true })}
                    disabled={isGenerating}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="CONSERVATIVE" id="risk-conservative" />
                      <Label htmlFor="risk-conservative" className="font-normal">
                        Conservative - Strict controls, compliance-focused
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="BALANCED" id="risk-balanced" />
                      <Label htmlFor="risk-balanced" className="font-normal">
                        Balanced - Practical controls with flexibility
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="AGGRESSIVE" id="risk-aggressive" />
                      <Label htmlFor="risk-aggressive" className="font-normal">
                        Aggressive - Innovation-friendly, lighter controls
                      </Label>
                    </div>
                  </RadioGroup>
                  {errors.riskPosture && (
                    <p className="text-sm text-destructive">{errors.riskPosture.message}</p>
                  )}
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label htmlFor="role">
                    Your Role <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="role"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...register("role")}
                    disabled={isGenerating}
                  >
                    <option value="">Select your role...</option>
                    {USER_ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  {errors.role && (
                    <p className="text-sm text-destructive">{errors.role.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    {...register("email")}
                    disabled={isGenerating}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                {/* Consent */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="consent"
                    onCheckedChange={(checked) => setValue("consent", checked as boolean, { shouldValidate: true })}
                    disabled={isGenerating}
                  />
                  <Label htmlFor="consent" className="text-sm font-normal">
                    I consent to receive updates and resources about AI governance (required)
                    <span className="text-destructive">*</span>
                  </Label>
                </div>
                {errors.consent && (
                  <p className="text-sm text-destructive">{errors.consent.message}</p>
                )}

                {/* Disclaimer */}
                <div className="rounded-lg border bg-muted p-4 text-sm text-muted-foreground">
                  <p className="font-semibold">Legal Disclaimer:</p>
                  <p className="mt-1">
                    The policies generated are templates for informational purposes only and do not constitute legal advice.
                    Always consult with qualified legal counsel before implementing any policies.
                  </p>
                </div>

                {/* Submit Button */}
                <Button type="submit" size="lg" className="w-full" disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Your Policies...
                    </>
                  ) : (
                    "Generate My Policy Pack"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
