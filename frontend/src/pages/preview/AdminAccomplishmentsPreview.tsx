import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, FileText, CheckCircle2, XCircle } from "lucide-react";

const AdminAccomplishmentsPreview = () => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Review Accomplishments (Preview)</h1>
                    <p className="text-muted-foreground">Verify and approve officer submissions</p>
                </div>
            </div>

            <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Trophy className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">Submitted by: Juan Dela Cruz</p>
                                    <p className="text-sm">Organized "Tech Seminar 2026"</p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                                        <FileText className="w-3.5 h-3.5" /> Proof_of_Event.pdf
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" disabled>
                                    <XCircle className="w-4 h-4 mr-1" /> Reject
                                </Button>
                                <Button size="sm" className="bg-success text-success-foreground hover:bg-success/90" disabled>
                                    <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default AdminAccomplishmentsPreview;
