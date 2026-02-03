import { BarChart3, TrendingUp, Users, MessageSquare } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const overallScore = 4.2;
const maxScore = 5;

const categoryScores = [
  { name: "Leadership", score: 4.5, maxScore: 5 },
  { name: "Teamwork", score: 4.3, maxScore: 5 },
  { name: "Communication", score: 4.0, maxScore: 5 },
  { name: "Output Quality", score: 4.2, maxScore: 5 },
  { name: "Punctuality", score: 3.8, maxScore: 5 },
];

const feedbackComments = [
  { id: 1, text: "Great leadership skills and always willing to help team members.", type: "positive" },
  { id: 2, text: "Could improve on meeting deadlines more consistently.", type: "constructive" },
  { id: 3, text: "Excellent communication and collaboration with other committees.", type: "positive" },
];

const evaluationHistory = [
  { period: "Q4 2025", score: 4.2, evaluators: 8 },
  { period: "Q3 2025", score: 4.0, evaluators: 7 },
  { period: "Q2 2025", score: 3.8, evaluators: 6 },
];

const OfficerResults = () => {
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
            {feedbackComments.map((comment) => (
              <div 
                key={comment.id}
                className={`p-4 rounded-lg border ${
                  comment.type === 'positive' 
                    ? 'bg-success/5 border-success/20' 
                    : 'bg-warning/5 border-warning/20'
                }`}
              >
                <p className="text-sm text-foreground">{comment.text}</p>
              </div>
            ))}
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
