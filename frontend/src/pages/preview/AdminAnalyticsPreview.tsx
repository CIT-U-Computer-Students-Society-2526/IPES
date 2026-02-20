import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3, TrendingUp, Users } from "lucide-react";

const AdminAnalyticsPreview = () => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="page-header">
                <h1 className="page-title leading-tight"><BarChart3 className="inline mr-2" /> Analytics & Reports (Preview)</h1>
                <p className="page-description">System-wide evaluation metrics and performance data</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Platform Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">89%</div>
                        <p className="text-xs text-muted-foreground mt-1"><TrendingUp className="inline w-3 h-3 text-success mr-1" />+2.5% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Evaluation Completion</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">92.4%</div>
                        <Progress value={92.4} className="h-2 mt-3" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Participants</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">145</div>
                        <p className="text-xs text-muted-foreground mt-1"><Users className="inline w-3 h-3 mr-1" /> Across 5 active units</p>
                    </CardContent>
                </Card>
            </div>

            <div className="h-64 rounded-xl border border-dashed border-border flex items-center justify-center bg-card/50 text-muted-foreground">
                Interactive Charts Disabled in Preview Mode
            </div>
        </div>
    );
};

export default AdminAnalyticsPreview;
