import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Users, Zap, CheckCircle2, TrendingUp, Database, FileText, Activity, BarChart3, PieChart, Users2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/lib/auth-context';
import React from 'react';

// Types for statistics
interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  color?: string;
}

interface GrowthData {
  month: string;
  count: number;
}

interface RegistryType {
  type: string;
  count: number;
  color: string;
  percentage: number;
}

// Dummy data for statistics
const platformStats = {
  totalNamespaces: 12847,
  totalRegistries: 45632,
  totalRecords: 2847392,
  activeUsers: 8934,
  dataProcessed: "847.2TB",
  uptime: 99.97
};

const namespaceGrowth: GrowthData[] = [
  { month: 'Jan', count: 8420 },
  { month: 'Feb', count: 9150 },
  { month: 'Mar', count: 9890 },
  { month: 'Apr', count: 10650 },
  { month: 'May', count: 11420 },
  { month: 'Jun', count: 12847 }
];

const registryTypes: RegistryType[] = [
  { type: 'Healthcare', count: 12847, color: 'bg-blue-500', percentage: 28 },
  { type: 'Finance', count: 10234, color: 'bg-green-500', percentage: 22 },
  { type: 'Supply Chain', count: 9876, color: 'bg-purple-500', percentage: 22 },
  { type: 'Education', count: 7543, color: 'bg-orange-500', percentage: 17 },
  { type: 'Government', count: 5132, color: 'bg-red-500', percentage: 11 }
];

const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = "text-blue-600" }: StatCardProps) => (
  <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
    <div className={`absolute top-0 left-0 w-full h-1 ${color.replace('text-', 'bg-')}`} />
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-800 ${color} group-hover:scale-110 transition-transform`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {trend && (
        <div className="flex items-center mt-4 text-sm">
          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
          <span className="text-green-600 font-medium">{trend}</span>
          <span className="text-muted-foreground ml-1">vs last month</span>
        </div>
      )}
    </CardContent>
  </Card>
);

interface MiniBarChartProps {
  data: GrowthData[];
  height?: number;
}

interface TypeDistributionProps {
  data: RegistryType[];
}

const MiniBarChart = ({ data, height = 60 }: MiniBarChartProps) => (
  <div className="flex items-end space-x-1" style={{ height }}>
    {data.map((item, index) => (
      <div key={index} className="flex-1 flex flex-col items-center">
        <div 
          className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-sm transition-all duration-500 hover:from-blue-600 hover:to-blue-400"
          style={{ height: `${(item.count / Math.max(...data.map(d => d.count))) * 100}%` }}
        />
        <span className="text-xs text-muted-foreground mt-1">{item.month}</span>
      </div>
    ))}
  </div>
);

const TypeDistribution = ({ data }: TypeDistributionProps) => (
  <div className="space-y-4">
    {data.map((item, index) => (
      <div key={index} className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{item.type}</span>
          <span className="text-sm text-muted-foreground">{item.count.toLocaleString()}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${item.color} transition-all duration-700`}
            style={{ width: `${item.percentage}%` }}
          />
        </div>
      </div>
    ))}
  </div>
);

export function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    // Optionally, render a loading state or null while redirecting
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <p>Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
        <div className="container mx-auto px-4 z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="secondary" className="px-4 py-2 text-base mb-4">
              Introducing DeDi
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Decentralized Data Registry
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Turn your data into trusted, tamper-proof services in 3 clicks. From folders to revenue — DeDi makes your data speak for itself.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button size="lg" className="text-lg h-12 px-8" onClick={() => navigate('/signup')}>
                Register
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg h-12 px-8" onClick={() => navigate('/login')}>
                Login
              </Button>
            </div>
            <div className="flex justify-center gap-8 pt-12">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-muted-foreground">Enterprise Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-muted-foreground">Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-muted-foreground">Verifiable</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              <Activity className="h-4 w-4 mr-2" />
              Platform Statistics
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400">
              Powering Data Transformation Globally
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of organizations already transforming their data into trusted, verifiable services with DeDi.
            </p>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard 
              title="Total Namespaces" 
              value={platformStats.totalNamespaces.toLocaleString()} 
              subtitle="Active projects"
              icon={Database}
              trend="+12.5%"
              color="text-blue-600"
            />
            <StatCard 
              title="Registries Created" 
              value={platformStats.totalRegistries.toLocaleString()} 
              subtitle="Data schemas"
              icon={BarChart3}
              trend="+18.3%"
              color="text-green-600"
            />
            <StatCard 
              title="Records Managed" 
              value={`${(platformStats.totalRecords / 1000000).toFixed(1)}M`} 
              subtitle="Data entries"
              icon={FileText}
              trend="+24.7%"
              color="text-purple-600"
            />
            <StatCard 
              title="Active Users" 
              value={platformStats.activeUsers.toLocaleString()} 
              subtitle="Trusted by"
              icon={Users2}
              trend="+8.9%"
              color="text-orange-600"
            />
          </div>

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Namespace Growth Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      Namespace Growth Trend
                    </CardTitle>
                    <CardDescription>Monthly namespace creation over the last 6 months</CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-green-600">
                    +52.5% Growth
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <MiniBarChart data={namespaceGrowth} height={120} />
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">52.5%</p>
                      <p className="text-sm text-muted-foreground">Growth Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">4,427</p>
                      <p className="text-sm text-muted-foreground">New This Month</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">99.2%</p>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Registry Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-purple-600" />
                  Registry by Industry
                </CardTitle>
                <CardDescription>Distribution across different sectors</CardDescription>
              </CardHeader>
              <CardContent>
                <TypeDistribution data={registryTypes} />
                <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Total Industries</span>
                    <span className="font-semibold">15+ Sectors</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-green-600 mb-2">{platformStats.uptime}%</div>
                <p className="text-sm text-muted-foreground mb-4">System Uptime</p>
                <Progress value={platformStats.uptime} className="h-2" />
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">{platformStats.dataProcessed}</div>
                <p className="text-sm text-muted-foreground mb-4">Data Processed</p>
                <div className="flex items-center justify-center">
                  <Activity className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-sm text-green-600">+15.2% this month</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-purple-600 mb-2">&lt;50ms</div>
                <p className="text-sm text-muted-foreground mb-4">Average Response Time</p>
                <div className="flex items-center justify-center">
                  <Zap className="h-4 w-4 text-purple-600 mr-2" />
                  <span className="text-sm text-green-600">Optimized Performance</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <Badge variant="outline" className="mb-4">How It Works</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400">
              Your Data's Journey to Trust
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform scattered information into organized, verifiable, and discoverable data services. Follow our simple 3-step process to make your data work for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <Shield className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
                <CardTitle className="text-2xl">1. Create Namespaces</CardTitle>
                <CardDescription className="text-base">
                  Start by creating namespaces - your project containers that organize all your data registries.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Organize projects and teams
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Set up DNS verification
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Manage access permissions
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <Users className="h-12 w-12 text-purple-600 dark:text-purple-400 mb-4" />
                <CardTitle className="text-2xl">2. Define Registries</CardTitle>
                <CardDescription className="text-base">
                  Create registries within namespaces to define data schemas and structure your information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Define custom data schemas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Bulk upload capabilities
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Archive and restore options
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <Zap className="h-12 w-12 text-orange-600 dark:text-orange-400 mb-4" />
                <CardTitle className="text-2xl">3. Manage Records</CardTitle>
                <CardDescription className="text-base">
                  Add and manage individual data records that conform to your registry schemas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Schema-validated data entries
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Version control and history
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Query and lookup capabilities
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}