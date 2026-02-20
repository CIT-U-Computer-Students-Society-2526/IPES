import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trophy, FileText, CheckCircle2 } from "lucide-react";

const OfficerAccomplishmentsPreview = () => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Accomplishments (Preview)</h1>
                    <p className="text-muted-foreground">Track and submit your committee achievements</p>
                </div>
                <Button disabled>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Accomplishment
                </Button>
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
                                    <p className="font-medium">Organized Committee Seminar {i}</p>
                                    <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                        <FileText className="w-3.5 h-3.5" /> Supporting Document Attached
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-success bg-success/10 px-3 py-1 rounded-full text-sm font-medium">
                                <CheckCircle2 className="w-4 h-4" />
                                Verified
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default OfficerAccomplishmentsPreview;
