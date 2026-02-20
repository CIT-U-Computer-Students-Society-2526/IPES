import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

const AdminSettingsPreview = () => {
    return (
        <div className="max-w-4xl space-y-6 animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">Platform Settings (Preview)</h1>
                <p className="page-description">Manage global platform configurations</p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Academic Term Configuration</CardTitle>
                        <CardDescription>Set the active grading period globally</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Current Semester</Label>
                                <Input value="First Semester, 2026-2027" disabled />
                            </div>
                            <div className="space-y-2">
                                <Label>Evaluation Lock Date</Label>
                                <Input type="date" value="2026-12-15" disabled />
                            </div>
                        </div>
                        <Button disabled>Save Changes</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>System Preferences</CardTitle>
                        <CardDescription>Toggle global feature access</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Allow Late Submissions</Label>
                                <p className="text-sm text-muted-foreground">Enable officers to submit after deadlines with a tag</p>
                            </div>
                            <Switch checked={false} disabled />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Notify on Accomplishment Updates</Label>
                                <p className="text-sm text-muted-foreground">Send an email when accomplishments are approved</p>
                            </div>
                            <Switch checked={true} disabled />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminSettingsPreview;
