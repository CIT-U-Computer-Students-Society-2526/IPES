import { useState, useMemo } from "react";
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Send,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useForms, useAssignments, useGenerateAssignments, type EvaluationForm } from "@/hooks/useEvaluations";

const AdminAssignments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedForm, setSelectedForm] = useState<EvaluationForm | null>(null);
  const { toast } = useToast();

  // API Hooks
  // We use the empty params to fetch all forms. If we want only active ones we could pass {is_active: true}
  const { data: forms = [], isLoading: formsLoading } = useForms();
  // Fetch all assignments across the org to aggregate stats
  const { data: allAssignments = [], isLoading: assignmentsLoading } = useAssignments();

  const generateMutation = useGenerateAssignments();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Results Released": return "bg-purple-100 text-purple-700";
      case "Active": return "bg-green-100 text-green-700";
      case "Completed": return "bg-blue-100 text-blue-700";
      case "Scheduled": return "bg-yellow-100 text-yellow-700";
      case "Draft": return "bg-gray-100 text-gray-700";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getEvaluatorStatusIcon = (status: string) => {
    switch (status) {
      case "Completed": return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "In Progress": return <Clock className="w-4 h-4 text-yellow-600" />;
      default: return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  // Compile active forms and their mapped assignments
  const enrichedForms = useMemo(() => {
    return forms.map(form => {
      const formAssignments = allAssignments.filter(a => a.form_id === form.id);
      const completedCount = formAssignments.filter(a => a.status === 'Completed').length;

      let status = "Draft";
      if (form.is_active) status = "Active";
      if (form.results_released) status = "Results Released";

      return {
        ...form,
        displayStatus: status,
        evaluatorsCount: formAssignments.length,
        completedCount: completedCount,
      };
    });
  }, [forms, allAssignments]);

  const filteredForms = enrichedForms.filter(f =>
    f.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = enrichedForms.filter(f => f.is_active && !f.results_released).length;
  const totalEvaluatorsCount = allAssignments.length;

  const handleAutoAssign = async (formId: number) => {
    try {
      const res = await generateMutation.mutateAsync(formId);
      toast({
        title: res.created === 0 ? "Already Up to Date" : "Assignments Generated",
        description: res.created === 0
          ? "All assignments already exist for this form."
          : `${res.created} new assignment(s) created.`,
      });
    } catch (e: unknown) {
      toast({
        title: "Failed to Generate Assignments",
        description: e instanceof Error ? e.message : "An error occurred.",
        variant: "destructive"
      });
    }
  };

  const selectedFormAssignments = allAssignments.filter(a => a.form_id === selectedForm?.id);

  if (formsLoading || assignmentsLoading) {
    return <div className="p-12 text-center text-muted-foreground animate-pulse">Loading administrative dashboard...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Evaluation Assignments</h1>
          <p className="text-muted-foreground">Manage who evaluates whom</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gradient-hero text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Create Assignment Matrix
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Evaluation Assignment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Evaluation Form Template</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select form" />
                  </SelectTrigger>
                  <SelectContent>
                    {forms.map(f => (
                      <SelectItem key={f.id} value={String(f.id)}>{f.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assignment Rule</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="peer">Peer (same unit)</SelectItem>
                    <SelectItem value="cross">Cross-Unit</SelectItem>
                    <SelectItem value="exec">Executive Review</SelectItem>
                    <SelectItem value="self">Self-Assessment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Due Date Override (Optional)</Label>
                <Input type="date" />
              </div>
              <Button className="w-full">Create Matrix Manually</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{forms.length}</p>
                <p className="text-sm text-muted-foreground">Total Form Cycles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeCount}</p>
                <p className="text-sm text-muted-foreground">Active Cycles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalEvaluatorsCount}</p>
                <p className="text-sm text-muted-foreground">Total Matrices</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-sm text-muted-foreground">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assignments List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search forms..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {filteredForms.map((form) => (
              <Card
                key={form.id}
                className={`cursor-pointer transition-all hover:shadow-md ${selectedForm?.id === form.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedForm(form)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-foreground">{form.title}</h3>
                      <p className="text-sm text-muted-foreground">{form.type.toUpperCase()} EVALUATION</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(form.displayStatus)}>{form.displayStatus}</Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleAutoAssign(form.id); }}>
                            <Zap className="w-4 h-4 mr-2" />
                            Auto-Assign Matrix
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {form.evaluatorsCount} evaluators paired
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Due {form.end_date ? new Date(form.end_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Completion</span>
                      <span className="font-medium">{form.completedCount}/{form.evaluatorsCount || 0}</span>
                    </div>
                    <Progress value={form.evaluatorsCount ? (form.completedCount / form.evaluatorsCount) * 100 : 0} className="h-2" />
                  </div>

                  {/* Inline Auto Assign Hint */}
                  {form.evaluatorsCount === 0 && (
                    <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
                      <span className="text-sm text-muted-foreground flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2 text-yellow-500" />
                        No evaluators assigned yet.
                      </span>
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleAutoAssign(form.id); }} disabled={generateMutation.isPending}>
                        <Zap className="w-4 h-4 mr-2 text-primary" />
                        Auto-Assign Now
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {filteredForms.length === 0 && (
              <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                No evaluation cycles found.
              </div>
            )}
          </div>
        </div>

        {/* Assignment Details Panel */}
        <div>
          {selectedForm ? (
            <Card className="sticky top-6 lg:max-h-[calc(100vh-120px)] flex flex-col overflow-hidden">
              <CardHeader className="flex-shrink-0 border-b pb-4">
                <CardTitle className="text-lg">Evaluator Matrix</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Viewing pairings for <strong>{selectedForm.title}</strong>
                </p>
              </CardHeader>
              <div className="flex-1 overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                    <TableRow>
                      <TableHead>Evaluator / Evaluatee</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedFormAssignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground text-sm">
                              {assignment.evaluator_email}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              → {assignment.evaluatee_email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 whitespace-nowrap">
                            {getEvaluatorStatusIcon(assignment.status)}
                            <span className="text-xs font-medium">{assignment.status}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {selectedFormAssignments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                          No matrix generated for this form.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {selectedFormAssignments.length > 0 && (
                <div className="p-4 border-t bg-muted/20 flex-shrink-0">
                  <Dialog>
                    <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Send Reminder to Pending
                  </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm text-center p-6">
                      <DialogHeader>
                        <DialogTitle className="text-center">Coming Soon</DialogTitle>
                      </DialogHeader>
                      <div className="py-4 space-y-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                          <Send className="w-6 h-6" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          The ability to send automated email reminders to evaluators with pending tasks will be available in a future update.
                        </p>
                      </div>
                      <Button onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))} className="w-full mt-2">
                        Got it
                      </Button>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </Card>
          ) : (
            <Card className="sticky top-6">
              <CardContent className="p-8 text-center">
                <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-20" />
                <p className="text-muted-foreground">Select a form cycle to view its detailed assignment matrix</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAssignments;
