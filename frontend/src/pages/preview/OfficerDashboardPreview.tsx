import { Link } from "react-router-dom";
import {
    ClipboardList,
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    TrendingUp,
    Calendar,
    Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const StatCard = ({
    label,
    value,
    suffix,
    icon: Icon,
    color,
    badge
}: {
    label: string;
    value: string | number;
    suffix?: string;
    icon: React.ElementType;
    color: string;
    badge?: string;
}) => {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-lg bg-${color}/10 flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 text-${color}`} />
                    </div>
                    {badge && (
                        <span className="text-xs font-medium text-warning bg-warning/10 px-2 py-1 rounded-full">
                            {badge}
                        </span>
                    )}
                </div>
                <div className="mt-4">
                    <p className="text-3xl font-bold text-foreground">
                        {value}{suffix && <span className="text-lg font-normal text-muted-foreground">{suffix}</span>}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{label}</p>
                </div>
            </CardContent>
        </Card>
    );
};

interface EvaluationPreview {
    id: number;
    form_title: string;
    form_id: number;
    due_date?: string;
}

// Pending evaluation card
const PendingEvaluationCard = ({ evaluation }: { evaluation: EvaluationPreview }) => {
    const isUrgent = evaluation.due_date && new Date(evaluation.due_date) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="evaluation-card flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-foreground truncate">
                        {evaluation.form_title || `Evaluation #${evaluation.id}`}
                    </h3>
                    {isUrgent && (
                        <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                    )}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Badge variant="outline">{evaluation.form_id ? "Evaluation" : "Form"}</Badge>
                    {evaluation.due_date && (
                        <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Due {formatDate(evaluation.due_date)}
                        </span>
                    )}
                </div>
            </div>
            <Link to={`#`}>
                <Button size="sm">Start</Button>
            </Link>
        </div>
    );
};

// Notification item
const NotificationItem = ({
    message,
    time,
    type
}: {
    message: string;
    time: string;
    type: 'success' | 'warning' | 'info'
}) => (
    <div className="flex gap-3">
        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${type === 'success' ? 'bg-success' :
            type === 'warning' ? 'bg-warning' :
                'bg-primary'
            }`} />
        <div>
            <p className="text-sm text-foreground">{message}</p>
            <p className="text-xs text-muted-foreground mt-1">{time}</p>
        </div>
    </div>
);

const OfficerDashboardPreview = () => {
    // Static Data
    const pendingCount = 3;
    const completedCount = 12;
    const verifiedAccomplishments = 5;
    const totalAccomplishments = 7;
    const averageRating = 4.5;
    const daysUntilDeadline = 2;

    const pendingEvaluations = [
        {
            id: 1,
            form_title: "Peer Evaluation - Term 1",
            form_id: 101,
            due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 2,
            form_title: "Self Assessment - Midterms",
            form_id: 102,
            due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 3,
            form_title: "Leadership Feedback",
            form_id: 103,
            due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];

    const notifications = [
        {
            id: 1,
            message: `${verifiedAccomplishments} accomplishments verified`,
            time: "Recent",
            type: "success" as const
        },
        {
            id: 2,
            message: `${pendingCount} evaluations pending`,
            time: "Action needed",
            type: "warning" as const
        },
        {
            id: 3,
            message: "New feedback form published by Admin",
            time: "2 days ago",
            type: "info" as const
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Welcome header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">
                        Good{new Date().getHours() < 12 ? ' morning' : new Date().getHours() < 18 ? ' afternoon' : ' evening'}, Juan!
                    </h1>
                    <p className="text-muted-foreground mt-1">Here's an overview of your evaluation tasks (Preview Mode).</p>
                </div>
                <Link to="#">
                    <Button>
                        Start Evaluating
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </Link>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Pending Evaluations"
                    value={pendingCount}
                    icon={ClipboardList}
                    color="warning"
                    badge={pendingCount > 0 ? "Action needed" : undefined}
                />
                <StatCard
                    label="Completed This Term"
                    value={completedCount}
                    icon={CheckCircle2}
                    color="success"
                />
                <StatCard
                    label="Average Rating"
                    value={averageRating}
                    suffix="/5"
                    icon={TrendingUp}
                    color="primary"
                />
                <StatCard
                    label={"Days Until Deadline"}
                    value={daysUntilDeadline}
                    icon={Calendar}
                    color="accent"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pending evaluations */}
                <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="font-semibold text-foreground">Pending Evaluations</h2>
                        <Link to="#" className="text-sm text-primary hover:underline">
                            View all
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {pendingEvaluations.map((evaluation) => (
                            <PendingEvaluationCard key={evaluation.id} evaluation={evaluation} />
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
                                    <span className="font-medium text-foreground">
                                        {completedCount}/{completedCount + pendingCount}
                                    </span>
                                </div>
                                <Progress
                                    value={Math.round((completedCount / (completedCount + pendingCount)) * 100)}
                                    className="h-2"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-muted-foreground">Accomplishments Verified</span>
                                    <span className="font-medium text-foreground">
                                        {verifiedAccomplishments}/{totalAccomplishments}
                                    </span>
                                </div>
                                <Progress
                                    value={Math.round((verifiedAccomplishments / totalAccomplishments) * 100)}
                                    className="h-2"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Recent notifications */}
                    <div className="bg-card rounded-xl border border-border p-6">
                        <h2 className="font-semibold text-foreground mb-4">Notifications</h2>
                        <div className="space-y-4">
                            {notifications.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    message={notification.message}
                                    time={notification.time}
                                    type={notification.type}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Accomplishments highlight */}
                    {verifiedAccomplishments > 0 && (
                        <div className="bg-card rounded-xl border border-border p-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                                    <Trophy className="w-5 h-5 text-success" />
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">{verifiedAccomplishments}</p>
                                    <p className="text-sm text-muted-foreground">Accomplishments Verified</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OfficerDashboardPreview;
