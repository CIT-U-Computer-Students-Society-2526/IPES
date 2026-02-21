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
  UserPlus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const organizationData = {
  name: "University Student Council",
  term: "2024-2025",
  totalMembers: 48,
  activeUnits: 8,
};

const units = [
  { 
    id: 1, 
    name: "Executive Committee", 
    type: "Executive",
    members: 5, 
    head: "Maria Santos",
    positions: ["President", "Vice President", "Secretary", "Treasurer", "Auditor"]
  },
  { 
    id: 2, 
    name: "Legislative Council", 
    type: "Legislative",
    members: 12, 
    head: "Juan Dela Cruz",
    positions: ["Speaker", "Deputy Speaker", "Councilor"]
  },
  { 
    id: 3, 
    name: "Committee on Academics", 
    type: "Committee",
    members: 6, 
    head: "Ana Reyes",
    positions: ["Chairperson", "Vice Chairperson", "Member"]
  },
  { 
    id: 4, 
    name: "Committee on Finance", 
    type: "Committee",
    members: 5, 
    head: "Carlos Garcia",
    positions: ["Chairperson", "Vice Chairperson", "Member"]
  },
  { 
    id: 5, 
    name: "Committee on External Affairs", 
    type: "Committee",
    members: 6, 
    head: "Rosa Mendoza",
    positions: ["Chairperson", "Vice Chairperson", "Member"]
  },
  { 
    id: 6, 
    name: "Committee on Internal Affairs", 
    type: "Committee",
    members: 5, 
    head: "Pedro Lim",
    positions: ["Chairperson", "Vice Chairperson", "Member"]
  },
  { 
    id: 7, 
    name: "Committee on Sports & Recreation", 
    type: "Committee",
    members: 5, 
    head: "Luis Tan",
    positions: ["Chairperson", "Vice Chairperson", "Member"]
  },
  { 
    id: 8, 
    name: "Committee on Culture & Arts", 
    type: "Committee",
    members: 4, 
    head: "Elena Cruz",
    positions: ["Chairperson", "Vice Chairperson", "Member"]
  },
];

const positionTypes = [
  { id: 1, name: "President", level: "Executive", weight: 10 },
  { id: 2, name: "Vice President", level: "Executive", weight: 9 },
  { id: 3, name: "Secretary", level: "Executive", weight: 8 },
  { id: 4, name: "Treasurer", level: "Executive", weight: 8 },
  { id: 5, name: "Chairperson", level: "Committee", weight: 7 },
  { id: 6, name: "Vice Chairperson", level: "Committee", weight: 6 },
  { id: 7, name: "Member", level: "Committee", weight: 5 },
];

