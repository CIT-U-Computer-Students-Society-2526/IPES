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
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("forms");
  const [allForms, setAllForms] = useState(forms);
  
  // Builder state
  const [questions, setQuestions] = useState(sampleQuestions);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);

  const filteredForms = allForms.filter(form =>
    form.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      text: "New Evaluation Question",
      type: "rating",
      category: "Performance",
      weight: 1
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleDeleteQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleCreateForm = (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as any;
    const newForm = {
      id: Date.now(),
      title: target.title.value || "New Form",
      type: target.type.value || "Peer",
      status: "Draft",
      questions: 0,
      responses: 0,
      lastModified: new Date().toISOString().split('T')[0]
    };
    setAllForms([newForm, ...allForms]);
    setSelectedForm(newForm);
    setQuestions([]);
    setActiveTab("builder");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Published": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "Draft": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Form Designer</h1>
          <p className="text-muted-foreground">Architect evaluation rubrics and assessment tools</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              Intelligence Canvas
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>New Evaluation Blueprint</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateForm} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Form Title</Label>
                <Input id="title" name="title" placeholder="e.g., Mid-Year Peer Evaluation" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Strategic Objective</Label>
                <Textarea id="description" placeholder="What is the primary goal of this assessment?" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Evaluation Topology</Label>
                <Select name="type" defaultValue="peer">
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
              <Button type="submit" className="w-full">Initialize Builder</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted/50 p-1 border border-border">
          <TabsTrigger value="forms" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Catalog</TabsTrigger>
          <TabsTrigger value="builder" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Editor</TabsTrigger>
        </TabsList>

        <TabsContent value="forms" className="space-y-6 mt-6">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Filter forms..." 
              className="pl-10 h-11 bg-card border-border/50 focus:border-primary/50 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Forms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form) => (
              <Card key={form.id} className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <FileEdit className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold">{form.title}</CardTitle>
                        <Badge variant="outline" className="mt-1 font-normal opacity-70">{form.type}</Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setSelectedForm(form); setActiveTab("builder"); }}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Design
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          Live Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(form.status)}`}>
                      {form.status}
                    </span>
                    <span className="text-sm font-medium text-foreground/70">{form.questions} Rubrics</span>
                  </div>
                  <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    <span>{form.responses} Data Points</span>
                    <span>Mod: {form.lastModified}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="builder" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Tool Palette */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="border-border/50 bg-card/30">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Component Palette</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {questionTypes.map((type) => (
                    <div 
                      key={type.id}
                      onClick={handleAddQuestion}
                      className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-background hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all active:scale-95 shadow-sm"
                    >
                      <div className="p-2 rounded-lg bg-primary/10">
                        <type.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold tracking-tight">{type.name}</p>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground/60">{type.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              <Card className="bg-primary/5 border-primary/10">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-primary/70 uppercase mb-2">Editor Intelligence</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Changes are automatically staged. Click "Finalize Blueprint" to make this evaluation live for all participants.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Design Canvas */}
            <div className="lg:col-span-3 space-y-6">
              <Card className="border-primary/20 shadow-xl shadow-primary/5">
                <CardHeader className="border-b border-border/50 bg-muted/20 pb-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-bold uppercase">{selectedForm?.type || "Standard"}</Badge>
                        <span className="text-xs text-muted-foreground font-medium">• Draft Staged</span>
                      </div>
                      <CardTitle className="text-2xl tracking-tighter">{selectedForm?.title || "Evaluation Interface Designer"}</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="h-10 px-6">Stage Draft</Button>
                      <Button className="h-10 px-6 bg-primary text-primary-foreground shadow-lg shadow-primary/20">Finalize Blueprint</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6 bg-card/20">
                  {questions.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-border/50 rounded-2xl">
                      <div className="p-4 rounded-full bg-muted/50">
                        <Plus className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-foreground">Canvas is Empty</p>
                        <p className="text-sm text-muted-foreground">Select a component from the palette to begin architecting</p>
                      </div>
                    </div>
                  ) : (
                    questions.map((question, idx) => (
                      <div 
                        key={question.id}
                        className="group flex items-start gap-4 p-6 rounded-2xl border border-border/50 bg-background/80 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5 animate-fade-up"
                        style={{ animationDelay: `${idx * 0.05}s` }}
                      >
                        <div className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-primary transition-colors">
                          <GripVertical className="w-5 h-5" />
                        </div>
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-primary/50 tabular-nums">{String(idx + 1).padStart(2, '0')}</span>
                            <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider h-5">{question.category}</Badge>
                            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider h-5 opacity-60">
                              {question.type}
                            </Badge>
                            <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => handleDeleteQuestion(question.id)}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                <Copy className="w-4 h-4 text-muted-foreground" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <Input 
                              defaultValue={question.text} 
                              className="border-none p-0 h-auto text-lg font-semibold bg-transparent focus-visible:ring-0 placeholder:opacity-20"
                              placeholder="Enter rubric definition..."
                            />
                            {question.type === "rating" && (
                              <div className="flex gap-3 mt-6">
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <div key={n} className="flex flex-col items-center gap-2">
                                    <div className="w-10 h-10 rounded-xl border border-border/50 bg-muted/30 flex items-center justify-center text-sm font-bold text-muted-foreground transition-all group-hover:border-primary/20">
                                      {n}
                                    </div>
                                  </div>
                                ))}
                                <div className="ml-4 flex flex-col justify-center">
                                  <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Scaling Factor</span>
                                  <span className="text-xs font-bold text-foreground">Standard 1-5</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  <Button 
                    variant="outline" 
                    className="w-full h-16 border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 rounded-2xl transition-all"
                    onClick={handleAddQuestion}
                  >
                    <Plus className="w-5 h-5 mr-3 text-primary" />
                    <span className="font-bold text-primary">Append New Rubric Mechanism</span>
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
