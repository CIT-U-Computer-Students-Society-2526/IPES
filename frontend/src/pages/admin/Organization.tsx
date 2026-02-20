import { useState } from "react";
import {
  Building2,
  Plus,
  Search,
  MoreHorizontal,
  Users,
  ChevronRight,
  Edit,
  Trash2,
  UserPlus,
  Check,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePendingJoinRequests, useApproveJoinRequest, useRejectJoinRequest } from "@/hooks/useOrganizations";
import { useOrganizationState } from "@/contexts/OrganizationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

const organizationData = {
  name: "University Student Council",
  term: "2024-2025",
  totalMembers: 48,
  activeUnits: 8,
};

const units = [
  {
    id: 1,
    name: "Executive Committee",
    type: "Executive",
    members: 5,
    head: "Maria Santos",
    positions: ["President", "Vice President", "Secretary", "Treasurer", "Auditor"]
  },
  {
    id: 2,
    name: "Legislative Council",
    type: "Legislative",
    members: 12,
    head: "Juan Dela Cruz",
    positions: ["Speaker", "Deputy Speaker", "Councilor"]
  },
  {
    id: 3,
    name: "Committee on Academics",
    type: "Committee",
    members: 6,
    head: "Ana Reyes",
    positions: ["Chairperson", "Vice Chairperson", "Member"]
  },
  {
    id: 4,
    name: "Committee on Finance",
    type: "Committee",
    members: 5,
    head: "Carlos Garcia",
    positions: ["Chairperson", "Vice Chairperson", "Member"]
  },
  {
    id: 5,
    name: "Committee on External Affairs",
    type: "Committee",
    members: 6,
    head: "Rosa Mendoza",
    positions: ["Chairperson", "Vice Chairperson", "Member"]
  },
  {
    id: 6,
    name: "Committee on Internal Affairs",
    type: "Committee",
    members: 5,
    head: "Pedro Lim",
    positions: ["Chairperson", "Vice Chairperson", "Member"]
  },
  {
    id: 7,
    name: "Committee on Sports & Recreation",
    type: "Committee",
    members: 5,
    head: "Luis Tan",
    positions: ["Chairperson", "Vice Chairperson", "Member"]
  },
  {
    id: 8,
    name: "Committee on Culture & Arts",
    type: "Committee",
    members: 4,
    head: "Elena Cruz",
    positions: ["Chairperson", "Vice Chairperson", "Member"]
  },
];

const positionTypes = [
  { id: 1, name: "President", level: "Executive", weight: 10 },
  { id: 2, name: "Vice President", level: "Executive", weight: 9 },
  { id: 3, name: "Secretary", level: "Executive", weight: 8 },
  { id: 4, name: "Treasurer", level: "Executive", weight: 8 },
  { id: 5, name: "Chairperson", level: "Committee", weight: 7 },
  { id: 6, name: "Vice Chairperson", level: "Committee", weight: 6 },
  { id: 7, name: "Member", level: "Committee", weight: 5 },
];

