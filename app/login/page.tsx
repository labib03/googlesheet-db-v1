"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, User, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({ username: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        const result = await signIn("credentials", {
          username: formData.username,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          toast.error("Username atau Password salah!");
        } else {
          toast.success("Login Berhasil!");
          router.push("/admin-restricted");
          router.refresh();
        }
      } catch (error) {
        toast.error("Terjadi kesalahan sistem.");
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
         <div className="absolute -top-24 -left-24 w-96 h-96 bg-sky-500 rounded-full blur-3xl" />
         <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-50" />
      </div>

      <Card className="w-full max-w-[420px] rounded-3xl border-none shadow-2xl relative z-10 overflow-hidden ring-1 ring-slate-200/50 dark:ring-slate-800/50">
        <div className="h-2 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500" />
        <CardHeader className="space-y-2 pt-8 text-center">
          <div className="mx-auto w-14 h-14 bg-sky-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-sky-200 dark:shadow-none animate-in zoom-in-50 duration-500">
             <Lock className="w-7 h-7 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight font-syne">Selamat Datang</CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400 font-medium">
            Silakan masuk untuk mengelola data generus.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-8 px-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Username</Label>
              <div className="relative group">
                <div className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-sky-600 transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  required
                  className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50 dark:bg-slate-900 focus-visible:ring-sky-500/20 focus-visible:border-sky-500 transition-all font-medium"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={isPending}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</Label>
              </div>
              <div className="relative group">
                <div className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-sky-600 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50 dark:bg-slate-900 focus-visible:ring-sky-500/20 focus-visible:border-sky-500 transition-all font-medium"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={isPending}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-12 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold transition-all active:scale-95 shadow-lg shadow-sky-100 dark:shadow-none flex items-center justify-center gap-2 group mt-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>Masuk Ke Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Footer Info */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center space-y-1 z-10">
         <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Powered by Antigravity v1.0</p>
      </div>
    </div>
  );
}
