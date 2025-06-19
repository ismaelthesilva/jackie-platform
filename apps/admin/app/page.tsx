import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Activity, TrendingUp, Calendar, Heart, Dumbbell, Apple, Globe } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    {
      title: "Total Clients",
      value: "524",
      change: "+12%",
      changeType: "positive",
      icon: Users,
    },
    {
      title: "Active Sessions",
      value: "89",
      change: "+8%",
      changeType: "positive", 
      icon: Activity,
    },
    {
      title: "Success Rate",
      value: "98.2%",
      change: "+2.1%",
      changeType: "positive",
      icon: TrendingUp,
    },
    {
      title: "This Month",
      value: "127",
      change: "+23%",
      changeType: "positive",
      icon: Calendar,
    },
  ];

  const recentActivities = [
    { client: "Maria Silva", activity: "Completed workout session", time: "2 hours ago", type: "fitness" },
    { client: "John Doe", activity: "Nutrition plan updated", time: "4 hours ago", type: "nutrition" },
    { client: "Ana Costa", activity: "Weekly check-in", time: "6 hours ago", type: "checkin" },
    { client: "Mike Johnson", activity: "Goal achievement", time: "8 hours ago", type: "achievement" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-600 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">DJ</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dr. Jackie Admin</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Health & Fitness Platform Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">
                <Heart className="h-4 w-4 mr-1" />
                Platform Active
              </Badge>
              <Button variant="outline">Settings</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, Dr. Jackie! 👋
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Here&apos;s what&apos;s happening with your coaching platform today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </CardTitle>
                  <IconComponent className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <p className="text-xs text-emerald-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stat.change} from last month
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-600" />
                Recent Client Activity
              </CardTitle>
              <CardDescription>Latest updates from your coaching platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-shrink-0">
                    {activity.type === 'fitness' && <Dumbbell className="h-5 w-5 text-emerald-600" />}
                    {activity.type === 'nutrition' && <Apple className="h-5 w-5 text-blue-600" />}
                    {activity.type === 'checkin' && <Calendar className="h-5 w-5 text-purple-600" />}
                    {activity.type === 'achievement' && <TrendingUp className="h-5 w-5 text-green-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.client}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {activity.activity}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {activity.time}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-emerald-600" />
                Quick Actions
              </CardTitle>
              <CardDescription>Manage your coaching platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button className="h-20 flex flex-col items-center justify-center bg-emerald-600 hover:bg-emerald-700">
                  <Users className="h-6 w-6 mb-2" />
                  <span className="text-sm">Manage Clients</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Calendar className="h-6 w-6 mb-2" />
                  <span className="text-sm">Schedule</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Dumbbell className="h-6 w-6 mb-2" />
                  <span className="text-sm">Workouts</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Apple className="h-6 w-6 mb-2" />
                  <span className="text-sm">Nutrition</span>
                </Button>
              </div>
              <Button className="w-full" variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Full Analytics
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 dark:text-gray-400">
          <p className="text-sm">
            Dr. Jackie Health & Fitness Platform • Admin Dashboard v1.0
          </p>
        </div>
      </main>
    </div>
  );
}
