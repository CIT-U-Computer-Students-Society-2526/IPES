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
import { Card, CardContent } from "@/components/ui/card";

// Stats card component
const StatCard = ({
    label,
    value,
    change,
    icon: Icon,
    color
}: {
    label: string;
    value: string | number;
    change: string;
    icon: React.ElementType;
    color: string;
}) => {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-lg bg-${color}/10 flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 text-${color}`} />
                    </div>
                </div>
                <div className="mt-4">
                    <p className="text-3xl font-bold text-foreground">{value}</p>
                    <p className="text-sm text-muted-foreground mt-1">{label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{change}</p>
                </div>
            </CardContent>
        </Card>
    );
};

interface ActivityItemData {
    id: number;
    action: string;
    user_name: string;
    datetime: string;
}

// Activity item component
const ActivityItem = ({ activity }: { activity: ActivityItemData }) => {
    return (
        <div className="flex gap-3">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{activity.action}</p>
                {activity.user_name && (
                    <p className="text-sm text-muted-foreground truncate">{activity.user_name}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                    {activity.datetime}
                </p>
            </div>
        </div>
    );
};

// Unit progress component
const UnitProgress = ({ name, completed }: {
    name: string;
    completed: number;
}) => {
    return (
        <div>
            <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-foreground font-medium">{name}</span>
                <span className="text-muted-foreground">{completed}%</span>
            </div>
            <Progress
                value={completed}
                className={`h-2 ${completed < 50 ? '[&>div]:bg-warning' : completed >= 80 ? '[&>div]:bg-success' : ''}`}
            />
        </div>
    );
};

const AdminDashboardPreview = () => {
    // Static Mock Data
    const totalOfficers = 48;
    const activeEvaluations = 15;
    const completedEvaluations = 120;
    const completionRate = 85;
    const pendingReview = 12;

    const unitProgress = [
        { name: "Executive Committee", completed: 95 },
        { name: "Finance Committee", completed: 88 },
        { name: "Logistics Committee", completed: 75 },
        { name: "Creatives Committee", completed: 62 },
        { name: "Secretariat", completed: 45 }
    ];

    const recentActivity = [
        { id: 1, action: "Form Published: Peer Evaluation Term 2", user_name: "Admin User", datetime: "10 mins ago" },
        { id: 2, action: "Evaluation Submitted", user_name: "Juan Dela Cruz", datetime: "45 mins ago" },
        { id: 3, action: "Accomplishment Verified", user_name: "Admin User", datetime: "2 hours ago" },
        { id: 4, action: "User Created: Maria Torres", user_name: "Admin User", datetime: "3 hours ago" },
        { id: 5, action: "Evaluation Assignment Created", user_name: "Admin User", datetime: "Yesterday, 4:00 PM" }
    ];

    const alerts = [
        {
            id: 1,
            type: "warning" as const,
            message: `${pendingReview} accomplishments pending review`,
            action: "Review now"
        },
        {
            id: 2,
            type: "info" as const,
            message: `${activeEvaluations} active evaluations ongoing`,
            action: "View details"
        },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">Admin Dashboard (Preview)</h1>
                    <p className="text-muted-foreground mt-1">Overview of evaluation activities</p>
                </div>
                <div className="flex gap-2">
                    <Link to="#">
                        <Button variant="outline">Create Form</Button>
                    </Link>
                    <Link to="#">
                        <Button>
                            New Assignment
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Officers"
                    value={totalOfficers}
                    change="Active users"
                    icon={Users}
                    color="primary"
                />
                <StatCard
                    label="Active Evaluations"
                    value={activeEvaluations}
                    change="In progress"
                    icon={ClipboardList}
                    color="warning"
                />
                <StatCard
                    label="Completion Rate"
                    value={`${completionRate}%`}
                    change={`${completedEvaluations} completed`}
                    icon={CheckCircle2}
                    color="success"
                />
                <StatCard
                    label="Pending Review"
                    value={pendingReview}
                    change="Accomplishments"
                    icon={AlertTriangle}
                    color="accent"
                />
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
                <div className="space-y-2">
                    {alerts.map((alert) => (
                        <div
                            key={alert.id}
                            className={`flex items-center justify-between p-4 rounded-lg border ${alert.type === 'warning'
                                ? 'bg-warning/5 border-warning/20'
                                : 'bg-primary/5 border-primary/20'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <AlertTriangle className={`w-5 h-5 ${alert.type === 'warning' ? 'text-warning' : 'text-primary'
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
                        <Link to="#" className="text-sm text-primary hover:underline">
                            View analytics
                        </Link>
                    </div>

                    <div className="space-y-5">
                        {unitProgress.map((unit) => (
                            <UnitProgress
                                key={unit.name}
                                name={unit.name}
                                completed={unit.completed}
                            />
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
                            <ActivityItem key={activity.id} activity={activity} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="font-semibold text-foreground mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Link to="#">
                        <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                            <ClipboardList className="w-5 h-5" />
                            <span className="text-xs">Create Form</span>
                        </Button>
                    </Link>
                    <Link to="#">
                        <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                            <Users className="w-5 h-5" />
                            <span className="text-xs">Assign Evaluations</span>
                        </Button>
                    </Link>
                    <Link to="#">
                        <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="text-xs">Review Accomplishments</span>
                        </Button>
                    </Link>
                    <Link to="#">
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

export default AdminDashboardPreview;
