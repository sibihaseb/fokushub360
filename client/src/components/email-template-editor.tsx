import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Edit3, 
  Save, 
  Eye, 
  Send, 
  RefreshCw, 
  Mail, 
  Settings,
  Plus,
  Trash2,
  Copy,
  Download,
  Upload,
  AlertCircle
} from "lucide-react";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: string;
  isActive: boolean;
  variables: string[];
  createdAt: string;
  updatedAt: string;
}

interface EmailTemplateEditorProps {
  className?: string;
}

export function EmailTemplateEditor({ className }: EmailTemplateEditorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [activeTab, setActiveTab] = useState("edit");
  const [previewData, setPreviewData] = useState<any>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch email templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['/api/admin/email-templates'],
    queryFn: () => apiRequest('/api/admin/email-templates')
  });

  // Save template mutation
  const saveTemplateMutation = useMutation({
    mutationFn: (template: Partial<EmailTemplate>) => 
      apiRequest('/api/admin/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email-templates'] });
      toast({
        title: "Template saved",
        description: "Email template has been updated successfully."
      });
      setEditingTemplate(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error saving template",
        description: error.message || "Failed to save template",
        variant: "destructive"
      });
    }
  });

  // Send test email mutation
  const sendTestEmailMutation = useMutation({
    mutationFn: ({ templateId, email }: { templateId: string; email: string }) => 
      apiRequest('/api/admin/email-templates/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, email })
      }),
    onSuccess: () => {
      toast({
        title: "Test email sent",
        description: `Test email sent successfully to ${testEmail}`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error sending test email",
        description: error.message || "Failed to send test email",
        variant: "destructive"
      });
    }
  });

  // Preview template mutation
  const previewTemplateMutation = useMutation({
    mutationFn: (template: Partial<EmailTemplate>) => 
      apiRequest('/api/admin/email-templates/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
      }),
    onSuccess: (data) => {
      setPreviewData(data);
      setActiveTab("preview");
    },
    onError: (error: any) => {
      toast({
        title: "Error generating preview",
        description: error.message || "Failed to generate preview",
        variant: "destructive"
      });
    }
  });

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEditingTemplate({ ...template });
    setActiveTab("edit");
  };

  const handleSaveTemplate = () => {
    if (!editingTemplate) return;
    saveTemplateMutation.mutate(editingTemplate);
  };

  const handlePreviewTemplate = () => {
    if (!editingTemplate) return;
    previewTemplateMutation.mutate(editingTemplate);
  };

  const handleSendTestEmail = () => {
    if (!selectedTemplate || !testEmail) return;
    sendTestEmailMutation.mutate({ 
      templateId: selectedTemplate.id, 
      email: testEmail 
    });
  };

  const handleCreateNew = () => {
    const newTemplate: EmailTemplate = {
      id: `new-${Date.now()}`,
      name: "New Email Template",
      subject: "Subject line here",
      body: "Email body content here...",
      type: "notification",
      isActive: true,
      variables: ["firstName", "loginUrl"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setEditingTemplate(newTemplate);
    setSelectedTemplate(newTemplate);
    setActiveTab("edit");
  };

  const availableVariables = [
    "firstName", "lastName", "email", "loginUrl", "resetUrl", 
    "campaignTitle", "campaignUrl", "deadline", "duration", "earnings"
  ];

  const templateTypes = [
    { value: "welcome", label: "Welcome" },
    { value: "notification", label: "Notification" },
    { value: "campaign", label: "Campaign" },
    { value: "security", label: "Security" },
    { value: "reminder", label: "Reminder" }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        Loading templates...
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email Templates</h2>
          <p className="text-muted-foreground">
            Manage and edit email templates with direct subject and body editing
          </p>
        </div>
        <Button onClick={handleCreateNew} className="gap-2">
          <Plus className="w-4 h-4" />
          New Template
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Template List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {templates.map((template: EmailTemplate) => (
                    <div
                      key={template.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedTemplate?.id === template.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{template.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {template.subject}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {template.type}
                            </Badge>
                            {template.isActive && (
                              <Badge variant="default" className="text-xs">
                                Active
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Edit3 className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Editor Panel */}
        <div className="lg:col-span-2">
          {editingTemplate ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Edit Template</CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handlePreviewTemplate}
                      disabled={previewTemplateMutation.isPending}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button 
                      size="sm"
                      onClick={handleSaveTemplate}
                      disabled={saveTemplateMutation.isPending}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="edit">Edit</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="test">Test</TabsTrigger>
                  </TabsList>

                  <TabsContent value="edit" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Template Name</Label>
                        <Input
                          id="name"
                          value={editingTemplate.name}
                          onChange={(e) => setEditingTemplate({
                            ...editingTemplate,
                            name: e.target.value
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="type">Template Type</Label>
                        <Select
                          value={editingTemplate.type}
                          onValueChange={(value) => setEditingTemplate({
                            ...editingTemplate,
                            type: value
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {templateTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="subject">Email Subject</Label>
                      <Input
                        id="subject"
                        value={editingTemplate.subject}
                        onChange={(e) => setEditingTemplate({
                          ...editingTemplate,
                          subject: e.target.value
                        })}
                        placeholder="Enter email subject line"
                      />
                    </div>

                    <div>
                      <Label htmlFor="body">Email Body</Label>
                      <Textarea
                        id="body"
                        value={editingTemplate.body}
                        onChange={(e) => setEditingTemplate({
                          ...editingTemplate,
                          body: e.target.value
                        })}
                        rows={12}
                        placeholder="Enter email body content. Use {{variableName}} for dynamic content."
                      />
                    </div>

                    <div>
                      <Label>Available Variables</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {availableVariables.map(variable => (
                          <Badge 
                            key={variable}
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => {
                              const cursorPos = document.getElementById('body')?.selectionStart || 0;
                              const newBody = editingTemplate.body.slice(0, cursorPos) + 
                                `{{${variable}}}` + 
                                editingTemplate.body.slice(cursorPos);
                              setEditingTemplate({
                                ...editingTemplate,
                                body: newBody
                              });
                            }}
                          >
                            {`{{${variable}}}`}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Use double curly braces like {`{{firstName}}`} for dynamic content.
                        Click on the variable badges above to insert them at cursor position.
                      </AlertDescription>
                    </Alert>
                  </TabsContent>

                  <TabsContent value="preview" className="space-y-4">
                    {previewData ? (
                      <div className="border rounded-lg p-4 bg-background">
                        <h4 className="font-medium mb-2">Subject: {previewData.subject}</h4>
                        <Separator className="mb-4" />
                        <div 
                          className="prose max-w-none"
                          dangerouslySetInnerHTML={{ __html: previewData.html }}
                        />
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Click "Preview" to see how your email will look
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="test" className="space-y-4">
                    <div>
                      <Label htmlFor="testEmail">Test Email Address</Label>
                      <div className="flex gap-2">
                        <Input
                          id="testEmail"
                          type="email"
                          value={testEmail}
                          onChange={(e) => setTestEmail(e.target.value)}
                          placeholder="Enter email address for testing"
                        />
                        <Button 
                          onClick={handleSendTestEmail}
                          disabled={sendTestEmailMutation.isPending || !testEmail}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Send Test
                        </Button>
                      </div>
                    </div>
                    
                    <Alert>
                      <Mail className="h-4 w-4" />
                      <AlertDescription>
                        This will send a test email using the current template content.
                        Variables will be replaced with sample data.
                      </AlertDescription>
                    </Alert>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a template to edit or create a new one</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}