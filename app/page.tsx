import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubscribeForm } from "@/components/forms/subscribe-form";
import { CheckCircle2, Mail, Users, BarChart } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Newsletter Manager</h1>
          <div className="flex gap-2">
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-5xl font-bold tracking-tight">
            Stay Updated with Our Newsletter
          </h2>
          <p className="text-xl text-muted-foreground">
            Get the latest updates, news, and exclusive content delivered directly to your inbox.
            Join thousands of subscribers today!
          </p>
          <div className="flex justify-center">
            <SubscribeForm />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Why Subscribe?</h3>
            <p className="text-muted-foreground">
              Join our community and never miss an update
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <Mail className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Regular Updates</CardTitle>
                <CardDescription>
                  Get weekly digests with curated content and the latest news
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle2 className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Quality Content</CardTitle>
                <CardDescription>
                  Carefully crafted content that matters to you
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Join the Community</CardTitle>
                <CardDescription>
                  Be part of a growing community of engaged readers
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BarChart className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Exclusive Insights</CardTitle>
                <CardDescription>
                  Get access to exclusive insights and early announcements
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-3xl">Ready to Get Started?</CardTitle>
            <CardDescription className="text-lg">
              Subscribe now and get your first newsletter this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SubscribeForm />
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Newsletter Manager. Built with Next.js, Clerk, and Supabase.</p>
        </div>
      </footer>
    </div>
  );
}
