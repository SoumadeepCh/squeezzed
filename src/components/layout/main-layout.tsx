"use client";

import { ReactNode, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { GradientBackground } from "@/components/ui/aceternity-card";
import { Button } from "@/components/ui/button";
import { Brain, Home, BarChart3, Settings, User, LogOut, LogIn } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import AuthModal from "@/components/auth/auth-modal";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: BarChart3,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
    ...(session ? [{
      name: "Dashboard",
      href: "/dashboard",
      icon: User,
    }] : []),
  ];

  return (
    <GradientBackground>
      <div className="min-h-screen">
        {/* Header */}
        <header className="backdrop-blur-md bg-white/30 border-b border-white/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-br from-slate-400 to-slate-500 rounded-lg shadow-lg">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent">
                  QuizMaster
                </span>
              </Link>

              {/* Navigation */}
              <nav className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.name} href={item.href}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        className={cn(
                          "flex items-center space-x-2 transition-all duration-200",
                          isActive
                            ? "bg-slate-500 hover:bg-slate-600 text-white shadow-md"
                            : "text-gray-600 hover:text-slate-600 hover:bg-slate-50/50"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Button>
                    </Link>
                  );
                })}
              </nav>

              {/* Authentication */}
              <div className="flex items-center space-x-2">
                {session ? (
                  <div className="flex items-center space-x-3">
                    <span className="hidden sm:inline text-sm text-gray-600">
                      Welcome, {session.user?.name?.split(' ')[0]}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => signOut()}
                      className="flex items-center space-x-1 text-gray-600 hover:text-slate-600"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="hidden sm:inline">Sign Out</span>
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAuthModal(true)}
                    className="flex items-center space-x-1 text-gray-600 hover:text-slate-600"
                  >
                    <LogIn className="h-4 w-4" />
                    <span className="hidden sm:inline">Sign In</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="backdrop-blur-md bg-white/20 border-t border-white/20 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="text-center text-sm text-gray-600">
              <p>
                © 2025 QuizMaster. Built with Next.js, Tailwind CSS, and OpenAI.
              </p>
            </div>
          </div>
        </footer>
      </div>
      
      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />
    </GradientBackground>
  );
}