const AdminOrganization = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<typeof units[0] | null>(null);

  const { activeOrganizationId } = useOrganizationState();
  const { data: pendingRequests, isLoading: isLoadingRequests } = usePendingJoinRequests(activeOrganizationId);
  const approveMutation = useApproveJoinRequest();
  const rejectMutation = useRejectJoinRequest();

  const handleApprove = (id: number) => {
    // For now, mock assigning them to unit 1 position 7 (Member of Executive Committee) for simplicity
    // In a real app this would open a dialog to select the unit and position
    approveMutation.mutate({ id, unit_id: 1, position_id: 7, role: 'Member' }, {
      onSuccess: () => alert("Member approved!"),
      onError: (err: any) => alert(err.message)
    });
  };

  const handleReject = (id: number) => {
    if (confirm("Are you sure you want to reject this request?")) {
      rejectMutation.mutate({ id }, {
        onSuccess: () => alert("Request rejected!"),
        onError: (err: any) => alert(err.message)
      });
    }
  };

  const filteredUnits = units.filter(unit =>
    unit.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Organization Structure</h1>
          <p className="text-muted-foreground">Manage units, positions, and memberships</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Position Type
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Position Type</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Position Name</Label>
                  <Input placeholder="e.g., Director" />
                </div>
                <div className="space-y-2">
                  <Label>Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="executive">Executive</SelectItem>
                      <SelectItem value="legislative">Legislative</SelectItem>
                      <SelectItem value="committee">Committee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Weight (1-10)</Label>
                  <Input type="number" min="1" max="10" placeholder="5" />
                </div>
                <Button className="w-full">Add Position Type</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gradient-hero text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Add Unit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Organization Unit</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Unit Name</Label>
                  <Input placeholder="e.g., Committee on Education" />
                </div>
                <div className="space-y-2">
                  <Label>Unit Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="executive">Executive</SelectItem>
                      <SelectItem value="legislative">Legislative</SelectItem>
                      <SelectItem value="committee">Committee</SelectItem>
                      <SelectItem value="commission">Commission</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full">Create Unit</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Organization Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl gradient-hero flex items-center justify-center">
                <Building2 className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">{organizationData.name}</h2>
                <p className="text-muted-foreground">Term: {organizationData.term}</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{organizationData.totalMembers}</p>
                <p className="text-sm text-muted-foreground">Total Members</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{organizationData.activeUnits}</p>
                <p className="text-sm text-muted-foreground">Active Units</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="structure" className="space-y-6">
        <TabsList>
          <TabsTrigger value="structure">Structure & Members</TabsTrigger>
          <TabsTrigger value="requests">
            Join Requests
            {pendingRequests && pendingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-2 px-1.5 py-0.5 text-[10px] min-w-[20px] rounded-full flex items-center justify-center">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="structure" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Units List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search units..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                {filteredUnits.map((unit) => (
                  <Card
                    key={unit.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${selectedUnit?.id === unit.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedUnit(unit)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium text-foreground">{unit.name}</h3>
                            <p className="text-sm text-muted-foreground">Head: {unit.head}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">{unit.type}</Badge>
                          <span className="text-sm text-muted-foreground">{unit.members} members</span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Unit Details / Position Types */}
            <div className="space-y-4">
              {selectedUnit ? (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{selectedUnit.name}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Unit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add Member
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Unit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Type</p>
                      <Badge>{selectedUnit.type}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Unit Head</p>
                      <p className="font-medium">{selectedUnit.head}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Positions ({selectedUnit.positions.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedUnit.positions.map((pos, idx) => (
                          <Badge key={idx} variant="outline">{pos}</Badge>
                        ))}
                      </div>
                    </div>
                    <Button className="w-full" variant="outline">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Member to Unit
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Position Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {positionTypes.map((pos) => (
                        <div key={pos.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                          <div>
                            <p className="font-medium text-foreground">{pos.name}</p>
                            <p className="text-sm text-muted-foreground">{pos.level}</p>
                          </div>
                          <Badge variant="secondary">Weight: {pos.weight}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          {/* Join Requests UI */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Join Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingRequests ? (
                <p className="text-muted-foreground">Loading pending requests...</p>
              ) : pendingRequests?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No pending requests at this time.</p>
              ) : (
                <div className="space-y-4">
                  {pendingRequests?.map((req: any) => (
                    <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                      <div>
                        <p className="font-semibold text-foreground">{req.user_first_name} {req.user_last_name}</p>
                        <p className="text-sm text-muted-foreground">{req.user_email}</p>
                        <p className="text-xs text-muted-foreground mt-1">Requested: {new Date(req.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 shrink-0">
                        <Button size="sm" onClick={() => handleApprove(req.id)} disabled={approveMutation.isPending}>
                          <Check className="w-4 h-4 mr-2" /> Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleReject(req.id)} disabled={rejectMutation.isPending}>
                          <X className="w-4 h-4 mr-2" /> Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminOrganization;
