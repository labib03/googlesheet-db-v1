"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface AdminAuthGateProps {
  children: React.ReactNode;
  correctPassword?: string;
}

export function AdminAuthGate({ children, correctPassword }: AdminAuthGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputPassword, setInputPassword] = useState("");
  const router = useRouter();

  // Session Persistance (Simple)
  useEffect(() => {
    const isVerified = sessionStorage.getItem("admin_verified");
    if (isVerified === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const target = correctPassword || "admin123"; // Fallback default
    
    if (inputPassword === target) {
      setIsAuthenticated(true);
      sessionStorage.setItem("admin_verified", "true");
      toast.success("Access Granted");
    } else {
      toast.error("Incorrect Password");
      router.push("/"); // Throw back to home on failure
    }
  };

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
            Protected Area. Enter password.
          </p>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4 mb-4">
            <Input
              type="password"
              placeholder="Enter password..."
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              className="text-center tracking-widest font-bold"
              autoFocus
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-10">
              Unlock
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
