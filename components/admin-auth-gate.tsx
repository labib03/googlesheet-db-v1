"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { loginAdminAction, verifySessionAction } from "@/app/actions";

interface AdminAuthGateProps {
  children: React.ReactNode;
}

export function AdminAuthGate({ children }: AdminAuthGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [inputPassword, setInputPassword] = useState("");
  const [inputUsername, setInputUsername] = useState("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Verify Session on Mount
  useEffect(() => {
    async function checkAuth() {
      const result = await verifySessionAction();
      setIsAuthenticated(result.isAuthenticated);
    }
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPassword) return;

    setIsSubmitting(true);
    try {
      const result = await loginAdminAction(inputPassword, inputUsername);

      if (result.success) {
        setIsAuthenticated(true);
        toast.success("Access Granted");
      } else {
        toast.error(result.message || "Invalid credentials");
        // Insecure: router.push("/") was here, keeping it for consistency if desired
        // but now we stay on page and show error or redirect
      }
    } catch (error) {
      toast.error("Authentication failed");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading State
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 font-outfit">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-outfit">
      <Card className="w-full max-w-sm shadow-xl border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-300">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-2">
            <Lock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Admin Access</CardTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Protected Area. Enter credentials.
          </p>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4 mb-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Username"
                value={inputUsername}
                onChange={(e) => setInputUsername(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password..."
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                className="text-center tracking-widest font-bold pr-10 rounded-xl"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-10"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Unlock"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full rounded-xl"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
