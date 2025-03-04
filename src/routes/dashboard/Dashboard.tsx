import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  LineChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
  ResponsiveContainer,
} from "recharts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CalendarIcon,
  ChevronDownIcon,
  PlusIcon,
  SettingsIcon,
  UserIcon,
  BookOpenIcon,
  GraduationCapIcon,
  TrendingUpIcon,
  ClockIcon,
} from "lucide-react";
import { UserButton } from "@clerk/clerk-react";

// Mock data for charts
const performanceData = [
  { name: "Jan", score: 65 },
  { name: "Feb", score: 59 },
  { name: "Mar", score: 80 },
  { name: "Apr", score: 81 },
  { name: "May", score: 76 },
  { name: "Jun", score: 85 },
];

const courseData = [
  { name: "Mathematics", completed: 80 },
  { name: "Science", completed: 65 },
  { name: "Literature", completed: 90 },
  { name: "History", completed: 73 },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center">
            <GraduationCapIcon className="h-8 w-8 text-primary" />
            <h1 className="ml-2 text-xl font-bold text-gray-900 dark:text-white">GradAid</h1>
          </div>
          <UserButton />
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex h-[calc(100vh-4rem)] w-64 flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex flex-col gap-2 p-4">
            <Button variant="ghost" className="justify-start">
              <UserIcon className="mr-2 h-4 w-4" />
              Profile
            </Button>
            <Button variant="ghost" className="justify-start">
              <BookOpenIcon className="mr-2 h-4 w-4" />
              Courses
            </Button>
            <Button variant="ghost" className="justify-start">
              <TrendingUpIcon className="mr-2 h-4 w-4" />
              Progress
            </Button>
            <Button variant="ghost" className="justify-start">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Schedule
            </Button>
            <Button variant="ghost" className="justify-start">
              <SettingsIcon className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      This Month <ChevronDownIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>This Week</DropdownMenuItem>
                    <DropdownMenuItem>This Month</DropdownMenuItem>
                    <DropdownMenuItem>This Year</DropdownMenuItem>
                    <DropdownMenuItem>All Time</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button>
                  <PlusIcon className="mr-2 h-4 w-4" /> Add Course
                </Button>
              </div>
            </div>

            {/* Stats cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
                  <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">6</div>
                  <p className="text-xs text-muted-foreground">+2 from last semester</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
                  <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3.8</div>
                  <p className="text-xs text-muted-foreground">+0.2 from last semester</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Credits Earned</CardTitle>
                  <GraduationCapIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">72</div>
                  <p className="text-xs text-muted-foreground">48 more needed to graduate</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
                  <ClockIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4</div>
                  <p className="text-xs text-muted-foreground">2 due this week</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts and tables */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Academic Performance</CardTitle>
                  <CardDescription>Your performance over the past 6 months</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#8884d8"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Course Completion</CardTitle>
                  <CardDescription>Current progress by subject</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={courseData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="completed" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent activity and upcoming events */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Activity</CardTitle>
                    <Button variant="ghost" size="sm">
                      View all
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        title: "Assignment submitted",
                        description: "You submitted 'Research Paper' for Biology 101",
                        time: "2 hours ago",
                      },
                      {
                        title: "Grade received",
                        description: "You received an A on 'Midterm Exam' for Mathematics 202",
                        time: "Yesterday",
                      },
                      {
                        title: "Course enrolled",
                        description: "You enrolled in 'Computer Science 301'",
                        time: "2 days ago",
                      },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {item.title[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                          <p className="text-xs text-muted-foreground">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="col-span-1">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Upcoming Deadlines</CardTitle>
                    <Button variant="ghost" size="sm">
                      View all
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        title: "Final Project",
                        course: "Computer Science 101",
                        deadline: "May 15, 2023",
                        progress: 65,
                      },
                      {
                        title: "Research Paper",
                        course: "History 202",
                        deadline: "May 18, 2023",
                        progress: 25,
                      },
                      {
                        title: "Group Presentation",
                        course: "Business 301",
                        deadline: "May 20, 2023",
                        progress: 10,
                      },
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.course}</p>
                          </div>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 rounded-full bg-secondary">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Due {item.deadline}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
