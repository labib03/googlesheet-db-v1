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
            <ArrowLeft className="w-4 h-4 mr-2 shrink-0" />
            <span className="font-medium text-sm">{label}</span>
        </>
    );

    const baseClassName = `rounded-xl h-10 px-3 sm:px-4 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${className || ""}`;

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
