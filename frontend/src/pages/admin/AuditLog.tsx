import { useState } from "react";
import { 
  History, 
  Search, 
  Filter,
  LogIn,
  FileEdit,
  Eye,
  UserPlus,
  Trash2,
  Shield,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";

const auditLogs = [
  { 
    id: 1, 
    user: "Admin User", 
    action: "login", 
    target: "System", 
    details: "Successful login from 192.168.1.1",
    timestamp: "2024-01-15 14:32:05",
    ip: "192.168.1.1"
  },
  { 
    id: 2, 
    user: "Admin User", 
    action: "edit", 
    target: "Evaluation Form: Q4 Self-Evaluation", 
    details: "Modified question #3",
    timestamp: "2024-01-15 14:28:12",
    ip: "192.168.1.1"
  },
  { 
    id: 3, 
    user: "Maria Santos", 
    action: "view", 
    target: "Results: Juan Dela Cruz", 
    details: "Viewed evaluation results",
    timestamp: "2024-01-15 13:45:30",
    ip: "192.168.1.45"
  },
  { 
    id: 4, 
    user: "Admin User", 
    action: "create", 
    target: "User: Pedro Reyes", 
    details: "Created new officer account",
    timestamp: "2024-01-15 12:15:00",
    ip: "192.168.1.1"
  },
  { 
    id: 5, 
    user: "Juan Dela Cruz", 
    action: "login", 
    target: "System", 
    details: "Successful login from 192.168.1.22",
    timestamp: "2024-01-15 11:30:45",
    ip: "192.168.1.22"
  },
  { 
    id: 6, 
    user: "Admin User", 
    action: "delete", 
    target: "Assignment: Draft Peer Eval", 
    details: "Deleted draft assignment",
    timestamp: "2024-01-15 10:20:15",
    ip: "192.168.1.1"
  },
  { 
    id: 7, 
    user: "Admin User", 
    action: "permission", 
    target: "User: Maria Santos", 
    details: "Changed role from Officer to Admin",
    timestamp: "2024-01-15 09:45:00",
    ip: "192.168.1.1"
  },
  { 
    id: 8, 
    user: "Ana Garcia", 
    action: "view", 
    target: "Accomplishments: Research Committee", 
    details: "Viewed accomplishment submissions",
    timestamp: "2024-01-15 09:30:20",
    ip: "192.168.1.33"
  },
  { 
    id: 9, 
    user: "Admin User", 
    action: "edit", 
    target: "Organization: Events Committee", 
    details: "Updated unit description",
    timestamp: "2024-01-14 16:45:30",
    ip: "192.168.1.1"
  },
  { 
    id: 10, 
    user: "Pedro Reyes", 
    action: "login", 
    target: "System", 
    details: "Failed login attempt (wrong password)",
    timestamp: "2024-01-14 15:20:10",
    ip: "192.168.1.50"
  },
];

const actionIcons: Record<string, typeof LogIn> = {
  login: LogIn,
  edit: FileEdit,
  view: Eye,
  create: UserPlus,
  delete: Trash2,
  permission: Shield,
};

const actionColors: Record<string, string> = {
  login: "bg-primary/10 text-primary",
  edit: "bg-warning/10 text-warning",
  view: "bg-muted text-muted-foreground",
  create: "bg-success/10 text-success",
  delete: "bg-destructive/10 text-destructive",
  permission: "bg-accent/10 text-accent",
};

const AuditLog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Audit Log</h1>
          <p className="text-muted-foreground mt-1">Track all system activities and changes</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Log
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by user, target, or details..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="edit">Edit</SelectItem>
              <SelectItem value="view">View</SelectItem>
              <SelectItem value="create">Create</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
              <SelectItem value="permission">Permission Change</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Timestamp</TableHead>
              <TableHead className="font-semibold">User</TableHead>
              <TableHead className="font-semibold">Action</TableHead>
              <TableHead className="font-semibold">Target</TableHead>
              <TableHead className="font-semibold">Details</TableHead>
              <TableHead className="font-semibold">IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => {
              const IconComponent = actionIcons[log.action] || History;
              const colorClass = actionColors[log.action] || "bg-muted text-muted-foreground";
              
              return (
                <TableRow key={log.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-sm text-muted-foreground whitespace-nowrap">
                    {log.timestamp}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {log.user}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`${colorClass} gap-1.5`}>
                      <IconComponent className="w-3 h-3" />
                      {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-foreground max-w-[200px] truncate">
                    {log.target}
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-[250px] truncate">
                    {log.details}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {log.ip}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {filteredLogs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <History className="w-12 h-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No audit logs found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{auditLogs.filter(l => l.action === 'login').length}</p>
          <p className="text-sm text-muted-foreground">Logins Today</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{auditLogs.filter(l => l.action === 'edit').length}</p>
          <p className="text-sm text-muted-foreground">Edits Made</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{auditLogs.filter(l => l.action === 'view').length}</p>
          <p className="text-sm text-muted-foreground">Records Viewed</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{new Set(auditLogs.map(l => l.user)).size}</p>
          <p className="text-sm text-muted-foreground">Active Users</p>
        </div>
      </div>
    </div>
  );
};

export default AuditLog;
