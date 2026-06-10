"use client"

import { useEffect, useState } from "react"
import { ShelfStatus } from "@prisma/client"
import { 
    ResponsiveContainer, 
    PieChart, 
    Pie, 
    Cell, 
    Tooltip, 
    Legend, 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid 
} from "recharts"
import { PieChart as PieIcon, BarChart3, Clock, HelpCircle } from "lucide-react"

interface DashboardChartsProps {
    stats: Record<ShelfStatus, { count: number; playtime: number; rating: number }>
}

const COLORS: Record<ShelfStatus, string> = {
    PLAYING: "#a855f7",    // Purple
    COMPLETED: "#10b981",  // Emerald
    PLANNED: "#3b82f6",    // Blue
    DROPPED: "#ef4444",    // Red
}

const STATUS_LABELS: Record<ShelfStatus, string> = {
    PLAYING: "Playing",
    COMPLETED: "Completed",
    PLANNED: "Planned",
    DROPPED: "Dropped",
}

interface CustomTooltipProps {
    active?: boolean
    payload?: Array<{
        name: string
        value: number
        color?: string
        payload?: {
            color?: string
        }
    }>
    label?: string
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-zinc-950/95 border border-zinc-800/80 backdrop-blur-md px-4 py-3 rounded-xl shadow-2xl space-y-1">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{label || payload[0].name}</p>
                {payload.map((p, idx) => (
                    <p key={idx} className="text-sm font-semibold mt-1" style={{ color: p.payload?.color || p.color || '#fff' }}>
                        {p.name}: {p.value} {p.name === "Playtime" ? "hrs" : p.name === "Rating" ? "/ 5" : "games"}
                    </p>
                ))}
            </div>
        )
    }
    return null
}

export default function DashboardCharts({ stats }: DashboardChartsProps) {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-8">
                <div className="h-[380px] bg-zinc-900/30 border border-zinc-800/80 rounded-2xl animate-pulse flex items-center justify-center">
                    <span className="text-zinc-600 text-sm">Loading charts...</span>
                </div>
                <div className="h-[380px] bg-zinc-900/30 border border-zinc-800/80 rounded-2xl animate-pulse flex items-center justify-center">
                    <span className="text-zinc-600 text-sm">Loading stats...</span>
                </div>
            </div>
        )
    }

    // Donut Chart Data (Status Distribution)
    const pieData = Object.entries(stats)
        .map(([status, val]) => ({
            name: STATUS_LABELS[status as ShelfStatus] || status,
            value: val.count,
            color: COLORS[status as ShelfStatus] || "#71717a",
            status: status as ShelfStatus
        }))
        .filter(d => d.value > 0)

    // Bar Chart Data (Playtime by Status - ignore PLANNED since it has no playtime)
    const barData = Object.entries(stats)
        .filter(([status]) => status !== "PLANNED")
        .map(([status, val]) => ({
            name: STATUS_LABELS[status as ShelfStatus] || status,
            Playtime: val.playtime,
            Rating: Number(val.rating.toFixed(1)),
            color: COLORS[status as ShelfStatus] || "#71717a",
        }))
        // Only show if there's any playtime or rating in playing/completed/dropped
        const hasPlaytimeOrRating = barData.some(d => d.Playtime > 0 || d.Rating > 0)

    const totalGamesCount = pieData.reduce((acc, curr) => acc + curr.value, 0)

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-8">
            {/* Pie Chart: Status Breakdown */}
            <div className="bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-xs rounded-2xl p-6 flex flex-col justify-between transition-all hover:border-zinc-800">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-zinc-800/50 rounded-lg text-zinc-400">
                        <PieIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Status Breakdown</h3>
                        <p className="text-xs text-zinc-400">Distribution of your gaming shelf</p>
                    </div>
                </div>

                {pieData.length === 0 ? (
                    <div className="h-[250px] flex flex-col items-center justify-center text-zinc-500 gap-2">
                        <HelpCircle className="w-10 h-10 opacity-30" />
                        <span className="text-sm">No games status statistics found.</span>
                    </div>
                ) : (
                    <div className="h-[250px] relative flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={90}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend 
                                    verticalAlign="bottom" 
                                    height={36} 
                                    iconType="circle"
                                    iconSize={10}
                                    formatter={(value) => <span className="text-xs font-semibold text-zinc-400">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        
                        {/* Center Total Count label */}
                        <div className="absolute flex flex-col items-center justify-center">
                            <span className="text-3xl font-extrabold text-white">{totalGamesCount}</span>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mt-1">Games</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Bar Chart: Playtime & Rating Overview */}
            <div className="bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-xs rounded-2xl p-6 flex flex-col justify-between transition-all hover:border-zinc-800">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-zinc-800/50 rounded-lg text-zinc-400">
                        <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Playtime Overview</h3>
                        <p className="text-xs text-zinc-400">Total gaming hours spent by status</p>
                    </div>
                </div>

                {!hasPlaytimeOrRating ? (
                    <div className="h-[250px] flex flex-col items-center justify-center text-zinc-500 gap-2">
                        <Clock className="w-10 h-10 opacity-30" />
                        <span className="text-sm">No playtime data recorded yet.</span>
                    </div>
                ) : (
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={barData}
                                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#52525b" 
                                    fontSize={11} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    dy={10}
                                />
                                <YAxis 
                                    stroke="#52525b" 
                                    fontSize={11} 
                                    tickLine={false} 
                                    axisLine={false}
                                    dx={-5}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                                <Bar 
                                    dataKey="Playtime" 
                                    name="Playtime" 
                                    radius={[6, 6, 0, 0]}
                                >
                                    {barData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} opacity={0.85} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    )
}
