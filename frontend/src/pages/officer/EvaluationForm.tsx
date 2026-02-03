import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, User, Trophy, Save, Send, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const evaluateeInfo = {
  name: "Maria Santos",
  position: "Research Director",
  unit: "Research Committee",
  term: "A.Y. 2025-2026",
  accomplishments: [
    "Led 3 research projects",
    "Organized Research Week 2025",
    "Published 2 committee reports",
    "Mentored 5 junior researchers",
  ],
};

const questions = [
  {
    id: 1,
    category: "Leadership",
    question: "How effectively does this officer demonstrate leadership within their responsibilities?",
  },
  {
    id: 2,
    category: "Leadership",
    question: "How well does this officer inspire and motivate team members?",
  },
  {
    id: 3,
    category: "Teamwork",
    question: "How effectively does this officer collaborate with other committee members?",
  },
  {
    id: 4,
    category: "Teamwork",
    question: "How well does this officer communicate with their peers and colleagues?",
  },
  {
    id: 5,
    category: "Output Quality",
    question: "How would you rate the quality of work delivered by this officer?",
  },
  {
    id: 6,
    category: "Output Quality",
    question: "How consistent is this officer in meeting deadlines and commitments?",
  },
];

const ratingLabels = [
  { value: "1", label: "Poor" },
  { value: "2", label: "Fair" },
  { value: "3", label: "Good" },
  { value: "4", label: "Very Good" },
  { value: "5", label: "Excellent" },
];

const EvaluationForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [comments, setComments] = useState("");
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  const sections = [
    { name: "Evaluatee Info", questions: [] },
    { name: "Leadership", questions: questions.filter(q => q.category === "Leadership") },
    { name: "Teamwork", questions: questions.filter(q => q.category === "Teamwork") },
    { name: "Output Quality", questions: questions.filter(q => q.category === "Output Quality") },
    { name: "Comments", questions: [] },
  ];

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const progressPercentage = (answeredCount / totalQuestions) * 100;

  const handleRatingChange = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    setShowSubmitDialog(false);
    navigate("/officer/evaluations");
  };

  const renderSection = () => {
    if (currentSection === 0) {
      return (
        <div className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{evaluateeInfo.name}</h3>
                <p className="text-muted-foreground">{evaluateeInfo.position}</p>
                <p className="text-sm text-muted-foreground mt-1">{evaluateeInfo.unit} • {evaluateeInfo.term}</p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-accent" />
              <h4 className="font-medium text-foreground">Accomplishments This Term</h4>
            </div>
            <ul className="space-y-2">
              {evaluateeInfo.accomplishments.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <p className="text-sm text-foreground">
              <strong>Reminder:</strong> Please evaluate objectively based on the officer's performance. 
              Your feedback helps improve our organization.
            </p>
          </div>
        </div>
      );
    }

    if (currentSection === sections.length - 1) {
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="comments" className="text-base font-medium">Additional Comments</Label>
            <p className="text-sm text-muted-foreground mt-1 mb-3">
              Share any additional feedback, suggestions, or observations (optional)
            </p>
            <Textarea
              id="comments"
              placeholder="Enter your comments here..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="min-h-[150px] resize-none"
            />
          </div>
        </div>
      );
    }

    const sectionQuestions = sections[currentSection].questions;
    return (
      <div className="space-y-8">
        {sectionQuestions.map((q, index) => (
          <div key={q.id} className="space-y-4">
            <p className="font-medium text-foreground">
              {index + 1}. {q.question}
            </p>
            <RadioGroup
              value={answers[q.id] || ""}
              onValueChange={(value) => handleRatingChange(q.id, value)}
              className="flex flex-wrap gap-2"
            >
              {ratingLabels.map((rating) => (
                <div key={rating.value} className="flex-1 min-w-[80px]">
                  <RadioGroupItem
                    value={rating.value}
                    id={`q${q.id}-${rating.value}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`q${q.id}-${rating.value}`}
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent/50 hover:border-primary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer transition-all"
                  >
                    <span className="text-lg font-semibold">{rating.value}</span>
                    <span className="text-xs text-muted-foreground">{rating.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <button 
          onClick={() => navigate("/officer/evaluations")}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to evaluations
        </button>
        <h1 className="text-xl font-semibold text-foreground">Peer Evaluation - Research Committee</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <Clock className="w-4 h-4" />
          Due Jan 10, 2026
        </div>
      </div>

      {/* Progress */}
      <div className="bg-card rounded-xl border border-border p-4 mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium text-foreground">{answeredCount}/{totalQuestions} questions</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
        
        {/* Section tabs */}
        <div className="flex gap-1 mt-4 overflow-x-auto pb-1">
          {sections.map((section, index) => (
            <button
              key={index}
              onClick={() => setCurrentSection(index)}
              className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors ${
                currentSection === index
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {section.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <h2 className="text-lg font-medium text-foreground mb-6">
          {sections[currentSection].name}
        </h2>
        {renderSection()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
          disabled={currentSection === 0}
        >
          Previous
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          
          {currentSection === sections.length - 1 ? (
            <Button onClick={() => setShowSubmitDialog(true)}>
              <Send className="w-4 h-4 mr-2" />
              Submit
            </Button>
          ) : (
            <Button onClick={() => setCurrentSection(currentSection + 1)}>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>

      {/* Submit confirmation dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Evaluation?</DialogTitle>
            <DialogDescription>
              You've answered {answeredCount} out of {totalQuestions} questions. 
              Once submitted, you won't be able to edit your responses.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Confirm Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EvaluationForm;
