import { useState, useEffect } from "react";
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
  Star,
  Save,
  Send,
  Loader2
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
import { useToast } from "@/components/ui/use-toast";
import {
  DialogDescription,
} from "@/components/ui/dialog";

import {
  useForms, useCreateForm, useDeleteForm, useDuplicateForm, usePublishForm,
  useFormQuestions, useCreateQuestions, useUpdateQuestion, useDeleteQuestion,
  useFormRules, useCreateRule, useDeleteRule, useGenerateAssignments,
  type EvaluationForm, type Question, type AssignmentRule
} from "@/hooks/useEvaluations";
import {
  useOrganizationUnits, usePositionTypes,
  type OrganizationUnit, type PositionType
} from "@/hooks/useOrganizations";
import { useOrganizationState } from "@/contexts/OrganizationContext";

const questionTypes = [
  { id: "rating", name: "Rating Scale", icon: Star, description: "Numeric rating boundaries" },
  { id: "number", name: "Numeric Input", icon: ListOrdered, description: "Specific number value" },
  { id: "text", name: "Short Text", icon: Type, description: "Single line answer" },
  { id: "textarea", name: "Paragraph Response", icon: AlignLeft, description: "Detailed text answer" },
];

const AdminFormBuilder = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("forms");

  // Create Form State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newFormTitle, setNewFormTitle] = useState("");
  const [newFormDesc, setNewFormDesc] = useState("");
  const [newFormType, setNewFormType] = useState<"self" | "peer" | "supervisor" | "360">("peer");

  // Selected Form State
  const [selectedForm, setSelectedForm] = useState<EvaluationForm | null>(null);

  // Active organization
  const { activeOrganizationId } = useOrganizationState();

  // Questions State
  const [localQuestions, setLocalQuestions] = useState<Partial<Question>[]>([]);

  // API Hooks
  const { data: forms = [], isLoading: formsLoading } = useForms();
  const createFormMutation = useCreateForm();
  const deleteFormMutation = useDeleteForm();
  const duplicateFormMutation = useDuplicateForm();
  const publishFormMutation = usePublishForm();

  const { data: formQuestions = [], isLoading: questionsLoading, refetch: refetchQuestions } = useFormQuestions(selectedForm?.id || 0);
  const createQuestionsMutation = useCreateQuestions();
  const updateQuestionMutation = useUpdateQuestion();
  const deleteQuestionMutation = useDeleteQuestion();

  // Assignment Rules hooks
  const { data: formRules = [], isLoading: rulesLoading } = useFormRules(selectedForm?.id || 0);
  const createRuleMutation = useCreateRule();
  const deleteRuleMutation = useDeleteRule();
  const generateMutation = useGenerateAssignments();

  // Organization structure (for rule builder dropdowns)
  const { data: units = [] } = useOrganizationUnits();
  const { data: positions = [] } = usePositionTypes();

  // Rule builder state
  const [newRule, setNewRule] = useState<{
    evaluator_unit: number | null;
    evaluator_position: number | null;
    evaluatee_unit: number | null;
    evaluatee_position: number | null;
    exclude_self: boolean;
  }>({
    evaluator_unit: null,
    evaluator_position: null,
    evaluatee_unit: null,
    evaluatee_position: null,
    exclude_self: true,
  });

  // Load questions when form selected
  // NOTE: intentionally omit `formQuestions` from deps — React Query returns a new array
  // reference on every render, which would cause an infinite setState loop.
  // We only want to sync on form/tab changes; the refetch after save handles fresh data.
  useEffect(() => {
    if (selectedForm && activeTab === 'builder') {
      setLocalQuestions(formQuestions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedForm?.id, activeTab]);


  const filteredForms = forms.filter(f =>
    f.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (is_published: boolean, is_active: boolean) => {
    if (is_published) return "bg-green-100 text-green-700";
    if (is_active) return "bg-blue-100 text-blue-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const getStatusText = (form: EvaluationForm) => {
    if (form.is_published) return "Published";
    if (form.is_active) return "Active";
    return "Draft";
  };

  // Form Actions
  const handleCreateForm = async () => {
    if (!newFormTitle) {
      toast({ title: "Validation Error", description: "Title is required", variant: "destructive" });
      return;
    }
    if (!activeOrganizationId) {
      toast({ title: "No Organization Selected", description: "Please select an organization first.", variant: "destructive" });
      return;
    }
    try {
      const res = await createFormMutation.mutateAsync({
        title: newFormTitle,
        description: newFormDesc,
        type: newFormType,
        organization_id: activeOrganizationId,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        is_active: true,
        is_published: false
      });
      setIsCreateOpen(false);
      setNewFormTitle("");
      setNewFormDesc("");
      toast({ title: "Form Created", description: "Successfully created new form." });

      setSelectedForm(res);
      setActiveTab("builder");
    } catch (e: unknown) {
      toast({ title: "Error Creating Form", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    }
  };

  const handleDeleteForm = async (id: number) => {
    if (confirm("Are you sure you want to delete this form?")) {
      try {
        await deleteFormMutation.mutateAsync(id);
        toast({ title: "Form Deleted" });
        if (selectedForm?.id === id) {
          setSelectedForm(null);
          setActiveTab("forms");
        }
      } catch (e: unknown) {
        toast({ title: "Error Deleting Form", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
      }
    }
  };

  const handleDuplicateForm = async (id: number) => {
    try {
      await duplicateFormMutation.mutateAsync(id);
      toast({ title: "Form Duplicated" });
    } catch (e: unknown) {
      toast({ title: "Error Duplicating Form", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    }
  };

  const handlePublishForm = async () => {
    if (!selectedForm) return;
    try {
      await publishFormMutation.mutateAsync(selectedForm.id);
      toast({ title: "Form Published", description: "This form can now be assigned." });
      setSelectedForm({ ...selectedForm, is_published: true });
    } catch (e: unknown) {
      toast({ title: "Error Publishing Form", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    }
  };

  // Assignment Rule Actions
  const handleAddRule = async () => {
    if (!selectedForm) return;
    try {
      await createRuleMutation.mutateAsync({ form_id: selectedForm.id, ...newRule });
      setNewRule({ evaluator_unit: null, evaluator_position: null, evaluatee_unit: null, evaluatee_position: null, exclude_self: true });
      toast({ title: "Rule Added" });
    } catch (e: unknown) {
      toast({ title: "Error Adding Rule", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    }
  };

  const handleDeleteRule = async (rule: AssignmentRule) => {
    if (!selectedForm) return;
    try {
      await deleteRuleMutation.mutateAsync({ id: rule.id, form_id: selectedForm.id });
      toast({ title: "Rule Removed" });
    } catch (e: unknown) {
      toast({ title: "Error Removing Rule", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    }
  };

  const handleGenerateAssignments = async () => {
    if (!selectedForm) return;
    if (!confirm(`Generate assignments for "${selectedForm.title}" based on ${formRules.length} rule(s)? Existing assignments will not be duplicated.`)) return;
    try {
      const res = await generateMutation.mutateAsync(selectedForm.id);
      toast({ title: "Assignments Generated", description: res.message });
    } catch (e: unknown) {
      toast({ title: "Error Generating Assignments", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    }
  };

  const ruleLabel = (rule: AssignmentRule) => {
    const ev = `${rule.evaluator_unit_name ?? 'Any Unit'} / ${rule.evaluator_position_name ?? 'Any Position'}`;
    const ee = `${rule.evaluatee_unit_name ?? 'Any Unit'} / ${rule.evaluatee_position_name ?? 'Any Position'}`;
    return `[${ev}] → [${ee}]`;
  };

  // Question Actions
  const handleAddQuestion = (type: string) => {
    const nextOrder = localQuestions.length > 0 ? Math.max(...localQuestions.map(q => q.order || 0)) + 1 : 1;
    setLocalQuestions([...localQuestions, {
      text: "",
      input_type: type as Question['input_type'],
      order: nextOrder,
      weight: 1.0,
      is_required: true,
      min_value: (type === 'rating' || type === 'number') ? 1 : undefined,
      max_value: type === 'rating' ? 5 : (type === 'number' ? 100 : undefined),
    }]);
  };

  const handleRemoveQuestion = async (index: number) => {
    const qToRemove = localQuestions[index];
    if (qToRemove.id) {
      try {
        await deleteQuestionMutation.mutateAsync({ id: qToRemove.id, form_id: selectedForm!.id });
      } catch (e: unknown) {
        toast({ title: "Error Deleting Question", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
        return;
      }
    }
    const newQs = [...localQuestions];
    newQs.splice(index, 1);

    // Auto re-order
    const reordered = newQs.map((q, idx) => ({ ...q, order: idx + 1 }));
    setLocalQuestions(reordered);
    toast({ title: "Question Removed" });
  };

  const handleQuestionChange = <K extends keyof Question>(index: number, field: K, value: Question[K]) => {
    const newQs = [...localQuestions];
    newQs[index] = { ...newQs[index], [field]: value };
    setLocalQuestions(newQs);
  };

  const handleSaveDraft = async () => {
    if (!selectedForm) return;

    // Validate empty questions
    if (localQuestions.some(q => !q.text || q.text.trim() === '')) {
      toast({ title: "Validation Error", description: "Question text cannot be empty.", variant: "destructive" });
      return;
    }

    try {
      const newQuestions = localQuestions.filter(q => !q.id);
      const existingQuestions = localQuestions.filter(q => q.id);

      // Update existing linearly
      for (const q of existingQuestions) {
        if (q.id) {
          await updateQuestionMutation.mutateAsync({
            id: q.id,
            form_id: selectedForm.id,
            data: {
              text: q.text, order: q.order, weight: q.weight, input_type: q.input_type,
              is_required: q.is_required, min_value: q.min_value, max_value: q.max_value
            }
          });
        }
      }

      // Bulk create new questions
      if (newQuestions.length > 0) {
        await createQuestionsMutation.mutateAsync({
          form_id: selectedForm.id,
          questions: newQuestions.map(q => ({
            text: q.text, input_type: q.input_type, order: q.order, weight: q.weight,
            is_required: q.is_required, min_value: q.min_value, max_value: q.max_value
          }))
        });
      }

      toast({ title: "Draft Saved", description: "All questions have been saved successfully." });
      refetchQuestions();
    } catch (e: unknown) {
      toast({ title: "Error Saving", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    }
  };

  if (formsLoading) {
    return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Form Builder</h1>
          <p className="text-muted-foreground">Create and manage evaluation forms</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-hero text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Create Form
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Form</DialogTitle>
              <DialogDescription className="sr-only">
                Fill in the details below to create a new evaluation form.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Form Title</Label>
                <Input
                  placeholder="e.g., Mid-Year Peer Evaluation"
                  value={newFormTitle}
                  onChange={(e) => setNewFormTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Brief description of this evaluation form..."
                  value={newFormDesc}
                  onChange={(e) => setNewFormDesc(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Evaluation Type</Label>
                <Select value={newFormType} onValueChange={(val: "self" | "peer" | "supervisor" | "360") => setNewFormType(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="peer">Peer Evaluation</SelectItem>
                    <SelectItem value="executive">Executive Evaluation</SelectItem>
                    <SelectItem value="self">Self-Assessment</SelectItem>
                    <SelectItem value="360">360-Degree Evaluation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleCreateForm} disabled={createFormMutation.isPending}>
                {createFormMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create Form
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="forms">All Forms</TabsTrigger>
          <TabsTrigger value="builder" disabled={!selectedForm}>Form Editor {selectedForm && `(${selectedForm.title})`}</TabsTrigger>
          <TabsTrigger value="assignments" disabled={!selectedForm}>Assignments {selectedForm && formRules.length > 0 && `(${formRules.length} rule${formRules.length !== 1 ? 's' : ''})`}</TabsTrigger>
        </TabsList>

        <TabsContent value="forms" className="space-y-4 pt-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search forms..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

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
                        <CardTitle className="text-base truncate max-w-[180px]" title={form.title}>{form.title}</CardTitle>
                        <Badge variant="outline" className="mt-1 capitalize">{form.type}</Badge>
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
                        <DropdownMenuItem onClick={() => handleDuplicateForm(form.id)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteForm(form.id)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(form.is_published, form.is_active)}`}>
                      {getStatusText(form)}
                    </span>
                    {/* Questions count would ideally come from a sub-query or an aggregation field from the backend */}
                    <span className="text-muted-foreground text-xs">ID: #{form.id}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span>Created: {new Date(form.created_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredForms.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                No forms found. Create your first form to get started.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="builder" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Question Types Panel */}
            <Card className="lg:col-span-1 h-fit sticky top-4">
              <CardHeader>
                <CardTitle className="text-base">Add Question Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {questionTypes.map((type) => (
                  <div
                    key={type.id}
                    onClick={() => handleAddQuestion(type.id)}
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {selectedForm?.title}
                        {selectedForm?.is_published && <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Published</Badge>}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{selectedForm?.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleSaveDraft} disabled={selectedForm?.is_published}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Draft
                      </Button>
                      {!selectedForm?.is_published && (
                        <Button className="gradient-hero text-primary-foreground" onClick={handlePublishForm}>
                          <Send className="w-4 h-4 mr-2" />
                          Publish
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {questionsLoading ? (
                    <div className="p-8 text-center text-muted-foreground animate-pulse">Loading questions...</div>
                  ) : localQuestions.map((question, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card hover:shadow-sm transition-shadow relative group"
                    >
                      <div className="cursor-move text-muted-foreground hover:text-foreground mt-2">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {questionTypes.find(t => t.id === question.input_type)?.name || question.input_type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">Order: {question.order}</span>
                          {!question.id && <Badge variant="outline" className="text-xs text-blue-600 border-blue-200 bg-blue-50">Unsaved</Badge>}
                        </div>

                        <div className="grid gap-2">
                          <Label>Question Text</Label>
                          <Input
                            value={question.text}
                            onChange={(e) => handleQuestionChange(idx, 'text', e.target.value)}
                            placeholder="Type your question here..."
                            disabled={selectedForm?.is_published}
                          />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/30 p-3 rounded-md">
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Weight</Label>
                            <Input
                              type="number" step="0.5"
                              value={question.weight}
                              onChange={(e) => handleQuestionChange(idx, 'weight', parseFloat(e.target.value))}
                              disabled={selectedForm?.is_published}
                            />
                          </div>
                          {(question.input_type === 'rating' || question.input_type === 'number') && (
                            <>
                              <div>
                                <Label className="text-xs text-muted-foreground mb-1 block">Min Value</Label>
                                <Input
                                  type="number"
                                  value={question.min_value}
                                  onChange={(e) => handleQuestionChange(idx, 'min_value', parseInt(e.target.value))}
                                  disabled={selectedForm?.is_published}
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground mb-1 block">Max Value</Label>
                                <Input
                                  type="number"
                                  value={question.max_value}
                                  onChange={(e) => handleQuestionChange(idx, 'max_value', parseInt(e.target.value))}
                                  disabled={selectedForm?.is_published}
                                />
                              </div>
                            </>
                          )}
                          <div className="flex items-center pt-5 pl-2">
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                checked={question.is_required}
                                onChange={(e) => handleQuestionChange(idx, 'is_required', e.target.checked)}
                                disabled={selectedForm?.is_published}
                                className="rounded border-gray-300 text-primary shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                              />
                              Required Field
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => handleRemoveQuestion(idx)} disabled={selectedForm?.is_published}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {localQuestions.length === 0 && !questionsLoading && (
                    <div className="py-12 text-center border-2 border-dashed border-border rounded-lg text-muted-foreground">
                      No questions yet. Click a question type on the left to add one.
                    </div>
                  )}

                  {!selectedForm?.is_published && (
                    <div className="bg-blue-50/50 text-blue-800 text-sm p-3 rounded border border-blue-100 flex items-start gap-2">
                      <Loader2 className="w-4 h-4 mt-0.5 text-blue-500" />
                      <p>Remember to click <strong>Save Draft</strong> after making changes to questions.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── Assignments Tab ── */}
        <TabsContent value="assignments" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assignment Rules for: {selectedForm?.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Define who evaluates whom. Each rule cross-matches all matching evaluators with all matching evaluatees.
                Leave a field blank to match <em>any</em> unit or position.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Rule Builder */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-lg border border-border">
                {/* Evaluator Side */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Evaluator (Who evaluates)</p>
                  <div className="space-y-2">
                    <Label className="text-xs">Organization Unit</Label>
                    <Select
                      value={newRule.evaluator_unit?.toString() ?? "__any_unit__"}
                      onValueChange={(v) => setNewRule(r => ({ ...r, evaluator_unit: v === '__any_unit__' ? null : parseInt(v) }))}
                    >
                      <SelectTrigger><SelectValue placeholder="Any unit" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__any_unit__">Any unit</SelectItem>
                        {(units as OrganizationUnit[]).map(u => <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Position</Label>
                    <Select
                      value={newRule.evaluator_position?.toString() ?? "__any_pos__"}
                      onValueChange={(v) => setNewRule(r => ({ ...r, evaluator_position: v === '__any_pos__' ? null : parseInt(v) }))}
                    >
                      <SelectTrigger><SelectValue placeholder="Any position" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__any_pos__">Any position</SelectItem>
                        {(positions as PositionType[]).map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Evaluatee Side */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Evaluatee (Who gets evaluated)</p>
                  <div className="space-y-2">
                    <Label className="text-xs">Organization Unit</Label>
                    <Select
                      value={newRule.evaluatee_unit?.toString() ?? "__any_unit__"}
                      onValueChange={(v) => setNewRule(r => ({ ...r, evaluatee_unit: v === '__any_unit__' ? null : parseInt(v) }))}
                    >
                      <SelectTrigger><SelectValue placeholder="Any unit" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__any_unit__">Any unit</SelectItem>
                        {(units as OrganizationUnit[]).map(u => <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Position</Label>
                    <Select
                      value={newRule.evaluatee_position?.toString() ?? "__any_pos__"}
                      onValueChange={(v) => setNewRule(r => ({ ...r, evaluatee_position: v === '__any_pos__' ? null : parseInt(v) }))}
                    >
                      <SelectTrigger><SelectValue placeholder="Any position" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__any_pos__">Any position</SelectItem>
                        {(positions as PositionType[]).map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Exclude Self + Add Button */}
                <div className="md:col-span-2 flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newRule.exclude_self}
                      onChange={(e) => setNewRule(r => ({ ...r, exclude_self: e.target.checked }))}
                      className="rounded border-gray-300 text-primary"
                    />
                    Exclude self-evaluation (evaluator ≠ evaluatee)
                  </label>
                  <Button onClick={handleAddRule} disabled={createRuleMutation.isPending}>
                    {createRuleMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    Add Rule
                  </Button>
                </div>
              </div>

              {/* Saved Rules List */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Saved Rules {formRules.length > 0 && <span className="text-muted-foreground">({formRules.length})</span>}</p>
                {rulesLoading && <div className="text-muted-foreground text-sm animate-pulse">Loading rules...</div>}
                {!rulesLoading && formRules.length === 0 && (
                  <div className="py-6 text-center border-2 border-dashed border-border rounded-lg text-muted-foreground text-sm">
                    No rules yet. Add one above to define who evaluates whom.
                  </div>
                )}
                {formRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <p className="text-sm font-mono">{ruleLabel(rule)}</p>
                      {rule.exclude_self && <Badge variant="outline" className="text-xs">No self-eval</Badge>}
                    </div>
                    <Button
                      variant="ghost" size="icon"
                      className="text-destructive h-8 w-8"
                      onClick={() => handleDeleteRule(rule)}
                      disabled={deleteRuleMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Generate Button */}
              {formRules.length > 0 && (
                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Applies {formRules.length} rule(s) to generate concrete person-to-person assignments.
                    Existing assignments are never duplicated.
                  </p>
                  <Button
                    className="gradient-hero text-primary-foreground"
                    onClick={handleGenerateAssignments}
                    disabled={generateMutation.isPending}
                  >
                    {generateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                    Generate Assignments
                  </Button>
                </div>
              )}

            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default AdminFormBuilder;
