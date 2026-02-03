import { Link } from "react-router-dom";
import { 
  Users, 
  ClipboardList, 
  CheckCircle2, 
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  BarChart3,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const stats = [
  { 
    label: "Total Officers", 
    value: "156", 
    change: "+12 this term",
    icon: Users,
    color: "primary"
  },
  { 
    label: "Active Evaluations", 
    value: "24", 
    change: "8 assigned today",
    icon: ClipboardList,
    color: "warning"
  },
  { 
    label: "Completion Rate", 
    value: "78%", 
    change: "+5% from last week",
    icon: CheckCircle2,
    color: "success"
  },
  { 
    label: "Pending Review", 
    value: "12", 
    change: "Accomplishments",
    icon: AlertTriangle,
    color: "accent"
  },
];

const recentActivity = [
  { id: 1, action: "New evaluation assigned", target: "Research Committee", time: "2 min ago" },
  { id: 2, action: "Evaluation completed", target: "Juan Dela Cruz", time: "15 min ago" },
  { id: 3, action: "Accomplishment approved", target: "Maria Santos", time: "1 hour ago" },
  { id: 4, action: "New form published", target: "Q4 Self-Evaluation", time: "2 hours ago" },
  { id: 5, action: "Bulk assignment created", target: "Executive Committee", time: "3 hours ago" },
];

const unitProgress = [
  { name: "Executive", completed: 92, total: 100 },
  { name: "Research Committee", completed: 75, total: 100 },
  { name: "Events Committee", completed: 68, total: 100 },
  { name: "Finance Committee", completed: 85, total: 100 },
  { name: "Marketing Committee", completed: 45, total: 100 },
];

const alerts = [
  { id: 1, type: "warning", message: "5 evaluations due in 2 days", action: "Send reminder" },
  { id: 2, type: "info", message: "Marketing Committee has low participation", action: "View details" },
];

const AdminDashboard = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of evaluation activities</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/forms">
            <Button variant="outline">Create Form</Button>
          </Link>
          <Link to="/admin/assignments">
            <Button>
              New Assignment
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-lg bg-${stat.color}/10 flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}`} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div 
              key={alert.id}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                alert.type === 'warning' 
                  ? 'bg-warning/5 border-warning/20' 
                  : 'bg-primary/5 border-primary/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className={`w-5 h-5 ${
                  alert.type === 'warning' ? 'text-warning' : 'text-primary'
                }`} />
                <span className="text-sm text-foreground">{alert.message}</span>
              </div>
              <Button variant="ghost" size="sm">
                {alert.action}
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Unit Progress */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
              Completion by Unit
            </h2>
            <Link to="/admin/analytics" className="text-sm text-primary hover:underline">
              View analytics
            </Link>
          </div>
          
          <div className="space-y-5">
            {unitProgress.map((unit) => (
              <div key={unit.name}>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-foreground font-medium">{unit.name}</span>
                  <span className="text-muted-foreground">{unit.completed}%</span>
                </div>
                <Progress 
                  value={unit.completed} 
                  className={`h-2 ${unit.completed < 50 ? '[&>div]:bg-warning' : unit.completed >= 80 ? '[&>div]:bg-success' : ''}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              Recent Activity
            </h2>
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{activity.action}</p>
                  <p className="text-sm text-muted-foreground truncate">{activity.target}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link to="/admin/forms">
            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
              <ClipboardList className="w-5 h-5" />
              <span className="text-xs">Create Form</span>
            </Button>
          </Link>
          <Link to="/admin/assignments">
            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
              <Users className="w-5 h-5" />
              <span className="text-xs">Assign Evaluations</span>
            </Button>
          </Link>
          <Link to="/admin/accomplishments">
            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-xs">Review Accomplishments</span>
            </Button>
          </Link>
          <Link to="/admin/analytics">
            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-xs">View Reports</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
