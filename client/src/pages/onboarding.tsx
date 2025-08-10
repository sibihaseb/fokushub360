import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, ArrowRight, ArrowLeft, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// Priority country list with United States at the top
const PRIORITY_COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Germany",
  "France",
  "Italy",
  "Spain",
  "Netherlands",
  "Japan",
  "South Korea",
  "China",
  "India",
  "Brazil",
  "Mexico",
  "Russia",
  "South Africa",
  "Israel",
  "Turkey",
  "Saudi Arabia",
  "United Arab Emirates",
  "Singapore",
  "Hong Kong",
  "Taiwan",
  "Thailand",
  "Malaysia",
  "Indonesia",
  "Philippines",
  "Vietnam",
  "Argentina",
  "Chile",
  "Colombia",
  "Peru",
  "Egypt",
  "Morocco",
  "Nigeria",
  "Kenya",
  "Ghana",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "Ireland",
  "Portugal",
  "Greece",
  "Poland",
  "Other"
];

// Database question interfaces
interface QuestionCategory {
  id: number;
  name: string;
  description: string;
  isEnabled: boolean;
  sortOrder: number;
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
}

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showCompletion, setShowCompletion] = useState(false);

  // Fetch categories from database
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/questionnaire/categories"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/questionnaire/categories");
      return response.json() as Promise<QuestionCategory[]>;
    }
  });

  // Fetch questions for current category
  const { data: questions = [], isLoading: questionsLoading } = useQuery({
    queryKey: ["/api/questionnaire/questions", categories[currentCategoryIndex]?.id],
    queryFn: async () => {
      if (!categories[currentCategoryIndex]) return [];
      const response = await apiRequest("GET", `/api/questionnaire/questions/${categories[currentCategoryIndex].id}`);
      return response.json() as Promise<Question[]>;
    },
    enabled: !!categories[currentCategoryIndex]
  });

  const currentCategory = categories[currentCategoryIndex];
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  // Validate all required questions before submission
  const validateAllResponses = (allQuestions: Question[], responses: Record<string, any>) => {
    const errors: Record<string, string> = {};
    let isValid = true;

    allQuestions.forEach((question) => {
      if (question.isRequired && !responses[question.id]) {
        errors[question.id] = "This field is required";
        isValid = false;
      }

      if (
        question.question.toLowerCase().includes("birth") &&
        question.questionType === "date" &&
        responses[question.id]
      ) {
        const birthDate = new Date(responses[question.id]);
        const today = new Date();
        const age = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
        if (age < 18) {
          errors[question.id] = `You must be at least 18 years old to participate (current age: ${age})`;
          isValid = false;
        }
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  // Validate the current question
  const validateCurrentQuestion = () => {
    const response = responses[currentQuestion.id];
    
    if (currentQuestion.isRequired && !response) {
      setValidationErrors(prev => ({
        ...prev,
        [currentQuestion.id]: "This field is required"
      }));
      return false;
    }
    
    if (currentQuestion.question.toLowerCase().includes("birth") && currentQuestion.questionType === "date" && response) {
      const birthDate = new Date(response);
      const today = new Date();
      const age = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
      
      if (age < 18) {
        setValidationErrors(prev => ({
          ...prev,
          [currentQuestion.id]: `You must be at least 18 years old to participate (current age: ${age})`
        }));
        return false;
      }
    }
    
    return true;
  };

  // Handle response input
  const handleResponse = (value: any) => {
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
    
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[currentQuestion.id];
      return newErrors;
    });
  };

  // Handle navigation to the next question or completion
  const handleNext = async () => {
    if (!validateCurrentQuestion()) return;
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
    } else {
      // Collect all questions across all categories for validation
      const allQuestions = categories.flatMap((category) =>
        queryClient.getQueryData<Question[]>(["/api/questionnaire/questions", category.id]) || []
      );

      // Validate all responses before saving
      if (!validateAllResponses(allQuestions, responses)) {
        toast({
          title: "Incomplete Questionnaire",
          description: "Please answer all required questions before submitting.",
          variant: "destructive",
        });
        return;
      }

      // Save all responses and mark questionnaire as complete
      try {
        for (const [questionId, response] of Object.entries(responses)) {
          const question = allQuestions.find(q => q.id === parseInt(questionId));
          const responseData = {
            questionId: parseInt(questionId),
            response: question?.questionType === "multiselect" || question?.questionType === "multi-select"
              ? response
              : Array.isArray(response) ? response[0] : response, // Convert array to single value for non-multi-select
          };
          await apiRequest("POST", "/api/questionnaire/responses", responseData);
        }

        await apiRequest("PUT", "/api/questionnaire/complete", {});
        await queryClient.refetchQueries({ queryKey: ["/api/auth/me"] });
        setShowCompletion(true);
        toast({
          title: "Success",
          description: "Your responses have been saved successfully!",
          variant: "default",
        });
      } catch (error) {
        console.error("Error saving responses or completing questionnaire:", error);
        toast({
          title: "Error",
          description: "Failed to save responses. Please try again.",
          variant: "destructive",
        });
        setShowCompletion(true); // Proceed to completion to avoid trapping user
      }
    }
  };

  // Handle navigation to the previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(prev => prev - 1);
      setCurrentQuestionIndex(0);
    }
  };

  // Render the question input based on question type
  const renderQuestion = () => {
    const currentResponse = responses[currentQuestion.id];
    let options = currentQuestion.options;
    
    if (currentQuestion.question.toLowerCase().includes("country")) {
      options = PRIORITY_COUNTRIES;
    }
    
    if (currentQuestion.question.toLowerCase().includes("gender")) {
      options = ["Male", "Female"];
    }

    switch (currentQuestion.questionType) {
      case "text":
        return (
          <Input
            value={currentResponse || ""}
            onChange={(e) => handleResponse(e.target.value)}
            placeholder="Enter your answer"
            className="bg-slate-800 border-slate-700 text-white"
          />
        );
      
      case "number":
        return (
          <Input
            type="number"
            min="0"
            value={currentResponse || ""}
            onChange={(e) => handleResponse(parseInt(e.target.value) || 0)}
            placeholder="Enter a number (0 or higher)"
            className="bg-slate-800 border-slate-700 text-white"
          />
        );

      case "date":
        return (
          <div className="space-y-2">
            <Input
              type="date"
              value={currentResponse || ""}
              onChange={(e) => handleResponse(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
              max={new Date().toISOString().split('T')[0]}
            />
            {currentQuestion.question.toLowerCase().includes("birth") && currentResponse && (
              <div className="text-sm text-slate-400">
                Age: {Math.floor((new Date().getTime() - new Date(currentResponse).getTime()) / (1000 * 60 * 60 * 24 * 365.25))} years old
              </div>
            )}
          </div>
        );
      
      case "select":
        return (
          <Select value={currentResponse} onValueChange={handleResponse}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {options?.map((option: string) => (
                <SelectItem key={option} value={option} className="text-white hover:bg-slate-700">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case "multiselect":
      case "multi-select":
        return (
          <div className="space-y-2">
            {options?.map((option: string) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={option}
                  checked={currentResponse?.includes(option) || false}
                  onCheckedChange={(checked) => {
                    const newResponse = currentResponse || [];
                    
                    if (currentQuestion.question.toLowerCase().includes("social causes")) {
                      const exclusiveOptions = ["None", "Other"];
                      const isExclusiveOption = exclusiveOptions.includes(option);
                      const hasExclusiveOption = newResponse.some((item: string) => exclusiveOptions.includes(item));
                      
                      if (checked) {
                        if (isExclusiveOption) {
                          handleResponse([option]);
                        } else if (hasExclusiveOption) {
                          handleResponse([option]);
                        } else {
                          handleResponse([...newResponse, option]);
                        }
                      } else {
                        handleResponse(newResponse.filter((item: string) => item !== option));
                      }
                    } else {
                      if (checked) {
                        handleResponse([...newResponse, option]);
                      } else {
                        handleResponse(newResponse.filter((item: string) => item !== option));
                      }
                    }
                  }}
                />
                <Label htmlFor={option} className="text-white text-sm break-words">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );
      
      case "boolean":
        return (
          <RadioGroup value={currentResponse} onValueChange={handleResponse}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="yes" />
              <Label htmlFor="yes" className="text-white">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="no" />
              <Label htmlFor="no" className="text-white">No</Label>
            </div>
          </RadioGroup>
        );
      
      case "scale":
        return (
          <div className="space-y-4">
            <Slider
              value={[currentResponse || 5]}
              onValueChange={(value) => handleResponse(value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-slate-400">
              <span>1</span>
              <span className="text-white font-medium">{currentResponse || 5}</span>
              <span>10</span>
            </div>
          </div>
        );
      
      case "textarea":
        return (
          <Textarea
            value={currentResponse || ""}
            onChange={(e) => handleResponse(e.target.value)}
            placeholder="Enter your answer"
            className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
          />
        );
      
      default:
        return (
          <Input
            value={currentResponse || ""}
            onChange={(e) => handleResponse(e.target.value)}
            placeholder="Enter your answer"
            className="bg-slate-800 border-slate-700 text-white"
          />
        );
    }
  };

  // Loading state
  if (categoriesLoading || questionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Completion screen
  if (categories.length === 0 || (currentCategoryIndex >= categories.length && !currentQuestion) || showCompletion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Card className="glass-effect border-slate-700 p-8 max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Profile Complete!</h2>
            <p className="text-slate-300 mb-6">Thank you for completing your profile questionnaire!</p>
            
            <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4 mb-6">
              <h3 className="text-amber-400 font-semibold mb-2">🎯 Would you like to get verified now?</h3>
              <p className="text-amber-200 text-sm">
                Getting verified gives you priority access to premium campaigns and higher earnings potential.
              </p>
            </div>
            
            <div className="flex flex-col space-y-3">
              <Button onClick={() => setLocation("/verification")} className="bg-emerald-600 hover:bg-emerald-700">
                Yes - Get Verified Now
              </Button>
              <Button onClick={() => setLocation("/dashboard")} variant="outline" className="glass-effect text-white hover:bg-white/10">
                Not Now - Go to Dashboard
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // No questions in category
  if (currentCategory && questions.length === 0 && !questionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Card className="glass-effect border-slate-700 p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Loading Questions...</h2>
            <p className="text-slate-300 mb-6">Please wait while we load the questions for {currentCategory.name}.</p>
            <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div></div>
            <div></div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Complete Your Profile</h1>
          <p className="text-slate-300">Help us understand you better to provide personalized experiences</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-400">
              {currentCategory.name} ({currentQuestionIndex + 1} of {totalQuestions})
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="glass-effect border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white text-xl break-words">
              {currentQuestion.question}
              {currentQuestion.isRequired && <span className="text-red-400 ml-1">*</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderQuestion()}
            
            {validationErrors[currentQuestion.id] && (
              <Alert className="border-red-500 bg-red-900/20">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-400">
                  {validationErrors[currentQuestion.id]}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentCategoryIndex === 0 && currentQuestionIndex === 0}
            variant="outline"
            className="glass-effect text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <Button
            onClick={handleNext}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {currentQuestionIndex === questions.length - 1 && currentCategoryIndex === categories.length - 1 ? 
              "Complete" : "Next"
            }
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}