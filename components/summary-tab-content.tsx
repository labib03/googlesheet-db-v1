"use client";

import { useSearchParams } from "next/navigation";
import { ReactNode, useEffect, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryTabContentProps {
    children: ReactNode;
    activeView: string;
}

export function SummaryTabContent({ children, activeView }: SummaryTabContentProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Small delay to let React settle before showing content
        const timer = setTimeout(() => setMounted(true), 50);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            className={cn(
                "transition-opacity duration-300",
                mounted ? "opacity-100" : "opacity-0"
            )}
        >
            {children}
        </div>
    );
}
