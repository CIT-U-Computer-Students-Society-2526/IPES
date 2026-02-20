import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Building } from "lucide-react";

const OfficerProfilePreview = () => {
    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Profile Settings (Preview)</h1>
                    <p className="text-muted-foreground">Manage your account information</p>
                </div>
                <Button disabled>Save Changes</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>First Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input value="Juan" disabled className="pl-9" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Last Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input value="Dela Cruz" disabled className="pl-9" />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input value="juan.delacruz@cit.edu" disabled className="pl-9" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Organization Unit</Label>
                        <div className="relative">
                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input value="Executive Committee (Officer)" disabled className="pl-9" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default OfficerProfilePreview;
