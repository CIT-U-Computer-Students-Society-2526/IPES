import { useState } from "react";
import {
  Users,
  Search,
  MoreHorizontal,
  Shield,
  ShieldCheck,
  UserCheck,
  Settings2,
  UserPlus,
  UserMinus,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { useUsers, useCurrentUser, type User } from "@/hooks/useUsers";

// Organization unit options
const ORGANIZATION_UNITS = [
  { value: "executive", label: "Executive Committee" },
  { value: "legislative", label: "Legislative Council" },
  { value: "academics", label: "Committee on Academics" },
  { value: "finance", label: "Committee on Finance" },
  { value: "external", label: "Committee on External Affairs" },
  { value: "internal", label: "Committee on Internal Affairs" },
];

// Position options
const POSITIONS = [
  { value: "president", label: "President" },
  { value: "vp", label: "Vice President" },
  { value: "chair", label: "Chairperson" },
  { value: "secretary", label: "Secretary" },
  { value: "treasurer", label: "Treasurer" },
  { value: "member", label: "Member" },
];

import { useOrganizationState } from "@/contexts/OrganizationContext";
import { useUpdateMembership, useOrganizationUnits, usePositionTypes } from "@/hooks/useOrganizations";

const AdminUsers = () => {
  const { activeOrganizationId } = useOrganizationState();

  // Fetch logged in user profile to evaluate Head Admin status
  const { data: currentUserProfile } = useCurrentUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isManageMembershipOpen, setIsManageMembershipOpen] = useState(false);
  const [formData, setFormData] = useState({
    unit_id: undefined as number | undefined,
    position_id: undefined as number | undefined,
  });

  const { toast } = useToast();

  // Fetch users from API (Filtered by Organization ID)
  const { data: users, isLoading, error, refetch } = useUsers({ organization_id: activeOrganizationId });
  const { data: units } = useOrganizationUnits(activeOrganizationId);
  const { data: positions } = usePositionTypes(activeOrganizationId);

  // Mutations
  const updateMembership = useUpdateMembership();

  // Filter users
  const filteredUsers = users?.filter((user: User) => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    // Determine the user's role in the active organization
    const activeMembership = user.memberships?.find(m => m.organization_id === activeOrganizationId);
    const userRole = activeMembership ? activeMembership.role : "Member";

    const matchesRole = roleFilter === "all" || userRole.toLowerCase() === roleFilter;
    return matchesSearch && matchesRole;
  }) || [];

  // Calculate stats
  const stats = {
    total: filteredUsers.length || 0,
    admins: filteredUsers.filter((u: User) => u.memberships?.some(m => m.organization_id === activeOrganizationId && m.role === 'Admin')).length || 0,
    officers: filteredUsers.filter((u: User) => !u.memberships?.some(m => m.organization_id === activeOrganizationId && m.role === 'Admin')).length || 0,
    active: filteredUsers.filter((u: User) => u.is_active).length || 0,
  };

  // Calculate logged in user's rank status
  const currentUserMembership = currentUserProfile?.memberships?.find(m => m.organization_id === activeOrganizationId);
  const isHeadAdmin = currentUserMembership?.position_rank === 1;

  // Handle unit and position updates
  const handleUpdateMembership = async () => {
    if (!selectedUser) return;

    const membership = selectedUser.memberships?.find(m => m.organization_id === activeOrganizationId);
    if (!membership) return;

    try {
      await updateMembership.mutateAsync({
        id: membership.id,
        data: {
          unit_id: formData.unit_id,
          position_id: formData.position_id
        }
      });
      toast({
        title: "Success",
        description: "Membership updated successfully",
      });
      setIsManageMembershipOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update membership",
        variant: "destructive",
      });
    }
  };

  // Handle granting or revoking privileges
  const handleToggleAdminStatus = async (user: User) => {
    const membership = user.memberships?.find(m => m.organization_id === activeOrganizationId);
    if (!membership) return;

    const isCurrentlyAdmin = membership.role === 'Admin';

    if (isCurrentlyAdmin && !isHeadAdmin) {
      toast({
        title: "Permission Denied",
        description: "Only the Head Administrator can revoke Admin privileges.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateMembership.mutateAsync({
        id: membership.id,
        data: { role: isCurrentlyAdmin ? 'Member' : 'Admin' }
      });
      toast({
        title: "Success",
        description: `Admin privileges ${isCurrentlyAdmin ? "revoked" : "granted"} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update privileges",
        variant: "destructive",
      });
    }
  };

  // Handle removal from org
  const handleRemoveFromOrganization = async (user: User) => {
    const membership = user.memberships?.find(m => m.organization_id === activeOrganizationId);
    if (!membership) return;

    if (confirm(`Are you sure you want to remove ${user.first_name} ${user.last_name} from the organization?`)) {
      try {
        await updateMembership.mutateAsync({
          id: membership.id,
          data: { is_active: false }
        });
        toast({
          title: "Success",
          description: "User removed from organization",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to remove user",
          variant: "destructive",
        });
      }
    }
  };
  const StatsSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div>
                <Skeleton className="h-8 w-12 mb-1" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Loading skeleton for table
  const TableSkeleton = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Login</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[1, 2, 3, 4, 5].map((i) => (
          <TableRow key={i}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            </TableCell>
            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
            <TableCell><Skeleton className="h-6 w-16" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Organization Members</h1>
          <p className="text-muted-foreground">Manage system users currently enrolled in your organization.</p>
        </div>
      </div>

      {/* Stats */}
      {isLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.admins}</p>
                  <p className="text-sm text-muted-foreground">Admins</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.officers}</p>
                  <p className="text-sm text-muted-foreground">Officers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.active}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <div className="text-center py-4">
              <p className="text-destructive">Failed to load users</p>
              <Button variant="outline" onClick={() => refetch()} className="mt-2">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>All Users</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="officer">Officer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <p className="text-muted-foreground">No users found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {user.first_name[0]}{user.last_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.memberships?.some(m => m.organization_id === activeOrganizationId && m.role === 'Admin') ? "default" : "secondary"}>
                          {user.memberships?.some(m => m.organization_id === activeOrganizationId && m.role === 'Admin') && <Shield className="w-3 h-3 mr-1" />}
                          {user.memberships?.some(m => m.organization_id === activeOrganizationId && m.role === 'Admin') ? "Admin" : "Member"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.memberships?.find(m => m.organization_id === activeOrganizationId)?.is_active ? "outline" : "secondary"}
                          className={user.memberships?.find(m => m.organization_id === activeOrganizationId)?.is_active ? "text-green-600 border-green-600" : ""}
                        >
                          {user.memberships?.find(m => m.organization_id === activeOrganizationId)?.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {user.memberships?.find(m => m.organization_id === activeOrganizationId)?.unit_name || "Unassigned"}
                        <br />
                        <span className="text-xs">{user.memberships?.find(m => m.organization_id === activeOrganizationId)?.position_name}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedUser(user);
                              const membership = user.memberships?.find(m => m.organization_id === activeOrganizationId);
                              setFormData({
                                unit_id: membership?.unit_id,
                                position_id: membership?.position_id
                              });
                              setIsManageMembershipOpen(true);
                            }}>
                              <Settings2 className="w-4 h-4 mr-2" />
                              Manage Membership
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleAdminStatus(user)}>
                              {user.memberships?.find(m => m.organization_id === activeOrganizationId)?.role === 'Admin' ? (
                                <>
                                  <UserMinus className="w-4 h-4 mr-2" />
                                  <span className={!isHeadAdmin ? "opacity-50" : ""}>Revoke Admin Privileges</span>
                                </>
                              ) : (
                                <>
                                  <UserPlus className="w-4 h-4 mr-2" />
                                  Grant Admin Privileges
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleRemoveFromOrganization(user)}
                            >
                              <AlertTriangle className="w-4 h-4 mr-2" />
                              Remove from Organization
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Manage Membership Dialog */}
      <Dialog open={isManageMembershipOpen} onOpenChange={setIsManageMembershipOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Membership: {selectedUser?.first_name} {selectedUser?.last_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Organization Unit</Label>
              <Select
                value={formData.unit_id?.toString() || ""}
                onValueChange={(value) => setFormData(prev => ({ ...prev, unit_id: value ? parseInt(value) : undefined }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit..." />
                </SelectTrigger>
                <SelectContent>
                  {units?.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id.toString()}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Position</Label>
              <Select
                value={formData.position_id?.toString() || ""}
                onValueChange={(value) => setFormData(prev => ({ ...prev, position_id: value ? parseInt(value) : undefined }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position..." />
                </SelectTrigger>
                <SelectContent>
                  {positions?.map((pos) => (
                    <SelectItem key={pos.id} value={pos.id.toString()}>
                      {pos.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsManageMembershipOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateMembership} disabled={updateMembership.isPending}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
