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
import {
  usePendingJoinRequests,
  useApproveJoinRequest,
  useRejectJoinRequest,
  useOrganizationUnits,
  usePositionTypes,
  useUnitTypes,
  useCreatePositionType,
  useCreateUnitType,
  useCreateOrganizationUnit,
  useDeleteOrganizationUnit,
  useDeletePositionType,
  useDeleteUnitType
} from "@/hooks/useOrganizations";
import { useOrganizationState } from "@/contexts/OrganizationContext";
import { useToast } from "@/hooks/use-toast";
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
  DialogDescription,
  DialogFooter,
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

const AdminOrganization = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<any | null>(null);

  const { activeOrganizationId } = useOrganizationState();
  const { data: pendingRequests, isLoading: isLoadingRequests } = usePendingJoinRequests(activeOrganizationId);
  const { data: realUnits } = useOrganizationUnits(activeOrganizationId);
  const { data: realPositions } = usePositionTypes(activeOrganizationId);
  const { data: realUnitTypes } = useUnitTypes(activeOrganizationId);

  // Position Type State
  const createPositionMutation = useCreatePositionType();
  const [newPositionName, setNewPositionName] = useState("");
  const [newPositionWeight, setNewPositionWeight] = useState("5");
  const [isPositionDialogOpen, setIsPositionDialogOpen] = useState(false);

  // Unit Type State
  const createUnitTypeMutation = useCreateUnitType();
  const [newUnitTypeName, setNewUnitTypeName] = useState("");
  const [isUnitTypeDialogOpen, setIsUnitTypeDialogOpen] = useState(false);

  // Unit State
  const createUnitMutation = useCreateOrganizationUnit();
  const deleteUnitMutation = useDeleteOrganizationUnit();
  const deletePositionMutation = useDeletePositionType();
  const deleteUnitTypeMutation = useDeleteUnitType();

  const [newUnitName, setNewUnitName] = useState("");
  const [newUnitDescription, setNewUnitDescription] = useState("");
  const [newUnitTypeId, setNewUnitTypeId] = useState<string>("");
  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false);

  const [approveDialogId, setApproveDialogId] = useState<number | null>(null);
  const [selectedApproveUnit, setSelectedApproveUnit] = useState<string>("");
  const [selectedApprovePosition, setSelectedApprovePosition] = useState<string>("");
  const [selectedApproveRole, setSelectedApproveRole] = useState<string>("Member");

  const approveMutation = useApproveJoinRequest();
  const rejectMutation = useRejectJoinRequest();
  const { toast } = useToast();

  const handleApproveConfirm = () => {
    if (!approveDialogId || !selectedApproveUnit || !selectedApprovePosition) return;

    approveMutation.mutate({
      id: approveDialogId,
      unit_id: parseInt(selectedApproveUnit),
      position_id: parseInt(selectedApprovePosition),
      role: selectedApproveRole
    }, {
      onSuccess: () => {
        setApproveDialogId(null);
        setSelectedApproveUnit("");
        setSelectedApprovePosition("");
        setSelectedApproveRole("Member");
        toast({
          title: "Request Approved",
          description: "Member has been successfully added to the organization.",
        });
      },
      onError: (err: any) => {
        toast({
          title: "Approval Failed",
          description: err.message || "An error occurred while approving the request.",
          variant: "destructive",
        });
      }
    });
  };

  const handleReject = (id: number) => {
    if (confirm("Are you sure you want to reject this request?")) {
      rejectMutation.mutate({ id }, {
        onSuccess: () => {
          toast({
            title: "Request Rejected",
            description: "The join request was successfully rejected.",
          });
        },
        onError: (err: any) => {
          toast({
            title: "Rejection Failed",
            description: err.message || "An error occurred while rejecting the request.",
            variant: "destructive",
          });
        }
      });
    }
  };

  const handleCreatePositionType = () => {
    if (!newPositionName || !newPositionWeight) return;
    createPositionMutation.mutate({
      name: newPositionName,
      rank: parseInt(newPositionWeight),
    }, {
      onSuccess: () => {
        setIsPositionDialogOpen(false);
        setNewPositionName("");
        setNewPositionWeight("5");
        toast({ title: "Success", description: "Position Type created successfully." });
      },
      onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" })
    });
  };

  const handleCreateUnitType = () => {
    if (!newUnitTypeName) return;
    createUnitTypeMutation.mutate({
      name: newUnitTypeName,
    }, {
      onSuccess: () => {
        setIsUnitTypeDialogOpen(false);
        setNewUnitTypeName("");
        toast({ title: "Success", description: "Unit Type defined successfully." });
      },
      onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" })
    });
  };

  const handleDeleteUnit = (id: number) => {
    if (confirm("Are you sure you want to delete this unit? All memberships tied to it will also be disabled.")) {
      deleteUnitMutation.mutate(id, {
        onSuccess: () => {
          setSelectedUnit(null);
          toast({ title: "Unit Deleted", description: "The unit has been removed." });
        },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" })
      });
    }
  };

  const handleDeletePosition = (id: number) => {
    if (confirm("Are you sure you want to delete this position type? All memberships with this position will also be disabled.")) {
      deletePositionMutation.mutate(id, {
        onSuccess: () => toast({ title: "Position Deleted", description: "The position type has been removed." }),
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" })
      });
    }
  };

  const handleCreateUnit = () => {
    if (!newUnitName || !newUnitTypeId) return;
    createUnitMutation.mutate({
      name: newUnitName,
      description: newUnitDescription,
      type_id: parseInt(newUnitTypeId),
    }, {
      onSuccess: () => {
        setIsUnitDialogOpen(false);
        setNewUnitName("");
        setNewUnitDescription("");
        setNewUnitTypeId("");
        toast({ title: "Success", description: "Organization Unit created successfully." });
      },
      onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" })
    });
  };

  const filteredUnits = realUnits?.filter((unit: any) =>
    unit.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Organization Structure</h1>
          <p className="text-muted-foreground">Manage units, positions, and memberships</p>
        </div>
        <div className="flex gap-2 flex-wrap">

          {/* Add Position Type Dialog */}
          <Dialog open={isPositionDialogOpen} onOpenChange={setIsPositionDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Position Type
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Position Type</DialogTitle>
                <DialogDescription>Define a new role that users can hold within the organization.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Position Name</Label>
                  <Input
                    placeholder="e.g., Director"
                    value={newPositionName}
                    onChange={e => setNewPositionName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Weight (1-10)</Label>
                  <Input
                    type="number"
                    min="1" max="10"
                    placeholder="5"
                    value={newPositionWeight}
                    onChange={e => setNewPositionWeight(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Higher weight = higher ranking in the organization.</p>
                </div>
                <Button
                  className="w-full"
                  onClick={handleCreatePositionType}
                  disabled={!newPositionName || !newPositionWeight || createPositionMutation.isPending}
                >
                  Create Position Type
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Unit Type (LUT) Dialog */}
          <Dialog open={isUnitTypeDialogOpen} onOpenChange={setIsUnitTypeDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Unit Type
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Unit Type</DialogTitle>
                <DialogDescription>
                  Define top-level categories for organization units. (e.g., 'Department', 'Commission', 'Committee')
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Unit Type Name</Label>
                  <Input
                    placeholder="e.g., Committee"
                    value={newUnitTypeName}
                    onChange={e => setNewUnitTypeName(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleCreateUnitType}
                  disabled={!newUnitTypeName || createUnitTypeMutation.isPending}
                >
                  Create Unit Type
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Unit Dialog */}
          <Dialog open={isUnitDialogOpen} onOpenChange={setIsUnitDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-hero text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Add Unit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Organization Unit</DialogTitle>
                <DialogDescription>
                  Create a new operational branch within your organization. Requires a predefined Unit Type.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Unit Name</Label>
                  <Input
                    placeholder="e.g., Committee on Education"
                    value={newUnitName}
                    onChange={e => setNewUnitName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                  <Input
                    placeholder="Brief description of this unit's responsibilities..."
                    value={newUnitDescription}
                    onChange={e => setNewUnitDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit Type</Label>
                  <Select value={newUnitTypeId} onValueChange={setNewUnitTypeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {realUnitTypes?.length === 0 && (
                        <SelectItem value="none" disabled>No Unit Types defined yet. Please create one.</SelectItem>
                      )}
                      {realUnitTypes?.map((ut: any) => (
                        <SelectItem key={ut.id} value={ut.id.toString()}>{ut.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full"
                  onClick={handleCreateUnit}
                  disabled={!newUnitName || !newUnitTypeId || createUnitMutation.isPending}
                >
                  Create Unit
                </Button>
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
                <h2 className="text-xl font-semibold text-foreground">Organization Overview</h2>
                <p className="text-muted-foreground">Manage your structural hierarchies</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">-</p>
                <p className="text-sm text-muted-foreground">Total Members</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{realUnits?.length || 0}</p>
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
                {filteredUnits.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No units found.</p>
                ) : (
                  filteredUnits.map((unit: any) => (
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
                              <p className="text-sm text-muted-foreground line-clamp-1">{unit.description || 'No description provided'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary">Type ID: {unit.type_id || 'None'}</Badge>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
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
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteUnit(selectedUnit.id)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Unit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Type ID</p>
                      <Badge>{selectedUnit.type_id || 'None'}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Description</p>
                      <p className="font-medium">{selectedUnit.description || 'No description assigned.'}</p>
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
                      {realPositions?.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No Position Types defined.</p>
                      ) : (
                        realPositions?.sort((a: any, b: any) => b.rank - a.rank).map((pos: any) => (
                          <div key={pos.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                            <div>
                              <p className="font-medium text-foreground">{pos.name}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="secondary">Weight: {pos.rank}</Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive outline-none border-none hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => handleDeletePosition(pos.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
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
                        <Button size="sm" onClick={() => setApproveDialogId(req.id)} disabled={approveMutation.isPending}>
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

      {/* Approve Dialog */}
      <Dialog open={approveDialogId !== null} onOpenChange={(open) => !open && setApproveDialogId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Join Request</DialogTitle>
            <DialogDescription>
              Assign the new member to a specific unit, position, and role within the organization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Unit</Label>
              <Select value={selectedApproveUnit} onValueChange={setSelectedApproveUnit}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a unit" />
                </SelectTrigger>
                <SelectContent>
                  {realUnits?.map((unit: any) => (
                    <SelectItem key={unit.id} value={unit.id.toString()}>{unit.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Position</Label>
              <Select value={selectedApprovePosition} onValueChange={setSelectedApprovePosition}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a position" />
                </SelectTrigger>
                <SelectContent>
                  {realPositions?.map((pos: any) => (
                    <SelectItem key={pos.id} value={pos.id.toString()}>{pos.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={selectedApproveRole} onValueChange={setSelectedApproveRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Member">Member</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogId(null)}>Cancel</Button>
            <Button
              onClick={handleApproveConfirm}
              disabled={!selectedApproveUnit || !selectedApprovePosition || approveMutation.isPending}
            >
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrganization;
