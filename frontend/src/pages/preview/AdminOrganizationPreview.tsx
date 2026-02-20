import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Building2 } from "lucide-react";

const AdminOrganizationPreview = () => {
    const units = [
        { name: "Executive Committee", members: 12, head: "Juan Dela Cruz" },
        { name: "Finance Committee", members: 8, head: "Maria Santos" },
        { name: "Logistics Committee", members: 15, head: "Pedro Penduko" }
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Organization Units (Preview)</h1>
                    <p className="text-muted-foreground">Manage departments and commitess</p>
                </div>
                <Button disabled>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Unit
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {units.map((unit, i) => (
                    <Card key={i}>
                        <CardContent className="p-6">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                                <Building2 className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground">{unit.name}</h3>
                            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    {unit.members} Active Members
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Head:</span> {unit.head}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default AdminOrganizationPreview;
