"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    AlertTriangle,
    RefreshCw,
    MoveLeft,
    Wifi,
    WifiOff,
    Stars,
    ShieldAlert,
    Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
    error: Error & { digest?: string };
    reset: () => void;
}

function getErrorInfo(error: Error) {
    const message = error.message?.toLowerCase() || "";

    if (message.includes("timeout")) {
        return {
            icon: Clock,
            title: "KONEKSI TIMEOUT",
            subtitle: "Koneksi ke server terlalu lama. Server mungkin sedang sibuk.",
            color: "amber",
            suggestions: [
                "Periksa koneksi internet Anda",
                "Coba muat ulang halaman",
                "Tunggu beberapa saat lalu coba lagi",
            ],
        };
    }

    if (message.includes("network") || message.includes("fetch")) {
        return {
            icon: WifiOff,
            title: "KONEKSI TERPUTUS",
            subtitle: "Tidak dapat terhubung ke server. Pastikan koneksi internet aktif.",
            color: "red",
            suggestions: [
                "Periksa koneksi Wi-Fi atau data seluler",
                "Coba nonaktifkan & aktifkan ulang mode pesawat",
                "Pastikan tidak ada pemblokiran jaringan",
            ],
        };
    }

    if (message.includes("google") || message.includes("sheets") || message.includes("api")) {
        return {
            icon: ShieldAlert,
            title: "LAYANAN ERROR",
            subtitle: "Google Sheets API mengalami masalah. Data tidak dapat dimuat.",
            color: "orange",
            suggestions: [
                "Tunggu beberapa saat lalu coba lagi",
                "Periksa status Google Workspace",
                "Hubungi administrator jika masalah berlanjut",
            ],
        };
    }

    return {
        icon: AlertTriangle,
        title: "TERJADI KESALAHAN",
        subtitle: "Terjadi kesalahan yang tidak terduga saat memproses permintaan.",
        color: "rose",
        suggestions: [
            "Coba muat ulang halaman",
            "Kembali ke halaman utama",
            "Laporkan masalah jika terus terjadi",
        ],
    };
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
    const info = getErrorInfo(error);
    const IconComponent = info.icon;

    useEffect(() => {
        console.error("Application error:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/15 via-slate-950 to-slate-950" />
                <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                    {[...Array(15)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0.1, scale: 1 }}
                            animate={{
                                opacity: [0.1, 0.3, 0.1],
                                scale: [1, 1.1, 1],
                            }}
                            transition={{
                                duration: 3 + Math.random() * 4,
                                repeat: Infinity,
                                delay: Math.random() * 3,
                            }}
                            className="absolute w-1 h-1 bg-white rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-20 text-center space-y-10 max-w-lg">
                {/* Icon */}
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 12 }}
                    className="flex justify-center"
                >
                    <div className="relative">
                        <div className="p-6 bg-red-500/10 rounded-3xl border border-red-500/20">
                            <IconComponent className="h-16 w-16 text-red-400" strokeWidth={1.5} />
                        </div>
                        <div className="absolute inset-0 bg-red-500/10 blur-[60px] -z-10" />
                    </div>
                </motion.div>

                {/* Text */}
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                >
                    <h1 className="text-3xl md:text-4xl font-black font-syne text-white tracking-widest uppercase">
                        {info.title}
                    </h1>
                    <p className="text-slate-400 font-medium text-base md:text-lg max-w-md mx-auto leading-relaxed">
                        {info.subtitle}
                    </p>
                </motion.div>

                {/* Suggestions */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-left space-y-3"
                >
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        Yang bisa dilakukan:
                    </p>
                    <ul className="space-y-2.5">
                        {info.suggestions.map((suggestion, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                                <span className="mt-0.5 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0">
                                    {i + 1}
                                </span>
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                </motion.div>

                {/* Error Detail (collapsible) */}
                {error.message && (
                    <motion.details
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="text-left"
                    >
                        <summary className="text-[11px] text-slate-600 cursor-pointer hover:text-slate-400 transition-colors font-mono">
                            Detail teknis {error.digest && `· ${error.digest}`}
                        </summary>
                        <pre className="mt-2 p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-[11px] text-slate-500 font-mono overflow-x-auto max-h-24">
                            {error.message}
                        </pre>
                    </motion.details>
                )}

                {/* Actions */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
                >
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            onClick={reset}
                            size="lg"
                            className="group relative h-14 px-8 rounded-full bg-white text-slate-950 font-black tracking-[0.15em] overflow-hidden hover:bg-white transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                        >
                            <span className="relative z-10 flex items-center">
                                <RefreshCw className="w-5 h-5 mr-3 group-hover:rotate-180 transition-transform duration-500" />
                                COBA LAGI
                            </span>
                            <motion.div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                        </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            asChild
                            variant="ghost"
                            size="lg"
                            className="h-14 px-8 rounded-full text-slate-400 hover:text-white font-bold tracking-wide border border-white/10 hover:border-white/20 hover:bg-white/5"
                        >
                            <Link href="/">
                                <MoveLeft className="w-5 h-5 mr-3" />
                                BERANDA
                            </Link>
                        </Button>
                    </motion.div>
                </motion.div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 text-white/15 select-none">
                <Stars className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em]">Error Recovery</span>
                <Stars className="w-4 h-4" />
            </div>
        </div>
    );
}
