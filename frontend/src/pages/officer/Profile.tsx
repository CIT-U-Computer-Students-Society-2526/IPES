import { User, Mail, Building2, Calendar, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const OfficerProfile = () => {
  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-description">View and manage your account information</p>
      </div>

      {/* Profile Card */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-2xl font-semibold text-primary">JD</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Juan Dela Cruz</h2>
            <p className="text-muted-foreground">Committee Head</p>
            <p className="text-sm text-muted-foreground mt-1">Research Committee</p>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              Full Name
            </Label>
            <Input id="name" value="Juan Dela Cruz" readOnly className="bg-muted/50" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              Email Address
            </Label>
            <Input id="email" value="juan.delacruz@organization.edu" readOnly className="bg-muted/50" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="unit" className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              Organization Unit
            </Label>
            <Input id="unit" value="Research Committee" readOnly className="bg-muted/50" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="term" className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              Current Term
            </Label>
            <Input id="term" value="A.Y. 2025-2026" readOnly className="bg-muted/50" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="role" className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              System Role
            </Label>
            <Input id="role" value="Officer" readOnly className="bg-muted/50" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold text-foreground mb-4">Account Actions</h3>
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            Change Password
          </Button>
          <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
            Sign Out of All Devices
          </Button>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground text-center">
          To update your profile information, please contact your organization administrator.
        </p>
      </div>
    </div>
  );
};

export default OfficerProfile;
