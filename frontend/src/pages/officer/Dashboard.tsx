import { Link } from "react-router-dom";
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const pendingEvaluations = [
  { 
    id: 1, 
    title: "Peer Evaluation - Research Committee", 
    dueDate: "Jan 10, 2026",
    type: "Peer",
    urgent: true
  },
  { 
    id: 2, 
    title: "Self-Evaluation Q4 2025", 
    dueDate: "Jan 12, 2026",
    type: "Self",
    urgent: false
  },
  { 
    id: 3, 
    title: "Cross-Unit Evaluation - Events Committee", 
    dueDate: "Jan 15, 2026",
    type: "Cross-Unit",
    urgent: false
  },
];

const notifications = [
  { id: 1, message: "Your accomplishment 'Led Workshop Series' was approved", time: "2 hours ago", type: "success" },
  { id: 2, message: "New evaluation assigned: Executive Committee Review", time: "1 day ago", type: "info" },
  { id: 3, message: "Reminder: 3 evaluations pending", time: "2 days ago", type: "warning" },
];

const OfficerDashboard = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Good morning, Juan!</h1>
          <p className="text-muted-foreground mt-1">Here's an overview of your evaluation tasks.</p>
        </div>
        <Link to="/officer/evaluations">
          <Button>
            Start Evaluating
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-warning" />
            </div>
            <span className="text-xs font-medium text-warning bg-warning/10 px-2 py-1 rounded-full">
              Action needed
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-foreground">3</p>
            <p className="text-sm text-muted-foreground mt-1">Pending Evaluations</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-foreground">12</p>
            <p className="text-sm text-muted-foreground mt-1">Completed This Term</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-foreground">4.2</p>
            <p className="text-sm text-muted-foreground mt-1">Average Rating</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-accent" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-foreground">5</p>
            <p className="text-sm text-muted-foreground mt-1">Days Until Deadline</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending evaluations */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-foreground">Pending Evaluations</h2>
            <Link to="/officer/evaluations" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          
          <div className="space-y-3">
            {pendingEvaluations.map((evaluation) => (
              <div 
                key={evaluation.id}
                className="evaluation-card flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-foreground truncate">{evaluation.title}</h3>
                    {evaluation.urgent && (
                      <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="status-badge status-pending">{evaluation.type}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Due {evaluation.dueDate}
                    </span>
                  </div>
                </div>
                <Link to={`/officer/evaluations/${evaluation.id}`}>
                  <Button size="sm">Start</Button>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Progress card */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold text-foreground mb-4">Term Progress</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Evaluations Completed</span>
                  <span className="font-medium text-foreground">12/15</span>
                </div>
                <Progress value={80} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Accomplishments Verified</span>
                  <span className="font-medium text-foreground">8/10</span>
                </div>
                <Progress value={80} className="h-2" />
              </div>
            </div>
          </div>

          {/* Recent notifications */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold text-foreground mb-4">Notifications</h2>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    notification.type === 'success' ? 'bg-success' :
                    notification.type === 'warning' ? 'bg-warning' :
                    'bg-primary'
                  }`} />
                  <div>
                    <p className="text-sm text-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;
