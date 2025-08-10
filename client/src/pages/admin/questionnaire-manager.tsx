import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  FolderOpen, 
  HelpCircle,
  Eye,
  EyeOff,
  ArrowUpDown,
  Save,
  X,
  ChevronRight,
  Database,
  BarChart3,
  Users,
  Target,
  Layers,
  Lightbulb,
  Zap,
  Sparkles
} from "lucide-react";

interface QuestionCategory {
  id: number;
  name: string;
  description: string;
  isEnabled: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface Question {
  id: number;
  categoryId: number;
  question: string;
  questionType: string;
  options: any;
  isRequired: boolean;
  isEnabled: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export default function QuestionnaireManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [editingCategory, setEditingCategory] = useState<QuestionCategory | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);

  // Fetch categories
  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["/api/questionnaire/categories"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/questionnaire/categories");
      return response as QuestionCategory[];
    },
  });

  // Fetch questions for selected category
  const { data: questions = [], isLoading: loadingQuestions } = useQuery({
    queryKey: ["/api/questionnaire/questions", selectedCategory],
    queryFn: async () => {
      if (!selectedCategory) return [];
      const response = await apiRequest("GET", `/api/questionnaire/questions/${selectedCategory}`);
      return response as Question[];
    },
    enabled: !!selectedCategory,
  });

  // Category mutations
  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: Partial<QuestionCategory>) => {
      const response = await apiRequest("POST", "/api/admin/questionnaire/categories", categoryData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questionnaire/categories"] });
      setShowCategoryDialog(false);
      setEditingCategory(null);
      toast({ title: "Category created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error creating category", description: error.message, variant: "destructive" });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, ...categoryData }: Partial<QuestionCategory> & { id: number }) => {
      const response = await apiRequest("PUT", `/api/admin/questionnaire/categories/${id}`, categoryData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questionnaire/categories"] });
      setShowCategoryDialog(false);
      setEditingCategory(null);
      toast({ title: "Category updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error updating category", description: error.message, variant: "destructive" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/questionnaire/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questionnaire/categories"] });
      setSelectedCategory(null);
      toast({ title: "Category deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error deleting category", description: error.message, variant: "destructive" });
    },
  });

  // Question mutations
  const createQuestionMutation = useMutation({
    mutationFn: async (questionData: Partial<Question>) => {
      const response = await apiRequest("POST", "/api/admin/questionnaire/questions", {
        ...questionData,
        categoryId: selectedCategory,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questionnaire/questions", selectedCategory] });
      setShowQuestionDialog(false);
      setEditingQuestion(null);
      toast({ title: "Question created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error creating question", description: error.message, variant: "destructive" });
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: async ({ id, ...questionData }: Partial<Question> & { id: number }) => {
      const response = await apiRequest("PUT", `/api/admin/questionnaire/questions/${id}`, questionData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questionnaire/questions", selectedCategory] });
      setShowQuestionDialog(false);
      setEditingQuestion(null);
      toast({ title: "Question updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error updating question", description: error.message, variant: "destructive" });
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/questionnaire/questions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questionnaire/questions", selectedCategory] });
      toast({ title: "Question deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error deleting question", description: error.message, variant: "destructive" });
    },
  });

  const handleCategorySubmit = (data: Partial<QuestionCategory>) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ ...data, id: editingCategory.id });
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  const handleQuestionSubmit = (data: Partial<Question>) => {
    if (editingQuestion) {
      updateQuestionMutation.mutate({ ...data, id: editingQuestion.id });
    } else {
      createQuestionMutation.mutate(data);
    }
  };

  const CategoryForm = () => {
    const [formData, setFormData] = useState({
      name: editingCategory?.name || "",
      description: editingCategory?.description || "",
      isEnabled: editingCategory?.isEnabled ?? true,
      sortOrder: editingCategory?.sortOrder || 0,
    });

    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Category Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter category name"
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter category description"
            rows={3}
          />
        </div>
        <div>
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input
            id="sortOrder"
            type="number"
            value={formData.sortOrder}
            onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="isEnabled"
            checked={formData.isEnabled}
            onCheckedChange={(checked) => setFormData({ ...formData, isEnabled: checked })}
          />
          <Label htmlFor="isEnabled">Enable Category</Label>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => handleCategorySubmit(formData)}
            className="btn-premium"
            disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
          >
            {editingCategory ? "Update" : "Create"} Category
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setShowCategoryDialog(false);
              setEditingCategory(null);
            }}
            className="text-gray-200 border-gray-400 hover:bg-white/10 hover:text-white"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  };

  const QuestionForm = () => {
    const [formData, setFormData] = useState({
      question: editingQuestion?.question || "",
      questionType: editingQuestion?.questionType || "text",
      options: editingQuestion?.options || null,
      isRequired: editingQuestion?.isRequired || false,
      isEnabled: editingQuestion?.isEnabled ?? true,
      sortOrder: editingQuestion?.sortOrder || 0,
    });

    const [optionsText, setOptionsText] = useState(
      formData.options ? JSON.stringify(formData.options, null, 2) : ""
    );

    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="question">Question Text</Label>
          <Textarea
            id="question"
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            placeholder="Enter question text"
            rows={2}
          />
        </div>
        <div>
          <Label htmlFor="questionType">Question Type</Label>
          <Select value={formData.questionType} onValueChange={(value) => setFormData({ ...formData, questionType: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="textarea">Long Text</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="select">Single Choice</SelectItem>
              <SelectItem value="multiselect">Multiple Choice</SelectItem>
              <SelectItem value="boolean">Yes/No</SelectItem>
              <SelectItem value="scale">Scale (1-10)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {["select", "multiselect", "scale"].includes(formData.questionType) && (
          <div>
            <Label htmlFor="options">Options (JSON format)</Label>
            <Textarea
              id="options"
              value={optionsText}
              onChange={(e) => setOptionsText(e.target.value)}
              placeholder={
                formData.questionType === "scale"
                  ? '{"min": 1, "max": 10, "labels": ["Low", "High"]}'
                  : '["Option 1", "Option 2", "Option 3"]'
              }
              rows={4}
            />
          </div>
        )}
        <div>
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input
            id="sortOrder"
            type="number"
            value={formData.sortOrder}
            onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
          />
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="isRequired"
              checked={formData.isRequired}
              onCheckedChange={(checked) => setFormData({ ...formData, isRequired: checked })}
            />
            <Label htmlFor="isRequired">Required</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isEnabled"
              checked={formData.isEnabled}
              onCheckedChange={(checked) => setFormData({ ...formData, isEnabled: checked })}
            />
            <Label htmlFor="isEnabled">Enabled</Label>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => {
              try {
                const options = optionsText ? JSON.parse(optionsText) : null;
                handleQuestionSubmit({ ...formData, options });
              } catch (error) {
                toast({ title: "Invalid JSON in options", variant: "destructive" });
              }
            }}
            className="btn-premium"
            disabled={createQuestionMutation.isPending || updateQuestionMutation.isPending}
          >
            {editingQuestion ? "Update" : "Create"} Question
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setShowQuestionDialog(false);
              setEditingQuestion(null);
            }}
            className="text-gray-200 border-gray-400 hover:bg-white/10 hover:text-white"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Database className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold text-white">
                  Questionnaire Manager
                </h1>
                <p className="text-white/70">
                  Manage participant profiling categories and questions
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="glass-effect">
                {categories.length} Categories
              </Badge>
              <Badge variant="secondary" className="glass-effect">
                {questions.length} Questions
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Categories Panel */}
          <div className="lg:col-span-1">
            <Card className="card-glass border-white/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center">
                    <FolderOpen className="w-5 h-5 mr-2" />
                    Categories
                  </CardTitle>
                  <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="btn-premium">
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="card-glass border-white/20">
                      <DialogHeader>
                        <DialogTitle className="text-white">
                          {editingCategory ? "Edit Category" : "Create Category"}
                        </DialogTitle>
                      </DialogHeader>
                      <CategoryForm />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {loadingCategories ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full" />
                    </div>
                  ) : (
                    categories.map((category: QuestionCategory) => (
                      <div
                        key={category.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedCategory === category.id
                            ? "border-emerald-500 bg-emerald-500/10"
                            : "border-white/20 hover:border-white/40"
                        }`}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-white font-medium">{category.name}</h3>
                            <p className="text-white/60 text-sm">{category.description}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {category.isEnabled ? (
                              <Eye className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            )}
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingCategory(category);
                                  setShowCategoryDialog(true);
                                }}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="card-glass border-white/20">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-white">
                                      Delete Category
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-white/70">
                                      Are you sure you want to delete "{category.name}"? This will also delete all questions in this category.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteCategoryMutation.mutate(category.id)}
                                      className="bg-red-500 hover:bg-red-600"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Questions Panel */}
          <div className="lg:col-span-2">
            <Card className="card-glass border-white/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center">
                    <HelpCircle className="w-5 h-5 mr-2" />
                    Questions
                    {selectedCategory && (
                      <span className="ml-2 text-emerald-400">
                        ({categories.find(c => c.id === selectedCategory)?.name})
                      </span>
                    )}
                  </CardTitle>
                  {selectedCategory && (
                    <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="btn-premium">
                          <Plus className="w-4 h-4 mr-1" />
                          Add Question
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="card-glass border-white/20 max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-white">
                            {editingQuestion ? "Edit Question" : "Create Question"}
                          </DialogTitle>
                        </DialogHeader>
                        <QuestionForm />
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!selectedCategory ? (
                  <div className="text-center py-12">
                    <Target className="w-16 h-16 text-white/40 mx-auto mb-4" />
                    <p className="text-white/60 text-lg">
                      Select a category to view and manage questions
                    </p>
                  </div>
                ) : loadingQuestions ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full" />
                  </div>
                ) : questions.length === 0 ? (
                  <div className="text-center py-12">
                    <Lightbulb className="w-16 h-16 text-white/40 mx-auto mb-4" />
                    <p className="text-white/60 text-lg mb-4">
                      No questions in this category yet
                    </p>
                    <Button
                      onClick={() => setShowQuestionDialog(true)}
                      className="btn-premium"
                    >
                      Create First Question
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {questions.map((question: Question, index: number) => (
                      <div
                        key={question.id}
                        className="p-4 rounded-lg border border-white/20 hover:border-white/40 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="text-white/60 text-sm font-mono">
                                #{index + 1}
                              </span>
                              <Badge variant="secondary" className="glass-effect">
                                {question.questionType}
                              </Badge>
                              {question.isRequired && (
                                <Badge variant="destructive" className="glass-effect">
                                  Required
                                </Badge>
                              )}
                              {!question.isEnabled && (
                                <Badge variant="outline" className="glass-effect">
                                  Disabled
                                </Badge>
                              )}
                            </div>
                            <p className="text-white font-medium mb-2 break-words">{question.question}</p>
                            {question.options && (
                              <div className="text-white/60 text-sm">
                                <strong>Options:</strong>
                                <div className="mt-1 max-h-20 overflow-y-auto">
                                  {Array.isArray(question.options) ? (
                                    <div className="flex flex-wrap gap-1">
                                      {question.options.slice(0, 5).map((option: string, idx: number) => (
                                        <Badge key={idx} variant="outline" className="text-xs break-all max-w-[150px]">
                                          {option.length > 20 ? `${option.substring(0, 20)}...` : option}
                                        </Badge>
                                      ))}
                                      {question.options.length > 5 && (
                                        <Badge variant="outline" className="text-xs">
                                          +{question.options.length - 5} more
                                        </Badge>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="break-words">{String(question.options)}</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingQuestion(question);
                                setShowQuestionDialog(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="ghost">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="card-glass border-white/20">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-white">
                                    Delete Question
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-white/70">
                                    Are you sure you want to delete this question? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteQuestionMutation.mutate(question.id)}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}