"use client";

import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "subtle";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "md" | "lg";
}

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 disabled:bg-gray-300 disabled:text-gray-500",
  ghost:   "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50",
  subtle:  "bg-brand-50 text-brand-600 hover:bg-brand-100",
};

export function Button({ variant = "primary", size = "md", className, children, ...rest }: Props) {
  const sz = size === "lg" ? "px-8 py-4 text-lg" : "px-6 py-3 text-base";
  return (
    <button
      {...rest}
      className={cn(
        "rounded-full font-bold transition transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed",
        VARIANTS[variant],
        sz,
        className
      )}
    >
      {children}
    </button>
  );
}
