import { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, CheckCircle2, AlertCircle, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const evaluations = [
  { 
    id: 1, 
    title: "Peer Evaluation - Research Committee", 
    evaluatee: "Maria Santos",
    position: "Research Director",
    dueDate: "Jan 10, 2026",
    type: "Peer",
    status: "pending",
    urgent: true
  },
  { 
    id: 2, 
    title: "Self-Evaluation Q4 2025", 
    evaluatee: "Self",
    position: "Committee Head",
    dueDate: "Jan 12, 2026",
    type: "Self",
    status: "pending",
    urgent: false
  },
  { 
    id: 3, 
    title: "Cross-Unit Evaluation - Events Committee", 
    evaluatee: "Pedro Reyes",
    position: "Events Director",
    dueDate: "Jan 15, 2026",
    type: "Cross-Unit",
    status: "pending",
    urgent: false
  },
  { 
    id: 4, 
    title: "Executive Evaluation - President", 
    evaluatee: "Ana Garcia",
    position: "President",
    dueDate: "Jan 8, 2026",
    type: "Executive",
    status: "in-progress",
    urgent: false
  },
  { 
    id: 5, 
    title: "Peer Evaluation - Finance Committee", 
    evaluatee: "Carlos Mendoza",
    position: "Finance Head",
    dueDate: "Jan 5, 2026",
    type: "Peer",
    status: "completed",
    urgent: false
  },
  { 
    id: 6, 
    title: "Cross-Unit Evaluation - Marketing", 
    evaluatee: "Sofia Cruz",
    position: "Marketing Director",
    dueDate: "Jan 3, 2026",
    type: "Cross-Unit",
    status: "completed",
    urgent: false
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <span className="status-badge status-pending">Not Started</span>;
    case "in-progress":
      return <span className="status-badge status-in-progress">In Progress</span>;
    case "completed":
      return <span className="status-badge status-completed">Completed</span>;
    default:
      return null;
  }
};

const OfficerEvaluations = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filterEvaluations = (status: string) => {
    return evaluations.filter(e => 
      (status === "all" || e.status === status) &&
      (e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       e.evaluatee.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const renderEvaluationsList = (items: typeof evaluations) => (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No evaluations found
        </div>
      ) : (
        items.map((evaluation) => (
          <div 
            key={evaluation.id}
            className="evaluation-card"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-foreground">{evaluation.title}</h3>
                  {evaluation.urgent && (
                    <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  {getStatusBadge(evaluation.status)}
                  <span className="text-xs bg-secondary px-2 py-0.5 rounded">{evaluation.type}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Due {evaluation.dueDate}
                  </span>
                </div>
                {evaluation.evaluatee !== "Self" && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Evaluating: <span className="text-foreground">{evaluation.evaluatee}</span> ({evaluation.position})
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {evaluation.status === "completed" ? (
                  <Button variant="outline" size="sm" disabled>
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Submitted
                  </Button>
                ) : (
                  <Link to={`/officer/evaluations/${evaluation.id}`}>
                    <Button size="sm">
                      {evaluation.status === "in-progress" ? "Continue" : "Start"}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">My Evaluations</h1>
        <p className="page-description">Complete your assigned evaluation forms</p>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search evaluations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="pending" className="flex-1 sm:flex-none">
            Pending ({filterEvaluations("pending").length + filterEvaluations("in-progress").length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1 sm:flex-none">
            Completed ({filterEvaluations("completed").length})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex-1 sm:flex-none">
            All ({evaluations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          {renderEvaluationsList([...filterEvaluations("pending"), ...filterEvaluations("in-progress")])}
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          {renderEvaluationsList(filterEvaluations("completed"))}
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          {renderEvaluationsList(filterEvaluations("all"))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OfficerEvaluations;
