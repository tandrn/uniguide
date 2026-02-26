import * as React from "react";

interface RadarChartProps {
    data: {
        label: string;
        values: number[]; // Array of 5 values (0-100)
        color: string;
    }[];
    axes: string[];
    size?: number;
}

export function RadarChart({ data, axes, size = 300 }: RadarChartProps) {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size / 2) - 40; // Padding for labels

    const angleStep = (Math.PI * 2) / 5;

    const getPoint = (value: number, index: number) => {
        const angle = index * angleStep - Math.PI / 2; // Start from top
        const r = (value / 100) * radius;
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        return { x, y };
    };

    return (
        <svg width={size} height={size} className="overflow-visible">
            {/* Background Grid */}
            {[20, 40, 60, 80, 100].map((level) => (
                <polygon
                    key={level}
                    points={axes
                        .map((_, i) => {
                            const { x, y } = getPoint(level, i);
                            return `${x},${y}`;
                        })
                        .join(" ")}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                />
            ))}

            {/* Axes */}
            {axes.map((label, i) => {
                const { x, y } = getPoint(100, i);
                // Label position with offset
                const labelX = centerX + (radius + 20) * Math.cos(i * angleStep - Math.PI / 2);
                const labelY = centerY + (radius + 20) * Math.sin(i * angleStep - Math.PI / 2);

                return (
                    <g key={i}>
                        <line
                            x1={centerX}
                            y1={centerY}
                            x2={x}
                            y2={y}
                            stroke="#e2e8f0"
                            strokeWidth="1"
                        />
                        <text
                            x={labelX}
                            y={labelY}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-[10px] fill-muted-foreground font-medium uppercase tracking-wider"
                        >
                            {label}
                        </text>
                    </g>
                );
            })}

            {/* Data Polygons */}
            {data.map((dataset, idx) => {
                const points = dataset.values
                    .map((val, i) => {
                        // Animate from 0 to value if just mounted
                        const effectiveVal = mounted ? val : 0;
                        const { x, y } = getPoint(effectiveVal, i);
                        return `${x},${y}`;
                    })
                    .join(" ");

                return (
                    <polygon
                        key={idx}
                        points={points}
                        fill={dataset.color}
                        fillOpacity="0.3"
                        stroke={dataset.color}
                        strokeWidth="2"
                        className="transition-all duration-1000 ease-out"
                    />
                );
            })}
        </svg>
    );
}
