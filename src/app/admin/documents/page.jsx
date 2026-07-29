"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  FileText,
  Upload,
  Eye,
  Edit2,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
} from "lucide-react";
import { documentAPI } from "@/api/documentService";
import mammoth from "mammoth";
import DOMPurify from "dompurify";

const DOCUMENT_TYPES = [
  {
    value: "terms_and_conditions",
    label: "Terms and Conditions",
    description: "Legal terms governing the use of your service",
  },
  {
    value: "privacy_policy",
    label: "Privacy Policy",
    description: "How user data is collected and used",
  },
  {
    value: "cancellation_policy",
    label: "Cancellation Policy",
    description: "Rules and procedures for booking cancellations",
  },
  {
    value: "refund_policy",
    label: "Refund Policy",
    description: "Guidelines for refunds and returns",
  },
  {
    value: "user_agreement",
    label: "User Agreement",
    description: "Agreement between users and the platform",
  },
];

export default function DocumentManagementPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [formData, setFormData] = useState({
    type: "",
    title: "",
    content: "",
    version: "1.0.0",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [convertedHtml, setConvertedHtml] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await documentAPI.getDocuments();

      // Handle the nested data structure
      const documents =
        response.data?.data?.documents || response.data?.documents || [];

      setDocuments(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Error",
        description: "Failed to fetch documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: "",
      title: "",
      content: "",
      version: "1.0.0",
    });
    setSelectedFile(null);
    setConvertedHtml("");
    setPreviewHtml("");
    setEditingDocument(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setShowDialog(true);
  };

  const openEditDialog = (doc) => {
    setEditingDocument(doc);
    setFormData({
      type: doc.type,
      title: doc.title,
      content: doc.content,
      version: doc.version || "1.0.0",
    });
    setConvertedHtml(doc.content);
    setShowDialog(true);
  };

  const openPreviewDialog = (doc) => {
    setPreviewDocument(doc);
    setShowPreviewDialog(true);
    // Use the content from the already fetched document data
    setPreviewHtml(doc.content || "No content available");
  };
  const closeDialog = () => {
    setShowDialog(false);
    setShowPreviewDialog(false);
    resetForm();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".docx")) {
      toast({
        title: "Invalid File",
        description: "Please upload a .docx file",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setIsConverting(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const cleanHtml = DOMPurify.sanitize(result.value);

      setConvertedHtml(cleanHtml);
      setFormData((prev) => ({
        ...prev,
        content: cleanHtml,
        title: prev.title || file.name.replace(".docx", ""),
      }));

      toast({
        title: "File Converted",
        description: "Document has been successfully converted to HTML",
      });
    } catch (error) {
      console.error("Error converting file:", error);
      toast({
        title: "Conversion Error",
        description: "Failed to convert the document",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.type || !formData.title || !formData.content) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and upload a document",
        variant: "destructive",
      });
      return;
    }

    // Validate semantic version format
    const versionRegex = /^\d+\.\d+\.\d+$/;
    if (!versionRegex.test(formData.version)) {
      toast({
        title: "Version Format Error",
        description: "Version must be in semantic format (e.g., 1.0.0, 2.1.3)",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        type: formData.type,
        title: formData.title,
        content: formData.content,
        version: formData.version,
      };

      if (editingDocument) {
        // Update existing document
        await documentAPI.updateDocument(editingDocument.id, payload);
      } else {
        // Create new document
        await documentAPI.createDocument(payload);
      }

      toast({
        title: "Success",
        description: editingDocument
          ? "Document updated successfully"
          : "Document created successfully",
      });

      closeDialog();
      fetchDocuments();
    } catch (error) {
      console.error("Error saving document:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save document",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      await documentAPI.deleteDocument(id);
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
      fetchDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  const getDocumentTypeLabel = (type) => {
    return DOCUMENT_TYPES.find((dt) => dt.value === type)?.label || type;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Document Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage legal documents and policies
                </p>
              </div>
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Total Documents</p>
                  <p className="text-2xl font-bold">{documents.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Published</p>
                  <p className="text-2xl font-bold">
                    {documents.filter((d) => d.is_active).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Drafts</p>
                  <p className="text-2xl font-bold">
                    {documents.filter((d) => !d.is_active).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents Table */}
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>
              Manage your legal documents and policies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.type}>
                    <TableCell className="font-medium">
                      {getDocumentTypeLabel(doc.type)}
                    </TableCell>
                    <TableCell>{doc.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">v{doc.version}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={doc.is_active ? "default" : "secondary"}>
                        {doc.is_active ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(doc.updated_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openPreviewDialog(doc)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(doc)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        {!doc.is_active && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(doc.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {documents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="text-gray-500">
                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No documents found</p>
                        <p className="text-sm">
                          Upload your first document to get started
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Upload/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={closeDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDocument ? "Edit Document" : "Upload New Document"}
            </DialogTitle>
            <DialogDescription>
              Upload a .docx file and it will be converted to HTML automatically
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Document Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, type: value }))
                  }
                  disabled={editingDocument} // Don't allow changing type when editing
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-gray-500">
                            {type.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      version: e.target.value,
                    }))
                  }
                  placeholder="1.0.0"
                  pattern="^\d+\.\d+\.\d+$"
                  title="Version must be in semantic format (e.g., 1.0.0, 2.1.3)"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Document Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter document title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Upload Document (.docx)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <div className="mt-2">
                    <input
                      id="file"
                      type="file"
                      accept=".docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("file").click()}
                      disabled={isConverting}
                    >
                      {isConverting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Converting...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Choose File
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Upload a .docx file to automatically convert to HTML
                  </p>
                  {selectedFile && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {convertedHtml && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="border rounded-lg p-4 max-h-60 overflow-y-auto bg-gray-50">
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: convertedHtml }}
                  />
                </div>
              </div>
            )}
          </form>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : editingDocument ? (
                "Update Document"
              ) : (
                "Save Document"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{previewDocument?.title}</DialogTitle>
            <DialogDescription>
              {getDocumentTypeLabel(previewDocument?.type)} - Version{" "}
              {previewDocument?.version}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto border rounded-lg p-6 bg-white">
            <div
              className="prose prose-indigo max-w-none"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPreviewDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
