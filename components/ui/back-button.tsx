"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface BackButtonProps {
    href?: string;
    label?: string;
    className?: string;
    onClick?: () => void;
    variant?: "default" | "ghost" | "outline" | "secondary" | "link" | "destructive";
}

export function BackButton({ href, label = "Kembali", className, onClick, variant = "ghost" }: BackButtonProps) {
    const router = useRouter();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else if (!href) {
            router.back();
        }
    };

    const content = (
        <>
            <ArrowLeft className="w-5 h-5 sm:w-4 sm:h-4 sm:mr-2 shrink-0" />
            <span className="hidden sm:inline font-medium">{label}</span>
        </>
    );

    const baseClassName = `rounded-xl h-10 px-2.5 sm:px-4 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors ${className || ""}`;

    if (href) {
        return (
            <Button
                asChild
                variant={variant}
                className={baseClassName}
            >
                <Link href={href}>
                    {content}
                </Link>
            </Button>
        );
    }

    return (
        <Button
            variant={variant}
            onClick={handleClick}
            className={baseClassName}
        >
            {content}
        </Button>
    );
}
