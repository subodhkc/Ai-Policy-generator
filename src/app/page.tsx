import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold">HAIEC AI Policy Generator</h1>
          <div className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Generate AI Governance Policies in Minutes
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Get a complete, customized AI policy pack tailored to your industry, company size, and risk profile.
              Includes Acceptable Use Policy, Risk Statement, Internal Controls, and Staff Guidelines.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" asChild>
                <Link href="/generate">Generate My Policy Pack</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/dashboard">View Dashboard</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-5xl">
            <h3 className="text-center text-3xl font-bold">What You Get</h3>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle>Acceptable Use Policy</CardTitle>
                  <CardDescription>
                    Clear guidelines for employee AI tool usage
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>AI Risk Statement</CardTitle>
                  <CardDescription>
                    Identify and mitigate AI-related risks
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Internal Controls</CardTitle>
                  <CardDescription>
                    Framework for AI governance oversight
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Staff Guidelines</CardTitle>
                  <CardDescription>
                    Practical guidance for day-to-day use
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-muted py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <h3 className="text-center text-3xl font-bold">Why Use HAIEC?</h3>
              <div className="mt-10 space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-semibold">Customized to Your Business</h4>
                    <p className="text-muted-foreground">
                      Policies tailored to your industry, size, geography, and risk tolerance
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-semibold">Save Time & Money</h4>
                    <p className="text-muted-foreground">
                      Get professional policies in 5-10 minutes vs. weeks of legal review
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-semibold">Editable & Exportable</h4>
                    <p className="text-muted-foreground">
                      Download as DOCX, PDF, or ZIP. Edit and customize as needed.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-semibold">Completely Free</h4>
                    <p className="text-muted-foreground">
                      Generate unlimited policy packs at no cost
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-3xl font-bold">Ready to Get Started?</h3>
            <p className="mt-4 text-lg text-muted-foreground">
              Generate your customized AI policy pack in just a few minutes
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/generate">Generate My Policy Pack</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">
            <p className="font-semibold">Legal Disclaimer</p>
            <p className="mt-2">
              This tool generates template policies for informational purposes only. It does not constitute legal advice.
              Always consult with qualified legal counsel before implementing any policies in your organization.
            </p>
            <div className="mt-6 flex justify-center gap-6">
              <Link href="/privacy" className="hover:underline">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:underline">
                Terms of Service
              </Link>
            </div>
            <p className="mt-6">&copy; {new Date().getFullYear()} HAIEC. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
