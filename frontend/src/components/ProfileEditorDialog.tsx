import { useState, useEffect } from "react";
import { User, Mail, Building2, Shield, Save, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useCurrentUser, useCurrentMembership, useUpdateCurrentUser } from "@/hooks/useUsers";
import { toast } from "sonner";

export function ProfileEditorDialog({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const { data: user, isLoading: isUserLoading } = useCurrentUser();
    const { data: membership, isLoading: isMembershipLoading } = useCurrentMembership();
    const { mutate: updateProfile, isPending: isUpdating } = useUpdateCurrentUser();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
    });

    useEffect(() => {
        if (user && open) {
            setFormData({
                first_name: user.first_name || "",
                last_name: user.last_name || "",
            });
            setIsEditing(false); // Reset edit state when opening dialog
        }
    }, [user, open]);

    if (isUserLoading || isMembershipLoading || !user || !membership) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>{children}</DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    const initials = `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() || "U";
    const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email;

    const handleSave = () => {
        updateProfile(formData, {
            onSuccess: () => {
                toast.success("Profile updated successfully");
                setIsEditing(false);
            },
            onError: () => {
                toast.error("Failed to update profile");
            }
        });
    };

    const handleCancel = () => {
        setFormData({
            first_name: user.first_name || "",
            last_name: user.last_name || "",
        });
        setIsEditing(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>My Profile</DialogTitle>
                    <DialogDescription>
                        View and manage your account information.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-xl font-semibold text-primary">{initials}</span>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-foreground">{fullName}</h2>
                                <p className="text-sm text-muted-foreground">{membership.position_name}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{membership.unit_name}</p>
                            </div>
                        </div>
                        {!isEditing ? (
                            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                Edit
                            </Button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCancel} disabled={isUpdating}>
                                    <X className="w-4 h-4" />
                                </Button>
                                <Button size="sm" onClick={handleSave} disabled={isUpdating}>
                                    {isUpdating ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Save className="w-3 h-3 mr-2" />}
                                    Save
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="grid gap-4 py-4 border-t border-border/50">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="first_name" className="text-xs font-medium">
                                    First Name
                                </Label>
                                <Input
                                    id="first_name"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    readOnly={!isEditing}
                                    className={!isEditing ? "bg-muted/50 h-9" : "h-9"}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="last_name" className="text-xs font-medium">
                                    Last Name
                                </Label>
                                <Input
                                    id="last_name"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    readOnly={!isEditing}
                                    className={!isEditing ? "bg-muted/50 h-9" : "h-9"}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-xs font-medium flex items-center gap-1.5">
                                <Mail className="w-3 h-3 text-muted-foreground" />
                                Email Address
                            </Label>
                            <Input id="email" value={user.email} readOnly className="bg-muted/50 h-9" />
                            <p className="text-[10px] text-muted-foreground">Email address cannot be changed.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="unit" className="text-xs font-medium flex items-center gap-1.5">
                                    <Building2 className="w-3 h-3 text-muted-foreground" />
                                    Organization Unit
                                </Label>
                                <Input id="unit" value={membership.unit_name} readOnly className="bg-muted/50 h-9" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="role" className="text-xs font-medium flex items-center gap-1.5">
                                    <Shield className="w-3 h-3 text-muted-foreground" />
                                    System Role
                                </Label>
                                <Input id="role" value={membership.role} readOnly className="bg-muted/50 h-9" />
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
