"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Download, Mail, Lock, Save, RefreshCw } from "lucide-react";
import type { PolicyContent, PolicySection } from "@/types";

interface PolicyDocument {
  id: string;
  type: string;
  title: string;
  content: PolicyContent;
  lastRegeneratedAt: string | null;
}

interface PolicyPack {
  id: string;
  organizationName: string;
  status: string;
  createdAt: string;
  finalizedAt: string | null;
  documents: PolicyDocument[];
}

export default function WorkspacePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [pack, setPack] = useState<PolicyPack | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editedContent, setEditedContent] = useState<Record<string, PolicyContent>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    fetchPolicyPack();
  }, [params.id]);

  const fetchPolicyPack = async () => {
    try {
      const response = await fetch(`/api/policy/packs/${params.id}`);
      const result = await response.json();

      if (response.ok) {
        setPack(result.data);
        // Initialize edited content with current content
        const initial: Record<string, PolicyContent> = {};
        result.data.documents.forEach((doc: PolicyDocument) => {
          initial[doc.id] = doc.content;
        });
        setEditedContent(initial);
      } else {
        toast.error("Failed to load policy pack");
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error("An error occurred");
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectionEdit = (docId: string, sectionId: string, newContent: string) => {
    setEditedContent((prev) => {
      const docContent = prev[docId];
      if (!docContent) return prev;

      const updatedSections = docContent.sections.map((section) =>
        section.id === sectionId ? { ...section, content: newContent } : section
      );

      return {
        ...prev,
        [docId]: {
          ...docContent,
          sections: updatedSections,
        },
      };
    });
    setHasUnsavedChanges(true);
  };

  const handleSaveDocument = async (docId: string) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/policy/documents/${docId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editedContent[docId] }),
      });

      if (response.ok) {
        toast.success("Changes saved successfully!");
        setHasUnsavedChanges(false);
        // Refresh the pack to get updated data
        await fetchPolicyPack();
      } else {
        toast.error("Failed to save changes");
      }
    } catch (error) {
      toast.error("An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerateSection = async (docId: string, sectionId: string) => {
    try {
      toast.info("Regenerating section with AI...");

      const response = await fetch(`/api/policy/documents/${docId}/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionId }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success("Section regenerated successfully!");

        // Update the edited content with the new section
        setEditedContent((prev) => {
          const docContent = prev[docId];
          if (!docContent) return prev;

          const updatedSections = docContent.sections.map((section) =>
            section.id === sectionId ? result.data.section : section
          );

          return {
            ...prev,
            [docId]: {
              ...docContent,
              sections: updatedSections,
            },
          };
        });
        setHasUnsavedChanges(true);
      } else {
        toast.error("Failed to regenerate section");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleFinalize = async () => {
    if (!confirm("Finalize this policy pack? You won't be able to edit it after finalization.")) {
      return;
    }

    try {
      const response = await fetch(`/api/policy/packs/${params.id}/finalize`, {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Policy pack finalized!");
        await fetchPolicyPack();
      } else {
        toast.error("Failed to finalize pack");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleExport = async (format: string) => {
    try {
      toast.info(`Preparing ${format.toUpperCase()} download...`);

      const response = await fetch(`/api/policy/packs/${params.id}/export?format=${format}`);

      if (!response.ok) {
        toast.error("Export failed");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${pack?.organizationName || "policy-pack"}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Download started!");
    } catch (error) {
      toast.error("Export failed");
    }
  };

  const handleEmailPack = async () => {
    try {
      toast.info("Sending email...");

      const response = await fetch(`/api/policy/packs/${params.id}/email`, {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Email sent! Check your inbox.");
      } else {
        toast.error("Failed to send email");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!pack) {
    return null;
  }

  const isFinalized = pack.status === "FINALIZED";

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard">← Back to Dashboard</Link>
                </Button>
              </div>
              <h1 className="text-3xl font-bold">{pack.organizationName} - AI Policy Pack</h1>
              <p className="mt-1 text-muted-foreground">
                Status: <span className={isFinalized ? "text-green-600" : "text-yellow-600"}>{pack.status}</span>
                {isFinalized && " (Read-only)"}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleExport("docx")}>
                  <Download className="mr-2 h-4 w-4" />
                  DOCX
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExport("pdf")}>
                  <Download className="mr-2 h-4 w-4" />
                  PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExport("zip")}>
                  <Download className="mr-2 h-4 w-4" />
                  ZIP
                </Button>
              </div>
              {session && (
                <Button variant="outline" size="sm" onClick={handleEmailPack}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email Me
                </Button>
              )}
            </div>
          </div>

          {hasUnsavedChanges && (
            <div className="mt-4 rounded-lg border border-yellow-500 bg-yellow-50 p-3 text-sm text-yellow-800">
              You have unsaved changes. Remember to save before leaving!
            </div>
          )}
        </div>

        {/* Policy Documents Tabs */}
        <Tabs defaultValue={pack.documents[0]?.id} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            {pack.documents.map((doc) => (
              <TabsTrigger key={doc.id} value={doc.id}>
                {doc.type.replace(/_/g, " ")}
              </TabsTrigger>
            ))}
          </TabsList>

          {pack.documents.map((doc, docIndex) => (
            <TabsContent key={doc.id} value={doc.id}>
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{editedContent[doc.id]?.title || doc.title}</CardTitle>
                      <CardDescription>
                        {editedContent[doc.id]?.sections.length || 0} sections
                        {doc.lastRegeneratedAt && (
                          <> • Last regenerated: {new Date(doc.lastRegeneratedAt).toLocaleString()}</>
                        )}
                      </CardDescription>
                    </div>
                    {!isFinalized && (
                      <Button onClick={() => handleSaveDocument(doc.id)} disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {editedContent[doc.id]?.sections.map((section) => (
                    <div key={section.id} className="space-y-3 rounded-lg border p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{section.heading}</h3>
                          {section.riskLevel && (
                            <span
                              className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                                section.riskLevel === "high"
                                  ? "bg-red-100 text-red-800"
                                  : section.riskLevel === "medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {section.riskLevel.toUpperCase()} RISK
                            </span>
                          )}
                          {section.notes && (
                            <p className="mt-1 text-xs text-muted-foreground italic">Note: {section.notes}</p>
                          )}
                        </div>
                        {!isFinalized && process.env.NEXT_PUBLIC_ENABLE_AI_REGENERATE !== "false" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRegenerateSection(doc.id, section.id)}
                          >
                            <RefreshCw className="mr-2 h-3 w-3" />
                            Regenerate
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`section-${section.id}`} className="sr-only">
                          {section.heading}
                        </Label>
                        <Textarea
                          id={`section-${section.id}`}
                          value={section.content}
                          onChange={(e) => handleSectionEdit(doc.id, section.id, e.target.value)}
                          disabled={isFinalized}
                          className="min-h-[200px] font-mono text-sm"
                          placeholder="Section content..."
                        />
                      </div>
                    </div>
                  ))}

                  {!isFinalized && docIndex === pack.documents.length - 1 && (
                    <div className="pt-4">
                      <Button variant="default" onClick={handleFinalize}>
                        <Lock className="mr-2 h-4 w-4" />
                        Finalize Policy Pack
                      </Button>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Finalizing will lock this policy pack and make it read-only. You can still download and export it.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Legal Disclaimer */}
        <div className="mt-8 rounded-lg border bg-muted p-4 text-sm text-muted-foreground">
          <p className="font-semibold">Legal Disclaimer:</p>
          <p className="mt-1">
            These policies are provided as templates for informational purposes only and do not constitute legal advice.
            Always consult with qualified legal counsel before implementing any policies in your organization.
          </p>
        </div>
      </div>
    </div>
  );
}
