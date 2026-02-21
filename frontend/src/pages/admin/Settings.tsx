import { useState } from "react";
import { 
  Settings, 
  Save,
  Calendar,
  Eye,
  EyeOff,
  Bell,
  Shield,
  Database,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    evaluationPeriodStart: "2024-01-01",
    evaluationPeriodEnd: "2024-06-30",
    allowSelfEvaluation: true,
    showRankings: false,
    anonymousFeedback: true,
    requireProofForAccomplishments: true,
    autoReminders: true,
    reminderDaysBefore: "3",
    allowResultsViewing: true,
    resultsVisibleAfterClose: true,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Settings</h1>
          <p className="text-muted-foreground">Configure evaluation system behavior</p>
        </div>
        <Button className="gradient-hero text-primary-foreground">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
          <TabsTrigger value="visibility">Visibility</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          {/* Evaluation Period */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <CardTitle>Evaluation Period</CardTitle>
              </div>
              <CardDescription>
                Set the active evaluation period for the current term
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input 
                    type="date" 
                    value={settings.evaluationPeriodStart}
                    onChange={(e) => setSettings({ ...settings, evaluationPeriodStart: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input 
                    type="date" 
                    value={settings.evaluationPeriodEnd}
                    onChange={(e) => setSettings({ ...settings, evaluationPeriodEnd: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Current Term</Label>
                <Select defaultValue="2024-2025">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024-2025">2024-2025</SelectItem>
                    <SelectItem value="2023-2024">2023-2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Organization Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                <CardTitle>Organization Information</CardTitle>
              </div>
              <CardDescription>
                Basic organization details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Organization Name</Label>
                <Input defaultValue="University Student Council" />
              </div>
              <div className="space-y-2">
                <Label>Short Name / Acronym</Label>
                <Input defaultValue="USC" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluation" className="space-y-6">
          {/* Evaluation Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <CardTitle>Evaluation Rules</CardTitle>
              </div>
              <CardDescription>
                Configure how evaluations work
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Self-Evaluation</Label>
                  <p className="text-sm text-muted-foreground">
                    Officers can evaluate themselves
                  </p>
                </div>
                <Switch 
                  checked={settings.allowSelfEvaluation}
                  onCheckedChange={(checked) => setSettings({ ...settings, allowSelfEvaluation: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Anonymous Feedback</Label>
                  <p className="text-sm text-muted-foreground">
                    Text feedback is anonymous to evaluatees
                  </p>
                </div>
                <Switch 
                  checked={settings.anonymousFeedback}
                  onCheckedChange={(checked) => setSettings({ ...settings, anonymousFeedback: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Proof for Accomplishments</Label>
                  <p className="text-sm text-muted-foreground">
                    Officers must provide proof links for accomplishments
                  </p>
                </div>
                <Switch 
                  checked={settings.requireProofForAccomplishments}
                  onCheckedChange={(checked) => setSettings({ ...settings, requireProofForAccomplishments: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visibility" className="space-y-6">
          {/* Visibility Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                <CardTitle>Results Visibility</CardTitle>
              </div>
              <CardDescription>
                Control what officers can see
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Rankings</Label>
                  <p className="text-sm text-muted-foreground">
                    Display officer rankings based on scores
                  </p>
                </div>
                <Switch 
                  checked={settings.showRankings}
                  onCheckedChange={(checked) => setSettings({ ...settings, showRankings: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Results Viewing</Label>
                  <p className="text-sm text-muted-foreground">
                    Officers can view their own evaluation results
                  </p>
                </div>
                <Switch 
                  checked={settings.allowResultsViewing}
                  onCheckedChange={(checked) => setSettings({ ...settings, allowResultsViewing: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Results Visible After Period Close</Label>
                  <p className="text-sm text-muted-foreground">
                    Only show results after evaluation period ends
                  </p>
                </div>
                <Switch 
                  checked={settings.resultsVisibleAfterClose}
                  onCheckedChange={(checked) => setSettings({ ...settings, resultsVisibleAfterClose: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                <CardTitle>Notification Settings</CardTitle>
              </div>
              <CardDescription>
                Configure system notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Automatic Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Send email reminders for pending evaluations
                  </p>
                </div>
                <Switch 
                  checked={settings.autoReminders}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoReminders: checked })}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Reminder Days Before Deadline</Label>
                <Select 
                  value={settings.reminderDaysBefore}
                  onValueChange={(value) => setSettings({ ...settings, reminderDaysBefore: value })}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="2">2 days</SelectItem>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="5">5 days</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Email Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                <CardTitle>Email Configuration</CardTitle>
              </div>
              <CardDescription>
                Email notification settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>From Email Address</Label>
                <Input defaultValue="noreply@ipes.university.edu" />
              </div>
              <div className="space-y-2">
                <Label>Reply-To Email</Label>
                <Input defaultValue="support@ipes.university.edu" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
