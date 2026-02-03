import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users,
  Award,
  Download,
  Filter
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

const categoryData = [
  { name: "Leadership", score: 4.2 },
  { name: "Communication", score: 4.0 },
  { name: "Reliability", score: 4.5 },
  { name: "Teamwork", score: 4.3 },
  { name: "Initiative", score: 3.9 },
  { name: "Quality", score: 4.1 },
];

const trendData = [
  { month: "Sep", score: 3.8 },
  { month: "Oct", score: 4.0 },
  { month: "Nov", score: 4.1 },
  { month: "Dec", score: 4.2 },
  { month: "Jan", score: 4.3 },
];

const unitData = [
  { name: "Executive", value: 4.5, color: "#4f46e5" },
  { name: "Legislative", value: 4.2, color: "#06b6d4" },
  { name: "Academics", value: 4.0, color: "#10b981" },
  { name: "Finance", value: 4.3, color: "#f59e0b" },
  { name: "External", value: 4.1, color: "#ec4899" },
];

const topPerformers = [
  { rank: 1, name: "Maria Santos", unit: "Executive", score: 4.8, trend: "up" },
  { rank: 2, name: "Carlos Garcia", unit: "Finance", score: 4.7, trend: "up" },
  { rank: 3, name: "Ana Reyes", unit: "Academics", score: 4.6, trend: "same" },
  { rank: 4, name: "Juan Dela Cruz", unit: "Legislative", score: 4.5, trend: "down" },
  { rank: 5, name: "Rosa Mendoza", unit: "External", score: 4.5, trend: "up" },
];

const unitBreakdown = [
  { unit: "Executive Committee", members: 5, avgScore: 4.5, completion: 100 },
  { unit: "Legislative Council", members: 12, avgScore: 4.2, completion: 92 },
  { unit: "Committee on Academics", members: 6, avgScore: 4.0, completion: 100 },
  { unit: "Committee on Finance", members: 5, avgScore: 4.3, completion: 80 },
  { unit: "Committee on External Affairs", members: 6, avgScore: 4.1, completion: 83 },
  { unit: "Committee on Internal Affairs", members: 5, avgScore: 3.9, completion: 100 },
];

const AdminAnalytics = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics & Reports</h1>
          <p className="text-muted-foreground">Comprehensive evaluation insights and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="current">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Term</SelectItem>
              <SelectItem value="previous">Previous Term</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
                <p className="text-3xl font-bold text-foreground">4.2</p>
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">+0.3</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Evaluations</p>
                <p className="text-3xl font-bold text-foreground">287</p>
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
                <p className="text-3xl font-bold text-foreground">91%</p>
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
                <p className="text-xl font-bold text-foreground">Maria S.</p>
              </div>
              <Award className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Average Score by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 5]} />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip />
                <Bar dataKey="score" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Score Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Score Trend Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[3, 5]} />
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
              {topPerformers.map((performer) => (
                <div key={performer.rank} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    performer.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
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
            </div>
          </CardContent>
        </Card>

        {/* Unit Breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Performance by Unit</CardTitle>
              <Button variant="ghost" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-center">Members</TableHead>
                  <TableHead className="text-center">Avg Score</TableHead>
                  <TableHead>Completion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unitBreakdown.map((unit) => (
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
                  data={unitData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {unitData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {unitData.map((unit) => (
              <div key={unit.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: unit.color }} />
                <span className="text-sm text-muted-foreground">{unit.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
