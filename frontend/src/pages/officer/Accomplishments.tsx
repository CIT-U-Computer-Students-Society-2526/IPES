import { useState } from "react";
import { Trophy, Plus, ExternalLink, Clock, CheckCircle2, XCircle, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const accomplishments = [
  { 
    id: 1, 
    title: "Led Research Week 2025", 
    description: "Organized and led the annual Research Week event with 500+ attendees",
    date: "November 2025",
    status: "verified",
    proofLink: "https://example.com/proof1"
  },
  { 
    id: 2, 
    title: "Published Committee Report Q3", 
    description: "Authored and published the Q3 committee progress report",
    date: "October 2025",
    status: "verified",
    proofLink: "https://example.com/proof2"
  },
  { 
    id: 3, 
    title: "Mentored 5 Junior Researchers", 
    description: "Provided guidance and mentorship to new committee members",
    date: "September 2025",
    status: "pending",
    proofLink: null
  },
  { 
    id: 4, 
    title: "Organized Workshop Series", 
    description: "Conducted 3 workshop sessions on research methodology",
    date: "August 2025",
    status: "rejected",
    proofLink: "https://example.com/proof4",
    rejectionReason: "Insufficient documentation provided"
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "verified":
      return (
        <span className="status-badge status-completed flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Verified
        </span>
      );
    case "pending":
      return (
        <span className="status-badge status-pending flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Pending
        </span>
      );
    case "rejected":
      return (
        <span className="status-badge bg-destructive/10 text-destructive flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Rejected
        </span>
      );
    default:
      return null;
  }
};

const OfficerAccomplishments = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAccomplishment, setNewAccomplishment] = useState({
    title: "",
    description: "",
    proofLink: ""
  });

  const handleSubmit = () => {
    // Handle submission
    setIsDialogOpen(false);
    setNewAccomplishment({ title: "", description: "", proofLink: "" });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">My Accomplishments</h1>
          <p className="page-description">Track and showcase your contributions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Accomplishment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Accomplishment</DialogTitle>
              <DialogDescription>
                Submit your accomplishment for verification
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g., Led Research Week 2025"
                  value={newAccomplishment.title}
                  onChange={(e) => setNewAccomplishment(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe your accomplishment..."
                  value={newAccomplishment.description}
                  onChange={(e) => setNewAccomplishment(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proof">Proof Link (optional)</Label>
                <Input 
                  id="proof" 
                  placeholder="https://..."
                  value={newAccomplishment.proofLink}
                  onChange={(e) => setNewAccomplishment(prev => ({ ...prev, proofLink: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                Submit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {accomplishments.filter(a => a.status === 'verified').length}
              </p>
              <p className="text-sm text-muted-foreground">Verified</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {accomplishments.filter(a => a.status === 'pending').length}
              </p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{accomplishments.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Accomplishments List */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground">All Accomplishments</h2>
        </div>
        <div className="divide-y divide-border">
          {accomplishments.map((item) => (
            <div key={item.id} className="p-4 hover:bg-muted/30 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-foreground">{item.title}</h3>
                    {getStatusBadge(item.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{item.date}</span>
                    {item.proofLink && (
                      <a 
                        href={item.proofLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View proof
                      </a>
                    )}
                  </div>
                  {item.status === 'rejected' && item.rejectionReason && (
                    <p className="text-xs text-destructive mt-2">
                      Reason: {item.rejectionReason}
                    </p>
                  )}
                </div>
                {item.status === 'pending' && (
                  <Button variant="ghost" size="sm">
                    <Pencil className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground text-center">
          Verified accomplishments will be visible to evaluators. 
          Make sure to provide accurate information and valid proof links.
        </p>
      </div>
    </div>
  );
};

export default OfficerAccomplishments;
