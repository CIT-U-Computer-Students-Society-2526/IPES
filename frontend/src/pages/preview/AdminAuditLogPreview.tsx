import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert, User, Clock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const AdminAuditLogPreview = () => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Audit & Activity Log (Preview)</h1>
                    <p className="text-muted-foreground">System-wide trail of data modifications and actions</p>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Timestamp</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>User / IP</TableHead>
                                <TableHead>Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[
                                { time: "10 mins ago", action: "User Updated", user: "Admin (192.168.1.5)", details: "Changed role of Juan to Admin" },
                                { time: "1 hour ago", action: "Login Failed", user: "Unknown (10.0.0.5)", details: "Invalid credentials (test@cit.edu)" },
                                { time: "2 hours ago", action: "Evaluation Deleted", user: "Admin (192.168.1.5)", details: "Soft deleted evaluation #105" },
                                { time: "Yesterday", action: "Form Created", user: "Admin (192.168.1.5)", details: "Created form 'Peer Eval V2'" },
                            ].map((log, i) => (
                                <TableRow key={i}>
                                    <TableCell className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5" />
                                        {log.time}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {log.action.includes("Failed") || log.action.includes("Deleted") ?
                                                <ShieldAlert className="w-4 h-4 text-destructive" /> :
                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                            }
                                            {log.action}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        <div className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-muted-foreground" /> {log.user}</div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{log.details}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminAuditLogPreview;
