import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
        <div className="container mx-auto px-4 z-10">
          <div className="max-w-3xl space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Decentralized Data Registry: Public and Protected
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
            A modern directory creation system with all the features you need, beautifully designed and built with the latest web technologies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" onClick={() => navigate('/signup')}>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to build a secure, modern directory creation system for your application.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Secure Directory Creation</CardTitle>
                <CardDescription>
                  Industry-standard security practices with password hashing and protection against common attacks.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Password hashing with bcrypt</li>
                  <li>• Protection against brute force attacks</li>
                  <li>• CSRF protection</li>
                  <li>• Secure HTTP-only cookies</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Directory Management</CardTitle>
                <CardDescription>
                  Complete directory management with registration, login, and profile updates.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• User registration and login</li>
                  <li>• Profile management</li>
                  <li>• Password reset</li>
                  <li>• Email verification</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <Zap className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Performance Optimized</CardTitle>
                <CardDescription>
                  Built with performance in mind, ensuring a fast and responsive user experience.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Optimized for speed</li>
                  <li>• Minimal dependencies</li>
                  <li>• Efficient API calls</li>
                  <li>• Fast page loading</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}