const AdminOrganization = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [allUnits, setAllUnits] = useState(units);
  const [allPositions, setAllPositions] = useState(positionTypes);

  const filteredUnits = allUnits.filter(unit =>
    unit.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateUnit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as any;
    const newUnit = {
      id: Date.now(),
      name: target.name.value,
      type: target.type.value,
      members: 0,
      head: "To be assigned",
      positions: ["Leader", "Member"]
    };
    setAllUnits([newUnit, ...allUnits]);
  };

  const handleAddPositionType = (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as any;
    const newPos = {
      id: Date.now(),
      name: target.name.value,
      level: target.level.value,
      weight: parseInt(target.weight.value) || 5
    };
    setAllPositions([newPos, ...allPositions]);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Organization Map</h1>
          <p className="text-muted-foreground">Manage the architectural topology of your governance units</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-11 px-6 border-border/50 bg-card/50 backdrop-blur-sm">
                <Plus className="w-4 h-4 mr-2" />
                Define Position
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Define New Position Template</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddPositionType} className="space-y-4 py-6">
                <div className="space-y-2">
                  <Label htmlFor="pos-name">Position Title</Label>
                  <Input id="pos-name" name="name" placeholder="e.g., Executive Director" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pos-level">Hierarchy Level</Label>
                  <Select name="level" defaultValue="committee">
                    <SelectTrigger id="pos-level">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="executive">Executive</SelectItem>
                      <SelectItem value="legislative">Legislative</SelectItem>
                      <SelectItem value="committee">Committee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pos-weight">Impact Factor (1-10)</Label>
                  <Input id="pos-weight" name="weight" type="number" min="1" max="10" placeholder="5" />
                </div>
                <Button type="submit" className="w-full h-11">Register Position Type</Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="h-11 px-6 bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4 mr-2" />
                Establish Unit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Establish Organizational Unit</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateUnit} className="space-y-4 py-6">
                <div className="space-y-2">
                  <Label htmlFor="unit-name">Unit Designation</Label>
                  <Input id="unit-name" name="name" placeholder="e.g., Department of Technology" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit-type">Operational Type</Label>
                  <Select name="type" defaultValue="committee">
                    <SelectTrigger id="unit-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="executive">Executive Branch</SelectItem>
                      <SelectItem value="legislative">Legislative Council</SelectItem>
                      <SelectItem value="committee">Action Committee</SelectItem>
                      <SelectItem value="commission">Regulatory Commission</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full h-11">Commence Unit Operations</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Units</p>
                <p className="text-2xl font-bold tabular-nums">{allUnits.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Force</p>
                <p className="text-2xl font-bold tabular-nums">{organizationData.totalMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Units Navigation */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Locate unit..." 
              className="pl-10 h-12 bg-card border-border/50 focus:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredUnits.map((unit) => (
              <Card 
                key={unit.id} 
                className={cn(
                  "group cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-primary/30",
                  selectedUnit?.id === unit.id ? 'ring-2 ring-primary border-transparent' : 'bg-card/40 border-border/50'
                )}
                onClick={() => setSelectedUnit(unit)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-sm",
                        selectedUnit?.id === unit.id ? 'bg-primary text-primary-foreground' : 'bg-muted group-hover:bg-primary/10 group-hover:text-primary text-muted-foreground'
                      )}>
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold tracking-tight text-foreground">{unit.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                          <span className="font-medium text-foreground/70 decoration-primary/30 underline underline-offset-4">{unit.head}</span>
                          <span className="text-muted-foreground/30">•</span>
                          <span>{unit.members} Personnel</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 font-bold uppercase text-[10px] px-3">
                        {unit.type}
                      </Badge>
                      <ChevronRight className={cn(
                        "w-5 h-5 transition-transform",
                        selectedUnit?.id === unit.id ? 'translate-x-1 text-primary' : 'text-muted-foreground/30'
                      )} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Dynamic Detail Inspector */}
        <div className="space-y-6">
          {selectedUnit ? (
            <Card className="border-primary/20 shadow-xl shadow-primary/5 bg-card sticky top-6">
              <CardHeader className="pb-6 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest">{selectedUnit.type}</Badge>
                    <CardTitle className="text-xl tracking-tight">{selectedUnit.name}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-xl">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="gap-2">
                        <Edit className="w-4 h-4" /> Edit Parameters
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <UserPlus className="w-4 h-4" /> Manifest Registry
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive gap-2">
                        <Trash2 className="w-4 h-4" /> Decommission Unit
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">Commanding Lead</span>
                    <span className="font-bold text-foreground">{selectedUnit.head}</span>
                  </div>
                  <div className="flex justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
                    <div className="text-center flex-1">
                      <p className="text-xl font-bold tabular-nums">{selectedUnit.members}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Personnel</p>
                    </div>
                    <div className="w-px bg-border/50 mx-4" />
                    <div className="text-center flex-1">
                      <p className="text-xl font-bold tabular-nums">{selectedUnit.positions.length}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Duty Roles</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Duty Roles</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedUnit.positions.map((pos: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="bg-background border-border/50 py-1.5 px-3 rounded-lg shadow-sm font-medium">
                        {pos}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Button className="w-full h-12 shadow-md" variant="secondary">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Assign New Member
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/50 bg-card/30 sticky top-6">
              <CardHeader className="border-b border-border/50 bg-muted/20">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Architectural Roles</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {allPositions.map((pos) => (
                    <div key={pos.id} className="group p-5 flex items-center justify-between hover:bg-muted/10 transition-colors">
                      <div className="space-y-1">
                        <p className="font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">{pos.name}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none outline-none">{pos.level} Tier</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="font-mono text-xs px-2 py-0">WT {pos.weight}.0</Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-border/50 bg-muted/10">
                  <p className="text-[10px] text-center text-muted-foreground italic leading-relaxed">
                    Select a unit from the left manifest to inspect direct personnel and operational parameters.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrganization;
