import { useState } from "react";
import { 
  FileEdit, 
  Plus, 
  Search, 
  MoreHorizontal,
  Copy,
  Edit,
  Trash2,
  Eye,
  GripVertical,
  Type,
  ListOrdered,
  AlignLeft,
  ToggleLeft,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const forms = [
  { 
    id: 1, 
    title: "Peer Evaluation Form", 
    type: "Peer",
    status: "Published",
    questions: 15,
    responses: 124,
    lastModified: "2024-01-10"
  },
  { 
    id: 2, 
    title: "Executive Evaluation Form", 
    type: "Executive",
    status: "Published",
    questions: 20,
    responses: 48,
    lastModified: "2024-01-08"
  },
  { 
    id: 3, 
    title: "Self-Assessment Form", 
    type: "Self",
    status: "Draft",
    questions: 12,
    responses: 0,
    lastModified: "2024-01-12"
  },
  { 
    id: 4, 
    title: "Committee Cross-Evaluation", 
    type: "Cross",
    status: "Published",
    questions: 18,
    responses: 67,
    lastModified: "2024-01-05"
  },
];

const sampleQuestions = [
  { id: 1, text: "How would you rate this officer's leadership skills?", type: "rating", category: "Leadership", weight: 2 },
  { id: 2, text: "How effectively does this officer communicate with team members?", type: "rating", category: "Communication", weight: 1.5 },
  { id: 3, text: "Rate the officer's ability to meet deadlines and deliverables.", type: "rating", category: "Reliability", weight: 2 },
  { id: 4, text: "How well does this officer collaborate with others?", type: "rating", category: "Teamwork", weight: 1.5 },
  { id: 5, text: "What are this officer's key strengths?", type: "text", category: "Feedback", weight: 1 },
  { id: 6, text: "What areas could this officer improve on?", type: "text", category: "Feedback", weight: 1 },
];

const questionTypes = [
  { id: "rating", name: "Rating Scale", icon: Star, description: "1-5 star rating" },
  { id: "text", name: "Text Response", icon: AlignLeft, description: "Open-ended answer" },
  { id: "multiple", name: "Multiple Choice", icon: ListOrdered, description: "Select one option" },
  { id: "boolean", name: "Yes/No", icon: ToggleLeft, description: "Binary choice" },
];

const AdminFormBuilder = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedForm, setSelectedForm] = useState<typeof forms[0] | null>(null);
  const [activeTab, setActiveTab] = useState("forms");

  const filteredForms = forms.filter(form =>
    form.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Published": return "bg-green-100 text-green-700";
      case "Draft": return "bg-yellow-100 text-yellow-700";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Form Builder</h1>
          <p className="text-muted-foreground">Create and manage evaluation forms</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gradient-hero text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Create Form
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Form</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Form Title</Label>
                <Input placeholder="e.g., Mid-Year Peer Evaluation" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Brief description of this evaluation form..." />
              </div>
              <div className="space-y-2">
                <Label>Evaluation Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="peer">Peer Evaluation</SelectItem>
                    <SelectItem value="executive">Executive Evaluation</SelectItem>
                    <SelectItem value="self">Self-Assessment</SelectItem>
                    <SelectItem value="cross">Cross-Unit Evaluation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full">Create Form</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="forms">All Forms</TabsTrigger>
          <TabsTrigger value="builder">Form Editor</TabsTrigger>
        </TabsList>

        <TabsContent value="forms" className="space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search forms..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Forms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredForms.map((form) => (
              <Card key={form.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileEdit className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{form.title}</CardTitle>
                        <Badge variant="outline" className="mt-1">{form.type}</Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setSelectedForm(form); setActiveTab("builder"); }}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Form
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(form.status)}`}>
                      {form.status}
                    </span>
                    <span className="text-muted-foreground">{form.questions} questions</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
                    <span>{form.responses} responses</span>
                    <span>Modified {form.lastModified}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="builder" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Question Types Panel */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-base">Question Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {questionTypes.map((type) => (
                  <div 
                    key={type.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted cursor-pointer transition-colors"
                  >
                    <type.icon className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{type.name}</p>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Form Editor */}
            <div className="lg:col-span-3 space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedForm?.title || "Peer Evaluation Form"}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Drag questions to reorder</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline">Save Draft</Button>
                      <Button className="gradient-hero text-primary-foreground">Publish</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sampleQuestions.map((question, idx) => (
                    <div 
                      key={question.id}
                      className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card hover:shadow-sm transition-shadow"
                    >
                      <div className="cursor-move text-muted-foreground hover:text-foreground">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">{question.category}</Badge>
                          <Badge variant="secondary" className="text-xs">
                            {question.type === "rating" ? "Rating" : "Text"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">Weight: {question.weight}x</span>
                        </div>
                        <p className="text-sm text-foreground">{idx + 1}. {question.text}</p>
                        {question.type === "rating" && (
                          <div className="flex gap-2 mt-3">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <div key={n} className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-sm text-muted-foreground">
                                {n}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Question
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}

                  <Button variant="outline" className="w-full border-dashed">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminFormBuilder;
