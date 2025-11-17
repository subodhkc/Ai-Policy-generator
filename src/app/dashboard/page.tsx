"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { FileText, Download, Loader2 } from "lucide-react";

interface PolicyPack {
  id: string;
  organizationName: string;
  industry: string;
  status: string;
  documentsCount: number;
  createdAt: string;
  finalizedAt: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [packs, setPacks] = useState<PolicyPack[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchPolicyPacks();
    }
  }, [status, router]);

  const fetchPolicyPacks = async () => {
    try {
      const response = await fetch("/api/policy/packs");
      const result = await response.json();

      if (response.ok) {
        setPacks(result.data.packs);
      } else {
        toast.error("Failed to load policy packs");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (packId: string, format: string) => {
    try {
      toast.info(`Preparing ${format.toUpperCase()} download...`);

      const response = await fetch(`/api/policy/packs/${packId}/export?format=${format}`);

      if (!response.ok) {
        toast.error("Export failed");
        return;
      }

      // Trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `policy-pack.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Download started!");
    } catch (error) {
      toast.error("Export failed");
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Policy Packs Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              Manage and download your AI governance policies
            </p>
          </div>
          <Button asChild>
            <Link href="/generate">Create New Pack</Link>
          </Button>
        </div>

        {packs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 text-xl font-semibold">No policy packs yet</h3>
              <p className="mb-6 text-muted-foreground">
                Create your first AI governance policy pack to get started
              </p>
              <Button asChild>
                <Link href="/generate">Generate Policy Pack</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {packs.map((pack) => (
              <Card key={pack.id}>
                <CardHeader>
                  <CardTitle>{pack.organizationName}</CardTitle>
                  <CardDescription>
                    {pack.industry} • {pack.documentsCount} documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={pack.status === "FINALIZED" ? "text-green-600" : "text-yellow-600"}>
                        {pack.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{new Date(pack.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button asChild className="w-full">
                      <Link href={`/policy-packs/${pack.id}/workspace`}>
                        View & Edit
                      </Link>
                    </Button>

                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExport(pack.id, "docx")}
                      >
                        DOCX
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExport(pack.id, "pdf")}
                      >
                        PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExport(pack.id, "zip")}
                      >
                        ZIP
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
