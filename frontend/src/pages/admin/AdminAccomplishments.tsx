import { useState } from "react";
import { 
  Trophy, 
  Search, 
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Eye,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const accomplishments = [
  { 
    id: 1, 
    title: "Led University Week Planning Committee",
    officer: "Maria Santos",
    unit: "Executive",
    date: "2024-01-05",
    status: "Pending",
    proof: "https://drive.google.com/example1",
    description: "Organized and led a team of 15 members to plan the annual University Week celebration."
  },
  { 
    id: 2, 
    title: "Completed Financial Audit Report",
    officer: "Carlos Garcia",
    unit: "Finance",
    date: "2024-01-08",
    status: "Verified",
    proof: "https://drive.google.com/example2",
    description: "Prepared comprehensive financial audit report for Q3-Q4 2023."
  },
  { 
    id: 3, 
    title: "Organized Academic Excellence Awards",
    officer: "Ana Reyes",
    unit: "Academics",
    date: "2024-01-10",
    status: "Verified",
    proof: "https://drive.google.com/example3",
    description: "Planned and executed the Academic Excellence Awards ceremony for 200+ scholars."
  },
  { 
    id: 4, 
    title: "Drafted Partnership Proposal",
    officer: "Rosa Mendoza",
    unit: "External",
    date: "2024-01-12",
    status: "Pending",
    proof: "https://drive.google.com/example4",
    description: "Created partnership proposal for collaboration with 3 external organizations."
  },
  { 
    id: 5, 
    title: "Sports Festival Coordination",
    officer: "Luis Tan",
    unit: "Sports",
    date: "2024-01-03",
    status: "Rejected",
    proof: "https://drive.google.com/example5",
    description: "Coordinated inter-college sports festival.",
    rejectReason: "Insufficient documentation. Please provide photos and attendance records."
  },
];

const AdminAccomplishments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedAccomplishment, setSelectedAccomplishment] = useState<typeof accomplishments[0] | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Verified": return "bg-green-100 text-green-700";
      case "Pending": return "bg-yellow-100 text-yellow-700";
      case "Rejected": return "bg-red-100 text-red-700";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Verified": return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "Pending": return <Clock className="w-4 h-4 text-yellow-600" />;
      case "Rejected": return <XCircle className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  const filteredAccomplishments = accomplishments.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.officer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || a.status.toLowerCase() === activeTab;
    return matchesSearch && matchesTab;
  });

  const stats = {
    pending: accomplishments.filter(a => a.status === "Pending").length,
    verified: accomplishments.filter(a => a.status === "Verified").length,
    rejected: accomplishments.filter(a => a.status === "Rejected").length,
    total: accomplishments.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Accomplishment Review</h1>
          <p className="text-muted-foreground">Verify and manage officer accomplishments</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
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
                <p className="text-2xl font-bold text-foreground">{stats.verified}</p>
                <p className="text-sm text-muted-foreground">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.rejected}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                <TabsTrigger value="verified">Verified</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search..." 
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Accomplishment</TableHead>
                <TableHead>Officer</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccomplishments.map((acc) => (
                <TableRow key={acc.id}>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="font-medium text-foreground truncate">{acc.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{acc.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>{acc.officer}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{acc.unit}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{acc.date}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(acc.status)}
                      <Badge className={getStatusColor(acc.status)}>{acc.status}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.open(acc.proof, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => { setSelectedAccomplishment(acc); setReviewDialogOpen(true); }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Accomplishment</DialogTitle>
          </DialogHeader>
          {selectedAccomplishment && (
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-muted-foreground">Title</Label>
                <p className="font-medium">{selectedAccomplishment.title}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="text-sm">{selectedAccomplishment.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Officer</Label>
                  <p className="font-medium">{selectedAccomplishment.officer}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Unit</Label>
                  <p className="font-medium">{selectedAccomplishment.unit}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Proof Link</Label>
                <a 
                  href={selectedAccomplishment.proof} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  View Documentation <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {selectedAccomplishment.status === "Pending" && (
                <>
                  <div className="space-y-2">
                    <Label>Reviewer Notes (optional)</Label>
                    <Textarea placeholder="Add any notes about this accomplishment..." />
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-green-600 hover:bg-green-700">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Verify
                    </Button>
                    <Button variant="destructive" className="flex-1">
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </>
              )}

              {selectedAccomplishment.status === "Rejected" && selectedAccomplishment.rejectReason && (
                <div className="p-3 bg-red-50 rounded-lg">
                  <Label className="text-red-700">Rejection Reason</Label>
                  <p className="text-sm text-red-600">{selectedAccomplishment.rejectReason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAccomplishments;
