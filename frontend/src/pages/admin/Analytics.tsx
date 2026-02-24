import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Award,
  Download,
  Filter,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { useForms, useFormAnalytics } from "@/hooks/useEvaluations";

const AdminAnalytics = () => {
  const { data: forms, isLoading: isLoadingForms } = useForms({ is_active: undefined, is_published: true }); // Fetching all published/active forms related to the org
  const [selectedFormId, setSelectedFormId] = useState<string>("all");

  // Filter out soft-deleted forms, but forms hook already might do this. Better safe.
  const availableForms = forms || [];

  useEffect(() => {
    // Attempt to set a default form if available
    if (availableForms.length > 0 && selectedFormId === "all") {
      // Find the most recently created or active one
      const defaultForm = availableForms.find(f => f.is_active) || availableForms[0];
      setSelectedFormId(defaultForm.id.toString());
    }
  }, [availableForms, selectedFormId]);

  const formIdToFetch = selectedFormId !== "all" ? parseInt(selectedFormId) : undefined;

  const { data: analyticsData, isLoading: isLoadingAnalytics } = useFormAnalytics(formIdToFetch);

  const handleExport = () => {
    // To be implemented
    console.log("Exporting data for form:", selectedFormId);
  };

  const isLoading = isLoadingForms || isLoadingAnalytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics & Reports</h1>
          <p className="text-muted-foreground">Comprehensive evaluation insights and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Select
            value={selectedFormId}
            onValueChange={setSelectedFormId}
            disabled={isLoadingForms || availableForms.length === 0}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select Evaluation Form" />
            </SelectTrigger>
            <SelectContent>
              {availableForms.map((form) => (
                <SelectItem key={form.id} value={form.id.toString()}>
                  {form.title} {form.is_active ? '(Active)' : '(Archived/Released)'}
                </SelectItem>
              ))}
              {availableForms.length === 0 && (
                <SelectItem value="all" disabled>No forms available</SelectItem>
              )}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport} disabled={!formIdToFetch || isLoading}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 h-64 border rounded-lg bg-card text-card-foreground shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      ) : !analyticsData ? (
        <div className="flex flex-col items-center justify-center p-12 h-64 border rounded-lg bg-card text-muted-foreground shadow-sm">
          <BarChart3 className="w-12 h-12 mb-4 opacity-50" />
          <p>Please select an evaluation form to view its analytics.</p>
        </div>
      ) : (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Overall Score</p>
                    <p className="text-3xl font-bold text-foreground">{analyticsData.overall_score}</p>
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">--</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Evaluations</p>
                    <p className="text-3xl font-bold text-foreground">{analyticsData.total_evaluations}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Participation Rate</p>
                    <p className="text-3xl font-bold text-foreground">{analyticsData.participation_rate}%</p>
                  </div>
                  <Users className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Top Performer</p>
                    <p className="text-xl font-bold text-foreground">
                      {analyticsData.top_performers.length > 0 ? analyticsData.top_performers[0].name : 'N/A'}
                    </p>
                  </div>
                  <Award className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Score by Category (Top Questions) */}
            <Card>
              <CardHeader>
                <CardTitle>Top Scoring Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.category_data} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" domain={[0, 'dataMax + 1']} />
                    <YAxis type="category" dataKey="name" width={120} />
                    <Tooltip />
                    <Bar dataKey="score" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Score Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Score Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.trend_data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={['auto', 'auto']} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Performers */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.top_performers.map((performer) => (
                    <div key={performer.rank} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${performer.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                        performer.rank === 2 ? 'bg-gray-100 text-gray-700' :
                          performer.rank === 3 ? 'bg-orange-100 text-orange-700' :
                            'bg-muted text-muted-foreground'
                        }`}>
                        {performer.rank}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{performer.name}</p>
                        <p className="text-xs text-muted-foreground">{performer.unit}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{performer.score}</span>
                        {performer.trend === "up" && <TrendingUp className="w-4 h-4 text-green-600" />}
                        {performer.trend === "down" && <TrendingDown className="w-4 h-4 text-red-600" />}
                      </div>
                    </div>
                  ))}
                  {analyticsData.top_performers.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No performance data available yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Unit Breakdown */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Performance by Unit</CardTitle>
                  <Button variant="ghost" size="sm" disabled>
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto max-h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Unit</TableHead>
                        <TableHead className="text-center">Members evaluated</TableHead>
                        <TableHead className="text-center">Avg Score</TableHead>
                        <TableHead>Eval. Completion</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analyticsData.unit_breakdown.map((unit) => (
                        <TableRow key={unit.unit}>
                          <TableCell className="font-medium">{unit.unit}</TableCell>
                          <TableCell className="text-center">{unit.members}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant={unit.avgScore >= 4.3 ? "default" : "secondary"}>
                              {unit.avgScore}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={unit.completion} className="h-2 w-20" />
                              <span className="text-sm text-muted-foreground">{unit.completion}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Score Distribution by Unit (Pie Chart) */}
          <Card>
            <CardHeader>
              <CardTitle>Score Distribution by Unit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.unit_data}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {analyticsData.unit_data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {analyticsData.unit_data.map((unit) => (
                  <div key={unit.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: unit.color }} />
                    <span className="text-sm text-muted-foreground">{unit.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminAnalytics;
