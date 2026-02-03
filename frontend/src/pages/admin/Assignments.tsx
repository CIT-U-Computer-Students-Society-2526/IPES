import { useState } from "react";
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
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

const assignments = [
  { 
    id: 1, 
    name: "Mid-Year Peer Evaluation",
    form: "Peer Evaluation Form",
    type: "Peer",
    evaluators: 48,
    completed: 35,
    dueDate: "2024-01-20",
    status: "Active"
  },
  { 
    id: 2, 
    name: "Executive Committee Review",
    form: "Executive Evaluation Form",
    type: "Executive",
    evaluators: 12,
    completed: 8,
    dueDate: "2024-01-25",
    status: "Active"
  },
  { 
    id: 3, 
    name: "Self-Assessment Q1",
    form: "Self-Assessment Form",
    type: "Self",
    evaluators: 48,
    completed: 48,
    dueDate: "2024-01-10",
    status: "Completed"
  },
  { 
    id: 4, 
    name: "Cross-Committee Evaluation",
    form: "Committee Cross-Evaluation",
    type: "Cross",
    evaluators: 30,
    completed: 0,
    dueDate: "2024-02-01",
    status: "Scheduled"
  },
];

const evaluatorDetails = [
  { id: 1, name: "Maria Santos", unit: "Executive", target: "Juan Dela Cruz", status: "Completed", submittedAt: "2024-01-12" },
  { id: 2, name: "Carlos Garcia", unit: "Finance", target: "Ana Reyes", status: "Completed", submittedAt: "2024-01-13" },
  { id: 3, name: "Rosa Mendoza", unit: "External", target: "Pedro Lim", status: "In Progress", submittedAt: null },
  { id: 4, name: "Luis Tan", unit: "Sports", target: "Elena Cruz", status: "Not Started", submittedAt: null },
  { id: 5, name: "Ana Reyes", unit: "Academics", target: "Carlos Garcia", status: "Completed", submittedAt: "2024-01-14" },
];

const AdminAssignments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState<typeof assignments[0] | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-700";
      case "Completed": return "bg-blue-100 text-blue-700";
      case "Scheduled": return "bg-yellow-100 text-yellow-700";
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

  const filteredAssignments = assignments.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
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
              Create Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Evaluation Assignment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Assignment Name</Label>
                <Input placeholder="e.g., Q1 Peer Evaluation" />
              </div>
              <div className="space-y-2">
                <Label>Evaluation Form</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select form" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="peer">Peer Evaluation Form</SelectItem>
                    <SelectItem value="exec">Executive Evaluation Form</SelectItem>
                    <SelectItem value="self">Self-Assessment Form</SelectItem>
                    <SelectItem value="cross">Cross-Committee Evaluation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assignment Type</Label>
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
                <Label>Due Date</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Assign To</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Officers</SelectItem>
                    <SelectItem value="exec">Executive Committee</SelectItem>
                    <SelectItem value="legislative">Legislative Council</SelectItem>
                    <SelectItem value="committees">All Committees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full">Create Assignment</Button>
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
                <p className="text-2xl font-bold text-foreground">{assignments.length}</p>
                <p className="text-sm text-muted-foreground">Total Assignments</p>
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
                <p className="text-2xl font-bold text-foreground">2</p>
                <p className="text-sm text-muted-foreground">Active</p>
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
                <p className="text-2xl font-bold text-foreground">138</p>
                <p className="text-sm text-muted-foreground">Total Evaluators</p>
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
                <p className="text-2xl font-bold text-foreground">1</p>
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
                placeholder="Search assignments..." 
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
            {filteredAssignments.map((assignment) => (
              <Card 
                key={assignment.id}
                className={`cursor-pointer transition-all hover:shadow-md ${selectedAssignment?.id === assignment.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedAssignment(assignment)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-foreground">{assignment.name}</h3>
                      <p className="text-sm text-muted-foreground">{assignment.form}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(assignment.status)}>{assignment.status}</Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Send className="w-4 h-4 mr-2" />
                            Send Reminders
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
                      {assignment.evaluators} evaluators
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Due {assignment.dueDate}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Completion</span>
                      <span className="font-medium">{assignment.completed}/{assignment.evaluators}</span>
                    </div>
                    <Progress value={(assignment.completed / assignment.evaluators) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Assignment Details */}
        <div>
          {selectedAssignment ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Evaluator Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Evaluator</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {evaluatorDetails.map((evaluator) => (
                      <TableRow key={evaluator.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{evaluator.name}</p>
                            <p className="text-xs text-muted-foreground">→ {evaluator.target}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getEvaluatorStatusIcon(evaluator.status)}
                            <span className="text-sm">{evaluator.status}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button variant="outline" className="w-full mt-4">
                  <Send className="w-4 h-4 mr-2" />
                  Send Reminder to Pending
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Select an assignment to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAssignments;
