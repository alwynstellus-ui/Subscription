import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { requireAdmin } from "@/lib/clerk/auth";
import { LayoutDashboard, Users, Mail, BarChart, Home } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/10">
        <div className="p-6">
          <Link href="/" className="text-xl font-bold">
            Newsletter Manager
          </Link>
          <p className="text-xs text-muted-foreground mt-1">Admin Panel</p>
        </div>
        <nav className="px-4 space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/admin/subscribers"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
          >
            <Users className="h-5 w-5" />
            <span>Subscribers</span>
          </Link>
          <Link
            href="/admin/campaigns"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
          >
            <Mail className="h-5 w-5" />
            <span>Campaigns</span>
          </Link>
          <Link
            href="/admin/analytics"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
          >
            <BarChart className="h-5 w-5" />
            <span>Analytics</span>
          </Link>
          <div className="pt-4 border-t mt-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm text-muted-foreground"
            >
              <Home className="h-4 w-4" />
              <span>User Dashboard</span>
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b p-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Admin Panel</h1>
          <UserButton afterSignOutUrl="/" />
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 bg-muted/5">
          {children}
        </main>
      </div>
    </div>
  );
}
