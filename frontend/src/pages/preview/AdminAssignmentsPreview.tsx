import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const AdminAssignmentsPreview = () => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Assignments (Preview)</h1>
                    <p className="text-muted-foreground">Assign forms to reviewers and evaluatees</p>
                </div>
                <Button disabled>
                    <Plus className="w-4 h-4 mr-2" />
                    New Assignment
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Evaluation Form</TableHead>
                                <TableHead>Evaluator</TableHead>
                                <TableHead>Evaluatee</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Deadline</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-medium">Midterm Peer Review Form {i}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-muted-foreground" />
                                            Juan Dela Cruz
                                        </div>
                                    </TableCell>
                                    <TableCell>Maria Santos</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={i % 2 === 0 ? "text-yellow-600 border-yellow-600 bg-yellow-50" : "text-green-600 border-green-600 bg-green-50"}>
                                            {i % 2 === 0 ? "Pending" : "Submitted"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">Oct 15, 2026</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminAssignmentsPreview;
