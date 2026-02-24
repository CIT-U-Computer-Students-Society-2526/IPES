import { BarChart3, TrendingUp, Users, MessageSquare, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useMyPerformance } from "@/hooks/useEvaluations";

const OfficerResults = () => {
  const { data: performanceData, isLoading, error } = useMyPerformance();

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

  const { overallScore, categoryScores, feedbackComments, evaluationHistory } = performanceData;
  const maxScore = 5;


  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">My Evaluation Results</h1>
        <p className="page-description">View your performance feedback and scores</p>
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
              Based on evaluations from Q4 2025
            </p>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-success/10 mx-auto mb-2">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <p className="text-lg font-semibold text-foreground">+0.2</p>
              <p className="text-xs text-muted-foreground">vs last quarter</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-2">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <p className="text-lg font-semibold text-foreground">8</p>
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
            {categoryScores.map((category) => (
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
            ))}
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
                    : 'bg-warning/5 border-warning/20'
                    }`}
                >
                  <p className="text-sm text-foreground">{comment.text}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic">No feedback comments available yet.</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            * Comments are anonymized for fairness
          </p>
        </div>
      </div>

      {/* History */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="font-semibold text-foreground mb-5">Evaluation History</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Period</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Score</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Evaluators</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Trend</th>
              </tr>
            </thead>
            <tbody>
              {evaluationHistory.map((item, index) => (
                <tr key={item.period} className="border-b border-border last:border-0">
                  <td className="py-3 px-4 text-sm text-foreground font-medium">{item.period}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{item.score}/5</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{item.evaluators} people</td>
                  <td className="py-3 px-4">
                    {index === 0 ? (
                      <span className="text-success text-sm">Current</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
