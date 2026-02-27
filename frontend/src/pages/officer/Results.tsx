import { useState } from "react";
import { BarChart3, TrendingUp, Users, MessageSquare, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useMyPerformance } from "@/hooks/useEvaluations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const OfficerResults = () => {
  const [selectedFormId, setSelectedFormId] = useState<string>("latest");
  const { data: performanceData, isLoading, error } = useMyPerformance(
    selectedFormId === "latest" ? undefined : parseInt(selectedFormId)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !performanceData) {
    return (
      <div className="flex items-center justify-center h-64 text-destructive">
        Error loading results data. Please try again later.
      </div>
    );
  }

  const {
    overallScore,
    overallMaxScore,
    categoryScores,
    feedbackComments,
    evaluationHistory,
    available_forms,
    evaluatorCount,
    selectedFormId: backendSelectedId
  } = performanceData;

  if (available_forms.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="page-header">
          <h1 className="page-title">My Evaluation Results</h1>
          <p className="page-description">View your performance feedback and scores</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Results Released Yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Once evaluation results are released by your administrator, you'll be able to view your performance metrics and feedback here.
          </p>
        </div>
      </div>
    );
  }

  const maxScore = overallMaxScore || 5;
  const currentForm = available_forms.find(f => f.id === backendSelectedId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden">
        <div className="page-header mb-0">
          <h1 className="page-title">My Evaluation Results</h1>
          <p className="page-description">View your performance feedback and scores</p>
        </div>
        <div className="flex items-center gap-2 min-w-[200px]">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Period:</span>
          <Select value={selectedFormId} onValueChange={setSelectedFormId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest Period</SelectItem>
              {available_forms.map(form => (
                <SelectItem key={form.id} value={form.id.toString()}>
                  {form.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overall Score Card */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <BarChart3 className="w-5 h-5" />
              <span className="text-sm font-medium">Overall Performance Score</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-foreground">{overallScore}</span>
              <span className="text-2xl text-muted-foreground">/ {maxScore}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Based on evaluations from {currentForm?.title || 'Unknown Period'}
            </p>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-2">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <p className="text-lg font-semibold text-foreground">{evaluatorCount}</p>
              <p className="text-xs text-muted-foreground">evaluators</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-semibold text-foreground mb-5">Score by Category</h2>
          <div className="space-y-5">
            {categoryScores.length > 0 ? (
              categoryScores.map((category) => (
                <div key={category.name}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-foreground font-medium">{category.name}</span>
                    <span className="text-muted-foreground">{category.score}/{category.maxScore}</span>
                  </div>
                  <Progress
                    value={(category.score / category.maxScore) * 100}
                    className="h-2"
                  />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic py-8 text-center">No category scores available for this period.</p>
            )}
          </div>
        </div>

        {/* Feedback Comments */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-5">
            <MessageSquare className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Feedback Highlights</h2>
          </div>
          <div className="space-y-4">
            {feedbackComments && feedbackComments.length > 0 ? (
              feedbackComments.map((comment) => (
                <div
                  key={comment.id}
                  className={`p-4 rounded-lg border ${comment.type === 'positive'
                    ? 'bg-success/5 border-success/20'
                    : comment.type === 'constructive'
                      ? 'bg-warning/5 border-warning/20'
                      : 'bg-muted/30 border-border'
                    }`}
                >
                  <p className="text-sm text-foreground">{comment.text}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic py-8 text-center">No feedback comments available for this period.</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            * Comments are anonymized for fairness
          </p>
        </div>
      </div>

      {/* History */}
      {evaluationHistory.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-semibold text-foreground mb-5">Evaluation History</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Period</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Score</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Evaluators</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {evaluationHistory.map((item) => (
                  <tr key={item.period} className="border-b border-border last:border-0">
                    <td className="py-3 px-4 text-sm text-foreground font-medium">{item.period}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{item.score}/5</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{item.evaluators} people</td>
                    <td className="py-3 px-4">
                      {item.period === currentForm?.title ? (
                        <span className="text-success text-sm font-medium">Viewing</span>
                      ) : (
                        <span className="text-muted-foreground text-sm">Released</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground text-center">
          Evaluation results are confidential and intended for personal improvement.
          For concerns, please contact your organization administrator.
        </p>
      </div>
    </div>
  );
};

export default OfficerResults;
