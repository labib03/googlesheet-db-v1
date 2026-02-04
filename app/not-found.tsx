"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MoveLeft, Rocket, Sparkles, Stars, Zap, Command, Ghost } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    const floatingItems = [
        { icon: Sparkles, color: "text-indigo-400", size: 40, x: -150, y: -120, delay: 0 },
        { icon: Rocket, color: "text-emerald-400", size: 30, x: 180, y: -150, delay: 0.2 },
        { icon: Zap, color: "text-amber-400", size: 25, x: -200, y: 150, delay: 0.5 },
        { icon: Command, color: "text-blue-400", size: 35, x: 220, y: 120, delay: 0.8 },
        { icon: Ghost, color: "text-purple-400", size: 20, x: 0, y: -250, delay: 1.2 },
    ];

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
            {/* Space Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950" />
                <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0.1, scale: 1 }}
                            animate={{
                                opacity: [0.1, 0.4, 0.1],
                                scale: [1, 1.2, 1],
                                x: [0, Math.random() * 20 - 10, 0],
                                y: [0, Math.random() * 20 - 10, 0]
                            }}
                            transition={{
                                duration: 2 + Math.random() * 4,
                                repeat: Infinity,
                                delay: Math.random() * 5
                            }}
                            className="absolute w-1 h-1 bg-white rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Floating Elements (Antigravity Debris) */}
            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                {floatingItems.map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ x: item.x, y: item.y, opacity: 0 }}
                        animate={{
                            x: [item.x, item.x + (i % 2 === 0 ? 20 : -20), item.x],
                            y: [item.y, item.y + (i % 2 === 0 ? -30 : 30), item.y],
                            rotate: [0, 15, -15, 0],
                            opacity: 0.4
                        }}
                        transition={{
                            duration: 10 + i * 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            opacity: { duration: 1 }
                        }}
                        className={`absolute left-1/2 top-1/2 ${item.color} blur-[1px]`}
                    >
                        <item.icon size={item.size} strokeWidth={1.5} />
                    </motion.div>
                ))}
            </div>

            {/* Main Content */}
            <div className="relative z-20 text-center space-y-12">
                <div className="relative group">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 100, damping: 10 }}
                        className="flex flex-col items-center"
                    >
                        <div className="relative">
                            <h1 className="text-[14rem] md:text-[20rem] font-black font-syne leading-none tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white/40 to-white/5 animate-pulse-slow">
                                404
                            </h1>
                            {/* Glow Effect */}
                            <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] -z-10 group-hover:bg-indigo-500/40 transition-all duration-700" />
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-6"
                >
                    <div className="space-y-2">
                        <h2 className="text-3xl md:text-5xl font-black font-syne text-white tracking-widest uppercase">
                            LOST IN SPACE
                        </h2>
                        <p className="text-slate-400 font-medium text-lg max-w-md mx-auto leading-relaxed">
                            Halaman ini melayang terlalu jauh ke luar angkasa dan tidak dapat ditemukan.
                        </p>
                    </div>

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="pt-8"
                    >
                        <Button
                            asChild
                            size="lg"
                            className="group relative h-16 px-10 rounded-full bg-white text-slate-950 font-black tracking-[0.2em] overflow-hidden hover:bg-white transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                        >
                            <Link href="/">
                                <span className="relative z-10 flex items-center">
                                    <MoveLeft className="w-5 h-5 mr-3 group-hover:-translate-x-2 transition-transform" />
                                    KEMBALI KE BUMI
                                </span>
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity"
                                />
                            </Link>
                        </Button>
                    </motion.div>
                </motion.div>
            </div>

            {/* Planet Decoration */}
            <motion.div
                animate={{
                    rotate: 360,
                }}
                transition={{
                    duration: 100,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute -bottom-[20%] -left-[10%] w-[40vw] h-[40vw] border border-white/5 rounded-full pointer-events-none"
            >
                <div className="absolute top-10 right-10 w-4 h-4 bg-indigo-500/40 rounded-full blur-sm" />
            </motion.div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 text-white/20 select-none">
                <Stars className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em]">404 Protocol Activated</span>
                <Stars className="w-4 h-4" />
            </div>
        </div>
    );
}
