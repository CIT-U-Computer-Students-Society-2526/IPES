import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const OfficerEvaluationsPreview = () => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">My Evaluations (Preview)</h1>
                <p className="page-description">Complete your assigned evaluation forms</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search evaluations..." className="pl-9" disabled />
                </div>
                <Button variant="outline" size="icon" disabled>
                    <Filter className="w-4 h-4" />
                </Button>
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="w-full sm:w-auto">
                    <TabsTrigger value="pending" className="flex-1 sm:flex-none">Pending (3)</TabsTrigger>
                    <TabsTrigger value="completed" className="flex-1 sm:flex-none">Completed (12)</TabsTrigger>
                    <TabsTrigger value="all" className="flex-1 sm:flex-none">All (15)</TabsTrigger>
                </TabsList>
                <TabsContent value="pending" className="mt-4 space-y-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="opacity-80">
                            <CardContent className="p-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-foreground mb-1">
                                            Static Preview Evaluation #{i}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                            <Badge className="bg-yellow-100 text-yellow-800">Not Started</Badge>
                                            <Badge variant="outline">Evaluation</Badge>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" /> Due Soon
                                            </span>
                                        </div>
                                    </div>
                                    <Button size="sm" disabled>Start</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default OfficerEvaluationsPreview;
