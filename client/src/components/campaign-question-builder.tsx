import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Plus, 
  Search, 
  Filter, 
  Star,
  MessageCircle,
  Heart,
  Target,
  TrendingUp,
  Users,
  Eye,
  Lightbulb,
  CheckCircle,
  ArrowRight,
  X,
  Edit,
  Copy,
  Trash2,
  Move,
  GripVertical
} from "lucide-react";

interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'rating' | 'text' | 'yes-no' | 'ranking';
  category: string;
  options?: string[];
  required: boolean;
  customQuestion?: boolean;
}

interface QuestionCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  questions: Question[];
}

const preloadedCategories: QuestionCategory[] = [
  {
    id: 'first-impression',
    name: 'First Impression',
    description: 'Initial reactions and immediate thoughts',
    icon: Eye,
    color: 'bg-blue-500',
    questions: [
      {
        id: 'fi-1',
        text: 'What is your first impression of this content?',
        type: 'text',
        category: 'first-impression',
        required: true
      },
      {
        id: 'fi-2',
        text: 'How would you rate the overall visual appeal?',
        type: 'rating',
        category: 'first-impression',
        required: true
      },
      {
        id: 'fi-3',
        text: 'Does this content grab your attention?',
        type: 'yes-no',
        category: 'first-impression',
        required: true
      },
      {
        id: 'fi-4',
        text: 'What emotions does this content evoke?',
        type: 'multiple-choice',
        category: 'first-impression',
        options: ['Excitement', 'Curiosity', 'Confusion', 'Indifference', 'Annoyance', 'Joy', 'Trust'],
        required: true
      },
      {
        id: 'fi-5',
        text: 'How professional does this content appear?',
        type: 'rating',
        category: 'first-impression',
        required: false
      }
    ]
  },
  {
    id: 'clarity-understanding',
    name: 'Clarity & Understanding',
    description: 'Message clarity and comprehension',
    icon: MessageCircle,
    color: 'bg-green-500',
    questions: [
      {
        id: 'cu-1',
        text: 'How clear is the main message?',
        type: 'rating',
        category: 'clarity-understanding',
        required: true
      },
      {
        id: 'cu-2',
        text: 'What do you think this content is trying to communicate?',
        type: 'text',
        category: 'clarity-understanding',
        required: true
      },
      {
        id: 'cu-3',
        text: 'Is the information easy to understand?',
        type: 'yes-no',
        category: 'clarity-understanding',
        required: true
      },
      {
        id: 'cu-4',
        text: 'Which elements are most confusing?',
        type: 'multiple-choice',
        category: 'clarity-understanding',
        options: ['Text/Copy', 'Visual Elements', 'Layout/Design', 'Overall Concept', 'Nothing is confusing'],
        required: false
      },
      {
        id: 'cu-5',
        text: 'How would you improve the clarity?',
        type: 'text',
        category: 'clarity-understanding',
        required: false
      }
    ]
  },
  {
    id: 'emotional-response',
    name: 'Emotional Response',
    description: 'Emotional impact and feelings',
    icon: Heart,
    color: 'bg-red-500',
    questions: [
      {
        id: 'er-1',
        text: 'What emotions does this content make you feel?',
        type: 'multiple-choice',
        category: 'emotional-response',
        options: ['Happy', 'Excited', 'Curious', 'Confident', 'Relaxed', 'Anxious', 'Confused', 'Disappointed'],
        required: true
      },
      {
        id: 'er-2',
        text: 'How strongly do you feel about this content?',
        type: 'rating',
        category: 'emotional-response',
        required: true
      },
      {
        id: 'er-3',
        text: 'Does this content resonate with your personal values?',
        type: 'yes-no',
        category: 'emotional-response',
        required: true
      },
      {
        id: 'er-4',
        text: 'Would you share this content with friends?',
        type: 'yes-no',
        category: 'emotional-response',
        required: false
      },
      {
        id: 'er-5',
        text: 'Describe the mood this content creates',
        type: 'text',
        category: 'emotional-response',
        required: false
      }
    ]
  },
  {
    id: 'target-audience',
    name: 'Target Audience',
    description: 'Audience relevance and targeting',
    icon: Target,
    color: 'bg-purple-500',
    questions: [
      {
        id: 'ta-1',
        text: 'Who do you think this content is targeting?',
        type: 'multiple-choice',
        category: 'target-audience',
        options: ['Young Adults (18-30)', 'Adults (30-45)', 'Middle-aged (45-60)', 'Seniors (60+)', 'Families', 'Professionals', 'Students'],
        required: true
      },
      {
        id: 'ta-2',
        text: 'Does this content feel relevant to you personally?',
        type: 'rating',
        category: 'target-audience',
        required: true
      },
      {
        id: 'ta-3',
        text: 'Would you consider yourself part of the target audience?',
        type: 'yes-no',
        category: 'target-audience',
        required: true
      },
      {
        id: 'ta-4',
        text: 'What demographics does this content appeal to most?',
        type: 'text',
        category: 'target-audience',
        required: false
      },
      {
        id: 'ta-5',
        text: 'How well does this content match your interests?',
        type: 'rating',
        category: 'target-audience',
        required: false
      }
    ]
  },
  {
    id: 'purchase-intent',
    name: 'Purchase Intent',
    description: 'Buying motivation and conversion potential',
    icon: TrendingUp,
    color: 'bg-orange-500',
    questions: [
      {
        id: 'pi-1',
        text: 'How likely are you to purchase this product/service?',
        type: 'rating',
        category: 'purchase-intent',
        required: true
      },
      {
        id: 'pi-2',
        text: 'What motivates you most to consider this offer?',
        type: 'multiple-choice',
        category: 'purchase-intent',
        options: ['Price/Value', 'Quality', 'Brand Reputation', 'Features', 'Convenience', 'Social Proof', 'Nothing motivates me'],
        required: true
      },
      {
        id: 'pi-3',
        text: 'What concerns would prevent you from purchasing?',
        type: 'multiple-choice',
        category: 'purchase-intent',
        options: ['Price too high', 'Unclear benefits', 'Lack of trust', 'No immediate need', 'Too many options', 'Poor presentation'],
        required: false
      },
      {
        id: 'pi-4',
        text: 'When would you be most likely to make this purchase?',
        type: 'multiple-choice',
        category: 'purchase-intent',
        options: ['Immediately', 'Within a week', 'Within a month', 'Within 3 months', 'Never'],
        required: false
      },
      {
        id: 'pi-5',
        text: 'How does this compare to similar products you\'ve seen?',
        type: 'rating',
        category: 'purchase-intent',
        required: false
      }
    ]
  },
  {
    id: 'social-sharing',
    name: 'Social Sharing',
    description: 'Shareability and social media potential',
    icon: Users,
    color: 'bg-cyan-500',
    questions: [
      {
        id: 'ss-1',
        text: 'How likely are you to share this content on social media?',
        type: 'rating',
        category: 'social-sharing',
        required: true
      },
      {
        id: 'ss-2',
        text: 'Which social media platforms would you share this on?',
        type: 'multiple-choice',
        category: 'social-sharing',
        options: ['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'TikTok', 'Pinterest', 'WhatsApp', 'None'],
        required: false
      },
      {
        id: 'ss-3',
        text: 'What would make you more likely to share this content?',
        type: 'text',
        category: 'social-sharing',
        required: false
      },
      {
        id: 'ss-4',
        text: 'Does this content have viral potential?',
        type: 'yes-no',
        category: 'social-sharing',
        required: false
      },
      {
        id: 'ss-5',
        text: 'How shareable is this content compared to similar content?',
        type: 'rating',
        category: 'social-sharing',
        required: false
      }
    ]
  },
  {
    id: 'improvements',
    name: 'Improvements & Suggestions',
    description: 'Feedback and optimization suggestions',
    icon: Lightbulb,
    color: 'bg-yellow-500',
    questions: [
      {
        id: 'imp-1',
        text: 'What would you change about this content?',
        type: 'text',
        category: 'improvements',
        required: true
      },
      {
        id: 'imp-2',
        text: 'What elements work best in this content?',
        type: 'text',
        category: 'improvements',
        required: true
      },
      {
        id: 'imp-3',
        text: 'How would you improve the overall effectiveness?',
        type: 'text',
        category: 'improvements',
        required: false
      },
      {
        id: 'imp-4',
        text: 'What specific elements need improvement?',
        type: 'multiple-choice',
        category: 'improvements',
        options: ['Visual Design', 'Text/Copy', 'Color Scheme', 'Layout', 'Call to Action', 'Overall Concept', 'Nothing needs improvement'],
        required: false
      },
      {
        id: 'imp-5',
        text: 'Any additional suggestions or comments?',
        type: 'text',
        category: 'improvements',
        required: false
      }
    ]
  }
];

interface CampaignQuestionBuilderProps {
  contentType: string;
  onQuestionsSelect: (questions: Question[]) => void;
}

export default function CampaignQuestionBuilder({ contentType, onQuestionsSelect }: CampaignQuestionBuilderProps) {
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [customQuestions, setCustomQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    type: 'text' as Question['type'],
    options: [''],
    required: false
  });
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  const handleQuestionToggle = (question: Question) => {
    setSelectedQuestions(prev => {
      const isSelected = prev.some(q => q.id === question.id);
      if (isSelected) {
        return prev.filter(q => q.id !== question.id);
      } else {
        return [...prev, question];
      }
    });
  };

  const handleAddCustomQuestion = () => {
    const customQuestion: Question = {
      id: `custom-${Date.now()}`,
      text: newQuestion.text,
      type: newQuestion.type,
      category: 'custom',
      options: newQuestion.type === 'multiple-choice' ? newQuestion.options.filter(o => o.trim()) : undefined,
      required: newQuestion.required,
      customQuestion: true
    };

    setCustomQuestions(prev => [...prev, customQuestion]);
    setSelectedQuestions(prev => [...prev, customQuestion]);
    setNewQuestion({
      text: '',
      type: 'text',
      options: [''],
      required: false
    });
    setIsAddingQuestion(false);
  };

  const handleRemoveCustomQuestion = (id: string) => {
    setCustomQuestions(prev => prev.filter(q => q.id !== id));
    setSelectedQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleQuickSelectCategory = (categoryId: string) => {
    const category = preloadedCategories.find(c => c.id === categoryId);
    if (category) {
      const newQuestions = category.questions.filter(q => 
        !selectedQuestions.some(sq => sq.id === q.id)
      );
      setSelectedQuestions(prev => [...prev, ...newQuestions]);
    }
  };

  const filteredCategories = preloadedCategories.filter(category => {
    if (selectedCategory !== 'all' && category.id !== selectedCategory) return false;
    if (searchTerm) {
      return category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             category.questions.some(q => q.text.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return true;
  });

  const handleContinue = () => {
    onQuestionsSelect(selectedQuestions);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Select Questions</h2>
          <p className="text-gray-600">Choose from preloaded questions or create custom ones</p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          {selectedQuestions.length} Questions Selected
        </Badge>
      </div>

      <Tabs defaultValue="preloaded" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="preloaded">Preloaded Questions</TabsTrigger>
          <TabsTrigger value="custom">Custom Questions</TabsTrigger>
          <TabsTrigger value="selected">Selected Questions</TabsTrigger>
        </TabsList>

        <TabsContent value="preloaded" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {preloadedCategories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quick Select */}
          <div className="space-y-3">
            <h3 className="font-semibold">Quick Select by Category</h3>
            <div className="flex flex-wrap gap-2">
              {preloadedCategories.map(category => {
                const Icon = category.icon;
                const selectedCount = selectedQuestions.filter(q => q.category === category.id).length;
                return (
                  <Button
                    key={category.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickSelectCategory(category.id)}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{category.name}</span>
                    {selectedCount > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {selectedCount}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Question Categories */}
          <div className="space-y-6">
            {filteredCategories.map(category => {
              const Icon = category.icon;
              return (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg ${category.color} bg-opacity-10`}>
                        <Icon className={`w-5 h-5 ${category.color.replace('bg-', 'text-')}`} />
                      </div>
                      <span>{category.name}</span>
                      <Badge variant="outline" className="ml-2">
                        {category.questions.length} questions
                      </Badge>
                    </CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {category.questions.map(question => (
                        <div
                          key={question.id}
                          className={`flex items-start space-x-3 p-3 border rounded-lg ${
                            selectedQuestions.some(q => q.id === question.id) 
                              ? 'bg-purple-50 border-purple-200' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <Checkbox
                            checked={selectedQuestions.some(q => q.id === question.id)}
                            onCheckedChange={() => handleQuestionToggle(question)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{question.text}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {question.type.replace('-', ' ')}
                              </Badge>
                              {question.required && (
                                <Badge variant="outline" className="text-xs text-red-600">
                                  Required
                                </Badge>
                              )}
                              {question.options && (
                                <span className="text-xs text-gray-500">
                                  {question.options.length} options
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Custom Questions</h3>
            <Button onClick={() => setIsAddingQuestion(true)} disabled={isAddingQuestion}>
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>

          {isAddingQuestion && (
            <Card>
              <CardHeader>
                <CardTitle>Create Custom Question</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="question-text">Question Text</Label>
                  <Textarea
                    id="question-text"
                    placeholder="Enter your question..."
                    value={newQuestion.text}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, text: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="question-type">Question Type</Label>
                    <Select
                      value={newQuestion.type}
                      onValueChange={(value) => setNewQuestion(prev => ({ ...prev, type: value as Question['type'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text Response</SelectItem>
                        <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                        <SelectItem value="rating">Rating Scale</SelectItem>
                        <SelectItem value="yes-no">Yes/No</SelectItem>
                        <SelectItem value="ranking">Ranking</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="required"
                      checked={newQuestion.required}
                      onCheckedChange={(checked) => setNewQuestion(prev => ({ ...prev, required: !!checked }))}
                    />
                    <Label htmlFor="required">Required Question</Label>
                  </div>
                </div>

                {newQuestion.type === 'multiple-choice' && (
                  <div>
                    <Label>Answer Options</Label>
                    <div className="space-y-2">
                      {newQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...newQuestion.options];
                              newOptions[index] = e.target.value;
                              setNewQuestion(prev => ({ ...prev, options: newOptions }));
                            }}
                            placeholder={`Option ${index + 1}`}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newOptions = newQuestion.options.filter((_, i) => i !== index);
                              setNewQuestion(prev => ({ ...prev, options: newOptions }));
                            }}
                            disabled={newQuestion.options.length <= 1}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setNewQuestion(prev => ({ ...prev, options: [...prev.options, ''] }))}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Option
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingQuestion(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddCustomQuestion}
                    disabled={!newQuestion.text.trim()}
                  >
                    Add Question
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {customQuestions.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold">Your Custom Questions</h4>
              {customQuestions.map(question => (
                <Card key={question.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{question.text}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {question.type.replace('-', ' ')}
                          </Badge>
                          {question.required && (
                            <Badge variant="outline" className="text-xs text-red-600">
                              Required
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCustomQuestion(question.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="selected" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Selected Questions ({selectedQuestions.length})</h3>
            <Button
              onClick={handleContinue}
              disabled={selectedQuestions.length === 0}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Continue to Payment
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {selectedQuestions.length === 0 ? (
            <Alert>
              <MessageCircle className="h-4 w-4" />
              <AlertDescription>
                No questions selected. Please select at least one question from the preloaded categories or create a custom question.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {selectedQuestions.map((question, index) => (
                <Card key={question.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-600 rounded-full text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{question.text}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {question.type.replace('-', ' ')}
                            </Badge>
                            {question.required && (
                              <Badge variant="outline" className="text-xs text-red-600">
                                Required
                              </Badge>
                            )}
                            {question.customQuestion && (
                              <Badge variant="outline" className="text-xs text-purple-600">
                                Custom
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedQuestions(prev => prev.filter(q => q.id !== question.id))}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}