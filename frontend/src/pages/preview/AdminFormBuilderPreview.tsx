import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Settings, Copy } from "lucide-react";

const AdminFormBuilderPreview = () => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Form Builder (Preview)</h1>
                    <p className="text-muted-foreground">Design and manage evaluation templates</p>
                </div>
                <Button disabled>
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Form
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" disabled><Settings className="w-4 h-4" /></Button>
                                    <Button variant="ghost" size="icon" disabled><Copy className="w-4 h-4" /></Button>
                                </div>
                            </div>
                            <h3 className="font-medium text-foreground mt-4 mb-1">Standardized Peer Eval 2026</h3>
                            <p className="text-sm text-muted-foreground">15 Questions • Multiple Choice & Essay</p>
                            <div className="mt-4 pt-4 border-t flex justify-between text-xs text-muted-foreground">
                                <span>Last updated: Yesterday</span>
                                <span className="text-success font-medium">Active</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default AdminFormBuilderPreview;
