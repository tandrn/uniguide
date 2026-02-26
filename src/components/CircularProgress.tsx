import * as React from "react";
import { cn } from "@/lib/utils";

interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    value: number;
    size?: number;
    strokeWidth?: number;
}

export function CircularProgress({
    value,
    size = 40,
    strokeWidth = 4,
    className,
    ...props
}: CircularProgressProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    let color = "text-amber-500";
    if (value >= 90) color = "text-emerald-500";
    else if (value >= 80) color = "text-blue-500";

    return (
        <div
            className={cn("relative inline-flex items-center justify-center", className)}
            style={{ width: size, height: size }}
            {...props}
        >
            <svg className="transform -rotate-90 w-full h-full">
                <circle
                    className="text-gray-200"
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <circle
                    className={cn("transition-all duration-1000 ease-out", color)}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
            </svg>
            <span className="absolute text-[10px] font-bold">{value}%</span>
        </div>
    );
}
