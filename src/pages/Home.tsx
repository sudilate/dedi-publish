import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Users, Zap, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
        <div className="container mx-auto px-4 z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="secondary" className="px-4 py-2 text-base mb-4">
              Introducing DEDI-Publish
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Decentralized Data Registry
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A modern directory creation system with enterprise-grade security and seamless integration capabilities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button size="lg" className="text-lg h-12 px-8" onClick={() => navigate('/signup')}>
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg h-12 px-8" onClick={() => navigate('/login')}>
                Sign In
                <ArrowUpRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <div className="flex justify-center gap-8 pt-12">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-muted-foreground">Enterprise Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-muted-foreground">99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-muted-foreground">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400">
              Everything you need
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built with the latest technologies to provide a secure and scalable solution for your directory management needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <Shield className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
                <CardTitle className="text-2xl">Security First</CardTitle>
                <CardDescription className="text-base">
                  Enterprise-grade security with advanced encryption and protection.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Advanced encryption protocols
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Multi-factor authentication
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Regular security audits
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <Users className="h-12 w-12 text-purple-600 dark:text-purple-400 mb-4" />
                <CardTitle className="text-2xl">Team Management</CardTitle>
                <CardDescription className="text-base">
                  Comprehensive tools for managing users and permissions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Role-based access control
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Team collaboration tools
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Activity monitoring
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <Zap className="h-12 w-12 text-orange-600 dark:text-orange-400 mb-4" />
                <CardTitle className="text-2xl">Lightning Fast</CardTitle>
                <CardDescription className="text-base">
                  Optimized performance for lightning-fast operations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Global CDN distribution
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Optimized database queries
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Real-time updates
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