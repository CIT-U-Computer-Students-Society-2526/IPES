import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const OfficerResultsPreview = () => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">My Results (Preview)</h1>
                <p className="page-description">View your evaluation scores and feedback</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Overall Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-medium">Average Score</span>
                            <span className="text-primary font-bold">4.5 / 5.0</span>
                        </div>
                        <Progress value={90} className="h-2" />

                        <div className="mt-6 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Peer Evaluations</span>
                                <span>4.8</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Self Assessment</span>
                                <span>4.2</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Feedback</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="p-3 bg-muted rounded-md text-sm text-muted-foreground">
                                "Great leadership shown during the recent committee project. Keep up the good work in maintaining prompt communication."
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default OfficerResultsPreview;
